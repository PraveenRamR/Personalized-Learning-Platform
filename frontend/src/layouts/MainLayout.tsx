import React from 'react';
import { Container, Toast, ToastContainer } from 'react-bootstrap';
import { useAuth } from '../features/auth/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
  showToast: boolean;
  toastMessage: string;
  toastVariant: string;
  setShowToast: (show: boolean) => void;
}

interface ProfileDropdownProps {
  user: any;
  logout: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, logout }) => {
  const [open, setOpen] = React.useState(false);
  const username = user?.username || (user?.user?.username ?? 'User');
  const isStaff = Boolean(user?.is_staff ?? user?.user?.is_staff);
  const role = isStaff ? 'superuser' : 'user';
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <div
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
        onClick={() => setOpen((o) => !o)}
      >
        <div style={{
          width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a78bfa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 22
        }}>{username[0]?.toUpperCase() || 'U'}</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ fontSize: 12, color: '#a3a3a3', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 2 }}>{role.toUpperCase()}</span>
          <span style={{ fontSize: 16, color: '#fff', fontWeight: 600 }}>{username}</span>
        </div>
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: 50, right: 0, minWidth: 220, background: '#23232b', borderRadius: '1.25rem',
          boxShadow: '0 8px 32px 0 rgba(144, 144, 144, 0.18)', padding: '1.5rem 1.25rem 1rem 1.25rem', zIndex: 100,
          display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeIn 0.2s'
        }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 32, marginBottom: 10 }}>
            {username[0]?.toUpperCase() || 'U'}
          </div>
          <span style={{ fontSize: 13, color: '#a3a3a3', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 2 }}>{role.toUpperCase()}</span>
          <span style={{ fontSize: 18, color: '#fff', fontWeight: 700, marginBottom: 10 }}>{username}</span>
          <div style={{ width: '100%', borderTop: '1px solid #373737', margin: '10px 0' }} />
          <button style={{ width: '100%', background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, fontSize: 16, padding: '0.5rem 0', cursor: 'pointer', borderRadius: '0.75rem', transition: 'background 0.2s' }} onClick={logout}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

function MainLayout({ children, showToast, toastMessage, toastVariant, setShowToast }: MainLayoutProps) {
  const { user, logout } = useAuth(); 

  return (
    <div className="bg-light min-vh-100">
      <nav className="navbar glass-card mb-4 px-4 py-3 shadow-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', background: '#18181b', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontWeight: 700, fontSize: '2rem', color: '#fff', letterSpacing: '0.5px', marginRight: '1rem' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8, verticalAlign: 'middle' }}>
              <circle cx="16" cy="16" r="16" fill="#4f8cff" />
              <text x="16" y="21" textAnchor="middle" fontSize="16" fill="#fff" fontWeight="bold">PLP</text>
            </svg>
            Personalized Learning Platform
          </span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {user && <ProfileDropdown user={user} logout={logout} />}
        </div>
      </nav>
      <div className="container pb-5">
        {children}
      </div>
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={4000} 
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
    </div>
  );
}

export default MainLayout;