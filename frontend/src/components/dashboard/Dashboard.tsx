import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Card, ButtonGroup, Button, Spinner, Nav } from 'react-bootstrap';
import { useDashboard } from '../../features/dashboard/DashboardContext';

// Import placeholder components since we'll implement them later
const LearningProgress = () => <div>Learning Progress Component</div>;
const TopicDistribution = () => <div>Topic Distribution Component</div>;
const LearningActivity = () => <div>Learning Activity Component</div>;
const RecommendationsPanel = () => <div>Recommendations Panel Component</div>;
const LearningProgressChart = ({ learningData }: any) => <div>Learning Progress Chart with data</div>;
const RecentActivityList = ({ activities }: any) => <div>Recent Activity List with activities</div>;
const GoalsTracker = ({ goals }: any) => <div>Goals Tracker with goals</div>;
const RecommendationStats = ({ stats }: any) => <div>Recommendation Stats with stats</div>;

// Import our Analytics Dashboard
import AnalyticsDashboard from '../../pages/analytics/AnalyticsDashboard';

const Dashboard: React.FC = () => {
  // State for managing tab selection
  const [activeTab, useState] = React.useState('dashboard');
  
  // Try to use the dashboard context if it's available
  // Otherwise fall back to the simpler version
  const dashboardContext = useMemo(() => {
    try {
      return useDashboard();
    } catch (error) {
      return null;
    }
  }, []);

  // Render analytics dashboard if that tab is selected
  if (activeTab === 'analytics') {
    return (
      <>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link 
              onClick={() => useState('dashboard')}
            >
              Learning Dashboard
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              onClick={() => useState('analytics')}
            >
              Analytics Dashboard
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <AnalyticsDashboard />
      </>
    );
  }

  // Render enhanced dashboard if context is available
  if (dashboardContext && dashboardContext.dashboardData) {
    const dashboardData = dashboardContext.dashboardData;
    const isLoading = dashboardContext.isLoading;
    const refreshDashboard = dashboardContext.refreshDashboard;
    const setActivePeriod = dashboardContext.setActivePeriod;
    const activePeriod = dashboardContext.activePeriod;

    if (isLoading) {
      return (
        <Container className="py-5 text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Container>
      );
    }

    return (
      <>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link 
              onClick={() => useState('dashboard')}
            >
              Learning Dashboard
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              onClick={() => useState('analytics')}
            >
              Analytics Dashboard
            </Nav.Link>
          </Nav.Item>
        </Nav>
        
        <Container fluid="lg" className="my-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Your Learning Dashboard</h1>
            <div>
              <ButtonGroup className="me-2">
                <Button 
                  variant={activePeriod === 'day' ? 'primary' : 'outline-primary'} 
                  onClick={() => setActivePeriod('day')}
                >
                  Today
                </Button>
                <Button 
                  variant={activePeriod === 'week' ? 'primary' : 'outline-primary'} 
                  onClick={() => setActivePeriod('week')}
                >
                  This Week
                </Button>
                <Button 
                  variant={activePeriod === 'month' ? 'primary' : 'outline-primary'} 
                  onClick={() => setActivePeriod('month')}
                >
                  This Month
                </Button>
                <Button 
                  variant={activePeriod === 'year' ? 'primary' : 'outline-primary'} 
                  onClick={() => setActivePeriod('year')}
                >
                  This Year
                </Button>
              </ButtonGroup>
              <Button variant="secondary" onClick={refreshDashboard}>
                <span className="me-1">↻</span> Refresh
              </Button>
            </div>
          </div>
          
          <Row className="g-4 mb-4">
            <Col lg={8}>
              <Card className="h-100">
                <Card.Header as="h5">Learning Progress</Card.Header>
                <Card.Body>
                  <LearningProgressChart learningData={dashboardData.learningProgress} />
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card className="h-100">
                <Card.Header as="h5">Recommendation Stats</Card.Header>
                <Card.Body>
                  <RecommendationStats stats={dashboardData.recommendationStats} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row className="g-4">
            <Col lg={4}>
              <Card className="h-100">
                <Card.Header as="h5">Goals</Card.Header>
                <Card.Body>
                  <GoalsTracker goals={dashboardData.goals || dashboardData.goalProgress} />
                </Card.Body>
              </Card>
            </Col>
            <Col lg={8}>
              <Card className="h-100">
                <Card.Header as="h5">Recent Activity</Card.Header>
                <Card.Body>
                  <RecentActivityList activities={dashboardData.recentActivity} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </>
    );
  }

  // If the enhanced dashboard isn't available, show the basic dashboard with tabs
  return (
    <>
      <Nav variant="tabs" className="mb-4">
        <Nav.Item>
          <Nav.Link 
            onClick={() => useState('dashboard')}
          >
            Learning Dashboard
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            onClick={() => useState('analytics')}
          >
            Analytics Dashboard
          </Nav.Link>
        </Nav.Item>
      </Nav>
      
      <Container>
        <Row>
          <Col md={4}>
            <Card className="mb-4">
              <Card.Body>
                <LearningProgress />
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-4">
              <Card.Body>
                <TopicDistribution />
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-4">
              <Card.Body>
                <LearningActivity />
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <RecommendationsPanel />
      </Container>
    </>
  );
};

export default Dashboard;
