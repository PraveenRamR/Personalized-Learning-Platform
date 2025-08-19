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

  const recsQuery = useQuery({
    queryKey: ['recs'],
    queryFn: () => fetchRecommendations(token as string),
    enabled: !!token,
    refetchInterval: 30000 // Poll every 30 seconds
  });

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
        ) : recsQuery.data?.results?.length === 0 ? (
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
              {/* Sort recommendations by priority: Interests (matching_interests), then Likes, then Views */}
              {recsQuery.data?.results
                .filter((item: any) => {
                  // Remove disliked items completely
                  return item.user_interaction !== 'disliked';
                })
                .sort((a: any, b: any) => {
                  // Priority 1: Interest matches (highest first)
                  const aHasInterests = a.matching_interests?.length > 0;
                  const bHasInterests = b.matching_interests?.length > 0;
                  
                  if (aHasInterests !== bHasInterests) {
                    return aHasInterests ? -1 : 1; // Items with matching interests come first
                  }
                  
                  // If both have interests, compare by interest match score
                  if (aHasInterests && bHasInterests) {
                    if ((a.interest_match_score || 0) !== (b.interest_match_score || 0)) {
                      return (b.interest_match_score || 0) - (a.interest_match_score || 0);
                    }
                  }
                  
                  // Priority 2: Interaction type (likes > views)
                  const aLiked = a.user_interaction === 'liked';
                  const bLiked = b.user_interaction === 'liked';
                  
                  if (aLiked !== bLiked) {
                    return aLiked ? -1 : 1; // Liked items come before non-liked items
                  }
                  
                  const aViewed = a.user_interaction === 'viewed';
                  const bViewed = b.user_interaction === 'viewed';
                  
                  if (aViewed !== bViewed) {
                    return aViewed ? -1 : 1; // Viewed items come before non-viewed items
                  }
                  
                  // Priority 3: Predicted rating (highest first)
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
