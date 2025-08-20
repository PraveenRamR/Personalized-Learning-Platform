import React, { useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Dashboard from '../components/dashboard/Dashboard';
import { useAnalytics } from '../features/analytics/AnalyticsContext';
import { DashboardProvider } from '../features/dashboard/DashboardContext';

const DashboardPage: React.FC = () => {
  const { trackPageView } = useAnalytics();
  
  useEffect(() => {
    // Track page view without disrupting normal app behavior
    trackPageView('dashboard');
  }, [trackPageView]);
  
  return (
    <DashboardProvider>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Your Learning Dashboard</h1>
          <Link to="/">
            <Button variant="outline-primary">Back to Content</Button>
          </Link>
        </div>
        
        <Dashboard />
        
        {/* Additional info section */}
      <Row className="mt-5">
        <Col md={12}>
          <div className="alert alert-info">
            <h5>Welcome to your personalized learning dashboard!</h5>
            <p>
              Track your progress, see your learning activity, and discover trending content all in one place.
              This dashboard updates automatically as you interact with learning materials.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
    </DashboardProvider>
  );
};

export default DashboardPage;
