import React from 'react';

// You can replace this with an actual image import if you have a logo file
// import logoImg from '../assets/logo.png';

const Logo: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
    {/* Replace below with <img src={logoImg} alt="Logo" style={{ height: size }} /> if you have a logo file */}
    <span style={{
      display: 'inline-block',
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #007bff 60%, #00c6ff 100%)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      textAlign: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: size * 0.5,
      lineHeight: `${size}px`,
      userSelect: 'none',
    }}>
      PLP
    </span>
    <span style={{ fontSize: size * 0.45, fontWeight: 700, color: '#222' }}>
      Personalized Learning Platform
    </span>
  </div>
);

export default Logo;
