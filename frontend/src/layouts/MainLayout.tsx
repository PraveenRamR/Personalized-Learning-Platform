import React from 'react';
import { Container, Navbar, Nav, Button, Toast, ToastContainer } from 'react-bootstrap';
import { useAuth } from '../features/auth/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
  showToast: boolean;
  toastMessage: string;
  toastVariant: string;
  setShowToast: (show: boolean) => void;
}

function MainLayout({ children, showToast, toastMessage, toastVariant, setShowToast }: MainLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand>Personalized Learning Platform</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#recommendations">Recommendations</Nav.Link>
              <Nav.Link href="#profile">Profile</Nav.Link>
            </Nav>
            {user && (
              <Nav>
                <Navbar.Text className="me-3">
                  Signed in as: {user.username}
                </Navbar.Text>
                <Button variant="outline-light" onClick={logout}>Logout</Button>
              </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        {children}
      </Container>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={3000} 
          autohide
          bg={toastVariant}
          className={toastVariant === 'danger' || toastVariant === 'dark' ? 'text-white' : ''}
        >
          <Toast.Header>
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

export default MainLayout;
