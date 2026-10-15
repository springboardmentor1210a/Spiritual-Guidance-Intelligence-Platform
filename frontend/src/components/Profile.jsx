import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

/* =========================================================
   LUNARA PROFILE
   Ancient manuscript interface with futuristic interactions
   ========================================================= */

/* ---------------------------------------------------------
   Progress Bar
   --------------------------------------------------------- */
const ProgressBar = ({ label, value, color, gradient }) => {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '14px',
        fontSize: '0.9rem',
        color: '#5c3a21',
        fontWeight: 'bold',
        gap: '8px'
      }}
    >
      <span
        style={{
          width: '92px',
          minWidth: '92px',
          textTransform: 'uppercase',
          fontSize: '0.72rem',
          letterSpacing: '0.8px'
        }}
      >
        {label}
      </span>

      <div
        style={{
          flex: 1,
          height: '11px',
          background:
            'linear-gradient(90deg, rgba(92,58,33,0.08), rgba(212,184,149,0.45))',
          borderRadius: '6px',
          margin: '0 8px',
          overflow: 'hidden',
          border: '1px solid rgba(156,108,68,0.7)',
          boxShadow: 'inset 0 1px 3px rgba(44,26,15,0.18)'
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safeValue}%` }}
          transition={{
            duration: 1.25,
            delay: 0.15,
            ease: 'easeOut'
          }}
          style={{
            height: '100%',
            background:
              gradient ||
              color ||
              'linear-gradient(90deg, #5c3a21, #d4b895, #9c6c44)',
            borderRadius: '5px',
            boxShadow:
              '0 0 8px rgba(156,108,68,0.45), inset 0 1px rgba(255,255,255,0.35)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <motion.div
            animate={{ x: ['-100%', '150%'] }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: 1.5
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '45%',
              height: '100%',
              background:
                'linear-gradient(90deg, transparent, rgba(255,241,190,0.65), transparent)',
              transform: 'skewX(-20deg)'
            }}
          />
        </motion.div>
      </div>

      <span
        style={{
          width: '42px',
          textAlign: 'right',
          color: '#2c1a0f',
          fontVariantNumeric: 'tabular-nums'
        }}
      >
        {safeValue}%
      </span>
    </div>
  );
};

/* ---------------------------------------------------------
   Status Badge
   --------------------------------------------------------- */
const StatusBadge = ({ status }) => {
  const getStyle = () => {
    switch (status?.toLowerCase()) {
      case 'rising':
        return {
          bg: 'rgba(22,101,52,0.12)',
          color: '#166534',
          border: '#166534',
          icon: '↗'
        };

      case 'stable':
        return {
          bg: 'rgba(133,77,14,0.13)',
          color: '#854d0e',
          border: '#854d0e',
          icon: '◆'
        };

      case 'declining':
        return {
          bg: 'rgba(139,0,0,0.10)',
          color: '#8b0000',
          border: '#8b0000',
          icon: '↘'
        };

      default:
        return {
          bg: 'rgba(92,58,33,0.12)',
          color: '#5c3a21',
          border: '#5c3a21',
          icon: '✦'
        };
    }
  };

  const style = getStyle();

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.06 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        padding: '5px 11px',
        borderRadius: '14px',
        fontSize: '0.7rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        whiteSpace: 'nowrap'
      }}
    >
      <span>{style.icon}</span>
      {status || 'Unknown'}
    </motion.span>
  );
};

/* ---------------------------------------------------------
   Decorative Corner
   --------------------------------------------------------- */
const CornerDecoration = ({ position }) => (
  <div
    style={{
      position: 'absolute',
      width: '42px',
      height: '42px',
      pointerEvents: 'none',
      ...position
    }}
  >
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '1px',
        background: '#9c6c44'
      }}
    />
    <div
      style={{
        position: 'absolute',
        width: '1px',
        height: '100%',
        background: '#9c6c44'
      }}
    />
    <div
      style={{
        position: 'absolute',
        width: '7px',
        height: '7px',
        border: '1px solid #5c3a21',
        transform: 'rotate(45deg)',
        top: '18px',
        left: '18px',
        background: '#e8d5b5'
      }}
    />
  </div>
);

/* ---------------------------------------------------------
   Section Heading
   --------------------------------------------------------- */
const SectionHeading = ({ eyebrow, title, description }) => (
  <div style={{ marginBottom: '22px' }}>
    {eyebrow && (
      <div
        style={{
          color: '#9c6c44',
          fontSize: '0.68rem',
          fontWeight: 'bold',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          marginBottom: '6px'
        }}
      >
        {eyebrow}
      </div>
    )}

    <h3
      style={{
        margin: 0,
        color: '#3e2723',
        fontSize: '1.35rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '2px'
      }}
    >
      {title}
    </h3>

    {description && (
      <p
        style={{
          margin: '7px 0 0',
          color: '#6f4a2d',
          fontSize: '0.88rem',
          fontStyle: 'italic',
          lineHeight: 1.5
        }}
      >
        {description}
      </p>
    )}
  </div>
);

/* ---------------------------------------------------------
   Profile Component
   --------------------------------------------------------- */

/* =========================================================
   PALM ANALYST PROFESSIONAL INTELLIGENCE
   =========================================================

   Palm Analysts are reviewers, not seekers. Their profile must
   therefore expose professional review telemetry instead of the
   seeker's personal trajectory generator.

   The panel uses the existing review endpoint and presentation-
   only session telemetry. It does not create a second palm-reading
   engine and it does not call the seeker trend-analysis endpoint.
   ========================================================= */
const readPalmSessionReviews = () => {
  const savedReviews = Number(
    window.localStorage.getItem('lunara_palm_session_reviews') || '0'
  );

  return Number.isFinite(savedReviews) ? savedReviews : 0;
};

const readPalmSessionAverage = () => {
  try {
    const savedRatings = JSON.parse(
      window.localStorage.getItem('lunara_palm_session_ratings') || '[]'
    );

    if (!Array.isArray(savedRatings) || savedRatings.length === 0) {
      return null;
    }

    const numericRatings = savedRatings
      .map(Number)
      .filter(Number.isFinite);

    if (numericRatings.length === 0) {
      return null;
    }

    return (
      numericRatings.reduce((sum, value) => sum + value, 0) /
      numericRatings.length
    );
  } catch {
    return null;
  }
};

const PalmAnalystProfileIntelligence = () => {
  const [pendingReviews, setPendingReviews] = useState(null);
  const [sessionReviews, setSessionReviews] = useState(readPalmSessionReviews);
  const [sessionAverage, setSessionAverage] = useState(readPalmSessionAverage);
  const [loading, setLoading] = useState(true);
  const [queueState, setQueueState] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadPalmTelemetry = async () => {
      try {
        const response = await api.get('/api/readings/review/palm');
        const readings = Array.isArray(response.data)
          ? response.data
          : [];

        if (mounted) {
          setPendingReviews(readings.length);
          setQueueState(
            readings.length === 0
              ? 'Archive clear'
              : `${readings.length} reading${readings.length === 1 ? '' : 's'} awaiting review`
          );
        }
      } catch (requestError) {
        console.error('Failed to load palm analyst telemetry:', requestError);

        if (mounted) {
          setPendingReviews(null);
          setQueueState('Review queue unavailable');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPalmTelemetry();

    const refreshSessionTelemetry = () => {
      setSessionReviews(readPalmSessionReviews());
      setSessionAverage(readPalmSessionAverage());
    };

    window.addEventListener('storage', refreshSessionTelemetry);
    window.addEventListener('visibilitychange', refreshSessionTelemetry);

    return () => {
      mounted = false;
      window.removeEventListener('storage', refreshSessionTelemetry);
      window.removeEventListener('visibilitychange', refreshSessionTelemetry);
    };
  }, []);

  const metricCard = (
    icon,
    label,
    value,
    detail,
    accent
  ) => (
    <motion.div
      whileHover={{
        y: -4,
        scale: 1.01
      }}
      style={{
        flex: '1 1 190px',
        minWidth: '175px',
        padding: '22px 18px',
        background:
          'linear-gradient(145deg, rgba(255,248,224,0.78), rgba(232,213,181,0.5))',
        border: '1px solid rgba(156,108,68,0.62)',
        borderTop: `3px solid ${accent}`,
        borderRadius: '8px',
        boxShadow: '0 8px 22px rgba(44,26,15,0.1)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <motion.div
        animate={{
          opacity: [0.4, 0.85, 0.4]
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`
        }}
      />

      <div
        style={{
          width: '38px',
          height: '38px',
          margin: '0 auto 10px',
          borderRadius: '50%',
          border: `1px solid ${accent}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accent,
          fontSize: '1.15rem',
          background: 'rgba(255,250,232,0.55)'
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color: '#765037',
          fontSize: '0.66rem',
          letterSpacing: '1.4px',
          textTransform: 'uppercase',
          fontWeight: 'bold'
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: '7px',
          color: accent,
          fontSize: '1.75rem',
          fontWeight: 'bold',
          fontFamily: 'serif'
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: '6px',
          color: '#6d4a2e',
          fontSize: '0.72rem',
          lineHeight: 1.45
        }}
      >
        {detail}
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 18
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        duration: 0.5
      }}
      style={{
        ...cardContainerStyle,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={scanLineStyle} />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
          marginBottom: '24px'
        }}
      >
        <div style={{ flex: 1, minWidth: '260px' }}>
          <div style={miniLabelStyle}>
            PALM INTELLIGENCE ENGINE
          </div>

          <h2
            style={{
              ...oracleTitleStyle,
              fontSize: '2rem',
              marginBottom: '10px'
            }}
          >
            Analyst Intelligence Overview
          </h2>

          <p
            style={{
              ...oracleDescriptionStyle,
              marginBottom: 0
            }}
          >
            Review palm-analysis activity, monitor pending AI-generated
            readings, and track the quality signals produced by your
            professional evaluation workflow.
          </p>
        </div>

        <motion.div
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            border: '2px dashed #9c6c44',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#8b0000',
            fontSize: '1.65rem',
            background: 'rgba(232,213,181,0.55)',
            boxShadow: '0 0 22px rgba(156,108,68,0.18)'
          }}
        >
          ✋
        </motion.div>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        {metricCard(
          '⌂',
          'Pending Reviews',
          loading ? '—' : pendingReviews ?? '—',
          queueState || 'Awaiting queue status',
          '#8b0000'
        )}

        {metricCard(
          '✎',
          'Session Reviews',
          sessionReviews,
          'Professional reviews submitted this session',
          '#5c3a21'
        )}

        {metricCard(
          '★',
          'Session Quality',
          sessionAverage ? `${sessionAverage.toFixed(1)}/10` : '—',
          'Average analyst rating this session',
          '#166534'
        )}

        {metricCard(
          '✋',
          'Review Mode',
          'HUMAN',
          'Professional evaluation of AI palm analysis',
          '#9c6c44'
        )}
      </div>

      <div
        style={{
          marginTop: '22px',
          padding: '15px 18px',
          borderTop: '1px dashed rgba(156,108,68,0.55)',
          borderBottom: '1px dashed rgba(156,108,68,0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '15px',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <div style={miniLabelStyle}>PROFESSIONAL WORKFLOW</div>
          <strong style={{ color: '#3e2723' }}>
            AI analysis → analyst review → structured feedback
          </strong>
        </div>

        <Link
          to="/palm-reader"
          style={{
            ...roleCommandLinkStyle,
            textDecoration: 'none'
          }}
        >
          <span>Open Palm Workspace</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div
        style={{
          marginTop: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '12px'
        }}
      >
        {[
          ['01', 'LINE DETECTION', 'Life, head, heart and fate line findings'],
          ['02', 'STRUCTURE', 'Palm shape, mounts and finger observations'],
          ['03', 'INTERPRETATION', 'AI-generated meaning and synthesis'],
          ['04', 'FEEDBACK', 'Corrections and improvement guidance']
        ].map(([number, title, description]) => (
          <motion.div
            key={number}
            whileHover={{
              y: -3
            }}
            style={{
              padding: '15px',
              border: '1px solid rgba(156,108,68,0.42)',
              borderRadius: '7px',
              background: 'rgba(255,248,224,0.42)'
            }}
          >
            <div
              style={{
                color: '#8b0000',
                fontSize: '0.62rem',
                letterSpacing: '1.4px',
                fontWeight: 'bold'
              }}
            >
              {number}
            </div>
            <strong
              style={{
                display: 'block',
                marginTop: '5px',
                color: '#3e2723',
                fontSize: '0.8rem',
                letterSpacing: '0.7px'
              }}
            >
              {title}
            </strong>
            <span
              style={{
                display: 'block',
                marginTop: '6px',
                color: '#765037',
                fontSize: '0.76rem',
                lineHeight: 1.45
              }}
            >
              {description}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const Profile = ({ onLogout, onUserUpdated }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ============================================================
     MODERN ACCOUNT PROFILE STATE
     ============================================================ */
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState('');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [logoutPending, setLogoutPending] = useState(false);
  const [editProfile, setEditProfile] = useState({
    first_name: '',
    last_name: '',
    nickname: '',
    date_of_birth: '',
    gender: '',
    profile_image: ''
  });
  const [compassDraft, setCompassDraft] = useState({ interests: [], goals: '', preferences: [] });
  const [compassSaving, setCompassSaving] = useState(false);
  const [compassMessage, setCompassMessage] = useState('');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [trends, setTrends] = useState(null);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [trendError, setTrendError] = useState(null);

  const [hoveredTrend, setHoveredTrend] = useState(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  /* ============================================================
     PROFILE IDENTITY HELPERS
     ============================================================ */
  const normalizeProfilePayload = (payload) => {
    return payload?.user || payload?.data || payload || {};
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const birthDate = new Date(`${dateOfBirth}T00:00:00`);
    if (Number.isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) age -= 1;
    return age >= 0 ? age : null;
  };

  const formatDateForInput = (value) => {
    if (!value) return '';
    const stringValue = String(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) return stringValue;
    const parsed = new Date(stringValue);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().slice(0, 10);
  };

  const getProfileDisplayName = (profile) => (
    profile?.nickname ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
    profile?.username?.split('@')[0] ||
    'Seeker'
  );

  const getProfileInitials = (profile) => {
    const source = profile?.nickname || [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || profile?.username || 'S';
    const parts = String(source).trim().split(/\s+/).filter(Boolean);
    if (parts.length > 1) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return String(parts[0] || 'S').slice(0, 2).toUpperCase();
  };

  const syncEditorWithProfile = (profile) => {
    setEditProfile({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      nickname: profile?.nickname || '',
      date_of_birth: formatDateForInput(profile?.date_of_birth),
      gender: profile?.gender || '',
      profile_image: profile?.profile_image || ''
    });
  };

  const handleEditFieldChange = (event) => {
    const { name, value } = event.target;
    setEditProfile((current) => ({ ...current, [name]: value }));
    setProfileSaveError('');
    setProfileSaveSuccess('');
  };

  const compressProfileImage = (file) => new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Please choose a valid image file.'));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      reject(new Error('Profile pictures must be smaller than 8 MB.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxDimension = 720;
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Unable to prepare the profile picture.'));
          return;
        }
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      image.onerror = () => reject(new Error('The selected profile picture could not be read.'));
      image.src = reader.result;
    };
    reader.onerror = () => reject(new Error('The selected profile picture could not be read.'));
    reader.readAsDataURL(file);
  });

  const handleProfileImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setProfileSaveError('');
      const compressedImage = await compressProfileImage(file);
      setEditProfile((current) => ({ ...current, profile_image: compressedImage }));
      setProfileSaveSuccess('Profile picture prepared. Save your profile to apply it.');
    } catch (imageError) {
      setProfileSaveError(imageError.message || 'Unable to prepare the profile picture.');
    } finally {
      event.target.value = '';
    }
  };

  const handleSaveProfile = async () => {
    setProfileSaveError('');
    setProfileSaveSuccess('');
    if (!editProfile.first_name.trim()) return setProfileSaveError('First name is required.');
    if (!editProfile.last_name.trim()) return setProfileSaveError('Last name is required.');
    if (!editProfile.nickname.trim()) return setProfileSaveError('Nickname is required.');
    if (!editProfile.date_of_birth) return setProfileSaveError('Date of birth is required.');
    const calculatedAge = calculateAge(editProfile.date_of_birth);
    if (calculatedAge === null) return setProfileSaveError('Please enter a valid date of birth.');
    if (new Date(`${editProfile.date_of_birth}T00:00:00`) > new Date()) return setProfileSaveError('Date of birth cannot be in the future.');
    setSavingProfile(true);
    try {
      const response = await api.put('/api/auth/profile', {
        first_name: editProfile.first_name.trim(),
        last_name: editProfile.last_name.trim(),
        nickname: editProfile.nickname.trim(),
        date_of_birth: editProfile.date_of_birth,
        gender: editProfile.gender.trim() || null,
        profile_image: editProfile.profile_image || null
      });
      const updatedProfile = normalizeProfilePayload(response.data);
      setUserData(updatedProfile);
      syncEditorWithProfile(updatedProfile);
      setIsEditingProfile(false);
      setProfileSaveSuccess('Your profile has been updated successfully.');
      if (typeof onUserUpdated === 'function') onUserUpdated(updatedProfile);
    } catch (saveError) {
      setProfileSaveError(saveError.response?.data?.detail || 'The archives could not save your profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleOpenEditProfile = () => {
    syncEditorWithProfile(userData);
    setProfileSaveError('');
    setProfileSaveSuccess('');
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    syncEditorWithProfile(userData);
    setProfileSaveError('');
    setProfileSaveSuccess('');
    setIsEditingProfile(false);
  };

  const handleLogoutFromProfile = () => {
    if (logoutPending) return;
    setLogoutPending(true);
    localStorage.removeItem('token');
    if (typeof onLogout === 'function') {
      onLogout();
      return;
    }
    window.location.assign('/');
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    if (!deletePassword) {
      setDeleteError('Enter your password to permanently delete the account.');
      return;
    }
    setDeletingAccount(true);
    try {
      await api.delete('/api/auth/account', { data: { password: deletePassword } });
      localStorage.removeItem('token');
      setDeletePassword('');
      setShowDeleteAccount(false);
      if (typeof onLogout === 'function') {
        onLogout();
        return;
      }
      window.location.assign('/');
    } catch (deleteAccountError) {
      setDeleteError(deleteAccountError.response?.data?.detail || 'The account could not be deleted. Verify your password and try again.');
    } finally {
      setDeletingAccount(false);
    }
  };

  /*
   * ============================================================
   * ROLE-AWARE PROFILE IDENTITY
   * ============================================================
   *
   * The same /profile route serves every authenticated role.
   * The presentation therefore adapts to the role returned by
   * /api/auth/me instead of making every account look like a seeker.
   */

  const getProfileConfig = (roleValue) => {
    const normalized = String(roleValue || '')
      .trim()
      .toLowerCase()
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ');

    const configs = {
      user: {
        title: 'Seeker Profile',
        eyebrow: 'LUNARA • PERSONAL ARCHIVES',
        identityTab: 'Seeker Identity',
        identityEyebrow: 'PERSONAL ARCHIVES',
        identityTitle: 'Personal Archives',
        identityDescription: 'The recorded identity of the seeker who walks the path.',
        accountLabel: 'Seeker Identity',
        roleLabel: 'Seeker Path',
        workspaceLabel: 'Explore Readings',
        workspaceDescription: 'Return to your personal Lunara dashboard and continue your journey.',
        workspacePath: '/dashboard',
        workspaceSymbol: '✦',
        analyticsEyebrow: 'PERSONAL INTELLIGENCE ENGINE',
        analyticsTitle: 'Reveal Your Trajectory',
        analyticsDescription: 'Consult the archives to generate your personal biometric and spiritual trajectory.',
        archiveLabel: 'Personal Intelligence',
        footerTitle: 'THE ARCHIVES HAVE SPOKEN',
        footerDescription: 'Your trajectory remains a living manuscript.'
      },

      seeker: {
        title: 'Seeker Profile',
        eyebrow: 'LUNARA • PERSONAL ARCHIVES',
        identityTab: 'Seeker Identity',
        identityEyebrow: 'PERSONAL ARCHIVES',
        identityTitle: 'Personal Archives',
        identityDescription: 'The recorded identity of the seeker who walks the path.',
        accountLabel: 'Seeker Identity',
        roleLabel: 'Seeker Path',
        workspaceLabel: 'Explore Readings',
        workspaceDescription: 'Return to your personal Lunara dashboard and continue your journey.',
        workspacePath: '/dashboard',
        workspaceSymbol: '✦',
        analyticsEyebrow: 'PERSONAL INTELLIGENCE ENGINE',
        analyticsTitle: 'Reveal Your Trajectory',
        analyticsDescription: 'Consult the archives to generate your personal biometric and spiritual trajectory.',
        archiveLabel: 'Personal Intelligence',
        footerTitle: 'THE ARCHIVES HAVE SPOKEN',
        footerDescription: 'Your trajectory remains a living manuscript.'
      },

      'tarot': {
        title: 'Tarot Reader Profile',
        eyebrow: 'LUNARA • ARCANA PRACTITIONER ARCHIVES',
        identityTab: 'Practitioner Identity',
        identityEyebrow: 'PRACTITIONER ARCHIVES',
        identityTitle: 'Arcana Practitioner Profile',
        identityDescription: 'The professional identity and operating path of the Tarot Reader.',
        accountLabel: 'Practitioner Identity',
        roleLabel: 'Professional Path',
        workspaceLabel: 'Open Tarot Workspace',
        workspaceDescription: 'Return to your reader command center and continue working with the arcana.',
        workspacePath: '/tarot-workspace',
        workspaceSymbol: '◇',
        analyticsEyebrow: 'READER INTELLIGENCE ENGINE',
        analyticsTabLabel: 'Reader Intelligence',
        analyticsTitle: 'Reveal Reading Intelligence',
        analyticsDescription: 'Consult the available Lunara analytics to understand reading activity, patterns and professional signals.',
        archiveLabel: 'Reader Intelligence',
        footerTitle: 'THE ARCANA ARCHIVES HAVE SPOKEN',
        footerDescription: 'Your practice remains a living manuscript of symbols and interpretation.'
      },

      'tarot reader': {
        title: 'Tarot Reader Profile',
        eyebrow: 'LUNARA • ARCANA PRACTITIONER ARCHIVES',
        identityTab: 'Practitioner Identity',
        identityEyebrow: 'PRACTITIONER ARCHIVES',
        identityTitle: 'Arcana Practitioner Profile',
        identityDescription: 'The professional identity and operating path of the Tarot Reader.',
        accountLabel: 'Practitioner Identity',
        roleLabel: 'Professional Path',
        workspaceLabel: 'Open Tarot Workspace',
        workspaceDescription: 'Return to your reader command center and continue working with the arcana.',
        workspacePath: '/tarot-workspace',
        workspaceSymbol: '◇',
        analyticsEyebrow: 'READER INTELLIGENCE ENGINE',
        analyticsTabLabel: 'Reader Intelligence',
        analyticsTitle: 'Reveal Reading Intelligence',
        analyticsDescription: 'Consult the available Lunara analytics to understand reading activity, patterns and professional signals.',
        archiveLabel: 'Reader Intelligence',
        footerTitle: 'THE ARCANA ARCHIVES HAVE SPOKEN',
        footerDescription: 'Your practice remains a living manuscript of symbols and interpretation.'
      },

      tarotreader: {
        title: 'Tarot Reader Profile',
        eyebrow: 'LUNARA • ARCANA PRACTITIONER ARCHIVES',
        identityTab: 'Practitioner Identity',
        identityEyebrow: 'PRACTITIONER ARCHIVES',
        identityTitle: 'Arcana Practitioner Profile',
        identityDescription: 'The professional identity and operating path of the Tarot Reader.',
        accountLabel: 'Practitioner Identity',
        roleLabel: 'Professional Path',
        workspaceLabel: 'Open Tarot Workspace',
        workspaceDescription: 'Return to your reader command center and continue working with the arcana.',
        workspacePath: '/tarot-workspace',
        workspaceSymbol: '◇',
        analyticsEyebrow: 'READER INTELLIGENCE ENGINE',
        analyticsTabLabel: 'Reader Intelligence',
        analyticsTitle: 'Reveal Reading Intelligence',
        analyticsDescription: 'Consult the available Lunara analytics to understand reading activity, patterns and professional signals.',
        archiveLabel: 'Reader Intelligence',
        footerTitle: 'THE ARCANA ARCHIVES HAVE SPOKEN',
        footerDescription: 'Your practice remains a living manuscript of symbols and interpretation.'
      },

      'palm analyst': {
        title: 'Palm Analyst Profile',
        eyebrow: 'LUNARA • PALMISTRY PRACTITIONER ARCHIVES',
        identityTab: 'Practitioner Identity',
        identityEyebrow: 'PRACTITIONER ARCHIVES',
        identityTitle: 'Palmistry Practitioner Profile',
        identityDescription: 'The professional identity and operating path of the Palm Analyst.',
        accountLabel: 'Practitioner Identity',
        roleLabel: 'Professional Path',
        workspaceLabel: 'Open Palm Workspace',
        workspaceDescription: 'Return to your analyst command center and continue working with palm readings.',
        workspacePath: '/palm-workspace',
        workspaceSymbol: '✋',
        analyticsEyebrow: 'PALM INTELLIGENCE ENGINE',
        analyticsTabLabel: 'Palm Intelligence',
        analyticsTitle: 'Reveal Palm Intelligence',
        analyticsDescription: 'Consult the available Lunara analytics to understand palm-reading activity, patterns and professional signals.',
        archiveLabel: 'Palmistry Intelligence',
        footerTitle: 'THE PALM ARCHIVES HAVE SPOKEN',
        footerDescription: 'Your practice remains a living manuscript of lines, patterns and interpretation.'
      },

      palmanalyst: {
        title: 'Palm Analyst Profile',
        eyebrow: 'LUNARA • PALMISTRY PRACTITIONER ARCHIVES',
        identityTab: 'Practitioner Identity',
        identityEyebrow: 'PRACTITIONER ARCHIVES',
        identityTitle: 'Palmistry Practitioner Profile',
        identityDescription: 'The professional identity and operating path of the Palm Analyst.',
        accountLabel: 'Practitioner Identity',
        roleLabel: 'Professional Path',
        workspaceLabel: 'Open Palm Workspace',
        workspaceDescription: 'Return to your analyst command center and continue working with palm readings.',
        workspacePath: '/palm-workspace',
        workspaceSymbol: '✋',
        analyticsEyebrow: 'PALM INTELLIGENCE ENGINE',
        analyticsTabLabel: 'Palm Intelligence',
        analyticsTitle: 'Reveal Palm Intelligence',
        analyticsDescription: 'Consult the available Lunara analytics to understand palm-reading activity, patterns and professional signals.',
        archiveLabel: 'Palmistry Intelligence',
        footerTitle: 'THE PALM ARCHIVES HAVE SPOKEN',
        footerDescription: 'Your practice remains a living manuscript of lines, patterns and interpretation.'
      },

      'spiritual consultant': {
        title: 'Spiritual Consultant Profile',
        eyebrow: 'LUNARA • GUIDANCE PRACTITIONER ARCHIVES',
        identityTab: 'Practitioner Identity',
        identityEyebrow: 'PRACTITIONER ARCHIVES',
        identityTitle: 'Guidance Practitioner Profile',
        identityDescription: 'The professional identity and operating path of the Spiritual Consultant.',
        accountLabel: 'Practitioner Identity',
        roleLabel: 'Professional Path',
        workspaceLabel: 'Open Consultant Dashboard',
        workspaceDescription: 'Return to your consultant command center and continue your guidance work.',
        workspacePath: '/dashboard',
        workspaceSymbol: '☿',
        analyticsEyebrow: 'GUIDANCE INTELLIGENCE ENGINE',
        analyticsTitle: 'Reveal Guidance Intelligence',
        analyticsDescription: 'Consult the available Lunara analytics to understand guidance activity, patterns and professional signals.',
        archiveLabel: 'Guidance Intelligence',
        footerTitle: 'THE GUIDANCE ARCHIVES HAVE SPOKEN',
        footerDescription: 'Your practice remains a living manuscript of guidance and reflection.'
      },

      spiritualconsultant: {
        title: 'Spiritual Consultant Profile',
        eyebrow: 'LUNARA • GUIDANCE PRACTITIONER ARCHIVES',
        identityTab: 'Practitioner Identity',
        identityEyebrow: 'PRACTITIONER ARCHIVES',
        identityTitle: 'Guidance Practitioner Profile',
        identityDescription: 'The professional identity and operating path of the Spiritual Consultant.',
        accountLabel: 'Practitioner Identity',
        roleLabel: 'Professional Path',
        workspaceLabel: 'Open Consultant Dashboard',
        workspaceDescription: 'Return to your consultant command center and continue your guidance work.',
        workspacePath: '/dashboard',
        workspaceSymbol: '☿',
        analyticsEyebrow: 'GUIDANCE INTELLIGENCE ENGINE',
        analyticsTitle: 'Reveal Guidance Intelligence',
        analyticsDescription: 'Consult the available Lunara analytics to understand guidance activity, patterns and professional signals.',
        archiveLabel: 'Guidance Intelligence',
        footerTitle: 'THE GUIDANCE ARCHIVES HAVE SPOKEN',
        footerDescription: 'Your practice remains a living manuscript of guidance and reflection.'
      },

      administrator: {
        title: 'Administrator Profile',
        eyebrow: 'LUNARA • SYSTEM ARCHIVES',
        identityTab: 'Administrator Identity',
        identityEyebrow: 'SYSTEM ARCHIVES',
        identityTitle: 'Administrator Profile',
        identityDescription: 'The authenticated identity and system path of the Lunara administrator.',
        accountLabel: 'Administrator Identity',
        roleLabel: 'System Role',
        workspaceLabel: 'Open System Dashboard',
        workspaceDescription: 'Return to the administrator command center and continue platform operations.',
        workspacePath: '/dashboard',
        workspaceSymbol: '✦',
        analyticsEyebrow: 'PLATFORM INTELLIGENCE ENGINE',
        analyticsTitle: 'Reveal Platform Intelligence',
        analyticsDescription: 'Consult the available Lunara analytics and system signals from your administrator workspace.',
        archiveLabel: 'System Intelligence',
        footerTitle: 'THE SYSTEM ARCHIVES HAVE SPOKEN',
        footerDescription: 'The Lunara platform remains a living manuscript of activity and insight.'
      },

      admin: {
        title: 'Administrator Profile',
        eyebrow: 'LUNARA • SYSTEM ARCHIVES',
        identityTab: 'Administrator Identity',
        identityEyebrow: 'SYSTEM ARCHIVES',
        identityTitle: 'Administrator Profile',
        identityDescription: 'The authenticated identity and system path of the Lunara administrator.',
        accountLabel: 'Administrator Identity',
        roleLabel: 'System Role',
        workspaceLabel: 'Open System Dashboard',
        workspaceDescription: 'Return to the administrator command center and continue platform operations.',
        workspacePath: '/dashboard',
        workspaceSymbol: '✦',
        analyticsEyebrow: 'PLATFORM INTELLIGENCE ENGINE',
        analyticsTitle: 'Reveal Platform Intelligence',
        analyticsDescription: 'Consult the available Lunara analytics and system signals from your administrator workspace.',
        archiveLabel: 'System Intelligence',
        footerTitle: 'THE SYSTEM ARCHIVES HAVE SPOKEN',
        footerDescription: 'The Lunara platform remains a living manuscript of activity and insight.'
      }
    };

    return configs[normalized] || configs.user;
  };

  /* -------------------------------------------------------
     Fetch current user profile
     ------------------------------------------------------- */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/auth/me');
        const profile = normalizeProfilePayload(response.data);
        setUserData(profile);
        syncEditorWithProfile(profile);
        setCompassDraft({
          interests: Array.isArray(profile.spiritual_interests) ? profile.spiritual_interests : [],
          goals: profile.spiritual_goals || '',
          preferences: Array.isArray(profile.reading_preferences) ? profile.reading_preferences : [],
        });
        if (typeof onUserUpdated === 'function') onUserUpdated(profile);
      } catch {
        setError(
          'Failed to commune with the archives. Your session may have expired.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    // This request intentionally runs once when the Profile component mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------------------------------------------
     Generate advanced trends
     ------------------------------------------------------- */
  const generateTrends = async () => {
    setLoadingTrends(true);
    setTrendError(null);

    try {
      const response = await api.post('/api/analyze-trends');
      setTrends(response.data);
    } catch (err) {
      setTrendError(
        err.response?.data?.detail ||
          'The Oracle failed to process your data. Please try again.'
      );
    } finally {
      setLoadingTrends(false);
    }
  };

  const saveCompass = async (event) => {
    event.preventDefault();
    setCompassSaving(true);
    setCompassMessage('');
    try {
      const response = await api.put('/api/auth/profile', {
        spiritual_interests: compassDraft.interests,
        spiritual_goals: compassDraft.goals,
        reading_preferences: compassDraft.preferences,
      });
      const profile = normalizeProfilePayload(response.data);
      setUserData((current) => ({ ...current, ...profile }));
      if (typeof onUserUpdated === 'function') onUserUpdated(profile);
      setCompassMessage('Your Personal Compass has been saved.');
    } catch (saveError) {
      setCompassMessage(saveError.response?.data?.detail || 'The Personal Compass could not be saved. Please try again.');
    } finally {
      setCompassSaving(false);
    }
  };

  const profileConfig = getProfileConfig(userData?.role);
  const normalizedRole = String(userData?.role || '')
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ');

  const isPalmAnalystProfile =
    normalizedRole === 'palm analyst' ||
    normalizedRole === 'palmanalyst';

  const isTarotReaderProfile =
    normalizedRole === 'tarot' ||
    normalizedRole === 'tarot reader' ||
    normalizedRole === 'tarotreader';

  const isConsultantProfile = normalizedRole === 'spiritual consultant' || normalizedRole === 'spiritualconsultant' || normalizedRole === 'consultant';
  const isAdministratorProfile = normalizedRole === 'administrator' || normalizedRole === 'admin';

  const profileCompletion = calculateProfileCompletion(userData);

  /* -------------------------------------------------------
     Loading state
     ------------------------------------------------------- */
  if (loading) {
    return (
      <div style={loadingScreenStyle}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={loadingSealStyle}
        >
          ✦
        </motion.div>

        <motion.div
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{
            duration: 1.8,
            repeat: Infinity
          }}
          style={loadingTextStyle}
        >
          READING THE ASTRAL CHARTS...
        </motion.div>

        <div style={loadingLineStyle}>
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={loadingLineGlowStyle}
          />
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     Error state
     ------------------------------------------------------- */
  if (error) {
    return (
      <div style={errorScreenStyle}>
        <div style={errorSealStyle}>!</div>
        <div>{error}</div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      {/* Ambient manuscript particles */}
      <div style={ambientLayerStyle}>
        {Array.from({ length: 14 }).map((_, index) => (
          <motion.span
            key={index}
            animate={{
              y: [0, -18, 0],
              opacity: [0.12, 0.35, 0.12],
              rotate: [0, 90, 180]
            }}
            transition={{
              duration: 4 + index * 0.3,
              repeat: Infinity,
              delay: index * 0.25
            }}
            style={{
              position: 'absolute',
              left: `${(index * 73) % 100}%`,
              top: `${(index * 41) % 100}%`,
              fontSize: index % 2 === 0 ? '12px' : '8px',
              color: '#9c6c44'
            }}
          >
            {index % 3 === 0 ? '✦' : '·'}
          </motion.span>
        ))}
      </div>

      {/* Main manuscript */}
      <div style={mainManuscriptStyle}>
        <CornerDecoration position={{ top: '15px', left: '15px' }} />
        <CornerDecoration position={{ top: '15px', right: '15px', transform: 'rotate(90deg)' }} />
        <CornerDecoration position={{ bottom: '15px', left: '15px', transform: 'rotate(-90deg)' }} />
        <CornerDecoration position={{ bottom: '15px', right: '15px', transform: 'rotate(180deg)' }} />

        {/* Header */}
        <div style={profileHeaderStyle}>
          <motion.div
            animate={{
              rotate: [0, 3, -3, 0]
            }}
            transition={{
              duration: 5,
              repeat: Infinity
            }}
            style={profileSealStyle}
          >
            ✦
          </motion.div>

          <div>
            <div style={headerEyebrowStyle}>{profileConfig.eyebrow}</div>

            <h1 style={profileTitleStyle}>{profileConfig.title}</h1>

            <div style={ornamentLineStyle}>
              <span>◆</span>
              <div />
              <span>✦</span>
              <div />
              <span>◆</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={tabNavigationStyle}>
          <TabButton
            active={activeTab === 'identity'}
            onClick={() => setActiveTab('identity')}
            icon="♙"
            label={profileConfig.identityTab}
          />

          <div style={tabDividerStyle}>✦</div>

          {(normalizedRole === 'user' || normalizedRole === 'seeker') && (
            <>
              <TabButton
                active={activeTab === 'compass'}
                onClick={() => setActiveTab('compass')}
                icon="☾"
                label="Personal Compass"
              />
              <div style={tabDividerStyle}>✦</div>
            </>
          )}

          <TabButton
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
            icon="◈"
            label={
              isTarotReaderProfile
                ? 'Reader Intelligence'
                : isPalmAnalystProfile
                  ? 'Palm Intelligence'
                  : 'Advanced Dashboard'
            }
          />
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'compass' && (
            <motion.div
              key="compass"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.4 }}
              style={cardContainerStyle}
            >
                <SectionHeading eyebrow="ARCHIVE II • PERSONALIZATION" title="Your Personal Compass" description="Save the themes and intentions that should guide future readings and recommendations. Insights are for reflection and do not replace professional advice." />
              <form onSubmit={saveCompass} style={{ display: 'grid', gap: '22px' }}>
                <CompassChoices title="Spiritual interests" helper="Choose the themes you want Lunara to keep in view." options={['Personality', 'Relationships', 'Career', 'Finance', 'Wellness', 'Personal Growth', 'Life Opportunities', 'Mindfulness']} value={compassDraft.interests} onChange={(value) => setCompassDraft((current) => ({ ...current, interests: value }))} />
                <CompassChoices title="Reading preferences" helper="Select the reading styles you enjoy." options={['Palmistry', 'Tarot', 'Concise guidance', 'Detailed interpretations', 'Practical actions', 'Reflective prompts']} value={compassDraft.preferences} onChange={(value) => setCompassDraft((current) => ({ ...current, preferences: value }))} />
                <label style={{ display: 'grid', gap: '8px', color: '#5c3a21', fontWeight: 700 }}>
                  Spiritual goals and intentions
                  <textarea maxLength={2000} rows={5} value={compassDraft.goals} onChange={(event) => setCompassDraft((current) => ({ ...current, goals: event.target.value }))} placeholder="What would you like to reflect on or cultivate?" style={{ width: '100%', resize: 'vertical', padding: '13px 15px', border: '1px solid #9c6c44', borderRadius: '10px', color: '#3a1c0d', background: 'rgba(255,244,211,.72)', font: 'inherit' }} />
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <button type="submit" disabled={compassSaving} style={{ border: '1px solid #6b3518', borderRadius: '8px', padding: '11px 22px', color: '#fff1c4', background: 'linear-gradient(135deg,#6b3518,#9c5d20)', font: 'inherit', fontWeight: 700, cursor: compassSaving ? 'wait' : 'pointer' }}>{compassSaving ? 'Saving…' : 'Save Personal Compass'}</button>
                  {compassMessage && <span role="status" style={{ color: '#5c3a21' }}>{compassMessage}</span>}
                </div>
              </form>
            </motion.div>
          )}
          {/* =================================================
              IDENTITY TAB
             ================================================= */}
          {activeTab === 'identity' && (
            <motion.div
              key="identity"
              initial={{
                opacity: 0,
                y: 18,
                filter: 'blur(5px)'
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter: 'blur(0px)'
              }}
              exit={{
                opacity: 0,
                y: -18,
                filter: 'blur(5px)'
              }}
              transition={{ duration: 0.45 }}
              style={cardContainerStyle}
            >
              <div style={scanLineStyle} />

              <SectionHeading
                eyebrow="ARCHIVE I"
                title={profileConfig.identityTitle}
                description={profileConfig.identityDescription}
              />

              <ModernProfileIdentityCard
                userData={userData}
                displayName={getProfileDisplayName(userData)}
                initials={getProfileInitials(userData)}
                age={calculateAge(userData?.date_of_birth)}
                isEditing={isEditingProfile}
                editProfile={editProfile}
                saving={savingProfile}
                saveError={profileSaveError}
                saveSuccess={profileSaveSuccess}
                onEdit={handleOpenEditProfile}
                onCancel={handleCancelEditProfile}
                onChange={handleEditFieldChange}
                onImageChange={handleProfileImageChange}
                onSave={handleSaveProfile}
                onLogout={handleLogoutFromProfile}
                onDelete={() => {
                  setDeleteError('');
                  setDeletePassword('');
                  setShowDeleteAccount(true);
                }}
              />

              {showDeleteAccount && (
                <AccountDeletionModal
                  password={deletePassword}
                  error={deleteError}
                  deleting={deletingAccount}
                  onPasswordChange={(event) => {
                    setDeletePassword(event.target.value);
                    setDeleteError('');
                  }}
                  onCancel={() => {
                    if (!deletingAccount) {
                      setShowDeleteAccount(false);
                      setDeletePassword('');
                      setDeleteError('');
                    }
                  }}
                  onConfirm={handleDeleteAccount}
                />
              )}

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08 }}
                className="lunara-role-command-card"
                style={roleCommandCardStyle}
              >
                <div
                  className="lunara-role-command-seal"
                  style={roleCommandSealStyle}
                >
                  <motion.span
                    animate={{
                      rotate: [0, 8, -8, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity
                    }}
                  >
                    {profileConfig.workspaceSymbol}
                  </motion.span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={roleCommandEyebrowStyle}>
                    CURRENT LUNARA PATH
                  </div>

                  <h3 style={roleCommandTitleStyle}>
                    {profileConfig.title.replace(' Profile', '')}
                  </h3>

                  <p style={roleCommandDescriptionStyle}>
                    {profileConfig.workspaceDescription}
                  </p>
                </div>

                <Link
                  to={profileConfig.workspacePath}
                  style={roleCommandLinkStyle}
                >
                  <span>{profileConfig.workspaceLabel}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </motion.div>

              <div className="lunara-profile-status-grid" style={profileStatusGridStyle}>
                <ProfileStatusTile
                  icon="✦"
                  label="Profile Completeness"
                  value={`${profileCompletion}%`}
                  detail={profileCompletion === 100 ? 'Core identity is complete' : 'Add a profile picture to complete the archive'}
                  tone={profileCompletion === 100 ? 'success' : 'warm'}
                />

                <ProfileStatusTile
                  icon="✓"
                  label="Identity Record"
                  value={userData?.email ? 'READY' : 'INCOMPLETE'}
                  detail={userData?.email ? 'Authenticated account record is available' : 'Email identity needs attention'}
                  tone={userData?.email ? 'success' : 'danger'}
                />

                <ProfileStatusTile
                  icon="◆"
                  label="Account Security"
                  value="PROTECTED"
                  detail="Password required for permanent account deletion"
                  tone="secure"
                />
              </div>

              <div style={identityFooterStyle}>
                <motion.span
                  animate={{ opacity: [0.45, 1, 0.45] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity
                  }}
                >
                  ✦
                </motion.span>

                <span>
                  Your identity archive is synchronized with the Lunara system.
                </span>

                <motion.span
                  animate={{ opacity: [1, 0.45, 1] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity
                  }}
                >
                  ✦
                </motion.span>
              </div>
            </motion.div>
          )}

          {/* =================================================
              ADVANCED DASHBOARD TAB
             ================================================= */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{
                opacity: 0,
                y: 18,
                filter: 'blur(5px)'
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter: 'blur(0px)'
              }}
              exit={{
                opacity: 0,
                y: -18,
                filter: 'blur(5px)'
              }}
              transition={{ duration: 0.45 }}
            >
              {isTarotReaderProfile ? (
                <TarotReaderProfileIntelligence />
              ) : isPalmAnalystProfile ? (
                <PalmAnalystProfileIntelligence />
              ) : isAdministratorProfile ? (
                <AdministratorProfileIntelligence />
              ) : isConsultantProfile ? (
                <ConsultantProfileIntelligence />
              ) : !trends ? (
                /* ---------------------------------------------
                   ANALYTICS START SCREEN
                   --------------------------------------------- */
                <div
                  style={{
                    ...cardContainerStyle,
                    textAlign: 'center',
                    padding: '65px 25px',
                    overflow: 'hidden'
                  }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.06, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                    style={oracleCircleStyle}
                  >
                    <div style={oracleInnerCircleStyle}>
                      ✦
                    </div>
                  </motion.div>

                  <div style={oracleEyebrowStyle}>
                    ORACLE ANALYSIS ENGINE
                  </div>

                  <h2 style={oracleTitleStyle}>
                    Reveal Your Trajectory
                  </h2>

                  <p style={oracleDescriptionStyle}>
                    Consult the archives to generate your biometric and
                    spiritual trajectory.
                  </p>

                  <div style={oracleDividerStyle}>
                    <span>◆</span>
                    <div />
                    <span>✦</span>
                    <div />
                    <span>◆</span>
                  </div>

                  <motion.button
                    onClick={generateTrends}
                    disabled={loadingTrends}
                    onMouseEnter={() => setIsButtonHovered(true)}
                    onMouseLeave={() => setIsButtonHovered(false)}
                    whileHover={!loadingTrends ? { scale: 1.035, y: -2 } : {}}
                    whileTap={!loadingTrends ? { scale: 0.97 } : {}}
                    style={{
                      ...actionButtonStyle,
                      opacity: loadingTrends ? 0.7 : 1,
                      boxShadow: isButtonHovered
                        ? '0 8px 30px rgba(92,58,33,0.35), 0 0 22px rgba(212,184,149,0.5)'
                        : actionButtonStyle.boxShadow
                    }}
                  >
                    <span style={{ position: 'relative', zIndex: 2 }}>
                      {loadingTrends
                        ? 'Processing Core Data...'
                        : 'Run Advanced Analytics'}
                    </span>

                    {!loadingTrends && (
                      <motion.span
                        animate={{ x: ['-120%', '220%'] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                        style={buttonLightStyle}
                      />
                    )}
                  </motion.button>

                  {loadingTrends && (
                    <div style={processingStatusStyle}>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'linear'
                        }}
                      >
                        ◌
                      </motion.span>

                      <span>
                        Decoding historical signals...
                      </span>
                    </div>
                  )}

                  {trendError && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={trendErrorStyle}
                    >
                      <strong>ORACLE ERROR</strong>
                      <span>{trendError}</span>
                    </motion.div>
                  )}
                </div>
              ) : (
                /* ---------------------------------------------
                   GENERATED ANALYTICS
                   --------------------------------------------- */
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '25px'
                  }}
                >
                  {/* Header Overview */}
                  <div style={overviewGridStyle}>
                    <motion.div
                      whileHover={{
                        y: -4,
                        boxShadow: '0 12px 30px rgba(44,26,15,0.18)'
                      }}
                      style={{
                        ...innerCardStyle,
                        flex: 2,
                        minWidth: '300px',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <div style={cardGlowLineStyle} />

                      <div style={miniLabelStyle}>
                        ARCHIVE READING
                      </div>

                      <h3 style={sectionTitle}>
                        Life Path
                      </h3>

                      <p
                        style={{
                          fontSize: '1.1rem',
                          lineHeight: '1.75',
                          fontStyle: 'italic',
                          margin: 0,
                          color: '#4c3020'
                        }}
                      >
                        {trends.LifePath}
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{
                        y: -4,
                        boxShadow: '0 12px 30px rgba(44,26,15,0.18)'
                      }}
                      style={{
                        ...innerCardStyle,
                        flex: 1,
                        minWidth: '220px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <div style={miniLabelStyle}>
                        POTENTIAL INDEX
                      </div>

                      <h3 style={sectionTitle}>
                        Growth Potential
                      </h3>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.8,
                          delay: 0.3
                        }}
                        style={growthNumberStyle}
                      >
                        {trends.GrowthPotential}%
                      </motion.div>

                      <div style={growthTrackStyle}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${trends.GrowthPotential}%`
                          }}
                          transition={{
                            duration: 1.5,
                            delay: 0.4
                          }}
                          style={growthFillStyle}
                        />
                      </div>
                    </motion.div>
                  </div>

                  {/* Current Trends */}
                  <div style={trendsSectionStyle}>
                    <SectionHeading
                      eyebrow="ARCHIVE II"
                      title="Current Trends"
                      description="Signals currently influencing your trajectory."
                    />

                    <div style={trendGridStyle}>
                      {trends.DetailedTrends.map((trend, idx) => (
                        <motion.div
                          key={idx}
                          initial={{
                            opacity: 0,
                            y: 20
                          }}
                          animate={{
                            opacity: 1,
                            y: 0
                          }}
                          transition={{
                            duration: 0.45,
                            delay: idx * 0.08
                          }}
                          whileHover={{
                            y: -5,
                            scale: 1.008
                          }}
                          onMouseEnter={() => setHoveredTrend(idx)}
                          onMouseLeave={() => setHoveredTrend(null)}
                          style={{
                            ...innerCardStyle,
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow:
                              hoveredTrend === idx
                                ? '0 12px 28px rgba(44,26,15,0.2)'
                                : innerCardStyle.boxShadow
                          }}
                        >
                          <motion.div
                            animate={{
                              opacity:
                                hoveredTrend === idx ? 1 : 0
                            }}
                            style={trendHoverGlowStyle}
                          />

                          <div style={trendHeaderStyle}>
                            <div>
                              <div style={trendIndexStyle}>
                                0{idx + 1}
                              </div>

                              <h4 style={trendTitleStyle}>
                                {trend.category}
                              </h4>
                            </div>

                            <StatusBadge status={trend.status} />
                          </div>

                          <ProgressBar
                            label="Score"
                            value={trend.score}
                            color="#5c3a21"
                          />

                          <ProgressBar
                            label="Strength"
                            value={trend.strength}
                            color="#8b0000"
                          />

                          <ProgressBar
                            label="Confidence"
                            value={trend.confidence}
                            color="#9c6c44"
                          />

                          <div style={trendSummaryStyle}>
                            {trend.summary}
                          </div>

                          <div style={signalStyle}>
                            <span>◈</span>
                            Based on {trend.signals} historical signals.
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Measured Biometrics */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      ...innerCardStyle,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={cardGlowLineStyle} />

                    <div style={biometricHeaderStyle}>
                      <div>
                        <div style={miniLabelStyle}>
                          ARCHIVE III
                        </div>

                        <h3 style={biometricTitleStyle}>
                          Measured Biometrics
                        </h3>

                        <p style={biometricDescriptionStyle}>
                          Topological mapping derived from visual scans
                        </p>
                      </div>

                      <motion.span
                        animate={{
                          boxShadow: [
                            '0 0 0 rgba(156,108,68,0)',
                            '0 0 12px rgba(156,108,68,0.35)',
                            '0 0 0 rgba(156,108,68,0)'
                          ]
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity
                        }}
                        style={scanDataBadgeStyle}
                      >
                        ✦ SCAN DATA
                      </motion.span>
                    </div>

                    <div style={biometricGridStyle}>
                      <div>
                        <h4 style={subHeaderStyle}>
                          Line Detection Confidence
                        </h4>

                        {trends.Biometrics.lines.map((line, idx) => (
                          <ProgressBar
                            key={idx}
                            label={line.name}
                            value={line.value}
                            gradient="linear-gradient(90deg, #5c3a21, #9c6c44, #d4b895)"
                          />
                        ))}
                      </div>

                      <div>
                        <h4 style={subHeaderStyle}>
                          Mount Prominence Score
                        </h4>

                        {trends.Biometrics.mounts.map((mount, idx) => (
                          <ProgressBar
                            key={idx}
                            label={mount.name}
                            value={mount.value}
                            gradient="linear-gradient(90deg, #8b0000, #5c3a21, #9c6c44)"
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Radar Chart */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.55 }}
                    style={{
                      ...innerCardStyle,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={radarDecorationStyle}>
                      <span>✦</span>
                      <span>◆</span>
                      <span>✦</span>
                    </div>

                    <div style={miniLabelStyle}>
                      ARCHIVE IV • ENERGY MAPPING
                    </div>

                    <h3 style={radarTitleStyle}>
                      Energy Distribution: Past vs Present
                    </h3>

                    <div style={radarLineStyle} />

                    <div
                      style={{
                        height: '350px',
                        width: '100%'
                      }}
                    >
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <RadarChart
                          cx="50%"
                          cy="50%"
                          outerRadius="70%"
                          data={trends.CategoryScores}
                        >
                          <PolarGrid
                            stroke="#9c6c44"
                            strokeOpacity={0.55}
                          />

                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{
                              fill: '#3e2723',
                              fontWeight: 'bold',
                              fontSize: 13
                            }}
                          />

                          <PolarRadiusAxis
                            angle={30}
                            domain={[0, 10]}
                            tick={false}
                            axisLine={false}
                          />

                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#e8d5b5',
                              border: '2px solid #5c3a21',
                              borderRadius: '6px',
                              fontFamily: 'serif',
                              color: '#2c1a0f',
                              boxShadow:
                                '0 8px 25px rgba(44,26,15,0.2)'
                            }}
                          />

                          <Legend
                            wrapperStyle={{
                              paddingTop: '10px',
                              fontFamily: 'serif'
                            }}
                          />

                          <Radar
                            name="Past Energy"
                            dataKey="past"
                            stroke="#8b0000"
                            fill="#8b0000"
                            fillOpacity={0.25}
                            strokeWidth={2}
                          />

                          <Radar
                            name="Present Path"
                            dataKey="present"
                            stroke="#5c3a21"
                            fill="#5c3a21"
                            fillOpacity={0.55}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    <div style={chartFooterStyle}>
                      <span>PAST</span>
                      <div />
                      <span>THE PRESENT PATH</span>
                    </div>
                  </motion.div>

                  {/* Closing statement */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 1,
                      delay: 0.5
                    }}
                    style={closingArchiveStyle}
                  >
                    <span>✦</span>

                    <div>
                      <strong>THE ARCHIVES HAVE SPOKEN</strong>
                      <small>
                        Your trajectory remains a living manuscript.
                      </small>
                    </div>

                    <span>✦</span>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 760px) {
          .lunara-role-command-card {
            flex-direction: column !important;
            align-items: stretch !important;
            text-align: center !important;
          }

          .lunara-role-command-seal {
            margin: 0 auto !important;
          }

          .lunara-profile-manuscript {
            margin: 20px 10px !important;
            padding: 22px 16px !important;
          }

          .lunara-profile-title {
            font-size: 1.8rem !important;
          }

          .lunara-profile-tabs {
            gap: 8px !important;
          }

          .lunara-profile-tab {
            font-size: 0.78rem !important;
            padding: 9px 8px !important;
          }

          .lunara-role-command-card {
            padding: 16px !important;
          }

          .lunara-role-command-card a {
            width: 100%;
            box-sizing: border-box;
          }

          .lunara-profile-overview {
            flex-direction: column !important;
          }

          .lunara-profile-biometrics {
            grid-template-columns: 1fr !important;
          }

          .lunara-profile-trends {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 760px) {
          .lunara-modern-profile-card {
            padding: 18px !important;
          }

          .lunara-modern-profile-top {
            align-items: flex-start !important;
          }

          .lunara-modern-profile-card button {
            max-width: 100%;
          }

          .lunara-modern-profile-card .lunara-modern-profile-top {
            gap: 16px !important;
          }

          .lunara-modern-profile-card .lunara-modern-profile-top > div:nth-child(2) {
            min-width: 180px !important;
          }

          .lunara-modern-profile-card .lunara-modern-profile-top > button {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 620px) {
          .lunara-modern-profile-card {
            padding: 15px !important;
          }

          .lunara-modern-profile-card .lunara-modern-profile-top {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
          }

          .lunara-modern-profile-card .lunara-modern-profile-top > div:nth-child(2) {
            width: 100%;
          }

          .lunara-modern-profile-card .lunara-modern-profile-top > div:nth-child(2) > div {
            justify-content: center !important;
          }
        }

        @media (max-width: 480px) {
          .lunara-profile-manuscript {
            padding: 18px 12px !important;
          }

          .lunara-profile-header {
            flex-direction: column !important;
            text-align: center !important;
          }

          .lunara-profile-tab-divider {
            display: none !important;
          }

          .lunara-profile-tabs {
            flex-direction: column !important;
          }

          .lunara-profile-tab {
            width: 100% !important;
          }

          .lunara-modern-profile-card {
            padding: 14px !important;
          }

          .lunara-modern-profile-card .lunara-profile-status-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

/* =========================================================
   Supporting Components
   ========================================================= */

const ModernProfileIdentityCard = ({
  userData,
  displayName,
  initials,
  age,
  isEditing,
  editProfile,
  saving,
  saveError,
  saveSuccess,
  onEdit,
  onCancel,
  onChange,
  onImageChange,
  onSave,
  onLogout,
  onDelete
}) => {
  const profileImage = userData?.profile_image || editProfile?.profile_image;
  const roleText = userData?.role || 'Seeker';
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="lunara-modern-profile-card" style={modernProfileCardStyle}>
      <div style={modernProfileGlowStyle} />
      <div className="lunara-modern-profile-top" style={modernProfileTopStyle}>
        <div style={modernAvatarColumnStyle}>
          <div style={modernAvatarStyle}>
            {profileImage ? <img src={profileImage} alt={`${displayName} profile`} style={modernAvatarImageStyle} /> : <span>{initials}</span>}
          </div>
          {isEditing && <label style={avatarUploadButtonStyle}><span>Change Picture</span><input type="file" accept="image/*" onChange={onImageChange} style={{ display: 'none' }} /></label>}
        </div>
        <div style={modernIdentityHeroStyle}>
          <div style={modernIdentityEyebrowStyle}>AUTHENTICATED LUNARA IDENTITY</div>
          <h2 style={modernIdentityNameStyle}>Welcome back, {displayName}</h2>
          <p style={modernIdentitySubtitleStyle}>Your profile, security controls and personal identity are managed here.</p>
          <div style={modernBadgeRowStyle}><span style={modernRoleBadgeStyle}>✦ {roleText}</span><span style={modernStatusBadgeStyle}>● Account Active</span></div>
        </div>
        {!isEditing && <button type="button" onClick={onEdit} style={modernEditButtonStyle}><span>✎</span>Edit Profile</button>}
      </div>
      {isEditing ? (
        <div style={modernEditPanelStyle}>
          <div style={modernEditGridStyle}>
            <ProfileField label="First Name" name="first_name" value={editProfile.first_name} onChange={onChange} placeholder="Your first name" />
            <ProfileField label="Last Name" name="last_name" value={editProfile.last_name} onChange={onChange} placeholder="Your last name" />
            <ProfileField label="Nickname" name="nickname" value={editProfile.nickname} onChange={onChange} placeholder="What you want to be called" />
            <ProfileField label="Date of Birth" name="date_of_birth" type="date" value={editProfile.date_of_birth} onChange={onChange} />
            <ProfileField label="Age" value={calculateStandaloneAge(editProfile.date_of_birth) ?? '—'} readOnly helper="Calculated automatically from date of birth" />
            <ProfileField label="Gender" name="gender" value={editProfile.gender} onChange={onChange} select options={['', 'Male', 'Female', 'Non-binary', 'Prefer not to say']} />
          </div>
          {saveError && <div style={profileMessageErrorStyle}>{saveError}</div>}
          {saveSuccess && <div style={profileMessageSuccessStyle}>{saveSuccess}</div>}
          <div style={modernEditActionsStyle}>
            <button type="button" onClick={onCancel} style={secondaryProfileButtonStyle} disabled={saving}>Cancel</button>
            <button type="button" onClick={onSave} style={primaryProfileButtonStyle} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>
      ) : (
        <div style={modernDetailsGridStyle}>
          <ProfileDetail label="First Name" value={userData?.first_name || 'Not provided'} />
          <ProfileDetail label="Last Name" value={userData?.last_name || 'Not provided'} />
          <ProfileDetail label="Nickname" value={userData?.nickname || displayName} />
          <ProfileDetail label="Email" value={userData?.email || 'Not provided'} />
          <ProfileDetail label="Date of Birth" value={formatStandaloneDate(userData?.date_of_birth)} />
          <ProfileDetail label="Age" value={age === null ? 'Not provided' : `${age} years`} />
          <ProfileDetail label="Gender" value={userData?.gender || 'Not provided'} />
          <ProfileDetail label="Account Created" value={formatStandaloneDate(userData?.created_at)} />
        </div>
      )}
      <div style={modernSecurityBarStyle}>
        <div><strong style={modernSecurityTitleStyle}>Account & Security</strong><span style={modernSecurityDescriptionStyle}>Logout is available here. Permanent deletion removes your account from Lunara and requires your password.</span></div>
        <div style={modernSecurityActionsStyle}><button type="button" onClick={onLogout} style={logoutProfileButtonStyle}>Sign Out</button><button type="button" onClick={onDelete} style={deleteProfileButtonStyle}>Delete Account</button></div>
      </div>
    </motion.div>
  );
};

const CompassChoices = ({ title, helper, options, value, onChange }) => (
  <fieldset style={{ margin: 0, padding: '18px', border: '1px solid rgba(107,53,24,.4)', borderRadius: '10px', background: 'rgba(255,244,211,.34)' }}>
    <legend style={{ padding: '0 8px', color: '#5c3a21', fontWeight: 700 }}>{title}</legend>
    <p style={{ margin: '0 0 12px', color: '#76502d', fontSize: '.9rem' }}>{helper}</p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px' }}>
      {options.map((option) => {
        const selected = value.includes(option);
        return <label key={option} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '8px 11px', border: `1px solid ${selected ? '#6b3518' : '#b7946c'}`, borderRadius: '20px', color: '#4a2412', background: selected ? 'rgba(229,189,91,.48)' : 'rgba(255,249,230,.55)', cursor: 'pointer' }}><input type="checkbox" checked={selected} onChange={() => onChange(selected ? value.filter((item) => item !== option) : [...value, option])} />{option}</label>;
      })}
    </div>
  </fieldset>
);

const ProfileField = ({ label, name, value, onChange, placeholder, type = 'text', readOnly = false, helper, select = false, options = [] }) => (
  <label style={profileFieldLabelStyle}>
    <span style={profileFieldCaptionStyle}>{label}</span>
    {select ? <select name={name} value={value} onChange={onChange} style={profileInputStyle}>{options.map((option) => <option key={option} value={option}>{option || 'Select gender'}</option>)}</select> : <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly} style={{ ...profileInputStyle, opacity: readOnly ? 0.75 : 1, cursor: readOnly ? 'not-allowed' : 'text' }} />}
    {helper && <span style={profileFieldHelperStyle}>{helper}</span>}
  </label>
);

const ProfileDetail = ({ label, value }) => <div style={profileDetailStyle}><span style={profileDetailLabelStyle}>{label}</span><strong style={profileDetailValueStyle}>{value}</strong></div>;

const AccountDeletionModal = ({ password, error, deleting, onPasswordChange, onCancel, onConfirm }) => (
  <div style={accountModalBackdropStyle} role="presentation">
    <motion.div initial={{ opacity: 0, scale: 0.94, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} style={accountModalStyle} role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
      <div style={accountModalSealStyle}>!</div>
      <div style={miniLabelStyle}>SECURITY CHAMBER</div>
      <h3 id="delete-account-title" style={accountModalTitleStyle}>Permanently Delete Account?</h3>
      <p style={accountModalTextStyle}>This action removes your Lunara account and stored reading records. It cannot be undone.</p>
      <label style={profileFieldLabelStyle}><span style={profileFieldCaptionStyle}>Confirm Password</span><input type="password" value={password} onChange={onPasswordChange} placeholder="Enter your current password" autoComplete="current-password" style={profileInputStyle} disabled={deleting} /></label>
      {error && <div style={profileMessageErrorStyle}>{error}</div>}
      <div style={modernEditActionsStyle}><button type="button" onClick={onCancel} style={secondaryProfileButtonStyle} disabled={deleting}>Keep Account</button><button type="button" onClick={onConfirm} style={dangerConfirmButtonStyle} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete Permanently'}</button></div>
    </motion.div>
  </div>
);

const calculateStandaloneAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) age -= 1;
  return age >= 0 ? age : null;
};

const calculateProfileCompletion = (profile) => {
  const requiredFields = [
    profile?.first_name,
    profile?.last_name,
    profile?.nickname,
    profile?.date_of_birth,
    profile?.email
  ];

  const completed = requiredFields.filter(
    (value) => String(value || '').trim().length > 0
  ).length;

  const hasPicture = Boolean(profile?.profile_image);
  return Math.round(((completed + (hasPicture ? 1 : 0)) / 6) * 100);
};

const formatStandaloneDate = (value) => {
  if (!value) return 'Not provided';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Not provided';
  return parsed.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};

const TabButton = ({ active, onClick, icon, label }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.97 }}
    className="lunara-profile-tab"
    style={{
      ...tabStyle,
      color: active ? '#2c1a0f' : '#765037',
      borderBottom: active
        ? '3px solid #5c3a21'
        : '3px solid transparent',
      opacity: active ? 1 : 0.65,
      background: active
        ? 'linear-gradient(180deg, rgba(212,184,149,0.2), transparent)'
        : 'transparent'
    }}
  >
    <span
      style={{
        marginRight: '7px',
        color: active ? '#8b0000' : '#9c6c44'
      }}
    >
      {icon}
    </span>

    {label}

    {active && (
      <motion.span
        layoutId="profileTabMarker"
        style={{
          position: 'absolute',
          bottom: '-3px',
          left: '50%',
          width: '7px',
          height: '7px',
          transform: 'translateX(-50%) rotate(45deg)',
          background: '#5c3a21',
          border: '1px solid #e8d5b5'
        }}
      />
    )}
  </motion.button>
);

const ProfileStatusTile = ({
  icon,
  label,
  value,
  detail,
  tone = 'warm'
}) => {
  const toneMap = {
    success: {
      color: '#166534',
      background: 'rgba(22,101,52,0.06)',
      border: 'rgba(22,101,52,0.25)'
    },
    warm: {
      color: '#8b0000',
      background: 'rgba(139,0,0,0.045)',
      border: 'rgba(139,0,0,0.22)'
    },
    danger: {
      color: '#8b0000',
      background: 'rgba(139,0,0,0.06)',
      border: 'rgba(139,0,0,0.28)'
    },
    secure: {
      color: '#5c3a21',
      background: 'rgba(92,58,33,0.055)',
      border: 'rgba(92,58,33,0.22)'
    }
  };

  const palette = toneMap[tone] || toneMap.warm;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      style={{
        ...identityRowStyle,
        background: palette.background,
        borderColor: palette.border
      }}
    >
      <div
        style={{
          ...identityIconStyle,
          width: '31px',
          height: '31px',
          minWidth: '31px',
          fontSize: '.78rem',
          color: palette.color,
          borderColor: palette.border
        }}
      >
        {icon}
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <span style={{ ...dataLabelStyle, fontSize: '.57rem', marginBottom: '2px' }}>{label}</span>
        <strong style={{ ...profileStatusValueStyle, color: palette.color }}>
          {value}
        </strong>
        <span style={profileStatusDetailStyle}>{detail}</span>
      </div>
    </motion.div>
  );
};

/* =========================================================
   MODERN ACCOUNT PROFILE STYLES
   ========================================================= */
const modernProfileCardStyle={position:'relative',marginBottom:'25px',padding:'24px',background:'linear-gradient(145deg, rgba(255,250,235,0.92), rgba(232,213,181,0.68))',border:'1px solid rgba(156,108,68,0.68)',borderRadius:'10px',boxShadow:'0 14px 34px rgba(44,26,15,0.13), inset 0 1px rgba(255,255,255,.45)',overflow:'hidden'};
const modernProfileGlowStyle={position:'absolute',top:0,left:'12%',right:'12%',height:'2px',background:'linear-gradient(90deg, transparent, #8b0000, #d4b895, transparent)',opacity:.75};
const modernProfileTopStyle={position:'relative',display:'flex',alignItems:'center',gap:'22px',flexWrap:'wrap'};
const modernAvatarColumnStyle={display:'flex',flexDirection:'column',alignItems:'center',gap:'9px'};
const modernAvatarStyle={width:'92px',height:'92px',minWidth:'92px',borderRadius:'50%',border:'2px solid #5c3a21',background:'radial-gradient(circle, #f4e8c1 0%, #d4b895 100%)',display:'flex',alignItems:'center',justifyContent:'center',color:'#8b0000',fontSize:'1.55rem',fontWeight:'bold',letterSpacing:'1px',boxShadow:'0 0 0 5px rgba(156,108,68,0.1), 0 7px 20px rgba(44,26,15,0.16)',overflow:'hidden'};
const modernAvatarImageStyle={width:'100%',height:'100%',objectFit:'cover',display:'block'};
const avatarUploadButtonStyle={color:'#5c3a21',fontSize:'.66rem',fontWeight:'bold',letterSpacing:'.7px',textTransform:'uppercase',cursor:'pointer',border:'1px solid #9c6c44',padding:'6px 8px',borderRadius:'4px',background:'rgba(255,248,224,.7)'};
const modernIdentityHeroStyle={flex:1,minWidth:'230px'};
const modernIdentityEyebrowStyle={color:'#9c6c44',fontSize:'.62rem',fontWeight:'bold',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'5px'};
const modernIdentityNameStyle={margin:0,color:'#2c1a0f',fontSize:'1.75rem',lineHeight:1.2,letterSpacing:'.5px'};
const modernIdentitySubtitleStyle={margin:'7px 0 12px',color:'#6f4a2d',fontSize:'.84rem',lineHeight:1.5};
const modernBadgeRowStyle={display:'flex',gap:'8px',flexWrap:'wrap'};
const modernRoleBadgeStyle={display:'inline-flex',alignItems:'center',gap:'5px',padding:'6px 10px',borderRadius:'20px',background:'rgba(139,0,0,.08)',color:'#8b0000',border:'1px solid rgba(139,0,0,.38)',fontSize:'.68rem',fontWeight:'bold',letterSpacing:'.6px'};
const modernStatusBadgeStyle={display:'inline-flex',alignItems:'center',gap:'5px',padding:'6px 10px',borderRadius:'20px',background:'rgba(22,101,52,.08)',color:'#166534',border:'1px solid rgba(22,101,52,.3)',fontSize:'.68rem',fontWeight:'bold'};
const modernEditButtonStyle={display:'inline-flex',alignItems:'center',gap:'7px',padding:'10px 14px',color:'#f4e8c1',background:'linear-gradient(135deg,#2c1a0f,#5c3a21)',border:'1px solid #9c6c44',borderRadius:'4px',cursor:'pointer',fontWeight:'bold',fontSize:'.7rem',letterSpacing:'.8px',textTransform:'uppercase',boxShadow:'0 5px 14px rgba(44,26,15,.18)'};
const modernDetailsGridStyle={position:'relative',marginTop:'22px',display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:'10px'};
const profileDetailStyle={minWidth:0,minHeight:'64px',display:'flex',flexDirection:'column',justifyContent:'center',padding:'12px 13px',border:'1px solid rgba(156,108,68,.3)',borderRadius:'6px',background:'rgba(255,248,224,.46)',boxShadow:'inset 0 1px rgba(255,255,255,.35)'};
const profileDetailLabelStyle={display:'block',color:'#9c6c44',fontSize:'.62rem',fontWeight:'bold',letterSpacing:'1.2px',textTransform:'uppercase',marginBottom:'5px'};
const profileDetailValueStyle={display:'block',color:'#2c1a0f',fontSize:'.92rem',fontWeight:'normal',wordBreak:'break-word'};
const modernEditPanelStyle={marginTop:'24px',padding:'18px',borderTop:'1px dashed rgba(156,108,68,.5)',borderBottom:'1px dashed rgba(156,108,68,.5)',background:'rgba(255,248,224,.34)'};
const modernEditGridStyle={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:'15px'};
const profileFieldLabelStyle={display:'flex',flexDirection:'column',gap:'6px',color:'#3e2723'};
const profileFieldCaptionStyle={color:'#5c3a21',fontSize:'.68rem',fontWeight:'bold',letterSpacing:'1px',textTransform:'uppercase'};
const profileFieldHelperStyle={color:'#806044',fontSize:'.65rem',fontStyle:'italic'};
const profileInputStyle={width:'100%',boxSizing:'border-box',padding:'10px 11px',border:'1px solid rgba(92,58,33,.5)',borderRadius:'4px',background:'rgba(255,252,239,.82)',color:'#2c1a0f',fontFamily:'serif',fontSize:'.9rem',outline:'none'};
const modernEditActionsStyle={display:'flex',justifyContent:'flex-end',gap:'9px',flexWrap:'wrap',marginTop:'17px'};
const primaryProfileButtonStyle={padding:'10px 16px',border:'1px solid #5c3a21',borderRadius:'4px',background:'linear-gradient(135deg,#2c1a0f,#5c3a21)',color:'#f4e8c1',fontWeight:'bold',fontFamily:'serif',cursor:'pointer'};
const secondaryProfileButtonStyle={padding:'10px 16px',border:'1px solid #9c6c44',borderRadius:'4px',background:'rgba(255,248,224,.75)',color:'#5c3a21',fontWeight:'bold',fontFamily:'serif',cursor:'pointer'};
const profileMessageErrorStyle={marginTop:'14px',padding:'10px 12px',border:'1px solid rgba(139,0,0,.5)',borderRadius:'4px',background:'rgba(139,0,0,.07)',color:'#8b0000',fontSize:'.78rem',fontWeight:'bold'};
const profileMessageSuccessStyle={marginTop:'14px',padding:'10px 12px',border:'1px solid rgba(22,101,52,.45)',borderRadius:'4px',background:'rgba(22,101,52,.07)',color:'#166534',fontSize:'.78rem',fontWeight:'bold'};
const modernSecurityBarStyle={position:'relative',marginTop:'22px',paddingTop:'17px',borderTop:'1px solid rgba(156,108,68,.35)',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'15px',flexWrap:'wrap'};
const modernSecurityTitleStyle={display:'block',color:'#3e2723',fontSize:'.8rem',textTransform:'uppercase',letterSpacing:'1px'};
const modernSecurityDescriptionStyle={display:'block',marginTop:'4px',color:'#806044',fontSize:'.7rem',lineHeight:1.45,maxWidth:'620px'};
const modernSecurityActionsStyle={display:'flex',gap:'8px',flexWrap:'wrap'};
const profileStatusGridStyle={position:'relative',marginTop:'18px',display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:'10px'};
const profileStatusValueStyle={display:'block',fontSize:'.82rem',letterSpacing:'.7px',fontWeight:'bold',lineHeight:1.15};
const profileStatusDetailStyle={display:'block',marginTop:'3px',color:'#806044',fontSize:'.62rem',lineHeight:1.35};
const logoutProfileButtonStyle={padding:'9px 13px',border:'1px solid #5c3a21',borderRadius:'4px',background:'rgba(92,58,33,.08)',color:'#5c3a21',cursor:'pointer',fontWeight:'bold',fontFamily:'serif',fontSize:'.72rem'};
const deleteProfileButtonStyle={padding:'9px 13px',border:'1px solid #8b0000',borderRadius:'4px',background:'rgba(139,0,0,.08)',color:'#8b0000',cursor:'pointer',fontWeight:'bold',fontFamily:'serif',fontSize:'.72rem'};
const accountModalBackdropStyle={position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',background:'rgba(28,14,7,.62)',backdropFilter:'blur(5px)'};
const accountModalStyle={width:'100%',maxWidth:'500px',padding:'28px',border:'2px solid #5c3a21',borderRadius:'7px',background:'linear-gradient(145deg,#f4e8c1,#e8d5b5)',boxShadow:'0 25px 70px rgba(0,0,0,.35)',boxSizing:'border-box'};
const accountModalSealStyle={width:'45px',height:'45px',marginBottom:'12px',borderRadius:'50%',border:'2px solid #8b0000',display:'flex',alignItems:'center',justifyContent:'center',color:'#8b0000',fontWeight:'bold',fontSize:'1.2rem'};
const accountModalTitleStyle={margin:'7px 0 10px',color:'#2c1a0f',fontSize:'1.45rem'};
const accountModalTextStyle={margin:'0 0 18px',color:'#6f4a2d',lineHeight:1.55,fontSize:'.86rem'};
const dangerConfirmButtonStyle={padding:'10px 16px',border:'1px solid #8b0000',borderRadius:'4px',background:'#8b0000',color:'#fff4e0',fontWeight:'bold',fontFamily:'serif',cursor:'pointer'};

/* =========================================================
   ROLE-AWARE PROFILE STYLES
   ========================================================= */

const roleCommandCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '18px',
  marginTop: '24px',
  marginBottom: '25px',
  padding: '18px',
  background:
    'linear-gradient(135deg, rgba(92,58,33,0.08), rgba(212,184,149,0.34))',
  border: '1px solid #9c6c44',
  borderLeft: '4px solid #5c3a21',
  borderRadius: '5px',
  boxShadow:
    '0 7px 20px rgba(44,26,15,0.11), inset 0 0 20px rgba(255,255,255,0.12)',
  position: 'relative',
  overflow: 'hidden'
};

const roleCommandSealStyle = {
  width: '52px',
  height: '52px',
  minWidth: '52px',
  borderRadius: '50%',
  border: '1px solid #5c3a21',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8b0000',
  background:
    'radial-gradient(circle, #f4e8c1 0%, #d4b895 100%)',
  fontSize: '1.35rem',
  boxShadow:
    '0 0 0 4px rgba(156,108,68,0.1), 0 5px 15px rgba(44,26,15,0.14)'
};

const roleCommandEyebrowStyle = {
  color: '#9c6c44',
  fontSize: '0.58rem',
  fontWeight: 'bold',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  marginBottom: '4px'
};

const roleCommandTitleStyle = {
  margin: 0,
  color: '#3e2723',
  fontSize: '1.12rem',
  textTransform: 'uppercase',
  letterSpacing: '1.2px'
};

const roleCommandDescriptionStyle = {
  margin: '5px 0 0',
  color: '#6f4a2d',
  fontSize: '0.82rem',
  lineHeight: 1.45,
  fontStyle: 'italic',
  maxWidth: '560px'
};

const roleCommandLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '10px 13px',
  color: '#f4e8c1',
  background:
    'linear-gradient(135deg, #2c1a0f, #5c3a21)',
  border: '1px solid #9c6c44',
  borderRadius: '4px',
  textDecoration: 'none',
  fontSize: '0.68rem',
  fontWeight: 'bold',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  boxShadow: '0 5px 14px rgba(44,26,15,0.2)',
  transition: 'transform 0.25s ease, box-shadow 0.25s ease'
};

/* =========================================================
   Page Styles
   ========================================================= */

const pageStyle = {
  position: 'relative',
  maxWidth: '1100px',
  margin: '40px auto',
  padding: '0 14px 60px',
  fontFamily: 'serif',
  color: '#2c1a0f',
  boxSizing: 'border-box'
};

const ambientLayerStyle = {
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  overflow: 'hidden',
  zIndex: 0
};

const mainManuscriptStyle = {
  position: 'relative',
  zIndex: 1,
  padding: '38px',
  background:
    'linear-gradient(135deg, rgba(244,232,193,0.97), rgba(232,213,181,0.98) 48%, rgba(214,187,145,0.96))',
  border: '2px solid #5c3a21',
  boxShadow:
    '0 20px 55px rgba(44,26,15,0.22), inset 0 0 60px rgba(156,108,68,0.08)',
  borderRadius: '5px',
  overflow: 'hidden',
  boxSizing: 'border-box'
};

const profileHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '20px',
  marginBottom: '28px',
  position: 'relative'
};

const profileSealStyle = {
  width: '65px',
  height: '65px',
  borderRadius: '50%',
  border: '2px solid #5c3a21',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.8rem',
  color: '#8b0000',
  background:
    'radial-gradient(circle, #f4e8c1 0%, #d4b895 100%)',
  boxShadow:
    '0 0 0 5px rgba(156,108,68,0.12), 0 5px 18px rgba(44,26,15,0.18)'
};

const headerEyebrowStyle = {
  color: '#9c6c44',
  fontSize: '0.68rem',
  fontWeight: 'bold',
  letterSpacing: '3px',
  textAlign: 'center',
  marginBottom: '3px'
};

const profileTitleStyle = {
  margin: 0,
  color: '#3e2723',
  fontSize: '2.45rem',
  letterSpacing: '4px',
  textTransform: 'uppercase',
  textAlign: 'center',
  textShadow: '1px 1px 0 rgba(255,255,255,0.4)'
};

const ornamentLineStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  color: '#9c6c44',
  marginTop: '9px',
  fontSize: '0.65rem'
};

const tabNavigationStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '25px',
  marginBottom: '30px',
  borderTop: '1px solid rgba(156,108,68,0.35)',
  borderBottom: '1px solid rgba(156,108,68,0.35)',
  padding: '8px 0'
};

const tabDividerStyle = {
  color: '#9c6c44',
  fontSize: '0.65rem'
};

const tabStyle = {
  position: 'relative',
  border: 'none',
  fontSize: '1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  padding: '12px 14px',
  fontFamily: 'serif',
  transition: 'all 0.3s ease',
  letterSpacing: '1px'
};

const cardContainerStyle = {
  position: 'relative',
  padding: '34px',
  background:
    'linear-gradient(135deg, rgba(232,213,181,0.94), rgba(244,232,193,0.88))',
  border: '1px solid #5c3a21',
  borderRadius: '4px',
  boxShadow:
    '0 10px 30px rgba(44,26,15,0.15), inset 0 0 35px rgba(156,108,68,0.06)',
  overflow: 'hidden'
};

const innerCardStyle = {
  background:
    'linear-gradient(145deg, #ead8b9, #e4cda7)',
  padding: '25px',
  borderRadius: '5px',
  border: '1px solid #9c6c44',
  boxShadow:
    '0 5px 16px rgba(44,26,15,0.11), inset 0 0 18px rgba(255,255,255,0.12)',
  boxSizing: 'border-box',
  transition: 'box-shadow 0.3s ease'
};

const scanLineStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '2px',
  background:
    'linear-gradient(90deg, transparent, rgba(139,0,0,0.55), transparent)',
  opacity: 0.45
};

const identityRowStyle = {
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '11px',
  padding: '12px 13px',
  border: '1px solid rgba(156,108,68,0.26)',
  borderRadius: '6px',
  background: 'rgba(255,248,224,0.44)',
  boxShadow: 'inset 0 1px rgba(255,255,255,0.38)',
  transition: 'all 0.2s ease'
};

const identityIconStyle = {
  width: '34px',
  height: '34px',
  minWidth: '34px',
  borderRadius: '50%',
  border: '1px solid rgba(156,108,68,0.3)',
  background: 'rgba(255,248,224,0.68)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8b0000',
  fontSize: '.82rem',
  fontWeight: 'bold',
  boxShadow: 'inset 0 0 7px rgba(92,58,33,0.08)'
};

const dataLabelStyle = {
  display: 'block',
  color: '#806044',
  fontSize: '0.62rem',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '1.05px',
  marginBottom: '2px'
};

const identityFooterStyle = {
  marginTop: '24px',
  paddingTop: '16px',
  borderTop: '1px dashed rgba(156,108,68,0.55)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',
  color: '#806044',
  fontSize: '0.78rem',
  fontStyle: 'italic'
};

const oracleCircleStyle = {
  width: '105px',
  height: '105px',
  margin: '0 auto 25px',
  borderRadius: '50%',
  border: '1px dashed #9c6c44',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background:
    'radial-gradient(circle, rgba(244,232,193,0.9), rgba(212,184,149,0.35))'
};

const oracleInnerCircleStyle = {
  width: '65px',
  height: '65px',
  borderRadius: '50%',
  border: '2px solid #5c3a21',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8b0000',
  fontSize: '1.8rem',
  background: '#e8d5b5',
  boxShadow: '0 0 18px rgba(156,108,68,0.3)'
};

const oracleEyebrowStyle = {
  color: '#9c6c44',
  fontSize: '0.7rem',
  fontWeight: 'bold',
  letterSpacing: '3px'
};

const oracleTitleStyle = {
  margin: '8px 0 12px',
  color: '#3e2723',
  fontSize: '2rem',
  letterSpacing: '2px'
};

const oracleDescriptionStyle = {
  maxWidth: '590px',
  margin: '0 auto',
  fontSize: '1.05rem',
  lineHeight: '1.7',
  color: '#63432b',
  fontStyle: 'italic'
};

const oracleDividerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  maxWidth: '300px',
  margin: '25px auto',
  color: '#9c6c44'
};

const actionButtonStyle = {
  position: 'relative',
  overflow: 'hidden',
  padding: '15px 35px',
  background:
    'linear-gradient(135deg, #2c1a0f, #4c2d19)',
  color: '#f4e8c1',
  border: '2px solid #5c3a21',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '1rem',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  boxShadow: '0 5px 18px rgba(44,26,15,0.28)',
  transition: 'all 0.3s ease'
};

const buttonLightStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '35%',
  height: '100%',
  background:
    'linear-gradient(90deg, transparent, rgba(255,241,190,0.28), transparent)',
  transform: 'skewX(-20deg)',
  zIndex: 1
};

const processingStatusStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '9px',
  marginTop: '18px',
  color: '#8b0000',
  fontSize: '0.78rem',
  fontWeight: 'bold',
  letterSpacing: '1px'
};

const trendErrorStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  maxWidth: '650px',
  margin: '22px auto 0',
  padding: '15px',
  backgroundColor: 'rgba(139,0,0,0.08)',
  border: '1px solid #8b0000',
  color: '#8b0000',
  borderRadius: '4px',
  fontWeight: 'bold',
  fontSize: '0.88rem'
};

const overviewGridStyle = {
  display: 'flex',
  gap: '20px',
  flexWrap: 'wrap'
};

const miniLabelStyle = {
  color: '#9c6c44',
  fontSize: '0.65rem',
  fontWeight: 'bold',
  letterSpacing: '2px',
  marginBottom: '6px',
  textTransform: 'uppercase'
};

const cardGlowLineStyle = {
  position: 'absolute',
  top: 0,
  left: '10%',
  right: '10%',
  height: '1px',
  background:
    'linear-gradient(90deg, transparent, #9c6c44, transparent)',
  opacity: 0.7
};

const sectionTitle = {
  margin: '0 0 14px',
  fontSize: '1.25rem',
  color: '#3e2723',
  textTransform: 'uppercase',
  letterSpacing: '1.5px',
  borderBottom: '1px dashed rgba(156,108,68,0.55)',
  paddingBottom: '8px'
};

const growthNumberStyle = {
  fontSize: '3.1rem',
  fontWeight: 'bold',
  color: '#5c3a21',
  marginBottom: '12px',
  textShadow: '1px 1px 0 rgba(255,255,255,0.4)'
};

const growthTrackStyle = {
  width: '100%',
  height: '10px',
  backgroundColor: 'rgba(212,184,149,0.45)',
  borderRadius: '5px',
  border: '1px solid #9c6c44',
  overflow: 'hidden'
};

const growthFillStyle = {
  height: '100%',
  background:
    'linear-gradient(90deg, #5c3a21, #8b0000, #9c6c44)',
  borderRadius: '4px',
  boxShadow: '0 0 10px rgba(139,0,0,0.25)'
};

const trendsSectionStyle = {
  position: 'relative'
};

const trendGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
  gap: '20px'
};

const trendHoverGlowStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '3px',
  background:
    'linear-gradient(90deg, transparent, #8b0000, #d4b895, transparent)',
  transition: 'opacity 0.3s ease',
  pointerEvents: 'none'
};

const trendHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '20px',
  borderBottom: '1px solid rgba(156,108,68,0.3)',
  paddingBottom: '12px'
};

const trendIndexStyle = {
  color: '#9c6c44',
  fontSize: '0.6rem',
  letterSpacing: '2px',
  marginBottom: '2px'
};

const trendTitleStyle = {
  margin: 0,
  color: '#2c1a0f',
  fontSize: '1.05rem',
  textTransform: 'uppercase',
  letterSpacing: '1px'
};

const trendSummaryStyle = {
  fontSize: '0.94rem',
  color: '#5c3a21',
  marginTop: '17px',
  lineHeight: '1.55',
  fontStyle: 'italic'
};

const signalStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginTop: '10px',
  color: '#8b6a4c',
  fontSize: '0.72rem',
  letterSpacing: '0.4px'
};

const biometricHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '20px',
  marginBottom: '28px',
  borderBottom: '2px solid rgba(156,108,68,0.25)',
  paddingBottom: '15px'
};

const biometricTitleStyle = {
  margin: 0,
  fontSize: '1.35rem',
  fontWeight: 'bold',
  color: '#3e2723',
  textTransform: 'uppercase',
  letterSpacing: '2px'
};

const biometricDescriptionStyle = {
  margin: '5px 0 0',
  fontSize: '0.9rem',
  color: '#5c3a21',
  fontStyle: 'italic'
};

const scanDataBadgeStyle = {
  backgroundColor: 'rgba(92,58,33,0.08)',
  color: '#5c3a21',
  border: '1px solid #5c3a21',
  padding: '7px 13px',
  borderRadius: '15px',
  fontSize: '0.7rem',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap'
};

const biometricGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '40px'
};

const subHeaderStyle = {
  fontSize: '0.85rem',
  color: '#5c3a21',
  textTransform: 'uppercase',
  letterSpacing: '1.5px',
  marginBottom: '20px',
  borderBottom: '1px solid rgba(156,108,68,0.3)',
  paddingBottom: '8px'
};

const radarDecorationStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '12px',
  color: '#9c6c44',
  fontSize: '0.6rem',
  marginBottom: '5px'
};

const radarTitleStyle = {
  textAlign: 'center',
  color: '#3e2723',
  margin: '5px 0 12px',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  fontSize: '1.25rem'
};

const radarLineStyle = {
  width: '120px',
  height: '1px',
  background:
    'linear-gradient(90deg, transparent, #9c6c44, transparent)',
  margin: '0 auto'
};

const chartFooterStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  color: '#9c6c44',
  fontSize: '0.62rem',
  fontWeight: 'bold',
  letterSpacing: '2px'
};

const closingArchiveStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '15px',
  padding: '20px',
  color: '#6d4a2e',
  textAlign: 'center',
  borderTop: '1px dashed rgba(156,108,68,0.5)',
  borderBottom: '1px dashed rgba(156,108,68,0.5)',
  fontSize: '0.75rem'
};

const loadingScreenStyle = {
  minHeight: '420px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '18px',
  color: '#2c1a0f',
  fontFamily: 'serif'
};

const loadingSealStyle = {
  width: '70px',
  height: '70px',
  borderRadius: '50%',
  border: '2px dashed #9c6c44',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8b0000',
  fontSize: '1.8rem',
  background: '#e8d5b5'
};

const loadingTextStyle = {
  fontSize: '0.8rem',
  fontWeight: 'bold',
  letterSpacing: '2px'
};

const loadingLineStyle = {
  width: '170px',
  height: '2px',
  background: 'rgba(156,108,68,0.25)',
  overflow: 'hidden'
};

const loadingLineGlowStyle = {
  width: '50%',
  height: '100%',
  background:
    'linear-gradient(90deg, transparent, #8b0000, transparent)'
};

const errorScreenStyle = {
  maxWidth: '650px',
  margin: '70px auto',
  padding: '30px',
  textAlign: 'center',
  color: '#8b0000',
  fontWeight: 'bold',
  fontFamily: 'serif',
  background: 'rgba(232,213,181,0.8)',
  border: '2px solid #8b0000',
  borderRadius: '5px'
};

const errorSealStyle = {
  width: '48px',
  height: '48px',
  margin: '0 auto 15px',
  borderRadius: '50%',
  border: '2px solid #8b0000',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.3rem'
};

const ConsultantProfileIntelligence = () => {
  const [profile, setProfile] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let mounted = true;
    Promise.all([api.get('/api/consultants/me'), api.get('/api/consultations/me')])
      .then(([profileResponse, consultationResponse]) => {
        if (!mounted) return;
        setProfile(profileResponse.data?.profile || null);
        setConsultations(Array.isArray(consultationResponse.data) ? consultationResponse.data : []);
      })
      .catch((requestError) => mounted && setError(requestError?.response?.data?.detail || 'Consultant practice records are temporarily unavailable.'));
    return () => { mounted = false; };
  }, []);
  const pending = consultations.filter((item) => ['requested', 'accepted', 'scheduled'].includes(item.status)).length;
  const completed = consultations.filter((item) => item.status === 'completed').length;
  return <section style={tarotProfileIntelligenceSectionStyle}><div style={miniLabelStyle}>GUIDANCE PRACTICE • PROFESSIONAL DESK</div><h2 style={{ ...oracleTitleStyle, marginBottom: 8 }}>Consultant Practice</h2><p style={oracleDescriptionStyle}>Manage your seeker-facing profile and consultation work from one role-specific archive.</p>{error && <p role="alert" style={tarotProfileErrorStyle}>{error}</p>}<div style={tarotProfileMetricGridStyle}>{[['Directory status', profile?.status || 'Profile needed'], ['Consultations', consultations.length], ['Open requests', pending], ['Completed', completed]].map(([label,value]) => <div key={label} style={tarotProfileMetricCardStyle}><div style={tarotProfileMetricLabelStyle}>{label}</div><strong style={{ ...tarotProfileMetricValueStyle, display: 'block', marginTop: 8 }}>{value}</strong></div>)}</div><p style={{ ...tarotProfileQueueNoticeStyle, marginTop: 20 }}>{profile?.status === 'published' ? 'Your public Guidance listing is visible to seekers.' : 'Complete and save your professional profile in the Consultant Dashboard. The administrator will review it before it appears in Guidance.'}</p><div style={tarotProfileActionRowStyle}><Link to="/dashboard" style={tarotProfileActionLinkStyle}>Open Consultant Dashboard</Link><Link to="/consultations" style={tarotProfileSecondaryActionLinkStyle}>Manage consultations</Link></div></section>;
};

const AdministratorProfileIntelligence = () => {
  const [applications, setApplications] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let mounted = true;
    Promise.all([api.get('/api/admin/professional-applications'), api.get('/api/admin/expert-feedback')])
      .then(([applicationResponse, feedbackResponse]) => {
        if (!mounted) return;
        setApplications(Array.isArray(applicationResponse.data) ? applicationResponse.data : []);
        setFeedback(Array.isArray(feedbackResponse.data) ? feedbackResponse.data : []);
      })
      .catch((requestError) => mounted && setError(requestError?.response?.data?.detail || 'Administrator review summaries are temporarily unavailable.'));
    return () => { mounted = false; };
  }, []);
  return <section style={tarotProfileIntelligenceSectionStyle}><div style={miniLabelStyle}>SYSTEM GOVERNANCE • TRUST & QUALITY</div><h2 style={{ ...oracleTitleStyle, marginBottom: 8 }}>Administrator Command</h2><p style={oracleDescriptionStyle}>A focused overview of professional account applications and expert-submitted quality signals.</p>{error && <p role="alert" style={tarotProfileErrorStyle}>{error}</p>}<div style={tarotProfileMetricGridStyle}>{[['Pending applications', applications.filter((item) => item.account_status === 'pending').length], ['Approved professionals', applications.filter((item) => item.account_status === 'active').length], ['Expert reviews', feedback.length], ['Tarot reviews', feedback.filter((item) => item.reading_type === 'tarot').length], ['Palm reviews', feedback.filter((item) => item.reading_type === 'palm').length]].map(([label,value]) => <div key={label} style={tarotProfileMetricCardStyle}><div style={tarotProfileMetricLabelStyle}>{label}</div><strong style={{ ...tarotProfileMetricValueStyle, display: 'block', marginTop: 8 }}>{value}</strong></div>)}</div><p style={{ ...tarotProfileQueueNoticeStyle, marginTop: 20 }}>Review applicant identity and consultant profiles, approve or suspend professional access, and inspect Tarot/Palm Analyst feedback.</p><div style={tarotProfileActionRowStyle}><Link to="/dashboard" style={tarotProfileActionLinkStyle}>Open Admin Dashboard</Link></div></section>;
};


/*
 * ============================================================
 * PROFILE ROLE-AWARENESS CONTRACT
 * ============================================================
 *
 * The profile remains one component and one authenticated route,
 * but the interface no longer treats every account as a seeker.
 *
 * SEEKER
 * - Seeker Profile
 * - Seeker Identity
 * - Explore Readings
 * - Personal Intelligence
 *
 * TAROT READER
 * - Tarot Reader Profile
 * - Arcana Practitioner Profile
 * - Open Tarot Workspace
 * - Reader Intelligence
 *
 * PALM ANALYST
 * - Palm Analyst Profile
 * - Palmistry Practitioner Profile
 * - Open Palm Workspace
 * - Palmistry Intelligence
 *
 * SPIRITUAL CONSULTANT
 * - Spiritual Consultant Profile
 * - Guidance Practitioner Profile
 * - Open Consultant Dashboard
 * - Guidance Intelligence
 *
 * ADMINISTRATOR
 * - Administrator Profile
 * - System Archives
 * - Open System Dashboard
 * - Platform Intelligence
 *
 * Existing API functionality is preserved:
 * - GET /api/auth/me
 * - POST /api/analyze-trends
 *
 * The component does not invent backend fields. It uses the role,
 * email and created_at values already returned by the authenticated
 * profile endpoint and derives presentation-only role metadata.
 *
 * The ancient manuscript theme remains the foundation:
 * parchment, burnt wood, antique gold, serif typography and
 * restrained dark-red accents.
 *
 * Futuristic behavior remains in interaction:
 * animated seals, transitions, scanning lines, hover movement,
 * analytics reveal effects and reduced-motion support.
 *
 * ============================================================
 */


/*
 * ================================================================
 * MODERN ACCOUNT PROFILE CONTRACT
 * ================================================================
 * The profile now supports first_name, last_name, nickname, date_of_birth,
 * calculated age, gender, profile_image, role, email and created_at.
 * Age is derived from date_of_birth and is never stored separately.
 * Profile pictures are resized and compressed before backend persistence.
 * PUT /api/auth/profile is the source of truth for profile edits.
 * DELETE /api/auth/account performs real password-protected deletion.
 * Logout is intentionally owned by this Profile surface.
 * Existing seeker analytics and Palm Analyst professional intelligence
 * remain intact and are not replaced by the account-management layer.
 * ================================================================
 */


/* =========================================================
   TAROT READER PROFESSIONAL INTELLIGENCE
   ========================================================= */

const tarotProfileIntelligenceSectionStyle = {
  ...cardContainerStyle,
  position: 'relative',
  overflow: 'hidden',
  padding: '30px'
};

const tarotProfileIntelligenceHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '20px',
  flexWrap: 'wrap',
  marginBottom: '24px'
};

const tarotProfileIntelligenceSealStyle = {
  width: '70px',
  height: '70px',
  flexShrink: 0,
  borderRadius: '50%',
  border: '2px dashed #9c6c44',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8b0000',
  fontSize: '1.65rem',
  background: 'rgba(232,213,181,0.55)',
  boxShadow: '0 0 22px rgba(156,108,68,0.18)'
};

const tarotProfileMetricGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '14px'
};

const tarotProfileMetricCardStyle = {
  minWidth: 0,
  padding: '18px',
  border: '1px solid rgba(156,108,68,0.62)',
  borderRadius: '5px',
  background: 'linear-gradient(145deg, rgba(255,255,255,0.58), rgba(232,213,181,0.55))',
  boxShadow: '0 5px 18px rgba(44,26,15,0.08)',
  position: 'relative',
  overflow: 'hidden'
};

const tarotProfileMetricIconStyle = {
  width: '38px',
  height: '38px',
  borderRadius: '50%',
  border: '1px solid currentColor',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1rem',
  marginBottom: '10px'
};

const tarotProfileMetricLabelStyle = {
  color: '#705038',
  fontSize: '0.62rem',
  fontWeight: 'bold',
  letterSpacing: '1.8px',
  textTransform: 'uppercase'
};

const tarotProfileMetricValueStyle = {
  marginTop: '5px',
  fontSize: '1.55rem',
  fontWeight: 'bold',
  lineHeight: 1.1
};

const tarotProfileMetricDetailStyle = {
  marginTop: '7px',
  color: '#76604c',
  fontSize: '0.72rem',
  lineHeight: 1.45
};

const tarotProfileQueueNoticeStyle = {
  marginTop: '20px',
  padding: '15px 18px',
  borderTop: '1px dashed rgba(156,108,68,0.55)',
  borderBottom: '1px dashed rgba(156,108,68,0.55)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '15px',
  flexWrap: 'wrap',
  color: '#5c3a21'
};

const tarotProfileActionRowStyle = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  marginTop: '20px'
};

const tarotProfileActionLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '9px',
  minHeight: '42px',
  padding: '10px 16px',
  border: '1px solid #5c3a21',
  borderRadius: '4px',
  color: '#e8d5b5',
  background: '#2c1a0f',
  textDecoration: 'none',
  fontSize: '0.68rem',
  fontWeight: 'bold',
  letterSpacing: '1.2px',
  textTransform: 'uppercase',
  boxSizing: 'border-box'
};

const tarotProfileSecondaryActionLinkStyle = {
  ...tarotProfileActionLinkStyle,
  color: '#5c3a21',
  background: 'rgba(255,255,255,0.48)',
  borderColor: '#9c6c44'
};

const tarotProfileErrorStyle = {
  marginTop: '18px',
  padding: '12px 14px',
  border: '1px solid rgba(139,0,0,0.38)',
  borderRadius: '4px',
  color: '#8b0000',
  background: 'rgba(139,0,0,0.05)',
  fontSize: '0.76rem',
  lineHeight: 1.5
};

const readTarotSessionReviews = () => {
  const saved = Number(
    window.localStorage.getItem('lunara_tarot_session_reviews') || '0'
  );

  return Number.isFinite(saved) ? saved : 0;
};

const readTarotSessionAverage = () => {
  try {
    const savedRatings = JSON.parse(
      window.localStorage.getItem('lunara_tarot_session_ratings') || '[]'
    );

    if (!Array.isArray(savedRatings) || savedRatings.length === 0) {
      return null;
    }

    const numericRatings = savedRatings
      .map(Number)
      .filter(Number.isFinite);

    if (numericRatings.length === 0) {
      return null;
    }

    return (
      numericRatings.reduce((sum, value) => sum + value, 0) /
      numericRatings.length
    );
  } catch {
    return null;
  }
};

const TarotReaderProfileIntelligence = () => {
  const [pendingReviews, setPendingReviews] = useState(null);
  const [spreadCoverage, setSpreadCoverage] = useState(null);
  const [sessionReviews, setSessionReviews] = useState(readTarotSessionReviews);
  const [sessionAverage, setSessionAverage] = useState(readTarotSessionAverage);
  const [loading, setLoading] = useState(true);
  const [queueError, setQueueError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadTarotTelemetry = async () => {
      try {
        const response = await api.get('/api/readings/review/tarot');
        const readings = Array.isArray(response.data)
          ? response.data
          : [];

        const spreads = new Set(
          readings
            .map((reading) => {
              return (
                reading.spread_type ||
                reading.spread ||
                reading.reading_type ||
                'Tarot Reading'
              );
            })
            .filter(Boolean)
        );

        if (mounted) {
          setPendingReviews(readings.length);
          setSpreadCoverage(spreads.size);
          setQueueError('');
        }
      } catch (requestError) {
        console.error('Failed to load Tarot Reader profile intelligence:', requestError);

        if (mounted) {
          setPendingReviews(null);
          setSpreadCoverage(null);
          setQueueError(
            requestError?.response?.data?.detail ||
              'The Tarot review archive could not be reached right now.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadTarotTelemetry();

    const refreshSessionTelemetry = () => {
      setSessionReviews(readTarotSessionReviews());
      setSessionAverage(readTarotSessionAverage());
    };

    window.addEventListener('storage', refreshSessionTelemetry);

    return () => {
      mounted = false;
      window.removeEventListener('storage', refreshSessionTelemetry);
    };
  }, []);

  const metricCard = (icon, label, value, detail, accent) => {
    return (
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        style={{
          ...tarotProfileMetricCardStyle,
          borderTop: `3px solid ${accent}`
        }}
      >
        <div
          style={{
            ...tarotProfileMetricIconStyle,
            color: accent
          }}
        >
          {icon}
        </div>

        <div style={tarotProfileMetricLabelStyle}>{label}</div>

        <div
          style={{
            ...tarotProfileMetricValueStyle,
            color: accent
          }}
        >
          {value}
        </div>

        <div style={tarotProfileMetricDetailStyle}>{detail}</div>
      </motion.div>
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.08 }}
      style={tarotProfileIntelligenceSectionStyle}
    >
      <div style={scanLineStyle} />

      <div style={tarotProfileIntelligenceHeaderStyle}>
        <div style={{ flex: 1, minWidth: '260px' }}>
          <div style={miniLabelStyle}>READER INTELLIGENCE ENGINE</div>

          <h2
            style={{
              ...oracleTitleStyle,
              marginBottom: '8px'
            }}
          >
            Reveal Reading Intelligence
          </h2>

          <p
            style={{
              ...oracleDescriptionStyle,
              marginBottom: 0,
              maxWidth: '760px'
            }}
          >
            A professional snapshot of the Tarot Reader review queue,
            spread coverage, expert review activity, and session quality.
            This profile surface does not perform a seeker tarot reading.
          </p>
        </div>

        <div style={tarotProfileIntelligenceSealStyle}>
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          >
            ◇
          </motion.span>
        </div>
      </div>

      <div style={tarotProfileMetricGridStyle}>
        {metricCard(
          '⌂',
          'Pending Reviews',
          loading ? '—' : pendingReviews ?? '—',
          'Seeker-generated readings awaiting expert evaluation',
          '#8b0000'
        )}

        {metricCard(
          '◇',
          'Spread Coverage',
          loading ? '—' : spreadCoverage ?? '—',
          'Distinct spread types currently represented in the queue',
          '#9c6c44'
        )}

        {metricCard(
          '✎',
          'Session Reviews',
          sessionReviews,
          'Expert reviews submitted during this session history',
          '#5c3a21'
        )}

        {metricCard(
          '★',
          'Session Quality',
          sessionAverage ? `${sessionAverage.toFixed(1)}/10` : '—',
          'Average expert rating recorded for this session',
          '#166534'
        )}
      </div>

      <div style={tarotProfileQueueNoticeStyle}>
        <div>
          <div style={miniLabelStyle}>PROFESSIONAL REVIEW MODE</div>
          <strong
            style={{
              display: 'block',
              marginTop: '4px',
              color: '#3e2723',
              fontSize: '0.92rem'
            }}
          >
            Human-in-the-loop Arcana Evaluation
          </strong>
        </div>

        <div
          style={{
            color: '#6f4a2d',
            fontSize: '0.76rem',
            lineHeight: 1.5,
            maxWidth: '520px'
          }}
        >
          Review seeker-generated interpretations, rate their quality,
          and provide explicit corrections that can become evaluation
          signals for Lunara's intelligence pipeline.
        </div>
      </div>

      {queueError && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={tarotProfileErrorStyle}
        >
          {queueError}
        </motion.div>
      )}

      <div style={tarotProfileActionRowStyle}>
        <Link
          to="/tarot-workspace"
          style={tarotProfileActionLinkStyle}
        >
          <span>Open Review Chamber</span>
          <span aria-hidden="true">→</span>
        </Link>

        <Link
          to="/tarot-deck"
          style={tarotProfileSecondaryActionLinkStyle}
        >
          <span>Open Tarot Deck</span>
          <span aria-hidden="true">◇</span>
        </Link>
      </div>
    </motion.section>
  );
};

/*
const tarotProfileActionStackStyle = {
  display: 'flex',
  alignItems: 'stretch',
  justifyContent: 'flex-end',
  gap: '8px',
  flexWrap: 'wrap'
};

const tarotSecondaryWorkspaceLinkStyle = {
  ...roleCommandLinkStyle,
  background: 'rgba(255,255,255,0.42)',
  color: '#5c3a21',
  borderColor: '#9c6c44',
  boxShadow: '0 5px 15px rgba(44,26,15,0.08)'
};
*/

export default Profile;
