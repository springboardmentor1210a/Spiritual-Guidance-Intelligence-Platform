import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('access_token', token);
      navigate('/dashboard', { replace: true });
    } else if (error) {
      navigate(`/?error=${encodeURIComponent(error)}`, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, #030712 100%)',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '1.5rem',
        fontWeight: '700',
        marginBottom: '1rem'
      }}>
        <Sparkles size={28} style={{ color: '#fbbf24' }} />
        <span>Aligning Cosmic Session...</span>
      </div>
      <Loader2 style={{
        width: '32px',
        height: '32px',
        color: '#a855f7',
        animation: 'spin 1s linear infinite'
      }} />
    </div>
  );
};

export default OAuthCallback;
