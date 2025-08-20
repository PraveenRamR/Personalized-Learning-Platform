import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, ButtonGroup, Button, Spinner, ProgressBar } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { fetchAnalyticsDashboard } from '../../services/analyticsService';
import { useAnalytics } from '../../features/analytics/AnalyticsContext';

const AnalyticsDashboard: React.FC = () => {
  const [activePeriod, setActivePeriod] = useState<string>('week');
  // Track page view
  useAnalytics();

  // Fetch analytics data using React Query
  const analyticsQuery = useQuery({
    queryKey: ['analytics', activePeriod],
    queryFn: () => fetchAnalyticsDashboard(activePeriod),
    refetchOnWindowFocus: false,
  });

  const isLoading = analyticsQuery.isLoading;
  const error = analyticsQuery.error as string | null;
  const analyticsData = analyticsQuery.data;
  const fetchAnalyticsData = analyticsQuery.refetch;

  useEffect(() => {
    // No need to call fetchAnalyticsData directly; changing activePeriod triggers refetch
  }, [activePeriod]);

  const handlePeriodChange = (period: string) => {
    setActivePeriod(period);
  };

  const handleRetry = () => {
    analyticsQuery.refetch();
  };

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" />
        <span className="ms-2">Loading analytics data...</span>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Card className="text-center p-4">
          <Card.Body>
            <Card.Title className="text-danger">Error Loading Analytics</Card.Title>
            <Card.Text>{error}</Card.Text>
            <Button onClick={handleRetry}>Retry</Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (!analyticsData) {
    return null;
  }

  const { userActivity, contentEngagement, learningProgress } = analyticsData;

  // Calculate the maximum value for activity metrics to use in progress bars
  const maxActivityValue = Math.max(
    userActivity.logins,
    userActivity.contentViews,
    userActivity.searches
  );

  // Calculate total content items for percentages
  const totalContentItems =
    learningProgress.completedContents +
    learningProgress.inProgressContents +
    learningProgress.notStartedContents;

  // Calculate content type distribution percentages
  const totalContentTypeCount = contentEngagement.popularContentTypes.reduce(
    (sum: number, item: { count: number }) => sum + item.count, 0
  );

  return (
    <Container className="mt-4 mb-5">
      <Row className="mb-4">
        <Col>
          <h1>Analytics Dashboard</h1>
          <p className="text-muted">Insights into platform usage and learning progress</p>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          <ButtonGroup>
            <Button
              variant={activePeriod === 'day' ? 'primary' : 'outline-primary'}
              onClick={() => handlePeriodChange('day')}
            >
              Day
            </Button>
            <Button
              variant={activePeriod === 'week' ? 'primary' : 'outline-primary'}
              onClick={() => handlePeriodChange('week')}
            >
              Week
            </Button>
            <Button
              variant={activePeriod === 'month' ? 'primary' : 'outline-primary'}
              onClick={() => handlePeriodChange('month')}
            >
              Month
            </Button>
            <Button
              variant={activePeriod === 'year' ? 'primary' : 'outline-primary'}
              onClick={() => handlePeriodChange('year')}
            >
              Year
            </Button>
          </ButtonGroup>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Active Users</Card.Title>
              <h2>{userActivity.activeUsers}</h2>
              <Card.Text className="text-muted">
                {activePeriod === 'day'
                  ? 'Today'
                  : activePeriod === 'week'
                  ? 'This Week'
                  : activePeriod === 'month'
                  ? 'This Month'
                  : 'This Year'}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Content Views</Card.Title>
              <h2>{userActivity.contentViews}</h2>
              <Card.Text className="text-muted">Total views</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Avg. Completion Rate</Card.Title>
              <h2>{contentEngagement.averageCompletionRate.toFixed(1)}%</h2>
              <Card.Text className="text-muted">Across all content</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Avg. Progress</Card.Title>
              <h2>{learningProgress.averageProgress.toFixed(1)}%</h2>
              <Card.Text className="text-muted">Per user</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>User Activity</Card.Title>
              <div className="chart-container">
                <div>
                  <div className="mb-3">
                    <label>Logins ({userActivity.logins})</label>
                    <ProgressBar
                      now={(userActivity.logins / maxActivityValue) * 100}
                      variant="primary"
                      className="mb-2"
                    />
                  </div>
                  <div className="mb-3">
                    <label>Content Views ({userActivity.contentViews})</label>
                    <ProgressBar
                      now={(userActivity.contentViews / maxActivityValue) * 100}
                      variant="success"
                      className="mb-2"
                    />
                  </div>
                  <div className="mb-3">
                    <label>Searches ({userActivity.searches})</label>
                    <ProgressBar
                      now={(userActivity.searches / maxActivityValue) * 100}
                      variant="info"
                      className="mb-2"
                    />
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Content Type Distribution</Card.Title>
              <div className="chart-container">
                <div>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Content Type</th>
                        <th>Count</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contentEngagement.popularContentTypes.map((item: { type: string; count: number }) => (
                        <tr key={item.type}>
                          <td>{item.type}</td>
                          <td>{item.count}</td>
                          <td>
                            <ProgressBar
                              now={(item.count / totalContentTypeCount) * 100}
                              label={`${Math.round((item.count / totalContentTypeCount) * 100)}%`}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Body>
              <Card.Title>Learning Progress</Card.Title>
              <div className="chart-container">
                <div>
                  <div className="row mb-3">
                    <div className="col-4 text-center">
                      <div className="card">
                        <div className="card-body">
                          <h5>Completed</h5>
                          <h3>{learningProgress.completedContents}</h3>
                          <p>
                            {totalContentItems > 0
                              ? Math.round((learningProgress.completedContents / totalContentItems) * 100)
                              : 0}
                            %
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-4 text-center">
                      <div className="card">
                        <div className="card-body">
                          <h5>In Progress</h5>
                          <h3>{learningProgress.inProgressContents}</h3>
                          <p>
                            {totalContentItems > 0
                              ? Math.round((learningProgress.inProgressContents / totalContentItems) * 100)
                              : 0}
                            %
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-4 text-center">
                      <div className="card">
                        <div className="card-body">
                          <h5>Not Started</h5>
                          <h3>{learningProgress.notStartedContents}</h3>
                          <p>
                            {totalContentItems > 0
                              ? Math.round((learningProgress.notStartedContents / totalContentItems) * 100)
                              : 0}
                            %
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <ProgressBar>
                    <ProgressBar
                      variant="success"
                      now={totalContentItems > 0 ? (learningProgress.completedContents / totalContentItems) * 100 : 0}
                      key={1}
                    />
                    <ProgressBar
                      variant="warning"
                      now={totalContentItems > 0 ? (learningProgress.inProgressContents / totalContentItems) * 100 : 0}
                      key={2}
                    />
                    <ProgressBar
                      variant="danger"
                      now={totalContentItems > 0 ? (learningProgress.notStartedContents / totalContentItems) * 100 : 0}
                      key={3}
                    />
                  </ProgressBar>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Most Viewed Content */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Body>
              <Card.Title>Most Viewed Content</Card.Title>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contentEngagement.mostViewedContent.map(
                      (item: { id: string; title: string; contentType: string; viewCount: number }) => (
                        <tr key={item.id}>
                          <td>{item.title}</td>
                          <td>{item.contentType}</td>
                          <td>{item.viewCount}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AnalyticsDashboard;
