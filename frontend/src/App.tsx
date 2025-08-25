import React, { useState } from 'react';
import { Card, Button, Container, Row, Col, Spinner } from 'react-bootstrap';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from './features/auth/AuthContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import ContentDetailPage from './pages/ContentDetailPage';
import MainLayout from './layouts/MainLayout';
import LoginForm from './components/auth/LoginForm';
import RecommendationsList from './components/recommendation/RecommendationsList';
import InterestForm from './components/profile/InterestForm';
import AddContentModal from './components/content/AddContentModal';
import AnalyticsInsights from './components/analytics/AnalyticsInsights';
import ActivityTracker from './components/analytics/ActivityTracker';
import { createContentItem } from './services/contentService';
import { api } from './services/apiClient';

function App() {
  const { token, user, isLoading } = useAuth();
  const queryClient = useQueryClient();
  
  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('primary');
  
  // Modal state
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  
  // Mutations
  const createContentMutation = useMutation({
    mutationFn: (data: any) => createContentItem(token as string, data),
    onSuccess: () => {
      setShowAddContentModal(false);
      setToastMessage('Content item created successfully!');
      setToastVariant('success');
      setShowToast(true);
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
    onError: () => {
      setToastMessage('Failed to create content item');
      setToastVariant('danger');
      setShowToast(true);
    }
  });

  // Removed refreshRecommendationsMutation for demonstration

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!token || !user) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <LoginForm />
          </Col>
        </Row>
      </Container>
    );
  }

  // Safely check is_staff for both flat and nested user objects
  const isStaff = (user && (user as any).is_staff) || (user && (user as any).user && (user as any).user.is_staff);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout
            showToast={showToast}
            toastMessage={toastMessage}
            toastVariant={toastVariant}
            setShowToast={setShowToast}
          >
            {/* Track user activity on the home page */}
            <ActivityTracker pageId="home" title="Home Page" />
            <Row>
              <Col md={4}>
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">Your Profile</h5>
                  </Card.Header>
                  <Card.Body>
                    <InterestForm />
                  </Card.Body>
                </Card>
                {/* Analytics Insights */}
                <AnalyticsInsights />

                {isStaff && (
                  <Card className="mb-4">
                    <Card.Header>
                      <h5 className="mb-0">Actions</h5>
                    </Card.Header>
                    <Card.Body>
                      <p>Manage content and recommendations</p>
                      <div className="d-grid gap-2">
                        <Button 
                          variant="primary" 
                          onClick={() => setShowAddContentModal(true)}
                        >
                          Add Content Item
                        </Button>
                        {/* Removed Refresh Recommendations button for demonstration */}
                      </div>
                    </Card.Body>
                  </Card>
                )}
              </Col>
              <Col md={8}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0">Personalized Recommendations</h4>
                  <Button
                    variant="outline-primary"
                    onClick={async () => {
                      try {
                        // First, trigger backend to update recommendations
                        await api.post('recommendations/refresh/');
                        // Then, fetch the updated recommendations asynchronously
                        await api.get('recommendations/personalized/');
                        setToastMessage('Recommendations refreshed!');
                        setToastVariant('success');
                        setShowToast(true);
                        // Optionally, trigger a refetch in RecommendationsList via context or props
                      } catch {
                        setToastMessage('Failed to refresh recommendations.');
                        setToastVariant('danger');
                        setShowToast(true);
                      }
                    }}
                  >
                    ↻ Refresh
                  </Button>
                </div>
                <RecommendationsList 
                  setToastMessage={setToastMessage} 
                  setShowToast={setShowToast}
                  setToastVariant={setToastVariant}
                />
              </Col>
            </Row>

            {isStaff && (
              <AddContentModal
                show={showAddContentModal}
                onHide={() => setShowAddContentModal(false)}
                onSubmit={createContentMutation.mutate}
                isLoading={createContentMutation.isPending}
              />
            )}
          </MainLayout>
        }
      />
      <Route path="/content/:id" element={<ContentDetailPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
