import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api';
import { downloadPdfReport } from '../utils/pdfReports';

import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeatureCards from '../components/FeatureCards';

/* =========================================================
   LUNARA DASHBOARDS
   Ancient archive aesthetic + futuristic interaction layer
   ========================================================= */

/* =========================================================
   GLOBAL DASHBOARD STYLES
   ========================================================= */

const dashboardStyle = {
  minHeight: '100vh',
  padding: '28px 18px 70px',
  color: '#2c1a0f',
  fontFamily: 'serif',
  textAlign: 'center',
  boxSizing: 'border-box',
  position: 'relative',
  overflow: 'hidden'
};

const cardStyle = {
  position: 'relative',
  background:
    'linear-gradient(145deg, rgba(244,232,193,0.94), rgba(232,213,181,0.96))',
  padding: '30px',
  borderRadius: '6px',
  marginTop: '20px',
  border: '2px solid #5c3a21',
  boxShadow:
    '0 12px 35px rgba(44,26,15,0.18), inset 0 0 25px rgba(156,108,68,0.06)',
  maxWidth: '600px',
  marginLeft: 'auto',
  marginRight: 'auto',
  overflow: 'hidden'
};

const linkStyle = {
  color: '#5c3a21',
  fontWeight: 'bold',
  fontSize: '1.05em',
  display: 'inline-block',
  marginTop: '15px',
  textDecoration: 'none',
  letterSpacing: '0.8px'
};

const textStyle = {
  color: '#2c1a0f',
  fontSize: '1.05rem',
  lineHeight: '1.6'
};

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  color: '#5c3a21',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  fontSize: '0.72rem',
  letterSpacing: '1.4px'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '4px',
  border: '1px solid #9c6c44',
  backgroundColor: 'rgba(255,255,255,0.62)',
  color: '#2c1a0f',
  fontFamily: 'sans-serif',
  resize: 'vertical',
  boxSizing: 'border-box',
  outline: 'none'
};

const actionButtonStyle = {
  position: 'relative',
  overflow: 'hidden',
  padding: '14px 22px',
  background:
    'linear-gradient(135deg, #2c1a0f, #4b2d19)',
  color: '#e8d5b5',
  border: '2px solid #5c3a21',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '0.95rem',
  textTransform: 'uppercase',
  letterSpacing: '1.8px',
  marginTop: '10px',
  boxShadow: '0 5px 18px rgba(44,26,15,0.25)',
  transition: 'all 0.3s ease'
};

const sectionStyle = {
  position: 'relative',
  maxWidth: '1050px',
  margin: '40px auto',
  padding: '30px',
  textAlign: 'left',
  background:
    'linear-gradient(145deg, rgba(232,213,181,0.84), rgba(244,232,193,0.76))',
  border: '2px dashed #5c3a21',
  borderRadius: '6px',
  boxShadow:
    '0 10px 30px rgba(44,26,15,0.13), inset 0 0 30px rgba(156,108,68,0.05)',
  overflow: 'hidden',
  boxSizing: 'border-box'
};

const historyCardStyle = {
  position: 'relative',
  background:
    'linear-gradient(145deg, rgba(255,255,255,0.54), rgba(212,184,149,0.24))',
  border: '1px solid #9c6c44',
  borderRadius: '5px',
  padding: '20px',
  marginBottom: '15px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.09)',
  overflow: 'hidden'
};

const downloadReadingReport = (reading, format) => {
  const analysis = typeof reading.analysis === 'string'
    ? reading.analysis
    : JSON.stringify(reading.analysis || {}, null, 2);
  const title = reading.reading_type === 'palm'
    ? `Palmistry reading (${reading.hand_analyzed || 'hand'})`
    : `Tarot reading${reading.spread_type ? ` — ${reading.spread_type}` : ''}`;
  const created = reading.created_at ? new Date(reading.created_at).toLocaleString() : '';
  let content;
  let mime;
  let extension;
  if (format === 'csv') {
    const quote = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    content = [['Title', 'Date', 'Reading', 'Interpretation'], [title, created, analysis, 'For reflection and personal insight.']]
      .map((row) => row.map(quote).join(',')).join('\r\n');
    mime = 'text/csv;charset=utf-8';
    extension = 'csv';
  } else {
    const cardLines = Array.isArray(reading.cards) ? reading.cards.map((card) => `${card.position || 'Card'}: ${card.name}`) : [];
    const detailLines = [created, reading.hand_analyzed ? `Hand analyzed: ${reading.hand_analyzed}` : '', reading.spread_type ? `Spread: ${reading.spread_type}` : '', ...cardLines].filter(Boolean);
    const analysisLines = typeof reading.analysis === 'string' ? reading.analysis.split('\n') : Object.entries(reading.analysis || {}).map(([key, value]) => `${key}: ${value}`);
    downloadPdfReport(title, [
      { heading: 'Reading details', lines: detailLines },
      { heading: 'Interpretation', lines: analysisLines },
      { heading: 'Reflection note', lines: ['For reflection and personal insight.'] },
    ], `lunara-${reading.reading_type || 'reading'}-${reading._id || 'report'}.pdf`);
    return;
  }
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `lunara-${reading.reading_type || 'reading'}-${reading._id || 'report'}.${extension}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/* =========================================================
   DECORATIVE COMPONENTS
   ========================================================= */

const CornerDecoration = ({ position }) => (
  <div
    style={{
      position: 'absolute',
      width: '38px',
      height: '38px',
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
        top: '15px',
        left: '15px',
        background: '#e8d5b5',
        border: '1px solid #5c3a21',
        transform: 'rotate(45deg)'
      }}
    />
  </div>
);

const ArchiveHeading = ({
  eyebrow,
  title,
  description,
  center = false
}) => (
  <div
    style={{
      marginBottom: '24px',
      textAlign: center ? 'center' : 'left'
    }}
  >
    <div
      style={{
        color: '#9c6c44',
        fontSize: '0.65rem',
        fontWeight: 'bold',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        marginBottom: '6px'
      }}
    >
      {eyebrow}
    </div>

    <h2
      style={{
        margin: 0,
        color: '#3e2723',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        fontSize: '1.55rem'
      }}
    >
      {title}
    </h2>

    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: center ? 'center' : 'flex-start',
        gap: '8px',
        marginTop: '10px'
      }}
    >
      <div
        style={{
          width: '70px',
          height: '1px',
          background:
            'linear-gradient(90deg, transparent, #9c6c44)'
        }}
      />

      <span
        style={{
          color: '#8b0000',
          fontSize: '0.65rem'
        }}
      >
        ◆
      </span>

      <div
        style={{
          width: '70px',
          height: '1px',
          background:
            'linear-gradient(90deg, #9c6c44, transparent)'
        }}
      />
    </div>

    {description && (
      <p
        style={{
          color: '#705038',
          fontStyle: 'italic',
          lineHeight: '1.6',
          margin: '12px 0 0',
          fontSize: '0.9rem'
        }}
      >
        {description}
      </p>
    )}
  </div>
);

const AnimatedButton = ({
  children,
  disabled,
  onClick,
  type = 'button',
  style = {}
}) => (
  <motion.button
    type={type}
    onClick={onClick}
    disabled={disabled}
    whileHover={!disabled ? { scale: 1.025, y: -2 } : {}}
    whileTap={!disabled ? { scale: 0.97 } : {}}
    style={{
      ...actionButtonStyle,
      ...style,
      opacity: disabled ? 0.65 : 1
    }}
  >
    <span
      style={{
        position: 'relative',
        zIndex: 2
      }}
    >
      {children}
    </span>

    {!disabled && (
      <motion.span
        animate={{
          x: ['-120%', '220%']
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          repeatDelay: 1
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '32%',
          height: '100%',
          background:
            'linear-gradient(90deg, transparent, rgba(255,241,190,0.28), transparent)',
          transform: 'skewX(-20deg)'
        }}
      />
    )}
  </motion.button>
);

/* =========================================================
   USER DASHBOARD
   ========================================================= */

export const UserDashboard = () => {
  const [readings, setReadings] = useState([]);
  const [trends, setTrends] = useState(null);
  const [loadingReadings, setLoadingReadings] = useState(true);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredReading, setHoveredReading] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/api/readings/me');
        setReadings(response.data);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setLoadingReadings(false);
      }
    };

    fetchHistory();
  }, []);

  const generateTrends = async () => {
    setLoadingTrends(true);
    setError(null);

    try {
      const response = await api.post('/api/analyze-trends');
      setTrends(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Failed to channel the overarching trends.'
      );
    } finally {
      setLoadingTrends(false);
    }
  };

  return (
    <div style={dashboardStyle}>
      <DashboardParticles />

      <Navbar />

      <HeroSection />

      <FeatureCards />

      <NotificationCenter />

      {/* ===================================================
          TREND ANALYSIS
         =================================================== */}

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65 }}
        style={sectionStyle}
      >
        <CornerDecoration
          position={{ top: '14px', left: '14px' }}
        />

        <CornerDecoration
          position={{
            top: '14px',
            right: '14px',
            transform: 'rotate(90deg)'
          }}
        />

        <CornerDecoration
          position={{
            bottom: '14px',
            left: '14px',
            transform: 'rotate(-90deg)'
          }}
        />

        <ArchiveHeading
          eyebrow="ARCHIVE I • LONGITUDINAL READING"
          title="Life Trend Analysis & Personality Intelligence"
          description="Your accumulated readings become a living manuscript of patterns, tendencies and possible trajectories."
          center
        />

        {readings.length < 2 ? (
          <EmptyArchive
            icon="◈"
            title="The Archive Is Still Forming"
            message="Consult the Tarot or Palm Oracle at least twice to unlock your long-term destiny trends."
          />
        ) : !trends ? (
          <div
            style={{
              textAlign: 'center',
              margin: '35px 0 15px'
            }}
          >
            <motion.div
              animate={{
                rotate: [0, 360]
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: 'linear'
              }}
              style={oracleSealStyle}
            >
              ✦
            </motion.div>

            <p
              style={{
                marginBottom: '18px',
                fontSize: '1.05rem',
                fontStyle: 'italic',
                color: '#62432b'
              }}
            >
              The Oracle has gathered enough history to
              synthesize your path.
            </p>

            <AnimatedButton
              onClick={generateTrends}
              disabled={loadingTrends}
            >
              {loadingTrends
                ? 'Synthesizing Timelines...'
                : 'Reveal My Trajectory'}
            </AnimatedButton>

            {loadingTrends && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={processingStyle}
              >
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

                Decoding historical signals...
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={dashboardErrorStyle}
              >
                <strong>ORACLE ERROR</strong>
                <span>{error}</span>
              </motion.div>
            )}
          </div>
        ) : (
          <TrendResults trends={trends} />
        )}
      </motion.div>

      {/* ===================================================
          READING HISTORY
         =================================================== */}

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.1 }}
        style={sectionStyle}
      >
        <ArchiveHeading
          eyebrow="ARCHIVE II • CHRONICLES"
          title="Chronicles of the Oracle"
          description="Every reading leaves a trace within your Lunara journey."
          center
        />

        {loadingReadings ? (
          <LoadingArchive />
        ) : readings.length === 0 ? (
          <EmptyArchive
            icon="⌛"
            title="No Readings Yet"
            message="Your journey has just begun. Complete a Palm or Tarot reading to begin your archive."
          />
        ) : (
          <div style={{ marginTop: '25px' }}>
            {readings.map((reading, index) => (
              <motion.div
                key={reading._id}
                initial={{
                  opacity: 0,
                  x: -15
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.06
                }}
                whileHover={{
                  x: 5
                }}
                onMouseEnter={() =>
                  setHoveredReading(reading._id)
                }
                onMouseLeave={() =>
                  setHoveredReading(null)
                }
                style={{
                  ...historyCardStyle,
                  borderLeft:
                    hoveredReading === reading._id
                      ? '4px solid #8b0000'
                      : '1px solid #9c6c44',
                  boxShadow:
                    hoveredReading === reading._id
                      ? '0 8px 20px rgba(44,26,15,0.16)'
                      : historyCardStyle.boxShadow
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width:
                      hoveredReading === reading._id
                        ? '100%'
                        : '0%',
                    height: '2px',
                    background:
                      'linear-gradient(90deg, transparent, #8b0000, transparent)',
                    transition: 'width 0.35s ease'
                  }}
                />

                <div style={historyHeaderStyle}>
                  <div>
                    <div style={historyIndexStyle}>
                      CHRONICLE {String(index + 1).padStart(2, '0')}
                    </div>

                    <strong
                      style={{
                        textTransform: 'uppercase',
                        color: '#5c3a21',
                        fontSize: '0.95rem',
                        letterSpacing: '1px'
                      }}
                    >
                      {reading.reading_type === 'palm'
                        ? `Palmistry (${reading.hand_analyzed} Hand)`
                        : 'Tarot Spread'}
                    </strong>
                  </div>

                  <span style={historyDateStyle}>
                    {new Date(
                      reading.created_at
                    ).toLocaleDateString()}
                  </span>
                </div>

                <div style={historyContentStyle}>
                  {reading.reading_type === 'palm'
                    ? reading.analysis[
                        'Overall Topological Synthesis'
                      ]
                    : reading.analysis}
                </div>

                <div style={historyFooterStyle}>
                  <span>✦</span>
                  <span>
                    {reading.reading_type === 'palm'
                      ? 'PALM ARCHIVE'
                      : 'TAROT ARCHIVE'}
                  </span>
                  <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => downloadReadingReport(reading, 'pdf')} style={reportExportButtonStyle}>Download report (PDF)</button>
                    <button type="button" onClick={() => downloadReadingReport(reading, 'csv')} style={reportExportButtonStyle}>Export CSV</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

/* =========================================================
   SEEKER SPIRITUAL CONSULTATION
   =========================================================

   This is the seeker-facing booking surface. It intentionally
   stays separate from the professional consultant dashboard.
   Published consultant profiles and seeker consultation requests are
   loaded from the backend; the seeker interface remains isolated from
   professional consultant workspaces.
   ========================================================= */

// Legacy placeholder retained for compatibility; the live directory is API-backed.

const mapBackendConsultantToSeekerCard = (profile) => ({
  id: String(profile.id),
  userId: profile.user_id,
  name: profile.professional_name || profile.username || 'Spiritual Consultant',
  specialty: Array.isArray(profile.specialties) ? profile.specialties.join(' • ') : (profile.specialties || 'Spiritual Guidance'),
  experience: `${Number(profile.years_experience || 0)} years of experience`,
  language: Array.isArray(profile.languages) ? profile.languages.join(', ') : (profile.languages || 'Languages not specified'),
  availability: String(profile.availability_status || 'offline').toUpperCase(),
  rate: profile.session_rate,
  currency: profile.currency || 'INR',
  modes: Array.isArray(profile.session_modes) ? profile.session_modes : [],
  biography: profile.biography || '',
  icon: '✦'
});

const mapBackendConsultationToSeekerBooking = (record) => {
  const scheduledAt = record.scheduled_at ? new Date(record.scheduled_at) : null;
  const validDate = scheduledAt && !Number.isNaN(scheduledAt.getTime());
  const statusMap = {
    requested: 'REQUESTED',
    accepted: 'ACCEPTED',
    declined: 'DECLINED',
    scheduled: 'SCHEDULED',
    in_progress: 'IN PROGRESS',
    completed: 'COMPLETED',
    cancelled: 'CANCELLED'
  };
  return {
    id: String(record.id),
    backendId: record.id,
    consultantId: String(record.consultant_user_id),
    consultantUserId: record.consultant_user_id,
    consultantName: record.consultant_name || 'Spiritual Consultant',
    specialty: record.subject || 'Spiritual Guidance',
    conversationId: `consultation-${record.id}`,
    consultationType: record.subject || 'Spiritual Guidance',
    date: validDate ? [scheduledAt.getFullYear(), String(scheduledAt.getMonth() + 1).padStart(2, '0'), String(scheduledAt.getDate()).padStart(2, '0')].join('-') : '',
    time: validDate ? [String(scheduledAt.getHours()).padStart(2, '0'), String(scheduledAt.getMinutes()).padStart(2, '0')].join(':') : 'Pending scheduling',
    guidanceTopic: record.seeker_notes || 'General spiritual guidance',
    mode: String(record.consultation_mode || 'chat').toUpperCase(),
    status: statusMap[String(record.status || '').toLowerCase()] || String(record.status || 'REQUESTED').toUpperCase(),
    durationMinutes: record.duration_minutes || 30,
    bookedAt: record.created_at || null,
    currency: record.currency || 'INR',
    rate: record.agreed_rate
  };
};

const seekerConsultationAvailabilityMessage =
  'No published spiritual consultants are available at the moment. Published professional profiles will appear here automatically.';

const seekerConsultationStorageKey = 'lunara_seeker_consultations';

const loadSeekerConsultations = () => {
  try {
    const saved = window.localStorage.getItem(
      seekerConsultationStorageKey
    );

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((booking) => booking && typeof booking === 'object');
  } catch (storageError) {
    console.error(
      'Failed to load seeker consultation bookings:',
      storageError
    );
    return [];
  }
};

const SeekerConsultationPanel = () => {
  const [directoryConsultants, setDirectoryConsultants] = useState([]);
  const [directoryLoading, setDirectoryLoading] = useState(true);
  const [directoryError, setDirectoryError] = useState('');
  const [selectedConsultantId, setSelectedConsultantId] =
    useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadPublishedConsultants = async () => {
      setDirectoryLoading(true);
      setDirectoryError('');
      try {
        const response = await api.get('/api/consultants');
        const records = Array.isArray(response.data) ? response.data : (response.data?.consultants || []);
        if (isMounted) setDirectoryConsultants(records.map(mapBackendConsultantToSeekerCard));
      } catch (error) {
        if (isMounted) {
          setDirectoryConsultants([]);
          setDirectoryError(error?.response?.data?.detail || 'The consultant directory could not be reached. Please try again.');
        }
      } finally {
        if (isMounted) setDirectoryLoading(false);
      }
    };
    loadPublishedConsultants();
    return () => { isMounted = false; };
  }, []);
  const [consultationType, setConsultationType] =
    useState('Spiritual Guidance');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [guidanceTopic, setGuidanceTopic] = useState('');
  const [bookings, setBookings] = useState(
    loadSeekerConsultations
  );
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingNotice, setBookingNotice] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState(null);

  const loadPersistedConsultations = async () => {
    setBookingsLoading(true);
    try {
      const response = await api.get('/api/consultations/me');
      const records = Array.isArray(response.data) ? response.data : [];
      setBookings(records.map(mapBackendConsultationToSeekerBooking));
      setBookingError('');
    } catch (error) {
      setBookingError(error?.response?.data?.detail || 'Your saved consultations could not be loaded. Please sign in again and retry.');
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      loadPersistedConsultations();
    }, 0);
    return () => window.clearTimeout(timerId);
    // This initial load is deferred until after the current effect completes.
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        seekerConsultationStorageKey,
        JSON.stringify(bookings)
      );
    } catch (storageError) {
      console.error(
        'Failed to persist seeker consultation bookings:',
        storageError
      );
    }
  }, [bookings]);

  const selectedConsultant = directoryConsultants.find(
    (consultant) => consultant.id === selectedConsultantId
  );

  const upcomingBookings = bookings.filter(
    (booking) => !['COMPLETED', 'CANCELLED', 'DECLINED'].includes(String(booking.status).toUpperCase())
  );

  const completedBookings = bookings.filter(
    (booking) => ['COMPLETED', 'CANCELLED', 'DECLINED'].includes(String(booking.status).toUpperCase())
  );

  const resetBookingForm = () => {
    setSelectedConsultantId(null);
    setConsultationType('Spiritual Guidance');
    setSessionDate('');
    setSessionTime('');
    setGuidanceTopic('');
    setShowBookingForm(false);
  };

  const openBookingForm = (consultantId) => {
    setSelectedConsultantId(consultantId);
    setBookingNotice('');
    setBookingError('');
    setShowBookingForm(true);
  };

  const submitConsultationBooking = async (event) => {
    event.preventDefault();
    setBookingNotice('');
    setBookingError('');

    if (!selectedConsultant) {
      setBookingError('Please select a spiritual consultant first.');
      return;
    }

    if (!sessionDate || !sessionTime) {
      setBookingError('Choose a date and time for your online consultation.');
      return;
    }

    const requestedDateTime = new Date(`${sessionDate}T${sessionTime}`);
    if (Number.isNaN(requestedDateTime.getTime()) || requestedDateTime.getTime() <= Date.now()) {
      setBookingError('Please choose a future date and time for the session.');
      return;
    }

    if (!selectedConsultant.userId) {
      setBookingError('This consultant profile is missing its account reference. Refresh the directory and try again.');
      return;
    }

    const hasConflict = bookings.some((booking) =>
      String(booking.consultantUserId || booking.consultantId) === String(selectedConsultant.userId) &&
      booking.date === sessionDate && booking.time === sessionTime &&
      !['COMPLETED', 'CANCELLED', 'DECLINED'].includes(String(booking.status).toUpperCase())
    );

    if (hasConflict) {
      setBookingError('You already have a booking with this consultant at that time.');
      return;
    }

    setBookingSubmitting(true);
    try {
      const response = await api.post('/api/consultations', {
        consultant_user_id: Number(selectedConsultant.userId),
        subject: consultationType,
        consultation_mode: 'chat',
        scheduled_at: requestedDateTime.toISOString(),
        duration_minutes: 30,
        seeker_notes: guidanceTopic.trim() || 'General spiritual guidance'
      });
      const savedRecord = response.data?.consultation;
      if (!savedRecord) {
        throw new Error('The server did not return the saved consultation.');
      }
      const newBooking = mapBackendConsultationToSeekerBooking(savedRecord);
      setBookings((currentBookings) => [newBooking, ...currentBookings.filter((booking) => booking.id !== newBooking.id)]);
      setActiveBookingId(newBooking.id);
      setBookingNotice('Your consultation request has been saved. The consultant will review the request and confirm the session.');
      setBookingError('');
      resetBookingForm();
    } catch (error) {
      setBookingError(error?.response?.data?.detail || error?.message || 'The consultation request could not be saved. Please try again.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    setBookingNotice('');
    setBookingError('');
    const booking = bookings.find((item) => String(item.id) === String(bookingId));
    if (!booking) return;
    if (['COMPLETED', 'CANCELLED', 'DECLINED'].includes(String(booking.status).toUpperCase())) {
      setBookingError('This consultation can no longer be cancelled.');
      return;
    }
    try {
      await api.patch(`/api/consultations/${booking.backendId || booking.id}/status`, {
        status: 'cancelled',
        cancellation_reason: 'Cancelled by seeker'
      });
      setBookings((currentBookings) => currentBookings.map((item) =>
        String(item.id) === String(bookingId) ? { ...item, status: 'CANCELLED' } : item
      ));
      if (String(activeBookingId) === String(bookingId)) setActiveBookingId(null);
      setBookingNotice('The consultation cancellation has been saved.');
    } catch (error) {
      setBookingError(error?.response?.data?.detail || 'The cancellation could not be saved. Refresh your consultations and try again.');
    }
  };

  const markSessionCompleted = (bookingId) => {
    setBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking.id === bookingId
          ? { ...booking, status: 'COMPLETED' }
          : booking
      )
    );

    setBookingNotice(
      'The consultation has been moved to your completed sessions.'
    );
  };

  const formatConsultationDate = (dateValue) => {
    if (!dateValue) {
      return 'DATE NOT SET';
    }

    const parsed = new Date(`${dateValue}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
      return dateValue;
    }

    return parsed.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatConsultationTime = (timeValue) => {
    if (!timeValue) {
      return 'TIME NOT SET';
    }

    const parsed = new Date(`1970-01-01T${timeValue}`);

    if (Number.isNaN(parsed.getTime())) {
      return timeValue;
    }

    return parsed.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const bookingStatusStyle = (status) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    borderRadius: '999px',
    border: '1px solid #9c6c44',
    background:
      status === 'COMPLETED'
        ? 'rgba(22,101,52,0.08)'
        : 'rgba(139,0,0,0.07)',
    color: status === 'COMPLETED' ? '#166534' : '#8b0000',
    fontSize: '0.65rem',
    fontWeight: 'bold',
    letterSpacing: '1px'
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.04 }}
      id="guidance"
      style={{
        ...sectionStyle,
        maxWidth: '1180px',
        marginTop: '32px',
        scrollMarginTop: '105px'
      }}
    >
      <CornerDecoration
        position={{ top: '14px', left: '14px' }}
      />

      <CornerDecoration
        position={{
          top: '14px',
          right: '14px',
          transform: 'rotate(90deg)'
        }}
      />

      <ArchiveHeading
        eyebrow="LUNARA • SERVICE III"
        title="Spiritual Guidance"
        description="Browse verified spiritual consultants and book a private online guidance session when approved professionals are available."
        center
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginTop: '24px'
        }}
      >
        {directoryConsultants.map((consultant) => (
          <motion.article
            key={consultant.id}
            whileHover={{ y: -5 }}
            style={{
              background:
                selectedConsultantId === consultant.id
                  ? 'linear-gradient(145deg, rgba(92,58,33,0.96), rgba(44,26,15,0.98))'
                  : 'linear-gradient(145deg, rgba(255,255,255,0.54), rgba(212,184,149,0.28))',
              color:
                selectedConsultantId === consultant.id
                  ? '#e8d5b5'
                  : '#2c1a0f',
              border: '1px solid #9c6c44',
              borderRadius: '6px',
              padding: '22px',
              boxShadow: '0 6px 18px rgba(44,26,15,0.10)'
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                margin: '0 auto 12px',
                border: '1px solid #9c6c44',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}
            >
              {consultant.icon}
            </div>

            <div
              style={{
                fontSize: '0.62rem',
                letterSpacing: '1.8px',
                color:
                  selectedConsultantId === consultant.id
                    ? '#d4b895'
                    : '#9c6c44',
                fontWeight: 'bold'
              }}
            >
              SPIRITUAL CONSULTANT
            </div>

            <h3
              style={{
                margin: '7px 0',
                fontSize: '1.15rem'
              }}
            >
              {consultant.name}
            </h3>

            <p
              style={{
                minHeight: '48px',
                margin: '8px 0',
                lineHeight: '1.5',
                fontSize: '0.9rem',
                opacity: 0.9
              }}
            >
              {consultant.specialty}
            </p>

            <div
              style={{
                display: 'grid',
                gap: '5px',
                textAlign: 'left',
                marginTop: '14px',
                fontSize: '0.76rem',
                lineHeight: '1.5'
              }}
            >
              <span>✦ {consultant.experience}</span>
              <span>◈ {consultant.language}</span>
              <span>☼ {consultant.availability}</span>
              <span>◉ ONLINE SESSION</span>
            </div>

            {consultant.biography && (
              <p style={{ margin: '12px 0 0', fontSize: '0.82rem', lineHeight: '1.5', opacity: 0.9 }}>
                {consultant.biography}
              </p>
            )}
            {consultant.rate !== null && consultant.rate !== undefined && (
              <div style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '0.86rem' }}>
                {consultant.currency} {Number(consultant.rate).toLocaleString('en-IN')} / session
              </div>
            )}
            {consultant.modes.length > 0 && (
              <div style={{ marginTop: '7px', fontSize: '0.72rem', letterSpacing: '0.4px' }}>
                {consultant.modes.map((mode) => mode.replace('_', ' ').toUpperCase()).join(' • ')}
              </div>
            )}

            <AnimatedButton
              onClick={() => openBookingForm(consultant.id)}
              style={{
                width: '100%',
                marginTop: '18px',
                background:
                  selectedConsultantId === consultant.id
                    ? 'linear-gradient(135deg, #e8d5b5, #d4b895)'
                    : actionButtonStyle.background,
                color:
                  selectedConsultantId === consultant.id
                    ? '#2c1a0f'
                    : actionButtonStyle.color
              }}
            >
              {selectedConsultantId === consultant.id
                ? 'SELECTED • BOOK SESSION'
                : 'BOOK ONLINE SESSION'}
            </AnimatedButton>
          </motion.article>
        ))}
      </div>

      {directoryLoading && (
        <div role="status" style={{ marginTop: '22px', padding: '24px', border: '1px solid #9c6c44', borderRadius: '6px', background: 'rgba(255,255,255,0.3)' }}>
          <span style={{ display: 'block', fontSize: '1.4rem', marginBottom: '8px' }}>✦</span>
          <strong>Opening the consultant archive…</strong>
        </div>
      )}

      {directoryError && (
        <div role="alert" style={{ marginTop: '18px', padding: '16px', border: '1px solid #8b0000', borderRadius: '6px', color: '#8b0000', background: 'rgba(139,0,0,0.05)' }}>
          {directoryError}
          <button type="button" onClick={async () => { setDirectoryLoading(true); setDirectoryError(''); try { const response = await api.get('/api/consultants'); const records = Array.isArray(response.data) ? response.data : (response.data?.consultants || []); setDirectoryConsultants(records.map(mapBackendConsultantToSeekerCard)); } catch (error) { setDirectoryError(error?.response?.data?.detail || 'The consultant directory could not be reached. Please try again.'); } finally { setDirectoryLoading(false); } }} style={{ display: 'block', margin: '12px auto 0', padding: '8px 14px', border: '1px solid #8b0000', borderRadius: '4px', background: 'transparent', color: '#8b0000', cursor: 'pointer' }}>RETRY DIRECTORY</button>
        </div>
      )}

      {!directoryLoading && directoryConsultants.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: '24px',
            padding: '30px 24px',
            border: '2px dashed #9c6c44',
            borderRadius: '6px',
            background: 'rgba(255,255,255,0.34)',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '62px',
              height: '62px',
              margin: '0 auto 15px',
              borderRadius: '50%',
              border: '1px solid #9c6c44',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8b0000',
              fontSize: '1.6rem',
              background: 'rgba(232,213,181,0.55)'
            }}
          >
            ☾
          </div>
          <div style={panelEyebrowStyle}>VERIFIED GUIDANCE DIRECTORY</div>
          <h3 style={{ margin: '8px 0 10px', color: '#3e2723' }}>
            Spiritual Guidance
          </h3>
          <p
            style={{
              maxWidth: '720px',
              margin: '0 auto',
              color: '#705038',
              fontSize: '0.9rem',
              lineHeight: '1.65'
            }}
          >
            {seekerConsultationAvailabilityMessage}
          </p>
          <p
            style={{
              maxWidth: '680px',
              margin: '12px auto 0',
              color: '#8b0000',
              fontSize: '0.72rem',
              fontWeight: 'bold',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
          >
            Online booking is disabled until a real, verified consultant is available.
          </p>
        </motion.div>
      )}

      {showBookingForm && selectedConsultant && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{
            marginTop: '24px',
            padding: '24px',
            border: '2px solid #5c3a21',
            borderRadius: '6px',
            background:
              'linear-gradient(145deg, rgba(244,232,193,0.92), rgba(232,213,181,0.82))'
          }}
        >
          <div style={{ marginBottom: '18px' }}>
            <div style={panelEyebrowStyle}>
              ONLINE CONSULTATION BOOKING
            </div>
            <h3
              style={{
                margin: '6px 0',
                color: '#3e2723'
              }}
            >
              Book a session with {selectedConsultant.name}
            </h3>
            <p
              style={{
                margin: 0,
                color: '#705038',
                fontSize: '0.9rem'
              }}
            >
              {selectedConsultant.specialty}
            </p>
          </div>

          <form
            onSubmit={submitConsultationBooking}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '16px',
              textAlign: 'left'
            }}
          >
            <div>
              <label style={labelStyle}>Consultation Type</label>
              <select
                value={consultationType}
                onChange={(event) =>
                  setConsultationType(event.target.value)
                }
                style={inputStyle}
              >
                <option>Spiritual Guidance</option>
                <option>Life Direction</option>
                <option>Relationship Guidance</option>
                <option>Personal Growth</option>
                <option>Meditation Guidance</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Session Date</label>
              <input
                required
                type="date"
                value={sessionDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(event) => setSessionDate(event.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Session Time</label>
              <input
                required
                type="time"
                value={sessionTime}
                onChange={(event) => setSessionTime(event.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Guidance Topic</label>
              <textarea
                rows="3"
                value={guidanceTopic}
                onChange={(event) => setGuidanceTopic(event.target.value)}
                placeholder="What would you like guidance about?"
                style={inputStyle}
              />
            </div>

            <div
              style={{
                gridColumn: '1 / -1',
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }}
            >
              <AnimatedButton
                type="submit"
                disabled={bookingSubmitting}
                style={{ marginTop: 0, opacity: bookingSubmitting ? 0.65 : 1, cursor: bookingSubmitting ? 'wait' : 'pointer' }}
              >
                {bookingSubmitting ? 'SAVING REQUEST…' : 'REQUEST ONLINE CONSULTATION'}
              </AnimatedButton>

              <AnimatedButton
                type="button"
                onClick={resetBookingForm}
                style={{
                  marginTop: 0,
                  background: 'transparent',
                  color: '#5c3a21',
                  boxShadow: 'none'
                }}
              >
                CANCEL
              </AnimatedButton>
            </div>
          </form>

          {bookingError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                marginTop: '15px',
                padding: '12px',
                border: '1px solid #8b0000',
                color: '#8b0000',
                background: 'rgba(139,0,0,0.06)'
              }}
            >
              <strong>BOOKING NOTICE</strong>
              <span style={{ marginLeft: '8px' }}>{bookingError}</span>
            </motion.div>
          )}
        </motion.div>
      )}

      {bookingNotice && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: '18px',
            padding: '14px 16px',
            border: '1px solid #166534',
            background: 'rgba(22,101,52,0.07)',
            color: '#166534',
            textAlign: 'center'
          }}
        >
          <strong>✓ CONSULTATION ARCHIVED</strong>
          <span style={{ marginLeft: '8px' }}>{bookingNotice}</span>
        </motion.div>
      )}

      <div
        style={{
          marginTop: '30px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '18px'
        }}
      >
        <div
          style={{
            padding: '20px',
            border: '1px solid #9c6c44',
            borderRadius: '5px',
            background: 'rgba(255,255,255,0.38)'
          }}
        >
          <div style={panelEyebrowStyle}>YOUR SCHEDULE</div>
          <h3 style={{ margin: '7px 0 16px' }}>
            Upcoming Consultations ({upcomingBookings.length})
          </h3>
          <button type="button" onClick={loadPersistedConsultations} disabled={bookingsLoading} style={{ marginBottom: '14px', padding: '8px 12px', border: '1px solid #9c6c44', borderRadius: '4px', background: 'transparent', color: '#5c3a21', cursor: bookingsLoading ? 'wait' : 'pointer' }}>
            {bookingsLoading ? 'Refreshing…' : 'Refresh consultations'}
          </button>

          {bookingsLoading ? (
            <p style={textStyle} role="status">Loading your saved consultations…</p>
          ) : upcomingBookings.length === 0 ? (
            <p style={textStyle}>
              No online consultations are currently scheduled.
            </p>
          ) : (
            upcomingBookings.map((booking) => (
              <motion.div
                key={booking.id}
                whileHover={{ x: 3 }}
                style={{
                  padding: '15px',
                  marginBottom: '10px',
                  border: '1px solid #9c6c44',
                  borderRadius: '4px',
                  background: 'rgba(244,232,193,0.52)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '10px',
                    alignItems: 'flex-start'
                  }}
                >
                  <strong>{booking.consultantName}</strong>
                  <span style={bookingStatusStyle(booking.status)}>
                    {booking.status}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: '8px',
                    fontSize: '0.82rem',
                    lineHeight: '1.6',
                    color: '#62432b'
                  }}
                >
                  <div>☼ {formatConsultationDate(booking.date)}</div>
                  <div>◷ {formatConsultationTime(booking.time)}</div>
                  <div>◉ ONLINE • {booking.consultationType}</div>
                  <div>◆ {booking.guidanceTopic}</div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginTop: '12px'
                  }}
                >
                  <AnimatedButton
                    onClick={() => setActiveBookingId(booking.id)}
                    style={{
                      marginTop: 0,
                      padding: '9px 12px',
                      fontSize: '0.7rem'
                    }}
                  >
                    {activeBookingId === booking.id
                      ? 'SESSION READY'
                      : 'VIEW SESSION'}
                  </AnimatedButton>

                  <AnimatedButton
                    onClick={() => cancelBooking(booking.id)}
                    style={{
                      marginTop: 0,
                      padding: '9px 12px',
                      fontSize: '0.7rem',
                      background: 'transparent',
                      color: '#8b0000',
                      boxShadow: 'none'
                    }}
                  >
                    CANCEL
                  </AnimatedButton>
                </div>

                {activeBookingId === booking.id && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '12px',
                      borderTop: '1px dashed #9c6c44',
                      color: '#5c3a21',
                      fontSize: '0.78rem',
                      lineHeight: '1.55'
                    }}
                  >
                    <strong>ONLINE SESSION ROOM</strong>
                    <p style={{ margin: '5px 0' }}>
                      This request is stored in Lunara. The consultant must
                      accept and schedule it before the session can proceed.
                      A live video or chat room is not opened by the booking
                      request itself.
                    </p>
                    <AnimatedButton
                      disabled={booking.status !== 'IN SESSION'}
                      onClick={() => {
                        setBookingNotice(
                          'The online consultation room is ready for the active session.'
                        );
                      }}
                      style={{
                        marginTop: '4px',
                        padding: '10px 14px'
                      }}
                    >
                      JOIN ONLINE SESSION
                    </AnimatedButton>
                    <AnimatedButton
                      onClick={() => markSessionCompleted(booking.id)}
                      style={{
                        marginTop: '4px',
                        marginLeft: '8px',
                        padding: '10px 14px',
                        background: 'transparent',
                        color: '#166534',
                        boxShadow: 'none'
                      }}
                    >
                      MARK COMPLETED
                    </AnimatedButton>

                    <SpiritualConsultationChat
                      conversationId={
                        booking.conversationId || booking.id
                      }
                      participantName={booking.consultantName}
                      viewerRole="seeker"
                      viewerName="You"
                      compact
                    />
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        <div
          style={{
            padding: '20px',
            border: '1px solid #9c6c44',
            borderRadius: '5px',
            background: 'rgba(255,255,255,0.38)'
          }}
        >
          <div style={panelEyebrowStyle}>SESSION HISTORY</div>
          <h3 style={{ margin: '7px 0 16px' }}>
            Completed Consultations ({completedBookings.length})
          </h3>

          {completedBookings.length === 0 ? (
            <p style={textStyle}>
              Completed spiritual consultation sessions will appear here.
            </p>
          ) : (
            completedBookings.map((booking) => (
              <div
                key={booking.id}
                style={{
                  padding: '13px',
                  marginBottom: '9px',
                  border: '1px solid #9c6c44',
                  background: 'rgba(22,101,52,0.04)',
                  borderRadius: '4px'
                }}
              >
                <strong>{booking.consultantName}</strong>
                <div
                  style={{
                    marginTop: '5px',
                    fontSize: '0.78rem',
                    color: '#62432b'
                  }}
                >
                  {formatConsultationDate(booking.date)} •{' '}
                  {booking.consultationType}
                </div>
                <div
                  style={{
                    marginTop: '5px',
                    color: '#166534',
                    fontSize: '0.68rem',
                    fontWeight: 'bold',
                    letterSpacing: '1px'
                  }}
                >
                  ✓ COMPLETED
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '13px 16px',
          borderTop: '1px dashed #9c6c44',
          textAlign: 'center',
          color: '#705038',
          fontSize: '0.72rem',
          fontStyle: 'italic'
        }}
      >
        Lunara does not create or display placeholder consultants. Online
        consultation booking will become available when verified consultant
        records and the consultation API are connected to this account.
      </div>
    </motion.section>
  );
};

/* =========================================================
   SPIRITUAL CONSULTATION CHAT
   =========================================================

   Shared local chat layer for seeker and consultant surfaces.
   The conversation identifier is intentionally kept separate from
   the UI so a future consultation API can supply a real conversation
   id without changing the chat experience.
   ========================================================= */

const consultationChatStorageKey = 'lunara_consultation_chats';

const loadConsultationChatMessages = (conversationId) => {
  if (!conversationId) {
    return [];
  }

  try {
    const saved = window.localStorage.getItem(
      consultationChatStorageKey
    );

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (message) =>
          message &&
          message.conversationId === conversationId
      )
      .sort(
        (first, second) =>
          new Date(first.createdAt).getTime() -
          new Date(second.createdAt).getTime()
      );
  } catch (storageError) {
    console.error(
      'Failed to load consultation chat messages:',
      storageError
    );

    return [];
  }
};

const SpiritualConsultationChat = ({
  conversationId,
  participantName,
  viewerRole,
  viewerName,
  compact = false
}) => {
  const [messages, setMessages] = useState(() =>
    loadConsultationChatMessages(conversationId)
  );

  const [messageText, setMessageText] = useState('');

  const [messageTopic, setMessageTopic] =
    useState('GENERAL');

  const [chatNotice, setChatNotice] = useState('');

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setMessages(loadConsultationChatMessages(conversationId));
    }, 0);
    return () => window.clearTimeout(timerId);
  }, [conversationId]);

  useEffect(() => {
    const refreshMessages = (event) => {
      if (event.key !== consultationChatStorageKey) {
        return;
      }

      setMessages(
        loadConsultationChatMessages(conversationId)
      );
    };

    window.addEventListener(
      'storage',
      refreshMessages
    );

    return () => {
      window.removeEventListener(
        'storage',
        refreshMessages
      );
    };
  }, [conversationId]);

  const persistMessage = (message) => {
    try {
      const saved = window.localStorage.getItem(
        consultationChatStorageKey
      );

      const parsed = saved
        ? JSON.parse(saved)
        : [];

      const existingMessages = Array.isArray(parsed)
        ? parsed
        : [];

      window.localStorage.setItem(
        consultationChatStorageKey,
        JSON.stringify([
          ...existingMessages,
          message
        ])
      );

      setMessages(
        loadConsultationChatMessages(conversationId)
      );
    } catch (storageError) {
      console.error(
        'Failed to persist consultation chat message:',
        storageError
      );

      setChatNotice(
        'The message could not be saved in this browser.'
      );
    }
  };

  const sendMessage = (event) => {
    event.preventDefault();

    const trimmedMessage = messageText.trim();

    if (!conversationId) {
      setChatNotice(
        'Open a consultation before starting the conversation.'
      );
      return;
    }

    if (!trimmedMessage) {
      setChatNotice(
        'Write a message before sending it.'
      );
      return;
    }

    const message = {
      id: `chat-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      conversationId,
      senderRole: viewerRole,
      senderName: viewerName || 'Lunara User',
      topic: messageTopic,
      text: trimmedMessage,
      createdAt: new Date().toISOString()
    };

    persistMessage(message);
    setMessageText('');
    setChatNotice('Message sent to the consultation conversation.');
  };

  const prepareQuickMessage = (topic, text) => {
    setMessageTopic(topic);
    setMessageText(text);
    setChatNotice('Quick message prepared. Review it and send when ready.');
  };

  const formatChatTime = (value) => {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toLocaleString(
      undefined,
      {
        day: '2-digit',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit'
      }
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        ...consultationChatShellStyle,
        marginTop: compact ? '16px' : '0'
      }}
    >
      <div style={consultationChatHeaderStyle}>
        <div>
          <div style={panelEyebrowStyle}>
            PRIVATE CONSULTATION CHAT
          </div>

          <h4 style={consultationChatTitleStyle}>
            {participantName || 'Spiritual Consultant'}
          </h4>

          <p style={consultationChatSubtitleStyle}>
            Discuss schedules, reschedules, follow-ups and
            preparation before or after the consultation.
          </p>
        </div>

        <span style={consultationChatStatusStyle}>
          {viewerRole === 'consultant'
            ? 'CONSULTANT CHANNEL'
            : 'SEEKER CHANNEL'}
        </span>
      </div>

      <div style={consultationChatQuickActionsStyle}>
        <button
          type="button"
          onClick={() =>
            prepareQuickMessage(
              'SCHEDULE',
              'I would like to discuss the best schedule for our consultation.'
            )
          }
          style={consultationChatQuickButtonStyle}
        >
          SCHEDULE
        </button>

        <button
          type="button"
          onClick={() =>
            prepareQuickMessage(
              'RESCHEDULE',
              'I need to discuss rescheduling our consultation to another time.'
            )
          }
          style={consultationChatQuickButtonStyle}
        >
          RESCHEDULE
        </button>

        <button
          type="button"
          onClick={() =>
            prepareQuickMessage(
              'FOLLOW-UP',
              'I would like to discuss the follow-up steps from our consultation.'
            )
          }
          style={consultationChatQuickButtonStyle}
        >
          FOLLOW-UP
        </button>
      </div>

      <div style={consultationChatMessagesStyle}>
        {messages.length === 0 ? (
          <div style={consultationChatEmptyStyle}>
            <span>◌</span>
            <strong>NO MESSAGES YET</strong>
            <p>
              Start the conversation to coordinate the
              consultation schedule, rescheduling or follow-up.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const ownMessage =
              message.senderRole === viewerRole;

            return (
              <div
                key={message.id}
                style={{
                  ...consultationChatMessageRowStyle,
                  justifyContent: ownMessage
                    ? 'flex-end'
                    : 'flex-start'
                }}
              >
                <div
                  style={{
                    ...consultationChatBubbleStyle,
                    ...(ownMessage
                      ? consultationChatOwnBubbleStyle
                      : consultationChatOtherBubbleStyle)
                  }}
                >
                  <div style={consultationChatMetaStyle}>
                    <strong>
                      {message.senderName}
                    </strong>

                    <span>
                      {message.topic}
                    </span>
                  </div>

                  <p style={consultationChatMessageTextStyle}>
                    {message.text}
                  </p>

                  <time style={consultationChatTimeStyle}>
                    {formatChatTime(message.createdAt)}
                  </time>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={sendMessage}
        style={consultationChatComposerStyle}
      >
        <select
          value={messageTopic}
          onChange={(event) =>
            setMessageTopic(event.target.value)
          }
          style={consultationChatTopicStyle}
          aria-label="Consultation message topic"
        >
          <option value="GENERAL">General</option>
          <option value="SCHEDULE">Schedule</option>
          <option value="RESCHEDULE">Reschedule</option>
          <option value="FOLLOW-UP">Follow-up</option>
        </select>

        <textarea
          rows="3"
          value={messageText}
          onChange={(event) =>
            setMessageText(event.target.value)
          }
          placeholder="Write about the consultation schedule, reschedule request or follow-up..."
          style={consultationChatInputStyle}
        />

        <AnimatedButton
          type="submit"
          style={{
            marginTop: 0,
            alignSelf: 'stretch'
          }}
        >
          SEND MESSAGE
        </AnimatedButton>
      </form>

      {chatNotice && (
        <div style={consultationChatNoticeStyle}>
          <span>✦</span>
          {chatNotice}
        </div>
      )}
    </motion.section>
  );
};

/* =========================================================
   TREND RESULTS
   ========================================================= */

const TrendResults = ({ trends }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        marginTop: '25px',
        lineHeight: '1.7'
      }}
    >
      <div style={trendGridStyle}>
        <TrendPanel
          number="01"
          title="Personality Intelligence"
          icon="♙"
          content={trends['Personality Intelligence']}
        />

        <TrendPanel
          number="02"
          title="Life Trend Analysis"
          icon="◈"
          content={trends['Life Trend Analysis']}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={recommendationPanelStyle}
      >
        <div style={recommendationIconStyle}>
          ✦
        </div>

        <div style={{ flex: 1 }}>
          <div style={panelEyebrowStyle}>
            ARCHIVE III
          </div>

          <h3 style={panelTitleStyle}>
            Actionable Recommendations
          </h3>

          <ul style={recommendationListStyle}>
            {trends.Recommendations.map((rec, idx) => (
              <motion.li
                key={idx}
                initial={{
                  opacity: 0,
                  x: -10
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                transition={{
                  delay: 0.35 + idx * 0.08
                }}
                style={{
                  marginBottom: '10px'
                }}
              >
                <span
                  style={{
                    color: '#8b0000',
                    marginRight: '8px'
                  }}
                >
                  ◆
                </span>
                {rec}
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
};

const TrendPanel = ({
  number,
  title,
  icon,
  content
}) => (
  <motion.div
    whileHover={{
      y: -5
    }}
    style={trendPanelStyle}
  >
    <div style={trendPanelNumberStyle}>
      {number}
    </div>

    <div style={trendPanelIconStyle}>
      {icon}
    </div>

    <h3 style={trendPanelTitleStyle}>
      {title}
    </h3>

    <div style={trendPanelLineStyle} />

    <p
      style={{
        margin: 0,
        color: '#4f3423',
        lineHeight: '1.75'
      }}
    >
      {content}
    </p>
  </motion.div>
);

/* =========================================================
   SHARED REVIEW WORKSPACE
   ========================================================= */

export const ReviewWorkspace = ({
  readingType,
  roleTitle
}) => {
  const [queue, setQueue] = useState([]);
  const [selectedReading, setSelectedReading] =
    useState(null);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(5);
  const [suggestions, setSuggestions] = useState('');
  const [corrections, setCorrections] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [hoveredQueueItem, setHoveredQueueItem] =
    useState(null);
  const [feedbackComplete, setFeedbackComplete] =
    useState(false);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await api.get(
          `/api/readings/review/${readingType}`
        );

        setQueue(response.data);
      } catch (error) {
        console.error(
          'Failed to fetch queue',
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();
  }, [readingType]);

  const submitFeedback = async (e) => {
    e.preventDefault();

    if (!selectedReading) {
      return;
    }

    setSubmitting(true);
    setFeedbackComplete(false);

    try {
      await api.post(
        `/api/readings/${selectedReading._id}/feedback`,
        {
          rating: parseInt(rating),
          suggestions,
          corrections
        }
      );

      setQueue(
        queue.filter(
          (r) => r._id !== selectedReading._id
        )
      );

      setSelectedReading(null);
      setSuggestions('');
      setCorrections('');
      setRating(5);
      setFeedbackComplete(true);

      setTimeout(() => {
        setFeedbackComplete(false);
      }, 3000);
    } catch (error) {
      console.error('Submission failed', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={reviewLoadingStyle}>
        <motion.div
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={reviewLoadingSealStyle}
        >
          ✦
        </motion.div>

        <div>
          Loading {roleTitle} Queue...
        </div>
      </div>
    );
  }

  return (
    <div style={reviewWorkspaceStyle}>
      {/* LEFT QUEUE */}
      <div style={queuePanelStyle}>
        <div style={queueHeaderStyle}>
          <div style={panelEyebrowStyle}>
            REVIEW ARCHIVE
          </div>

          <h2 style={queueTitleStyle}>
            Pending {roleTitle} Reviews
          </h2>

          <div style={queueCounterStyle}>
            {queue.length}
            <span>AWAITING REVIEW</span>
          </div>
        </div>

        {queue.length === 0 ? (
          <EmptyArchive
            icon="✓"
            title="Archive Clear"
            message="No pending readings require your expertise."
            compact
          />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginTop: '18px'
            }}
          >
            {queue.map((reading, index) => (
              <motion.button
                key={reading._id}
                initial={{
                  opacity: 0,
                  x: -12
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                transition={{
                  delay: index * 0.05
                }}
                whileHover={{
                  x: 4
                }}
                onClick={() =>
                  setSelectedReading(reading)
                }
                onMouseEnter={() =>
                  setHoveredQueueItem(reading._id)
                }
                onMouseLeave={() =>
                  setHoveredQueueItem(null)
                }
                style={{
                  ...queueItemStyle,
                  background:
                    selectedReading?._id === reading._id
                      ? 'linear-gradient(135deg, #5c3a21, #2c1a0f)'
                      : hoveredQueueItem ===
                          reading._id
                        ? 'rgba(212,184,149,0.48)'
                        : 'rgba(255,255,255,0.38)',
                  color:
                    selectedReading?._id === reading._id
                      ? '#e8d5b5'
                      : '#2c1a0f',
                  borderLeft:
                    selectedReading?._id === reading._id
                      ? '4px solid #d4b895'
                      : '4px solid transparent'
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.62rem',
                    letterSpacing: '1.5px',
                    opacity: 0.7,
                    marginBottom: '5px'
                  }}
                >
                  SEEKER {String(index + 1).padStart(2, '0')}
                </span>

                <strong>
                  Seeker: {reading.username}
                </strong>

                <span
                  style={{
                    display: 'block',
                    fontSize: '0.78rem',
                    fontWeight: 'normal',
                    marginTop: '5px',
                    opacity: 0.75
                  }}
                >
                  Date:{' '}
                  {new Date(
                    reading.created_at
                  ).toLocaleDateString()}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT REVIEW FORM */}
      <div style={reviewFormColumnStyle}>
        <AnimatePresence mode="wait">
          {selectedReading ? (
            <motion.div
              key={selectedReading._id}
              initial={{
                opacity: 0,
                x: 25,
                filter: 'blur(4px)'
              }}
              animate={{
                opacity: 1,
                x: 0,
                filter: 'blur(0px)'
              }}
              exit={{
                opacity: 0,
                x: -20
              }}
              style={reviewCardStyle}
            >
              <CornerDecoration
                position={{
                  top: '12px',
                  right: '12px',
                  transform: 'rotate(90deg)'
                }}
              />

              <div style={panelEyebrowStyle}>
                HUMAN-IN-THE-LOOP REVIEW
              </div>

              <h3 style={reviewTitleStyle}>
                Analysis Review
              </h3>

              <div style={reviewSeekerStyle}>
                <span>♙</span>
                <div>
                  <small>SEEKER</small>
                  <strong>
                    {selectedReading.username}
                  </strong>
                </div>
              </div>

              {/* Analysis */}
              <div style={analysisPreviewStyle}>
                <div style={analysisPreviewHeaderStyle}>
                  <span>✦</span>
                  <strong>ORACLE OUTPUT</strong>
                  <span>✦</span>
                </div>

                <pre style={analysisPreviewTextStyle}>
                  {typeof selectedReading.analysis ===
                  'string'
                    ? selectedReading.analysis
                    : JSON.stringify(
                        selectedReading.analysis,
                        null,
                        2
                      )}
                </pre>
              </div>

              {/* Feedback */}
              <form
                onSubmit={submitFeedback}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px'
                }}
              >
                <div>
                  <label style={labelStyle}>
                    Accuracy Rating: {rating}/10
                  </label>

                  <div style={ratingDisplayStyle}>
                    <span>1</span>

                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={rating}
                      onChange={(e) =>
                        setRating(e.target.value)
                      }
                      style={{
                        width: '100%',
                        cursor: 'pointer'
                      }}
                    />

                    <span>10</span>
                  </div>

                  <div style={ratingValueStyle}>
                    {rating >= 8
                      ? 'Highly Accurate'
                      : rating >= 5
                        ? 'Moderately Accurate'
                        : 'Requires Attention'}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>
                    AI Training Suggestions
                  </label>

                  <textarea
                    required
                    rows="3"
                    value={suggestions}
                    onChange={(e) =>
                      setSuggestions(e.target.value)
                    }
                    style={inputStyle}
                    placeholder="How can the AI improve tone or focus?"
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Explicit Corrections
                  </label>

                  <textarea
                    required
                    rows="3"
                    value={corrections}
                    onChange={(e) =>
                      setCorrections(e.target.value)
                    }
                    style={inputStyle}
                    placeholder="Override inaccurate data..."
                  />
                </div>

                <AnimatedButton
                  type="submit"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Transmitting...'
                    : 'Submit Expert Review'}
                </AnimatedButton>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="empty-review"
              initial={{
                opacity: 0
              }}
              animate={{
                opacity: 1
              }}
              style={emptyReviewStyle}
            >
              <motion.div
                animate={{
                  rotate: [0, 180, 360],
                  scale: [1, 1.08, 1]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                style={emptyReviewSealStyle}
              >
                ◈
              </motion.div>

              <div style={panelEyebrowStyle}>
                REVIEW CHAMBER
              </div>

              <h3>
                Awaiting Your Selection
              </h3>

              <p>
                Select a reading from the archive to begin
                your expert review.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {feedbackComplete && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            style={successMessageStyle}
          >
            <span>✓</span>
            Expert review successfully transmitted to
            the archive.
          </motion.div>
        )}
      </div>
    </div>
  );
};


/* =========================================================
   SHARED NOTIFICATION CENTER
   Reads the authenticated user's targeted and platform notices.
   ========================================================= */

const notificationPanelStyle = {
  width: 'min(1080px, 100%)',
  margin: '0 auto 24px',
  padding: '20px',
  boxSizing: 'border-box',
  textAlign: 'left',
  color: '#2c1a0f',
  background: 'linear-gradient(145deg, rgba(244,232,193,0.96), rgba(232,213,181,0.98))',
  border: '2px solid #8a633b',
  borderRadius: '8px',
  boxShadow: '0 10px 28px rgba(44,26,15,0.14)'
};

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(true);
  const [notificationError, setNotificationError] = useState('');
  const [updatingNotificationId, setUpdatingNotificationId] = useState(null);
  const [notificationExpanded, setNotificationExpanded] = useState(true);

  const loadNotifications = async () => {
    setNotificationLoading(true);
    setNotificationError('');

    try {
      const response = await api.get('/api/notifications/me', {
        params: { limit: 20 }
      });
      const payload = response.data;
      const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload?.notifications)
            ? payload.notifications
            : [];
      setNotifications(rows);
    } catch (err) {
      setNotificationError(
        err.response?.data?.detail ||
          'Notifications could not be loaded right now.'
      );
    } finally {
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      loadNotifications();
    }, 0);
    return () => window.clearTimeout(timerId);
    // Defer the initial fetch until after the current effect completes.
  }, []);

  const markNotificationRead = async (notification) => {
    if (!notification?.id || notification.is_read) {
      return;
    }

    setUpdatingNotificationId(notification.id);
    setNotificationError('');

    try {
      await api.patch(
        `/api/notifications/${notification.id}/read`,
        { is_read: true }
      );
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, is_read: true }
            : item
        )
      );
    } catch (err) {
      setNotificationError(
        err.response?.data?.detail ||
          'This notification could not be marked as read.'
      );
    } finally {
      setUpdatingNotificationId(null);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  return (
    <section
      style={notificationPanelStyle}
      aria-label="Lunara notifications"
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <div style={panelEyebrowStyle}>LUNARA • MESSAGES FROM THE ARCHIVE</div>
          <h2
            style={{
              margin: '5px 0 0',
              color: '#4a2b17',
              fontSize: 'clamp(1.2rem, 2.4vw, 1.65rem)'
            }}
          >
            Notifications
            <span
              aria-label={`${unreadCount} unread notifications`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '25px',
                height: '25px',
                marginLeft: '10px',
                padding: '0 7px',
                borderRadius: '20px',
                background: unreadCount ? '#7c321f' : '#8a795d',
                color: '#fff4d5',
                fontSize: '0.78rem',
                verticalAlign: 'middle'
              }}
            >
              {unreadCount}
            </span>
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setNotificationExpanded((expanded) => !expanded)}
            style={{
              padding: '8px 12px',
              border: '1px solid #8a633b',
              borderRadius: '5px',
              background: 'rgba(255,248,224,0.7)',
              color: '#4a2b17',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
            aria-expanded={notificationExpanded}
          >
            {notificationExpanded ? 'Hide' : 'Show'}
          </button>
          <button
            type="button"
            onClick={loadNotifications}
            disabled={notificationLoading}
            style={{
              padding: '8px 12px',
              border: '1px solid #8a633b',
              borderRadius: '5px',
              background: '#5c3a21',
              color: '#fff4d5',
              cursor: notificationLoading ? 'wait' : 'pointer',
              fontFamily: 'inherit',
              opacity: notificationLoading ? 0.7 : 1
            }}
          >
            {notificationLoading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {notificationError && (
        <div
          role="alert"
          style={{
            marginTop: '14px',
            padding: '10px 12px',
            border: '1px solid #a64b36',
            borderRadius: '5px',
            color: '#7c321f',
            background: 'rgba(255,236,222,0.8)'
          }}
        >
          {notificationError}
        </div>
      )}

      {notificationExpanded && (
        <div style={{ marginTop: '14px' }}>
          {notificationLoading && notifications.length === 0 ? (
            <p style={{ margin: 0, opacity: 0.8 }}>Opening the archive…</p>
          ) : notifications.length === 0 ? (
            <div
              style={{
                padding: '18px',
                border: '1px dashed #a8875e',
                borderRadius: '6px',
                textAlign: 'center',
                color: '#6a4a2d'
              }}
            >
              No notifications yet. Important updates will appear here.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {notifications.map((notification) => (
                <article
                  key={notification.id}
                  style={{
                    padding: '14px',
                    borderRadius: '6px',
                    border: `1px solid ${notification.is_read ? '#c0a47a' : '#8a633b'}`,
                    borderLeft: `4px solid ${notification.is_read ? '#b59a72' : '#7c321f'}`,
                    background: notification.is_read
                      ? 'rgba(255,248,224,0.45)'
                      : 'rgba(255,248,224,0.82)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '12px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center',
                          flexWrap: 'wrap'
                        }}
                      >
                        <strong style={{ color: '#4a2b17', fontSize: '1rem' }}>
                          {notification.title || 'Lunara update'}
                        </strong>
                        {!notification.is_read && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                              color: '#7c321f',
                              fontWeight: 700
                            }}
                          >
                            New
                          </span>
                        )}
                      </div>
                      {notification.category && (
                        <div
                          style={{
                            marginTop: '4px',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: '#85613d'
                          }}
                        >
                          {notification.category}
                        </div>
                      )}
                      <p
                        style={{
                          margin: '8px 0 0',
                          lineHeight: 1.55,
                          whiteSpace: 'pre-wrap',
                          overflowWrap: 'anywhere'
                        }}
                      >
                        {notification.message}
                      </p>
                      {notification.created_at && (
                        <time
                          dateTime={notification.created_at}
                          style={{
                            display: 'block',
                            marginTop: '8px',
                            fontSize: '0.78rem',
                            color: '#795a3a'
                          }}
                        >
                          {new Date(notification.created_at).toLocaleString()}
                        </time>
                      )}
                      {notification.action_url && (
                        <a
                          href={notification.action_url}
                          style={{
                            display: 'inline-block',
                            marginTop: '10px',
                            color: '#70421f',
                            fontWeight: 700,
                            textDecoration: 'underline',
                            overflowWrap: 'anywhere'
                          }}
                        >
                          Open related page ↗
                        </a>
                      )}
                    </div>
                    {!notification.is_read && (
                      <button
                        type="button"
                        onClick={() => markNotificationRead(notification)}
                        disabled={updatingNotificationId === notification.id}
                        style={{
                          padding: '8px 10px',
                          border: '1px solid #8a633b',
                          borderRadius: '5px',
                          background: '#5c3a21',
                          color: '#fff4d5',
                          cursor: updatingNotificationId === notification.id
                            ? 'wait'
                            : 'pointer',
                          fontFamily: 'inherit',
                          flexShrink: 0
                        }}
                      >
                        {updatingNotificationId === notification.id
                          ? 'Saving…'
                          : 'Mark as read'}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};


/* =========================================================
   ROLE DASHBOARD HEADER
   ========================================================= */

const RoleDashboardHeader = ({
  eyebrow,
  title,
  description,
  icon,
  children
}) => (
  <div style={roleDashboardStyle}>
    <DashboardParticles />

    <div style={roleHeaderStyle}>
      <motion.div
        animate={{
          rotate: [0, 4, -4, 0]
        }}
        transition={{
          duration: 5,
          repeat: Infinity
        }}
        style={roleSealStyle}
      >
        {icon}
      </motion.div>

      <div>
        <div style={panelEyebrowStyle}>
          {eyebrow}
        </div>

        <h1 style={roleTitleStyle}>
          {title}
        </h1>

        <div style={roleOrnamentStyle}>
          <span>◆</span>
          <div />
          <span>✦</span>
          <div />
          <span>◆</span>
        </div>

        <p style={roleDescriptionStyle}>
          {description}
        </p>
      </div>
    </div>

    <NotificationCenter />

    {children}
  </div>
);

/* =========================================================
   TAROT READER DASHBOARD
   ========================================================= */

export const TarotReaderDashboard = () => (
  <RoleDashboardHeader
    eyebrow="LUNARA • ARCANA ARCHIVE"
    title="Tarot Reader Portal"
    icon="✦"
    description="Review AI-generated tarot readings, evaluate interpretation quality, track seeker engagement, and contribute structured expert feedback to the intelligence archive."
  >
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      style={portalCardStyle}
    >
      <div style={portalIconStyle}>◈</div>

      <div style={panelEyebrowStyle}>
        TAROT READING ENGINE
      </div>

      <h2 style={portalCardTitleStyle}>
        Arcana Control Chamber
      </h2>

      <p style={portalCardTextStyle}>
        Access the live tarot engine, inspect generated spreads, and
        compare the AI interpretation against expert tarot practice.
      </p>

      <motion.div whileHover={{ scale: 1.025 }}>
        <Link
          to="/tarot-deck"
          style={portalLinkStyle}
          aria-label="Open the complete Tarot Reader deck"
          title="Open the complete Tarot Reader deck"
        >
          Access Tarot Deck
          <span>➜</span>
        </Link>
      </motion.div>
    </motion.div>

    <TarotAnalyticsOverview />

    {/* ---------------------------------------------------------
        DASHBOARD / WORKSPACE BOUNDARY

        The Tarot Reader dashboard intentionally stops here.
        The human-in-the-loop review chamber is a separate
        workspace and is mounted through the dedicated
        /tarot-workspace route.

        Keeping the workspace out of this component prevents
        the dashboard from becoming a long review screen while
        preserving every existing review feature below.
        --------------------------------------------------------- */}
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
        duration: 0.55,
        delay: 0.16
      }}
      style={{
        ...portalCardStyle,
        maxWidth: '760px',
        marginTop: '28px'
      }}
    >
      <div style={portalIconStyle}>
        ◇
      </div>

      <div style={panelEyebrowStyle}>
        SEPARATE WORKSPACE
      </div>

      <h2 style={portalCardTitleStyle}>
        Tarot Review Workspace
      </h2>

      <p style={portalCardTextStyle}>
        The dashboard provides your reader overview and
        telemetry. Expert review is intentionally kept in
        its own workspace so your queue, seeker readings,
        feedback controls, and archive actions remain
        focused and uncluttered.
      </p>

      <motion.div
        whileHover={{
          scale: 1.025,
          y: -2
        }}
        whileTap={{
          scale: 0.98
        }}
      >
        <Link
          to="/tarot-workspace"
          style={portalLinkStyle}
          aria-label="Open the separate Tarot Review Workspace"
        >
          Open Tarot Review Workspace
          <span>➜</span>
        </Link>
      </motion.div>
    </motion.div>
  </RoleDashboardHeader>
);

/* =========================================================
   STANDALONE TAROT REVIEW WORKSPACE ROUTE
   =========================================================

   IMPORTANT ARCHITECTURE RULE:
   TarotReaderDashboard and TarotWorkspace are deliberately
   separate surfaces.

   TarotReaderDashboard:
   - Shows the reader's dashboard.
   - Shows reader telemetry and high-level queue metrics.
   - Does NOT render the review queue.
   - Does NOT render the expert feedback form.

   TarotWorkspace:
   - Is the dedicated human-in-the-loop review chamber.
   - Renders the complete TarotReaderWorkspace component.
   - Keeps search, filtering, selection, analysis inspection,
     ratings, suggestions, corrections and submission in one
     focused workspace.
   ========================================================= */

export const TarotWorkspace = () => (
  <div
    style={{
      ...dashboardStyle,
      paddingTop: '28px'
    }}
  >
    <DashboardParticles />

    <Navbar />

    <RoleDashboardHeader
      eyebrow="LUNARA • ARCANA REVIEW ARCHIVE"
      title="Tarot Review Workspace"
      icon="◇"
      description="A dedicated human-in-the-loop chamber for reviewing AI-generated tarot interpretations and transmitting structured expert feedback."
    >
      <TarotReaderWorkspace />
    </RoleDashboardHeader>
  </div>
);

/* =========================================================
   WORKSPACE SEPARATION CONTRACT
   =========================================================

   The following rules are intentionally documented here so a
   future redesign does not accidentally fuse these surfaces
   again:

   1. /dashboard renders TarotReaderDashboard.
   2. /tarot-workspace renders TarotWorkspace.
   3. TarotReaderDashboard must never render
      TarotReaderWorkspace directly.
   4. TarotReaderWorkspace remains fully implemented below so
      its existing API calls and review functionality are
      preserved.
   5. The dashboard can link to the workspace, but the workspace
      must not be embedded inside the dashboard.
   6. The seeker TarotReader component remains a separate
      feature at /tarot-reader.
   ========================================================= */

/* =========================================================
   TAROT READER ANALYTICS OVERVIEW
   ========================================================= */

const TarotAnalyticsOverview = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [spreadCount, setSpreadCount] = useState(0);
  const [sessionReviews] = useState(() => {
    const saved = Number(
      window.localStorage.getItem('lunara_tarot_session_reviews') || '0'
    );
    return Number.isFinite(saved) ? saved : 0;
  });

  const [sessionAverage] = useState(() => {
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
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadOverview = async () => {
      try {
        const response = await api.get('/api/readings/review/tarot');
        const readings = Array.isArray(response.data)
          ? response.data
          : [];

        if (!mounted) {
          return;
        }

        setPendingCount(readings.length);

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

        setSpreadCount(spreads.size);
      } catch {
        if (mounted) {
          setPendingCount(0);
          setSpreadCount(0);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOverview();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.08 }}
      className="lunara-tarot-analytics"
      style={tarotAnalyticsSectionStyle}
    >
      <div style={tarotAnalyticsHeaderStyle}>
        <div>
          <div style={panelEyebrowStyle}>
            ARCHIVE TELEMETRY • TAROT
          </div>
          <h2 style={tarotAnalyticsTitleStyle}>
            Reader Intelligence Overview
          </h2>
          <p style={tarotAnalyticsDescriptionStyle}>
            A live snapshot of the review queue, spread coverage,
            session activity, and expert quality signals.
          </p>
        </div>

        <div style={tarotAnalyticsSealStyle}>
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          >
            ✦
          </motion.span>
        </div>
      </div>

      <div style={tarotMetricGridStyle}>
        <TarotMetricCard
          icon="⌂"
          label="Pending Reviews"
          value={loading ? '—' : pendingCount}
          detail="Awaiting expert evaluation"
          accent="red"
        />

        <TarotMetricCard
          icon="◇"
          label="Spread Coverage"
          value={loading ? '—' : spreadCount}
          detail="Distinct spread types in queue"
          accent="gold"
        />

        <TarotMetricCard
          icon="✎"
          label="Session Reviews"
          value={sessionReviews}
          detail="Expert reviews submitted"
          accent="brown"
        />

        <TarotMetricCard
          icon="★"
          label="Session Quality"
          value={sessionAverage ? `${sessionAverage.toFixed(1)}/10` : '—'}
          detail="Average expert rating this session"
          accent="green"
        />
      </div>

      <div style={tarotAnalyticsLegendStyle}>
        <span>
          <i style={legendDotStyle('#8b0000')} />
          Review Queue
        </span>
        <span>
          <i style={legendDotStyle('#9c6c44')} />
          Engagement Signal
        </span>
        <span>
          <i style={legendDotStyle('#166534')} />
          Quality Feedback
        </span>
      </div>
    </motion.section>
  );
};

const TarotMetricCard = ({
  icon,
  label,
  value,
  detail,
  accent
}) => {
  const accentMap = {
    red: '#8b0000',
    gold: '#9c6c44',
    brown: '#5c3a21',
    green: '#166534'
  };

  const accentColor = accentMap[accent] || '#5c3a21';

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      style={{
        ...tarotMetricCardStyle,
        borderTop: `3px solid ${accentColor}`
      }}
    >
      <div
        style={{
          ...tarotMetricIconStyle,
          color: accentColor,
          borderColor: accentColor
        }}
      >
        {icon}
      </div>

      <div style={tarotMetricLabelStyle}>{label}</div>

      <div style={{ ...tarotMetricValueStyle, color: accentColor }}>
        {value}
      </div>

      <div style={tarotMetricDetailStyle}>{detail}</div>
    </motion.div>
  );
};

const legendDotStyle = (background) => ({
  display: 'inline-block',
  width: '7px',
  height: '7px',
  borderRadius: '50%',
  background,
  marginRight: '6px'
});

/* =========================================================
   TAROT HUMAN-IN-THE-LOOP REVIEW WORKSPACE
   ========================================================= */

const TarotReaderWorkspace = () => {
  const [queue, setQueue] = useState([]);
  const [selectedReading, setSelectedReading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(5);
  const [suggestions, setSuggestions] = useState('');
  const [corrections, setCorrections] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackComplete, setFeedbackComplete] = useState(false);
  const [hoveredQueueItem, setHoveredQueueItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [spreadFilter, setSpreadFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [reviewedThisSession, setReviewedThisSession] = useState(0);
  const [sessionRatings, setSessionRatings] = useState(() => {
    try {
      const storedRatings = JSON.parse(
        window.localStorage.getItem('lunara_tarot_session_ratings') || '[]'
      );

      return Array.isArray(storedRatings)
        ? storedRatings.map(Number).filter(Number.isFinite)
        : [];
    } catch {
      return [];
    }
  });
  const [sessionMinutes, setSessionMinutes] = useState(0);

  useEffect(() => {
    const fetchQueue = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/api/readings/review/tarot');
        setQueue(Array.isArray(response.data) ? response.data : []);
      } catch (requestError) {
        console.error('Failed to fetch tarot review queue:', requestError);
        setError(
          requestError.response?.data?.detail ||
            'The Arcana Archive could not be reached.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();

    // Session counters are intentionally initialized from state above.
    // This effect is reserved for synchronizing with the review API.
  }, []);

  const getSpreadName = (reading) => {
    return (
      reading?.spread_type ||
      reading?.spread ||
      reading?.spread_name ||
      'Tarot Reading'
    );
  };

  const getCards = (reading) => {
    const possibleCards = [
      reading?.cards,
      reading?.selected_cards,
      reading?.spread_cards,
      reading?.tarot_cards
    ];

    const found = possibleCards.find(Array.isArray);

    return found || [];
  };

  const getReadingText = (reading) => {
    if (!reading) {
      return '';
    }

    if (typeof reading.analysis === 'string') {
      return reading.analysis;
    }

    if (reading.analysis) {
      return JSON.stringify(reading.analysis, null, 2);
    }

    if (typeof reading.reading === 'string') {
      return reading.reading;
    }

    return 'No interpretation text was attached to this reading.';
  };

  const spreadOptions = Array.from(
    new Set(queue.map((reading) => getSpreadName(reading)))
  );

  const filteredQueue = queue
    .filter((reading) => {
      const username = String(reading.username || '').toLowerCase();
      const spread = getSpreadName(reading).toLowerCase();
      const query = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !query ||
        username.includes(query) ||
        spread.includes(query) ||
        String(reading._id || '').toLowerCase().includes(query);

      const matchesSpread =
        spreadFilter === 'all' || getSpreadName(reading) === spreadFilter;

      return matchesSearch && matchesSpread;
    })
    .sort((a, b) => {
      const first = new Date(a.created_at || 0).getTime();
      const second = new Date(b.created_at || 0).getTime();

      return sortOrder === 'oldest'
        ? first - second
        : second - first;
    });

  const resetReviewForm = () => {
    setSelectedReading(null);
    setSuggestions('');
    setCorrections('');
    setRating(5);
  };

  const submitFeedback = async (event) => {
    event.preventDefault();

    if (!selectedReading) {
      return;
    }

    if (!suggestions.trim() || !corrections.trim()) {
      setError(
        'Please provide both an improvement suggestion and an explicit correction before transmitting the review.'
      );
      return;
    }

    setSubmitting(true);
    setError(null);
    setFeedbackComplete(false);

    try {
      await api.post(
        `/api/readings/${selectedReading._id}/feedback`,
        {
          rating: parseInt(rating, 10),
          suggestions: suggestions.trim(),
          corrections: corrections.trim()
        }
      );

      const numericRating = parseInt(rating, 10);
      const nextRatings = [...sessionRatings, numericRating];
      const nextReviewCount = reviewedThisSession + 1;

      setSessionRatings(nextRatings);
      setReviewedThisSession(nextReviewCount);

      window.localStorage.setItem(
        'lunara_tarot_session_reviews',
        String(nextReviewCount)
      );

      window.localStorage.setItem(
        'lunara_tarot_session_ratings',
        JSON.stringify(nextRatings)
      );

      setQueue((currentQueue) =>
        currentQueue.filter((reading) => reading._id !== selectedReading._id)
      );

      setFeedbackComplete(true);
      resetReviewForm();

      window.setTimeout(() => {
        setFeedbackComplete(false);
      }, 3500);
    } catch (requestError) {
      console.error('Tarot feedback submission failed:', requestError);
      setError(
        requestError.response?.data?.detail ||
          'The expert review could not be transmitted to the archive.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const sessionAverage =
    sessionRatings.length > 0
      ? sessionRatings.reduce((sum, value) => sum + value, 0) /
        sessionRatings.length
      : null;

  useEffect(() => {
    const startedAt = Date.now();

    const updateSessionClock = () => {
      const elapsedMinutes = Math.floor(
        (Date.now() - startedAt) / 60000
      );
      setSessionMinutes(elapsedMinutes);
    };

    const timer = window.setInterval(updateSessionClock, 60000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  if (loading) {
    return (
      <div style={tarotWorkspaceLoadingStyle}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={reviewLoadingSealStyle}
        >
          ✦
        </motion.div>
        <div>
          <div style={panelEyebrowStyle}>ARCANA ARCHIVE</div>
          Loading Tarot Reader Workspace...
        </div>
      </div>
    );
  }

  return (
    <section style={tarotWorkspaceSectionStyle}>
      <div style={tarotWorkspaceTopBarStyle}>
        <div>
          <div style={panelEyebrowStyle}>
            HUMAN-IN-THE-LOOP INTELLIGENCE
          </div>
          <h2 style={tarotWorkspaceTitleStyle}>
            Tarot Interpretation Review Chamber
          </h2>
          <p style={tarotWorkspaceDescriptionStyle}>
            Your expert review becomes structured feedback for improving
            Lunara's tarot interpretation quality.
          </p>
        </div>

        <div style={tarotSessionTelemetryStyle}>
          <div style={tarotSessionTelemetryCellStyle}>
            <span style={{ display: 'block', fontSize: '0.48rem', letterSpacing: '1px', color: '#9c6c44' }}>SESSION</span>
            <strong>{sessionMinutes}m</strong>
          </div>
          <div style={tarotSessionTelemetryCellStyle}>
            <span style={{ display: 'block', fontSize: '0.48rem', letterSpacing: '1px', color: '#9c6c44' }}>REVIEWED</span>
            <strong>{reviewedThisSession}</strong>
          </div>
          <div style={tarotSessionTelemetryCellStyle}>
            <span style={{ display: 'block', fontSize: '0.48rem', letterSpacing: '1px', color: '#9c6c44' }}>AVG SCORE</span>
            <strong>
              {sessionAverage ? `${sessionAverage.toFixed(1)}` : '—'}
            </strong>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={tarotWorkspaceErrorStyle}
        >
          <strong>ARCHIVE SIGNAL</strong>
          <span>{error}</span>
        </motion.div>
      )}

      <div style={tarotWorkspaceToolbarStyle}>
        <div style={tarotSearchWrapStyle}>
          <span>⌕</span>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search seeker, spread or reading ID..."
            style={tarotSearchInputStyle}
          />
        </div>

        <select
          value={spreadFilter}
          onChange={(event) => setSpreadFilter(event.target.value)}
          style={tarotSelectStyle}
          aria-label="Filter by tarot spread"
        >
          <option value="all">All Spreads</option>
          {spreadOptions.map((spread) => (
            <option key={spread} value={spread}>
              {spread}
            </option>
          ))}
        </select>

        <select
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
          style={tarotSelectStyle}
          aria-label="Sort tarot reviews"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      <div style={tarotWorkspaceGridStyle}>
        <aside style={tarotQueuePanelStyle}>
          <div style={queueHeaderStyle}>
            <div style={panelEyebrowStyle}>REVIEW ARCHIVE</div>
            <h3 style={queueTitleStyle}>Pending Tarot Readings</h3>
            <div style={queueCounterStyle}>
              {filteredQueue.length}
              <span>VISIBLE</span>
            </div>
          </div>

          {filteredQueue.length === 0 ? (
            <EmptyArchive
              icon="✓"
              title={queue.length === 0 ? 'Archive Clear' : 'No Matches'}
              message={
                queue.length === 0
                  ? 'No pending tarot readings require expert evaluation right now.'
                  : 'Adjust the search or spread filter to reveal another reading.'
              }
              compact
            />
          ) : (
            <div style={tarotQueueListStyle}>
              {filteredQueue.map((reading, index) => {
                const selected = selectedReading?._id === reading._id;
                const hovered = hoveredQueueItem === reading._id;

                return (
                  <motion.button
                    key={reading._id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.035 }}
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      setSelectedReading(reading);
                      setError(null);
                    }}
                    onMouseEnter={() => setHoveredQueueItem(reading._id)}
                    onMouseLeave={() => setHoveredQueueItem(null)}
                    style={{
                      ...tarotQueueItemStyle,
                      background: selected
                        ? 'linear-gradient(135deg, #5c3a21, #2c1a0f)'
                        : hovered
                          ? 'rgba(212,184,149,0.48)'
                          : 'rgba(255,255,255,0.38)',
                      color: selected ? '#e8d5b5' : '#2c1a0f',
                      borderLeft: selected
                        ? '4px solid #d4b895'
                        : '4px solid transparent'
                    }}
                  >
                    <span style={tarotQueueNumberStyle}>
                      READING {String(index + 1).padStart(2, '0')}
                    </span>

                    <strong style={tarotQueueNameStyle}>
                      {reading.username || 'Anonymous Seeker'}
                    </strong>

                    <span style={tarotQueueSpreadStyle}>
                      {getSpreadName(reading)}
                    </span>

                    <span style={tarotQueueDateStyle}>
                      {reading.created_at
                        ? new Date(reading.created_at).toLocaleDateString()
                        : 'Date unavailable'}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          )}
        </aside>

        <main style={tarotReviewColumnStyle}>
          <AnimatePresence mode="wait">
            {selectedReading ? (
              <motion.div
                key={selectedReading._id}
                initial={{ opacity: 0, x: 25, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -20 }}
                style={tarotReviewCardStyle}
              >
                <CornerDecoration
                  position={{
                    top: '12px',
                    right: '12px',
                    transform: 'rotate(90deg)'
                  }}
                />

                <div style={tarotReviewHeaderStyle}>
                  <div>
                    <div style={panelEyebrowStyle}>
                      EXPERT REVIEW • TAROT INTERPRETATION
                    </div>
                    <h3 style={tarotReviewTitleStyle}>
                      {getSpreadName(selectedReading)}
                    </h3>
                  </div>

                  <div style={tarotReviewStatusStyle}>
                    <span style={tarotReviewStatusDotStyle} />
                    PENDING
                  </div>
                </div>

                <div style={tarotSeekerMetaGridStyle}>
                  <TarotMetaItem
                    label="SEEKER"
                    value={selectedReading.username || 'Anonymous'}
                  />
                  <TarotMetaItem
                    label="DATE"
                    value={
                      selectedReading.created_at
                        ? new Date(
                            selectedReading.created_at
                          ).toLocaleString()
                        : 'Unavailable'
                    }
                  />
                  <TarotMetaItem
                    label="READING ID"
                    value={String(selectedReading._id || 'Unknown').slice(-12)}
                  />
                </div>

                <TarotCardEvidence cards={getCards(selectedReading)} />

                <div style={tarotOracleOutputStyle}>
                  <div style={analysisPreviewHeaderStyle}>
                    <span>✦</span>
                    <strong>AI ORACLE OUTPUT</strong>
                    <span>✦</span>
                  </div>

                  <pre style={tarotOracleTextStyle}>
                    {getReadingText(selectedReading)}
                  </pre>
                </div>

                <form onSubmit={submitFeedback} style={tarotFeedbackFormStyle}>
                  <div style={tarotFeedbackHeadingStyle}>
                    <div>
                      <div style={panelEyebrowStyle}>QUALITY CONTROL</div>
                      <h4 style={tarotFeedbackHeadingTitleStyle}>
                        Expert Evaluation
                      </h4>
                    </div>
                    <span style={tarotFeedbackHeadingBadgeStyle}>
                      AI FEEDBACK DATASET
                    </span>
                  </div>

                  <div style={tarotRatingPanelStyle}>
                    <label style={labelStyle}>
                      Interpretation Accuracy &amp; Relevance
                    </label>

                    <div style={tarotRatingValueRowStyle}>
                      <strong style={tarotRatingValueNumberStyle}>
                        {rating}/10
                      </strong>
                      <span style={tarotRatingValueLabelStyle}>
                        {rating >= 9
                          ? 'Exceptional Interpretation'
                          : rating >= 8
                            ? 'Highly Accurate'
                            : rating >= 6
                              ? 'Useful With Refinement'
                              : rating >= 4
                                ? 'Requires Significant Attention'
                                : 'Critical Correction Required'}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={rating}
                      onChange={(event) => setRating(event.target.value)}
                      style={tarotRangeStyle}
                      aria-label="Tarot interpretation accuracy rating"
                    />

                    <div style={tarotRatingScaleStyle}>
                      {Array.from({ length: 10 }).map((_, index) => {
                        const value = index + 1;
                        const active = value <= Number(rating);

                        return (
                          <motion.button
                            key={value}
                            type="button"
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setRating(value)}
                            style={{
                              ...tarotRatingDotStyle,
                              background: active
                                ? '#8b0000'
                                : '#e8d5b5',
                              color: active ? '#f4e8c1' : '#5c3a21'
                            }}
                            aria-label={`Rate ${value} out of 10`}
                          >
                            {value}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={tarotFeedbackGridStyle}>
                    <div>
                      <label style={labelStyle}>
                        AI Improvement Guidance
                      </label>
                      <textarea
                        required
                        rows="5"
                        value={suggestions}
                        onChange={(event) => setSuggestions(event.target.value)}
                        style={inputStyle}
                        placeholder="Tell the AI what should improve: relevance, context, tone, card relationships, spread synthesis, personalization, or reasoning focus."
                      />
                      <div style={tarotFieldHintStyle}>
                        Structured suggestions become reusable expert feedback.
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>
                        Explicit Corrections
                      </label>
                      <textarea
                        required
                        rows="5"
                        value={corrections}
                        onChange={(event) => setCorrections(event.target.value)}
                        style={inputStyle}
                        placeholder="Identify concrete mistakes in card meaning, position, relationship, interpretation, or personalized guidance."
                      />
                      <div style={tarotFieldHintStyle}>
                        Corrections are preserved as high-value evaluation signals.
                      </div>
                    </div>
                  </div>

                  <div style={tarotTrainingNoticeStyle}>
                    <div style={tarotTrainingIconStyle}>⌁</div>
                    <div>
                      <strong style={{ color: '#3e2723', fontSize: '0.7rem', letterSpacing: '1px' }}>
                        HUMAN-IN-THE-LOOP LEARNING
                      </strong>
                      <p style={tarotTrainingTextStyle}>
                        This review is stored as expert feedback. It can later
                        contribute to evaluation datasets, prompt refinement,
                        recommendation tuning, and model-training workflows.
                      </p>
                    </div>
                  </div>

                  <div style={tarotActionRowStyle}>
                    <button
                      type="button"
                      onClick={resetReviewForm}
                      disabled={submitting}
                      style={tarotSecondaryButtonStyle}
                    >
                      Close Reading
                    </button>

                    <AnimatedButton type="submit" disabled={submitting}>
                      {submitting
                        ? 'Transmitting Expert Review...'
                        : 'Submit Expert Review'}
                    </AnimatedButton>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="tarot-empty-review"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={tarotEmptyReviewStyle}
              >
                <motion.div
                  animate={{
                    rotate: [0, 180, 360],
                    scale: [1, 1.08, 1]
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  style={tarotEmptySealStyle}
                >
                  ◈
                </motion.div>

                <div style={panelEyebrowStyle}>REVIEW CHAMBER</div>
                <h3>Select a Tarot Reading</h3>
                <p>
                  Choose a reading from the archive to inspect the AI output,
                  evaluate its relevance, and send expert feedback to the
                  intelligence pipeline.
                </p>

                <div style={tarotEmptyChecklistStyle}>
                  <span>✓ Inspect cards and spread</span>
                  <span>✓ Evaluate interpretation</span>
                  <span>✓ Rate accuracy from 1–10</span>
                  <span>✓ Suggest improvements and corrections</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {feedbackComplete && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              style={tarotSuccessMessageStyle}
            >
              <span>✓</span>
              <div>
                <strong style={tarotSuccessTitleStyle}>
                  EXPERT REVIEW ARCHIVED
                </strong>
                <small style={tarotSuccessDetailStyle}>
                  The Tarot quality signal has been transmitted successfully.
                </small>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      <TarotReviewPrinciples />
    </section>
  );
};

const TarotMetaItem = ({ label, value }) => (
  <div style={tarotMetaItemStyle}>
    <span style={tarotMetaItemLabelStyle}>{label}</span>
    <strong style={tarotMetaItemValueStyle} title={value}>
      {value}
    </strong>
  </div>
);

const TarotCardEvidence = ({ cards }) => {
  if (!cards || cards.length === 0) {
    return (
      <div style={tarotNoCardsStyle}>
        <span>◇</span>
        <div>
          <strong>Card evidence not exposed</strong>
          <small>
            The reading payload does not contain a card array. The full AI
            interpretation is still available for expert review.
          </small>
        </div>
      </div>
    );
  }

  return (
    <div style={tarotEvidenceSectionStyle}>
      <div style={tarotEvidenceHeaderStyle}>
        <span>CARD EVIDENCE</span>
        <strong>{cards.length} CARD{cards.length === 1 ? '' : 'S'}</strong>
      </div>

      <div style={tarotEvidenceGridStyle}>
        {cards.map((card, index) => {
          const name =
            typeof card === 'string'
              ? card
              : card?.name || card?.card || `Card ${index + 1}`;

          const position =
            typeof card === 'object'
              ? card?.position || card?.role || ''
              : '';

          const reversed =
            typeof card === 'object' &&
            (card?.reversed === true || card?.orientation === 'reversed');

          return (
            <motion.div
              key={`${name}-${index}`}
              whileHover={{ y: -4, rotate: index % 2 === 0 ? -1 : 1 }}
              style={tarotEvidenceCardStyle}
            >
              <div style={tarotEvidenceNumberStyle}>
                {String(index + 1).padStart(2, '0')}
              </div>
              <div style={tarotEvidenceSymbolStyle}>✦</div>
              <strong>{name}</strong>
              {position && <span>{position}</span>}
              {reversed && (
                <small style={tarotReversedBadgeStyle}>REVERSED</small>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const TarotReviewPrinciples = () => (
  <div style={tarotPrinciplesStyle}>
    <div style={panelEyebrowStyle}>REVIEW PROTOCOL</div>
    <div style={tarotPrinciplesGridStyle}>
      <div style={tarotPrincipleCardStyle}>
        <strong>01 • RELEVANCE</strong>
        <span>Does the interpretation fit the selected spread and cards?</span>
      </div>
      <div style={tarotPrincipleCardStyle}>
        <strong>02 • CONTEXT</strong>
        <span>Does it appropriately use the seeker's available context?</span>
      </div>
      <div style={tarotPrincipleCardStyle}>
        <strong>03 • CONSISTENCY</strong>
        <span>Is the synthesis coherent across card meanings and positions?</span>
      </div>
      <div style={tarotPrincipleCardStyle}>
        <strong>04 • GUIDANCE</strong>
        <span>Are the resulting insights useful, balanced and actionable?</span>
      </div>
    </div>
  </div>
);

/* =========================================================
   PALM ANALYST DASHBOARD
   =========================================================

   The Palm Analyst is a professional reviewer of AI-generated
   palm analyses. This dashboard is intentionally separate from
   the seeker-facing Palm Reader and does not open the scanner.

   Step 1 establishes the professional portal, workload telemetry,
   and a focused review-queue preview. Detailed image inspection,
   scoring, corrections, and structured AI feedback will be placed
   in the dedicated Palm Review Workspace in the next step.
   ========================================================= */

export const PalmAnalystDashboard = () => (
  <RoleDashboardHeader
    eyebrow="LUNARA • CHIROMANCY ARCHIVE"
    title="Palm Analyst Portal"
    icon="✋"
    description="Evaluate computer-vision palm analyses, verify interpretation quality, and provide structured expert feedback to improve Lunara's palmistry intelligence."
  >
    <PalmAnalystOverview />
    <PalmAnalystQueuePreview />

    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.18 }}
      style={{
        ...portalCardStyle,
        maxWidth: '760px',
        marginTop: '28px'
      }}
    >
      <div style={portalIconStyle}>◇</div>

      <div style={panelEyebrowStyle}>
        SEPARATE REVIEW WORKSPACE
      </div>

      <h2 style={portalCardTitleStyle}>
        Palm Analysis Chamber
      </h2>

      <p style={portalCardTextStyle}>
        Detailed palm-image inspection, line verification,
        accuracy scoring, corrections, and AI improvement
        feedback will live in a dedicated review workspace.
      </p>

      <motion.div whileHover={{ scale: 1.025, y: -2 }} whileTap={{ scale: 0.98 }}>
        <Link
          to="/palm-workspace"
          style={portalLinkStyle}
          aria-label="Open the Palm Analyst Review Workspace"
          title="Open the Palm Analyst Review Workspace"
        >
          Open Palm Review Workspace
          <span>➜</span>
        </Link>
      </motion.div>
    </motion.div>
  </RoleDashboardHeader>
);

/* =========================================================
   PALM ANALYST OVERVIEW
   ========================================================= */

const PalmAnalystOverview = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completedReviews] = useState(() => {
    const saved = Number(
      window.localStorage.getItem(
        'lunara_palm_analyst_completed_reviews'
      ) || '0'
    );
    return Number.isFinite(saved) ? saved : 0;
  });
  const [averageRating] = useState(() => {
    try {
      const saved = JSON.parse(
        window.localStorage.getItem(
          'lunara_palm_analyst_ratings'
        ) || '[]'
      );
      const ratings = Array.isArray(saved)
        ? saved.map(Number).filter(Number.isFinite)
        : [];
      return ratings.length
        ? ratings.reduce((sum, value) => sum + value, 0) /
            ratings.length
        : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let mounted = true;

    const loadOverview = async () => {
      try {
        const response = await api.get(
          '/api/readings/review/palm'
        );
        if (!mounted) return;
        const readings = Array.isArray(response.data)
          ? response.data
          : [];
        setPendingCount(readings.length);
      } catch (error) {
        console.error(
          'Failed to fetch palm analyst queue:',
          error
        );
        if (mounted) setPendingCount(0);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadOverview();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      style={palmAnalyticsSectionStyle}
    >
      <div style={palmAnalyticsHeaderStyle}>
        <div>
          <div style={panelEyebrowStyle}>
            ANALYST TELEMETRY • PALMISTRY
          </div>
          <h2 style={palmAnalyticsTitleStyle}>
            Palm Intelligence Overview
          </h2>
          <p style={palmAnalyticsDescriptionStyle}>
            Monitor the palm-analysis review workload and
            the quality signals produced by expert evaluation.
          </p>
        </div>

        <div style={palmAnalyticsSealStyle}>
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            ✋
          </motion.span>
        </div>
      </div>

      <div style={palmMetricGridStyle}>
        <PalmMetricCard
          icon="⌂"
          label="Pending Analyses"
          value={loading ? '—' : pendingCount}
          detail="AI readings awaiting expert review"
          accent="red"
        />
        <PalmMetricCard
          icon="✎"
          label="Reviews Completed"
          value={completedReviews}
          detail="Expert evaluations recorded"
          accent="brown"
        />
        <PalmMetricCard
          icon="★"
          label="Average Accuracy"
          value={
            averageRating
              ? `${averageRating.toFixed(1)}/10`
              : '—'
          }
          detail="Average analyst quality score"
          accent="green"
        />
        <PalmMetricCard
          icon="◇"
          label="Review Mode"
          value="HUMAN"
          detail="Professional verification layer"
          accent="gold"
        />
      </div>
    </motion.section>
  );
};

/* =========================================================
   PALM ANALYST QUEUE PREVIEW
   ========================================================= */

const PalmAnalystQueuePreview = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchPalmQueue = async () => {
      try {
        const response = await api.get(
          '/api/readings/review/palm'
        );
        if (!mounted) return;
        setQueue(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (requestError) {
        console.error(
          'Failed to fetch palm review queue:',
          requestError
        );
        if (mounted) {
          setError(
            requestError.response?.data?.detail ||
              'The Chiromancy Archive could not be reached.'
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPalmQueue();
    return () => {
      mounted = false;
    };
  }, []);

  const getHand = (reading) => (
    reading?.hand_analyzed ||
    reading?.hand ||
    'Hand not specified'
  );

  const getReadingDate = (reading) => {
    if (!reading?.created_at) return 'Date unavailable';
    const date = new Date(reading.created_at);
    return Number.isNaN(date.getTime())
      ? 'Date unavailable'
      : date.toLocaleDateString();
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.08 }}
      style={palmQueueSectionStyle}
    >
      <div style={palmQueueHeaderStyle}>
        <div>
          <div style={panelEyebrowStyle}>
            REVIEW ARCHIVE • PALMISTRY
          </div>
          <h2 style={palmQueueTitleStyle}>
            Pending Palm Analyses
          </h2>
          <p style={palmQueueDescriptionStyle}>
            A focused preview of AI-generated palm analyses
            waiting for professional verification.
          </p>
        </div>

        <div style={palmQueueBadgeStyle}>
          <span>{loading ? '—' : queue.length}</span>
          <small style={palmQueueBadgeSmallStyle}>
            AWAITING REVIEW
          </small>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={palmQueueErrorStyle}
        >
          <strong>ARCHIVE SIGNAL</strong>
          <span>{error}</span>
        </motion.div>
      )}

      {loading ? (
        <div style={palmQueueLoadingStyle}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={palmQueueLoadingSealStyle}
          >
            ✦
          </motion.div>
          <span>Retrieving pending palm analyses...</span>
        </div>
      ) : queue.length === 0 ? (
        <EmptyArchive
          icon="✓"
          title="Palm Review Queue Clear"
          message="There are currently no pending AI palm analyses requiring your expertise."
          compact
        />
      ) : (
        <div style={palmQueueGridStyle}>
          {queue.slice(0, 6).map((reading, index) => (
            <motion.div
              key={reading._id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -3 }}
              onMouseEnter={() =>
                setHoveredItem(reading._id || index)
              }
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                ...palmQueueItemStyle,
                borderColor:
                  hoveredItem === (reading._id || index)
                    ? '#5c3a21'
                    : '#9c6c44',
                boxShadow:
                  hoveredItem === (reading._id || index)
                    ? '0 8px 18px rgba(44,26,15,0.13)'
                    : '0 4px 12px rgba(44,26,15,0.06)'
              }}
            >
              <div style={palmQueueItemNumberStyle}>
                ANALYSIS {String(index + 1).padStart(2, '0')}
              </div>
              <strong style={palmQueueItemNameStyle}>
                Seeker: {reading.username || 'Unknown Seeker'}
              </strong>
              <div style={palmQueueItemMetaStyle}>
                <span>HAND • {getHand(reading)}</span>
                <span>{getReadingDate(reading)}</span>
              </div>
              <div style={palmQueueItemStatusStyle}>
                <span>●</span>
                AWAITING EXPERT REVIEW
              </div>

              <Link
                to={`/palm-workspace?reading=${encodeURIComponent(
                  reading._id || ''
                )}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '12px',
                  padding: '9px 13px',
                  borderRadius: '4px',
                  border: '1px solid #8b0000',
                  background: 'linear-gradient(135deg, #8b0000, #5c3a21)',
                  color: '#f4e8c1',
                  textDecoration: 'none',
                  fontSize: '0.68rem',
                  fontWeight: 'bold',
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 10px rgba(92,58,33,0.16)'
                }}
                aria-label={`Open palm analysis ${index + 1} for expert review`}
              >
                OPEN REVIEW
                <span>➜</span>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && queue.length > 6 && (
        <div style={palmQueueMoreStyle}>
          <span>◆</span>
          {queue.length - 6} additional analyses remain in
          the archive.
          <span>◆</span>
        </div>
      )}
    </motion.section>
  );
};

/* =========================================================
   PALM ANALYST METRIC CARD
   ========================================================= */

const PalmMetricCard = ({
  icon,
  label,
  value,
  detail,
  accent
}) => {
  const accentMap = {
    red: '#8b0000',
    gold: '#9c6c44',
    brown: '#5c3a21',
    green: '#166534'
  };

  const accentColor =
    accentMap[accent] || '#5c3a21';

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      style={{
        ...palmMetricCardStyle,
        borderTop: `3px solid ${accentColor}`
      }}
    >
      <div
        style={{
          ...palmMetricIconStyle,
          color: accentColor,
          borderColor: accentColor
        }}
      >
        {icon}
      </div>
      <div style={palmMetricLabelStyle}>{label}</div>
      <div
        style={{
          ...palmMetricValueStyle,
          color: accentColor
        }}
      >
        {value}
      </div>
      <div style={palmMetricDetailStyle}>{detail}</div>
    </motion.div>
  );
};

/* =========================================================
   PALM ANALYST REVIEW WORKSPACE
   =========================================================

   This is deliberately separate from PalmAnalystDashboard.
   The dashboard provides workload awareness; this workspace
   provides the actual professional inspection surface.

   Step 2 responsibilities:
   - Load pending palm analyses from the review API.
   - Let the analyst select one analysis.
   - Display the available original/processed palm image.
   - Surface detected palm features without changing them.
   - Display the AI-generated interpretation.
   - Keep professional review controls ready for the next step.

   Rating, correction fields and feedback submission are intentionally
   not added here yet. They belong to the next Palm Analyst step.
   ========================================================= */

export const PalmAnalystWorkspace = () => {
  const [searchParams] = useSearchParams();
  const [queue, setQueue] = useState([]);
  const [selectedReading, setSelectedReading] = useState(null);
  const [palmImageLoadErrorId, setPalmImageLoadErrorId] = useState(null);
  const palmImageErrorKey = selectedReading?._id
    ? String(selectedReading._id)
    : null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [rating, setRating] = useState(5);
  const [verdict, setVerdict] = useState('PARTIALLY CORRECT');
  const [suggestions, setSuggestions] = useState('');
  const [corrections, setCorrections] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackComplete, setFeedbackComplete] = useState(false);

  const requestedReadingId =
    searchParams.get('reading') ||
    searchParams.get('reading_id') ||
    '';


  useEffect(() => {
    let mounted = true;

    const fetchQueue = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get(
          '/api/readings/review/palm'
        );

        if (!mounted) {
          return;
        }

        const readings = Array.isArray(response.data)
          ? response.data
          : [];

        setQueue(readings);

        if (readings.length > 0) {
          const requestedReading = requestedReadingId
            ? readings.find(
                (reading) =>
                  String(reading._id) ===
                  String(requestedReadingId)
              )
            : null;

          setPalmImageLoadErrorId(null);
          setSelectedReading(
            requestedReading || readings[0]
          );
        } else {
          setPalmImageLoadErrorId(null);
          setSelectedReading(null);
        }
      } catch (requestError) {
        console.error(
          'Failed to fetch palm analyst workspace queue:',
          requestError
        );

        if (mounted) {
          setError(
            requestError.response?.data?.detail ||
              'The Chiromancy Review Archive could not be reached.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchQueue();

    return () => {
      mounted = false;
    };
  }, [requestedReadingId]);

  const normalizePalmImageSource = (value, fallbackMimeType = 'image/jpeg') => {
    if (!value) {
      return null;
    }

    if (typeof value === 'object') {
      if (typeof value.url === 'string') {
        return normalizePalmImageSource(
          value.url,
          value.content_type || fallbackMimeType
        );
      }

      if (typeof value.src === 'string') {
        return normalizePalmImageSource(
          value.src,
          value.content_type || fallbackMimeType
        );
      }

      if (typeof value.data === 'string') {
        return normalizePalmImageSource(
          value.data,
          value.content_type || fallbackMimeType
        );
      }

      if (value.$binary?.base64) {
        return `data:${fallbackMimeType};base64,${value.$binary.base64}`;
      }

      return null;
    }

    const source = String(value).trim();

    if (!source) {
      return null;
    }

    if (
      source.startsWith('data:image/') ||
      source.startsWith('http://') ||
      source.startsWith('https://') ||
      source.startsWith('blob:') ||
      source.startsWith('/')
    ) {
      return source;
    }

    const compactBase64 = source.replace(/\s+/g, '');

    if (
      compactBase64.length > 100 &&
      /^[A-Za-z0-9+/]+={0,2}$/.test(compactBase64)
    ) {
      return `data:${fallbackMimeType};base64,${compactBase64}`;
    }

    return null;
  };

  const getPalmImage = (reading) => {
    if (!reading) {
      return null;
    }

    const mimeType =
      reading.image_content_type ||
      reading.content_type ||
      'image/jpeg';

    const imageCandidates = [
      reading.original_image,
      reading.image,
      reading.palm_image,
      reading.image_url,
      reading.palm_image_url,
      reading.processed_image_url,
      reading.processed_image
    ];

    for (const candidate of imageCandidates) {
      const normalized = normalizePalmImageSource(
        candidate,
        mimeType
      );

      if (normalized) {
        return normalized;
      }
    }

    return null;
  };

  const getAnalysisObject = (reading) => {
    if (!reading?.analysis) {
      return {};
    }

    if (
      typeof reading.analysis === 'object' &&
      !Array.isArray(reading.analysis)
    ) {
      return reading.analysis;
    }

    try {
      const parsed = JSON.parse(reading.analysis);

      return parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed)
        ? parsed
        : { Interpretation: reading.analysis };
    } catch {
      return {
        Interpretation: String(reading.analysis)
      };
    }
  };

  const stringifyAnalysisValue = (value) => {
    if (typeof value === 'string') {
      return value;
    }

    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value ?? '');
    }
  };

  const getFeatureEntries = (reading) => {
    const analysis = getAnalysisObject(reading);

    const featureNames = [
      'Life Line',
      'Head Line',
      'Heart Line',
      'Fate Line',
      'Sun Line',
      'Palm Shape',
      'Finger Structure',
      'Mounts',
      'CategoryScores',
      'Detected Features',
      'Detected Lines'
    ];

    const namedEntries = featureNames
      .filter(
        (name) =>
          analysis[name] !== undefined &&
          analysis[name] !== null
      )
      .map((name) => ({
        name,
        value: stringifyAnalysisValue(analysis[name])
      }));

    const existingNames = new Set(
      namedEntries.map((entry) => entry.name)
    );

    return Object.entries(analysis)
      .filter(([name, value]) => {
        if (
          existingNames.has(name) ||
          value === undefined ||
          value === null
        ) {
          return false;
        }

        const normalized = String(name)
          .trim()
          .toLowerCase();

        return (
          normalized.includes('line') ||
          normalized.includes('feature') ||
          normalized.includes('shape') ||
          normalized.includes('finger') ||
          normalized.includes('mount')
        );
      })
      .map(([name, value]) => ({
        name,
        value: stringifyAnalysisValue(value)
      }))
      .concat(namedEntries);
  };

  const getAnalysisSections = (reading) => {
    const analysis = getAnalysisObject(reading);

    return Object.entries(analysis).map(
      ([name, value]) => ({
        name,
        value: stringifyAnalysisValue(value)
      })
    );
  };

  const getReadingSummary = (reading) => {
    const analysis = getAnalysisObject(reading);

    const preferredKeys = [
      'Overall Topological Synthesis',
      'Overall Synthesis',
      'Overall Interpretation',
      'Interpretation',
      'Summary'
    ];

    for (const key of preferredKeys) {
      if (
        typeof analysis[key] === 'string' &&
        analysis[key].trim()
      ) {
        return analysis[key];
      }
    }

    if (typeof reading?.analysis === 'string') {
      return reading.analysis;
    }

    return 'No overall synthesis was attached to this analysis record.';
  };

  const resetReviewForm = () => {
    setRating(5);
    setVerdict('PARTIALLY CORRECT');
    setSuggestions('');
    setCorrections('');
    setFeedbackComplete(false);
  };

  const selectReading = (reading) => {
    setPalmImageLoadErrorId(null);
    setSelectedReading(reading);
    setError(null);
    resetReviewForm();
  };

  const submitFeedback = async (event) => {
    event.preventDefault();

    if (!selectedReading) {
      return;
    }

    if (!suggestions.trim() || !corrections.trim()) {
      setError(
        'Please provide both an AI improvement suggestion and the professional correction/update before submitting.'
      );
      return;
    }

    setSubmitting(true);
    setError(null);
    setFeedbackComplete(false);

    try {
      await api.post(
        `/api/readings/${selectedReading._id}/feedback`,
        {
          rating: parseInt(rating, 10),
          verdict,
          suggestions: suggestions.trim(),
          corrections: corrections.trim()
        }
      );

      const numericRating = parseInt(rating, 10);

      const previousReviews = Number(
        window.localStorage.getItem(
          'lunara_palm_session_reviews'
        ) || '0'
      );

      const safePreviousReviews =
        Number.isFinite(previousReviews)
          ? previousReviews
          : 0;

      const storedRatings = JSON.parse(
        window.localStorage.getItem(
          'lunara_palm_session_ratings'
        ) || '[]'
      );

      const previousRatings = Array.isArray(storedRatings)
        ? storedRatings.map(Number).filter(Number.isFinite)
        : [];

      const nextReviews =
        safePreviousReviews + 1;

      const nextRatings = [
        ...previousRatings,
        numericRating
      ];

      window.localStorage.setItem(
        'lunara_palm_session_reviews',
        String(nextReviews)
      );

      window.localStorage.setItem(
        'lunara_palm_session_ratings',
        JSON.stringify(nextRatings)
      );

      setQueue((currentQueue) =>
        currentQueue.filter(
          (reading) =>
            String(reading._id) !==
            String(selectedReading._id)
        )
      );

      setPalmImageLoadErrorId(null);
      setSelectedReading(null);
      resetReviewForm();
      setFeedbackComplete(true);

      window.setTimeout(() => {
        setFeedbackComplete(false);
      }, 3500);
    } catch (requestError) {
      console.error(
        'Palm expert feedback submission failed:',
        requestError
      );

      setError(
        requestError.response?.data?.detail ||
          'The professional palm review could not be transmitted to the archive.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const imageSource = getPalmImage(selectedReading);
  const featureEntries = getFeatureEntries(
    selectedReading
  );
  const analysisSections = getAnalysisSections(
    selectedReading
  );

  if (loading) {
    return (
      <div style={palmWorkspaceLoadingStyle}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={reviewLoadingSealStyle}
        >
          ✋
        </motion.div>

        <div>
          <div style={panelEyebrowStyle}>
            CHIROMANCY ARCHIVE
          </div>
          Loading Palm Analyst Workspace...
        </div>
      </div>
    );
  }

  return (
    <div style={palmWorkspaceStyle}>
      <div style={palmWorkspaceTopBarStyle}>
        <div>
          <div style={panelEyebrowStyle}>
            HUMAN-IN-THE-LOOP INTELLIGENCE
          </div>

          <h2 style={palmWorkspaceTitleStyle}>
            Palm Interpretation Review Chamber
          </h2>

          <p style={palmWorkspaceDescriptionStyle}>
            Inspect the submitted palm evidence and the complete
            AI prediction, then record your professional verdict,
            accuracy score, corrections and improvement guidance.
          </p>
        </div>

        <div style={palmWorkspaceTelemetryStyle}>
          <div style={palmWorkspaceTelemetryCellStyle}>
            <span style={palmWorkspaceTelemetryLabelStyle}>
              QUEUE
            </span>
            <strong>{queue.length}</strong>
          </div>

          <div style={palmWorkspaceTelemetryCellStyle}>
            <span style={palmWorkspaceTelemetryLabelStyle}>
              SELECTED
            </span>
            <strong>
              {selectedReading ? 'ACTIVE' : '—'}
            </strong>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={palmWorkspaceErrorStyle}
        >
          <strong>ARCHIVE SIGNAL</strong>
          <span>{error}</span>
        </motion.div>
      )}

      {feedbackComplete && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: '18px',
            padding: '14px 18px',
            border: '1px solid #166534',
            borderRadius: '5px',
            background: 'rgba(22,101,52,0.09)',
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 'bold',
            letterSpacing: '0.6px'
          }}
        >
          <span>✓</span>
          Professional review saved. The AI analysis has been
          removed from the pending review queue.
        </motion.div>
      )}

      <div style={palmWorkspaceGridStyle}>
        <aside style={palmWorkspaceQueueStyle}>
          <div style={panelEyebrowStyle}>
            REVIEW QUEUE
          </div>

          <h3 style={palmWorkspaceQueueTitleStyle}>
            Pending Palm Analyses
          </h3>

          <p
            style={{
              margin: '0 0 15px',
              color: '#705038',
              fontSize: '0.78rem',
              lineHeight: '1.5'
            }}
          >
            Select a specific AI-generated analysis to inspect
            its evidence and prediction.
          </p>

          {queue.length === 0 ? (
            <EmptyArchive
              icon="✓"
              title="Queue Clear"
              message="No pending palm analyses are available for professional inspection."
              compact
            />
          ) : (
            <div style={palmWorkspaceQueueListStyle}>
              {queue.map((reading, index) => {
                const active =
                  selectedReading?._id === reading._id;

                const hovered =
                  hoveredItem === reading._id;

                return (
                  <motion.button
                    key={reading._id || index}
                    type="button"
                    initial={{
                      opacity: 0,
                      x: -10
                    }}
                    animate={{
                      opacity: 1,
                      x: 0
                    }}
                    transition={{
                      delay: index * 0.04
                    }}
                    whileHover={{
                      x: 4
                    }}
                    onClick={() =>
                      selectReading(reading)
                    }
                    onMouseEnter={() =>
                      setHoveredItem(reading._id)
                    }
                    onMouseLeave={() =>
                      setHoveredItem(null)
                    }
                    style={{
                      ...palmWorkspaceQueueItemStyle,
                      background: active
                        ? 'linear-gradient(135deg, #5c3a21, #2c1a0f)'
                        : hovered
                          ? 'rgba(212,184,149,0.48)'
                          : 'rgba(255,255,255,0.38)',
                      color: active
                        ? '#e8d5b5'
                        : '#2c1a0f',
                      borderLeft: active
                        ? '4px solid #d4b895'
                        : '4px solid transparent'
                    }}
                  >
                    <span style={palmWorkspaceQueueNumberStyle}>
                      <span
                        style={{
                          display: 'block',
                        fontSize: '0.62rem',
                        letterSpacing: '1.5px',
                        opacity: 0.72,
                        marginBottom: '5px'
                      }}
                    >
                      ANALYSIS {String(index + 1).padStart(2, '0')}
                      </span>
                    </span>

                    <span style={palmWorkspaceQueueNameStyle}>
                      <strong>
                        {reading.username ||
                          'Unknown Seeker'}
                      </strong>
                    </span>

                    <span style={palmWorkspaceQueueMetaStyle}>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.74rem',
                        marginTop: '5px',
                        opacity: 0.78
                      }}
                    >
                      HAND •{' '}
                      {reading.hand_analyzed ||
                        reading.hand ||
                        'Not specified'}
                      </span>
                    </span>

                    <span style={palmWorkspaceQueueDateStyle}>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.72rem',
                        marginTop: '4px',
                        opacity: 0.7
                      }}
                    >
                      {reading.created_at
                        ? new Date(
                            reading.created_at
                          ).toLocaleDateString()
                        : 'Date unavailable'}
                      </span>
                    </span>

                    <span
                      style={{
                        display: 'block',
                        marginTop: '9px',
                        fontSize: '0.62rem',
                        letterSpacing: '1px',
                        fontWeight: 'bold',
                        color: active
                          ? '#f0c76b'
                          : '#8b0000'
                      }}
                    >
                      ● AWAITING EXPERT REVIEW
                    </span>
                  </motion.button>
                );
              })}
            </div>
          )}
        </aside>

        <main style={palmWorkspaceReviewColumnStyle}>
          <AnimatePresence mode="wait">
            {selectedReading ? (
              <motion.div
                key={selectedReading._id}
                initial={{
                  opacity: 0,
                  x: 25,
                  filter: 'blur(4px)'
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  filter: 'blur(0px)'
                }}
                exit={{
                  opacity: 0,
                  x: -20
                }}
                style={palmReviewCardStyle}
              >
                <CornerDecoration
                  position={{
                    top: '12px',
                    right: '12px',
                    transform: 'rotate(90deg)'
                  }}
                />

                <div style={palmReviewHeaderStyle}>
                  <div>
                    <div style={panelEyebrowStyle}>
                      HUMAN REVIEW • AI OUTPUT
                    </div>

                    <h3
                      style={{
                        ...reviewTitleStyle,
                        ...palmReviewTitleStyle,
                        marginBottom: '8px'
                      }}
                    >
                      Analysis Review
                    </h3>
                  </div>

                  <span style={palmReviewStatusStyle}>
                    <span style={palmReviewStatusDotStyle} />
                    AWAITING EXPERT REVIEW
                  </span>
                </div>

                <div style={palmSeekerMetaGridStyle}>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px 18px',
                      marginBottom: '18px',
                      padding: '10px 12px',
                      border: '1px solid #c8a77a',
                      background: 'rgba(255,255,255,0.28)',
                      borderRadius: '4px'
                    }}
                  >
                  <span>
                    <strong>SEEKER:</strong>{' '}
                    {selectedReading.username ||
                      'Unknown Seeker'}
                  </span>

                  <span>
                    <strong>HAND:</strong>{' '}
                    {selectedReading.hand_analyzed ||
                      selectedReading.hand ||
                      'Not specified'}
                  </span>

                  <span>
                    <strong>READING ID:</strong>{' '}
                    {String(selectedReading._id)}
                  </span>
                </div>

                <div style={palmMetaItemStyle}>
                  <span style={palmMetaItemLabelStyle}>REVIEW STATUS</span>
                  <strong style={palmMetaItemValueStyle}>AWAITING EXPERT REVIEW</strong>
                </div>
                </div>

                <div style={palmEvidenceGridStyle}>
                  <div style={palmImagePanelStyle}>
                    <div style={palmEvidenceHeadingStyle}>
                      <span>✋</span>
                      <strong>PALM IMAGE EVIDENCE</strong>
                    </div>

                    {imageSource && palmImageLoadErrorId !== palmImageErrorKey ? (
                      <div style={palmImageFrameStyle}>
                        <img
                          src={imageSource}
                          alt="Palm submitted for professional analysis"
                          style={palmImageStyle}
                          onError={() => setPalmImageLoadErrorId(palmImageErrorKey)}
                        />
                      </div>
                    ) : (
                      <div style={palmImagePlaceholderStyle}>
                        <motion.div
                          animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{
                            duration: 2.4,
                            repeat: Infinity
                          }}
                          style={palmPlaceholderSealStyle}
                        >
                          ✋
                        </motion.div>

                        <strong>
                          IMAGE REFERENCE UNAVAILABLE
                        </strong>

                        <span>
                          This API record does not contain a
                          displayable palm-image source yet. Newly created
                          palm readings store the original evidence image
                          as a data URI for professional review.
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={palmFeaturePanelStyle}>
                    <div style={palmEvidenceHeadingStyle}>
                      <span>◇</span>
                      <strong>
                        AI-DETECTED FEATURES
                      </strong>
                    </div>

                    {featureEntries.length === 0 ? (
                      <div style={palmFeatureEmptyStyle}>
                        <span>◇</span>
                        <strong>
                          No named feature fields detected
                        </strong>
                        <p>
                          The complete AI output is still
                          available in the interpretation
                          section below.
                        </p>
                      </div>
                    ) : (
                      <div style={palmFeatureListStyle}>
                        {featureEntries.map(
                          (feature) => (
                            <div
                              key={feature.name}
                              style={palmFeatureItemStyle}
                            >
                              <span
                                style={
                                  palmFeatureItemLabelStyle
                                }
                              >
                                {feature.name}
                              </span>

                              <p
                                style={
                                  palmFeatureItemTextStyle
                                }
                              >
                                {feature.value}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div style={palmOracleOutputStyle}>
                  <div
                    style={analysisPreviewHeaderStyle}
                  >
                    <span>✦</span>
                    <strong>
                      COMPLETE AI INTERPRETATION
                    </strong>
                    <span>✦</span>
                  </div>

                  <div
                    style={{
                      padding: '14px',
                      marginBottom: '14px',
                      border: '1px solid #c8a77a',
                      borderRadius: '4px',
                      background: 'rgba(139,0,0,0.035)'
                    }}
                  >
                    <div
                      style={{
                        color: '#8b0000',
                        fontSize: '0.66rem',
                        fontWeight: 'bold',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        marginBottom: '7px'
                      }}
                    >
                      OVERALL AI SYNTHESIS
                    </div>

                    <p
                      style={{
                        ...palmOracleTextStyle,
                        margin: 0,
                        color: '#2c1a0f',
                        lineHeight: '1.7',
                        fontFamily: 'Georgia, serif'
                      }}
                    >
                      {getReadingSummary(
                        selectedReading
                      )}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    {analysisSections.map(
                      (section) => (
                        <div
                          key={section.name}
                          style={{
                            padding: '12px 14px',
                            border: '1px solid rgba(156,108,68,0.55)',
                            borderRadius: '4px',
                            background:
                              'rgba(255,255,255,0.25)'
                          }}
                        >
                          <div
                            style={{
                              color: '#5c3a21',
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                              letterSpacing: '1px',
                              textTransform: 'uppercase',
                              marginBottom: '6px'
                            }}
                          >
                            {section.name}
                          </div>

                          <pre
                            style={{
                              margin: 0,
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              fontFamily: 'sans-serif',
                              fontSize: '0.82rem',
                              color: '#2c1a0f',
                              lineHeight: '1.6'
                            }}
                          >
                            {section.value}
                          </pre>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <form
                  onSubmit={submitFeedback}
                  style={{
                    marginTop: '20px',
                    paddingTop: '20px',
                    borderTop: '2px dashed #9c6c44',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px'
                  }}
                >
                  <div style={palmReviewBoundaryStyle}>
                    <div style={panelEyebrowStyle}>
                      PROFESSIONAL EVALUATION
                    </div>

                    <h4
                      style={{
                        ...palmReviewBoundaryHeadingStyle,
                        margin: '5px 0 6px'
                      }}
                    >
                      How accurate is the AI prediction?
                    </h4>

                    <p
                      style={{
                        ...palmReviewBoundaryTextStyle,
                        margin: 0
                      }}
                    >
                      Compare the palm evidence and AI
                      interpretation before assigning the
                      professional verdict.
                    </p>
                  </div>

                  <div>
                    <label style={labelStyle}>
                      Expert Verdict
                    </label>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(3, minmax(0, 1fr))',
                        gap: '8px'
                      }}
                    >
                      {[
                        'CORRECT',
                        'PARTIALLY CORRECT',
                        'INCORRECT'
                      ].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setVerdict(option)
                          }
                          style={{
                            padding: '12px 8px',
                            borderRadius: '4px',
                            border:
                              verdict === option
                                ? '2px solid #8b0000'
                                : '1px solid #9c6c44',
                            background:
                              verdict === option
                                ? 'rgba(139,0,0,0.1)'
                                : 'rgba(255,255,255,0.32)',
                            color:
                              verdict === option
                                ? '#8b0000'
                                : '#5c3a21',
                            fontWeight: 'bold',
                            fontSize: '0.68rem',
                            letterSpacing: '0.7px',
                            cursor: 'pointer'
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>
                      Accuracy Rating: {rating}/10
                    </label>

                    <div style={ratingDisplayStyle}>
                      <span>1</span>

                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={rating}
                        onChange={(event) =>
                          setRating(
                            Number(event.target.value)
                          )
                        }
                        style={{
                          width: '100%',
                          cursor: 'pointer'
                        }}
                        aria-label="AI accuracy rating from 1 to 10"
                      />

                      <span>10</span>
                    </div>

                    <div
                      style={{
                        marginTop: '7px',
                        textAlign: 'center',
                        color:
                          rating >= 8
                            ? '#166534'
                            : rating >= 5
                              ? '#9c6c44'
                              : '#8b0000',
                        fontWeight: 'bold',
                        fontSize: '0.8rem'
                      }}
                    >
                      {rating >= 8
                        ? 'HIGHLY ACCURATE'
                        : rating >= 5
                          ? 'PARTIALLY ACCURATE'
                          : 'REQUIRES CORRECTION'}
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>
                      AI Improvement Feedback
                    </label>

                    <textarea
                      required
                      rows="5"
                      value={suggestions}
                      onChange={(event) =>
                        setSuggestions(
                          event.target.value
                        )
                      }
                      style={{
                        ...inputStyle,
                        minHeight: '120px'
                      }}
                      placeholder="Explain what the AI understood correctly, what it should focus on improving, or what additional palm evidence it should consider."
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>
                      Professional Corrections / Updated
                      Interpretation
                    </label>

                    <textarea
                      required
                      rows="7"
                      value={corrections}
                      onChange={(event) =>
                        setCorrections(
                          event.target.value
                        )
                      }
                      style={{
                        ...inputStyle,
                        minHeight: '155px'
                      }}
                      placeholder="Write the corrected interpretation, inaccurate findings, missing observations, or any professional updates the AI should have made."
                    />
                  </div>

                  <AnimatedButton
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: '100%',
                      marginTop: '4px'
                    }}
                  >
                    {submitting
                      ? 'TRANSMITTING EXPERT REVIEW...'
                      : 'SUBMIT PROFESSIONAL REVIEW'}
                  </AnimatedButton>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="empty-palm-review"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={palmEmptyReviewStyle}
              >
                <motion.div
                  animate={{
                    rotate: [0, 180, 360],
                    scale: [1, 1.08, 1]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                  style={emptyReviewSealStyle}
                >
                  ✋
                </motion.div>

                <div style={panelEyebrowStyle}>
                  REVIEW CHAMBER
                </div>

                <h3>
                  Select a Palm Analysis
                </h3>

                <p>
                  Choose a pending analysis from the archive
                  to inspect the original evidence, the complete
                  AI prediction, and then submit your professional
                  evaluation.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

/* =========================================================
   SPIRITUAL CONSULTANT DASHBOARD
   ========================================================= */

/* =========================================================
   SPIRITUAL CONSULTANT DASHBOARD
   =========================================================

   The consultant is a professional guidance practitioner.
   This surface is deliberately separate from seeker reading tools.

   Current frontend capabilities:
   - consultation planning
   - session status tracking
   - guidance focus capture
   - professional session notes
   - local consultant archive persistence
   - clear indication that a dedicated consultation API is not
     yet connected to this dashboard

   No Tarot, Palm Analyst or seeker functionality is embedded here.
   ========================================================= */

export const SpiritualConsultantDashboard = ({ view = 'dashboard' } = {}) => {
  const consultantStorageKey = 'lunara_consultant_sessions';

  const loadConsultantSessions = () => {
    try {
      const saved = window.localStorage.getItem(
        consultantStorageKey
      );

      if (!saved) {
        return [];
      }

      const parsed = JSON.parse(saved);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch (storageError) {
      console.error(
        'Failed to load consultant session archive:',
        storageError
      );

      return [];
    }
  };

  const [sessions, setSessions] = useState(
    loadConsultantSessions
  );

  const [selectedSessionId, setSelectedSessionId] =
    useState(null);

  const [seekerName, setSeekerName] =
    useState('');

  const [sessionType, setSessionType] =
    useState('Spiritual Guidance');

  const [sessionDate, setSessionDate] =
    useState('');

  const [sessionTime, setSessionTime] =
    useState('');

  const [guidanceFocus, setGuidanceFocus] =
    useState('');

  const [sessionNotes, setSessionNotes] =
    useState('');

  const [notice, setNotice] =
    useState('');

  const [activePanel, setActivePanel] =
    useState(view === 'consultations' ? 'sessions' : 'overview');

  /*
   * The same consultant data and session handlers power two distinct
   * destinations. Dashboard opens on the overview; /consultations opens
   * directly on the session workspace without duplicating storage logic.
   */
  const isConsultationsView = view === 'consultations';

  const [queueSearch, setQueueSearch] =
    useState('');

  const [queueStatus, setQueueStatus] =
    useState('ALL');

  const [sessionRating, setSessionRating] =
    useState('');

  const [sessionOutcome, setSessionOutcome] =
    useState('');

  const [backendState, setBackendState] =
    useState('LOCAL ARCHIVE');

  const [syncingArchive, setSyncingArchive] =
    useState(false);
  const [consultationLoadError, setConsultationLoadError] = useState('');
  const [consultationUpdatingId, setConsultationUpdatingId] = useState(null);

  const [consultantProfile, setConsultantProfile] = useState({
    professional_name: '', biography: '', specialties: '', years_experience: '0',
    languages: '', session_rate: '', currency: 'INR', session_modes: ['chat'],
    working_hours: '', availability_status: 'offline', status: 'pending'
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileNotice, setProfileNotice] = useState('');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadProfessionalProfile = async () => {
      setProfileLoading(true);
      try {
        const response = await api.get('/api/consultants/me');
        const data = response.data || {};
        if (isMounted) setConsultantProfile({
          professional_name: data.professional_name || '',
          biography: data.biography || '',
          specialties: Array.isArray(data.specialties) ? data.specialties.join(', ') : (data.specialties || ''),
          years_experience: String(data.years_experience ?? 0),
          languages: Array.isArray(data.languages) ? data.languages.join(', ') : (data.languages || ''),
          session_rate: data.session_rate ?? '', currency: data.currency || 'INR',
          session_modes: Array.isArray(data.session_modes) && data.session_modes.length ? data.session_modes : ['chat'],
          working_hours: data.working_hours || '', availability_status: data.availability_status || 'offline',
          status: data.status || 'pending', account_status: data.account_status || 'pending', approval_note: data.approval_note || ''
        });
      } catch (error) {
        if (isMounted && error?.response?.status !== 404) {
          setProfileError(error?.response?.data?.detail || 'Could not load your professional profile. Check your login and backend connection.');
        }
      } finally { if (isMounted) setProfileLoading(false); }
    };
    loadProfessionalProfile();
    return () => { isMounted = false; };
  }, []);

  const updateConsultantProfileField = (field, value) => {
    setConsultantProfile((current) => ({ ...current, [field]: value }));
    setProfileNotice('');
    setProfileError('');
  };

  const toggleConsultantSessionMode = (mode) => {
    setConsultantProfile((current) => ({
      ...current,
      session_modes: current.session_modes.includes(mode)
        ? current.session_modes.filter((item) => item !== mode)
        : [...current.session_modes, mode]
    }));
    setProfileNotice('');
  };

  const saveConsultantProfessionalProfile = async (event) => {
    event.preventDefault();
    setProfileSaving(true); setProfileNotice(''); setProfileError('');
    try {
      const payload = {
        ...consultantProfile,
        years_experience: Number(consultantProfile.years_experience || 0),
        session_rate: consultantProfile.session_rate === '' ? null : Number(consultantProfile.session_rate),
        specialties: consultantProfile.specialties.split(',').map((item) => item.trim()).filter(Boolean),
        languages: consultantProfile.languages.split(',').map((item) => item.trim()).filter(Boolean),
        session_modes: consultantProfile.session_modes
      };
      const response = await api.put('/api/consultants/me', payload);
      const data = response.data || {};
      setConsultantProfile((current) => ({ ...current, ...data,
        specialties: Array.isArray(data.specialties) ? data.specialties.join(', ') : current.specialties,
        languages: Array.isArray(data.languages) ? data.languages.join(', ') : current.languages,
        years_experience: String(data.years_experience ?? current.years_experience),
        session_rate: data.session_rate ?? current.session_rate,
        session_modes: Array.isArray(data.session_modes) ? data.session_modes : current.session_modes
      }));
      setProfileNotice(data.status === 'published' ? 'Your professional profile is saved and published.' : (data.account_status === 'active' ? 'Profile saved. Updated details will appear after directory review.' : 'Listing saved privately. Administrator approval is required before professional access is enabled.'));
    } catch (error) {
      setProfileError(error?.response?.data?.detail || 'Profile could not be saved. Please check the fields and backend connection.');
    } finally { setProfileSaving(false); }
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(
        consultantStorageKey,
        JSON.stringify(sessions)
      );
    } catch (storageError) {
      console.error(
        'Failed to persist consultant session archive:',
        storageError
      );
    }
  }, [sessions]);

  const mapConsultationToSession = (consultation) => ({
    id: consultation.id,
    conversationId: `consultation-${consultation.id}`,
    seekerName: consultation.seeker_name || 'Seeker',
    type: consultation.subject || `${consultation.consultation_mode || 'chat'} consultation`,
    date: consultation.scheduled_at ? new Date(consultation.scheduled_at).toISOString().slice(0, 10) : '',
    time: consultation.scheduled_at ? new Date(consultation.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
    focus: consultation.seeker_notes || 'No intention or preparation notes supplied.',
    notes: consultation.consultant_notes || '',
    rating: '',
    outcome: '',
    status: String(consultation.status || 'requested').toUpperCase().replaceAll('_', ' '),
    followUp: false,
    createdAt: consultation.created_at,
    consultationMode: consultation.consultation_mode,
    durationMinutes: consultation.duration_minutes,
    currency: consultation.currency,
    agreedRate: consultation.agreed_rate,
    _persisted: true,
  });

  const refreshConsultations = async () => {
    setConsultationLoadError('');
    const response = await api.get('/api/consultations/me');
    if (!Array.isArray(response.data)) throw new Error('Consultation response was not a list.');
    setSessions(response.data.map(mapConsultationToSession));
    setBackendState('LIVE CONSULTATIONS');
  };

  useEffect(() => {
    let mounted = true;
    api.get('/api/consultations/me').then((response) => {
      if (mounted && Array.isArray(response.data)) {
        setSessions(response.data.map(mapConsultationToSession));
        setBackendState('LIVE CONSULTATIONS');
      }
    }).catch((error) => {
      if (mounted) setConsultationLoadError(error?.response?.data?.detail || 'Live consultations could not be loaded.');
    });
    return () => { mounted = false; };
  }, []);


  const activeSession =
    sessions.find(
      (session) => session.id === selectedSessionId
    ) || null;

  const activeSessionStatusLabel =
    activeSession?.status || 'NO ACTIVE SESSION';

  const activeSessionFollowUpLabel =
    activeSession?.followUp
      ? 'FOLLOW-UP FLAGGED'
      : 'FOLLOW-UP NOT FLAGGED';

  const activeSessionNoteCount =
    activeSession?.notes?.trim().length || 0;

  const scheduledCount = sessions.filter(
    (session) => ['SCHEDULED', 'ACCEPTED'].includes(session.status)
  ).length;

  const activeCount = sessions.filter(
    (session) => session.status === 'IN PROGRESS'
  ).length;

  const completedCount = sessions.filter(
    (session) => session.status === 'COMPLETED'
  ).length;

  const followUpCount = sessions.filter(
    (session) =>
      session.followUp ||
      Boolean(session.notes?.trim())
  ).length;

  const ratedSessions = sessions.filter(
    (session) => Number(session.rating) > 0
  );

  const averageSessionRating = ratedSessions.length
    ? (
        ratedSessions.reduce(
          (total, session) =>
            total + Number(session.rating),
          0
        ) / ratedSessions.length
      ).toFixed(1)
    : '—';

  const completedWithOutcome = sessions.filter(
    (session) =>
      session.status === 'COMPLETED' &&
      Boolean(session.notes?.trim())
  ).length;

  const queueSessions = sessions.filter(
    (session) => {
      const matchesStatus =
        queueStatus === 'ALL' ||
        session.status === queueStatus;

      const searchValue = queueSearch
        .trim()
        .toLowerCase();

      const matchesSearch = !searchValue ||
        `${session.seekerName} ${session.type} ${session.focus}`
          .toLowerCase()
          .includes(searchValue);

      return matchesStatus && matchesSearch;
    }
  );

  const sortedSessions = [...sessions].sort(
    (first, second) => {
      const firstDate = new Date(
        `${first.date || '9999-12-31'}T${first.time || '23:59'}`
      ).getTime();

      const secondDate = new Date(
        `${second.date || '9999-12-31'}T${second.time || '23:59'}`
      ).getTime();

      return firstDate - secondDate;
    }
  );

  const resetSessionForm = () => {
    setSeekerName('');
    setSessionType('Spiritual Guidance');
    setSessionDate('');
    setSessionTime('');
    setGuidanceFocus('');
    setSessionNotes('');
    setSessionRating('');
    setSessionOutcome('');
    setSelectedSessionId(null);
  };

  const createSession = (event) => {
    event.preventDefault();

    const trimmedName = seekerName.trim();
    const trimmedFocus = guidanceFocus.trim();

    if (!trimmedName || !sessionDate || !sessionTime) {
      setNotice(
        'Complete the seeker name, date and time before archiving the consultation.'
      );
      return;
    }

    const newSession = {
      id: `consult-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      conversationId: `consultation-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      seekerName: trimmedName,
      type: sessionType,
      date: sessionDate,
      time: sessionTime,
      focus: trimmedFocus || 'General spiritual guidance',
      notes: sessionNotes.trim(),
      rating: '',
      outcome: '',
      status: 'SCHEDULED',
      followUp: false,
      createdAt: new Date().toISOString()
    };

    setSessions((currentSessions) => [
      ...currentSessions,
      newSession
    ]);

    setNotice(
      'Consultation added to the consultant archive.'
    );

    resetSessionForm();
    setActivePanel('sessions');
  };

  const selectSession = (session) => {
    setSelectedSessionId(session.id);
    setSessionNotes(session.notes || '');
    setGuidanceFocus(session.focus || '');
    setSessionRating(session.rating || '');
    setSessionOutcome(session.outcome || '');
    setActivePanel('sessions');
    setNotice('');
  };

  const updateSessionStatus = async (sessionId, status) => {
    const selected = sessions.find((session) => session.id === sessionId);
    const nextStatus = status.toLowerCase().replaceAll(' ', '_');
    if (selected?._persisted) {
      setConsultationUpdatingId(sessionId);
      try {
        await api.patch(`/api/consultations/${sessionId}/status`, { status: nextStatus });
        await refreshConsultations();
        setNotice(`Consultation marked as ${status.toLowerCase()}.`);
      } catch (error) {
        setConsultationLoadError(error?.response?.data?.detail || 'Consultation status could not be updated.');
      } finally { setConsultationUpdatingId(null); }
      return;
    }
    setSessions((currentSessions) =>
      currentSessions.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              status,
              followUp:
                status === 'COMPLETED'
                  ? session.followUp
                  : false
            }
          : session
      )
    );

    setNotice(
      `Consultation marked as ${status.toLowerCase()}.`
    );
  };

  const removeSession = (sessionId) => {
    setSessions((currentSessions) =>
      currentSessions.filter(
        (session) => session.id !== sessionId
      )
    );

    if (selectedSessionId === sessionId) {
      setSelectedSessionId(null);
      setSessionNotes('');
    }

    setNotice(
      'Consultation removed from the local planner.'
    );
  };

  const saveProfessionalNotes = async () => {
    if (!activeSession) {
      setNotice(
        'Select a consultation before saving professional notes.'
      );
      return;
    }

    if (activeSession._persisted) {
      setConsultationUpdatingId(activeSession.id);
      try {
        await api.patch(`/api/consultations/${activeSession.id}/status`, {
          status: activeSession.status.toLowerCase().replaceAll(' ', '_'),
          consultant_notes: sessionNotes.trim(),
        });
        await refreshConsultations();
        setNotice('Private professional notes saved to this consultation.');
      } catch (error) {
        setConsultationLoadError(error?.response?.data?.detail || 'Professional notes could not be saved.');
      } finally { setConsultationUpdatingId(null); }
      return;
    }

    setSessions((currentSessions) =>
      currentSessions.map((session) =>
        session.id === activeSession.id
          ? {
              ...session,
              focus:
                guidanceFocus.trim() ||
                session.focus ||
                'General spiritual guidance',
              notes: sessionNotes.trim(),
              rating: sessionRating,
              outcome: sessionOutcome.trim(),
              followUp: Boolean(
                sessionNotes.trim() ||
                sessionOutcome.trim()
              )
            }
          : session
      )
    );

    setNotice(
      'Professional guidance notes saved to the local archive.'
    );
  };

  const syncConsultantArchive = async () => {
    setSyncingArchive(true);
    setBackendState('CHECKING BACKEND...');

    try {
      await refreshConsultations();
      setNotice('Live consultations refreshed from your account.');
    } catch (syncError) {
      console.warn(
        'Consultant backend sync is unavailable; local archive remains active.',
        syncError
      );
      setBackendState('LOCAL ARCHIVE');
      setNotice('Live consultations are unavailable. Your saved local planner entries remain available.');
    } finally {
      setSyncingArchive(false);
    }
  };

  const formatSessionDate = (dateValue) => {
    if (!dateValue) {
      return 'DATE NOT SET';
    }

    const parsed = new Date(`${dateValue}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
      return dateValue;
    }

    return parsed.toLocaleDateString(
      undefined,
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  };

  const formatSessionTime = (timeValue) => {
    if (!timeValue) {
      return 'TIME NOT SET';
    }

    const parsed = new Date(
      `1970-01-01T${timeValue}`
    );

    if (Number.isNaN(parsed.getTime())) {
      return timeValue;
    }

    return parsed.toLocaleTimeString(
      undefined,
      {
        hour: 'numeric',
        minute: '2-digit'
      }
    );
  };

  return (
    <RoleDashboardHeader
      eyebrow={isConsultationsView ? "LUNARA • CONSULTATION WORKSPACE" : "LUNARA • SPIRITUAL ARCHIVE"}
      title={isConsultationsView ? "Consultations" : "Spiritual Consultant Portal"}
      icon={isConsultationsView ? "☿" : "☼"}
      description={isConsultationsView ? "Manage scheduled sessions, review consultation details, record professional notes, and follow up with seekers." : "A professional guidance chamber for planning consultations, documenting sessions, and maintaining a focused spiritual practice archive."}
    >
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
          duration: 0.55
        }}
        className="lunara-consultant-shell"
        style={consultantPortalShellStyle}
      >
        <div style={consultantPortalTopStyle}>
          <div>
            <div style={panelEyebrowStyle}>
              {isConsultationsView ? 'GUIDANCE PRACTITIONER • SESSION DESK' : 'GUIDANCE PRACTITIONER • COMMAND CENTER'}
            </div>

            <h2 style={consultantPortalTitleStyle}>
              {isConsultationsView ? 'Consultation Workspace' : 'Consultation Chamber'}
            </h2>

            <p style={consultantPortalDescriptionStyle}>
              {isConsultationsView
                ? 'Work with the consultation queue, update session status, capture professional observations, and maintain follow-up records.'
                : "Organize one-on-one spiritual guidance work, capture professional observations, and keep every consultation focused on the seeker's stated intention."}
            </p>
          </div>

          <motion.div
            animate={{
              rotate: [0, 8, -8, 0],
              scale: [1, 1.04, 1]
            }}
            transition={{
              duration: 6,
              repeat: Infinity
            }}
            style={consultantSealStyle}
          >
            ☼
          </motion.div>
        </div>

        <div style={consultantBoundaryNoticeStyle}>
          <span style={consultantBoundaryIconStyle}>
            ◇
          </span>

          <div>
            <strong>
              PROFESSIONAL CONSULTANT SURFACE
            </strong>

            <p>
              This dashboard is a planning and documentation
              workspace. It does not perform Palm or Tarot
              seeker readings, and it does not claim a live
              consultation API until one is connected.
            </p>
          </div>

          <span style={consultantBoundaryStatusStyle}>
            PLANNER MODE
          </span>
        </div>

        {!isConsultationsView && (
        <div className="lunara-consultant-metrics" style={consultantMetricGridStyle}>
          <ConsultantMetricCard
            icon="◷"
            label="Scheduled"
            value={scheduledCount}
            detail="Sessions in the planner"
            accent="red"
          />

          <ConsultantMetricCard
            icon="☼"
            label="In Session"
            value={activeCount}
            detail="Consultations currently active"
            accent="gold"
          />

          <ConsultantMetricCard
            icon="✓"
            label="Completed"
            value={completedCount}
            detail="Sessions marked complete"
            accent="green"
          />

          <ConsultantMetricCard
            icon="✎"
            label="Follow-up Notes"
            value={followUpCount}
            detail="Sessions with documentation"
            accent="brown"
          />
        </div>

        )}

        <div style={consultantNavigationStyle}>
          {[
            { id: 'overview', label: 'Overview', icon: '⌂' },
            { id: 'profile', label: 'Professional Profile', icon: '✦' },
            { id: 'intelligence', label: 'Practice Intelligence', icon: '◇' },
          ].map((panel) => (
            <button
              key={panel.id}
              type="button"
              onClick={() => {
                setActivePanel(panel.id);
                setNotice('');
              }}
              style={{
                ...consultantNavigationButtonStyle,
                ...(activePanel === panel.id
                  ? consultantNavigationButtonActiveStyle
                  : {})
              }}
            >
              <span>{panel.icon}</span>
              {panel.label}
            </button>
          ))}
        </div>

        {notice && (
          <motion.div
            initial={{
              opacity: 0,
              y: -6
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            style={consultantNoticeStyle}
          >
            <span>✦</span>
            {notice}
          </motion.div>
        )}

        {consultationLoadError && <div role="alert" style={{ ...consultantNoticeStyle, color: '#8b0000' }}>{consultationLoadError}</div>}

        <div style={consultantBackendBarStyle}>
          <div>
            <span style={consultantBackendDotStyle} />
            <strong>{backendState}</strong>
            <span>
              Consultant workspace storage state
            </span>
          </div>

          <button
            type="button"
            onClick={syncConsultantArchive}
            disabled={syncingArchive}
            style={consultantBackendButtonStyle}
          >
            {syncingArchive
              ? 'CHECKING...'
              : 'SYNC BACKEND'}
          </button>
        </div>

        {!isConsultationsView && activePanel === 'overview' && (
          <motion.div
            initial={{
              opacity: 0,
              y: 12
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="lunara-consultant-overview"
            style={consultantOverviewGridStyle}
          >
            <section style={consultantFocusPanelStyle}>
              <div style={panelEyebrowStyle}>
                PRACTICE PRINCIPLES
              </div>

              <h3 style={consultantSectionTitleStyle}>
                The Consultant's Chamber
              </h3>

              <p style={consultantSectionTextStyle}>
                A spiritual consultant provides a human
                guidance layer around the seeker's goals,
                questions and personal context. Keep
                interpretations balanced, respectful and
                actionable rather than presenting guidance
                as guaranteed outcomes.
              </p>

              <div style={consultantPrinciplesGridStyle}>
                <ConsultantPrinciple
                  number="01"
                  title="LISTEN"
                  text="Capture the seeker's actual question before forming guidance."
                />

                <ConsultantPrinciple
                  number="02"
                  title="CONTEXT"
                  text="Record the relevant life area, intention and boundaries."
                />

                <ConsultantPrinciple
                  number="03"
                  title="GUIDE"
                  text="Offer practical reflection without replacing professional care."
                />

                <ConsultantPrinciple
                  number="04"
                  title="FOLLOW UP"
                  text="Document useful next steps and future-session needs."
                />
              </div>
            </section>

            <section style={consultantFocusPanelStyle}>
              <div style={panelEyebrowStyle}>
                PRACTICE TELEMETRY
              </div>

              <h3 style={consultantSectionTitleStyle}>
                Current Archive Pulse
              </h3>

              <div style={consultantPulseListStyle}>
                <div style={consultantPulseRowStyle}>
                  <span>Upcoming workload</span>
                  <strong>
                    {scheduledCount} scheduled
                  </strong>
                </div>

                <div style={consultantPulseRowStyle}>
                  <span>Active chamber</span>
                  <strong>
                    {activeCount
                      ? 'SESSION ACTIVE'
                      : 'READY'}
                  </strong>
                </div>

                <div style={consultantPulseRowStyle}>
                  <span>Completed archive</span>
                  <strong>
                    {completedCount} sessions
                  </strong>
                </div>

                <div style={consultantPulseRowStyle}>
                  <span>Documented practice</span>
                  <strong>
                    {followUpCount} follow-up records
                  </strong>
                </div>
              </div>

              <div style={consultantLocalModeStyle}>
                <span>◇</span>

                <div>
                  <strong>
                    LIVE CONSULTATION WORKSPACE
                  </strong>

                  <p>
                    Seeker requests, scheduling, status changes, and private notes are synchronized with your account. Personal planner entries remain available when no live request is selected.
                  </p>
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {activePanel === 'profile' && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ ...consultantFocusPanelStyle, marginTop: '22px', textAlign: 'left' }}>
            <div style={panelEyebrowStyle}>YOUR PUBLIC PRACTICE RECORD</div>
            <h3 style={consultantSectionTitleStyle}>Professional Profile</h3>
            <p style={consultantSectionTextStyle}>Complete the professional listing seekers will see in Guidance. Your listing remains private until account and directory approval are complete.</p>
            {profileLoading && <p role="status">Loading your profile…</p>}
            {profileNotice && <div role="status" style={{ padding: '12px', margin: '12px 0', border: '1px solid #56704b', color: '#31522b', background: 'rgba(86,112,75,0.08)' }}>{profileNotice}</div>}
            {profileError && <div role="alert" style={{ padding: '12px', margin: '12px 0', border: '1px solid #8b0000', color: '#8b0000', background: 'rgba(139,0,0,0.05)' }}>{profileError}</div>}
            <div style={{ margin: '12px 0 18px', fontSize: '0.75rem', letterSpacing: '1px' }}>ACCOUNT: <strong>{String(consultantProfile.account_status || 'pending').toUpperCase()}</strong> · DIRECTORY: <strong>{String(consultantProfile.status || 'pending').toUpperCase()}</strong></div>
            {consultantProfile.approval_note && <p style={{ color: '#8b0000' }}>Administrator note: {consultantProfile.approval_note}</p>}
            <form onSubmit={saveConsultantProfessionalProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px' }}>
              {[
                { field: 'professional_name', label: 'Professional display name', type: 'text', required: true },
                { field: 'years_experience', label: 'Years of experience', type: 'number', required: true },
                { field: 'session_rate', label: 'Session rate', type: 'number', required: false },
                { field: 'currency', label: 'Currency code', type: 'text', required: true },
                { field: 'languages', label: 'Languages (comma separated)', type: 'text', required: true },
                { field: 'specialties', label: 'Specialties (comma separated)', type: 'text', required: true },
                { field: 'working_hours', label: 'Working hours / schedule', type: 'text', required: false }
              ].map((field) => (
                <label key={field.field} style={{ display: 'grid', gap: '6px', fontSize: '0.82rem', fontWeight: 'bold' }}>
                  {field.label}
                  <input type={field.type} min={field.type === 'number' ? '0' : undefined} step={field.field === 'session_rate' ? '0.01' : undefined} required={field.required} value={consultantProfile[field.field]} onChange={(event) => updateConsultantProfileField(field.field, event.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '11px', border: '1px solid #9c6c44', borderRadius: '4px', background: 'rgba(255,255,255,0.45)', color: '#2c1a0f' }} />
                </label>
              ))}
              {consultantProfile.account_status === 'active' && <label style={{ display: 'grid', gap: '6px', fontSize: '0.82rem', fontWeight: 'bold' }}>Availability
                <select value={consultantProfile.availability_status} onChange={(event) => updateConsultantProfileField('availability_status', event.target.value)} style={{ padding: '11px', border: '1px solid #9c6c44', borderRadius: '4px', background: '#f4e8c1', color: '#2c1a0f' }}>
                  <option value="online">Online</option><option value="busy">Busy</option><option value="offline">Offline</option>
                </select>
              </label>}
              <label style={{ display: 'grid', gap: '6px', fontSize: '0.82rem', fontWeight: 'bold' }}>Professional biography
                <textarea rows={5} maxLength={4000} required value={consultantProfile.biography} onChange={(event) => updateConsultantProfileField('biography', event.target.value)} style={{ gridColumn: '1 / -1', padding: '11px', border: '1px solid #9c6c44', borderRadius: '4px', background: 'rgba(255,255,255,0.45)', color: '#2c1a0f', resize: 'vertical' }} />
              </label>
              <fieldset style={{ border: '1px solid #9c6c44', borderRadius: '4px', padding: '12px', gridColumn: '1 / -1' }}>
                <legend style={{ padding: '0 6px', fontSize: '0.82rem', fontWeight: 'bold' }}>Session formats</legend>
                {['chat', 'video', 'phone', 'in_person'].map((mode) => <label key={mode} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', margin: '5px 14px 5px 0', fontSize: '0.82rem' }}><input type="checkbox" checked={consultantProfile.session_modes.includes(mode)} onChange={() => toggleConsultantSessionMode(mode)} />{mode.replace('_', ' ')}</label>)}
              </fieldset>
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={profileSaving || profileLoading} style={{ ...consultantBackendButtonStyle, padding: '12px 22px', opacity: profileSaving ? 0.7 : 1 }}>{profileSaving ? 'SAVING PROFILE…' : 'SAVE PROFESSIONAL PROFILE'}</button>
              </div>
            </form>
          </motion.section>
        )}

        {activePanel === 'sessions' && (
          <motion.div
            initial={{
              opacity: 0,
              y: 12
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="lunara-consultant-desk"
            style={consultantDeskGridStyle}
          >
            <section style={consultantFormPanelStyle}>
              <div style={panelEyebrowStyle}>
                LIVE CONSULTATION WORKLIST
              </div>

              <h3 style={consultantSectionTitleStyle}>
                Review Seeker Requests
              </h3>

              <form
                onSubmit={createSession}
                style={consultantFormStyle}
              >
                <div style={consultantFieldGroupStyle}>
                  <label style={labelStyle}>
                    Seeker Name
                  </label>

                  <input
                    value={seekerName}
                    onChange={(event) =>
                      setSeekerName(event.target.value)
                    }
                    style={inputStyle}
                    placeholder="Enter the seeker's name"
                  />
                </div>

                <div style={consultantFormTwoColumnStyle}>
                  <div style={consultantFieldGroupStyle}>
                    <label style={labelStyle}>
                      Session Type
                    </label>

                    <select
                      value={sessionType}
                      onChange={(event) =>
                        setSessionType(event.target.value)
                      }
                      style={consultantSelectStyle}
                    >
                      <option>
                        Spiritual Guidance
                      </option>
                      <option>
                        Life Direction
                      </option>
                      <option>
                        Relationship Guidance
                      </option>
                      <option>
                        Career Guidance
                      </option>
                      <option>
                        Personal Growth
                      </option>
                    </select>
                  </div>

                  <div style={consultantFieldGroupStyle}>
                    <label style={labelStyle}>
                      Guidance Focus
                    </label>

                    <input
                      value={guidanceFocus}
                      onChange={(event) =>
                        setGuidanceFocus(
                          event.target.value
                        )
                      }
                      style={inputStyle}
                      placeholder="Primary intention"
                    />
                  </div>
                </div>

                <div style={consultantFormTwoColumnStyle}>
                  <div style={consultantFieldGroupStyle}>
                    <label style={labelStyle}>
                      Session Date
                    </label>

                    <input
                      type="date"
                      value={sessionDate}
                      onChange={(event) =>
                        setSessionDate(event.target.value)
                      }
                      style={inputStyle}
                    />
                  </div>

                  <div style={consultantFieldGroupStyle}>
                    <label style={labelStyle}>
                      Session Time
                    </label>

                    <input
                      type="time"
                      value={sessionTime}
                      onChange={(event) =>
                        setSessionTime(event.target.value)
                      }
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={consultantFieldGroupStyle}>
                  <label style={labelStyle}>
                    Initial Notes
                  </label>

                  <textarea
                    rows="5"
                    value={sessionNotes}
                    onChange={(event) =>
                      setSessionNotes(event.target.value)
                    }
                    style={{
                      ...inputStyle,
                      minHeight: '125px'
                    }}
                    placeholder="Capture the initial context, intention or preparation notes."
                  />
                </div>

                <div style={consultantFormActionsStyle}>
                  <AnimatedButton
                    type="submit"
                  >
                    Archive Consultation
                  </AnimatedButton>

                  <button
                    type="button"
                    onClick={resetSessionForm}
                    style={consultantSecondaryButtonStyle}
                  >
                    Clear Form
                  </button>
                </div>
              </form>
            </section>

            <section style={consultantSessionPanelStyle}>
              <div style={consultantSessionPanelHeaderStyle}>
                <div>
                  <div style={panelEyebrowStyle}>
                    CONSULTATION LEDGER
                  </div>

                  <h3 style={consultantSectionTitleStyle}>
                    Upcoming & Active Sessions
                  </h3>
                </div>

                <span style={consultantCountBadgeStyle}>
                  {sessions.length} TOTAL
                </span>
              </div>

              {sortedSessions.length === 0 ? (
                <div style={consultantEmptyStateStyle}>
                  <motion.div
                    animate={{
                      rotate: [0, 180, 360],
                      scale: [1, 1.06, 1]
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                    style={consultantEmptySealStyle}
                  >
                    ☼
                  </motion.div>

                  <strong>
                    NO CONSULTATIONS ARCHIVED
                  </strong>

                  <p>
                    Published Guidance profiles receive real consultation requests here. Refresh after approval or publication to check for new requests.
                  </p>
                </div>
              ) : (
                <div style={consultantSessionListStyle}>
                  {sortedSessions.map((session) => (
                    <motion.article
                      key={session.id}
                      whileHover={{
                        y: -2
                      }}
                      style={{
                        ...consultantSessionCardStyle,
                        ...(selectedSessionId === session.id
                          ? consultantSessionCardActiveStyle
                          : {})
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          selectSession(session)
                        }
                        style={consultantSessionSelectStyle}
                      >
                        <span
                          style={
                            consultantSessionIndexStyle
                          }
                        >
                          {session.status}
                        </span>

                        <strong
                          style={
                            consultantSessionNameStyle
                          }
                        >
                          {session.seekerName}
                        </strong>

                        <span
                          style={
                            consultantSessionMetaStyle
                          }
                        >
                          {session.type}
                          {' • '}
                          {formatSessionDate(
                            session.date
                          )}
                          {' • '}
                          {formatSessionTime(
                            session.time
                          )}
                        </span>

                        <span
                          style={
                            consultantSessionFocusStyle
                          }
                        >
                          {session.focus}
                        </span>
                      </button>

                      <div
                        style={
                          consultantSessionActionsStyle
                        }
                      >
                        <button
                          type="button"
                          onClick={() =>
                            updateSessionStatus(
                              session.id,
                              session.status === 'REQUESTED'
                                ? 'ACCEPTED'
                                : session.status === 'ACCEPTED' || session.status === 'SCHEDULED'
                                  ? 'IN PROGRESS'
                                  : 'COMPLETED'
                            )
                          }
                          disabled={consultationUpdatingId === session.id || ['COMPLETED', 'CANCELLED', 'DECLINED'].includes(session.status)}
                          style={
                            consultantSmallActionStyle
                          }
                        >
                          {session.status === 'REQUESTED' ? 'Accept' : session.status === 'ACCEPTED' || session.status === 'SCHEDULED' ? 'Start session' : session.status === 'IN PROGRESS' ? 'Complete' : 'Closed'}
                        </button>

                        {session._persisted && session.status === 'REQUESTED' && <button type="button" disabled={consultationUpdatingId === session.id} onClick={() => updateSessionStatus(session.id, 'DECLINED')} style={consultantDangerActionStyle}>Decline</button>}
                        {!session._persisted && <button type="button" onClick={() => removeSession(session.id)} style={consultantDangerActionStyle}>Remove</button>}
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </section>
          </motion.div>
        )}

        {activePanel === 'intelligence' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={consultantIntelligenceGridStyle}
          >
            <section style={consultantFocusPanelStyle}>
              <div style={panelEyebrowStyle}>
                GUIDANCE INTELLIGENCE ENGINE
              </div>
              <h3 style={consultantSectionTitleStyle}>
                Consultant Practice Signals
              </h3>
              <p style={consultantSectionTextStyle}>
                These signals summarize the consultant's own archive.
                They are operational metrics, not claims about the
                spiritual truth of a seeker's circumstances.
              </p>

              <div className="lunara-consultant-signal-grid" style={consultantSignalGridStyle}>
                <ConsultantSignal
                  label="Archive Size"
                  value={sessions.length}
                  detail="Total consultation records"
                />
                <ConsultantSignal
                  label="Completion"
                  value={sessions.length ? `${Math.round((completedCount / sessions.length) * 100)}%` : '—'}
                  detail="Records marked completed"
                />
                <ConsultantSignal
                  label="Average Review"
                  value={averageSessionRating}
                  detail="Recorded professional ratings"
                />
                <ConsultantSignal
                  label="Outcome Capture"
                  value={sessions.length ? `${Math.round((completedWithOutcome / Math.max(completedCount, 1)) * 100)}%` : '—'}
                  detail="Completed sessions with outcomes"
                />
              </div>

              <div style={consultantIntelligenceNoteStyle}>
                <strong>INTERPRETATION BOUNDARY</strong>
                <p>
                  Lunara uses this panel to help the consultant organize
                  professional practice. It does not generate a diagnosis,
                  guarantee an outcome, or replace qualified professional care.
                </p>
              </div>
            </section>

            <section style={consultantFocusPanelStyle}>
              <div style={panelEyebrowStyle}>
                PRACTICE BREAKDOWN
              </div>
              <h3 style={consultantSectionTitleStyle}>
                Session Distribution
              </h3>

              <div style={consultantDistributionStyle}>
                {[
                  ['Scheduled', scheduledCount],
                  ['In Session', activeCount],
                  ['Completed', completedCount],
                  ['Follow-up', followUpCount]
                ].map(([label, value]) => (
                  <div key={label} style={consultantDistributionRowStyle}>
                    <span>{label}</span>
                    <div style={consultantDistributionTrackStyle}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${sessions.length ? Math.min(100, (value / sessions.length) * 100) : 0}%`
                        }}
                        transition={{ duration: 0.7 }}
                        style={consultantDistributionBarStyle}
                      />
                    </div>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>

              <div style={consultantPracticeChecklistStyle}>
                <div>✓ Capture the seeker's stated intention.</div>
                <div>✓ Keep professional notes factual and respectful.</div>
                <div>✓ Record practical follow-up actions.</div>
                <div>✓ Keep spiritual guidance distinct from medical or legal advice.</div>
              </div>
            </section>
          </motion.div>
        )}

        {activePanel === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={consultantHistoryPanelStyle}
          >
            <section style={consultantSessionPanelStyle}>
              <div style={consultantSessionPanelHeaderStyle}>
                <div>
                  <div style={panelEyebrowStyle}>
                    PROFESSIONAL REVIEW HISTORY
                  </div>
                  <h3 style={consultantSectionTitleStyle}>
                    Completed Consultation Archive
                  </h3>
                </div>
                <span style={consultantCountBadgeStyle}>
                  {completedCount} COMPLETED
                </span>
              </div>

              {sessions.filter((session) => session.status === 'COMPLETED').length === 0 ? (
                <EmptyArchive
                  icon="⌘"
                  title="No Completed Sessions"
                  message="Completed consultations and their professional outcomes will appear here."
                />
              ) : (
                <div style={consultantHistoryListStyle}>
                  {sessions
                    .filter((session) => session.status === 'COMPLETED')
                    .sort((first, second) =>
                      new Date(second.createdAt || 0).getTime() -
                      new Date(first.createdAt || 0).getTime()
                    )
                    .map((session) => (
                      <motion.article
                        key={`history-${session.id}`}
                        whileHover={{ y: -2 }}
                        className="lunara-consultant-history-card"
                        style={consultantHistoryCardStyle}
                      >
                        <div>
                          <div style={consultantSessionIndexStyle}>
                            COMPLETED • {formatSessionDate(session.date)}
                          </div>
                          <strong style={consultantSessionNameStyle}>
                            {session.seekerName}
                          </strong>
                          <p style={consultantHistoryTextStyle}>
                            {session.outcome || 'No outcome summary recorded.'}
                          </p>
                        </div>

                        <div style={consultantHistoryScoreStyle}>
                          <span>REVIEW</span>
                          <strong>
                            {session.rating || '—'}
                            {session.rating ? '/10' : ''}
                          </strong>
                          <button
                            type="button"
                            onClick={() => {
                              selectSession(session);
                              setActivePanel('notes');
                            }}
                            style={consultantSmallActionStyle}
                          >
                            Open Record
                          </button>
                        </div>
                      </motion.article>
                    ))}
                </div>
              )}
            </section>
          </motion.div>
        )}

        {activePanel === 'chat' && (
          <motion.div
            initial={{
              opacity: 0,
              y: 12
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="lunara-consultant-chat"
            style={consultantChatWorkspaceStyle}
          >
            <section style={consultantSessionPanelStyle}>
              <div style={panelEyebrowStyle}>
                CONSULTATION CHANNELS
              </div>

              <h3 style={consultantSectionTitleStyle}>
                Select A Consultation
              </h3>

              {sortedSessions.length === 0 ? (
                <div style={consultantEmptyStateStyle}>
                  <span
                    style={consultantNotebookIconStyle}
                  >
                    ◌
                  </span>

                  <strong>
                    NO CONSULTATION CHANNELS
                  </strong>

                  <p>
                    Archive a consultation before opening
                    a private conversation channel.
                  </p>
                </div>
              ) : (
                <div style={consultantNotebookListStyle}>
                  {sortedSessions.map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() =>
                        setSelectedSessionId(session.id)
                      }
                      style={{
                        ...consultantNotebookItemStyle,
                        ...(selectedSessionId === session.id
                          ? consultantNotebookItemActiveStyle
                          : {})
                      }}
                    >
                      <span>◌</span>

                      <span>
                        <strong>
                          {session.seekerName}
                        </strong>

                        <small>
                          {session.type} • {session.status}
                        </small>
                      </span>

                      <span>➜</span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section style={consultantNotebookEditorStyle}>
              <div style={panelEyebrowStyle}>
                PRIVATE CONVERSATION
              </div>

              <h3 style={consultantSectionTitleStyle}>
                {activeSession
                  ? `Chat with ${activeSession.seekerName}`
                  : 'No Consultation Selected'}
              </h3>

              {activeSession ? (
                <SpiritualConsultationChat
                  conversationId={
                    activeSession.conversationId ||
                    activeSession.id
                  }
                  participantName={activeSession.seekerName}
                  viewerRole="consultant"
                  viewerName="Spiritual Consultant"
                />
              ) : (
                <div style={consultantEmptyEditorStyle}>
                  <span>◌</span>

                  <p>
                    Select a consultation to discuss schedule
                    changes, rescheduling requests and follow-up
                    actions with the seeker.
                  </p>
                </div>
              )}
            </section>
          </motion.div>
        )}

        {activePanel === 'queue' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={consultantQueueGridStyle}
          >
            <section style={consultantSessionPanelStyle}>
              <div style={panelEyebrowStyle}>
                CONSULTATION REVIEW QUEUE
              </div>

              <h3 style={consultantSectionTitleStyle}>
                Filter The Practice Queue
              </h3>

              <p style={consultantSectionTextStyle}>
                Search upcoming, active and completed consultations
                before opening a professional record.
              </p>

              <div className="lunara-consultant-queue-controls" style={consultantQueueControlsStyle}>
                <input
                  value={queueSearch}
                  onChange={(event) =>
                    setQueueSearch(event.target.value)
                  }
                  style={inputStyle}
                  placeholder="Search seeker, session type or guidance focus"
                />

                <select
                  value={queueStatus}
                  onChange={(event) =>
                    setQueueStatus(event.target.value)
                  }
                  style={consultantSelectStyle}
                >
                  <option value="ALL">All statuses</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="IN SESSION">In Session</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div style={consultantQueueSummaryStyle}>
                <strong>
                  {queueSessions.length}
                </strong>
                <span>matching consultation records</span>
              </div>
            </section>

            <section style={consultantSessionPanelStyle}>
              <div style={consultantSessionPanelHeaderStyle}>
                <div>
                  <div style={panelEyebrowStyle}>
                    PROFESSIONAL WORKLIST
                  </div>
                  <h3 style={consultantSectionTitleStyle}>
                    Open Review
                  </h3>
                </div>
                <span style={consultantCountBadgeStyle}>
                  {queueSessions.length} QUEUED
                </span>
              </div>

              {queueSessions.length === 0 ? (
                <EmptyArchive
                  icon="▣"
                  title="Queue Is Clear"
                  message="No consultation records match the current review filters."
                  compact
                />
              ) : (
                <div style={consultantSessionListStyle}>
                  {queueSessions.map((session) => (
                    <motion.article
                      key={`queue-${session.id}`}
                      whileHover={{ y: -2 }}
                      style={consultantQueueCardStyle}
                    >
                      <div>
                        <div style={consultantSessionIndexStyle}>
                          {session.status}
                        </div>
                        <strong style={consultantSessionNameStyle}>
                          {session.seekerName}
                        </strong>
                        <div style={consultantSessionMetaStyle}>
                          {session.type} • {formatSessionDate(session.date)} • {formatSessionTime(session.time)}
                        </div>
                        <div style={consultantSessionFocusStyle}>
                          {session.focus || 'General spiritual guidance'}
                        </div>
                      </div>

                      <div style={consultantQueueActionsStyle}>
                        <button
                          type="button"
                          onClick={() => selectSession(session)}
                          style={consultantSmallActionStyle}
                        >
                          Open Review
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            selectSession(session);
                            setActivePanel('notes');
                          }}
                          style={consultantSmallActionStyle}
                        >
                          Open Notes
                        </button>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </section>
          </motion.div>
        )}

        {activePanel === 'notes' && (
          <motion.div
            initial={{
              opacity: 0,
              y: 12
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="lunara-consultant-notes"
            style={consultantNotesGridStyle}
          >
            <section style={consultantSessionPanelStyle}>
              <div style={panelEyebrowStyle}>
                PROFESSIONAL NOTEBOOK
              </div>

              <h3 style={consultantSectionTitleStyle}>
                Select A Consultation
              </h3>

              {sessions.length === 0 ? (
                <div style={consultantEmptyStateStyle}>
                  <span
                    style={consultantNotebookIconStyle}
                  >
                    ✎
                  </span>

                  <strong>
                    NOTEBOOK IS EMPTY
                  </strong>

                  <p>
                    Archive a consultation before adding
                    professional guidance notes.
                  </p>
                </div>
              ) : (
                <div style={consultantNotebookListStyle}>
                  {sortedSessions.map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() =>
                        selectSession(session)
                      }
                      style={{
                        ...consultantNotebookItemStyle,
                        ...(selectedSessionId === session.id
                          ? consultantNotebookItemActiveStyle
                          : {})
                      }}
                    >
                      <span>✦</span>

                      <span>
                        <strong>
                          {session.seekerName}
                        </strong>

                        <small>
                          {session.type}
                        </small>
                      </span>

                      <span>➜</span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section style={consultantNotebookEditorStyle}>
              <div style={panelEyebrowStyle}>
                GUIDANCE RECORD
              </div>

              <h3 style={consultantSectionTitleStyle}>
                {activeSession
                  ? activeSession.seekerName
                  : 'No Consultation Selected'}
              </h3>

              {activeSession ? (
                <>
                  <div style={consultantEditorMetaStyle}>
                    <span>
                      {activeSession.type}
                    </span>

                    <span>
                      {formatSessionDate(
                        activeSession.date
                      )}
                    </span>

                    <span>
                      {activeSessionStatusLabel}
                    </span>

                    <span>
                      {activeSessionFollowUpLabel}
                    </span>

                    <span>
                      {activeSessionNoteCount} NOTE CHARACTERS
                    </span>
                  </div>

                  <div style={consultantFieldGroupStyle}>
                    <label style={labelStyle}>
                      Guidance Focus
                    </label>

                    <input
                      value={guidanceFocus}
                      onChange={(event) =>
                        setGuidanceFocus(
                          event.target.value
                        )
                      }
                      style={inputStyle}
                      placeholder="What is this session helping the seeker explore?"
                    />
                  </div>

                  <div style={consultantFieldGroupStyle}>
                    <label style={labelStyle}>
                      Professional Notes
                    </label>

                    <textarea
                      rows="12"
                      value={sessionNotes}
                      onChange={(event) =>
                        setSessionNotes(
                          event.target.value
                        )
                      }
                      style={{
                        ...inputStyle,
                        minHeight: '250px'
                      }}
                      placeholder="Record observations, guidance themes, practical next steps and follow-up considerations."
                    />
                  </div>

                  <div style={consultantFormTwoColumnStyle}>
                    <div style={consultantFieldGroupStyle}>
                      <label style={labelStyle}>
                        Session Rating · 1–10
                      </label>

                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={sessionRating}
                        onChange={(event) =>
                          setSessionRating(event.target.value)
                        }
                        style={inputStyle}
                        placeholder="Professional self-review"
                      />
                    </div>

                    <div style={consultantFieldGroupStyle}>
                      <label style={labelStyle}>
                        Session Outcome
                      </label>

                      <input
                        value={sessionOutcome}
                        onChange={(event) =>
                          setSessionOutcome(event.target.value)
                        }
                        style={inputStyle}
                        placeholder="Key outcome or next step"
                      />
                    </div>
                  </div>

                  <div style={consultantEditorActionsStyle}>
                    <AnimatedButton
                      type="button"
                      onClick={saveProfessionalNotes}
                    >
                      Save Guidance Notes
                    </AnimatedButton>

                    <button
                      type="button"
                      onClick={() =>
                        updateSessionStatus(
                          activeSession.id,
                          'COMPLETED'
                        )
                      }
                      style={
                        consultantSecondaryButtonStyle
                      }
                    >
                      Mark Completed
                    </button>
                  </div>
                </>
              ) : (
                <div style={consultantEmptyEditorStyle}>
                  <span>☼</span>

                  <p>
                    Select a consultation from the
                    notebook to open its professional
                    guidance record.
                  </p>
                </div>
              )}
            </section>
          </motion.div>
        )}
      </motion.div>
    </RoleDashboardHeader>
  );
};

export const ConsultantConsultationsWorkspace = () => {
  const [consultations, setConsultations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [notesById, setNotesById] = useState({});
  const [scheduleById, setScheduleById] = useState({});
  const [filter, setFilter] = useState('open');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = async () => {
    setError('');
    try {
      const response = await api.get('/api/consultations/me');
      const items = Array.isArray(response.data) ? response.data : [];
      setConsultations(items);
      setSelectedId((current) => items.some((item) => item.id === current) ? current : items[0]?.id || null);
    } catch (requestError) {
      setError(requestError?.response?.data?.detail || 'Consultation requests could not be loaded.');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = window.setTimeout(refresh, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const selected = consultations.find((item) => item.id === selectedId) || null;
  const notes = selected ? (notesById[selected.id] ?? selected.consultant_notes ?? '') : '';
  const schedule = selected ? (scheduleById[selected.id] ?? (selected.scheduled_at ? new Date(selected.scheduled_at).toISOString().slice(0, 16) : '')) : '';

  const updateConsultation = async (payload, successMessage) => {
    if (!selected) return;
    setSaving(true); setError(''); setNotice('');
    try {
      await api.patch(`/api/consultations/${selected.id}/status`, payload);
      await refresh();
      setNotice(successMessage);
    } catch (requestError) {
      setError(requestError?.response?.data?.detail || 'This consultation could not be updated.');
    } finally { setSaving(false); }
  };

  const filtered = consultations.filter((item) => {
    const closed = ['completed', 'cancelled', 'declined'].includes(item.status);
    return filter === 'all' || (filter === 'open' ? !closed : item.status === filter);
  });
  const openCount = consultations.filter((item) => !['completed', 'cancelled', 'declined'].includes(item.status)).length;

  return (
    <RoleDashboardHeader
      eyebrow="LUNARA • PRIVATE GUIDANCE DESK"
      title="Consultation Room"
      icon="☿"
      description="A focused workspace for seeker requests, scheduling, session notes, and direct consultation chat."
    >
      <section style={{ width: 'min(1160px, 100%)', margin: '0 auto', textAlign: 'left' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12, marginBottom: 18 }}>
          {[
            ['OPEN REQUESTS', openCount],
            ['TOTAL BOOKINGS', consultations.length],
            ['COMPLETED', consultations.filter((item) => item.status === 'completed').length],
          ].map(([label, value]) => <article key={label} style={{ padding: '17px 19px', border: '1px solid #9c6c44', borderRadius: 7, background: 'linear-gradient(145deg,rgba(255,246,217,.94),rgba(234,213,164,.82))', boxShadow: '0 5px 16px rgba(58,28,13,.12)' }}><small style={{ letterSpacing: '.1em', color: '#76563b', fontWeight: 800 }}>{label}</small><strong style={{ display: 'block', marginTop: 7, fontSize: '1.6rem', color: '#4a2412' }}>{value}</strong></article>)}
          <button type="button" onClick={refresh} disabled={loading || saving} style={{ border: '1px solid #6b3518', borderRadius: 7, color: '#fff1c4', background: 'linear-gradient(135deg,#4a2412,#6b3518)', font: 'inherit', fontWeight: 700, cursor: 'pointer' }}>{loading ? 'Refreshing…' : 'Refresh requests'}</button>
        </div>
        {error && <p role="alert" style={{ padding: 12, border: '1px solid #8b0000', color: '#8b0000', background: 'rgba(139,0,0,.06)', borderRadius: 6 }}>{error}</p>}
        {notice && <p role="status" style={{ padding: 12, border: '1px solid #56704b', color: '#31522b', background: 'rgba(86,112,75,.08)', borderRadius: 6 }}>{notice}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, .82fr) minmax(360px, 1.5fr)', gap: 18, alignItems: 'start' }} className="lunara-consultation-room-grid">
          <section style={{ padding: 18, border: '1px solid #9c6c44', borderRadius: 8, background: 'rgba(255,246,217,.78)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 12 }}><h2 style={{ margin: 0, color: '#4a2412', fontSize: '1.05rem' }}>Request Ledger</h2><select aria-label="Filter consultations" value={filter} onChange={(event) => setFilter(event.target.value)} style={{ padding: 8, border: '1px solid #9c6c44', borderRadius: 5, color: '#4a2412', background: '#fff6d9' }}><option value="open">Open requests</option><option value="all">All bookings</option><option value="requested">Requested</option><option value="accepted">Accepted</option><option value="scheduled">Scheduled</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select></div>
            {loading && <p role="status">Loading your bookings…</p>}
            {!loading && filtered.length === 0 && <div style={{ padding: '34px 18px', textAlign: 'center', color: '#76563b', border: '1px dashed #b99367', borderRadius: 7 }}><div style={{ fontSize: '2rem' }}>☿</div><strong>THE LEDGER IS CLEAR</strong><p style={{ lineHeight: 1.5 }}>Requests will appear after your approved Guidance profile is published and a seeker books a session.</p></div>}
            <div style={{ display: 'grid', gap: 9 }}>{filtered.map((item) => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} style={{ padding: 13, textAlign: 'left', border: selectedId === item.id ? '2px solid #8b571d' : '1px solid rgba(156,108,68,.55)', borderRadius: 6, background: selectedId === item.id ? 'rgba(220,169,78,.2)' : 'rgba(255,255,255,.4)', color: '#3a1c0d', cursor: 'pointer' }}><span style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><strong>{item.seeker_name || 'Seeker'}</strong><small style={{ textTransform: 'uppercase', color: '#76563b' }}>{item.status?.replaceAll('_', ' ')}</small></span><span style={{ display: 'block', marginTop: 5, fontSize: '.83rem' }}>{item.subject || `${item.consultation_mode} consultation`}</span><small style={{ display: 'block', marginTop: 5, color: '#76563b' }}>{item.scheduled_at ? new Date(item.scheduled_at).toLocaleString() : 'Schedule pending'} · {item.duration_minutes} min</small></button>)}</div>
          </section>

          <section style={{ display: 'grid', gap: 14 }}>
            {!selected ? <div style={{ minHeight: 250, display: 'grid', placeItems: 'center', padding: 28, textAlign: 'center', border: '1px solid #9c6c44', borderRadius: 8, background: 'linear-gradient(145deg,rgba(255,246,217,.88),rgba(234,213,164,.72))', color: '#76563b' }}><div><div style={{ fontSize: '2.4rem' }}>✦</div><h2 style={{ color: '#4a2412' }}>Choose a request</h2><p>Booking details, action controls and the private chat will appear here.</p></div></div> : <>
              <article style={{ padding: 22, border: '1px solid #9c6c44', borderRadius: 8, background: 'linear-gradient(145deg,rgba(255,246,217,.96),rgba(234,213,164,.8))', boxShadow: '0 8px 24px rgba(58,28,13,.12)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}><div><small style={{ letterSpacing: '.12em', color: '#76563b', fontWeight: 800 }}>SEEKER REQUEST · #{selected.id}</small><h2 style={{ margin: '7px 0', color: '#4a2412' }}>{selected.seeker_name || 'Seeker'}</h2><p style={{ margin: 0, color: '#76563b' }}>{selected.subject || 'Spiritual guidance'} · {selected.consultation_mode} · {selected.duration_minutes} minutes</p></div><strong style={{ alignSelf: 'start', padding: '7px 11px', border: '1px solid #9c6c44', borderRadius: 999, color: '#4a2412', textTransform: 'uppercase', fontSize: '.72rem' }}>{selected.status?.replaceAll('_', ' ')}</strong></div>
                <div style={{ margin: '18px 0', padding: 14, borderLeft: '3px solid #9c6c44', background: 'rgba(255,255,255,.35)' }}><small style={{ color: '#76563b', fontWeight: 800 }}>SEEKER’S INTENTION</small><p style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap' }}>{selected.seeker_notes || 'No preparation notes were supplied.'}</p></div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {selected.status === 'requested' && <><button type="button" disabled={saving} onClick={() => updateConsultation({ status: 'accepted' }, 'Request accepted. The seeker has been notified.')} style={consultationPrimaryButtonStyle}>Accept request</button><button type="button" disabled={saving} onClick={() => updateConsultation({ status: 'declined', cancellation_reason: 'The consultant is unable to accept this request.' }, 'Request declined. The seeker has been notified.')} style={consultationQuietButtonStyle}>Decline</button></>}
                  {['accepted', 'scheduled'].includes(selected.status) && <button type="button" disabled={saving} onClick={() => updateConsultation({ status: 'in_progress' }, 'Session marked in progress.')} style={consultationPrimaryButtonStyle}>Begin session</button>}
                  {selected.status === 'in_progress' && <button type="button" disabled={saving} onClick={() => updateConsultation({ status: 'completed' }, 'Session completed.')} style={consultationPrimaryButtonStyle}>Complete session</button>}
                  {!['completed', 'cancelled', 'declined'].includes(selected.status) && <button type="button" disabled={saving} onClick={() => updateConsultation({ status: 'cancelled', cancellation_reason: 'The consultant cancelled this consultation.' }, 'Consultation cancelled.')} style={consultationQuietButtonStyle}>Cancel booking</button>}
                </div>
                {['accepted', 'scheduled'].includes(selected.status) && <div style={{ display: 'flex', gap: 9, alignItems: 'center', flexWrap: 'wrap', marginTop: 16, paddingTop: 15, borderTop: '1px solid rgba(156,108,68,.32)' }}><label style={{ display: 'grid', gap: 5, color: '#76563b', fontSize: '.78rem', fontWeight: 700 }}>SET SESSION TIME<input type="datetime-local" value={schedule} onChange={(event) => setScheduleById((current) => ({ ...current, [selected.id]: event.target.value }))} style={{ padding: 9, border: '1px solid #9c6c44', borderRadius: 5, color: '#3a1c0d', background: '#fff6d9', font: 'inherit' }} /></label><button type="button" disabled={saving || !schedule} onClick={() => updateConsultation({ status: 'scheduled', scheduled_at: new Date(schedule).toISOString() }, 'Session scheduled. The seeker has been notified.')} style={consultationQuietButtonStyle}>Save schedule</button></div>}
              </article>

              <article style={{ padding: 20, border: '1px solid #9c6c44', borderRadius: 8, background: 'rgba(255,246,217,.72)' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}><div><small style={{ letterSpacing: '.11em', color: '#76563b', fontWeight: 800 }}>PRIVATE PRACTITIONER RECORD</small><h3 style={{ margin: '5px 0 12px', color: '#4a2412' }}>Session notes</h3></div><button type="button" disabled={saving || ['completed', 'cancelled', 'declined'].includes(selected.status)} onClick={() => updateConsultation({ status: selected.status, consultant_notes: notes }, 'Private notes saved.')} style={consultationPrimaryButtonStyle}>{saving ? 'Saving…' : 'Save private notes'}</button></div><textarea aria-label="Private consultant notes" maxLength={5000} rows={5} value={notes} onChange={(event) => setNotesById((current) => ({ ...current, [selected.id]: event.target.value }))} placeholder="Record observations and practical follow-up steps for your professional use." style={{ width: '100%', boxSizing: 'border-box', padding: 13, border: '1px solid #b99367', borderRadius: 6, background: 'rgba(255,255,255,.55)', color: '#3a1c0d', font: 'inherit', resize: 'vertical' }} /><small style={{ color: '#76563b' }}>{notes.length}/5000 characters · private to the assigned consultant and administrators</small></article>

              <details style={{ padding: 17, border: '1px solid #9c6c44', borderRadius: 8, background: 'rgba(255,246,217,.58)' }}><summary style={{ color: '#4a2412', fontWeight: 800, cursor: 'pointer' }}>Open private consultation chat</summary><div style={{ marginTop: 14 }}><SpiritualConsultationChat conversationId={`consultation-${selected.id}`} participantName={selected.seeker_name || 'Seeker'} viewerRole="consultant" viewerName="Spiritual Consultant" /></div></details>
            </>}
          </section>
        </div>
      </section>
      <style>{`.lunara-consultation-room-grid{grid-template-columns:minmax(260px,.82fr) minmax(360px,1.5fr)}@media(max-width:760px){.lunara-consultation-room-grid{grid-template-columns:1fr}}`}</style>
    </RoleDashboardHeader>
  );
};

const consultationPrimaryButtonStyle = { padding: '10px 15px', border: '1px solid #6b3518', borderRadius: 5, color: '#fff1c4', background: 'linear-gradient(135deg,#4a2412,#6b3518)', font: 'inherit', fontWeight: 700, cursor: 'pointer' };
const consultationQuietButtonStyle = { padding: '10px 15px', border: '1px solid #9c6c44', borderRadius: 5, color: '#4a2412', background: 'rgba(255,255,255,.3)', font: 'inherit', fontWeight: 700, cursor: 'pointer' };

const ConsultantMetricCard = ({
  icon,
  label,
  value,
  detail,
  accent
}) => {
  const accentMap = {
    red: '#8b0000',
    gold: '#9c6c44',
    green: '#166534',
    brown: '#5c3a21'
  };

  const accentColor =
    accentMap[accent] || '#5c3a21';

  return (
    <motion.div
      whileHover={{
        y: -4,
        scale: 1.01
      }}
      style={{
        ...consultantMetricCardStyle,
        borderTop:
          `3px solid ${accentColor}`
      }}
    >
      <div
        style={{
          ...consultantMetricIconStyle,
          color: accentColor,
          borderColor: accentColor
        }}
      >
        {icon}
      </div>

      <div style={consultantMetricLabelStyle}>
        {label}
      </div>

      <div
        style={{
          ...consultantMetricValueStyle,
          color: accentColor
        }}
      >
        {value}
      </div>

      <div style={consultantMetricDetailStyle}>
        {detail}
      </div>
    </motion.div>
  );
};

const ConsultantPrinciple = ({
  number,
  title,
  text
}) => (
  <div style={consultantPrincipleCardStyle}>
    <span style={consultantPrincipleNumberStyle}>
      {number}
    </span>

    <strong style={consultantPrincipleTitleStyle}>
      {title}
    </strong>

    <span style={consultantPrincipleTextStyle}>
      {text}
    </span>
  </div>
);

const ConsultantSignal = ({
  label,
  value,
  detail
}) => (
  <motion.div
    whileHover={{ y: -3 }}
    style={consultantSignalCardStyle}
  >
    <span style={consultantSignalLabelStyle}>
      {label}
    </span>
    <strong style={consultantSignalValueStyle}>
      {value}
    </strong>
    <span style={consultantSignalDetailStyle}>
      {detail}
    </span>
  </motion.div>
);

/* =========================================================
   ADMIN DASHBOARD
   ========================================================= */

export const AdminDashboard = () => {
  const [professionalStatusFilter, setProfessionalStatusFilter] = useState('pending');
  const [professionalApplications, setProfessionalApplications] = useState([]);
  const [professionalLoading, setProfessionalLoading] = useState(false);
  const [professionalError, setProfessionalError] = useState('');
  const [professionalNote, setProfessionalNote] = useState({});
  const [professionalUpdatingId, setProfessionalUpdatingId] = useState(null);
  const [expertFeedback, setExpertFeedback] = useState([]);
  const [expertTypeFilter, setExpertTypeFilter] = useState('all');
  const [expertLoading, setExpertLoading] = useState(false);
  const [consultantProfiles, setConsultantProfiles] = useState([]);
  const [consultantStatusFilter, setConsultantStatusFilter] = useState('pending');
  const [consultantReviewLoading, setConsultantReviewLoading] = useState(false);
  const [consultantReviewError, setConsultantReviewError] = useState('');
  const [consultantReviewMessage, setConsultantReviewMessage] = useState('');
  const [publishingConsultantId, setPublishingConsultantId] = useState(null);

  // Administrator reporting state. These views use the persisted platform
  // analytics/reporting endpoints and remain separate from consultant review.
  const [adminOverview, setAdminOverview] = useState(null);
  const [adminConsultationAnalytics, setAdminConsultationAnalytics] = useState(null);
  const [adminAuditEvents, setAdminAuditEvents] = useState([]);
  const [adminReportingLoading, setAdminReportingLoading] = useState(false);
  const [adminReportingError, setAdminReportingError] = useState('');
  const [adminReportGeneratedAt, setAdminReportGeneratedAt] = useState('');
  // Administrator announcement composer. The backend validates the audience,
  // enforces administrator access, persists the notification, and writes audit.
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementCategory, setAnnouncementCategory] = useState('announcement');
  const [announcementAudience, setAnnouncementAudience] = useState('all');
  const [announcementRole, setAnnouncementRole] = useState('');
  const [announcementRecipientId, setAnnouncementRecipientId] = useState('');
  const [announcementActionUrl, setAnnouncementActionUrl] = useState('');
  const [announcementSubmitting, setAnnouncementSubmitting] = useState(false);
  const [announcementError, setAnnouncementError] = useState('');
  const [announcementSuccess, setAnnouncementSuccess] = useState('');


  const loadAdminReporting = async () => {
    setAdminReportingLoading(true);
    setAdminReportingError('');
    try {
      const [overviewResponse, reportResponse, consultationsResponse] = await Promise.all([
        api.get('/api/admin/analytics/overview'),
        api.get('/api/admin/reports/platform-summary'),
        api.get('/api/admin/analytics/consultations', { params: { limit: 8 } })
      ]);

      const overview = overviewResponse?.data || {};
      const report = reportResponse?.data || {};
      const consultationAnalytics = consultationsResponse?.data || {};

      setAdminOverview(overview);
      setAdminConsultationAnalytics(consultationAnalytics);
      setAdminAuditEvents(Array.isArray(report?.recent_audit_events) ? report.recent_audit_events : []);
      setAdminReportGeneratedAt(report?.generated_at || overview?.generated_at || '');
    } catch (error) {
      setAdminReportingError(
        error?.response?.data?.detail ||
        'Platform analytics could not be loaded. Verify administrator access and that the reporting endpoints are available.'
      );
    } finally {
      setAdminReportingLoading(false);
    }
  };

  const downloadSystemReport = () => {
    if (!adminOverview) {
      setAdminReportingError('Run platform analysis before downloading the system report.');
      return;
    }
    const readingStats = adminOverview.readings_by_type || {};
    const consultationStatuses = adminOverview.consultations_by_status || adminConsultationAnalytics?.by_status || {};
    downloadPdfReport('Platform System Report', [
      { heading: 'Platform overview', lines: [
        `Generated: ${adminReportGeneratedAt ? new Date(adminReportGeneratedAt).toLocaleString() : new Date().toLocaleString()}`,
        `Total accounts: ${adminOverview.totals?.users ?? 0}`,
        `Consultant profiles: ${adminOverview.totals?.consultant_profiles ?? 0}`,
        `Tarot readings: ${adminOverview.totals?.tarot_readings ?? 0}`,
        `Palm readings: ${adminOverview.totals?.palm_readings ?? 0}`,
        `Guidance sessions: ${adminOverview.totals?.consultations ?? 0}`,
        `Notifications: ${adminOverview.totals?.notifications ?? 0} (${adminOverview.totals?.unread_notifications ?? 0} unread)`,
      ] },
      { heading: 'Accounts by role', lines: Object.entries(adminOverview.users_by_role || {}).map(([role, count]) => `${role === 'User' ? 'Seeker' : role}: ${count}`) },
      { heading: 'Account access status', lines: Object.entries(adminOverview.users_by_account_status || {}).map(([status, count]) => `${status}: ${count}`) },
      { heading: 'Readings and review status', lines: ['Note: all saved readings are completed analyses; pending/completed below refers to the separate expert review queue.', ...['tarot', 'palm'].map((type) => {
        const stats = readingStats[type] || {};
        return `${type === 'tarot' ? 'Tarot' : 'Palm'}: ${stats.total ?? 0} total; ${stats.analysis_completed ?? 0} analysis completed; ${stats.expert_review_pending ?? 0} awaiting expert review; ${stats.expert_review_completed ?? 0} expert reviews completed`;
      })] },
      { heading: 'Guidance sessions by status', lines: Object.entries(consultationStatuses).map(([status, count]) => `${status.replaceAll('_', ' ')}: ${count}`) },
      { heading: 'Recent guidance sessions', lines: (adminConsultationAnalytics?.recent || []).length ? adminConsultationAnalytics.recent.map((session) => {
        const seekerName = session.seeker?.full_name || session.seeker?.name || `Seeker #${session.seeker_user_id ?? 'unknown'}`;
        const consultantName = session.consultant?.full_name || session.consultant?.name || `Consultant #${session.consultant_user_id ?? 'unknown'}`;
        return `${session.created_at ? new Date(session.created_at).toLocaleString() : ''} | ${session.status || 'requested'} | ${session.mode || 'guidance'} | ${seekerName} with ${consultantName}`;
      }) : ['No guidance sessions are recorded.'] },
      { heading: 'Recent platform activity', lines: adminAuditEvents.length ? adminAuditEvents.map((event) => `${event.created_at ? new Date(event.created_at).toLocaleString() : ''} | ${event.action || 'Activity'} | ${event.target_type || ''} ${event.target_id || ''} | ${event.details || ''}`) : ['No recent audit events are recorded.'] },
    ], `lunara-platform-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };


  const publishAdminAnnouncement = async (event) => {
    event.preventDefault();
    setAnnouncementError('');
    setAnnouncementSuccess('');

    const title = announcementTitle.trim();
    const message = announcementMessage.trim();

    if (!title || !message) {
      setAnnouncementError('Enter both a title and a message before publishing.');
      return;
    }

    if (title.length > 180 || message.length > 5000 || announcementCategory.trim().length > 40) {
      setAnnouncementError('The title, message, or category exceeds the allowed length.');
      return;
    }
    const actionUrl = announcementActionUrl.trim();
    if (actionUrl && !(actionUrl.startsWith('/') && !actionUrl.startsWith('//')) && !actionUrl.startsWith('https://')) {
      setAnnouncementError('Use a local path or a secure https:// action URL.');
      return;
    }

    const payload = {
      title,
      message,
      category: announcementCategory.trim() || 'announcement',
      recipient_user_id: announcementAudience === 'user'
        ? Number(announcementRecipientId)
        : null,
      target_role: announcementAudience === 'role'
        ? announcementRole
        : null,
      action_url: actionUrl || null
    };

    if (
      announcementAudience === 'user' &&
      (!announcementRecipientId.trim() || !Number.isInteger(payload.recipient_user_id) || payload.recipient_user_id <= 0)
    ) {
      setAnnouncementError('Enter a valid positive numeric user ID.');
      return;
    }

    if (announcementAudience === 'role' && !announcementRole) {
      setAnnouncementError('Choose a role for this targeted announcement.');
      return;
    }

    setAnnouncementSubmitting(true);
    try {
      const response = await api.post('/api/admin/notifications', payload);
      const created = response?.data?.notification;
      setAnnouncementSuccess(
        created?.id
          ? `Announcement published successfully (notification #${created.id}).`
          : (response?.data?.message || 'Announcement published successfully.')
      );
      setAnnouncementTitle('');
      setAnnouncementMessage('');
      setAnnouncementActionUrl('');
      setAnnouncementRecipientId('');
      await loadAdminReporting();
    } catch (error) {
      setAnnouncementError(
        error?.response?.data?.detail ||
        'The announcement could not be published. Confirm administrator access and try again.'
      );
    } finally {
      setAnnouncementSubmitting(false);
    }
  };

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      loadAdminReporting();
    }, 0);
    return () => window.clearTimeout(timerId);
    // Defer the initial reporting load until after the current effect completes.
  }, []);

  const loadConsultantProfilesForReview = async (status = consultantStatusFilter) => {
    setConsultantReviewLoading(true);
    setConsultantReviewError('');
    try {
      const response = await api.get('/api/admin/consultant-profiles', { params: { status } });
      setConsultantProfiles(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setConsultantReviewError(error?.response?.data?.detail || 'Consultant profiles could not be loaded. Confirm that you are signed in as an Administrator.');
      setConsultantProfiles([]);
    } finally {
      setConsultantReviewLoading(false);
    }
  };

  const loadProfessionalApplications = async () => {
    setProfessionalLoading(true); setProfessionalError('');
    try {
      const response = await api.get('/api/admin/professional-applications', { params: { status: professionalStatusFilter } });
      setProfessionalApplications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setProfessionalError(error?.response?.data?.detail || 'Professional applications could not be loaded.');
      setProfessionalApplications([]);
    } finally { setProfessionalLoading(false); }
  };

  const loadExpertFeedback = async () => {
    setExpertLoading(true);
    try {
      const response = await api.get('/api/admin/expert-feedback', { params: { reading_type: expertTypeFilter } });
      setExpertFeedback(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setProfessionalError((current) => current || error?.response?.data?.detail || 'Expert feedback could not be loaded.');
    } finally { setExpertLoading(false); }
  };

  const decideProfessionalAccount = async (application, status) => {
    setProfessionalUpdatingId(application.id); setProfessionalError('');
    try {
      await api.patch(`/api/admin/professional-applications/${application.id}`, {
        status,
        note: professionalNote[application.id] || '',
        publish_consultant: application.role === 'Spiritual Consultant',
      });
      await Promise.all([loadProfessionalApplications(), loadConsultantProfilesForReview(consultantStatusFilter), loadAdminReporting()]);
    } catch (error) {
      setProfessionalError(error?.response?.data?.detail || 'The account decision could not be saved.');
    } finally { setProfessionalUpdatingId(null); }
  };

  useEffect(() => {
    const timerId = window.setTimeout(() => { loadProfessionalApplications(); }, 0);
    return () => window.clearTimeout(timerId);
    // Selected lifecycle filter controls this queue.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [professionalStatusFilter]);

  useEffect(() => {
    const timerId = window.setTimeout(() => { loadExpertFeedback(); }, 0);
    return () => window.clearTimeout(timerId);
    // Selected reading type controls this archive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expertTypeFilter]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      loadConsultantProfilesForReview(consultantStatusFilter);
    }, 0);
    return () => window.clearTimeout(timerId);
    // The selected status is the trigger for refreshing the review queue.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultantStatusFilter]);

  const publishConsultantProfile = async (consultantUserId) => {
    setPublishingConsultantId(consultantUserId);
    setConsultantReviewError('');
    setConsultantReviewMessage('');
    try {
      const response = await api.post(`/api/consultants/${consultantUserId}/publish`);
      setConsultantReviewMessage(response?.data?.message || 'Consultant profile published successfully.');
      await loadConsultantProfilesForReview(consultantStatusFilter);
    } catch (error) {
      setConsultantReviewError(error?.response?.data?.detail || 'The consultant profile could not be published.');
    } finally {
      setPublishingConsultantId(null);
    }
  };

  return (
    <RoleDashboardHeader
      eyebrow="LUNARA • SYSTEM ARCHIVE"
      title="System Administrator"
      icon="◈"
      description="Oversee professional access, review Tarot and Palm quality feedback, manage consultant listings, and monitor platform health."
    >
      <div style={{ width: 'min(1080px, 100%)', margin: '0 auto', textAlign: 'left' }}>
        <section style={{ ...portalCardStyle, padding: '26px', marginBottom: '24px' }}>
          <div className="portal-card-icon" style={portalIconStyle}>♙</div>
          <h2 style={portalCardTitleStyle}>Professional Account Applications</h2>
          <p style={portalCardTextStyle}>Review the applicant identity details on file for Tarot Reader, Palm Analyst, and Spiritual Consultant accounts. Approve, reject, or suspend access. Complete consultant listings can be published to Guidance after approval.</p>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, flexWrap: 'wrap', fontWeight: 700 }}>Account state
            <select value={professionalStatusFilter} onChange={(event) => setProfessionalStatusFilter(event.target.value)} style={{ padding: '9px 12px', border: '1px solid #a7835b', borderRadius: 4, background: '#f4e8c1', color: '#2c1a0f' }}>
              <option value="pending">Awaiting review</option><option value="active">Approved</option><option value="rejected">Not approved</option><option value="suspended">Suspended</option><option value="all">All professional accounts</option>
            </select>
            <button type="button" onClick={loadProfessionalApplications} disabled={professionalLoading} style={{ padding: '9px 12px', border: '1px solid #8b571d', borderRadius: 4, background: 'transparent', color: '#6b3518', cursor: 'pointer' }}>{professionalLoading ? 'Loading…' : 'Refresh'}</button>
          </label>
          {professionalError && <p role="alert" style={{ marginTop: 14, color: '#8b0000' }}>{professionalError}</p>}
          {professionalLoading && <p role="status" style={{ color: '#76563b' }}>Loading applications…</p>}
          {!professionalLoading && professionalApplications.length === 0 && <p style={{ color: '#76563b' }}>No professional accounts match this filter.</p>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14, marginTop: 16 }}>
            {professionalApplications.map((application) => <article key={application.id} style={{ padding: 18, border: '1px solid #c4a77f', borderRadius: 6, background: 'rgba(255,255,255,.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}><strong>{application.role}</strong><span style={{ textTransform: 'uppercase', fontSize: '.72rem' }}>{application.account_status}</span></div>
              <h3 style={{ margin: '10px 0 5px' }}>{application.nickname || `${application.first_name || ''} ${application.last_name || ''}`.trim() || application.username}</h3>
              <p style={{ margin: '4px 0', overflowWrap: 'anywhere' }}>{application.email}</p>
              <p style={{ margin: '4px 0', color: '#76563b', fontSize: '.82rem' }}>Identity on file: {application.first_name || '—'} {application.last_name || ''} · DOB {application.date_of_birth || '—'} · {application.gender || 'Gender not provided'}</p>
              <p style={{ margin: '4px 0', color: '#76563b', fontSize: '.82rem' }}>Applied {application.created_at ? new Date(application.created_at).toLocaleString() : '—'} · Account #{application.id}</p>
              {application.consultant_profile && <div style={{ marginTop: 10, padding: 12, border: '1px solid rgba(156,108,68,.5)', borderRadius: 4 }}><strong>{application.consultant_profile.professional_name}</strong><p style={{ margin: '7px 0' }}>{application.consultant_profile.biography || 'Biography not supplied.'}</p><small>Specialties: {(application.consultant_profile.specialties || []).join(', ') || 'Not supplied'} · Experience: {application.consultant_profile.years_experience || 0} years · Rate: {application.consultant_profile.session_rate == null ? 'Not set' : `${application.consultant_profile.currency} ${application.consultant_profile.session_rate}`}</small></div>}
              {application.approval_note && <p style={{ color: '#76563b', fontSize: '.84rem' }}>Previous note: {application.approval_note}</p>}
              {['pending', 'active'].includes(application.account_status) && <label style={{ display: 'grid', gap: 6, marginTop: 12, fontSize: '.8rem', fontWeight: 700 }}>Decision note<textarea maxLength={2000} rows={2} value={professionalNote[application.id] || ''} onChange={(event) => setProfessionalNote((current) => ({ ...current, [application.id]: event.target.value }))} placeholder="Optional note for the applicant" style={{ width: '100%', padding: 10, border: '1px solid #c4a77f', borderRadius: 4, background: 'rgba(255,255,255,.4)', font: 'inherit' }} /></label>}
              {application.account_status === 'pending' && <div style={{ display: 'flex', gap: 8, marginTop: 12 }}><button type="button" disabled={professionalUpdatingId === application.id} onClick={() => decideProfessionalAccount(application, 'active')} style={{ flex: 1, padding: 10, border: '1px solid #496d35', borderRadius: 4, color: '#fff4d6', background: '#496d35', cursor: 'pointer' }}>{professionalUpdatingId === application.id ? 'Saving…' : 'Approve account'}</button><button type="button" disabled={professionalUpdatingId === application.id} onClick={() => decideProfessionalAccount(application, 'rejected')} style={{ flex: 1, padding: 10, border: '1px solid #8b0000', borderRadius: 4, color: '#8b0000', background: 'transparent', cursor: 'pointer' }}>Reject</button></div>}
              {application.account_status === 'active' && <button type="button" disabled={professionalUpdatingId === application.id} onClick={() => decideProfessionalAccount(application, 'suspended')} style={{ width: '100%', marginTop: 12, padding: 10, border: '1px solid #8b0000', borderRadius: 4, color: '#8b0000', background: 'transparent', cursor: 'pointer' }}>Suspend professional access</button>}
              {application.account_status === 'suspended' && <button type="button" disabled={professionalUpdatingId === application.id} onClick={() => decideProfessionalAccount(application, 'active')} style={{ width: '100%', marginTop: 12, padding: 10, border: '1px solid #496d35', borderRadius: 4, color: '#496d35', background: 'transparent', cursor: 'pointer' }}>Restore access</button>}
            </article>)}
          </div>
        </section>

        <section style={{ ...portalCardStyle, padding: '26px', marginBottom: '24px' }}>
          <h2 style={portalCardTitleStyle}>Tarot & Palm Analyst Feedback Archive</h2>
          <p style={portalCardTextStyle}>Read professional corrections, suggestions, verdicts, and ratings submitted to improve the intelligence platform.</p>
          <label style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', fontWeight: 700 }}>Reading type<select value={expertTypeFilter} onChange={(event) => setExpertTypeFilter(event.target.value)} style={{ padding: '9px 12px', border: '1px solid #a7835b', borderRadius: 4, background: '#f4e8c1', color: '#2c1a0f' }}><option value="all">All feedback</option><option value="tarot">Tarot</option><option value="palm">Palm</option></select></label>
          {expertLoading && <p role="status">Loading expert feedback…</p>}
          {!expertLoading && expertFeedback.length === 0 && <p style={{ color: '#76563b' }}>No expert feedback has been submitted yet.</p>}
          <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>{expertFeedback.map((item) => <article key={item.id} style={{ padding: 16, border: '1px solid #c4a77f', borderRadius: 5, background: 'rgba(255,255,255,.26)' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><strong>{item.reading_type === 'palm' ? 'Palm Analysis' : `Tarot · ${item.spread_type || 'Reading'}`}</strong><span>Rating {item.review?.rating}/10 · {item.review?.verdict}</span></div><p style={{ color: '#76563b', fontSize: '.78rem' }}>Reviewer role: {item.review?.reviewer_role || 'Professional'} · {item.review?.reviewed_at ? new Date(item.review.reviewed_at).toLocaleString() : ''}</p><p><strong>Suggestions</strong><br />{item.review?.suggestions || 'None supplied.'}</p><p><strong>Corrections</strong><br />{item.review?.corrections || 'None supplied.'}</p><details><summary>Reading summary</summary><p style={{ whiteSpace: 'pre-wrap' }}>{item.analysis_summary}</p></details></article>)}</div>
        </section>

        <section style={{ ...portalCardStyle, padding: '26px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '18px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ ...portalIconStyle, marginBottom: '10px' }}>▤</div>
              <h2 style={portalCardTitleStyle}>Platform Intelligence & Audit</h2>
              <p style={portalCardTextStyle}>A live summary of persisted platform activity, consultation outcomes, and recent administrative events.</p>
              {adminReportGeneratedAt && <p style={{ margin: '8px 0 0', color: '#76563b', fontSize: '0.78rem' }}>Report generated: {new Date(adminReportGeneratedAt).toLocaleString()}</p>}
            </div>
            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
              <button type="button" onClick={loadAdminReporting} disabled={adminReportingLoading} style={{ padding: '11px 15px', border: '1px solid #6c2c18', borderRadius: '4px', background: adminReportingLoading ? '#b7a18a' : '#6c2c18', color: '#fff4d6', cursor: adminReportingLoading ? 'wait' : 'pointer', fontWeight: 700 }}>
                {adminReportingLoading ? 'Analyzing…' : 'Analyze platform'}
              </button>
              <button type="button" onClick={downloadSystemReport} disabled={!adminOverview} style={{ padding: '11px 15px', border: '1px solid #6c2c18', borderRadius: '4px', background: 'rgba(255,255,255,.34)', color: '#4c2b19', cursor: adminOverview ? 'pointer' : 'not-allowed', fontWeight: 700 }}>
                Download system report (PDF)
              </button>
            </div>
          </div>

          {adminReportingError && <p role="alert" style={{ marginTop: '16px', padding: '12px', background: 'rgba(139,0,0,0.07)', border: '1px solid #8b0000', borderRadius: '4px', color: '#8b0000' }}>{adminReportingError}</p>}
          {adminReportingLoading && !adminOverview && <p role="status" style={{ color: '#76563b' }}>Retrieving platform analytics…</p>}

          {adminOverview && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '12px', marginTop: '22px' }}>
                {[
                  { label: 'Registered users', value: adminOverview?.totals?.users ?? 0, icon: '♙' },
                  { label: 'Consultant profiles', value: adminOverview?.totals?.consultant_profiles ?? 0, icon: '✧' },
                  { label: 'Consultations', value: adminOverview?.totals?.consultations ?? 0, icon: '☷' },
                  { label: 'Saved readings', value: adminOverview?.totals?.readings ?? 0, icon: '☽' },
                  { label: 'Notifications', value: adminOverview?.totals?.notifications ?? 0, icon: '✉' },
                  { label: 'Unread alerts', value: adminOverview?.totals?.unread_notifications ?? 0, icon: '◉' }
                ].map((metric) => (
                  <article key={metric.label} style={{ padding: '17px 15px', border: '1px solid #c4a77f', borderRadius: '5px', background: 'rgba(255,255,255,0.3)', minWidth: 0 }}>
                    <div style={{ color: '#8b0000', fontSize: '1.15rem' }}>{metric.icon}</div>
                    <div style={{ marginTop: '9px', color: '#76563b', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>{metric.label}</div>
                    <div style={{ marginTop: '5px', color: '#3e2723', fontSize: '1.8rem', fontWeight: 700 }}>{Number(metric.value).toLocaleString()}</div>
                  </article>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: 16, marginTop: 22 }}>
                <article style={{ minHeight: 290, padding: 16, border: '1px solid #c4a77f', borderRadius: 5, background: 'rgba(255,255,255,.22)' }}>
                  <h3 style={{ margin: '0 0 8px', color: '#3e2723', fontSize: '.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Accounts by role</h3>
                  {Object.values(adminOverview.users_by_role || {}).some((count) => Number(count) > 0) ? <ResponsiveContainer width="100%" height={240}><PieChart><Pie data={Object.entries(adminOverview.users_by_role || {}).map(([name,value]) => ({ name: name === 'User' ? 'Seeker' : name, value: Number(value) })).filter((item) => item.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={76} label={({ name, value }) => `${name}: ${value}`}>{Object.entries(adminOverview.users_by_role || {}).filter(([,value]) => Number(value) > 0).map(([roleName], index) => <Cell key={roleName} fill={['#6b3518','#9c6c44','#dca94e','#59734b','#8b0000'][index % 5]} />)}</Pie><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} /></PieChart></ResponsiveContainer> : <p style={{ color: '#76563b' }}>No account data is available.</p>}
                </article>
                <article style={{ minHeight: 290, padding: 16, border: '1px solid #c4a77f', borderRadius: 5, background: 'rgba(255,255,255,.22)' }}>
                  <h3 style={{ margin: '0 0 8px', color: '#3e2723', fontSize: '.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Analysis & review status</h3>
                  <ResponsiveContainer width="100%" height={240}><BarChart data={['tarot','palm'].map((type) => ({ name: type === 'tarot' ? 'Tarot' : 'Palm', reviewed: Number(adminOverview.readings_by_type?.[type]?.expert_review_completed || 0), pending: Number(adminOverview.readings_by_type?.[type]?.expert_review_pending || 0) }))} margin={{ top: 14, right: 8, left: -18, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(156,108,68,.25)" /><XAxis dataKey="name" tick={{ fill: '#4c2b19', fontSize: 12 }} /><YAxis allowDecimals={false} tick={{ fill: '#76563b', fontSize: 11 }} /><Tooltip /><Legend /><Bar dataKey="reviewed" name="Expert review complete" fill="#59734b" radius={[4,4,0,0]} /><Bar dataKey="pending" name="Awaiting expert review" fill="#dca94e" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer>
                  <small style={{ color: '#76563b' }}>Every saved record is a completed AI analysis. Bars show the separate human expert review stage.</small>
                </article>
                <article style={{ minHeight: 290, padding: 16, border: '1px solid #c4a77f', borderRadius: 5, background: 'rgba(255,255,255,.22)' }}>
                  <h3 style={{ margin: '0 0 8px', color: '#3e2723', fontSize: '.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Guidance sessions by status</h3>
                  <ResponsiveContainer width="100%" height={250}><BarChart data={Object.entries(adminOverview.consultations_by_status || {}).map(([name,value]) => ({ name: name.replaceAll('_',' '), sessions: Number(value) }))} margin={{ top: 12, right: 10, left: -16, bottom: 35 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(156,108,68,.25)" /><XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} height={52} tick={{ fill: '#4c2b19', fontSize: 10 }} /><YAxis allowDecimals={false} tick={{ fill: '#76563b', fontSize: 11 }} /><Tooltip /><Bar dataKey="sessions" name="Sessions" fill="#8b571d" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer>
                </article>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginTop: '22px' }}>
                <div style={{ padding: '18px', border: '1px solid #c4a77f', borderRadius: '5px', background: 'rgba(255,255,255,0.22)' }}>
                  <h3 style={{ margin: '0 0 12px', color: '#3e2723', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Users by role</h3>
                  {Object.keys(adminOverview?.users_by_role || {}).length === 0
                    ? <p style={{ color: '#76563b', fontSize: '0.86rem' }}>No role statistics are available yet.</p>
                    : Object.entries(adminOverview.users_by_role).map(([roleName, count]) => (
                      <div key={roleName} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '8px 0', borderBottom: '1px solid rgba(156,108,68,0.22)', color: '#4c2b19', fontSize: '0.88rem' }}>
                        <span>{roleName === 'User' ? 'Seeker' : roleName}</span><strong>{Number(count).toLocaleString()}</strong>
                      </div>
                    ))}
                </div>
                <div style={{ padding: '18px', border: '1px solid #c4a77f', borderRadius: '5px', background: 'rgba(255,255,255,0.22)' }}>
                  <h3 style={{ margin: '0 0 12px', color: '#3e2723', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Consultations by status</h3>
                  {Object.keys(adminConsultationAnalytics?.by_status || {}).length === 0
                    ? <p style={{ color: '#76563b', fontSize: '0.86rem' }}>No consultation status data is available yet.</p>
                    : Object.entries(adminConsultationAnalytics.by_status).map(([statusName, count]) => (
                      <div key={statusName} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '8px 0', borderBottom: '1px solid rgba(156,108,68,0.22)', color: '#4c2b19', fontSize: '0.88rem' }}>
                        <span style={{ textTransform: 'capitalize' }}>{statusName.replace(/_/g, ' ')}</span><strong>{Number(count).toLocaleString()}</strong>
                      </div>
                    ))}
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, color: '#3e2723', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Recent audit events</h3>
                  <span style={{ color: '#76563b', fontSize: '0.78rem' }}>{adminAuditEvents.length} recent event{adminAuditEvents.length === 1 ? '' : 's'}</span>
                </div>
                {adminAuditEvents.length === 0 ? (
                  <p style={{ padding: '15px', color: '#76563b', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }}>No audit events were returned for this report.</p>
                ) : (
                  <div style={{ overflowX: 'auto', marginTop: '12px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '540px', fontSize: '0.82rem' }}>
                      <thead><tr style={{ textAlign: 'left', color: '#76563b', borderBottom: '1px solid #c4a77f' }}>
                        <th style={{ padding: '10px 8px' }}>Time</th><th style={{ padding: '10px 8px' }}>Action</th><th style={{ padding: '10px 8px' }}>Target</th><th style={{ padding: '10px 8px' }}>Details</th>
                      </tr></thead>
                      <tbody>{adminAuditEvents.map((event, index) => (
                        <tr key={event.id || `${event.action || 'event'}-${event.created_at || index}`} style={{ borderBottom: '1px solid rgba(156,108,68,0.2)', color: '#4c2b19' }}>
                          <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>{event.created_at ? new Date(event.created_at).toLocaleString() : '—'}</td>
                          <td style={{ padding: '10px 8px', fontWeight: 700 }}>{event.action || 'Platform event'}</td>
                          <td style={{ padding: '10px 8px' }}>{[event.target_type, event.target_id].filter(Boolean).join(' · ') || '—'}</td>
                          <td style={{ padding: '10px 8px', maxWidth: '280px', overflowWrap: 'anywhere' }}>{event.details || '—'}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </section>


        <section style={{ ...portalCardStyle, padding: '26px', marginBottom: '24px' }}>
          <div style={portalIconStyle}>✉</div>
          <h2 style={portalCardTitleStyle}>Announcements & Notifications</h2>
          <p style={portalCardTextStyle}>
            Publish a platform-wide announcement, target a role, or send a notification to one account.
            Successful sends are persisted and recorded in the administrator audit trail.
          </p>

          <form onSubmit={publishAdminAnnouncement} style={{ marginTop: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <label style={{ display: 'grid', gap: '7px', color: '#4c2b19', fontWeight: 700, fontSize: '0.88rem' }}>
                Announcement title
                <input type="text" value={announcementTitle}
                  onChange={(event) => setAnnouncementTitle(event.target.value)}
                  maxLength={160} required placeholder="A note from Lunara"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px', border: '1px solid #c4a77f', borderRadius: '4px', background: 'rgba(255,255,255,0.55)', color: '#3e2723' }}
                />
                <span style={{ color: '#76563b', fontSize: '0.72rem', fontWeight: 400 }}>{announcementTitle.length}/160 characters</span>
              </label>

              <label style={{ display: 'grid', gap: '7px', color: '#4c2b19', fontWeight: 700, fontSize: '0.88rem' }}>
                Notification category
                <input type="text" value={announcementCategory}
                  onChange={(event) => setAnnouncementCategory(event.target.value)}
                  maxLength={40} required placeholder="announcement"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px', border: '1px solid #c4a77f', borderRadius: '4px', background: 'rgba(255,255,255,0.55)', color: '#3e2723' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '7px', color: '#4c2b19', fontWeight: 700, fontSize: '0.88rem' }}>
                Audience
                <select value={announcementAudience}
                  onChange={(event) => setAnnouncementAudience(event.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px', border: '1px solid #c4a77f', borderRadius: '4px', background: 'rgba(255,255,255,0.55)', color: '#3e2723' }}
                >
                  <option value="all">Everyone on Lunara</option>
                  <option value="role">Specific role</option>
                  <option value="user">One user (ID)</option>
                </select>
              </label>

              {announcementAudience === 'role' && (
                <label style={{ display: 'grid', gap: '7px', color: '#4c2b19', fontWeight: 700, fontSize: '0.88rem' }}>
                  Target role
                  <select value={announcementRole}
                    onChange={(event) => setAnnouncementRole(event.target.value)}
                    required
                    style={{ width: '100%', boxSizing: 'border-box', padding: '12px', border: '1px solid #c4a77f', borderRadius: '4px', background: 'rgba(255,255,255,0.55)', color: '#3e2723' }}
                  >
                    <option value="">Select a role…</option>
                    {Object.keys(adminOverview?.users_by_role || {}).sort().map((roleName) => (
                      <option key={roleName} value={roleName}>{roleName}</option>
                    ))}
                  </select>
                  <span style={{ color: '#76563b', fontSize: '0.72rem', fontWeight: 400 }}>Role values come from the backend analytics response.</span>
                </label>
              )}

              {announcementAudience === 'user' && (
                <label style={{ display: 'grid', gap: '7px', color: '#4c2b19', fontWeight: 700, fontSize: '0.88rem' }}>
                  Recipient user ID
                  <input type="number" min="1" step="1" value={announcementRecipientId}
                    onChange={(event) => setAnnouncementRecipientId(event.target.value)}
                    required placeholder="e.g. 12"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '12px', border: '1px solid #c4a77f', borderRadius: '4px', background: 'rgba(255,255,255,0.55)', color: '#3e2723' }}
                  />
                </label>
              )}

              <label style={{ display: 'grid', gap: '7px', color: '#4c2b19', fontWeight: 700, fontSize: '0.88rem' }}>
                Optional action URL
                <input type="text" value={announcementActionUrl}
                  onChange={(event) => setAnnouncementActionUrl(event.target.value)}
                  maxLength={500} placeholder="/dashboard or https://…"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px', border: '1px solid #c4a77f', borderRadius: '4px', background: 'rgba(255,255,255,0.55)', color: '#3e2723' }}
                />
              </label>
            </div>

            <label style={{ display: 'grid', gap: '7px', marginTop: '16px', color: '#4c2b19', fontWeight: 700, fontSize: '0.88rem' }}>
              Message
              <textarea value={announcementMessage}
                onChange={(event) => setAnnouncementMessage(event.target.value)}
                maxLength={5000} rows={5} required
                placeholder="Write the message your selected audience will see…"
                style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', padding: '12px', border: '1px solid #c4a77f', borderRadius: '4px', background: 'rgba(255,255,255,0.55)', color: '#3e2723', font: 'inherit', lineHeight: 1.55 }}
              />
              <span style={{ color: '#76563b', fontSize: '0.72rem', fontWeight: 400 }}>{announcementMessage.length}/5000 characters</span>
            </label>

            {announcementError && (
              <p role="alert" style={{ marginTop: '14px', padding: '12px', background: 'rgba(139,0,0,0.07)', border: '1px solid #8b0000', borderRadius: '4px', color: '#8b0000' }}>
                {announcementError}
              </p>
            )}
            {announcementSuccess && (
              <p role="status" style={{ marginTop: '14px', padding: '12px', background: 'rgba(53,104,56,0.08)', border: '1px solid #537b45', borderRadius: '4px', color: '#315b2d' }}>
                {announcementSuccess}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="submit" disabled={announcementSubmitting}
                style={{ padding: '12px 18px', border: '1px solid #6c2c18', borderRadius: '4px', background: announcementSubmitting ? '#b7a18a' : '#6c2c18', color: '#fff4d6', cursor: announcementSubmitting ? 'wait' : 'pointer', fontWeight: 700 }}
              >
                {announcementSubmitting ? 'Publishing…' : 'Publish notification'}
              </button>
            </div>
          </form>
        </section>

        <section style={{ ...portalCardStyle, padding: '26px', marginBottom: '24px' }}>
          <div style={portalIconStyle}>◈</div>
          <h2 style={portalCardTitleStyle}>Consultant Publication Review</h2>
          <p style={portalCardTextStyle}>Review submitted professional profiles and publish complete profiles to Guide My Journey → Guidance. Only published profiles are visible to seekers.</p>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '18px', color: '#4c2b19', fontWeight: 700 }}>
            Profile status
            <select value={consultantStatusFilter} onChange={(event) => setConsultantStatusFilter(event.target.value)} style={{ padding: '10px 12px', border: '1px solid #a7835b', borderRadius: '4px', background: '#f4e8c1', color: '#2c1a0f' }}>
              <option value="pending">Pending review</option>
              <option value="published">Published</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All profiles</option>
            </select>
            <button type="button" onClick={() => loadConsultantProfilesForReview()} style={{ padding: '10px 14px', border: '1px solid #8b0000', borderRadius: '4px', background: 'transparent', color: '#8b0000', cursor: 'pointer', fontWeight: 700 }}>Refresh queue</button>
          </label>
          {consultantReviewLoading && <p role="status" style={{ marginTop: '18px', color: '#65452e' }}>Loading consultant profiles…</p>}
          {consultantReviewError && <p role="alert" style={{ marginTop: '18px', color: '#8b0000' }}>{consultantReviewError}</p>}
          {consultantReviewMessage && <p role="status" style={{ marginTop: '18px', color: '#28633a' }}>{consultantReviewMessage}</p>}
          {!consultantReviewLoading && !consultantReviewError && consultantProfiles.length === 0 && <p style={{ marginTop: '22px', color: '#65452e' }}>No consultant profiles match this status filter.</p>}
        </section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '18px' }}>
          {consultantProfiles.map((profile) => (
            <article key={profile.user_id} style={{ background: 'linear-gradient(145deg, rgba(244,232,193,0.97), rgba(232,213,181,0.98))', border: '1px solid #b89a70', borderRadius: '6px', padding: '22px', color: '#2c1a0f', boxShadow: '0 8px 24px rgba(44,26,15,0.10)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <h3 style={{ margin: 0, fontFamily: 'serif', fontSize: '1.25rem' }}>{profile.professional_name || profile.username || 'Unnamed consultant'}</h3>
                <span style={{ padding: '4px 8px', border: '1px solid #a7835b', borderRadius: '3px', fontSize: '0.75rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{profile.status || 'pending'}</span>
              </div>
              <p style={{ margin: '8px 0', color: '#76563b', fontSize: '0.9rem' }}>Account: {profile.username} · User ID: {profile.user_id}</p>
              <p style={{ lineHeight: 1.6 }}>{profile.biography || 'No biography supplied.'}</p>
              <p><strong>Specialties:</strong> {(profile.specialties || []).join(', ') || 'Not supplied'}</p>
              <p><strong>Experience:</strong> {profile.years_experience ?? 0} years</p>
              <p><strong>Languages:</strong> {(profile.languages || []).join(', ') || 'Not supplied'}</p>
              <p><strong>Session rate:</strong> {profile.session_rate == null ? 'Not set' : `${profile.currency || 'INR'} ${profile.session_rate}`}</p>
              <p><strong>Session modes:</strong> {(profile.session_modes || []).join(', ') || 'Not supplied'}</p>
              <p><strong>Availability:</strong> {profile.availability_status || 'offline'}</p>
              {profile.status !== 'published' && (
                <button type="button" disabled={publishingConsultantId === profile.user_id} onClick={() => publishConsultantProfile(profile.user_id)} style={{ width: '100%', marginTop: '10px', padding: '12px 14px', border: '1px solid #6c2c18', borderRadius: '4px', background: publishingConsultantId === profile.user_id ? '#b7a18a' : '#6c2c18', color: '#fff4d6', cursor: publishingConsultantId === profile.user_id ? 'wait' : 'pointer', fontWeight: 700 }}>
                  {publishingConsultantId === profile.user_id ? 'Publishing…' : 'Publish to Guidance'}
                </button>
              )}
            </article>
          ))}
        </div>
      </div>
    </RoleDashboardHeader>
  );
};

/* =========================================================
   SUPPORTING COMPONENTS
   ========================================================= */

const DashboardParticles = () => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
      zIndex: 0
    }}
  >
    {Array.from({ length: 16 }).map((_, index) => (
      <motion.span
        key={index}
        animate={{
          y: [0, -18, 0],
          opacity: [0.08, 0.28, 0.08],
          rotate: [0, 90, 180]
        }}
        transition={{
          duration: 4 + index * 0.25,
          repeat: Infinity,
          delay: index * 0.17
        }}
        style={{
          position: 'absolute',
          left: `${(index * 61) % 100}%`,
          top: `${(index * 37) % 100}%`,
          color: '#9c6c44',
          fontSize: index % 3 === 0 ? '12px' : '7px'
        }}
      >
        {index % 2 === 0 ? '✦' : '·'}
      </motion.span>
    ))}
  </div>
);

const EmptyArchive = ({
  icon,
  title,
  message,
  compact = false
}) => (
  <div
    style={{
      textAlign: 'center',
      padding: compact ? '30px 10px' : '45px 20px',
      color: '#705038'
    }}
  >
    <motion.div
      animate={{
        scale: [1, 1.08, 1],
        opacity: [0.55, 1, 0.55]
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity
      }}
      style={{
        width: compact ? '50px' : '65px',
        height: compact ? '50px' : '65px',
        margin: '0 auto 15px',
        borderRadius: '50%',
        border: '1px solid #9c6c44',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#8b0000',
        fontSize: compact ? '1.2rem' : '1.5rem',
        background: '#e8d5b5'
      }}
    >
      {icon}
    </motion.div>

    <strong
      style={{
        display: 'block',
        color: '#3e2723',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        fontSize: '0.9rem'
      }}
    >
      {title}
    </strong>

    <p
      style={{
        maxWidth: '600px',
        margin: '8px auto 0',
        fontStyle: 'italic',
        lineHeight: '1.6',
        fontSize: '0.9rem'
      }}
    >
      {message}
    </p>
  </div>
);

const LoadingArchive = () => (
  <div style={loadingArchiveStyle}>
    <motion.div
      animate={{
        rotate: 360
      }}
      transition={{
        duration: 7,
        repeat: Infinity,
        ease: 'linear'
      }}
      style={loadingArchiveSealStyle}
    >
      ✦
    </motion.div>

    <motion.div
      animate={{
        opacity: [0.45, 1, 0.45]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity
      }}
    >
      Retrieving the archives...
    </motion.div>
  </div>
);

/* =========================================================
   PALM ANALYST DASHBOARD STYLES
   ========================================================= */

const palmAnalyticsSectionStyle = {
  position: 'relative',
  zIndex: 1,
  maxWidth: '1050px',
  margin: '5px auto 24px',
  padding: '25px',
  textAlign: 'left',
  background:
    'linear-gradient(145deg, rgba(232,213,181,0.82), rgba(244,232,193,0.72))',
  border: '1px solid #9c6c44',
  borderRadius: '5px',
  boxShadow: '0 8px 24px rgba(44,26,15,0.12)',
  overflow: 'hidden',
  boxSizing: 'border-box'
};

const palmAnalyticsHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '20px',
  marginBottom: '20px'
};

const palmAnalyticsTitleStyle = {
  margin: '4px 0 5px',
  color: '#3e2723',
  fontSize: '1.35rem',
  textTransform: 'uppercase',
  letterSpacing: '1.6px'
};

const palmAnalyticsDescriptionStyle = {
  margin: 0,
  maxWidth: '690px',
  color: '#705038',
  fontSize: '0.84rem',
  lineHeight: '1.6',
  fontStyle: 'italic'
};

const palmAnalyticsSealStyle = {
  width: '58px',
  height: '58px',
  minWidth: '58px',
  borderRadius: '50%',
  border: '1px dashed #9c6c44',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8b0000',
  background: 'radial-gradient(circle, #f4e8c1, #d4b895)',
  fontSize: '1.35rem',
  boxShadow: '0 0 0 5px rgba(156,108,68,0.06)'
};

const palmMetricGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '12px'
};

const palmMetricCardStyle = {
  minHeight: '150px',
  padding: '17px',
  background: 'rgba(255,255,255,0.34)',
  border: '1px solid rgba(156,108,68,0.55)',
  borderRadius: '4px',
  boxSizing: 'border-box',
  boxShadow: 'inset 0 0 18px rgba(92,58,33,0.035)',
  transition: 'transform 0.25s ease, box-shadow 0.25s ease'
};

const palmMetricIconStyle = {
  width: '31px',
  height: '31px',
  borderRadius: '50%',
  border: '1px solid',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '9px',
  background: '#f4e8c1',
  fontSize: '0.82rem'
};

const palmMetricLabelStyle = {
  color: '#705038',
  fontSize: '0.6rem',
  fontWeight: 'bold',
  letterSpacing: '1.5px',
  textTransform: 'uppercase'
};

const palmMetricValueStyle = {
  marginTop: '3px',
  fontSize: '1.65rem',
  lineHeight: 1.1,
  fontWeight: 'bold'
};

const palmMetricDetailStyle = {
  marginTop: '7px',
  color: '#76604c',
  fontSize: '0.68rem',
  lineHeight: '1.4'
};

const palmQueueSectionStyle = {
  position: 'relative',
  zIndex: 1,
  maxWidth: '1050px',
  margin: '5px auto 10px',
  padding: '25px',
  textAlign: 'left',
  background: 'linear-gradient(145deg, rgba(244,232,193,0.74), rgba(232,213,181,0.74))',
  border: '2px dashed #5c3a21',
  borderRadius: '6px',
  boxShadow: '0 10px 30px rgba(44,26,15,0.11)',
  boxSizing: 'border-box'
};

const palmQueueHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '20px',
  marginBottom: '18px'
};

const palmQueueTitleStyle = {
  margin: '5px 0 5px',
  color: '#3e2723',
  fontSize: '1.35rem',
  textTransform: 'uppercase',
  letterSpacing: '1.5px'
};

const palmQueueDescriptionStyle = {
  margin: 0,
  maxWidth: '690px',
  color: '#705038',
  fontSize: '0.84rem',
  lineHeight: '1.6',
  fontStyle: 'italic'
};

const palmQueueBadgeStyle = {
  minWidth: '100px',
  padding: '10px 13px',
  textAlign: 'center',
  color: '#8b0000',
  background: 'rgba(139,0,0,0.05)',
  border: '1px solid rgba(139,0,0,0.38)',
  borderRadius: '4px',
  boxSizing: 'border-box'
};

const palmQueueBadgeSmallStyle = {
  display: 'block',
  marginTop: '3px',
  fontSize: '0.5rem',
  letterSpacing: '1.2px',
  fontWeight: 'bold'
};

const palmQueueErrorStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  marginBottom: '15px',
  padding: '12px',
  color: '#8b0000',
  background: 'rgba(139,0,0,0.07)',
  border: '1px solid #8b0000',
  borderRadius: '4px',
  fontSize: '0.76rem'
};

const palmQueueLoadingStyle = {
  minHeight: '150px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  color: '#5c3a21',
  fontStyle: 'italic',
  fontSize: '0.82rem'
};

const palmQueueLoadingSealStyle = {
  width: '45px',
  height: '45px',
  borderRadius: '50%',
  border: '1px dashed #9c6c44',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8b0000'
};

const palmQueueGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '12px'
};

const palmQueueItemStyle = {
  minWidth: 0,
  padding: '16px',
  background: 'rgba(255,255,255,0.38)',
  border: '1px solid #9c6c44',
  borderRadius: '4px',
  boxShadow: '0 4px 12px rgba(44,26,15,0.06)',
  transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
  boxSizing: 'border-box'
};

const palmQueueItemNumberStyle = {
  color: '#9c6c44',
  fontSize: '0.55rem',
  fontWeight: 'bold',
  letterSpacing: '1.6px',
  marginBottom: '6px'
};

const palmQueueItemNameStyle = {
  display: 'block',
  color: '#3e2723',
  fontSize: '0.88rem',
  letterSpacing: '0.4px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

const palmQueueItemMetaStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '8px',
  marginTop: '8px',
  color: '#76604c',
  fontSize: '0.62rem',
  lineHeight: '1.4'
};

const palmQueueItemStatusStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginTop: '12px',
  color: '#8b0000',
  fontSize: '0.54rem',
  fontWeight: 'bold',
  letterSpacing: '1px'
};

const palmQueueMoreStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: '8px',
  marginTop: '18px',
  color: '#9c6c44',
  fontSize: '0.62rem',
  letterSpacing: '1px',
  textTransform: 'uppercase'
};

/* =========================================================
   TREND STYLES
   ========================================================= */

const trendGridStyle = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '20px'
};

const trendPanelStyle = {
  position: 'relative',
  background:
    'linear-gradient(145deg, #ead8b9, #e4cda7)',
  border: '1px solid #9c6c44',
  borderRadius: '5px',
  padding: '25px',
  overflow: 'hidden',
  boxShadow:
    '0 5px 15px rgba(44,26,15,0.1)',
  transition: 'all 0.3s ease'
};

const trendPanelNumberStyle = {
  position: 'absolute',
  top: '12px',
  right: '16px',
  color: 'rgba(92,58,33,0.22)',
  fontSize: '1.8rem',
  fontWeight: 'bold'
};

const trendPanelIconStyle = {
  width: '43px',
  height: '43px',
  borderRadius: '50%',
  border: '1px solid #9c6c44',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8b0000',
  background: '#f4e8c1',
  marginBottom: '14px'
};

const trendPanelTitleStyle = {
  margin: 0,
  color: '#3e2723',
  fontSize: '1.05rem',
  textTransform: 'uppercase',
  letterSpacing: '1.3px'
};

const trendPanelLineStyle = {
  width: '80px',
  height: '1px',
  background:
    'linear-gradient(90deg, #8b0000, transparent)',
  margin: '10px 0 14px'
};

const recommendationPanelStyle = {
  display: 'flex',
  gap: '18px',
  marginTop: '20px',
  padding: '25px',
  background:
    'linear-gradient(145deg, rgba(212,184,149,0.34), rgba(244,232,193,0.35))',
  border: '1px solid #9c6c44',
  borderRadius: '5px'
};

const recommendationIconStyle = {
  width: '48px',
  height: '48px',
  minWidth: '48px',
  borderRadius: '50%',
  border: '1px solid #5c3a21',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8b0000',
  background: '#e8d5b5'
};

const panelEyebrowStyle = {
  color: '#9c6c44',
  fontSize: '0.63rem',
  fontWeight: 'bold',
  letterSpacing: '2.5px',
  textTransform: 'uppercase'
};

const panelTitleStyle = {
  margin: '5px 0 12px',
  color: '#3e2723',
  fontSize: '1.15rem',
  textTransform: 'uppercase',
  letterSpacing: '1.2px'
};

const recommendationListStyle = {
  margin: 0,
  paddingLeft: '18px',
  color: '#4f3423',
  lineHeight: '1.65'
};

const oracleSealStyle = {
  width: '65px',
  height: '65px',
  margin: '0 auto 18px',
  borderRadius: '50%',
  border: '1px dashed #9c6c44',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8b0000',
  fontSize: '1.5rem',
  background:
    'radial-gradient(circle, #f4e8c1, #d4b895)'
};

const processingStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  marginTop: '15px',
  color: '#8b0000',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  letterSpacing: '1px'
};

const dashboardErrorStyle = {
  maxWidth: '600px',
  margin: '18px auto 0',
  padding: '13px',
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  background: 'rgba(139,0,0,0.08)',
  border: '1px solid #8b0000',
  borderRadius: '4px',
  color: '#8b0000',
  fontSize: '0.82rem'
};

/* =========================================================
   HISTORY STYLES
   ========================================================= */

const historyHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '15px',
  borderBottom: '1px solid rgba(212,184,149,0.8)',
  paddingBottom: '10px',
  marginBottom: '10px'
};

const historyIndexStyle = {
  color: '#9c6c44',
  fontSize: '0.58rem',
  letterSpacing: '2px',
  marginBottom: '3px'
};

const historyDateStyle = {
  fontSize: '0.78rem',
  color: '#76604c',
  whiteSpace: 'nowrap'
};

const historyContentStyle = {
  fontSize: '0.9rem',
  color: '#2c1a0f',
  maxHeight: '100px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 4,
  WebkitBoxOrient: 'vertical',
  lineHeight: '1.55'
};

const historyFooterStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '7px',
  marginTop: '12px',
  color: '#9c6c44',
  fontSize: '0.6rem',
  letterSpacing: '1.8px',
  fontWeight: 'bold'
};

const reportExportButtonStyle = {
  border: '1px solid #8b571d',
  borderRadius: '5px',
  padding: '7px 10px',
  color: '#4a2412',
  background: 'rgba(239,209,140,.72)',
  font: 'inherit',
  fontSize: '.78rem',
  cursor: 'pointer'
};

/* =========================================================
   REVIEW WORKSPACE STYLES
   ========================================================= */

const reviewWorkspaceStyle = {
  display: 'flex',
  gap: '25px',
  marginTop: '28px',
  flexWrap: 'wrap',
  position: 'relative'
};

const queuePanelStyle = {
  flex: '1 1 300px',
  background:
    'linear-gradient(145deg, #e8d5b5, #dfc59c)',
  padding: '23px',
  borderRadius: '5px',
  border: '1px solid #9c6c44',
  boxShadow:
    '0 6px 18px rgba(44,26,15,0.1)',
  boxSizing: 'border-box'
};

const queueHeaderStyle = {
  borderBottom: '1px dashed #9c6c44',
  paddingBottom: '13px',
  position: 'relative'
};

const queueTitleStyle = {
  color: '#3e2723',
  textTransform: 'uppercase',
  margin: '5px 0 0',
  fontSize: '1.05rem',
  letterSpacing: '1px'
};

const queueCounterStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  color: '#8b0000',
  fontWeight: 'bold',
  fontSize: '1.15rem'
};

const queueItemStyle = {
  width: '100%',
  padding: '14px',
  border: '1px solid #9c6c44',
  borderRadius: '4px',
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: 'serif',
  fontWeight: 'bold',
  transition: 'all 0.25s ease',
  boxSizing: 'border-box'
};

const reviewFormColumnStyle = {
  flex: '2 1 500px',
  minWidth: 0
};

const reviewCardStyle = {
  position: 'relative',
  background:
    'linear-gradient(145deg, rgba(232,213,181,0.94), rgba(244,232,193,0.88))',
  padding: '30px',
  borderRadius: '5px',
  border: '2px solid #5c3a21',
  boxShadow:
    '0 12px 30px rgba(44,26,15,0.16)',
  overflow: 'hidden',
  boxSizing: 'border-box'
};

const reviewTitleStyle = {
  color: '#3e2723',
  margin: '5px 0 15px',
  fontSize: '1.35rem',
  textTransform: 'uppercase',
  letterSpacing: '1.3px'
};

const reviewSeekerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '11px 13px',
  marginBottom: '18px',
  background: 'rgba(212,184,149,0.3)',
  borderLeft: '4px solid #8b0000',
  borderRadius: '3px'
};

const analysisPreviewStyle = {
  background:
    'rgba(255,255,255,0.38)',
  padding: '17px',
  borderRadius: '4px',
  marginBottom: '20px',
  border: '1px solid rgba(156,108,68,0.45)',
  boxShadow:
    'inset 0 0 15px rgba(92,58,33,0.05)'
};

const analysisPreviewHeaderStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',
  color: '#9c6c44',
  fontSize: '0.65rem',
  letterSpacing: '2px',
  marginBottom: '10px'
};

const analysisPreviewTextStyle = {
  whiteSpace: 'pre-wrap',
  fontFamily: 'sans-serif',
  fontSize: '0.86rem',
  color: '#2c1a0f',
  lineHeight: '1.55',
  margin: 0,
  maxHeight: '250px',
  overflowY: 'auto'
};

const ratingDisplayStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#5c3a21',
  fontSize: '0.75rem'
};

const ratingValueStyle = {
  textAlign: 'center',
  color: '#8b0000',
  fontSize: '0.7rem',
  fontWeight: 'bold',
  letterSpacing: '1px',
  marginTop: '4px'
};

const emptyReviewStyle = {
  minHeight: '400px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '30px',
  background:
    'rgba(232,213,181,0.42)',
  border: '2px dashed #9c6c44',
  borderRadius: '5px',
  boxSizing: 'border-box'
};

const emptyReviewSealStyle = {
  width: '75px',
  height: '75px',
  borderRadius: '50%',
  border: '1px dashed #9c6c44',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8b0000',
  fontSize: '1.8rem',
  marginBottom: '20px'
};

const successMessageStyle = {
  marginTop: '15px',
  padding: '13px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  color: '#166534',
  background: 'rgba(22,101,52,0.08)',
  border: '1px solid #166534',
  borderRadius: '4px',
  fontWeight: 'bold',
  fontSize: '0.82rem'
};

const reviewLoadingStyle = {
  minHeight: '250px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  color: '#5c3a21'
};

const reviewLoadingSealStyle = {
  width: '45px',
  height: '45px',
  borderRadius: '50%',
  border: '1px dashed #9c6c44',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8b0000'
};

/* =========================================================
   PALM ANALYST REVIEW WORKSPACE STYLES
   ========================================================= */

const palmWorkspaceLoadingStyle = {
  minHeight: '260px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  color: '#5c3a21'
};

const palmWorkspaceStyle = {
  position: 'relative',
  zIndex: 1,
  maxWidth: '1200px',
  margin: '25px auto 10px',
  padding: '25px',
  textAlign: 'left',
  background:
    'linear-gradient(145deg, rgba(244,232,193,0.62), rgba(232,213,181,0.62))',
  border: '2px dashed #5c3a21',
  borderRadius: '6px',
  boxShadow: '0 10px 30px rgba(44,26,15,0.11)',
  boxSizing: 'border-box'
};

const palmWorkspaceTopBarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '20px',
  marginBottom: '20px'
};

const palmWorkspaceTitleStyle = {
  margin: '5px 0 5px',
  color: '#3e2723',
  fontSize: '1.5rem',
  textTransform: 'uppercase',
  letterSpacing: '1.8px'
};

const palmWorkspaceDescriptionStyle = {
  margin: 0,
  maxWidth: '720px',
  color: '#705038',
  fontSize: '0.86rem',
  lineHeight: '1.6',
  fontStyle: 'italic'
};

const palmWorkspaceTelemetryStyle = {
  display: 'flex',
  gap: '1px',
  flexShrink: 0,
  background: '#9c6c44',
  border: '1px solid #9c6c44',
  borderRadius: '4px',
  overflow: 'hidden'
};

const palmWorkspaceTelemetryCellStyle = {
  minWidth: '72px',
  padding: '9px 10px',
  textAlign: 'center',
  background: '#e8d5b5'
};

const palmWorkspaceTelemetryLabelStyle = {
  display: 'block',
  fontSize: '0.48rem',
  letterSpacing: '1px',
  color: '#9c6c44'
};

const palmWorkspaceErrorStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  marginBottom: '16px',
  padding: '12px',
  color: '#8b0000',
  background: 'rgba(139,0,0,0.07)',
  border: '1px solid #8b0000',
  borderRadius: '4px',
  fontSize: '0.76rem'
};

const palmWorkspaceGridStyle = {
  display: 'grid',
  gridTemplateColumns:
    'minmax(260px, 0.72fr) minmax(0, 1.9fr)',
  gap: '20px',
  alignItems: 'start'
};

const palmWorkspaceQueueStyle = {
  minWidth: 0,
  background:
    'linear-gradient(145deg, #e8d5b5, #dfc59c)',
  padding: '20px',
  borderRadius: '5px',
  border: '1px solid #9c6c44',
  boxShadow: '0 6px 18px rgba(44,26,15,0.1)',
  boxSizing: 'border-box'
};

const palmWorkspaceQueueTitleStyle = {
  margin: '5px 0 0',
  color: '#3e2723',
  fontSize: '1.05rem',
  textTransform: 'uppercase',
  letterSpacing: '1px'
};

const palmWorkspaceQueueListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '9px',
  marginTop: '17px',
  maxHeight: '690px',
  overflowY: 'auto',
  paddingRight: '3px'
};

const palmWorkspaceQueueItemStyle = {
  width: '100%',
  padding: '13px',
  border: '1px solid #9c6c44',
  borderRadius: '4px',
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: 'serif',
  transition: 'all 0.25s ease',
  boxSizing: 'border-box'
};

const palmWorkspaceQueueNumberStyle = {
  display: 'block',
  marginBottom: '4px',
  fontSize: '0.56rem',
  letterSpacing: '1.5px',
  opacity: 0.72
};

const palmWorkspaceQueueNameStyle = {
  display: 'block',
  fontSize: '0.9rem',
  letterSpacing: '0.3px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

const palmWorkspaceQueueMetaStyle = {
  display: 'block',
  marginTop: '4px',
  fontSize: '0.72rem',
  fontWeight: 'normal',
  opacity: 0.82,
  textTransform: 'uppercase'
};

const palmWorkspaceQueueDateStyle = {
  display: 'block',
  marginTop: '6px',
  fontSize: '0.62rem',
  fontWeight: 'normal',
  opacity: 0.65
};

const palmWorkspaceReviewColumnStyle = {
  minWidth: 0
};

const palmReviewCardStyle = {
  position: 'relative',
  background:
    'linear-gradient(145deg, rgba(232,213,181,0.96), rgba(244,232,193,0.9))',
  padding: '25px',
  borderRadius: '5px',
  border: '2px solid #5c3a21',
  boxShadow: '0 12px 30px rgba(44,26,15,0.16)',
  overflow: 'hidden',
  boxSizing: 'border-box'
};

const palmReviewHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '15px',
  marginBottom: '16px',
  paddingRight: '35px'
};

const palmReviewTitleStyle = {
  margin: '4px 0 0',
  color: '#3e2723',
  fontSize: '1.35rem',
  textTransform: 'uppercase',
  letterSpacing: '1.2px'
};

const palmReviewStatusStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 9px',
  border: '1px solid #9c6c44',
  borderRadius: '20px',
  color: '#8b0000',
  background: 'rgba(139,0,0,0.05)',
  fontSize: '0.55rem',
  fontWeight: 'bold',
  letterSpacing: '1.2px',
  whiteSpace: 'nowrap'
};

const palmReviewStatusDotStyle = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: '#8b0000'
};

const palmSeekerMetaGridStyle = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(3, minmax(0, 1fr))',
  gap: '8px',
  marginBottom: '18px'
};

const palmMetaItemStyle = {
  minWidth: 0,
  padding: '10px 11px',
  background: 'rgba(212,184,149,0.28)',
  borderLeft: '3px solid #9c6c44',
  borderRadius: '3px'
};

const palmMetaItemLabelStyle = {
  display: 'block',
  color: '#9c6c44',
  fontSize: '0.53rem',
  letterSpacing: '1.4px',
  fontWeight: 'bold'
};

const palmMetaItemValueStyle = {
  display: 'block',
  marginTop: '3px',
  color: '#3e2723',
  fontSize: '0.76rem',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const palmEvidenceGridStyle = {
  display: 'grid',
  gridTemplateColumns:
    'minmax(250px, 0.9fr) minmax(250px, 1.1fr)',
  gap: '12px',
  marginBottom: '18px'
};

const palmImagePanelStyle = {
  minWidth: 0,
  padding: '14px',
  background: 'rgba(255,255,255,0.32)',
  border: '1px solid rgba(156,108,68,0.45)',
  borderRadius: '4px',
  boxSizing: 'border-box'
};

const palmFeaturePanelStyle = {
  minWidth: 0,
  padding: '14px',
  background: 'rgba(255,255,255,0.32)',
  border: '1px solid rgba(156,108,68,0.45)',
  borderRadius: '4px',
  boxSizing: 'border-box'
};

const palmEvidenceHeadingStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '9px',
  marginBottom: '10px',
  color: '#9c6c44',
  fontSize: '0.62rem',
  letterSpacing: '1.6px'
};

const palmImageFrameStyle = {
  minHeight: '300px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  background: '#2c1a0f',
  border: '1px solid #5c3a21',
  borderRadius: '3px'
};

const palmImageStyle = {
  width: '100%',
  height: '300px',
  display: 'block',
  objectFit: 'contain',
  background: '#2c1a0f'
};

const palmImagePlaceholderStyle = {
  minHeight: '300px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '9px',
  padding: '25px',
  textAlign: 'center',
  color: '#705038',
  background:
    'radial-gradient(circle, rgba(244,232,193,0.8), rgba(212,184,149,0.35))',
  border: '1px dashed #9c6c44',
  borderRadius: '3px',
  boxSizing: 'border-box'
};

const palmPlaceholderSealStyle = {
  width: '55px',
  height: '55px',
  borderRadius: '50%',
  border: '1px dashed #9c6c44',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8b0000',
  fontSize: '1.35rem'
};

const palmFeatureListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  maxHeight: '300px',
  overflowY: 'auto'
};

const palmFeatureItemStyle = {
  padding: '10px',
  background: 'rgba(212,184,149,0.22)',
  borderLeft: '3px solid #9c6c44',
  borderRadius: '3px'
};

const palmFeatureItemLabelStyle = {
  display: 'block',
  color: '#5c3a21',
  fontSize: '0.66rem',
  fontWeight: 'bold',
  letterSpacing: '1px',
  textTransform: 'uppercase'
};

const palmFeatureItemTextStyle = {
  margin: '5px 0 0',
  color: '#4f3423',
  fontSize: '0.76rem',
  lineHeight: '1.5'
};

const palmFeatureEmptyStyle = {
  minHeight: '270px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  color: '#705038',
  padding: '20px'
};

const palmOracleOutputStyle = {
  marginBottom: '18px',
  padding: '17px',
  background: 'rgba(255,255,255,0.38)',
  border: '1px solid rgba(156,108,68,0.45)',
  borderRadius: '4px',
  boxShadow: 'inset 0 0 15px rgba(92,58,33,0.05)'
};

const palmOracleTextStyle = {
  whiteSpace: 'pre-wrap',
  fontFamily: 'sans-serif',
  fontSize: '0.84rem',
  color: '#2c1a0f',
  lineHeight: '1.6',
  margin: 0,
  maxHeight: '320px',
  overflowY: 'auto'
};

const palmReviewBoundaryStyle = {
  padding: '16px',
  background: 'rgba(212,184,149,0.24)',
  border: '1px dashed #9c6c44',
  borderRadius: '4px'
};

const palmReviewBoundaryHeadingStyle = {
  margin: '4px 0 7px',
  color: '#3e2723',
  fontSize: '0.98rem',
  textTransform: 'uppercase',
  letterSpacing: '1px'
};

const palmReviewBoundaryTextStyle = {
  margin: 0,
  color: '#705038',
  fontSize: '0.78rem',
  lineHeight: '1.6'
};

const palmEmptyReviewStyle = {
  minHeight: '500px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '30px',
  background: 'rgba(232,213,181,0.42)',
  border: '2px dashed #9c6c44',
  borderRadius: '5px',
  boxSizing: 'border-box'
};

/* =========================================================
   ROLE PORTAL STYLES
   ========================================================= */

const roleDashboardStyle = {
  ...dashboardStyle,
  maxWidth: '1200px',
  margin: '0 auto'
};

const roleHeaderStyle = {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '20px',
  padding: '20px 10px 30px',
  textAlign: 'center'
};

const roleSealStyle = {
  width: '70px',
  height: '70px',
  minWidth: '70px',
  borderRadius: '50%',
  border: '2px solid #5c3a21',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background:
    'radial-gradient(circle, #f4e8c1, #d4b895)',
  color: '#8b0000',
  fontSize: '1.8rem',
  boxShadow:
    '0 0 0 5px rgba(156,108,68,0.1), 0 7px 20px rgba(44,26,15,0.16)'
};

const roleTitleStyle = {
  margin: '5px 0',
  color: '#3e2723',
  fontSize: '2rem',
  textTransform: 'uppercase',
  letterSpacing: '3px',
  textShadow: '1px 1px rgba(255,255,255,0.4)'
};

const roleOrnamentStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  color: '#9c6c44',
  fontSize: '0.6rem'
};

const roleDescriptionStyle = {
  ...textStyle,
  maxWidth: '620px',
  margin: '8px auto 0',
  color: '#705038',
  fontSize: '0.9rem',
  fontStyle: 'italic',
  lineHeight: '1.55'
};

const portalCardStyle = {
  ...cardStyle,
  position: 'relative',
  zIndex: 1,
  maxWidth: '620px',
  margin: '0 auto 35px',
  padding: '30px',
  background:
    'linear-gradient(145deg, rgba(244,232,193,0.94), rgba(232,213,181,0.95))',
  border: '2px solid #5c3a21',
  borderRadius: '5px',
  boxShadow:
    '0 12px 35px rgba(44,26,15,0.18), inset 0 0 25px rgba(156,108,68,0.05)',
  overflow: 'hidden',
  boxSizing: 'border-box'
};

const portalIconStyle = {
  width: '55px',
  height: '55px',
  margin: '0 auto 12px',
  borderRadius: '50%',
  border: '1px solid #9c6c44',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8b0000',
  background: '#e8d5b5',
  fontSize: '1.4rem'
};

const portalCardTitleStyle = {
  margin: 0,
  color: '#3e2723',
  fontSize: '1.3rem',
  textTransform: 'uppercase',
  letterSpacing: '1.5px'
};

const portalCardTextStyle = {
  maxWidth: '500px',
  margin: '12px auto',
  color: '#62432b',
  lineHeight: '1.65',
  fontStyle: 'italic'
};

const portalLinkStyle = {
  ...linkStyle,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  padding: '12px 20px',
  marginTop: '8px',
  color: '#f4e8c1',
  background:
    'linear-gradient(135deg, #5c3a21, #2c1a0f)',
  border: '1px solid #3e2723',
  borderRadius: '4px',
  textDecoration: 'none',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '1.5px',
  fontSize: '0.78rem',
  boxShadow: '0 5px 15px rgba(44,26,15,0.22)'
};

/*
const comingSoonStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '9px',
  marginTop: '18px',
  color: '#9c6c44',
  fontSize: '0.65rem',
  fontWeight: 'bold',
  letterSpacing: '2px'
};
*/

const loadingArchiveStyle = {
  minHeight: '130px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '12px',
  color: '#5c3a21',
  fontStyle: 'italic'
};

const loadingArchiveSealStyle = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  border: '1px dashed #9c6c44',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8b0000'
};

/* =========================================================
   TAROT READER INTELLIGENCE STYLES
   ========================================================= */

const tarotAnalyticsSectionStyle = {
  position: 'relative',
  zIndex: 1,
  maxWidth: '1050px',
  margin: '5px auto 30px',
  padding: '25px',
  textAlign: 'left',
  background:
    'linear-gradient(145deg, rgba(232,213,181,0.82), rgba(244,232,193,0.72))',
  border: '1px solid #9c6c44',
  borderRadius: '5px',
  boxShadow: '0 8px 24px rgba(44,26,15,0.12)',
  overflow: 'hidden',
  boxSizing: 'border-box'
};

const tarotAnalyticsHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '20px',
  marginBottom: '20px'
};

const tarotAnalyticsTitleStyle = {
  margin: '4px 0 5px',
  color: '#3e2723',
  fontSize: '1.35rem',
  textTransform: 'uppercase',
  letterSpacing: '1.6px'
};

const tarotAnalyticsDescriptionStyle = {
  margin: 0,
  maxWidth: '690px',
  color: '#705038',
  fontSize: '0.84rem',
  lineHeight: '1.6',
  fontStyle: 'italic'
};

const tarotAnalyticsSealStyle = {
  width: '58px',
  height: '58px',
  minWidth: '58px',
  borderRadius: '50%',
  border: '1px dashed #9c6c44',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8b0000',
  background: 'radial-gradient(circle, #f4e8c1, #d4b895)',
  fontSize: '1.35rem',
  boxShadow: '0 0 0 5px rgba(156,108,68,0.06)'
};

const tarotMetricGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '12px'
};

const tarotMetricCardStyle = {
  minHeight: '150px',
  padding: '17px',
  background: 'rgba(255,255,255,0.34)',
  border: '1px solid rgba(156,108,68,0.55)',
  borderRadius: '4px',
  boxSizing: 'border-box',
  boxShadow: 'inset 0 0 18px rgba(92,58,33,0.035)',
  transition: 'transform 0.25s ease, box-shadow 0.25s ease'
};

const tarotMetricIconStyle = {
  width: '31px',
  height: '31px',
  borderRadius: '50%',
  border: '1px solid',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '9px',
  background: '#f4e8c1',
  fontSize: '0.82rem'
};

const tarotMetricLabelStyle = {
  color: '#705038',
  fontSize: '0.6rem',
  fontWeight: 'bold',
  letterSpacing: '1.5px',
  textTransform: 'uppercase'
};

const tarotMetricValueStyle = {
  marginTop: '3px',
  fontSize: '1.65rem',
  lineHeight: 1.1,
  fontWeight: 'bold'
};

const tarotMetricDetailStyle = {
  marginTop: '7px',
  color: '#76604c',
  fontSize: '0.68rem',
  lineHeight: '1.4'
};

const tarotAnalyticsLegendStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '15px',
  marginTop: '16px',
  color: '#76604c',
  fontSize: '0.62rem',
  letterSpacing: '0.7px',
  textTransform: 'uppercase'
};

const tarotWorkspaceSectionStyle = {
  position: 'relative',
  zIndex: 1,
  maxWidth: '1200px',
  margin: '25px auto 10px',
  padding: '25px',
  textAlign: 'left',
  background:
    'linear-gradient(145deg, rgba(244,232,193,0.62), rgba(232,213,181,0.62))',
  border: '2px dashed #5c3a21',
  borderRadius: '6px',
  boxShadow: '0 10px 30px rgba(44,26,15,0.11)',
  boxSizing: 'border-box'
};

const tarotWorkspaceTopBarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '20px',
  marginBottom: '20px'
};

const tarotWorkspaceTitleStyle = {
  margin: '5px 0 5px',
  color: '#3e2723',
  fontSize: '1.5rem',
  textTransform: 'uppercase',
  letterSpacing: '1.8px'
};

const tarotWorkspaceDescriptionStyle = {
  margin: 0,
  maxWidth: '720px',
  color: '#705038',
  fontSize: '0.86rem',
  lineHeight: '1.6',
  fontStyle: 'italic'
};

const tarotSessionTelemetryStyle = {
  display: 'flex',
  gap: '1px',
  flexShrink: 0,
  background: '#9c6c44',
  border: '1px solid #9c6c44',
  borderRadius: '4px',
  overflow: 'hidden'
};

const tarotSessionTelemetryCellStyle = {
  minWidth: '72px',
  padding: '9px 10px',
  textAlign: 'center',
  background: '#e8d5b5'
};

const tarotWorkspaceToolbarStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(260px, 1fr) 190px 170px',
  gap: '10px',
  marginBottom: '18px'
};

const tarotSearchWrapStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '0 12px',
  background: 'rgba(255,255,255,0.52)',
  border: '1px solid #9c6c44',
  borderRadius: '4px',
  boxSizing: 'border-box'
};

const tarotSearchInputStyle = {
  width: '100%',
  border: 0,
  outline: 'none',
  padding: '11px 0',
  background: 'transparent',
  color: '#2c1a0f',
  fontFamily: 'sans-serif',
  fontSize: '0.82rem'
};

const tarotSelectStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid #9c6c44',
  borderRadius: '4px',
  background: '#f4e8c1',
  color: '#3e2723',
  fontFamily: 'serif',
  outline: 'none',
  cursor: 'pointer'
};

const tarotWorkspaceGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(270px, 0.8fr) minmax(0, 1.8fr)',
  gap: '20px',
  alignItems: 'start'
};

const tarotQueuePanelStyle = {
  minWidth: 0,
  background: 'linear-gradient(145deg, #e8d5b5, #dfc59c)',
  padding: '20px',
  borderRadius: '5px',
  border: '1px solid #9c6c44',
  boxShadow: '0 6px 18px rgba(44,26,15,0.1)',
  boxSizing: 'border-box'
};

const tarotQueueListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '9px',
  marginTop: '17px',
  maxHeight: '650px',
  overflowY: 'auto',
  paddingRight: '3px'
};

const tarotQueueItemStyle = {
  width: '100%',
  padding: '13px',
  border: '1px solid #9c6c44',
  borderRadius: '4px',
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: 'serif',
  transition: 'all 0.25s ease',
  boxSizing: 'border-box'
};

const tarotQueueNumberStyle = {
  display: 'block',
  marginBottom: '4px',
  fontSize: '0.56rem',
  letterSpacing: '1.5px',
  opacity: 0.72
};

const tarotQueueNameStyle = {
  display: 'block',
  fontSize: '0.9rem',
  letterSpacing: '0.3px'
};

const tarotQueueSpreadStyle = {
  display: 'block',
  marginTop: '4px',
  fontSize: '0.72rem',
  fontWeight: 'normal',
  opacity: 0.82
};

const tarotQueueDateStyle = {
  display: 'block',
  marginTop: '6px',
  fontSize: '0.62rem',
  fontWeight: 'normal',
  opacity: 0.65
};

const tarotReviewColumnStyle = {
  minWidth: 0
};

const tarotReviewCardStyle = {
  position: 'relative',
  background:
    'linear-gradient(145deg, rgba(232,213,181,0.96), rgba(244,232,193,0.9))',
  padding: '25px',
  borderRadius: '5px',
  border: '2px solid #5c3a21',
  boxShadow: '0 12px 30px rgba(44,26,15,0.16)',
  overflow: 'hidden',
  boxSizing: 'border-box'
};

const tarotReviewHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '15px',
  marginBottom: '16px',
  paddingRight: '35px'
};

const tarotReviewTitleStyle = {
  margin: '4px 0 0',
  color: '#3e2723',
  fontSize: '1.35rem',
  textTransform: 'uppercase',
  letterSpacing: '1.2px'
};

const tarotReviewStatusStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 9px',
  border: '1px solid #9c6c44',
  borderRadius: '20px',
  color: '#8b0000',
  background: 'rgba(139,0,0,0.05)',
  fontSize: '0.55rem',
  fontWeight: 'bold',
  letterSpacing: '1.2px',
  whiteSpace: 'nowrap'
};

const tarotReviewStatusDotStyle = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: '#8b0000'
};

const tarotSeekerMetaGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '8px',
  marginBottom: '18px'
};

const tarotMetaItemStyle = {
  minWidth: 0,
  padding: '10px 11px',
  background: 'rgba(212,184,149,0.28)',
  borderLeft: '3px solid #9c6c44',
  borderRadius: '3px'
};

const tarotMetaItemLabelStyle = {
  display: 'block',
  color: '#9c6c44',
  fontSize: '0.53rem',
  letterSpacing: '1.4px',
  fontWeight: 'bold'
};

const tarotMetaItemValueStyle = {
  display: 'block',
  marginTop: '3px',
  color: '#3e2723',
  fontSize: '0.76rem',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const tarotEvidenceSectionStyle = {
  marginBottom: '18px'
};

const tarotEvidenceHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '9px',
  color: '#705038',
  fontSize: '0.58rem',
  letterSpacing: '1.6px'
};

const tarotEvidenceGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: '9px'
};

const tarotEvidenceCardStyle = {
  position: 'relative',
  minHeight: '112px',
  padding: '13px 10px 10px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  background: 'linear-gradient(145deg, #f4e8c1, #e8d5b5)',
  border: '1px solid #9c6c44',
  borderRadius: '5px',
  boxShadow: '0 4px 10px rgba(44,26,15,0.09)',
  overflow: 'hidden'
};

const tarotEvidenceNumberStyle = {
  position: 'absolute',
  top: '5px',
  left: '7px',
  color: 'rgba(92,58,33,0.35)',
  fontSize: '0.58rem',
  fontWeight: 'bold'
};

const tarotEvidenceSymbolStyle = {
  marginBottom: '5px',
  color: '#8b0000',
  fontSize: '1rem'
};

const tarotReversedBadgeStyle = {
  marginTop: '5px',
  padding: '2px 5px',
  color: '#8b0000',
  border: '1px solid rgba(139,0,0,0.35)',
  borderRadius: '8px',
  fontSize: '0.48rem',
  letterSpacing: '0.8px'
};

const tarotNoCardsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '18px',
  padding: '13px',
  color: '#705038',
  background: 'rgba(255,255,255,0.3)',
  border: '1px dashed #9c6c44',
  borderRadius: '4px'
};

const tarotOracleOutputStyle = {
  marginBottom: '20px',
  padding: '17px',
  background: 'rgba(255,255,255,0.38)',
  border: '1px solid rgba(156,108,68,0.45)',
  borderRadius: '4px',
  boxShadow: 'inset 0 0 15px rgba(92,58,33,0.05)'
};

const tarotOracleTextStyle = {
  margin: 0,
  maxHeight: '310px',
  overflowY: 'auto',
  whiteSpace: 'pre-wrap',
  color: '#2c1a0f',
  fontFamily: 'sans-serif',
  fontSize: '0.86rem',
  lineHeight: '1.65'
};

const tarotFeedbackFormStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '17px'
};

const tarotFeedbackHeadingStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  gap: '15px',
  paddingBottom: '10px',
  borderBottom: '1px dashed #9c6c44'
};

const tarotFeedbackHeadingTitleStyle = {
  margin: '3px 0 0',
  color: '#3e2723',
  fontSize: '1.1rem',
  textTransform: 'uppercase',
  letterSpacing: '1px'
};

const tarotFeedbackHeadingBadgeStyle = {
  color: '#8b0000',
  fontSize: '0.55rem',
  fontWeight: 'bold',
  letterSpacing: '1.5px'
};

const tarotRatingPanelStyle = {
  padding: '15px',
  background: 'rgba(212,184,149,0.22)',
  border: '1px solid rgba(156,108,68,0.55)',
  borderRadius: '4px'
};

const tarotRatingValueRowStyle = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: '10px',
  marginBottom: '10px'
};

const tarotRatingValueNumberStyle = {
  color: '#8b0000',
  fontSize: '1.35rem'
};

const tarotRatingValueLabelStyle = {
  color: '#705038',
  fontSize: '0.72rem',
  fontStyle: 'italic',
  textAlign: 'right'
};

const tarotRangeStyle = {
  width: '100%',
  accentColor: '#8b0000',
  cursor: 'pointer'
};

const tarotRatingScaleStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(10, 1fr)',
  gap: '5px',
  marginTop: '10px'
};

const tarotRatingDotStyle = {
  minWidth: 0,
  height: '28px',
  padding: 0,
  border: '1px solid #9c6c44',
  borderRadius: '3px',
  cursor: 'pointer',
  fontSize: '0.6rem',
  fontWeight: 'bold'
};

const tarotFeedbackGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '15px'
};

const tarotFieldHintStyle = {
  marginTop: '5px',
  color: '#76604c',
  fontSize: '0.59rem',
  fontStyle: 'italic',
  lineHeight: '1.4'
};

const tarotTrainingNoticeStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '11px',
  padding: '13px',
  background: 'rgba(92,58,33,0.055)',
  border: '1px solid rgba(92,58,33,0.28)',
  borderRadius: '4px'
};

const tarotTrainingIconStyle = {
  width: '34px',
  height: '34px',
  minWidth: '34px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  border: '1px solid #9c6c44',
  color: '#8b0000',
  background: '#e8d5b5'
};

const tarotTrainingTextStyle = {
  margin: '4px 0 0',
  color: '#705038',
  fontSize: '0.72rem',
  lineHeight: '1.55'
};

const tarotActionRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px'
};

const tarotSecondaryButtonStyle = {
  padding: '13px 18px',
  color: '#5c3a21',
  background: 'transparent',
  border: '1px solid #9c6c44',
  borderRadius: '4px',
  cursor: 'pointer',
  fontFamily: 'serif',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  fontSize: '0.7rem'
};

const tarotEmptyReviewStyle = {
  minHeight: '590px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '35px',
  background: 'rgba(232,213,181,0.42)',
  border: '2px dashed #9c6c44',
  borderRadius: '5px',
  boxSizing: 'border-box'
};

const tarotEmptySealStyle = {
  width: '85px',
  height: '85px',
  borderRadius: '50%',
  border: '1px dashed #9c6c44',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8b0000',
  fontSize: '2rem',
  marginBottom: '20px',
  background: 'radial-gradient(circle, #f4e8c1, #d4b895)',
  boxShadow: '0 0 0 8px rgba(156,108,68,0.05)'
};

const tarotEmptyChecklistStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '7px 20px',
  marginTop: '18px',
  color: '#705038',
  fontSize: '0.68rem',
  fontStyle: 'italic',
  textAlign: 'left'
};

const tarotSuccessMessageStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginTop: '14px',
  padding: '12px 14px',
  color: '#166534',
  background: 'rgba(22,101,52,0.08)',
  border: '1px solid #166534',
  borderRadius: '4px'
};

const tarotSuccessTitleStyle = {
  display: 'block',
  fontSize: '0.72rem',
  letterSpacing: '1px'
};

const tarotSuccessDetailStyle = {
  display: 'block',
  marginTop: '2px',
  fontSize: '0.65rem'
};

const tarotWorkspaceLoadingStyle = {
  minHeight: '330px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  color: '#5c3a21'
};

const tarotWorkspaceErrorStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3px',
  marginBottom: '15px',
  padding: '11px 13px',
  color: '#8b0000',
  background: 'rgba(139,0,0,0.07)',
  border: '1px solid #8b0000',
  borderRadius: '4px',
  fontSize: '0.72rem'
};

const tarotPrinciplesStyle = {
  marginTop: '20px',
  paddingTop: '17px',
  borderTop: '1px dashed #9c6c44'
};

const tarotPrinciplesGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '10px',
  marginTop: '9px'
};

const tarotPrincipleCardStyle = {
  padding: '11px',
  background: 'rgba(255,255,255,0.22)',
  border: '1px solid rgba(156,108,68,0.3)',
  borderRadius: '3px'
};

/* =========================================================
   TAROT RESPONSIVE ENHANCEMENTS
   ========================================================= */

const tarotResponsiveStyles = `
  @media (max-width: 980px) {
    .lunara-tarot-metric-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }

    .lunara-tarot-workspace-grid {
      grid-template-columns: 1fr !important;
    }

    .lunara-tarot-principles-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
  }

  @media (max-width: 700px) {
    .lunara-tarot-toolbar {
      grid-template-columns: 1fr !important;
    }

    .lunara-tarot-feedback-grid {
      grid-template-columns: 1fr !important;
    }

    .lunara-tarot-meta-grid {
      grid-template-columns: 1fr !important;
    }

    .lunara-tarot-session {
      width: 100% !important;
    }

    .lunara-tarot-topbar {
      flex-direction: column !important;
    }
  }

  @media (max-width: 480px) {
    .lunara-tarot-metric-grid,
    .lunara-tarot-principles-grid {
      grid-template-columns: 1fr !important;
    }

    .lunara-tarot-rating-scale {
      gap: 2px !important;
    }

    .lunara-tarot-rating-scale button {
      height: 24px !important;
      font-size: 0.52rem !important;
    }

    .lunara-tarot-empty-checklist {
      grid-template-columns: 1fr !important;
    }

    .lunara-tarot-action-row {
      flex-direction: column-reverse !important;
      align-items: stretch !important;
    }
  }
`;

/*
 * These class hooks complement the inline archive styles above.
 * The components intentionally keep their core styling inline so
 * the dashboard remains portable and does not depend on another
 * stylesheet. The class hooks provide the responsive layout layer.
 */

const tarotResponsiveStyleElement =
  typeof document !== 'undefined'
    ? document.getElementById('lunara-tarot-responsive')
    : null;

if (
  typeof document !== 'undefined' &&
  !tarotResponsiveStyleElement
) {
  const tarotStyleElement = document.createElement('style');

  tarotStyleElement.id = 'lunara-tarot-responsive';
  tarotStyleElement.innerHTML = tarotResponsiveStyles;
  document.head.appendChild(tarotStyleElement);
}


/* =========================================================
   SPIRITUAL CONSULTANT DASHBOARD STYLES
   ========================================================= */

const consultantPortalShellStyle = {
  position: 'relative',
  width: '100%',
  maxWidth: '1180px',
  margin: '28px auto 0',
  padding: '26px',
  background:
    'linear-gradient(145deg, rgba(244,232,193,0.72), rgba(232,213,181,0.58))',
  border: '2px solid #5c3a21',
  borderRadius: '7px',
  boxShadow:
    '0 14px 38px rgba(44,26,15,0.16), inset 0 0 35px rgba(156,108,68,0.06)',
  boxSizing: 'border-box'
};

const consultantPortalTopStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '24px',
  padding: '4px 4px 24px',
  borderBottom: '1px solid rgba(156,108,68,0.45)'
};

const consultantPortalTitleStyle = {
  margin: '5px 0 8px',
  color: '#3e2723',
  fontSize: '1.65rem',
  textTransform: 'uppercase',
  letterSpacing: '2px'
};

const consultantPortalDescriptionStyle = {
  maxWidth: '760px',
  margin: 0,
  color: '#705038',
  fontSize: '0.94rem',
  lineHeight: '1.7'
};

const consultantSealStyle = {
  width: '76px',
  height: '76px',
  flex: '0 0 auto',
  borderRadius: '50%',
  border: '1px dashed #9c6c44',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8b0000',
  fontSize: '2rem',
  background: 'rgba(255,255,255,0.25)',
  boxShadow: '0 0 0 7px rgba(156,108,68,0.06)'
};

const consultantBoundaryNoticeStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  marginTop: '20px',
  padding: '14px 16px',
  background: 'rgba(255,255,255,0.34)',
  border: '1px dashed #9c6c44',
  borderRadius: '5px',
  color: '#5c3a21'
};

const consultantBoundaryIconStyle = {
  width: '34px',
  height: '34px',
  flex: '0 0 auto',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8b0000',
  border: '1px solid #9c6c44'
};

const consultantBoundaryStatusStyle = {
  marginLeft: 'auto',
  padding: '6px 9px',
  border: '1px solid #9c6c44',
  borderRadius: '3px',
  color: '#8b0000',
  fontSize: '0.58rem',
  fontWeight: 'bold',
  letterSpacing: '1.3px',
  whiteSpace: 'nowrap'
};

const consultantMetricGridStyle = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(4, minmax(0, 1fr))',
  gap: '12px',
  marginTop: '18px'
};

const consultantMetricCardStyle = {
  minHeight: '154px',
  padding: '18px',
  background:
    'linear-gradient(145deg, rgba(255,255,255,0.42), rgba(212,184,149,0.25))',
  border: '1px solid #9c6c44',
  borderRadius: '5px',
  boxSizing: 'border-box',
  textAlign: 'left',
  boxShadow:
    '0 5px 15px rgba(44,26,15,0.08)'
};

const consultantMetricIconStyle = {
  width: '34px',
  height: '34px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid',
  borderRadius: '50%',
  fontSize: '0.95rem',
  marginBottom: '12px'
};

const consultantMetricLabelStyle = {
  color: '#705038',
  fontSize: '0.62rem',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '1.4px'
};

const consultantMetricValueStyle = {
  marginTop: '5px',
  fontSize: '1.45rem',
  fontWeight: 'bold',
  letterSpacing: '0.5px'
};

const consultantMetricDetailStyle = {
  marginTop: '5px',
  color: '#806049',
  fontSize: '0.7rem',
  lineHeight: '1.45'
};

const consultantNavigationStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginTop: '22px',
  padding: '7px',
  background: 'rgba(92,58,33,0.08)',
  border: '1px solid rgba(156,108,68,0.45)',
  borderRadius: '5px'
};

const consultantNavigationButtonStyle = {
  flex: '1 1 150px',
  padding: '11px 14px',
  border: '1px solid transparent',
  borderRadius: '4px',
  background: 'transparent',
  color: '#5c3a21',
  cursor: 'pointer',
  fontFamily: 'serif',
  fontSize: '0.72rem',
  fontWeight: 'bold',
  letterSpacing: '1px',
  textTransform: 'uppercase'
};

const consultantNavigationButtonActiveStyle = {
  color: '#e8d5b5',
  background:
    'linear-gradient(135deg, #5c3a21, #2c1a0f)',
  borderColor: '#9c6c44',
  boxShadow:
    '0 4px 12px rgba(44,26,15,0.18)'
};

const consultantNoticeStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  marginTop: '12px',
  padding: '10px 13px',
  color: '#166534',
  background: 'rgba(22,101,52,0.08)',
  border: '1px solid rgba(22,101,52,0.5)',
  borderRadius: '4px',
  fontSize: '0.76rem',
  fontWeight: 'bold'
};

const consultantOverviewGridStyle = {
  display: 'grid',
  gridTemplateColumns:
    'minmax(0, 1.35fr) minmax(300px, 0.85fr)',
  gap: '18px',
  marginTop: '18px'
};

const consultantFocusPanelStyle = {
  padding: '22px',
  background:
    'linear-gradient(145deg, rgba(255,255,255,0.42), rgba(212,184,149,0.22))',
  border: '1px solid #9c6c44',
  borderRadius: '5px',
  boxShadow:
    '0 5px 15px rgba(44,26,15,0.07)',
  boxSizing: 'border-box'
};

const consultantSectionTitleStyle = {
  margin: '5px 0 10px',
  color: '#3e2723',
  fontSize: '1.15rem',
  textTransform: 'uppercase',
  letterSpacing: '1.3px'
};

const consultantSectionTextStyle = {
  margin: 0,
  color: '#62432b',
  lineHeight: '1.7',
  fontSize: '0.86rem'
};

const consultantPrinciplesGridStyle = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(2, minmax(0, 1fr))',
  gap: '10px',
  marginTop: '18px'
};

const consultantPrincipleCardStyle = {
  display: 'grid',
  gridTemplateColumns: '42px 1fr',
  gap: '5px 10px',
  padding: '13px',
  background: 'rgba(255,255,255,0.3)',
  border: '1px solid rgba(156,108,68,0.65)',
  borderRadius: '4px'
};

const consultantPrincipleNumberStyle = {
  gridRow: '1 / span 2',
  width: '34px',
  height: '34px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  background: '#5c3a21',
  color: '#e8d5b5',
  fontSize: '0.62rem',
  fontWeight: 'bold'
};

const consultantPrincipleTitleStyle = {
  color: '#8b0000',
  fontSize: '0.67rem',
  letterSpacing: '1.2px'
};

const consultantPrincipleTextStyle = {
  color: '#705038',
  fontSize: '0.74rem',
  lineHeight: '1.5'
};

const consultantPulseListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1px',
  marginTop: '15px',
  borderTop: '1px solid rgba(156,108,68,0.35)'
};

const consultantPulseRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '14px',
  padding: '12px 0',
  borderBottom: '1px solid rgba(156,108,68,0.28)',
  color: '#705038',
  fontSize: '0.75rem'
};

const consultantLocalModeStyle = {
  display: 'flex',
  gap: '11px',
  marginTop: '18px',
  padding: '12px',
  background: 'rgba(139,0,0,0.05)',
  borderLeft: '3px solid #8b0000',
  color: '#5c3a21'
};

const consultantDeskGridStyle = {
  display: 'grid',
  gridTemplateColumns:
    'minmax(330px, 0.85fr) minmax(0, 1.25fr)',
  gap: '18px',
  marginTop: '18px',
  alignItems: 'start'
};

const consultantFormPanelStyle = {
  padding: '22px',
  background:
    'linear-gradient(145deg, rgba(255,255,255,0.42), rgba(212,184,149,0.22))',
  border: '1px solid #9c6c44',
  borderRadius: '5px',
  boxSizing: 'border-box'
};

const consultantFormStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  marginTop: '17px'
};

const consultantFieldGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const consultantFormTwoColumnStyle = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(2, minmax(0, 1fr))',
  gap: '12px'
};

const consultantSelectStyle = {
  ...inputStyle,
  appearance: 'auto',
  cursor: 'pointer'
};

const consultantFormActionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap'
};

const consultantSecondaryButtonStyle = {
  padding: '13px 18px',
  border: '1px solid #9c6c44',
  borderRadius: '4px',
  background: 'rgba(255,255,255,0.34)',
  color: '#5c3a21',
  cursor: 'pointer',
  fontFamily: 'serif',
  fontWeight: 'bold',
  letterSpacing: '0.8px'
};

const consultantSessionPanelStyle = {
  minWidth: 0,
  padding: '22px',
  background:
    'linear-gradient(145deg, rgba(255,255,255,0.42), rgba(212,184,149,0.22))',
  border: '1px solid #9c6c44',
  borderRadius: '5px',
  boxSizing: 'border-box'
};

const consultantSessionPanelHeaderStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '15px'
};

const consultantCountBadgeStyle = {
  padding: '7px 9px',
  border: '1px solid #9c6c44',
  borderRadius: '3px',
  color: '#8b0000',
  fontSize: '0.57rem',
  fontWeight: 'bold',
  letterSpacing: '1px',
  whiteSpace: 'nowrap'
};

const consultantEmptyStateStyle = {
  minHeight: '260px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '25px',
  color: '#705038',
  border: '1px dashed #9c6c44',
  borderRadius: '5px',
  marginTop: '15px',
  boxSizing: 'border-box'
};

const consultantEmptySealStyle = {
  width: '62px',
  height: '62px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  border: '1px dashed #9c6c44',
  color: '#8b0000',
  fontSize: '1.6rem',
  marginBottom: '13px'
};

const consultantSessionListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  marginTop: '15px',
  maxHeight: '620px',
  overflowY: 'auto',
  paddingRight: '3px'
};

const consultantSessionCardStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: '10px',
  padding: '13px',
  background: 'rgba(255,255,255,0.34)',
  border: '1px solid rgba(156,108,68,0.62)',
  borderRadius: '4px',
  boxSizing: 'border-box'
};

const consultantSessionCardActiveStyle = {
  borderColor: '#8b0000',
  boxShadow:
    '0 6px 16px rgba(139,0,0,0.1)'
};

const consultantSessionSelectStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '4px',
  minWidth: 0,
  border: 0,
  background: 'transparent',
  color: '#2c1a0f',
  padding: 0,
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: 'serif'
};

const consultantSessionIndexStyle = {
  color: '#8b0000',
  fontSize: '0.56rem',
  fontWeight: 'bold',
  letterSpacing: '1px'
};

const consultantSessionNameStyle = {
  color: '#3e2723',
  fontSize: '0.9rem',
  textTransform: 'uppercase',
  letterSpacing: '0.7px'
};

const consultantSessionMetaStyle = {
  color: '#806049',
  fontSize: '0.67rem'
};

const consultantSessionFocusStyle = {
  color: '#62432b',
  fontSize: '0.72rem',
  lineHeight: '1.4'
};

const consultantSessionActionsStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '6px'
};

const consultantSmallActionStyle = {
  padding: '7px 9px',
  border: '1px solid #9c6c44',
  borderRadius: '3px',
  background: 'rgba(255,255,255,0.45)',
  color: '#5c3a21',
  cursor: 'pointer',
  fontSize: '0.6rem',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '0.7px'
};

const consultantDangerActionStyle = {
  ...consultantSmallActionStyle,
  color: '#8b0000',
  borderColor: 'rgba(139,0,0,0.45)'
};

const consultantNotesGridStyle = {
  display: 'grid',
  gridTemplateColumns:
    'minmax(260px, 0.72fr) minmax(0, 1.28fr)',
  gap: '18px',
  marginTop: '18px',
  alignItems: 'start'
};

const consultantNotebookListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '7px',
  marginTop: '15px',
  maxHeight: '540px',
  overflowY: 'auto'
};

const consultantNotebookItemStyle = {
  display: 'grid',
  gridTemplateColumns: '22px minmax(0, 1fr) 18px',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  padding: '11px',
  border: '1px solid rgba(156,108,68,0.55)',
  borderRadius: '4px',
  background: 'rgba(255,255,255,0.28)',
  color: '#5c3a21',
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: 'serif'
};

const consultantNotebookItemActiveStyle = {
  background:
    'linear-gradient(135deg, rgba(92,58,33,0.95), rgba(44,26,15,0.94))',
  color: '#e8d5b5',
  borderColor: '#9c6c44'
};

const consultantNotebookEditorStyle = {
  minWidth: 0,
  padding: '22px',
  background:
    'linear-gradient(145deg, rgba(255,255,255,0.42), rgba(212,184,149,0.22))',
  border: '1px solid #9c6c44',
  borderRadius: '5px',
  boxSizing: 'border-box'
};

const consultantEditorMetaStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '7px',
  margin: '10px 0 17px'
};

const consultantEditorActionsStyle = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '10px',
  marginTop: '5px'
};

const consultantEmptyEditorStyle = {
  minHeight: '350px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  color: '#705038',
  border: '1px dashed #9c6c44',
  borderRadius: '5px'
};

const consultantNotebookIconStyle = {
  fontSize: '1.6rem',
  color: '#8b0000',
  marginBottom: '10px'
};

const consultationChatShellStyle = {
  marginTop: '20px',
  padding: '18px',
  border: '1px solid #9c6c44',
  borderRadius: '6px',
  background:
    'linear-gradient(145deg, rgba(244,232,193,0.58), rgba(232,213,181,0.42))',
  boxShadow: '0 6px 18px rgba(44,26,15,0.09)',
  textAlign: 'left'
};

const consultationChatHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '16px',
  flexWrap: 'wrap'
};

const consultationChatTitleStyle = {
  margin: '5px 0 4px',
  color: '#3e2723',
  fontSize: '1.05rem'
};

const consultationChatSubtitleStyle = {
  margin: 0,
  color: '#705038',
  fontSize: '0.78rem',
  lineHeight: '1.55',
  maxWidth: '720px'
};

const consultationChatStatusStyle = {
  padding: '7px 10px',
  border: '1px solid #9c6c44',
  borderRadius: '999px',
  color: '#8b0000',
  background: 'rgba(139,0,0,0.06)',
  fontSize: '0.58rem',
  fontWeight: 'bold',
  letterSpacing: '1px',
  whiteSpace: 'nowrap'
};

const consultationChatQuickActionsStyle = {
  display: 'flex',
  gap: '7px',
  flexWrap: 'wrap',
  marginTop: '14px'
};

const consultationChatQuickButtonStyle = {
  border: '1px solid #9c6c44',
  borderRadius: '4px',
  background: 'rgba(255,255,255,0.45)',
  color: '#5c3a21',
  padding: '7px 10px',
  cursor: 'pointer',
  fontSize: '0.6rem',
  fontWeight: 'bold',
  letterSpacing: '0.8px'
};

const consultationChatMessagesStyle = {
  minHeight: '190px',
  maxHeight: '340px',
  overflowY: 'auto',
  marginTop: '14px',
  padding: '12px',
  border: '1px solid rgba(156,108,68,0.72)',
  borderRadius: '5px',
  background: 'rgba(255,255,255,0.32)',
  display: 'flex',
  flexDirection: 'column',
  gap: '9px'
};

const consultationChatMessageRowStyle = {
  display: 'flex',
  width: '100%'
};

const consultationChatBubbleStyle = {
  maxWidth: '82%',
  padding: '10px 12px',
  borderRadius: '7px',
  border: '1px solid #9c6c44',
  boxShadow: '0 3px 9px rgba(44,26,15,0.06)'
};

const consultationChatOwnBubbleStyle = {
  background: 'linear-gradient(135deg, #5c3a21, #3e2723)',
  color: '#f4e8c1'
};

const consultationChatOtherBubbleStyle = {
  background: 'rgba(244,232,193,0.78)',
  color: '#2c1a0f'
};

const consultationChatMetaStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  fontSize: '0.62rem',
  letterSpacing: '0.5px'
};

const consultationChatMessageTextStyle = {
  margin: '7px 0',
  lineHeight: '1.55',
  fontSize: '0.82rem',
  whiteSpace: 'pre-wrap'
};

const consultationChatTimeStyle = {
  display: 'block',
  opacity: 0.68,
  fontSize: '0.58rem',
  textAlign: 'right'
};

const consultationChatEmptyStyle = {
  minHeight: '160px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  color: '#705038'
};

const consultationChatComposerStyle = {
  display: 'grid',
  gap: '9px',
  marginTop: '12px'
};

const consultationChatTopicStyle = {
  ...inputStyle,
  padding: '10px 12px',
  fontSize: '0.76rem'
};

const consultationChatInputStyle = {
  ...inputStyle,
  minHeight: '78px',
  fontSize: '0.82rem'
};

const consultationChatNoticeStyle = {
  marginTop: '9px',
  padding: '9px 11px',
  border: '1px dashed #9c6c44',
  background: 'rgba(255,255,255,0.3)',
  color: '#705038',
  fontSize: '0.68rem',
  lineHeight: '1.45'
};

const consultantChatWorkspaceStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(240px, 0.75fr) minmax(0, 1.45fr)',
  gap: '18px',
  alignItems: 'start'
};

const consultantResponsiveStyles = `
  @media (max-width: 900px) {
    .lunara-consultant-metrics {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }

    .lunara-consultant-overview,
    .lunara-consultant-desk,
    .lunara-consultant-notes {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 650px) {
    .lunara-consultant-top {
      flex-direction: column !important;
      align-items: flex-start !important;
    }

    .lunara-consultant-boundary {
      align-items: flex-start !important;
      flex-wrap: wrap !important;
    }

    .lunara-consultant-boundary-status {
      margin-left: 0 !important;
    }

    .lunara-consultant-form-columns {
      grid-template-columns: 1fr !important;
    }

    .lunara-consultant-session-card {
      grid-template-columns: 1fr !important;
    }

    .lunara-consultant-session-actions {
      flex-direction: row !important;
      justify-content: flex-start !important;
    }

    .lunara-consultant-principles {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 480px) {
    .lunara-consultant-metrics {
      grid-template-columns: 1fr !important;
    }

    .lunara-consultant-shell {
      padding: 16px !important;
    }

    .lunara-consultant-navigation {
      flex-direction: column !important;
    }

    .lunara-consultant-navigation button {
      flex: 1 1 auto !important;
    }
  }

  @media (max-width: 650px) {
    .lunara-consultant-queue-controls {
      grid-template-columns: 1fr !important;
    }

    .lunara-consultant-signal-grid {
      grid-template-columns: 1fr !important;
    }

    .lunara-consultant-history-card {
      grid-template-columns: 1fr !important;
    }
  }
`;

if (
  typeof document !== 'undefined' &&
  !document.getElementById(
    'lunara-consultant-responsive'
  )
) {
  const consultantStyleElement =
    document.createElement('style');

  consultantStyleElement.id =
    'lunara-consultant-responsive';

  consultantStyleElement.innerHTML =
    consultantResponsiveStyles;

  document.head.appendChild(
    consultantStyleElement
  );
}


/* =========================================================
   SPIRITUAL CONSULTANT EXTENDED WORKSPACE STYLES
   ========================================================= */

const consultantBackendBarStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  flexWrap: 'wrap',
  marginTop: '12px',
  padding: '9px 11px',
  border: '1px solid rgba(156,108,68,0.45)',
  borderRadius: '4px',
  background: 'rgba(255,255,255,0.24)',
  color: '#705038',
  fontSize: '0.66rem'
};

const consultantBackendDotStyle = {
  display: 'inline-block',
  width: '7px',
  height: '7px',
  marginRight: '7px',
  borderRadius: '50%',
  background: '#166534',
  boxShadow: '0 0 0 3px rgba(22,101,52,0.08)'
};

const consultantBackendButtonStyle = {
  padding: '7px 10px',
  border: '1px solid #9c6c44',
  borderRadius: '3px',
  background: 'rgba(255,255,255,0.42)',
  color: '#5c3a21',
  cursor: 'pointer',
  fontFamily: 'serif',
  fontSize: '0.59rem',
  fontWeight: 'bold',
  letterSpacing: '0.8px'
};

const consultantQueueGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(280px, 0.75fr) minmax(0, 1.25fr)',
  gap: '18px',
  marginTop: '18px',
  alignItems: 'start'
};

const consultantQueueControlsStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.5fr) minmax(150px, 0.65fr)',
  gap: '10px',
  marginTop: '17px'
};

const consultantQueueSummaryStyle = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '8px',
  marginTop: '18px',
  padding: '14px',
  borderLeft: '3px solid #8b0000',
  background: 'rgba(139,0,0,0.045)',
  color: '#705038'
};

const consultantQueueCardStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: '14px',
  padding: '14px',
  border: '1px solid rgba(156,108,68,0.62)',
  borderRadius: '4px',
  background: 'rgba(255,255,255,0.3)',
  boxSizing: 'border-box'
};

const consultantQueueActionsStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '7px'
};

const consultantIntelligenceGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.25fr) minmax(300px, 0.75fr)',
  gap: '18px',
  marginTop: '18px',
  alignItems: 'start'
};

const consultantSignalGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '10px',
  marginTop: '18px'
};

const consultantSignalCardStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  padding: '15px',
  border: '1px solid rgba(156,108,68,0.58)',
  borderRadius: '4px',
  background: 'rgba(255,255,255,0.28)'
};

const consultantSignalLabelStyle = {
  color: '#705038',
  fontSize: '0.6rem',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '1.2px'
};

const consultantSignalValueStyle = {
  color: '#8b0000',
  fontSize: '1.35rem'
};

const consultantSignalDetailStyle = {
  color: '#806049',
  fontSize: '0.67rem',
  lineHeight: '1.45'
};

const consultantIntelligenceNoteStyle = {
  marginTop: '16px',
  padding: '13px',
  border: '1px dashed #9c6c44',
  borderRadius: '4px',
  background: 'rgba(255,255,255,0.25)',
  color: '#705038',
  fontSize: '0.72rem',
  lineHeight: '1.55'
};

const consultantDistributionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '13px',
  marginTop: '20px'
};

const consultantDistributionRowStyle = {
  display: 'grid',
  gridTemplateColumns: '90px minmax(0, 1fr) 35px',
  alignItems: 'center',
  gap: '9px',
  color: '#705038',
  fontSize: '0.68rem'
};

const consultantDistributionTrackStyle = {
  height: '8px',
  overflow: 'hidden',
  borderRadius: '99px',
  background: 'rgba(156,108,68,0.2)',
  border: '1px solid rgba(156,108,68,0.4)'
};

const consultantDistributionBarStyle = {
  height: '100%',
  borderRadius: '99px',
  background: 'linear-gradient(90deg, #8b0000, #9c6c44)'
};

const consultantPracticeChecklistStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '7px',
  marginTop: '22px',
  padding: '14px',
  color: '#62432b',
  background: 'rgba(255,255,255,0.25)',
  border: '1px solid rgba(156,108,68,0.4)',
  borderRadius: '4px',
  fontSize: '0.7rem',
  lineHeight: '1.5'
};

const consultantHistoryPanelStyle = {
  marginTop: '18px'
};

const consultantHistoryListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  marginTop: '16px'
};

const consultantHistoryCardStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: '18px',
  padding: '15px',
  border: '1px solid rgba(156,108,68,0.58)',
  borderRadius: '4px',
  background: 'rgba(255,255,255,0.3)',
  boxSizing: 'border-box'
};

const consultantHistoryTextStyle = {
  margin: '7px 0 0',
  color: '#705038',
  fontSize: '0.75rem',
  lineHeight: '1.55'
};

const consultantHistoryScoreStyle = {
  minWidth: '105px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  justifyContent: 'center',
  gap: '5px',
  color: '#705038',
  fontSize: '0.58rem',
  fontWeight: 'bold',
  letterSpacing: '0.8px'
};

/* =========================================================
   RESPONSIVE STYLES
   ========================================================= */

const responsiveStyles = `
  @media (max-width: 760px) {
    .lunara-dashboard-section {
      padding: 22px 15px !important;
      margin: 25px auto !important;
    }

    .lunara-role-header {
      flex-direction: column !important;
    }

    .lunara-role-title {
      font-size: 1.55rem !important;
    }

    .lunara-review-workspace {
      flex-direction: column !important;
    }
  }

  @media (max-width: 480px) {
    .lunara-dashboard-section {
      padding: 18px 11px !important;
    }

    .lunara-role-title {
      font-size: 1.25rem !important;
      letter-spacing: 1.5px !important;
    }

    .lunara-history-header {
      flex-direction: column !important;
      align-items: flex-start !important;
    }

    .lunara-recommendation {
      flex-direction: column !important;
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
`;

/* =========================================================
   GLOBAL STYLE INJECTION
   ========================================================= */

if (
  typeof document !== 'undefined' &&
  !document.getElementById('lunara-dashboard-responsive')
) {
  const styleElement = document.createElement('style');

  styleElement.id =
    'lunara-dashboard-responsive';

  styleElement.innerHTML = responsiveStyles;

  document.head.appendChild(styleElement);
}

/* =========================================================
   MAINTENANCE NOTES
   Shared styles above intentionally feed the role portal
   presentation so the archive visual language stays unified.
   Keeping these styles centralized also prevents the lint
   rule from carrying dead declarations through future edits.
   The visual direction remains parchment, antique gold and
   burnt brown; motion is used only as an interaction layer.
   ========================================================= */


/*
 * ======================================================================
 * TAROT DECK ENTRY CONTRACT
 * ======================================================================
 *
 * The Tarot Reader dashboard remains a dashboard. Its analytics, overview
 * cards, role information and existing professional review workspace stay
 * in their existing locations. The Arcana Control Chamber entry button is
 * the only dashboard destination changed by this deck feature.
 *
 * The button now opens /tarot-deck. That route is owned by the dedicated
 * TarotDeckWorkspace component and is protected by App.jsx for Tarot Reader
 * users. The deck route is deliberately separate from /tarot-reader, which
 * remains the seeker-facing tarot experience.
 *
 * USER DASHBOARD ISOLATION
 * ------------------------------------------------------------
 * UserDashboard is intentionally untouched by this change. No seeker
 * dashboard JSX, state, API request, history rendering, feature cards or
 * navigation behaviour is changed as part of the professional deck entry.
 *
 * ROLE BOUNDARY
 * ------------------------------------------------------------
 * Tarot Reader -> Tarot Reader Dashboard -> /tarot-deck
 * Seeker       -> existing UserDashboard -> /tarot-reader
 *
 * The visual language remains the Lunara parchment manuscript with antique
 * gold and dark-brown ink. The new deck page supplies the futuristic feel
 * through interaction and motion rather than changing the application theme.
 *
 * ======================================================================
 */

/* =========================================================
   SEEKER GUIDANCE PAGE
   =========================================================

   Spiritual Guidance is intentionally kept outside the main seeker
   dashboard. The Dashboard remains focused on Tarot, Palmistry,
   reading history and longitudinal insights. The dedicated Guidance
   route renders the complete consultation directory, booking flow,
   upcoming sessions, completed sessions and consultation chat.
   ========================================================= */

/* =========================================================
   GUIDANCE DISCOVERY PREFERENCES
   All new seeker-facing discovery controls live exclusively on
   the dedicated Guide My Journey / Guidance route.
   ========================================================= */

const guidancePreferenceStorageKey = 'lunara_guidance_preferences';
const guidanceFavouriteStorageKey = 'lunara_guidance_favourites';

const loadGuidancePreferences = () => {
  try {
    const saved = window.localStorage.getItem(guidancePreferenceStorageKey);
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      topic: typeof parsed.topic === 'string' ? parsed.topic : 'Life Direction',
      style: typeof parsed.style === 'string' ? parsed.style : 'One-to-one online session',
      budget: typeof parsed.budget === 'string' ? parsed.budget : 'Any budget',
      availability: typeof parsed.availability === 'string' ? parsed.availability : 'Any time',
      notes: typeof parsed.notes === 'string' ? parsed.notes : ''
    };
  } catch (error) {
    console.error('Could not load Guidance preferences:', error);
    return {
      topic: 'Life Direction',
      style: 'One-to-one online session',
      budget: 'Any budget',
      availability: 'Any time',
      notes: ''
    };
  }
};

const loadGuidanceFavourites = () => {
  try {
    const saved = JSON.parse(
      window.localStorage.getItem(guidanceFavouriteStorageKey) || '[]'
    );
    return Array.isArray(saved) ? saved.filter((id) => typeof id === 'string') : [];
  } catch (error) {
    console.error('Could not load Guidance favourites:', error);
    return [];
  }
};

const GuidanceDiscoveryTools = () => {
  const [preferences, setPreferences] = useState(loadGuidancePreferences);
  const [favourites, setFavourites] = useState(loadGuidanceFavourites);
  const [preferenceNotice, setPreferenceNotice] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        guidanceFavouriteStorageKey,
        JSON.stringify(favourites)
      );
    } catch (error) {
      console.error('Could not save Guidance favourites:', error);
    }
  }, [favourites]);

  const updatePreference = (field, value) => {
    setPreferences((current) => ({ ...current, [field]: value }));
    setPreferenceNotice('');
  };

  const savePreferences = (event) => {
    event.preventDefault();
    try {
      window.localStorage.setItem(
        guidancePreferenceStorageKey,
        JSON.stringify(preferences)
      );
      setPreferenceNotice(
        'Your guidance preferences have been saved on this device.'
      );
      setShowPreferences(false);
    } catch (error) {
      console.error('Could not save Guidance preferences:', error);
      setPreferenceNotice(
        'Preferences could not be saved in this browser. Please try again.'
      );
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      style={{
        ...sectionStyle,
        maxWidth: '1180px',
        marginTop: '24px',
        marginBottom: '24px'
      }}
      aria-labelledby="guidance-discovery-heading"
    >
      <CornerDecoration position={{ top: '14px', left: '14px' }} />
      <CornerDecoration
        position={{ top: '14px', right: '14px', transform: 'rotate(90deg)' }}
      />
      <ArchiveHeading
        eyebrow="LUNARA • GUIDE MY JOURNEY"
        title="Find Your Guidance Path"
        description="Set your preferences to help narrow your search for a suitable spiritual consultant. Tarot services remain in their separate workspace."
        center
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          marginTop: '22px'
        }}
      >
        <div style={historyCardStyle}>
          <div style={panelEyebrowStyle}>01 • PERSONAL MATCH</div>
          <h3 id="guidance-discovery-heading" style={{ margin: '8px 0', color: '#3e2723' }}>
            Best-match preferences
          </h3>
          <p style={{ ...textStyle, fontSize: '0.88rem' }}>
            Choose the guidance topic, session style, budget, and availability that fit you.
          </p>
          <AnimatedButton
            onClick={() => setShowPreferences((current) => !current)}
            style={{ width: '100%' }}
          >
            {showPreferences ? 'CLOSE PREFERENCES' : 'SET MY PREFERENCES'}
          </AnimatedButton>
          <div style={{ marginTop: '12px', color: '#705038', fontSize: '0.78rem', lineHeight: 1.6 }}>
            <strong>Current focus:</strong> {preferences.topic}<br />
            <strong>Session:</strong> {preferences.style}<br />
            <strong>Budget:</strong> {preferences.budget}<br />
            <strong>Availability:</strong> {preferences.availability}
          </div>
        </div>

        <div style={historyCardStyle}>
          <div style={panelEyebrowStyle}>02 • SAVED CONSULTANTS</div>
          <h3 style={{ margin: '8px 0', color: '#3e2723' }}>Your favourites</h3>
          <p style={{ ...textStyle, fontSize: '0.88rem' }}>
            Keep preferred consultant profiles together for quick access when verified profiles are available.
          </p>
          <div style={{ fontSize: '1.8rem', color: '#8b0000', margin: '12px 0' }}>
            {favourites.length}
          </div>
          <div style={{ color: '#705038', fontSize: '0.76rem', lineHeight: 1.6 }}>
            Saved profile IDs on this device. Favourites will be selectable from verified consultant cards when the directory is connected.
          </div>
          {favourites.length > 0 && (
            <AnimatedButton
              onClick={() => {
                setFavourites([]);
                setPreferenceNotice('Saved favourites were cleared from this device.');
              }}
              style={{ width: '100%', background: 'transparent', color: '#5c3a21', boxShadow: 'none' }}
            >
              CLEAR FAVOURITES
            </AnimatedButton>
          )}
        </div>

        <div style={historyCardStyle}>
          <div style={panelEyebrowStyle}>03 • TRUST & TRANSPARENCY</div>
          <h3 style={{ margin: '8px 0', color: '#3e2723' }}>Reviews & rewards</h3>
          <p style={{ ...textStyle, fontSize: '0.88rem' }}>
            Reviews should be submitted only after a completed consultation. Rewards will be calculated from confirmed sessions, not sample data.
          </p>
          <div style={{ borderTop: '1px dashed #9c6c44', marginTop: '12px', paddingTop: '12px', color: '#705038', fontSize: '0.78rem', lineHeight: 1.6 }}>
            <strong>Review status:</strong> Available after a verified completed session.<br />
            <strong>Rewards:</strong> Not yet activated; requires confirmed session records and reward rules.
          </div>
        </div>
      </div>

      {showPreferences && (
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={savePreferences}
          style={{
            marginTop: '18px',
            padding: '22px',
            border: '1px solid #9c6c44',
            borderRadius: '5px',
            background: 'rgba(255,255,255,0.34)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '15px',
            textAlign: 'left'
          }}
        >
          <div>
            <label htmlFor="guidance-topic" style={labelStyle}>Guidance topic</label>
            <select id="guidance-topic" value={preferences.topic} onChange={(event) => updatePreference('topic', event.target.value)} style={inputStyle}>
              <option>Life Direction</option>
              <option>Relationship Guidance</option>
              <option>Personal Growth</option>
              <option>Meditation Guidance</option>
              <option>Emotional Wellbeing</option>
              <option>Spiritual Practice</option>
            </select>
          </div>
          <div>
            <label htmlFor="guidance-style" style={labelStyle}>Preferred session</label>
            <select id="guidance-style" value={preferences.style} onChange={(event) => updatePreference('style', event.target.value)} style={inputStyle}>
              <option>One-to-one online session</option>
              <option>Chat-based consultation</option>
              <option>Scheduled follow-up</option>
            </select>
          </div>
          <div>
            <label htmlFor="guidance-budget" style={labelStyle}>Budget</label>
            <select id="guidance-budget" value={preferences.budget} onChange={(event) => updatePreference('budget', event.target.value)} style={inputStyle}>
              <option>Any budget</option>
              <option>Free introductory session</option>
              <option>Under ₹500</option>
              <option>₹500–₹1,000</option>
              <option>₹1,000+</option>
            </select>
          </div>
          <div>
            <label htmlFor="guidance-availability" style={labelStyle}>Preferred availability</label>
            <select id="guidance-availability" value={preferences.availability} onChange={(event) => updatePreference('availability', event.target.value)} style={inputStyle}>
              <option>Any time</option>
              <option>Morning</option>
              <option>Afternoon</option>
              <option>Evening</option>
              <option>Weekend</option>
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="guidance-notes" style={labelStyle}>Optional context</label>
            <textarea id="guidance-notes" rows="3" value={preferences.notes} onChange={(event) => updatePreference('notes', event.target.value)} placeholder="Share what matters to you when choosing a consultant (optional)." style={inputStyle} />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <AnimatedButton type="submit" style={{ marginTop: 0 }}>SAVE PREFERENCES</AnimatedButton>
            <AnimatedButton type="button" onClick={() => setShowPreferences(false)} style={{ marginTop: 0, background: 'transparent', color: '#5c3a21', boxShadow: 'none' }}>CANCEL</AnimatedButton>
          </div>
        </motion.form>
      )}

      {preferenceNotice && (
        <div role="status" aria-live="polite" style={{ marginTop: '14px', padding: '12px', border: '1px solid #9c6c44', color: '#5c3a21', background: 'rgba(232,213,181,0.4)', fontSize: '0.82rem' }}>
          {preferenceNotice}
        </div>
      )}
      <div style={{ marginTop: '16px', textAlign: 'center', color: '#705038', fontSize: '0.75rem', fontStyle: 'italic', lineHeight: 1.6 }}>
        Consultant recommendations, verified reviews, live availability, cross-account messaging, and reward redemption require the approved consultant directory and consultation backend. Lunara will not show fabricated profiles or sample reviews.
      </div>
    </motion.section>
  );
};

export const GuidanceDashboard = () => {
  const guidanceRouteLabel = 'Spiritual Guidance';
  const guidanceRoutePurpose =
    'Book and manage private online guidance consultations.';

  return (
    <div
      style={{
        ...dashboardStyle,
        minHeight: '100vh',
        paddingTop: '28px'
      }}
      data-guidance-route={guidanceRouteLabel}
      data-guidance-purpose={guidanceRoutePurpose}
    >
      <DashboardParticles />

      <Navbar />

      <GuidanceDiscoveryTools />

      <SeekerConsultationPanel />
    </div>
  );
};

/*
 * ================================================================
 * SPIRITUAL CONSULTANT VIEW CONTRACT
 * ================================================================
 *
 * SpiritualConsultantDashboard accepts a view prop:
 *   view="dashboard"      -> overview and practice metrics
 *   view="consultations"  -> session desk and consultation workflows
 *
 * Both views intentionally share the same session state, local archive,
 * status updates, professional notes, and existing backend-sync handler.
 * This avoids duplicate consultation records while keeping the two
 * navigation destinations visually and functionally distinct.
 * ================================================================
 */
