import axios from 'axios';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRightToLine,
  Compass,
  Hand,
  Layers,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  UserPlus
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoModal from './LogoModal';
import appLogo from '../assets/app-logo.png';
const API_BASE = import.meta.env.VITE_API_BASE_URL || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : window.location.origin
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const Login = () => {
  // step: 'auth' (login/register form) -> 'verify-email' (after register)
  //       or 'verify-otp' (after a login password check if 2FA is required)
  const [step, setStep] = useState('auth');
  const [isLogin, setIsLogin] = useState(true);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('seeker@cosmos.ai');
  const [password, setPassword] = useState('password123');
  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [googleConfigured, setGoogleConfigured] = useState(false);
  const navigate = useNavigate();

  const handleQuickLogin = async (roleEmail, rolePwd) => {
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const params = new URLSearchParams();
      params.append('username', roleEmail);
      params.append('password', rolePwd);
      const res = await axios.post(`${API_BASE}/login`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      if (res.data.access_token) {
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('access_token', res.data.access_token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Quick demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if redirected with an error message
    const params = new URLSearchParams(window.location.search);
    const errParam = params.get('error');
    if (errParam) {
      setError(decodeURIComponent(errParam));
    }

    // Check if Google OAuth is configured on the backend
    axios
      .get(`${API_BASE}/auth/google/status`)
      .then((res) => {
        if (res.data?.configured) {
          setGoogleConfigured(true);
        }
      })
      .catch(() => {
        setGoogleConfigured(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');
    setDemoCode('');

    try {
      if (isLogin) {
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);

        const res = await axios.post(`${API_BASE}/login`, params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        // Direct token returned (standard fast password login)
        if (res.data.access_token) {
          localStorage.setItem('token', res.data.access_token);
          localStorage.setItem('access_token', res.data.access_token);
          navigate('/dashboard');
        } else if (res.data.otp_required) {
          setInfo(res.data.message || `A login code was sent to ${email}.`);
          if (res.data.demo_code) {
            setDemoCode(res.data.demo_code);
          }
          setStep('verify-otp');
        }
      } else {
        const res = await axios.post(`${API_BASE}/register`, {
          email: email,
          password: password
        });

        setInfo(res.data.message || `A verification code was sent to ${email}.`);
        if (res.data.demo_code) {
          setDemoCode(res.data.demo_code);
        }
        setStep('verify-email');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    setInfo('');

    try {
      if (googleConfigured) {
        // Full OAuth browser redirect
        window.location.href = `${API_BASE}/auth/google/login`;
      } else {
        setError(
          'Google OAuth is not configured yet. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env to connect Google Cloud credentials.'
        );
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Google sign-in could not be initiated.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtpLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address first to receive your login code.');
      return;
    }

    setLoading(true);
    setError('');
    setInfo('');
    setDemoCode('');

    try {
      const res = await axios.post(`${API_BASE}/auth/request-login-code`, {
        email: trimmedEmail
      });

      setInfo(res.data?.message || `A login code was sent to ${trimmedEmail}.`);
      if (res.data?.demo_code) {
        setDemoCode(res.data.demo_code);
        setCode(res.data.demo_code);
      }
      setStep('verify-otp');
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not send login code. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/auth/verify-email`, { email, code });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('access_token', res.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/auth/verify-otp`, { email, otp: code });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('access_token', res.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setInfo('');
    try {
      const purpose = step === 'verify-otp' ? 'otp' : 'verify';
      const res = await axios.post(`${API_BASE}/auth/resend-code`, { email, purpose });
      setInfo(res.data?.message || 'A new code has been sent.');
      if (res.data?.demo_code) {
        setDemoCode(res.data.demo_code);
        setCode(res.data.demo_code);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not resend code.');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setInfo('');
    setName('');
    setEmail('');
    setPassword('');
    setCode('');
    setDemoCode('');
    setStep('auth');
  };

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.85rem 1rem 0.85rem 2.5rem',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#ffffff',
    outline: 'none',
    fontSize: '0.95rem'
  };

  const buttonStyle = {
    width: '100%',
    padding: '0.85rem 1.5rem',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
    border: 'none',
    color: '#ffffff',
    fontWeight: '700',
    cursor: loading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    opacity: loading ? 0.7 : 1,
    transition: 'transform 0.15s ease, opacity 0.15s ease'
  };

  const googleBtnStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.85rem 1.25rem',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.07)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'background 0.2s ease, border-color 0.2s ease',
    backdropFilter: 'blur(10px)'
  };

  return (
    <>
      <div className="nebula"></div>
      <div className="starfield-layer" />
      <div className="constellation-overlay" />
      <div className="shooting-star-1" />
      <div className="shooting-star-2" />

      <div
        className="auth-wrapper"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          position: 'relative',
          zIndex: 10,
          padding: '1rem'
        }}
      >
        <div
          className="glass-card"
          style={{
            display: 'flex',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            maxWidth: '920px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)'
          }}
        >
          {/* Left Brand Banner */}
          <div
            className="auth-banner"
            style={{
              flex: 1,
              padding: '3rem',
              background: 'rgba(255,255,255,0.03)',
              borderRight: '1px solid rgba(255,255,255,0.05)'
            }}
          >
            <h1
              className="brand-title"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '2rem',
                fontWeight: '800',
                color: '#f8fafc',
                marginBottom: '1rem'
              }}
            >
              <button
                type="button"
                onClick={() => setIsLogoModalOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  borderRadius: '50%',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                title="Tap to view enlarged emblem"
              >
                <img
                  src={appLogo}
                  alt="Mystic Insights"
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    boxShadow: '0 0 20px rgba(251, 191, 36, 0.5), 0 0 10px rgba(255, 255, 255, 0.8)',
                    border: '2px solid rgba(251, 191, 36, 0.8)'
                  }}
                />
              </button>
              <span>Mystic Insights</span>
            </h1>
            <p
              className="brand-subtitle"
              style={{
                color: '#94a3b8',
                fontSize: '1rem',
                lineHeight: '1.6',
                marginBottom: '2rem'
              }}
            >
              Your personal portal to spiritual intelligence, biometric palmistry, and cosmic
              alignment.
            </p>

            <ul
              className="feature-list"
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              <li
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#cbd5e1'
                }}
              >
                <Hand size={20} style={{ color: '#38bdf8' }} /> 21-Point AI Palmistry Analysis
              </li>
              <li
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#cbd5e1'
                }}
              >
                <Layers size={20} style={{ color: '#a855f7' }} /> Interactive 3D Tarot Spreads
              </li>
              <li
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#cbd5e1'
                }}
              >
                <Compass size={20} style={{ color: '#fbbf24' }} /> Vedic Astrology & Kundali Charts
              </li>
              <li
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#cbd5e1'
                }}
              >
                <TrendingUp size={20} style={{ color: '#34d399' }} /> Resonance Evolution Tracking
              </li>
            </ul>
          </div>

          {/* Right Form Container */}
          <div className="auth-form-container" style={{ flex: 1, padding: '3rem' }}>
            {/* ---------- STEP: auth (login / register) ---------- */}
            {step === 'auth' && (
              <>
                <div className="form-header" style={{ marginBottom: '1.75rem' }}>
                  <h3
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#f8fafc',
                      margin: '0 0 0.5rem 0'
                    }}
                  >
                    {isLogin ? 'Welcome Back' : 'Begin Your Journey'}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                    {isLogin
                      ? 'Enter your credentials to access your sanctuary.'
                      : 'Create an account to unlock your cosmic blueprint.'}
                  </p>
                </div>

                {error && (
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: '10px',
                      color: '#f87171',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '1.25rem',
                      fontSize: '0.88rem'
                    }}
                  >
                    <AlertCircle size={18} style={{ flexShrink: 0 }} /> <span>{error}</span>
                  </div>
                )}

                {/* 1-Click Instant Demo Login Buttons */}
                {isLogin && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.78rem',
                        color: '#94a3b8',
                        marginBottom: '8px',
                        fontWeight: 600,
                        letterSpacing: '0.05em'
                      }}
                    >
                      <span>⚡ 1-CLICK INSTANT DEMO LOGIN</span>
                      <span style={{ color: '#38bdf8', fontSize: '0.72rem' }}>Ready to test</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleQuickLogin('seeker@cosmos.ai', 'password123')}
                        disabled={loading}
                        style={{
                          padding: '0.65rem 0.5rem',
                          borderRadius: '10px',
                          background: 'rgba(56, 189, 248, 0.12)',
                          border: '1px solid rgba(56, 189, 248, 0.4)',
                          color: '#38bdf8',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: loading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span style={{ fontSize: '1rem' }}>🔮</span>
                        <span>Seeker</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickLogin('astrologer@cosmos.ai', 'password123')}
                        disabled={loading}
                        style={{
                          padding: '0.65rem 0.5rem',
                          borderRadius: '10px',
                          background: 'rgba(168, 85, 247, 0.12)',
                          border: '1px solid rgba(168, 85, 247, 0.4)',
                          color: '#c084fc',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: loading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span style={{ fontSize: '1rem' }}>✨</span>
                        <span>Astrologer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickLogin('admin@cosmos.ai', 'password123')}
                        disabled={loading}
                        style={{
                          padding: '0.65rem 0.5rem',
                          borderRadius: '10px',
                          background: 'rgba(251, 191, 36, 0.12)',
                          border: '1px solid rgba(251, 191, 36, 0.4)',
                          color: '#fbbf24',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: loading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span style={{ fontSize: '1rem' }}>🛡️</span>
                        <span>Admin</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Continue with Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  style={googleBtnStyle}
                  title="Sign in with Google"
                >
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </button>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '1.25rem 0',
                    color: '#64748b',
                    fontSize: '0.8rem'
                  }}
                >
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                  <span
                    style={{
                      padding: '0 12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontSize: '0.75rem'
                    }}
                  >
                    or with email
                  </span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                </div>

                <form
                  onSubmit={handleSubmit}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}
                >
                  {!isLogin && (
                    <div className="input-group">
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.85rem',
                          color: '#cbd5e1',
                          marginBottom: '6px'
                        }}
                      >
                        Full Name
                      </label>
                      <div style={{ position: 'relative' }}>
                        <User
                          size={18}
                          style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#64748b'
                          }}
                        />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Cosmic Seeker"
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  )}

                  <div className="input-group">
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        color: '#cbd5e1',
                        marginBottom: '6px'
                      }}
                    >
                      Email Address
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail
                        size={18}
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#64748b'
                        }}
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seeker@cosmos.ai"
                        required
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        color: '#cbd5e1',
                        marginBottom: '6px'
                      }}
                    >
                      Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock
                        size={18}
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#64748b'
                        }}
                      />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={isLogin ? '••••••••' : 'Create a strong password'}
                        required
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {isLogin && (
                    <div style={{ textAlign: 'center', margin: '-0.25rem 0 0.25rem 0' }}>
                      <button
                        type="button"
                        onClick={handleRequestOtpLogin}
                        disabled={loading}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#38bdf8',
                          fontSize: '0.84rem',
                          fontWeight: '600',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 8px',
                          borderRadius: '6px'
                        }}
                        title="Send a 6-digit verification code to log in without entering your password"
                      >
                        <Mail size={15} />
                        <span>Email me a one-time login code instead</span>
                      </button>
                    </div>
                  )}

                  <button type="submit" disabled={loading} style={buttonStyle}>
                    {loading ? (
                      <Loader2
                        style={{
                          width: '20px',
                          height: '20px',
                          animation: 'spin 1s linear infinite'
                        }}
                      />
                    ) : isLogin ? (
                      <ArrowRightToLine size={20} />
                    ) : (
                      <UserPlus size={20} />
                    )}
                    <span>
                      {loading
                        ? 'Connecting...'
                        : isLogin
                          ? 'Enter Portal'
                          : 'Create Account'}
                    </span>
                  </button>
                </form>

                <div
                  style={{
                    marginTop: '1.75rem',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    color: '#94a3b8'
                  }}
                >
                  {isLogin ? 'New to the cosmos? ' : 'Already registered? '}
                  <button
                    type="button"
                    onClick={toggleMode}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#38bdf8',
                      fontWeight: '600',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {isLogin ? 'Begin your journey' : 'Return to portal'}
                  </button>
                </div>
              </>
            )}

            {/* ---------- STEP: verify-email (after register) ---------- */}
            {step === 'verify-email' && (
              <>
                <div style={{ marginBottom: '1.75rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '0.5rem'
                    }}
                  >
                    <ShieldCheck size={24} style={{ color: '#34d399' }} />
                    <h3
                      style={{
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        color: '#f8fafc',
                        margin: 0
                      }}
                    >
                      Verify Your Email
                    </h3>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                    {demoCode ? 'A verification code was generated for ' : 'Enter the 6-digit code sent to '}
                    <strong style={{ color: '#cbd5e1' }}>{email}</strong>.
                  </p>
                </div>

                {info && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      background: 'rgba(52, 211, 153, 0.1)',
                      border: '1px solid rgba(52,211,153,0.3)',
                      borderRadius: '10px',
                      color: '#34d399',
                      marginBottom: '1.25rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    {info}
                  </div>
                )}

                {demoCode && (
                  <div
                    style={{
                      padding: '0.65rem 0.9rem',
                      background: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '10px',
                      marginBottom: '1.25rem',
                      fontSize: '0.85rem',
                      color: '#93c5fd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Dev Testing Code:</span>
                        <strong style={{ color: '#ffffff', letterSpacing: '2px' }}>
                          {demoCode}
                        </strong>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        (SMTP not configured in backend/.env — displayed on-screen for testing)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCode(demoCode)}
                      style={{
                        background: 'rgba(59, 130, 246, 0.35)',
                        border: 'none',
                        color: '#ffffff',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Auto-fill
                    </button>
                  </div>
                )}

                {error && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: '10px',
                      color: '#f87171',
                      marginBottom: '1.25rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    {error}
                  </div>
                )}

                <form
                  onSubmit={handleVerifyEmail}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                >
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    required
                    style={{
                      ...inputStyle,
                      paddingLeft: '1rem',
                      textAlign: 'center',
                      letterSpacing: '6px',
                      fontSize: '1.3rem',
                      fontWeight: '700'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={loading || code.length !== 6}
                    style={buttonStyle}
                  >
                    {loading ? (
                      <Loader2
                        style={{
                          width: '20px',
                          height: '20px',
                          animation: 'spin 1s linear infinite'
                        }}
                      />
                    ) : (
                      <ShieldCheck size={20} />
                    )}
                    <span>{loading ? 'Verifying...' : 'Verify & Enter'}</span>
                  </button>
                </form>

                <div
                  style={{
                    marginTop: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    color: '#94a3b8'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setStep('auth');
                      setError('');
                      setInfo('');
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>

                  <div>
                    Didn't get it?{' '}
                    <button
                      type="button"
                      onClick={handleResendCode}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#38bdf8',
                        fontWeight: '600',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Resend code
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ---------- STEP: verify-otp (after login password check) ---------- */}
            {step === 'verify-otp' && (
              <>
                <div style={{ marginBottom: '1.75rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '0.5rem'
                    }}
                  >
                    <ShieldCheck size={24} style={{ color: '#fbbf24' }} />
                    <h3
                      style={{
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        color: '#f8fafc',
                        margin: 0
                      }}
                    >
                      Enter Your Login Code
                    </h3>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                    {demoCode ? 'A login code was generated for ' : 'We sent a one-time code to '}
                    <strong style={{ color: '#cbd5e1' }}>{email}</strong>.
                  </p>
                </div>

                {info && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      background: 'rgba(52, 211, 153, 0.1)',
                      border: '1px solid rgba(52,211,153,0.3)',
                      borderRadius: '10px',
                      color: '#34d399',
                      marginBottom: '1.25rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    {info}
                  </div>
                )}

                {demoCode && (
                  <div
                    style={{
                      padding: '0.65rem 0.9rem',
                      background: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '10px',
                      marginBottom: '1.25rem',
                      fontSize: '0.85rem',
                      color: '#93c5fd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Dev Testing Code:</span>
                        <strong style={{ color: '#ffffff', letterSpacing: '2px' }}>
                          {demoCode}
                        </strong>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        (SMTP not configured in backend/.env — displayed on-screen for testing)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCode(demoCode)}
                      style={{
                        background: 'rgba(59, 130, 246, 0.35)',
                        border: 'none',
                        color: '#ffffff',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Auto-fill
                    </button>
                  </div>
                )}

                {error && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: '10px',
                      color: '#f87171',
                      marginBottom: '1.25rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    {error}
                  </div>
                )}

                <form
                  onSubmit={handleVerifyOtp}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                >
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    required
                    style={{
                      ...inputStyle,
                      paddingLeft: '1rem',
                      textAlign: 'center',
                      letterSpacing: '6px',
                      fontSize: '1.3rem',
                      fontWeight: '700'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={loading || code.length !== 6}
                    style={buttonStyle}
                  >
                    {loading ? (
                      <Loader2
                        style={{
                          width: '20px',
                          height: '20px',
                          animation: 'spin 1s linear infinite'
                        }}
                      />
                    ) : (
                      <ArrowRightToLine size={20} />
                    )}
                    <span>{loading ? 'Verifying...' : 'Enter Portal'}</span>
                  </button>
                </form>

                <div
                  style={{
                    marginTop: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    color: '#94a3b8'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setStep('auth');
                      setError('');
                      setInfo('');
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>

                  <div>
                    Didn't get it?{' '}
                    <button
                      type="button"
                      onClick={handleResendCode}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#38bdf8',
                        fontWeight: '600',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Resend code
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <LogoModal isOpen={isLogoModalOpen} onClose={() => setIsLogoModalOpen(false)} logoSrc={appLogo} />
    </>
  );
};

export default Login;