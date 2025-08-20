import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Badge, Container, Row, Col, Spinner, Button } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/apiClient';
import '../styles.css';

interface ContentItem {
  id?: number;
  title: string;
  description: string;
  content_type?: string;
  tags?: string[];
}

function ContentDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isLoading, error } = useQuery<ContentItem>({
    queryKey: ['content', id],
    queryFn: async () => {
      const res = await api.get(`/content-items/${id}/`);
      return res.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <Card className="shadow-lg rounded-4 p-4" style={{ minWidth: 350, maxWidth: 500 }}>
          <Card.Body>
            <Card.Title className="fw-bold text-danger">Error</Card.Title>
            <Card.Text className="text-muted">Could not load content details.</Card.Text>
            <Button variant="outline-primary" onClick={() => navigate('/')}>Go Back to Home</Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <Card className="shadow-lg rounded-4 p-4 w-100" style={{ maxWidth: 600 }}>
        <Card.Body>
          <div className="d-flex flex-column gap-2">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <Card.Title className="fw-bold fs-3 mb-0 text-primary">{data.title}</Card.Title>
              <span className="badge bg-info text-dark px-3 py-2 fs-6">{data.content_type}</span>
            </div>
            <Card.Text className="fs-5 text-secondary mb-3" style={{ minHeight: 60 }}>{data.description}</Card.Text>
            <div className="mb-3">
              <span className="fw-semibold text-muted me-2">Tags:</span>
              {data.tags && data.tags.length > 0 ? (
                data.tags.map((tag: string) => (
                  <Badge key={tag} bg="dark" className="me-2 mb-1 px-3 py-2" style={{ fontSize: '1rem', letterSpacing: '0.5px' }}>{tag}</Badge>
                ))
              ) : (
                <span className="text-muted">No tags</span>
              )}
            </div>
            <div className="d-flex justify-content-end">
              <Button variant="primary" size="lg" className="px-4 rounded-pill" onClick={() => navigate('/')}>Go Back to Home</Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ContentDetailPage;
