import axios from 'axios';
import html2canvas from 'html2canvas';
import {
  AlertCircle,
  Bell,
  Camera,
  CameraOff,
  CheckCircle2,
  Compass,
  Download,
  FileText,
  Hand,
  History,
  Layers,
  Loader2,
  LogOut,
  Mic,
  Moon,
  MapPin,
  RefreshCw,
  Save,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Table,
  TrendingUp,
  Upload,
  UserCheck,
  Users,
  Video,
  Volume2,
  VolumeX,
  Wifi,
  Mail,
  MessageSquare,
  X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { spawnSparkleBurst, triggerTabFlash } from './sparkleEffects';
import LogoModal from './LogoModal';
import RoleSelectionModal from './RoleSelectionModal';
import TarotReaderDashboard from './TarotReaderDashboard';
import SpiritualConsultantDashboard from './SpiritualConsultantDashboard';
import VedicLocationSelector from './VedicLocationSelector';
import RescheduleChatModal from './RescheduleChatModal';
import appLogo from '../assets/app-logo.png';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : window.location.origin
);
const WS_BASE = API_BASE.replace(/^http/, 'ws');

// --- Pre-configured Vedic Astrology Locations ---
const VEDIC_LOCATIONS = [
  { name: 'Hyderabad, Telangana', lat: 17.3850, lon: 78.4867, region: 'India' },
  { name: 'Vijayawada, Andhra Pradesh', lat: 16.5062, lon: 80.6480, region: 'India' },
  { name: 'Visakhapatnam (Vizag), Andhra Pradesh', lat: 17.6868, lon: 83.2185, region: 'India' },
  { name: 'Guntur, Andhra Pradesh', lat: 16.3067, lon: 80.4365, region: 'India' },
  { name: 'Tirupati, Andhra Pradesh', lat: 13.6288, lon: 79.4192, region: 'India' },
  { name: 'Bengaluru (Bangalore), Karnataka', lat: 12.9716, lon: 77.5946, region: 'India' },
  { name: 'Chennai, Tamil Nadu', lat: 13.0827, lon: 80.2707, region: 'India' },
  { name: 'Mumbai, Maharashtra', lat: 19.0760, lon: 72.8777, region: 'India' },
  { name: 'Pune, Maharashtra', lat: 18.5204, lon: 73.8567, region: 'India' },
  { name: 'New Delhi, Delhi NCR', lat: 28.6139, lon: 77.2090, region: 'India' },
  { name: 'Kolkata, West Bengal', lat: 22.5726, lon: 88.3639, region: 'India' },
  { name: 'Ahmedabad, Gujarat', lat: 23.0225, lon: 72.5714, region: 'India' },
  { name: 'Jaipur, Rajasthan', lat: 26.9124, lon: 75.7873, region: 'India' },
  { name: 'Varanasi (Kashi), Uttar Pradesh', lat: 25.3176, lon: 82.9739, region: 'India' },
  { name: 'Ujjain (Mahakaal), Madhya Pradesh', lat: 23.1765, lon: 75.7885, region: 'India' },
  { name: 'Lucknow, Uttar Pradesh', lat: 26.8467, lon: 80.9462, region: 'India' },
  { name: 'Haridwar / Rishikesh, Uttarakhand', lat: 29.9457, lon: 78.1642, region: 'India' },
  { name: 'Chandigarh, Punjab/Haryana', lat: 30.7333, lon: 76.7794, region: 'India' },
  { name: 'Kochi (Cochin), Kerala', lat: 9.9312, lon: 76.2673, region: 'India' },
  { name: 'Thiruvananthapuram, Kerala', lat: 8.5241, lon: 76.9366, region: 'India' },
  { name: 'Bhubaneswar, Odisha', lat: 20.2961, lon: 85.8245, region: 'India' },
  { name: 'Patna, Bihar', lat: 25.5941, lon: 85.1376, region: 'India' },
  { name: 'Bhopal / Indore, Madhya Pradesh', lat: 22.7196, lon: 75.8577, region: 'India' },
  { name: 'Nagpur, Maharashtra', lat: 21.1458, lon: 79.0882, region: 'India' },
  { name: 'Coimbatore, Tamil Nadu', lat: 11.0168, lon: 76.9558, region: 'India' },
  { name: 'London, United Kingdom', lat: 51.5074, lon: -0.1278, region: 'International' },
  { name: 'New York City, USA', lat: 40.7128, lon: -74.0060, region: 'International' },
  { name: 'San Francisco / Bay Area, USA', lat: 37.7749, lon: -122.4194, region: 'International' },
  { name: 'Dallas / Texas, USA', lat: 32.7767, lon: -96.7970, region: 'International' },
  { name: 'Toronto, Canada', lat: 43.6532, lon: -79.3832, region: 'International' },
  { name: 'Dubai, UAE', lat: 25.2048, lon: 55.2708, region: 'International' },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198, region: 'International' },
  { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093, region: 'International' },
  { name: 'Kathmandu, Nepal', lat: 27.7172, lon: 85.3240, region: 'International' }
];

// --- Typewriter Effect Component ---
const TypewriterText = ({ text, speed = 25 }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    
    return () => clearInterval(timer);
  }, [text, speed]);

  return <span>{displayedText}</span>;
};

// --- Embedded Interactive Starmap Canvas ---
const InteractiveStarCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const numStars = 70;
    const stars = Array.from({ length: numStars }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.6 + 0.6,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      color: Math.random() > 0.6 ? '#fbbf24' : Math.random() > 0.3 ? '#c084fc' : '#38bdf8'
    }));

    let mouse = { x: null, y: null, radius: 130 };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      stars.forEach((star, i) => {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0 || star.x > width) star.vx *= -1;
        if (star.y < 0 || star.y > height) star.vy *= -1;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = star.color;
        ctx.fill();

        for (let j = i + 1; j < stars.length; j++) {
          const dx = star.x - stars[j].x;
          const dy = star.y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = `rgba(251, 191, 36, ${1 - (dist / 100) * 0.8})`;
            ctx.lineWidth = 0.45;
            ctx.stroke();
          }
        }

        if (mouse.x !== null) {
          const dx = star.x - mouse.x;
          const dy = star.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(192, 132, 252, ${1 - dist / mouse.radius})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.75
      }}
    />
  );
};

// --- Embedded Resonance Radial Gauge ---
const ResonanceGauge = ({ score = 88.5, tier = 'High Alignment' }) => {
  const radius = 68;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg height="160" width="160" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            stroke="rgba(255, 255, 255, 0.08)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx="80"
            cy="80"
          />
          <circle
            stroke="url(#resonanceGradient)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx="80"
            cy="80"
          />
          <defs>
            <linearGradient id="resonanceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>

        <div style={{ position: 'absolute', textAlign: 'center' }}>
          <div style={{ fontSize: '1.9rem', fontWeight: '900', color: '#fbbf24', letterSpacing: '-0.5px' }}>
            {score}%
          </div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Resonance
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: '240px' }}>
        <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: 'rgba(251, 191, 36, 0.15)', border: '1px solid rgba(251, 191, 36, 0.4)', color: '#fbbf24', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
          {tier}
        </div>
        <h3 style={{ fontSize: '1.45rem', fontWeight: '800', margin: '0 0 6px 0', color: '#ffffff' }}>
          Celestial Harmonic Frequency
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem', maxWidth: '520px', lineHeight: '1.55', margin: 0 }}>
          Real-time multi-factor matrix calculating biometrics from MediaPipe hand landmarks, archetypal resonance, and tarot timeline alignments.
        </p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'Daily Guidance Notification',
      title: 'Cosmic Transit Active',
      message: 'Moon transit into Taurus promotes grounding, clarity, and centered reflection.',
      time: '10 mins ago',
      color: '#fbbf24',
      unread: true
    },
    {
      id: 2,
      type: 'Reading Reminder',
      title: 'Consultation Ready',
      message: 'Your Celtic Cross arcana consultation with the Senior Cartomancer is set for Today, 2:30 PM.',
      time: '45 mins ago',
      color: '#ea580c',
      unread: true
    },
    {
      id: 3,
      type: 'Insight Update',
      title: 'Palm Biometrics Updated',
      message: '7 critical palm lines detected via MediaPipe with 94.8% biometric confidence.',
      time: '2 hours ago',
      color: '#34d399',
      unread: true
    },
    {
      id: 4,
      type: 'Spiritual Growth Alert',
      title: 'Resonance Milestone',
      message: 'Your Celestial Harmonic score is at 88.5% (High Alignment tier reached).',
      time: 'Yesterday',
      color: '#a855f7',
      unread: false
    },
    {
      id: 5,
      type: 'Platform Announcement',
      title: 'Swiss Ephemeris & Live Rooms',
      message: 'Swiss Ephemeris Lahiri calculations and live consultation rooms are online.',
      time: '2 days ago',
      color: '#38bdf8',
      unread: false
    }
  ]);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [emailNotificationSentId, setEmailNotificationSentId] = useState(null);

  const handleSendNotificationToEmail = async (notification) => {
    try {
      await axios.post(
        `${API_BASE}/notifications/send-email`,
        {
          title: notification.title,
          message: notification.message,
          meta: `Alert Type: ${notification.type} | Time: ${notification.time}`
        },
        getAuthHeaders()
      );
      setEmailNotificationSentId(notification.id);
      setTimeout(() => setEmailNotificationSentId(null), 3500);
    } catch (err) {
      alert("Email notice: " + (err.response?.data?.detail || err.message));
    }
  };

  const [user, setUser] = useState({ name: 'Seeker', email: '', role: 'User', profile: {} });
  const [scoreData, setScoreData] = useState(null);

  const [profileForm, setProfileForm] = useState({
    name: '',
    age_group: '21-30',
    interests: '',
    spiritual_goals: '',
    reading_preferences: 'Both',
    role: 'User'
  });
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Palmistry State (Upload + Live Scanner Mode)
  const [palmMode, setPalmMode] = useState('upload');
  const [palmFile, setPalmFile] = useState(null);
  const [palmPreview, setPalmPreview] = useState(null);
  const [palmAnalysis, setPalmAnalysis] = useState(null);
  const [isAnalyzingPalm, setIsAnalyzingPalm] = useState(false);
  const [palmError, setPalmError] = useState('');

  // Live Camera Video & Stream Refs
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Tarot State & Spread Configuration
  const [selectedSpread, setSelectedSpread] = useState('three_card');
  const [tarotCards, setTarotCards] = useState([]);
  const [isDrawingTarot, setIsDrawingTarot] = useState(false);
  const [revealedCards, setRevealedCards] = useState({});
  const [selectedArcIndices, setSelectedArcIndices] = useState([]);

  // --- WEBSOCKET MULTIPLAYER STATE (TAROT & PALMISTRY) ---
  const [roomCode, setRoomCode] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const wsRef = useRef(null);
  const [palmRoomCode, setPalmRoomCode] = useState('');
  const [isPalmInRoom, setIsPalmInRoom] = useState(false);
  const palmWsRef = useRef(null);

  // Reading History & Journal State
  const [readingHistory, setReadingHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState('');

  // Vedic Astrology State
  const [astroForm, setAstroForm] = useState({
    birth_date: '1995-06-15',
    birth_time: '14:30',
    latitude: 16.5062,
    longitude: 80.6480,
    timezone_offset: 5.5,
    location_name: 'Vijayawada, Krishna, Andhra Pradesh, India',
    location_hierarchy: {
      country: 'India',
      state: 'Andhra Pradesh',
      district: 'Krishna',
      mandal: 'Vijayawada Urban',
      city: 'Vijayawada'
    },
    ayanamsa: 'Lahiri'
  });
  const [kundaliResult, setKundaliResult] = useState(null);
  const [isCalculatingAstro, setIsCalculatingAstro] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Vijayawada, Andhra Pradesh');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationNotice, setLocationNotice] = useState('');

  // Soul Connection Matrix State
  const [compForm, setCompForm] = useState({
    user_date: '1995-06-15',
    partner_name: '',
    partner_date: '1996-08-22'
  });
  const [compResult, setCompResult] = useState(null);
  const [isCalculatingComp, setIsCalculatingComp] = useState(false);

  // LLM Synthesis State
  const [synthesis, setSynthesis] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Recommendations State (Milestone 3: Recommendation Engine)
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  // Oracle AI Synthesis Chat State
  const [isOracleOpen, setIsOracleOpen] = useState(false);
  const [oracleQuery, setOracleQuery] = useState('');
  const [oracleMessages, setOracleMessages] = useState([
    { sender: 'oracle', text: 'Seeker, what spiritual guidance or clarity do you seek from your palm and card alignments today?' }
  ]);
  const [isOracleThinking, setIsOracleThinking] = useState(false);

  // --- AURA SCANNER STATE ---
  const [auraData, setAuraData] = useState(null); 
  const [isAuraCameraOpen, setIsAuraCameraOpen] = useState(false);
  const [isScanningAura, setIsScanningAura] = useState(false);
  const [auraScanError, setAuraScanError] = useState('');
  const auraVideoRef = useRef(null);
  const auraStreamRef = useRef(null);

  // Web Audio API 432 Hz Ambient Synthesizer
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioCtxRef = useRef(null);
  const oscillatorsRef = useRef([]);

  // Snapshot Ref for Shareable Card
  const cardShareRef = useRef(null);

  const targetCount = selectedSpread === 'single' ? 1 : (selectedSpread === 'three_card' || selectedSpread === 'relationship') ? 3 : selectedSpread === 'celtic_cross' ? 10 : 5;

  const [practitionerData, setPractitionerData] = useState(null);
  const [isLoadingPractitioner, setIsLoadingPractitioner] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchPractitionerStats = async (roleOverride) => {
    const checkRole = roleOverride || user.role;
    setIsLoadingPractitioner(true);
    try {
      if (checkRole === 'Admin') {
        const res = await axios.get(`${API_BASE}/admin/platform-stats`, getAuthHeaders());
        setPractitionerData(res.data);
      } else if (checkRole === 'Tarot Reader') {
        const res = await axios.get(`${API_BASE}/reader/analytics`, getAuthHeaders());
        setPractitionerData(res.data);
      } else if (checkRole === 'Spiritual Consultant') {
        const res = await axios.get(`${API_BASE}/consultant/trends`, getAuthHeaders());
        setPractitionerData(res.data);
      }
    } catch (err) {
      console.warn("Practitioner analytics query:", err?.response?.data?.detail || err.message);
    } finally {
      setIsLoadingPractitioner(false);
    }
  };

  const handleQuickRoleSwitch = async (newRole) => {
    try {
      if (newRole !== 'Admin' || user.role === 'Admin') {
        await axios.post(`${API_BASE}/profile`, { ...profileForm, role: newRole }, getAuthHeaders());
      }
      setUser(prev => ({ ...prev, role: newRole }));
      setProfileForm(prev => ({ ...prev, role: newRole }));
      fetchPractitionerStats(newRole);
    } catch (err) {
      alert("Role update notice: " + (err.response?.data?.detail || err.message));
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchScore();
    fetchRecommendations();
    return () => {
      oscillatorsRef.current.forEach(osc => {
        try { osc.stop(); } catch (e) {}
      });
      stopCameraStream();
      stopAuraCamera();
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchReadingHistory();
    }
    if (activeTab !== 'palmistry') {
      stopCameraStream();
    }
  }, [activeTab]);

  useEffect(() => {
    if (palmMode !== 'camera') {
      stopCameraStream();
    }
  }, [palmMode]);

  const fetchUserData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users/me`, getAuthHeaders());
      const profile = res.data?.profile || {};
      const safeName = (profile.name && profile.name.trim() !== '') ? profile.name : (res.data?.email?.split('@')[0] || 'Seeker');

      const userRole = res.data?.role || 'User';
      setUser({
        name: safeName,
        email: res.data?.email || '',
        role: userRole,
        profile: profile
      });

      setProfileForm({
        name: profile.name || '',
        age_group: profile.age_group || '21-30',
        interests: profile.interests || '',
        spiritual_goals: profile.spiritual_goals || '',
        reading_preferences: profile.reading_preferences || 'Both',
        role: userRole
      });
      if (userRole !== 'User') {
        fetchPractitionerStats(userRole);
      }
    } catch (err) {
      console.error("Session verification failed:", err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const fetchScore = async () => {
    try {
      const res = await axios.get(`${API_BASE}/guidance/score`, getAuthHeaders());
      setScoreData(res.data);
    } catch (err) {
      console.error("Score fetch failed:", err);
    }
  };

  const fetchRecommendations = async () => {
    setIsLoadingRecommendations(true);
    try {
      const res = await axios.get(`${API_BASE}/guidance/recommendations`, getAuthHeaders());
      setRecommendations(res.data?.recommendations || []);
    } catch (err) {
      console.error("Recommendations fetch failed:", err);
      setRecommendations([]);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const fetchReadingHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await axios.get(`${API_BASE}/readings/history?limit=20`, getAuthHeaders());
      setReadingHistory(res.data?.readings || []);
    } catch (err) {
      console.error("History fetch failed:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleLogout = () => {
    stopCameraStream();
    stopAuraCamera();
    if (wsRef.current) wsRef.current.close();
    localStorage.removeItem('token');
    navigate('/');
  };

  // --- AUDIO SYNTHESIZER ---
  const toggleAmbientSound = () => {
    if (isPlayingAudio) {
      oscillatorsRef.current.forEach(osc => {
        try { osc.stop(); } catch (e) {}
      });
      oscillatorsRef.current = [];
      setIsPlayingAudio(false);
    } else {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const freqs = [108, 216, 432, 648];
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.035, ctx.currentTime);
      gainNode.connect(ctx.destination);

      const oscs = freqs.map(f => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        osc.connect(gainNode);
        osc.start();
        return osc;
      });

      oscillatorsRef.current = oscs;
      setIsPlayingAudio(true);
    }
  };

  const speakReading = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const handleExportShareImage = async (e) => {
    spawnSparkleBurst(e);
    if (!cardShareRef.current) return;
    try {
      const canvas = await html2canvas(cardShareRef.current, {
        backgroundColor: '#030712',
        scale: 2
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Mystic_Oracle_Spread_${Date.now()}.png`;
      link.click();
    } catch (err) {
      console.error('Snapshot failed:', err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    spawnSparkleBurst(e);
    setIsSavingProfile(true);
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    try {
      const res = await axios.post(`${API_BASE}/profile`, profileForm, getAuthHeaders());
      setProfileSuccessMsg(res.data?.message || 'Profile updated successfully!');
      const updatedRole = res.data?.role || profileForm.role || user.role;
      setUser(prev => ({
        ...prev,
        name: profileForm.name || prev.name,
        role: updatedRole,
        profile: profileForm
      }));
      fetchScore();
      if (updatedRole !== 'User') {
        fetchPractitionerStats(updatedRole);
      }
    } catch (err) {
      setProfileErrorMsg(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- LIVE WEBCAM SCANNER METHODS ---
  const startCameraStream = async () => {
    setPalmError('');
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 }, 
          facingMode: 'user' 
        },
        audio: false
      });
      
      streamRef.current = stream;
      setIsCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(err => {
              console.warn("Autoplay notice:", err);
            });
          };
        }
      }, 120);

    } catch (err) {
      console.error("Camera access error:", err);
      setIsCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPalmError("Camera permission denied. Click the lock icon in your browser address bar to allow webcam access.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPalmError("No webcam found on this device.");
      } else {
        setPalmError(`Camera error: ${err.message || 'Unable to open video stream'}`);
      }
    }
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraFrame = async (e) => {
    spawnSparkleBurst(e);
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'webcam_palm_scan.jpg', { type: 'image/jpeg' });
      setPalmFile(file);
      setPalmPreview(URL.createObjectURL(blob));
      stopCameraStream();

      await processPalmBlob(file);
    }, 'image/jpeg', 0.95);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPalmFile(file);
      setPalmPreview(URL.createObjectURL(file));
      setPalmAnalysis(null);
      setPalmError('');
    }
  };

  const processPalmBlob = async (fileObj) => {
    setIsAnalyzingPalm(true);
    setPalmError('');
    const formData = new FormData();
    formData.append('file', fileObj);

    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (!token) {
      setPalmError('No active session found. Please log in.');
      setIsAnalyzingPalm(false);
      handleLogout();
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/palmistry/upload`, formData, getAuthHeaders());
      const analysisResult = res.data.results || res.data;

      if (analysisResult.detected === false) {
        setPalmError(analysisResult.analysis || 'No palm landmarks detected. Please align your open palm clearly inside the reticle.');
        setPalmAnalysis(analysisResult);
      } else {
        setPalmAnalysis(analysisResult);
        setPalmError('');
      }

      if (palmWsRef.current && palmWsRef.current.readyState === WebSocket.OPEN) {
        palmWsRef.current.send(JSON.stringify({
          type: 'sync_palm',
          analysis: analysisResult,
          preview: palmPreview
        }));
      }
      fetchScore();
    } catch (err) {
      console.error("Palm analysis request failed:", err);
      if (err.response?.status === 401) {
        setPalmError('Session expired. Please sign out and log in again.');
      } else {
        setPalmError(err.response?.data?.detail || err.message || 'Failed to analyze palm.');
      }
    } finally {
      setIsAnalyzingPalm(false);
    }
  };

  const handlePalmUpload = async (e) => {
    spawnSparkleBurst(e);
    if (!palmFile) return;
    await processPalmBlob(palmFile);
  };

  // --- WEBSOCKET ROOM HANDLERS ---
  const generateRoomCode = (e) => {
    if(e) spawnSparkleBurst(e);
    setRoomCode(Math.random().toString(36).substring(2, 8).toUpperCase());
  };

  const handleJoinRoom = (e) => {
    if(e) spawnSparkleBurst(e);
    if (!roomCode.trim()) return;

    if (wsRef.current) wsRef.current.close();

    const ws = new WebSocket(`${WS_BASE}/ws/tarot/${roomCode}`);
    
    ws.onopen = () => {
      setIsInRoom(true);
      ws.send(JSON.stringify({ type: 'system', message: `${user.name} joined the circle.` }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'sync_cards') {
        setSelectedSpread(data.spread);
        setTarotCards(data.cards);
        setRevealedCards(data.revealed || {});
      } else if (data.type === 'sync_reveal') {
        setRevealedCards(data.revealed);
      }
    };

    ws.onclose = () => {
      setIsInRoom(false);
    };

    wsRef.current = ws;
  };

  const handleLeaveRoom = (e) => {
    if(e) spawnSparkleBurst(e);
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsInRoom(false);
    setRoomCode('');
  };

  // --- WEBSOCKET PALMISTRY CONSULTATION ROOM HANDLERS ---
  const generatePalmRoomCode = (e) => {
    if(e) spawnSparkleBurst(e);
    setPalmRoomCode(Math.random().toString(36).substring(2, 8).toUpperCase());
  };

  const handleJoinPalmRoom = (e) => {
    if(e) spawnSparkleBurst(e);
    if (!palmRoomCode.trim()) return;

    if (palmWsRef.current) palmWsRef.current.close();

    const ws = new WebSocket(`${WS_BASE}/ws/palmistry/${palmRoomCode}`);

    ws.onopen = () => {
      setIsPalmInRoom(true);
      ws.send(JSON.stringify({ type: 'system', message: `${user.name} joined the palmistry consultation room.` }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'sync_palm') {
          if (data.analysis) setPalmAnalysis(data.analysis);
          if (data.preview) setPalmPreview(data.preview);
        }
      } catch (err) {
        console.error("Palm WS error:", err);
      }
    };

    ws.onclose = () => {
      setIsPalmInRoom(false);
    };

    palmWsRef.current = ws;
  };

  const handleLeavePalmRoom = (e) => {
    if(e) spawnSparkleBurst(e);
    if (palmWsRef.current) {
      palmWsRef.current.close();
    }
    setIsPalmInRoom(false);
    setPalmRoomCode('');
  };

  // --- TAROT HANDLERS ---
  const handleDrawTarot = async (e, spreadType = selectedSpread) => {
    spawnSparkleBurst(e);
    setIsDrawingTarot(true);
    setRevealedCards({});
    setSelectedArcIndices([]);
    try {
      const res = await axios.post(`${API_BASE}/tarot/draw`, {
        spread: spreadType,
        picked_indices: []
      }, getAuthHeaders());
      
      setTimeout(() => {
        const newCards = res.data.cards || [];
        setTarotCards(newCards);
        setIsDrawingTarot(false);
        fetchScore();

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'sync_cards',
            spread: spreadType,
            cards: newCards,
            revealed: {}
          }));
        }
      }, 850);
    } catch (err) {
      console.error("Tarot draw failed:", err);
      setIsDrawingTarot(false);
    }
  };

  const handleArcCardClick = async (e, cardIndex) => {
    spawnSparkleBurst(e);
    if (selectedArcIndices.includes(cardIndex)) return;
    const newIndices = [...selectedArcIndices, cardIndex];
    setSelectedArcIndices(newIndices);

    if (newIndices.length === targetCount) {
      setIsDrawingTarot(true);
      try {
        const res = await axios.post(`${API_BASE}/tarot/draw`, {
          spread: selectedSpread,
          picked_indices: newIndices
        }, getAuthHeaders());

        setTimeout(() => {
          const newCards = res.data.cards || [];
          setTarotCards(newCards);
          setIsDrawingTarot(false);
          fetchScore();

          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'sync_cards',
              spread: selectedSpread,
              cards: newCards,
              revealed: {}
            }));
          }
        }, 700);
      } catch (err) {
        console.error(err);
        setIsDrawingTarot(false);
      }
    }
  };

  const toggleReveal = (e, idx) => {
    spawnSparkleBurst(e);
    const nextRevealed = { ...revealedCards, [idx]: !revealedCards[idx] };
    setRevealedCards(nextRevealed);
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'sync_reveal', revealed: nextRevealed }));
    }
  };

  const handleRevealAll = (e) => {
    spawnSparkleBurst(e);
    const all = {};
    tarotCards.forEach((_, i) => (all[i] = true));
    setRevealedCards(all);
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'sync_reveal', revealed: all }));
    }
  };

  const handleHideAll = (e) => {
    spawnSparkleBurst(e);
    setRevealedCards({});
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'sync_reveal', revealed: {} }));
    }
  };

  const handleDownloadPDF = async (e) => {
    spawnSparkleBurst(e);
    try {
      const res = await axios.get(`${API_BASE}/reports/export/pdf`, {
        ...getAuthHeaders(),
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Mystic_Synthesis_Report_${user.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF Download failed', err);
    }
  };

  const handleDownloadCSV = async (e) => {
    if (e) spawnSparkleBurst(e);
    try {
      const res = await axios.get(`${API_BASE}/reports/export/csv`, {
        ...getAuthHeaders(),
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Mystic_Readings_${user?.name || 'Archive'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV Download failed', err);
      alert('Failed to export reading archive to CSV. Please verify your network.');
    }
  };

  // --- JOURNAL NOTE HANDLER ---
  const handleSaveNote = async (e, readingId) => {
    spawnSparkleBurst(e);
    if (!noteText.trim()) return;
    try {
      await axios.patch(`${API_BASE}/readings/${readingId}/notes`, { notes: noteText }, getAuthHeaders());
      setEditingNoteId(null);
      setNoteText('');
      fetchReadingHistory();
    } catch (err) {
      console.error("Failed to update note:", err);
    }
  };

  const filteredReadings = readingHistory.filter(r => 
    historyFilter === 'all' ? true : r.reading_type === historyFilter
  );

  // --- VEDIC ASTROLOGY HANDLERS ---
  const handleLocationSelect = (e) => {
    const locName = e.target.value;
    setSelectedLocation(locName);
    const found = VEDIC_LOCATIONS.find((l) => l.name === locName);
    if (found) {
      setAstroForm((prev) => ({
        ...prev,
        latitude: found.lat,
        longitude: found.lon
      }));
      setLocationNotice(`Auto-filled: ${found.name} (Lat: ${found.lat}, Lon: ${found.lon})`);
      setTimeout(() => setLocationNotice(''), 4500);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(4));
        const lon = parseFloat(position.coords.longitude.toFixed(4));
        setAstroForm((prev) => ({ ...prev, latitude: lat, longitude: lon }));
        setSelectedLocation('custom');
        setLocationNotice(`GPS Detected: Lat ${lat}, Lon ${lon}`);
        setIsDetectingLocation(false);
        setTimeout(() => setLocationNotice(''), 4500);
      },
      (error) => {
        setIsDetectingLocation(false);
        alert('Could not detect location: ' + error.message);
      },
      { timeout: 10000 }
    );
  };

  const handleCalculateKundali = async (e) => {
    e.preventDefault();
    spawnSparkleBurst(e);
    setIsCalculatingAstro(true);
    try {
      const payload = {
        birth_date: astroForm.birth_date,
        birth_time: astroForm.birth_time,
        latitude: parseFloat(astroForm.latitude) || 0,
        longitude: parseFloat(astroForm.longitude) || 0,
        timezone_offset: parseFloat(astroForm.timezone_offset ?? 5.5),
        location_name: astroForm.location_name || '',
        location_hierarchy: astroForm.location_hierarchy || {},
        ayanamsa: (astroForm.ayanamsa || 'lahiri').toLowerCase()
      };

      const res = await axios.post(`${API_BASE}/astrology/kundali`, payload, getAuthHeaders());
      setKundaliResult(res.data.chart);
      fetchScore();
    } catch (err) {
      console.error("Kundali calculation failed:", err);
      alert("Failed to calculate Kundali: " + (err.response?.data?.detail || "Please verify your input coordinates."));
    } finally {
      setIsCalculatingAstro(false);
    }
  };

  // --- COMPATIBILITY MATRIX HANDLER ---
  const handleCalculateCompatibility = async (e) => {
    e.preventDefault();
    spawnSparkleBurst(e);
    setIsCalculatingComp(true);
    try {
      const res = await axios.post(`${API_BASE}/astrology/compatibility`, compForm, getAuthHeaders());
      setCompResult(res.data);
    } catch (err) {
      console.error("Compatibility calculation failed:", err);
      alert("Failed to calculate Soul Connection Matrix.");
    } finally {
      setIsCalculatingComp(false);
    }
  };

  // --- LLM SYNTHESIS HANDLER ---
  const handleGenerateSynthesis = async (e) => {
    spawnSparkleBurst(e);
    setIsSynthesizing(true);
    setSynthesis(""); 
    
    try {
      const res = await axios.get(`${API_BASE}/guidance/synthesis`, getAuthHeaders());
      if (res.data.status === "success" || res.data.status === "error") {
        setSynthesis(res.data.synthesis);
      }
    } catch (error) {
      console.error("Error generating synthesis:", error);
      setSynthesis("The cosmic connection was interrupted. Please check your connection and try again.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  // --- AURA WEBCAM METHODS ---
  const startAuraCamera = async () => {
    setAuraScanError('');
    setIsAuraCameraOpen(true);
    try {
      if (auraStreamRef.current) {
        auraStreamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
      auraStreamRef.current = stream;

      setTimeout(() => {
        if (auraVideoRef.current) {
          auraVideoRef.current.srcObject = stream;
          auraVideoRef.current.play().catch(e => console.warn("Aura autoplay error:", e));
        }
      }, 100);
    } catch (err) {
      console.error("Aura camera error:", err);
      setAuraScanError("Webcam access denied or unavailable.");
      setIsAuraCameraOpen(false);
    }
  };

  const stopAuraCamera = () => {
    if (auraStreamRef.current) {
      auraStreamRef.current.getTracks().forEach(track => track.stop());
      auraStreamRef.current = null;
    }
    if (auraVideoRef.current) {
      auraVideoRef.current.srcObject = null;
    }
    setIsAuraCameraOpen(false);
  };

  const captureAuraSnapshot = async (e) => {
    spawnSparkleBurst(e);
    if (!auraVideoRef.current) return;
    const video = auraVideoRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'aura_face_scan.jpg', { type: 'image/jpeg' });
      stopAuraCamera();
      setIsScanningAura(true);
      setAuraScanError('');

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await axios.post(`${API_BASE}/vision/aura`, formData, getAuthHeaders());

        if (res.data.status === 'success') {
          setAuraData(res.data);
        } else {
          setAuraScanError('Could not clearly isolate facial vibration. Try again.');
        }
      } catch (err) {
        console.error("Aura analysis failed:", err);
        setAuraScanError(err.response?.data?.detail || "Failed to analyze aura.");
      } finally {
        setIsScanningAura(false);
      }
    }, 'image/jpeg', 0.95);
  };

  // --- ORACLE CHAT HANDLER ---
  const handleAskOracle = async (e) => {
    e.preventDefault();
    spawnSparkleBurst(e);
    if (!oracleQuery.trim() || isOracleThinking) return;

    const userText = oracleQuery;
    setOracleMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setOracleQuery('');
    setIsOracleThinking(true);

    try {
      const res = await axios.post(
        `${API_BASE}/oracle/chat`,
        {
          query: userText,
          archetype: palmAnalysis?.archetype || 'Universal Seeker',
          gesture: palmAnalysis?.gesture || 'Open Palm',
          tarot_cards: tarotCards || [],
          aura_color: auraData?.aura_color || 'Unknown',            
          vibrational_state: auraData?.vibrational_state || 'Unknown' 
        },
        getAuthHeaders()
      );

      setOracleMessages(prev => [...prev, { sender: 'oracle', text: res.data.reply }]);
    } catch (err) {
      setOracleMessages(prev => [...prev, { sender: 'oracle', text: 'The cosmic connection was interrupted. Please ask again.' }]);
    } finally {
      setIsOracleThinking(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', overflow: 'hidden', color: '#f8fafc' }}>
      
      {/* DIRECT EMBEDDED CELESTIAL BACKGROUND SUITE */}
      <div className="nebula-bloom" />
      <div className="starfield-layer" />
      <div className="constellation-overlay" />
      <div className="shooting-star-1" />
      <div className="shooting-star-2" />
      <InteractiveStarCanvas />

      {/* Sidebar Navigation */}
      <aside style={{ width: '280px', padding: '2rem 1.5rem', background: 'rgba(8, 12, 26, 0.85)', borderRight: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2.5rem' }}>
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
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.12)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            title="Tap to enlarge emblem"
          >
            <img
              src={appLogo}
              alt="Mystic Insights"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                objectFit: 'cover',
                boxShadow: '0 0 15px rgba(251, 191, 36, 0.6), 0 0 8px rgba(255, 255, 255, 0.8)',
                border: '2px solid rgba(251, 191, 36, 0.8)'
              }}
            />
          </button>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, letterSpacing: '0.5px' }}>Mystic Insights</h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'tarot', label: 'Tarot Readings', icon: Layers },
            { id: 'palmistry', label: 'Palmistry Vision AI', icon: Hand },
            { id: 'astrology', label: 'Vedic Astrology', icon: Compass },
            { id: 'history', label: 'Reading History', icon: History },
            {
              id: 'practitioner',
              label: user.role === 'Admin'
                ? 'Admin Portal'
                : user.role === 'Tarot Reader'
                ? 'Reader Suite'
                : user.role === 'Spiritual Consultant'
                ? 'Consultant Hub'
                : 'Role Analytics',
              icon: ShieldCheck
            },
            { id: 'profile', label: 'Profile Settings', icon: UserCheck }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={(e) => {
                  triggerTabFlash(e);
                  spawnSparkleBurst(e);
                  setActiveTab(tab.id);
                  if (tab.id === 'practitioner') {
                    fetchPractitionerStats(user.role);
                  }
                }}
                className={`nav-button ${active ? 'is-active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  color: active ? '#ffffff' : '#94a3b8',
                  background: active ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  fontWeight: active ? '600' : '400',
                  textAlign: 'left'
                }}
              >
                <Icon size={18} style={{ color: active ? '#fbbf24' : '#94a3b8' }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
          <button
            type="button"
            onClick={() => setIsRoleModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(234, 88, 12, 0.25))',
              border: '1px solid rgba(99, 102, 241, 0.5)',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              marginBottom: '0.85rem',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.2)',
              transition: 'transform 0.15s ease'
            }}
            title="Click to open the Choose Your Role modal"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} style={{ color: '#818cf8' }} />
              <span>Choose Your Role</span>
            </div>
            <span style={{
              fontSize: '0.7rem',
              padding: '2px 7px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.15)',
              color: '#fbbf24',
              fontWeight: '700'
            }}>
              {user.role || 'User'}
            </span>
          </button>

          <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Active Account</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email}
            </div>
          </div>

          <button
            onClick={(e) => {
              spawnSparkleBurst(e);
              handleLogout();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <main style={{ flex: 1, padding: '2.5rem 3.5rem', overflowY: 'auto', position: 'relative', zIndex: 5 }}>
        
        {/* Top Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>
              Welcome back, {user.name}
            </h1>
            <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
              Your spiritual intelligence & biometric insight portal
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={(e) => {
                spawnSparkleBurst(e);
                toggleAmbientSound();
              }}
              className="action-btn"
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: isPlayingAudio ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                border: isPlayingAudio ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.15)',
                color: isPlayingAudio ? '#34d399' : '#e2e8f0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '600'
              }}
            >
              {isPlayingAudio ? <Volume2 size={18} /> : <VolumeX size={18} />}
              <span>{isPlayingAudio ? '432Hz Active' : 'Ambient Sound'}</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="action-btn"
              title="Download your reading history in CSV format"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.75rem 1.25rem',
                borderRadius: '12px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Download size={18} />
              Export CSV
            </button>

            <button
              onClick={handleDownloadPDF}
              className="action-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.75rem 1.25rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(236, 72, 153, 0.2))',
                border: '1px solid rgba(251, 191, 36, 0.4)',
                color: '#fef08a',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <FileText size={18} />
              Download PDF Report
            </button>

            {/* Notification & Engagement Bell (PDF Section 11) */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  spawnSparkleBurst(e);
                  setIsNotificationsOpen(!isNotificationsOpen);
                }}
                className="action-btn"
                style={{
                  padding: '0.75rem',
                  borderRadius: '12px',
                  background: isNotificationsOpen ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  border: isNotificationsOpen ? '1px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.15)',
                  color: isNotificationsOpen ? '#fbbf24' : '#e2e8f0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
                title="Notifications & Spiritual Alerts (PDF Section 11)"
              >
                <Bell size={18} />
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)'
                }}>
                  {notifications.filter(n => n.unread).length}
                </span>
              </button>

              {/* Dropdown Drawer */}
              {isNotificationsOpen && (
                <div style={{
                  position: 'absolute',
                  top: '115%',
                  right: 0,
                  width: '360px',
                  background: 'rgba(15, 23, 42, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                  zIndex: 9999,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bell size={16} style={{ color: '#fbbf24' }} />
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#ffffff' }}>
                        Notifications & Alerts
                      </h4>
                    </div>
                    <button
                      onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#38bdf8',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Mark all read
                    </button>
                  </div>

                  <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: '0.85rem 1.25rem',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          background: n.unread ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: '800', color: n.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {n.type}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{n.time}</span>
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#f8fafc' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.4' }}>
                          {n.message}
                        </div>

                        {/* Interactive Notification Actions */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleSendNotificationToEmail(n)}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: emailNotificationSentId === n.id ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                              border: emailNotificationSentId === n.id ? '1px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.1)',
                              color: emailNotificationSentId === n.id ? '#4ade80' : '#cbd5e1',
                              fontSize: '0.7rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Mail size={11} />
                            <span>{emailNotificationSentId === n.id ? 'Dispatched to Email!' : 'Send to Mail'}</span>
                          </button>

                          {(n.type.includes('Reminder') || n.title.includes('Consultation')) && (
                            <button
                              type="button"
                              onClick={() => {
                                setRescheduleAppointment({
                                  id: 1,
                                  clientName: user.name || 'Seeker',
                                  spread: 'Celtic Cross Consultation',
                                  time: 'Today, 2:30 PM'
                                });
                                setIsRescheduleOpen(true);
                              }}
                              style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: 'rgba(168, 85, 247, 0.18)',
                                border: '1px solid rgba(168, 85, 247, 0.4)',
                                color: '#c084fc',
                                fontSize: '0.7rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <MessageSquare size={11} />
                              <span>Reschedule via Chat</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    padding: '0.75rem 1.25rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    fontSize: '0.72rem',
                    color: '#64748b',
                    textAlign: 'center'
                  }}>
                    Section 11: Notification & Engagement System
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="entrance" data-delay="0">
            {scoreData && (
              <>
                <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px', marginBottom: '2rem' }}>
                  <ResonanceGauge 
                    score={scoreData.overall_score} 
                    tier={scoreData.resonance_tier} 
                  />

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '2rem 0' }} />

                  <p style={{ color: '#cbd5e1', fontSize: '0.95rem', maxWidth: '750px', lineHeight: '1.6', margin: 0 }}>
                    {scoreData.advice}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                  <div className="metric-pill" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Sun size={32} style={{ color: '#fbbf24', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Solar Cycle</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>Active Radiance</div>
                    </div>
                  </div>
                  <div className="metric-pill" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Moon size={32} style={{ color: '#c084fc', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Lunar Phase</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>Waxing Intuition</div>
                    </div>
                  </div>
                  <div className="metric-pill" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Compass size={32} style={{ color: '#38bdf8', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Alignment Vector</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>North Horizon</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  {scoreData.breakdown?.map((item, idx) => (
                    <div key={idx} className="metric-pill">
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.factor} ({item.weight})</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#f8fafc', marginTop: '4px' }}>{item.contribution}</div>
                      <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '2px' }}>Sub-score: {item.score}%</div>
                    </div>
                  ))}
                </div>

                {/* --- AI SYNTHESIS SECTION --- */}
                <div className="mt-8 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 0.5rem 0', color: '#c084fc' }}>
                      Cosmic Convergence
                    </h2>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem', maxWidth: '600px' }}>
                      Combine your recent Tarot, Palmistry, and Astrological data into a single, unified spiritual forecast powered by AI.
                    </p>
                    
                    <button 
                      onClick={handleGenerateSynthesis}
                      disabled={isSynthesizing}
                      className="action-btn"
                      style={{
                        padding: '0.85rem 2rem',
                        borderRadius: '30px',
                        background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
                        border: 'none',
                        color: '#ffffff',
                        fontWeight: '700',
                        fontSize: '1rem',
                        cursor: isSynthesizing ? 'not-allowed' : 'pointer',
                        boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
                        opacity: isSynthesizing ? 0.7 : 1
                      }}
                    >
                      {isSynthesizing ? "Channeling the Oracle..." : "Generate AI Synthesis"}
                    </button>
                  </div>

                  {/* Typewriter Result Display */}
                  {synthesis && (
                    <div className="glass-panel" style={{ marginTop: '2rem', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(168, 85, 247, 0.3)', background: 'rgba(0,0,0,0.4)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                        <Sparkles style={{ color: '#c084fc' }} size={24} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: '#f8fafc' }}>The Oracle's Message</h3>
                      </div>
                      <div style={{ color: '#cbd5e1', lineHeight: '1.7', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
                        <TypewriterText text={synthesis} speed={25} />
                      </div>
                    </div>
                  )}
                </div>
                {/* ---------------------------- */}

                {/* --- RECOMMENDATIONS SECTION (Milestone 3) --- */}
                <div className="mt-8 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: '0 0 0.25rem 0', color: '#34d399' }}>
                        Personalized Recommendations
                      </h2>
                      <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                        Actionable guidance generated from your personality profile and reading history.
                      </p>
                    </div>
                    <button
                      onClick={(e) => { spawnSparkleBurst(e); fetchRecommendations(); }}
                      disabled={isLoadingRecommendations}
                      className="action-btn"
                      style={{
                        padding: '0.6rem 1.1rem',
                        borderRadius: '10px',
                        background: 'rgba(52, 211, 153, 0.15)',
                        border: '1px solid rgba(52, 211, 153, 0.4)',
                        color: '#34d399',
                        fontWeight: '600',
                        cursor: isLoadingRecommendations ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {isLoadingRecommendations ? <Loader2 className="spinner-ring" style={{ width: '16px', height: '16px', margin: 0 }} /> : <RefreshCw size={16} />}
                      <span>Refresh</span>
                    </button>
                  </div>

                  {isLoadingRecommendations ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                      <Loader2 className="spinner-ring" style={{ width: '24px', height: '24px', margin: '0 auto 0.75rem auto' }} />
                      <p>Building your recommendations...</p>
                    </div>
                  ) : recommendations.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                      <p>No recommendations yet -- complete a few readings first, then hit Refresh.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                      {recommendations.map((rec, idx) => (
                        <div
                          key={idx}
                          className="metric-pill"
                          style={{ padding: '1.25rem', borderLeft: '4px solid #34d399' }}
                        >
                          {(rec.category || rec.type) && (
                            <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              {rec.category || rec.type}
                            </span>
                          )}
                          <h4 style={{ fontSize: '1.05rem', fontWeight: '700', margin: '6px 0', color: '#f8fafc' }}>
                            {rec.title || rec.heading || 'Recommendation'}
                          </h4>
                          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
                            {rec.action || rec.description || rec.text || rec.detail || JSON.stringify(rec)}
                          </p>
                          {rec.priority && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: '#fbbf24', fontWeight: '600' }}>
                              Priority: {rec.priority}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* ---------------------------- */}
              </>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PALMISTRY VISION AI */}
        {/* ========================================================================= */}
        {activeTab === 'palmistry' && (
          <div className="entrance" data-delay="1">
            {/* Live Palmistry Consultation Room Bar */}
            <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderRadius: '16px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', border: isPalmInRoom ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.08)', background: isPalmInRoom ? 'rgba(52, 211, 153, 0.08)' : 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={isPalmInRoom ? "hud-pulse-dot" : ""} style={{ background: isPalmInRoom ? '#34d399' : '#64748b', width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block' }} />
                <div>
                  <h4 style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem', color: '#ffffff' }}>
                    {isPalmInRoom ? 'Live Shared Palmistry Circle' : 'Live Palmistry Consultation Room'}
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                    {isPalmInRoom ? `Connected to Room: ${palmRoomCode}. Real-time landmark scans and biometrics are synchronized.` : 'Generate a room code to sync biometric hand landmark analysis with a Spiritual Consultant or partner.'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {!isPalmInRoom ? (
                  <>
                    <input 
                      type="text" 
                      placeholder="Room Code" 
                      value={palmRoomCode} 
                      onChange={(e) => setPalmRoomCode(e.target.value.toUpperCase())}
                      style={{ padding: '0.55rem 0.85rem', width: '110px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', textAlign: 'center', letterSpacing: '2px', fontWeight: 'bold', fontSize: '0.85rem', outline: 'none' }}
                    />
                    <button onClick={generatePalmRoomCode} style={{ padding: '0.55rem 0.9rem', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                      Generate
                    </button>
                    <button 
                      onClick={handleJoinPalmRoom} 
                      disabled={!palmRoomCode}
                      style={{ padding: '0.55rem 1.1rem', borderRadius: '8px', background: '#34d399', border: 'none', color: '#022c22', fontWeight: '700', cursor: !palmRoomCode ? 'not-allowed' : 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Wifi size={14} /> Join
                    </button>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#34d399', fontWeight: 'bold', letterSpacing: '2px', fontSize: '0.9rem' }}>
                      {palmRoomCode}
                    </span>
                    <button 
                      onClick={handleLeavePalmRoom}
                      style={{ padding: '0.5rem 0.9rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                    >
                      Leave Room
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '20px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: '0 0 0.25rem 0' }}>MediaPipe 3D Landmark Palmistry</h2>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                    Scan your hand live via webcam or upload a clear photo for 21-landmark biometric analysis & neon line tracing.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px' }}>
                  <button
                    onClick={(e) => {
                      spawnSparkleBurst(e);
                      setPalmMode('camera');
                      startCameraStream();
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: palmMode === 'camera' ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'transparent',
                      color: '#ffffff',
                      fontWeight: palmMode === 'camera' ? '700' : '400',
                      fontSize: '0.85rem'
                    }}
                  >
                    <Video size={16} /> Live Scanner
                  </button>
                  <button
                    onClick={(e) => {
                      spawnSparkleBurst(e);
                      setPalmMode('upload');
                      stopCameraStream();
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: palmMode === 'upload' ? 'linear-gradient(135deg, #f59e0b, #ec4899)' : 'transparent',
                      color: '#ffffff',
                      fontWeight: palmMode === 'upload' ? '700' : '400',
                      fontSize: '0.85rem'
                    }}
                  >
                    <Upload size={16} /> Upload Photo
                  </button>
                </div>
              </div>

              {/* MODE 1: LIVE WEBCAM SCANNER */}
              {palmMode === 'camera' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                  <div className="webcam-viewport">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: 'scaleX(-1)',
                        display: 'block'
                      }}
                    />

                    <div className="webcam-hud-overlay">
                      <div className="webcam-scanner-beam" />
                      <div className="webcam-hand-silhouette">
                        <Hand size={180} style={{ color: 'rgba(56, 189, 248, 0.4)', filter: 'drop-shadow(0 0 12px rgba(56,189,248,0.8))' }} />
                      </div>
                      <div className="hud-corner top-left" />
                      <div className="hud-corner top-right" />
                      <div className="hud-corner bottom-left" />
                      <div className="hud-corner bottom-right" />
                      <div className="hud-status-badge">
                        <span className="hud-pulse-dot" />
                        ALIGN PALM INSIDE RETICLE
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={captureCameraFrame}
                      disabled={isAnalyzingPalm || !isCameraActive}
                      className="action-btn"
                      style={{
                        padding: '0.85rem 1.8rem',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                        border: 'none',
                        color: '#ffffff',
                        fontWeight: '700',
                        cursor: isAnalyzingPalm || !isCameraActive ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {isAnalyzingPalm ? <Loader2 className="spinner-ring" style={{ width: '18px', height: '18px', margin: 0 }} /> : <Camera size={18} />}
                      {isAnalyzingPalm ? 'Analyzing...' : 'Capture & Scan Palm'}
                    </button>

                    <button
                      onClick={(e) => {
                        spawnSparkleBurst(e);
                        if (isCameraActive) stopCameraStream();
                        else startCameraStream();
                      }}
                      className="action-btn"
                      style={{
                        padding: '0.85rem 1.25rem',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#e2e8f0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {isCameraActive ? <CameraOff size={16} /> : <RefreshCw size={16} />}
                      <span>{isCameraActive ? 'Turn Off' : 'Restart Camera'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* MODE 2: FILE UPLOAD */}
              {palmMode === 'upload' && (
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label className="dropzone-box" style={{ flex: 1, minHeight: '220px', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '1rem' }}>
                    {palmPreview ? (
                      <img src={palmPreview} alt="Upload Preview" style={{ maxHeight: '180px', borderRadius: '10px' }} />
                    ) : (
                      <>
                        <Upload size={36} style={{ color: '#fbbf24', marginBottom: '0.5rem' }} />
                        <span style={{ fontWeight: '500' }}>Choose Palm Image</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Real JPG or PNG Photo</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>

                  <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                      onClick={handlePalmUpload}
                      disabled={!palmFile || isAnalyzingPalm}
                      className="action-btn"
                      style={{
                        padding: '0.85rem 1.25rem',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                        border: 'none',
                        color: '#ffffff',
                        fontWeight: '700',
                        cursor: !palmFile || isAnalyzingPalm ? 'not-allowed' : 'pointer',
                        opacity: !palmFile || isAnalyzingPalm ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      {isAnalyzingPalm ? <Loader2 className="spinner-ring" style={{ width: '18px', height: '18px', margin: 0 }} /> : <Sparkles size={18} />}
                      {isAnalyzingPalm ? 'Extracting...' : 'Analyze Palm'}
                    </button>

                    {palmFile && (
                      <button
                        onClick={(e) => {
                          spawnSparkleBurst(e);
                          setPalmFile(null);
                          setPalmPreview(null);
                          setPalmAnalysis(null);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          padding: '4px'
                        }}
                      >
                        Clear Selection
                      </button>
                    )}
                  </div>
                </div>
              )}

              {palmError && (
                <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{palmError}</span>
                </div>
              )}

              {/* Landmark Visualizer Output */}
              {palmAnalysis && (
                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  {!palmAnalysis.detected ? (
                    <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '14px', textAlign: 'center' }}>
                      <AlertCircle size={28} style={{ color: '#f87171', margin: '0 auto 0.5rem auto' }} />
                      <h4 style={{ color: '#f87171', fontWeight: '700', margin: '0 0 0.25rem 0' }}>No Palm Landmarks Detected</h4>
                      <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: 0 }}>
                        {palmAnalysis.analysis || "Please ensure uniform lighting and position your real open palm clearly."}
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ShieldCheck size={16} style={{ color: '#34d399' }} /> 21 Landmark Mesh & Biometric Traces
                          </span>
                          <span style={{ fontSize: '0.75rem', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '2px 8px', borderRadius: '20px' }}>
                            Confidence: {((palmAnalysis.confidence || 0.94) * 100).toFixed(0)}%
                          </span>
                        </div>

                        {palmAnalysis.annotated_image_base64 && (
                          <div className="landmark-preview-wrap">
                            <img src={palmAnalysis.annotated_image_base64} alt="Annotated Landmark Mesh" />
                          </div>
                        )}

                        <div className="mount-radar-grid">
                          <div className="mount-pill">
                            <span style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: '700' }}>Mount of Venus</span>
                            <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Vitality: 92%</span>
                          </div>
                          <div className="mount-pill">
                            <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: '700' }}>Mount of Jupiter</span>
                            <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Leadership: 88%</span>
                          </div>
                          <div className="mount-pill">
                            <span style={{ fontSize: '0.7rem', color: '#ec4899', fontWeight: '700' }}>Mount of Luna</span>
                            <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Intuition: 95%</span>
                          </div>
                          <div className="mount-pill">
                            <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: '700' }}>Mount of Mercury</span>
                            <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Intellect: 90%</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="metric-pill" style={{ marginBottom: '1rem', background: 'rgba(147, 51, 234, 0.15)', borderColor: 'rgba(147, 51, 234, 0.3)' }}>
                          <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: '700', textTransform: 'uppercase' }}>Identified Archetype</span>
                          <h3 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '4px 0' }}>{palmAnalysis.archetype}</h3>
                          <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: 0 }}>{palmAnalysis.element}</p>
                          {palmAnalysis.gesture && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#38bdf8', fontWeight: '600' }}>
                              Gesture: {palmAnalysis.gesture}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                          <div className="metric-pill">
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>Aspect Ratio</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{palmAnalysis.palm_aspect_ratio || '1.05'}</div>
                          </div>
                          <div className="metric-pill">
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>Finger Ratio</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{palmAnalysis.finger_palm_ratio || '0.82'}</div>
                          </div>
                        </div>

                        <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {palmAnalysis.key_features?.map((feat, idx) => (
                            <li key={idx} style={{ fontSize: '0.85rem', color: '#cbd5e1', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', gap: '8px' }}>
                              <CheckCircle2 size={16} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Major Palm Line Metrics Grid */}
                        {palmAnalysis.line_metrics && (
                          <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                            {Object.entries(palmAnalysis.line_metrics).map(([key, val]) => (
                              <div 
                                key={key} 
                                className="metric-pill" 
                                style={{ 
                                  borderLeft: `4px solid ${
                                    key === 'heart_line' ? '#ec4899' : 
                                    key === 'head_line' ? '#38bdf8' : 
                                    key === 'life_line' ? '#fbbf24' : '#a855f7'
                                  }` 
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#f8fafc' }}>{val.name}</span>
                                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#34d399' }}>{val.score}%</span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>{val.quality}</div>
                                <div style={{ fontSize: '0.7rem', color: '#fbbf24', marginTop: '2px', fontWeight: '600' }}>{val.resonance}</div>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: TAROT READINGS */}
        {/* ========================================================================= */}
        {activeTab === 'tarot' && (
          <div className="entrance" data-delay="2">
            
            {/* --- MULTIPLAYER WEBSOCKET PANEL --- */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '20px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', border: isInRoom ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={isInRoom ? "hud-pulse-dot" : ""} style={{ background: isInRoom ? '#34d399' : '#64748b', width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block' }} />
                  {isInRoom ? 'Live Shared Circle' : 'Multiplayer Tarot Room'}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                  {isInRoom ? `Connected to Room: ${roomCode}. Actions are synced.` : 'Generate a code and share it with a partner to sync your screens in real-time.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {!isInRoom ? (
                  <>
                    <input 
                      type="text" 
                      placeholder="Room Code" 
                      value={roomCode} 
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      style={{ padding: '0.6rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', outline: 'none', width: '120px', textAlign: 'center', fontWeight: '700', letterSpacing: '2px' }}
                    />
                    <button onClick={generateRoomCode} style={{ padding: '0.6rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>
                      Generate
                    </button>
                    <button 
                      onClick={handleJoinRoom} 
                      disabled={!roomCode}
                      className="action-btn"
                      style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', background: '#34d399', border: 'none', color: '#022c22', fontWeight: '700', cursor: !roomCode ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Wifi size={16} /> Connect
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ padding: '0.6rem 1rem', borderRadius: '10px', background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', fontWeight: '700', letterSpacing: '2px' }}>
                      {roomCode}
                    </div>
                    <button 
                      onClick={handleLeaveRoom}
                      className="action-btn"
                      style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      Leave Room
                    </button>
                  </>
                )}
              </div>
            </div>
            {/* ----------------------------------- */}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: 0 }}>Interactive Tarot Deck</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                  Pick cards directly from the 78-card arc or deal the entire spread at once.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={selectedSpread}
                  onChange={(e) => {
                    setSelectedSpread(e.target.value);
                    setTarotCards([]);
                    setRevealedCards({});
                    setSelectedArcIndices([]);
                  }}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    background: '#0f172a',
                    border: '1px solid rgba(251, 191, 36, 0.4)',
                    color: '#fbbf24',
                    fontWeight: '600',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="single">Daily Oracle (1 Card)</option>
                  <option value="three_card">3-Card Timeline (Past / Present / Future)</option>
                  <option value="relationship">3-Card Relationship Harmony (You / Partner / Bond)</option>
                  <option value="career">5-Card Crossroads (Career / Journey)</option>
                  <option value="life_path">5-Card Life Path & Destiny (5 Cards)</option>
                  <option value="celtic_cross">Celtic Cross Full Spread (10 Cards)</option>
                </select>

                {tarotCards.length > 0 && (
                  <>
                    <button
                      onClick={handleExportShareImage}
                      className="action-btn"
                      title="Save Spread Snapshot as PNG"
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        background: 'rgba(56, 189, 248, 0.15)',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        color: '#38bdf8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Share2 size={16} />
                      <span>Share Card</span>
                    </button>
                    <button
                      onClick={handleRevealAll}
                      className="action-btn"
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#e2e8f0',
                        cursor: 'pointer'
                      }}
                    >
                      Reveal All
                    </button>
                    <button
                      onClick={handleHideAll}
                      className="action-btn"
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#e2e8f0',
                        cursor: 'pointer'
                      }}
                    >
                      Hide All
                    </button>
                  </>
                )}

                <button
                  onClick={(e) => handleDrawTarot(e, selectedSpread)}
                  disabled={isDrawingTarot}
                  className="action-btn"
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: '700',
                    cursor: isDrawingTarot ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Sparkles size={18} />
                  {isDrawingTarot ? 'Shuffling Deck...' : tarotCards.length > 0 ? 'Reshuffle & Deal' : 'Auto Deal Cards'}
                </button>
              </div>
            </div>

            {/* 78-Card Interactive Curved Deck Ribbon */}
            {tarotCards.length === 0 && !isDrawingTarot && (
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '20px', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: '#f8fafc' }}>
                      Choose {targetCount - selectedArcIndices.length} Card{targetCount - selectedArcIndices.length === 1 ? '' : 's'} from the 78-Card Arc
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                      Hover over the ribbon and tap cards intuitively to construct your spread.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: '700', background: 'rgba(251, 191, 36, 0.1)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                    {selectedArcIndices.length} / {targetCount} Picked
                  </span>
                </div>

                <div className="deck-arc-container">
                  {Array.from({ length: 78 }).map((_, idx) => {
                    const isChosen = selectedArcIndices.includes(idx);
                    return (
                      <div
                        key={idx}
                        onClick={(e) => handleArcCardClick(e, idx)}
                        className={`fanned-card ${isChosen ? 'is-selected' : ''}`}
                        title={`Card #${idx + 1}`}
                      >
                        <Sparkles size={14} style={{ color: isChosen ? '#34d399' : '#fbbf24', opacity: 0.7 }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isDrawingTarot && (
              <div style={{ padding: '4rem', textAlign: 'center' }}>
                <div className="tarot-flip-card tarot-shuffling" style={{ margin: '0 auto', maxWidth: '180px' }}>
                  <div className="tarot-face tarot-face--back tarot-glow">
                    <Sparkles size={36} style={{ color: '#fbbf24', animation: 'spin 2s linear infinite' }} />
                  </div>
                </div>
                <p className="loading-shimmer-text" style={{ marginTop: '1.5rem', fontSize: '1.1rem', fontWeight: '600' }}>
                  Channeling cosmic energies & aligning archetypes...
                </p>
              </div>
            )}

            <div ref={cardShareRef} style={{ borderRadius: '16px' }}>
              {!isDrawingTarot && tarotCards.length > 0 && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    {tarotCards.map((card, idx) => {
                      const isRevealed = !!revealedCards[idx];
                      return (
                        <div 
                          key={idx}
                          onClick={(e) => toggleReveal(e, idx)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '0.4rem 0.9rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            background: isRevealed ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255,255,255,0.05)',
                            border: isRevealed ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                            color: isRevealed ? '#34d399' : '#94a3b8',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isRevealed ? '#34d399' : '#fbbf24' }} />
                          <span>{card.position}: {isRevealed ? 'Revealed' : 'Click to Flip'}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${selectedSpread === 'single' ? '320px' : '240px'}, 1fr))`, gap: '1.75rem' }}>
                    {tarotCards.map((card, idx) => {
                      const isRevealed = !!revealedCards[idx];
                      
                      return (
                        <div key={idx} className={`tarot-stage deal-anim-${idx % 3}`}>
                          <div 
                            className={`tarot-flip-card ${isRevealed ? 'is-revealed' : 'tarot-glow'}`}
                            onClick={(e) => toggleReveal(e, idx)}
                          >
                            <div className="tarot-face tarot-face--back">
                              <div style={{ textAlign: 'center', color: '#fbbf24', padding: '1.5rem' }}>
                                <Sparkles size={36} style={{ margin: '0 auto 0.75rem auto' }} />
                                <div style={{ fontWeight: '800', fontSize: '1rem', letterSpacing: '0.5px' }}>
                                  {card.position}
                                </div>
                                <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(251, 191, 36, 0.15)', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                                  Tap to Unveil
                                </div>
                              </div>
                            </div>

                            <div 
                              className="tarot-face tarot-face--front glass-panel" 
                              style={{ 
                                padding: '1.75rem 1.5rem', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                justifyContent: 'space-between', 
                                border: '1.5px solid rgba(251, 191, 36, 0.5)' 
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.72rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>
                                    {card.position}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      spawnSparkleBurst(e);
                                      speakReading(`${card.name}, ${card.orientation}. ${card.meaning}`);
                                    }}
                                    style={{
                                      background: 'rgba(56, 189, 248, 0.15)',
                                      border: '1px solid rgba(56, 189, 248, 0.3)',
                                      borderRadius: '8px',
                                      color: '#38bdf8',
                                      cursor: 'pointer',
                                      padding: '4px 6px',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                    title="Listen to voice interpretation"
                                  >
                                    <Mic size={14} />
                                  </button>
                                </div>

                                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', margin: '0.75rem 0 0.25rem 0', color: '#ffffff' }}>
                                  {card.name}
                                </h3>
                                <span style={{ fontSize: '0.75rem', color: card.orientation === 'Reversed' ? '#f87171' : '#34d399', fontWeight: '600' }}>
                                  {card.orientation}
                                </span>
                              </div>

                              <div>
                                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.75rem 0' }} />
                                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.45', margin: 0 }}>
                                  {card.meaning}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: VEDIC ASTROLOGY */}
        {/* ========================================================================= */}
        {activeTab === 'astrology' && (
          <div className="entrance" data-delay="5">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              
              {/* Input Form Panel */}
              <div className="glass-panel" style={{ padding: '2rem', borderRadius: '20px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>Vedic Kundali & Nakshatra</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Calculate your lunar mansion, ruling planetary lord, and foundational celestial chart.
                </p>

                <form onSubmit={handleCalculateKundali} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>Birth Date</label>
                    <input
                      type="date"
                      value={astroForm.birth_date}
                      onChange={(e) => setAstroForm({ ...astroForm, birth_date: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>Birth Time (24h)</label>
                    <input
                      type="time"
                      value={astroForm.birth_time}
                      onChange={(e) => setAstroForm({ ...astroForm, birth_time: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', outline: 'none' }}
                    />
                  </div>

                  {/* Multi-Level Location Hierarchy & GPS Engine */}
                  <VedicLocationSelector
                    initialLatitude={astroForm.latitude}
                    initialLongitude={astroForm.longitude}
                    initialLocationName={astroForm.location_name}
                    onLocationChange={(locData) => {
                      setAstroForm((prev) => ({
                        ...prev,
                        latitude: locData.latitude,
                        longitude: locData.longitude,
                        timezone_offset: locData.timezone_offset,
                        location_name: locData.location_name,
                        location_hierarchy: locData.hierarchy
                      }));
                    }}
                  />

                  {/* Ayanamsa Calculation System Selector */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                      Vedic Ayanamsa System
                    </label>
                    <select
                      value={astroForm.ayanamsa || 'Lahiri'}
                      onChange={(e) => setAstroForm({ ...astroForm, ayanamsa: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.14)',
                        color: '#ffffff',
                        outline: 'none',
                        fontSize: '0.9rem'
                      }}
                    >
                      <option value="Lahiri">Chitra Paksha / Lahiri (Indian National Standard)</option>
                      <option value="KP">Krishnamurti Paddhati (KP System)</option>
                      <option value="Raman">B.V. Raman Traditional System</option>
                      <option value="Tropical">Sayana (Western Tropical Equinox)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isCalculatingAstro}
                    className="action-btn"
                    style={{ padding: '0.85rem', borderRadius: '12px', background: 'linear-gradient(135deg, #fbbf24, #ec4899)', border: 'none', color: '#030712', fontWeight: '700', cursor: 'pointer', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {isCalculatingAstro ? <Loader2 className="spinner-ring" style={{ width: '18px', height: '18px', margin: 0 }} /> : <Sparkles size={18} />}
                    {isCalculatingAstro ? 'Calculating Chart...' : 'Generate Kundali Chart'}
                  </button>
                </form>
              </div>

              {/* Results Display Panel */}
              <div className="glass-panel" style={{ padding: '2rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {kundaliResult ? (
                  <div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.4)', color: '#38bdf8', fontSize: '0.8rem', fontWeight: '700' }}>
                        Nakshatra #{kundaliResult.nakshatra_index}: {kundaliResult.nakshatra} (Pada {kundaliResult.nakshatra_pada || 1})
                      </span>
                      {kundaliResult.location_name && (
                        <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', color: '#fbbf24', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> {kundaliResult.location_name} (UTC {kundaliResult.timezone_offset >= 0 ? '+' : ''}{kundaliResult.timezone_offset}h)
                        </span>
                      )}
                      <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#c084fc', fontSize: '0.78rem' }}>
                        {kundaliResult.ayanamsa} Ayanamsa
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0 0 1rem 0', color: '#ffffff' }}>
                      Ruling Lord: {kundaliResult.ruling_lord}
                    </h3>

                    {/* 4 Core Celestial Pillars */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      <div className="metric-pill">
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Ascendant (Lagna)</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fbbf24' }}>
                          {kundaliResult.ascendant} ({kundaliResult.ascendant_degree || 0}°)
                        </div>
                      </div>
                      <div className="metric-pill">
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Moon (Rashi)</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ec4899' }}>{kundaliResult.moon_sign}</div>
                      </div>
                      <div className="metric-pill">
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sun (Surya)</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#38bdf8' }}>{kundaliResult.sun_sign}</div>
                      </div>
                      <div className="metric-pill">
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Nakshatra Pada</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#34d399' }}>Pada {kundaliResult.nakshatra_pada || 1}</div>
                      </div>
                    </div>

                    {/* Vimshottari Mahadasha Banner */}
                    {kundaliResult.current_mahadasha && (
                      <div style={{ padding: '0.85rem 1rem', background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '12px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#c084fc', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Active Vimshottari Mahadasha</span>
                          <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc' }}>
                            Lord {typeof kundaliResult.current_mahadasha === 'object' ? `${kundaliResult.current_mahadasha.mahadasha_lord} (${kundaliResult.current_mahadasha.years_duration || 7} Year Cycle)` : kundaliResult.current_mahadasha}
                          </div>
                        </div>
                        {kundaliResult.birth_dasha_balance_years !== undefined && (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            Birth balance: <strong style={{ color: '#fbbf24' }}>{kundaliResult.birth_dasha_balance_years} yrs</strong>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Navagraha Planetary Positions (9 Celestial Bodies) - Clean 3x3 Symmetrical Grid */}
                    {kundaliResult.planets && kundaliResult.planets.length > 0 && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Compass size={16} style={{ color: '#fbbf24' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Navagraha Planetary Alignments (9 Celestial Bodies)
                            </span>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Sidereal Ephemeris</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                          {kundaliResult.planets.map((p, idx) => {
                            const pSign = p.sign || p.rashi || 'Zodiac Sign';
                            const pDeg = p.sign_degree !== undefined ? `${p.sign_degree}°` : (p.degree_in_sign !== undefined ? `${p.degree_in_sign}°` : (p.degree !== undefined ? `${p.degree}°` : ''));
                            const pHouse = p.house || (idx + 1);
                            return (
                              <div
                                key={idx}
                                style={{
                                  padding: '0.7rem 0.85rem',
                                  borderRadius: '10px',
                                  background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '4px',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontWeight: '700', fontSize: '0.88rem', color: '#f8fafc' }}>
                                    {p.name}
                                  </span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {p.is_retrograde && (
                                      <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.25)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', fontWeight: '700' }} title="Retrograde (Vakri)">
                                        Vakri (R)
                                      </span>
                                    )}
                                    <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: '600' }}>
                                      House {pHouse}
                                    </span>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                                  <span style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: '600' }}>
                                    {pSign}
                                  </span>
                                  {pDeg && (
                                    <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: '700' }}>
                                      {pDeg}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 12 Bhavas (Astrological Houses) Cusps - Balanced 4x3 Grid */}
                    {kundaliResult.houses && kundaliResult.houses.length > 0 && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Layers size={16} style={{ color: '#34d399' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              12 Bhavas (House Cusps & Sphutas)
                            </span>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Vedic Bhava Cusps</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                          {kundaliResult.houses.map((h, idx) => {
                            const hNum = h.house || h.house_number || (idx + 1);
                            const hSign = h.sign || 'Zodiac Sign';
                            const hDeg = h.degree !== undefined ? `${h.degree}°` : '';
                            const bhavaTitles = [
                              'Tanu (Self)', 'Dhana (Wealth)', 'Sahaja (Courage)', 'Sukha (Home)',
                              'Putra (Intellect)', 'Ari (Health)', 'Yuvati (Partnership)', 'Randhra (Longevity)',
                              'Dharma (Fortune)', 'Karma (Career)', 'Labha (Gains)', 'Vyaya (Moksha)'
                            ];
                            const bhavaDesc = bhavaTitles[hNum - 1] || `Bhava ${hNum}`;

                            return (
                              <div
                                key={idx}
                                style={{
                                  padding: '0.55rem 0.65rem',
                                  borderRadius: '8px',
                                  background: 'rgba(255,255,255,0.025)',
                                  border: '1px solid rgba(255,255,255,0.07)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '2px'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.73rem', fontWeight: '700', color: '#34d399' }}>
                                    House {hNum}
                                  </span>
                                  {hDeg && (
                                    <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                                      {hDeg}
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {hSign}
                                </div>
                                <div style={{ fontSize: '0.67rem', color: '#64748b' }}>
                                  {bhavaDesc}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div style={{
                      padding: '1.1rem 1.25rem',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.4), rgba(15, 23, 42, 0.7))',
                      border: '1px solid rgba(251, 191, 36, 0.25)',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start'
                    }}>
                      <Sparkles size={20} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
                      <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.65', margin: 0 }}>
                        {kundaliResult.vedic_insight}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                    <Compass size={48} style={{ color: '#fbbf24', margin: '0 auto 1rem auto', opacity: 0.7 }} />
                    <h4 style={{ color: '#f8fafc', fontWeight: '700', margin: '0 0 0.5rem 0' }}>No Kundali Calculated Yet</h4>
                    <p style={{ fontSize: '0.85rem' }}>Enter your birth credentials and select your precise birth hierarchy or use GPS to generate your complete Vedic Navagraha chart.</p>
                  </div>
                )}
              </div>

            </div>

            {/* --- SOUL CONNECTION MATRIX SECTION --- */}
            <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              
              {/* Compatibility Input Form */}
              <div className="glass-panel" style={{ padding: '2rem', borderRadius: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  <Sparkles size={24} style={{ color: '#ec4899' }} />
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: 0 }}>Soul Connection Matrix</h2>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Compare planetary resonance and Lunar Nakshatras between you and a partner.
                </p>

                <form onSubmit={handleCalculateCompatibility} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>Your Birth Date</label>
                    <input
                      type="date"
                      value={compForm.user_date}
                      onChange={(e) => setCompForm({ ...compForm, user_date: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>Partner's Name</label>
                      <input
                        type="text"
                        placeholder="Name"
                        value={compForm.partner_name}
                        onChange={(e) => setCompForm({ ...compForm, partner_name: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>Partner's Birth Date</label>
                      <input
                        type="date"
                        value={compForm.partner_date}
                        onChange={(e) => setCompForm({ ...compForm, partner_date: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isCalculatingComp}
                    className="action-btn"
                    style={{ padding: '0.85rem', borderRadius: '12px', background: 'linear-gradient(135deg, #a855f7, #ec4899)', border: 'none', color: '#ffffff', fontWeight: '700', cursor: 'pointer', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {isCalculatingComp ? <Loader2 className="spinner-ring" style={{ width: '18px', height: '18px', margin: 0 }} /> : <Layers size={18} />}
                    {isCalculatingComp ? 'Aligning Matrices...' : 'Calculate Synastry'}
                  </button>
                </form>
              </div>

              {/* Compatibility Results */}
              <div className="glass-panel" style={{ padding: '2rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {compResult ? (
                  <div className="entrance" data-delay="1">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: 'rgba(236, 72, 153, 0.15)', border: '1px solid rgba(236, 72, 153, 0.4)', color: '#ec4899', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                          {compResult.tier}
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                          {user.name} & {compResult.partner_name}
                        </h3>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#fbbf24', lineHeight: '1' }}>
                          {compResult.compatibility_score}%
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>Resonance</div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div className="metric-pill" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Your Moon</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#38bdf8' }}>{compResult.user_moon}</div>
                      </div>
                      <div className="metric-pill" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Their Moon</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#a855f7' }}>{compResult.partner_moon}</div>
                      </div>
                    </div>

                    <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', background: 'rgba(236, 72, 153, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(236, 72, 153, 0.2)', margin: 0 }}>
                      {compResult.analysis}
                    </p>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                    <Layers size={48} style={{ color: '#ec4899', margin: '0 auto 1rem auto', opacity: 0.7 }} />
                    <h4 style={{ color: '#f8fafc', fontWeight: '700', margin: '0 0 0.5rem 0' }}>Synastry Awaits</h4>
                    <p style={{ fontSize: '0.85rem' }}>Enter both birth dates to reveal the cosmic alignment and karmic lessons between two souls.</p>
                  </div>
                )}
              </div>

            </div>
            {/* -------------------------------------- */}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: READING HISTORY & SPIRITUAL JOURNAL */}
        {/* ========================================================================= */}
        {activeTab === 'history' && (
          <div className="entrance" data-delay="4">
            
            {/* SVG Resonance Trend Line Chart */}
            {readingHistory.length > 1 && (
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '20px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: '#f8fafc' }}>
                      Spiritual Resonance Evolution
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                      Historical vibration scores across your past readings
                    </p>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: '700' }}>
                    Average: {(readingHistory.reduce((acc, curr) => acc + (curr.score || 85), 0) / readingHistory.length).toFixed(1)}%
                  </span>
                </div>

                <div style={{ width: '100%', height: '110px', position: 'relative' }}>
                  <svg viewBox="0 0 500 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {(() => {
                      const pts = readingHistory.slice(0, 10).reverse().map((r, i, arr) => {
                        const x = (i / (arr.length - 1 || 1)) * 480 + 10;
                        const y = 90 - ((r.score - 50) / 50) * 80;
                        return { x, y, score: r.score };
                      });
                      const poly = `10,95 ${pts.map(p => `${p.x},${p.y}`).join(' ')} 490,95`;
                      return (
                        <>
                          <polygon points={poly} fill="url(#chartGrad)" />
                          <polyline points={pts.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
                          {pts.map((p, idx) => (
                            <circle key={idx} cx={p.x} cy={p.y} r="3.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            )}

            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: 0 }}>Your Reading History & Journal</h2>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                    Archive of your stored Tarot draws, Palmistry landmark scans, and personal reflections
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleDownloadCSV}
                    className="action-btn"
                    title="Export reading archive to CSV spreadsheet"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '0.45rem 0.9rem',
                      borderRadius: '8px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      color: '#38bdf8',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={14} />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={handleDownloadPDF}
                    className="action-btn"
                    title="Download complete synthesis PDF"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '0.45rem 0.9rem',
                      borderRadius: '8px',
                      background: 'rgba(251, 191, 36, 0.15)',
                      border: '1px solid rgba(251, 191, 36, 0.4)',
                      color: '#fbbf24',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <FileText size={14} />
                    <span>Export PDF</span>
                  </button>

                  <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '10px' }}>
                    {['all', 'tarot', 'palmistry', 'astrology'].map(type => (
                      <button
                        key={type}
                        onClick={(e) => {
                          spawnSparkleBurst(e);
                          setHistoryFilter(type);
                        }}
                        style={{
                          padding: '0.4rem 0.85rem',
                          borderRadius: '8px',
                          border: 'none',
                          background: historyFilter === type ? 'rgba(251, 191, 36, 0.2)' : 'transparent',
                          color: historyFilter === type ? '#fbbf24' : '#94a3b8',
                          fontSize: '0.8rem',
                          fontWeight: historyFilter === type ? '700' : '400',
                          cursor: 'pointer',
                          textTransform: 'capitalize'
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {isLoadingHistory ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                  <Loader2 className="spinner-ring" style={{ width: '28px', height: '28px', margin: '0 auto 1rem auto' }} />
                  <p>Retrieving reading history from database...</p>
                </div>
              ) : filteredReadings.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                  <History size={40} style={{ color: '#fbbf24', margin: '0 auto 1rem auto', opacity: 0.7 }} />
                  <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#f8fafc' }}>No matching readings found</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredReadings.map((item) => (
                    <div
                      key={item.id}
                      className="metric-pill"
                      style={{
                        padding: '1.25rem 1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '260px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontWeight: '700',
                              textTransform: 'uppercase',
                              background: item.reading_type === 'tarot' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                              color: item.reading_type === 'tarot' ? '#c084fc' : '#38bdf8',
                              border: item.reading_type === 'tarot' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(56, 189, 248, 0.4)'
                            }}
                          >
                            {item.reading_type}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.date}</span>
                        </div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '4px 0', color: '#f8fafc' }}>
                          {item.title}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>
                          {item.summary}
                        </p>

                        {/* Journal Reflection Field */}
                        {editingNoteId === item.id ? (
                          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '6px' }}>
                            <input
                              type="text"
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Add personal reflection..."
                              style={{
                                flex: 1,
                                padding: '0.4rem 0.75rem',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                color: '#ffffff',
                                fontSize: '0.8rem',
                                outline: 'none'
                              }}
                            />
                            <button
                              onClick={(e) => handleSaveNote(e, item.id)}
                              style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', background: '#34d399', border: 'none', color: '#030712', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              Save
                            </button>
                            <button
                              onClick={(e) => {
                                spawnSparkleBurst(e);
                                setEditingNoteId(null);
                              }}
                              style={{ padding: '0.4rem 0.6rem', borderRadius: '8px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              spawnSparkleBurst(e);
                              setEditingNoteId(item.id);
                              setNoteText('');
                            }}
                            style={{ marginTop: '0.5rem', background: 'transparent', border: 'none', color: '#fbbf24', fontSize: '0.75rem', padding: 0, cursor: 'pointer', fontWeight: '600' }}
                          >
                            + Add Reflection Note
                          </button>
                        )}
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Resonance</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fbbf24' }}>
                          {item.score}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div className="entrance" data-delay="5">
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '20px', maxWidth: '720px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>Seeker Profile Settings</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Customize your spiritual profile to tune the multi-factor guidance resonance engine.
              </p>

              {profileSuccessMsg && (
                <div style={{ marginBottom: '1.5rem', padding: '0.85rem 1rem', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '10px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                  <CheckCircle2 size={18} />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {profileErrorMsg && (
                <div style={{ marginBottom: '1.5rem', padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                  <AlertCircle size={18} />
                  <span>{profileErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: '500' }}>
                    Full Spiritual Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="e.g. Navya"
                    required
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#ffffff',
                      outline: 'none',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: '500' }}>
                      Age Group
                    </label>
                    <select
                      value={profileForm.age_group}
                      onChange={(e) => setProfileForm({ ...profileForm, age_group: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        background: '#0f172a',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        outline: 'none',
                        fontSize: '0.95rem'
                      }}
                    >
                      <option value="18-25">18-25</option>
                      <option value="26-35">26-35</option>
                      <option value="36-50">36-50</option>
                      <option value="50+">50+</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: '500' }}>
                      Reading Preferences
                    </label>
                    <select
                      value={profileForm.reading_preferences}
                      onChange={(e) => setProfileForm({ ...profileForm, reading_preferences: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        background: '#0f172a',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        outline: 'none',
                        fontSize: '0.95rem'
                      }}
                    >
                      <option value="Both">Both Palmistry & Tarot</option>
                      <option value="Palmistry">Palmistry Only</option>
                      <option value="Tarot">Tarot Only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: '500' }}>
                    Interests & Astrological Focus
                  </label>
                  <input
                    type="text"
                    value={profileForm.interests}
                    onChange={(e) => setProfileForm({ ...profileForm, interests: e.target.value })}
                    placeholder="e.g. Vedic Astrology, Meditation, Chakra Healing"
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#ffffff',
                      outline: 'none',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: '500' }}>
                    Primary Spiritual Goals
                  </label>
                  <textarea
                    value={profileForm.spiritual_goals}
                    onChange={(e) => setProfileForm({ ...profileForm, spiritual_goals: e.target.value })}
                    placeholder="e.g. Seeking clarity on career direction and personal balance."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#ffffff',
                      outline: 'none',
                      fontSize: '0.95rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: '500' }}>
                    Platform Access Role (RBAC)
                  </label>
                  <select
                    value={profileForm.role || user.role || 'User'}
                    onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      background: '#0f172a',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#ffffff',
                      outline: 'none',
                      fontSize: '0.95rem'
                    }}
                  >
                    <option value="User">Seeker / User (Standard Readings & Guidance)</option>
                    <option value="Tarot Reader">Tarot Reader (Professional Arcana Suite)</option>
                    <option value="Spiritual Consultant">Spiritual Consultant (Kundali & Palmistry Expert)</option>
                    <option value="Admin">Platform Administrator (Global Analytics & User Oversight)</option>
                  </select>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                    Switching your role unlocks specialized practitioner views and analytics according to project specifications.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="action-btn"
                  style={{
                    padding: '0.9rem 1.5rem',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: '700',
                    cursor: isSavingProfile ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '0.5rem'
                  }}
                >
                  {isSavingProfile ? <Loader2 className="spinner-ring" style={{ width: '18px', height: '18px', margin: 0 }} /> : <Save size={18} />}
                  {isSavingProfile ? 'Saving...' : 'Save Profile Settings'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: PRACTITIONER & ROLE PORTAL */}
        {/* ========================================================================= */}
        {activeTab === 'practitioner' && (
          <div className="entrance" data-delay="3">
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '20px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <ShieldCheck size={24} style={{ color: '#38bdf8' }} />
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: 0 }}>
                      {user.role === 'Admin'
                        ? 'Platform Administration Console'
                        : user.role === 'Tarot Reader'
                        ? 'Professional Tarot Reader Suite'
                        : user.role === 'Spiritual Consultant'
                        ? 'Spiritual Consultant Hub'
                        : 'Role & Practitioner Overview'}
                    </h2>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                    Active Role: <strong style={{ color: '#fbbf24' }}>{user.role}</strong> — Role-based access control (RBAC) portal
                  </p>
                </div>

                <button
                  onClick={() => fetchPractitionerStats(user.role)}
                  disabled={isLoadingPractitioner}
                  className="action-btn"
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '10px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    color: '#38bdf8',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={14} />
                  <span>Refresh Metrics</span>
                </button>
              </div>

              {/* Suite & Role Quick Switcher */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                flexWrap: 'wrap',
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                marginBottom: '1.5rem'
              }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '4px' }}>
                  Select Suite:
                </span>
                {[
                  { role: 'Tarot Reader', label: 'Tarot Reader Suite', color: '#a855f7' },
                  { role: 'Spiritual Consultant', label: 'Consultant Hub', color: '#ec4899' },
                  { role: 'Admin', label: 'Admin Portal', color: '#38bdf8' },
                  { role: 'User', label: 'Seeker / User Mode', color: '#fbbf24' }
                ].map((item) => {
                  const isCurrent = (user.role || 'User') === item.role;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => handleQuickRoleSwitch(item.role)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        background: isCurrent ? item.color : 'rgba(255, 255, 255, 0.06)',
                        color: isCurrent ? (item.role === 'User' ? '#0f172a' : '#ffffff') : '#cbd5e1',
                        border: isCurrent ? `1px solid ${item.color}` : '1px solid rgba(255, 255, 255, 0.12)',
                        fontSize: '0.82rem',
                        fontWeight: isCurrent ? '700' : '500',
                        cursor: isCurrent ? 'default' : 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isCurrent ? `0 0 12px ${item.color}55` : 'none'
                      }}
                    >
                      {isCurrent ? `● Active: ${item.label}` : item.label}
                    </button>
                  );
                })}
              </div>

              {isLoadingPractitioner ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                  <Loader2 className="spinner-ring" style={{ width: '28px', height: '28px', margin: '0 auto 1rem auto' }} />
                  <p>Loading role analytics and audit logs...</p>
                </div>
              ) : user.role === 'Admin' ? (
                <div>
                  {/* Admin KPI Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="metric-pill">
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Registered Seekers</span>
                      <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#38bdf8', marginTop: '4px' }}>
                        {practitionerData?.total_users ?? 0}
                      </div>
                    </div>
                    <div className="metric-pill">
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Readings Conducted</span>
                      <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fbbf24', marginTop: '4px' }}>
                        {practitionerData?.total_readings ?? 0}
                      </div>
                    </div>
                    <div className="metric-pill">
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Email-Verified Users</span>
                      <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#34d399', marginTop: '4px' }}>
                        {practitionerData?.verified_users ?? 0}
                      </div>
                    </div>
                    <div className="metric-pill">
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Backend Health</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#a855f7', marginTop: '8px' }}>
                        Live & Synchronized
                      </div>
                    </div>
                  </div>

                  {/* Registered Users Table */}
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem', color: '#f8fafc' }}>
                    Recent User Registrations & Security Audit
                  </h3>
                  {practitionerData?.recent_users && practitionerData.recent_users.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#cbd5e1' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94a3b8' }}>
                            <th style={{ padding: '0.75rem' }}>User ID</th>
                            <th style={{ padding: '0.75rem' }}>Dynamic Email</th>
                            <th style={{ padding: '0.75rem' }}>Role</th>
                            <th style={{ padding: '0.75rem' }}>Verification</th>
                            <th style={{ padding: '0.75rem' }}>Registered At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {practitionerData.recent_users.map((u) => (
                            <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '0.75rem', fontWeight: '700', color: '#fbbf24' }}>#{u.id}</td>
                              <td style={{ padding: '0.75rem' }}>{u.email}</td>
                              <td style={{ padding: '0.75rem' }}>
                                <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '0.75rem', fontWeight: '600' }}>
                                  {u.role}
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem' }}>
                                <span style={{ color: u.is_verified ? '#34d399' : '#f87171', fontWeight: '600' }}>
                                  {u.is_verified ? '✓ Verified' : 'Pending OTP'}
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem', color: '#94a3b8' }}>
                                {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No recent user records available.</p>
                  )}
                </div>
              ) : user.role === 'Tarot Reader' ? (
                <TarotReaderDashboard 
                  onOpenTarotTab={() => setActiveTab('tarot')} 
                  practitionerName={user?.full_name || 'Navya Parchuri'} 
                />
              ) : user.role === 'Spiritual Consultant' ? (
                <SpiritualConsultantDashboard 
                  onOpenAstrologyTab={() => setActiveTab('astrology')} 
                  onOpenPalmTab={() => setActiveTab('palmistry')} 
                  consultantName={user?.full_name || 'Navya Parchuri'}
                />
              ) : (
                <div>
                  <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>About Platform Practitioner Roles</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
                      According to project specifications, the system supports 4 distinct user roles: Seeker/User, Tarot Reader, Spiritual Consultant, and Admin. You are currently logged in as a <strong>Seeker</strong>. To test practitioner interfaces, switch your role below or open the Role Nexus:
                    </p>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {['Tarot Reader', 'Spiritual Consultant'].map((roleToSwitch) => (
                        <button
                          key={roleToSwitch}
                          onClick={() => handleQuickRoleSwitch(roleToSwitch)}
                          className="action-btn"
                          style={{
                            padding: '0.65rem 1.25rem',
                            borderRadius: '10px',
                            background: 'rgba(56, 189, 248, 0.15)',
                            border: '1px solid rgba(56, 189, 248, 0.4)',
                            color: '#38bdf8',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Switch to {roleToSwitch}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* FLOATING ORACLE CHAT TRIGGER */}
      <button
        onClick={(e) => {
          spawnSparkleBurst(e);
          setIsOracleOpen(!isOracleOpen);
        }}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2.5rem',
          zIndex: 100,
          padding: '0.85rem 1.4rem',
          borderRadius: '30px',
          background: 'linear-gradient(135deg, #a855f7, #ec4899)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#ffffff',
          fontWeight: '700',
          cursor: 'pointer',
          boxShadow: '0 8px 30px rgba(168, 85, 247, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <Sparkles size={18} />
        <span>{isOracleOpen ? 'Close Oracle' : 'Ask the Oracle'}</span>
      </button>

      {/* FLOATING ORACLE DIALOGUE MODAL WITH FACIAL AURA SCANNER */}
      {isOracleOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'fixed',
            bottom: '5.5rem',
            right: '2.5rem',
            width: '420px',
            height: '560px',
            zIndex: 100,
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 50px rgba(0,0,0,0.85)',
            border: auraData ? `1.5px solid ${auraData.aura_color.includes('Red') ? '#ef4444' : auraData.aura_color.includes('Yellow') ? '#fbbf24' : '#c084fc'}` : '1px solid rgba(168, 85, 247, 0.4)',
            transition: 'border 0.5s ease'
          }}
        >
          {/* Header */}
          <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: '#fbbf24' }} />
              <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Akashic Oracle</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {!isAuraCameraOpen && (
                <button
                  onClick={(e) => {
                    spawnSparkleBurst(e);
                    startAuraCamera();
                  }}
                  title="Scan Facial Aura"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    background: auraData ? 'rgba(52, 211, 153, 0.15)' : 'rgba(168, 85, 247, 0.2)',
                    border: auraData ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(168, 85, 247, 0.4)',
                    color: auraData ? '#34d399' : '#c084fc',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <Camera size={13} />
                  <span>{auraData ? 'Re-scan Aura' : 'Scan Aura'}</span>
                </button>
              )}
              <button
                onClick={(e) => {
                  spawnSparkleBurst(e);
                  stopAuraCamera();
                  setIsOracleOpen(false);
                }}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Mini Live Aura Camera Viewport */}
          {isAuraCameraOpen && (
            <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '140px', height: '105px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #a855f7', position: 'relative' }}>
                <video
                  ref={auraVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={captureAuraSnapshot}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Capture Aura
                </button>
                <button
                  onClick={stopAuraCamera}
                  style={{ padding: '4px 8px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Active Aura Vibration Banner */}
          {auraData && !isAuraCameraOpen && (
            <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ 
                  width: '9px', 
                  height: '9px', 
                  borderRadius: '50%', 
                  background: auraData.aura_color.includes('Red') ? '#f87171' : 
                              (auraData.aura_color.includes('Yellow') || auraData.aura_color.includes('Gold')) ? '#fbbf24' : 
                              auraData.aura_color.includes('Indigo') ? '#6366f1' :
                              auraData.aura_color.includes('Violet') ? '#c084fc' :
                              auraData.aura_color.includes('White') ? '#f8fafc' :
                              auraData.aura_color.includes('Blue') ? '#38bdf8' : '#34d399', 
                  boxShadow: '0 0 10px currentColor' 
                }} />
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#f8fafc' }}>{auraData.aura_color} Aura</span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>• {auraData.emotion ? auraData.emotion.toUpperCase() : 'BALANCED'}</span>
              </div>
              <span style={{ fontSize: '0.68rem', color: '#fbbf24', fontStyle: 'italic' }}>
                {auraData.frequency_hz ? `${auraData.frequency_hz} Hz Aligned` : 'Tone Aligned'}
              </span>
            </div>
          )}

          {/* Aura Processing Loader / Error Feedback */}
          {isScanningAura && (
            <div style={{ padding: '0.4rem 1rem', background: 'rgba(168,85,247,0.15)', color: '#c084fc', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Loader2 size={12} className="spinner-ring" style={{ width: '12px', height: '12px', margin: 0 }} />
              Reading micro-expressions & vibrational frequency...
            </div>
          )}
          {auraScanError && (
            <div style={{ padding: '0.4rem 1rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={12} />
              {auraScanError}
            </div>
          )}

          {/* Message Stream */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {oracleMessages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '0.75rem 1rem',
                  borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  background: msg.sender === 'user' ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'rgba(255,255,255,0.06)',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                  lineHeight: '1.45',
                  border: msg.sender === 'oracle' ? '1px solid rgba(255,255,255,0.08)' : 'none'
                }}
              >
                {msg.text}
              </div>
            ))}
            {isOracleThinking && (
              <div style={{ alignSelf: 'flex-start', color: '#fbbf24', fontSize: '0.8rem', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Loader2 size={14} className="spinner-ring" style={{ width: '14px', height: '14px', margin: 0 }} />
                Consulting astral alignments...
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleAskOracle} style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '6px' }}>
            <input
              type="text"
              value={oracleQuery}
              onChange={(e) => setOracleQuery(e.target.value)}
              placeholder={auraData ? `Ask with your ${auraData.aura_color} energy...` : "Ask about destiny or purpose..."}
              style={{
                flex: 1,
                padding: '0.65rem 0.9rem',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={isOracleThinking}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                background: '#fbbf24',
                border: 'none',
                color: '#0f172a',
                fontWeight: '700',
                cursor: isOracleThinking ? 'not-allowed' : 'pointer'
              }}
            >
              Ask
            </button>
          </form>
        </div>
      )}

      {/* Interactive Enlarged Logo Modal */}
      <LogoModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        logoSrc={appLogo}
      />

      {/* Mystic Sanctum Role & Workspace Hub */}
      <RoleSelectionModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        currentRole={user.role || 'User'}
        currentUser={user}
        onSelectRole={(newRole) => {
          handleQuickRoleSwitch(newRole);
          setActiveTab('practitioner');
        }}
      />

      {/* Interactive Reschedule Chat Assistant */}
      <RescheduleChatModal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        appointment={rescheduleAppointment}
        onRescheduled={(updated) => {
          setNotifications(prev => prev.map(n => 
            n.id === 2 ? { ...n, message: `Your Celtic Cross arcana consultation is now rescheduled to: ${updated.time}.` } : n
          ));
        }}
      />
    </div>
  );
};

export default Dashboard;