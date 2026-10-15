import React, { useState } from 'react';
import { 
  Sparkles, 
  Feather, 
  ShieldCheck, 
  Lock, 
  Key, 
  CheckCircle2, 
  X, 
  ArrowRight,
  Compass,
  Layers,
  Eye,
  AlertCircle,
  Loader2
} from 'lucide-react';
import axios from 'axios';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : window.location.origin
);

const RoleSelectionModal = ({ 
  isOpen, 
  onClose, 
  currentRole = 'User', 
  currentUser = null,
  onSelectRole 
}) => {
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [adminPasskey, setAdminPasskey] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const userDisplayName = currentUser?.full_name || currentUser?.name || 'Practitioner';
  const isAdmin = currentRole === 'Admin' || currentRole === 'Administrator';

  const handleAdminVerify = async (e) => {
    e.preventDefault();
    if (!adminPasskey.trim()) {
      setAdminError('Please enter the administrator clearance key.');
      return;
    }
    setIsVerifying(true);
    setAdminError('');

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const res = await axios.post(
        `${API_BASE}/admin/verify-passkey`, 
        { passkey: adminPasskey },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status === 'success') {
        setIsAdminAuthOpen(false);
        setAdminPasskey('');
        onSelectRole('Admin');
        onClose();
      }
    } catch (err) {
      setAdminError(err.response?.data?.detail || 'Invalid clearance key. Access denied.');
    } finally {
      setIsVerifying(false);
    }
  };

  const roles = [
    {
      id: 'User',
      roleKey: 'User',
      title: 'Seeker Sanctuary',
      badge: 'SEEKER • PERSONAL PATH',
      badgeColor: { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' },
      accentColor: '#a855f7',
      icon: Eye,
      practitionerTag: 'Active Seeker Mode',
      description: 'Your personal space for biometric palm readings, daily card spreads, and cosmic astrological insights.',
      features: [
        'MediaPipe 21-point Palm Biometrics',
        'Daily 3-Card & Celtic Cross Spreads',
        'Vedic Lagna Kundali & Planetary Transits',
        'Micro-Expression 7-Chakra Aura Scan'
      ],
      switchAction: () => {
        onSelectRole('User');
        onClose();
      }
    },
    {
      id: 'Tarot Reader',
      roleKey: 'Tarot Reader',
      title: 'Arcana Reading Studio',
      badge: 'PRACTITIONER SUITE',
      badgeColor: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
      accentColor: '#f59e0b',
      icon: Sparkles,
      practitionerTag: `Lead Practitioner: ${userDisplayName}`,
      description: 'Professional workstation for card interpreters to customize spreads, examine inversions, and manage client archives.',
      features: [
        'Interactive 6-Spread Studio & Custom Decks',
        'Client Reading Archive & Consultation Log',
        'Inverted Card Reversal Dynamic Analysis',
        'Practitioner Metrics & Booking Ledger'
      ],
      switchAction: () => {
        onSelectRole('Tarot Reader');
        onClose();
      }
    },
    {
      id: 'Spiritual Consultant',
      roleKey: 'Spiritual Consultant',
      title: 'Vedic Guidance Portal',
      badge: 'CONSULTANT SUITE',
      badgeColor: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
      accentColor: '#10b981',
      icon: Feather,
      practitionerTag: `Vedic Mentor: ${userDisplayName}`,
      description: 'Holistic client consultation dashboard combining Swiss Ephemeris transits, live palm rooms, and trajectory analytics.',
      features: [
        'Live Palm Consultation Room (/ws/palmistry)',
        'Swiss Ephemeris Transit & Dasha Analysis',
        'Seeker Spiritual Trajectory & Effectiveness',
        'Vedic Synastry & Compatibility Analysis'
      ],
      switchAction: () => {
        onSelectRole('Spiritual Consultant');
        onClose();
      }
    },
    {
      id: 'Admin',
      roleKey: 'Admin',
      title: 'Platform Sovereign',
      badge: isAdmin ? 'ADMINISTRATOR' : 'RESTRICTED ACCESS',
      badgeColor: isAdmin 
        ? { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' }
        : { bg: 'rgba(244, 63, 94, 0.12)', text: '#fb7185', border: 'rgba(244, 63, 94, 0.25)' },
      accentColor: '#ef4444',
      icon: ShieldCheck,
      practitionerTag: isAdmin ? 'Clearance Granted' : 'Master Key Required',
      description: 'Central security and governance console for overseeing platform telemetries, user access, and reading audit logs.',
      features: [
        'Platform User Management & Access RBAC',
        'Live Consultation Monitoring & Audit Logs',
        'Platform Telemetry & Executive PDF Exports',
        'AI Synthesis Engine & Database Health'
      ],
      switchAction: () => {
        if (isAdmin) {
          onSelectRole('Admin');
          onClose();
        } else {
          setIsAdminAuthOpen(true);
        }
      }
    }
  ];

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '1160px',
          background: 'radial-gradient(ellipse at top, rgba(30, 27, 75, 0.95), rgba(15, 23, 42, 0.98))',
          borderRadius: '24px',
          border: '1px solid rgba(168, 85, 247, 0.25)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(168, 85, 247, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1.75rem 2rem 1.25rem 2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Compass size={18} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
                Mystic Sanctum • Role & Workspace Hub
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8' }}>
              Select an isolated workspace tailored to your path: personal seeker exploration, practitioner card tables, Vedic consultations, or platform governance.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 4 Original Role Cards */}
        <div style={{
          padding: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem'
        }}>
          {roles.map((r) => {
            const isCurrent = (currentRole === r.roleKey) || (r.roleKey === 'User' && currentRole === 'Seeker') || (r.roleKey === 'Admin' && currentRole === 'Administrator');
            const Icon = r.icon;

            return (
              <div
                key={r.id}
                style={{
                  background: isCurrent 
                    ? 'linear-gradient(180deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95))' 
                    : 'rgba(15, 23, 42, 0.6)',
                  borderRadius: '18px',
                  border: isCurrent 
                    ? `2px solid ${r.accentColor}` 
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isCurrent 
                    ? `0 0 25px ${r.accentColor}33, inset 0 0 20px ${r.accentColor}11` 
                    : 'none',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {/* Active Indicator Pin */}
                {isCurrent && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '20px',
                    background: `${r.accentColor}22`,
                    border: `1px solid ${r.accentColor}66`,
                    color: r.accentColor,
                    fontSize: '0.68rem',
                    fontWeight: '700'
                  }}>
                    <CheckCircle2 size={11} />
                    Active Role
                  </div>
                )}

                <div>
                  {/* Icon & Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: `${r.accentColor}20`,
                      border: `1px solid ${r.accentColor}40`,
                      color: r.accentColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 0 15px ${r.accentColor}30`
                    }}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <span style={{
                        display: 'inline-block',
                        fontSize: '0.68rem',
                        fontWeight: '800',
                        letterSpacing: '0.04em',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: r.badgeColor.bg,
                        color: r.badgeColor.text,
                        border: `1px solid ${r.badgeColor.border}`
                      }}>
                        {r.badge}
                      </span>
                    </div>
                  </div>

                  {/* Title & Tag */}
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 4px 0' }}>
                    {r.title}
                  </h3>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: r.accentColor, marginBottom: '8px' }}>
                    {r.practitionerTag}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.45', margin: '0 0 1rem 0', minHeight: '38px' }}>
                    {r.description}
                  </p>

                  {/* Features List */}
                  <div style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    paddingTop: '0.85rem',
                    marginBottom: '1.25rem'
                  }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      Workspace Capabilities:
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {r.features.map((f, i) => (
                        <li key={i} style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <span style={{ color: r.accentColor, marginTop: '2px' }}>✦</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Button */}
                <div>
                  <button
                    onClick={r.switchAction}
                    disabled={isCurrent}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: 'none',
                      background: isCurrent 
                        ? `${r.accentColor}33` 
                        : (r.roleKey === 'Admin' && !isAdmin)
                          ? 'linear-gradient(135deg, #e11d48, #be123c)'
                          : `linear-gradient(135deg, ${r.accentColor}, ${r.accentColor}dd)`,
                      color: isCurrent ? r.accentColor : '#ffffff',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      cursor: isCurrent ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: isCurrent ? 'none' : `0 4px 15px ${r.accentColor}40`,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isCurrent ? (
                      <>
                        <CheckCircle2 size={14} />
                        Current Active Role
                      </>
                    ) : r.roleKey === 'Admin' && !isAdmin ? (
                      <>
                        <Lock size={13} />
                        Authenticate as Admin →
                      </>
                    ) : (
                      <>
                        <span>Enter Workspace</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div style={{
          padding: '1rem 2rem',
          background: 'rgba(0, 0, 0, 0.3)',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={12} color="#94a3b8" />
            <span>Role-Based Access Control (RBAC) enforced. Administrative roles require master clearance key verification.</span>
          </div>
          <span>Mystic Insights Sanctum v2.6</span>
        </div>
      </div>

      {/* Admin Passkey Verification Modal */}
      {isAdminAuthOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setIsAdminAuthOpen(false)}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: '440px',
              background: '#0f172a',
              borderRadius: '18px',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.9), 0 0 30px rgba(239, 68, 68, 0.2)',
              padding: '1.75rem',
              color: '#f8fafc'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Admin Clearance Required</h3>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Platform Sovereign Authentication</span>
                </div>
              </div>
              <button
                onClick={() => setIsAdminAuthOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.45', margin: '0 0 1.25rem 0' }}>
              Regular users cannot self-assign Administrator privileges. Enter the master clearance key to unlock system governance and telemetry:
            </p>

            <form onSubmit={handleAdminVerify}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                  Master Clearance Key
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    placeholder="Enter administrator passkey..."
                    value={adminPasskey}
                    onChange={(e) => setAdminPasskey(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Key size={14} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              {adminError && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '1rem'
                }}>
                  <AlertCircle size={14} />
                  <span>{adminError}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="submit"
                  disabled={isVerifying}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 size={14} className="spinner-ring" />
                      Verifying Clearance...
                    </>
                  ) : (
                    'Verify & Elevate Session'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdminAuthOpen(false)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#94a3b8',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSelectionModal;
