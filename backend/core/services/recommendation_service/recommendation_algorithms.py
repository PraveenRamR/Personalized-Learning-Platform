
"""
AI Recommendation System using Surprise SVD
"""
import pandas as pd
from surprise import SVD, Dataset, Reader
from django.db import connection
from ...modules.content.models import ContentItem
from ...modules.interactions.models import Interaction

class SVDRecommender:
    def __init__(self):
        self.model = None
        self.trained = False

    def fetch_interaction_data(self):
        """
        Fetch user-content interaction data using Django ORM and convert to DataFrame.
        Returns a pandas DataFrame with columns: user_id, content_item_id, score
        """
        qs = Interaction.objects.filter(score__isnull=False).values('user_id', 'content_item_id', 'score')
        df = pd.DataFrame(list(qs))
        print(df.head())
        return df

    def train(self):
        """
        Train the SVD model using user-content interaction data.
        """
        df = self.fetch_interaction_data()
        if df.empty:
            self.trained = False
            return
        reader = Reader(rating_scale=(df['score'].min(), df['score'].max()))
        data = Dataset.load_from_df(df[['user_id', 'content_item_id', 'score']], reader)
        trainset = data.build_full_trainset()
        self.model = SVD()
        self.model.fit(trainset)
        self.trained = True

    def recommend(self, user_id, top_n=5):
        """
        Recommend top-N content items for a given user, excluding disliked content and boosting by interests.
        Returns a list of ContentItem objects.
        """
        import logging
        logger = logging.getLogger(__name__)
        if not self.trained:
            self.train()
        # Get all content IDs
        all_content = ContentItem.objects.values_list('id', flat=True)
        # Get items already interacted with
        interacted_ids = set(Interaction.objects.filter(user_id=user_id).values_list('content_item_id', flat=True))
        # Get disliked content IDs
        disliked_ids = set(Interaction.objects.filter(user_id=user_id, action='disliked').values_list('content_item_id', flat=True))
        # Get user interests
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            user_obj = User.objects.get(id=user_id)
            interests = getattr(user_obj.profile, 'interests', [])
        except Exception as e:
            logger.warning(f"Could not fetch interests for user {user_id}: {e}")
            interests = []
        logger.debug(f"User {user_id} interacted_ids: {interacted_ids}")
        logger.debug(f"User {user_id} disliked_ids: {disliked_ids}")
        logger.debug(f"User {user_id} interests: {interests}")
        # Predict scores for unseen and not-disliked items, boost by interests
        predictions = []
        for cid in all_content:
            if cid not in interacted_ids and cid not in disliked_ids:
                pred = self.model.predict(user_id, cid)
                score = pred.est
                # Boost score if content matches interests
                try:
                    content = ContentItem.objects.get(id=cid)
                    if interests and hasattr(content, 'tags') and content.tags:
                        if any(tag in interests for tag in content.tags):
                            score += 1.0  # Boost by 1.0 if tag matches interest
                except Exception as e:
                    logger.warning(f"Could not fetch tags for content {cid}: {e}")
                predictions.append((cid, score))
        predictions.sort(key=lambda x: x[1], reverse=True)
        recommended_ids = [cid for cid, _ in predictions[:top_n]]
        logger.debug(f"User {user_id} recommended_ids before filter: {recommended_ids}")
        # Remove any disliked items from the final recommendations (extra safety)
        filtered_ids = [cid for cid in recommended_ids if cid not in disliked_ids]
        logger.debug(f"User {user_id} recommended_ids after filter: {filtered_ids}")
        return ContentItem.objects.filter(id__in=filtered_ids)

# Singleton recommender instance
svd_recommender = SVDRecommender()

def generate_recommendations(user):
    """
    Get top-N personalized content recommendations for a user using SVD.
    Returns a QuerySet of ContentItem objects.
    """
    return svd_recommender.recommend(user.id, top_n=10)
