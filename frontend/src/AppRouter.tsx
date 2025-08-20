import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Container, Spinner } from 'react-bootstrap';

// Import context providers
import { AuthProvider } from './features/auth/AuthContext';
import { AnalyticsProvider } from './features/analytics/AnalyticsContext';

// Import CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import './utils/accessibility/accessibility.css';

// Import main components
import AccessibleLayout from './components/layout/AccessibleLayout';

// Lazy-load page components
const MainApp = lazy(() => import('./App'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

// Create a new query client
const queryClient = new QueryClient();

const AppRouter: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AnalyticsProvider>
          <Router>
            <AccessibleLayout>
              <Suspense
                fallback={
                  <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </Container>
                }
              >
                <Routes>
                  <Route path="/" element={<MainApp />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </AccessibleLayout>
          </Router>
        </AnalyticsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default AppRouter;
