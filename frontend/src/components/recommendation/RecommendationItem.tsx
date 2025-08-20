import React, { useEffect, useRef } from 'react';
import { Card, Badge, Button, Col } from 'react-bootstrap';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createInteraction } from '../../services/contentService';
import { useAuth } from '../../features/auth/AuthContext';
import { useAnalytics } from '../../features/analytics/AnalyticsContext';

interface ContentItem {
  id?: number;
  content_item_id?: number;
  title: string;
  description: string;
  url: string;
  content_type?: string;
  tags: string[];
  created_at?: string;
  matching_interests?: string[];
  interest_match_score?: number;
  user_interaction?: 'viewed' | 'liked' | 'disliked';
}

interface RecommendationItemProps {
  item: ContentItem;
  setToastMessage: (message: string) => void;
  setShowToast: (show: boolean) => void;
  setToastVariant: (variant: string) => void;
}

function RecommendationItem({ item, setToastMessage, setShowToast, setToastVariant }: RecommendationItemProps) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { trackEvent } = useAnalytics();
  const cardRef = useRef<HTMLDivElement>(null);

  // Get matching interests for this item
  const matchingInterests = item.matching_interests || [];
  const tags = item.tags || []; // Handle items without tags array
  const matchingTags = tags.filter((tag: string) => matchingInterests.includes(tag));
  const otherTags = tags.filter((tag: string) => !matchingInterests.includes(tag));

  // Handler to add content to interests when tag is clicked
  const handleTagClick = async (tag: string) => {
    try {
      if (!token) throw new Error('Authentication required');
      await createInteraction(token, {
        content_item: item.id || item.content_item_id,
        action: 'add_interest',
        tag: tag
      });
      setToastMessage(`Added "${item.title}" to your interests via tag "${tag}".`);
      setToastVariant('success');
      setShowToast(true);
      window.location.reload(); // Automatically refresh the page
    } catch (error) {
      setToastMessage('Failed to add to interests.');
      setToastVariant('danger');
      setShowToast(true);
    }
  };

  const interactionMutation = useMutation({
    mutationFn: (data: { content_item: string; action: string; score: number }, context?: any) => {
      if (!token) throw new Error('Authentication required');
      
      // Standardize scores for each action type
      let score = data.score;
      if (data.action === 'liked') {
        score = 2; // Higher score for likes
  } else if (data.action === 'disliked') {
        score = -1; // Negative score for dismissals
      } else {
        score = 1; // Default score for views
      }
      
      console.log(`Creating ${data.action} interaction for content item ${data.content_item} with score ${score}`);
      
      return createInteraction(token, {
        ...data,
        score: score,
        context: {} // Add context field to fix database constraint error
      });
    },
    onMutate: (variables) => {
      // Return context data that will be passed to onSuccess
      const itemName = item.title || 'content';
      return { itemName };
    },
    onSuccess: (_data, variables, context: any) => {
      // Get the content item name from the context
      const itemName = context?.itemName || 'content';
      
      // Set toast message and color based on action
      if (variables.action === 'liked') {
        setToastMessage(`You have liked ${itemName}`);
        setToastVariant('success');
  } else if (variables.action === 'disliked') {
        setToastMessage(`You have disliked ${itemName}`);
        setToastVariant('danger');
        queryClient.invalidateQueries({ queryKey: ['recs'] });
      } else if (variables.action === 'viewed') {
        setToastMessage(`You have viewed ${itemName}`);
        setToastVariant('info');
      }
      
      setShowToast(true);
      console.log('Interaction successful:', variables);
    },
    onError: (error: any) => {
      console.error('Interaction error:', error);
      setToastMessage('An error occurred with your interaction.');
      setShowToast(true);
    }
  });

  return (
    <Col className="mb-4">
      <Card 
        ref={cardRef}
        className={matchingInterests.length > 0 ? "border-primary h-100" : item.user_interaction === 'liked' ? "border-success h-100" : item.user_interaction === 'viewed' ? "border-info h-100" : "h-100"}
        role="article"
        aria-labelledby={`content-title-${item.id || item.content_item_id}`}>
        {matchingInterests.length > 0 && (
          <Card.Header className="bg-primary bg-opacity-10 d-flex justify-content-between align-items-center">
            <span>Interest Match</span>
            <Badge bg="primary" pill>
              {Math.round((item.interest_match_score || 0) * 20)}%
            </Badge>
          </Card.Header>
        )}
        {!matchingInterests.length && item.user_interaction === 'liked' && (
          <Card.Header className="bg-success bg-opacity-10 d-flex justify-content-between align-items-center">
            <span>You Liked This</span>
            <Badge bg="success" pill>👍</Badge>
          </Card.Header>
        )}
        {!matchingInterests.length && item.user_interaction === 'viewed' && (
          <Card.Header className="bg-info bg-opacity-10 d-flex justify-content-between align-items-center">
            <span>Previously Viewed</span>
            <Badge bg="info" pill>👁️</Badge>
          </Card.Header>
        )}
        <Card.Body>
          <Card.Title id={`content-title-${item.id || item.content_item_id}`}>{item.title}</Card.Title>
          <Card.Text className="mb-2">
            {item.description}
            {item.content_type && (
              <span className="d-block mt-1">
                <small className="text-muted">Type: {item.content_type}</small>
              </span>
            )}
          </Card.Text>
          
          {matchingTags.length > 0 && (
            <div className="mb-2">
              <small className="text-muted d-block mb-1">Matching your interests:</small>
              {matchingTags.map((tag: string) => (
                <Badge
                  key={tag}
                  bg="primary"
                  className="me-1 mb-1 tag-clickable"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleTagClick(tag)}
                  title="Add to interests"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {otherTags.length > 0 && (
            <div className="mt-1">
              <small className="text-muted d-block mb-1">Other tags:</small>
              {otherTags.map((tag: string) => (
                <Badge
                  key={tag}
                  bg="secondary"
                  className="me-1 mb-1 tag-clickable"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleTagClick(tag)}
                  title="Add to interests"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </Card.Body>
        
        <Card.Footer className="d-flex justify-content-between align-items-center bg-white">
          <Button 
            size="sm" 
            variant="outline-primary"
            onClick={() => {
              const itemId = item.content_item_id || item.id;
              if (!itemId) {
                setToastMessage('Error: Could not find content ID');
                setToastVariant('danger');
                setShowToast(true);
                return;
              }
              // Prevent duplicate 'viewed' interactions per session
              const viewedKey = `viewed_${itemId}`;
              if (!sessionStorage.getItem(viewedKey)) {
                trackEvent('view', {
                  content_id: String(itemId),
                  title: item.title,
                  content_type: item.content_type,
                  tag: item.tags
                });
                interactionMutation.mutate(
                  { content_item: String(itemId), action: 'viewed', score: 1 }
                );
                sessionStorage.setItem(viewedKey, 'true');
              }
              window.location.href = `/content/${itemId}`;
            }}
            aria-label={`View ${item.title}`}
          >
            View
          </Button>
          <div>
            <Button 
              size="sm" 
              variant="outline-success" 
              className="me-1"
              onClick={() => {
                console.log('Content item data:', item);
                const itemId = item.content_item_id || item.id;
                if (!itemId) {
                  console.error('No valid content item ID found!', item);
                  setToastMessage('Error: Could not find content ID');
                  setToastVariant('danger');
                  setShowToast(true);
                  return;
                }
                interactionMutation.mutate(
                  { content_item: String(itemId), action: 'liked', score: 2 }
                );
              }}
              aria-label={`Like ${item.title}`}
            >
              <span aria-hidden="true">👍</span> Like
            </Button>
            <Button 
              size="sm" 
              variant="outline-danger"
              onClick={() => {
                console.log('Content item data:', item);
                const itemId = item.content_item_id || item.id;
                if (!itemId) {
                  console.error('No valid content item ID found!', item);
                  setToastMessage('Error: Could not find content ID');
                  setToastVariant('danger');
                  setShowToast(true);
                  return;
                }
                interactionMutation.mutate(
                  { 
                    content_item: String(itemId), 
                    action: 'disliked',
                    score: -1 
                  }
                );
              }}
              aria-label={`Dislike ${item.title}`}
            >
              <span aria-hidden="true">👎</span> Dislike
            </Button>
          </div>
        </Card.Footer>
      </Card>
    </Col>
  );
}

export default RecommendationItem;
