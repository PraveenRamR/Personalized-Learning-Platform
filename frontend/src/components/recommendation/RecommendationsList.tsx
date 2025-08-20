import React from 'react';
import { Card, Row, Spinner, Alert, Badge } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { fetchRecommendations } from '../../services/recommendationService';
import { useAuth } from '../../features/auth/AuthContext';
import InterestForm from '../profile/InterestForm';
import RecommendationItem from './RecommendationItem';

interface RecommendationsListProps {
  setToastMessage: (message: string) => void;
  setShowToast: (show: boolean) => void;
  setToastVariant: (variant: string) => void;
}

function RecommendationsList({ setToastMessage, setShowToast, setToastVariant }: RecommendationsListProps) {
  const { token } = useAuth();
  // Removed showLiked state and logic
  const recsQuery = useQuery({
    queryKey: ['recs'],
    queryFn: () => fetchRecommendations(token as string),
    enabled: !!token,
    refetchInterval: 30000 // Poll every 30 seconds
  });

  const allItems = recsQuery.data?.results?.filter((item: any) => item.user_interaction !== 'disliked') || [];

  // Get tags from all liked items (persist in sessionStorage, user-specific)
  let likedTags: string[] = [];
  const likedItems = allItems.filter((item: any) => item.user_interaction === 'liked');
  const auth = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = auth?.id ? String(auth.id) : 'guest';
  const key = `recentLikedTags_${userId}`;
  if (likedItems.length > 0) {
    // Union of all liked tags
    likedTags = Array.from(new Set(likedItems.flatMap((item: any) => item.tags || [])));
    sessionStorage.setItem(key, JSON.stringify(likedTags));
  } else {
    // If no liked item in current data, check sessionStorage
    const stored = sessionStorage.getItem(key);
    if (stored) {
      likedTags = JSON.parse(stored);
    }
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Personalized Recommendations</h5>
      </Card.Header>
      <Card.Body>
        {recsQuery.isLoading ? (
          <div className="text-center p-4">
            <Spinner animation="border" />
            <p className="mt-2">Loading recommendations...</p>
          </div>
        ) : recsQuery.isError ? (
          <Alert variant="danger">
            Error loading recommendations
          </Alert>
        ) : allItems.length === 0 ? (
          <div className="text-center p-4">
            <p>No recommendations yet. Update your profile interests or interact with some content!</p>
            <InterestForm />
          </div>
        ) : (
          <>
            {/* Recommendation priority display */}
            <div className="mb-4">
              <div className="d-flex align-items-center">
                <h6 className="mb-0 me-2">Showing recommendations by priority:</h6>
                <Badge key="interest-priority" bg="primary" className="me-1">Interests</Badge>
                <Badge key="likes-priority" bg="success" className="me-1">Likes</Badge>
                <Badge key="views-priority" bg="info">Views</Badge>
              </div>
              <small className="text-muted">disliked content is excluded from recommendations</small>
            </div>

            <Row xs={1} md={2} className="g-4">
              {allItems
                .sort((a: any, b: any) => {
                  // Priority 0: Items with tags matching any likedTags
                  const aRelated = a.tags?.some((tag: string) => likedTags.includes(tag));
                  const bRelated = b.tags?.some((tag: string) => likedTags.includes(tag));
                  if (aRelated !== bRelated) {
                    return aRelated ? -1 : 1;
                  }
                  // Priority 1: Interest matches (highest first)
                  const aHasInterests = a.matching_interests?.length > 0;
                  const bHasInterests = b.matching_interests?.length > 0;
                  if (aHasInterests !== bHasInterests) {
                    return aHasInterests ? -1 : 1;
                  }
                  if (aHasInterests && bHasInterests) {
                    if ((a.interest_match_score || 0) !== (b.interest_match_score || 0)) {
                      return (b.interest_match_score || 0) - (a.interest_match_score || 0);
                    }
                  }
                  const aLiked = a.user_interaction === 'liked';
                  const bLiked = b.user_interaction === 'liked';
                  if (aLiked !== bLiked) {
                    return aLiked ? -1 : 1;
                  }
                  const aViewed = a.user_interaction === 'viewed';
                  const bViewed = b.user_interaction === 'viewed';
                  if (aViewed !== bViewed) {
                    return aViewed ? -1 : 1;
                  }
                  return (b.predicted_rating || 0) - (a.predicted_rating || 0);
                })
                .map((item: any) => (
                  <RecommendationItem 
                    key={item.content_item_id || item.id}
                    item={item}
                    setToastMessage={setToastMessage}
                    setShowToast={setShowToast}
                    setToastVariant={setToastVariant}
                  />
                ))}
            </Row>
          </>
        )}
      </Card.Body>
    </Card>
  );
}

export default RecommendationsList;
