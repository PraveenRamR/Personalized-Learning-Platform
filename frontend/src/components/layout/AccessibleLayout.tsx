import React, { useRef } from 'react';
import { Container, Row, Col, Navbar, Nav } from 'react-bootstrap';
import { SkipToContent, useFocusTrap } from '../../utils/accessibility/a11yUtils';

interface AccessibleLayoutProps {
  children: React.ReactNode;
  title?: string;
  showSidebar?: boolean;
  sidebarContent?: React.ReactNode;
}

const AccessibleLayout: React.FC<AccessibleLayoutProps> = ({ 
  children, 
  title = 'Personalized Learning Platform',
  showSidebar = false,
  sidebarContent
}) => {
  const mainContentRef = useRef<HTMLDivElement>(null);
  
  // Set page title for screen readers
  React.useEffect(() => {
    document.title = title;
  }, [title]);
  
  return (
    <>
      <SkipToContent />
      
      <Navbar 
        bg="light" 
        expand="lg" 
        className="mb-4 shadow-sm"
        aria-label="Main navigation"
      >
        <Container>
          <Navbar.Brand href="/">Personalized Learning</Navbar.Brand>
          <Navbar.Toggle 
            aria-controls="main-navbar-nav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          />
          <Navbar.Collapse id="main-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="/dashboard" aria-current="page">Dashboard</Nav.Link>
              <Nav.Link href="/">Content</Nav.Link>
              <Nav.Link href="/profile">Profile</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid as="main" id="main-content" ref={mainContentRef} tabIndex={-1}>
        <Row>
          {showSidebar && (
            <Col lg={3} md={4} sm={12} 
              as="aside"
              className="sidebar mb-4 mb-md-0" 
              aria-label="Sidebar navigation"
            >
              <div className="position-sticky top-4">
                {sidebarContent}
              </div>
            </Col>
          )}
          
          <Col lg={showSidebar ? 9 : 12} md={showSidebar ? 8 : 12} sm={12}>
            {children}
          </Col>
        </Row>
      </Container>
      
      <footer className="bg-light py-4 mt-5">
        <Container>
          <Row>
            <Col>
              <p className="text-center mb-0">&copy; {new Date().getFullYear()} Personalized Learning Platform</p>
            </Col>
          </Row>
        </Container>
      </footer>
    </>
  );
};

export default AccessibleLayout;
