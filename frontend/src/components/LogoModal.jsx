import React, { useEffect } from 'react';
import { X, Sparkles, Download } from 'lucide-react';
import defaultLogo from '../assets/app-logo.png';

const LogoModal = ({ isOpen, onClose, logoSrc = defaultLogo }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 8, 20, 0.85)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '440px',
          width: '100%',
          background: 'linear-gradient(145deg, rgba(22, 18, 54, 0.95), rgba(10, 14, 30, 0.98))',
          border: '1px solid rgba(251, 191, 36, 0.4)',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 50px rgba(251, 191, 36, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#cbd5e1',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
            e.currentTarget.style.color = '#f87171';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = '#cbd5e1';
          }}
          title="Close (Esc)"
        >
          <X size={20} />
        </button>

        {/* Large Logo Image */}
        <div
          style={{
            position: 'relative',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            padding: '8px',
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, rgba(168, 85, 247, 0.2) 60%, transparent 80%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src={logoSrc}
            alt="Mystic Insights Official App Logo"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
              boxShadow: '0 0 40px rgba(251, 191, 36, 0.45), 0 0 80px rgba(56, 189, 248, 0.25)',
              border: '2px solid rgba(251, 191, 36, 0.6)'
            }}
          />
        </div>

        {/* Branding Info */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
            <Sparkles size={16} />
            <span>Official Platform Emblem</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 6px 0', letterSpacing: '0.5px' }}>
            Mystic Insights
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
            Biometric AI Palmistry • Interactive Tarot • Vedic Astrology
          </p>
        </div>

        {/* Action Button: Download Logo */}
        <a
          href={logoSrc}
          download="mystic-insights-logo.png"
          style={{
            marginTop: '0.5rem',
            padding: '8px 18px',
            borderRadius: '10px',
            background: 'rgba(251, 191, 36, 0.15)',
            border: '1px solid rgba(251, 191, 36, 0.4)',
            color: '#fbbf24',
            fontSize: '0.85rem',
            fontWeight: '600',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(251, 191, 36, 0.28)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(251, 191, 36, 0.15)';
          }}
        >
          <Download size={16} />
          <span>Download Logo Asset</span>
        </a>
      </div>
    </div>
  );
};

export default LogoModal;
