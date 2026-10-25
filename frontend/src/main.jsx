import React,{useEffect,useState,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {Home,Hand,Layers,Brain,TrendingUp,FileText,User,LogOut,Menu,Search,Shuffle,Upload,ChevronRight,Shield,Users,Settings,Clock,CheckCircle,Download,Eye,Database,Activity,Bell,Plus,Trash2,Edit3,Check,X} from 'lucide-react';
import './styles.css';

const API='http://localhost:8000/api';
const tarot = [
  // Major Arcana - 22
  "The Fool",
  "The Magician",
  "The High Priestess",
  "The Empress",
  "The Emperor",
  "The Hierophant",
  "The Lovers",
  "The Chariot",
  "Strength",
  "The Hermit",
  "Wheel of Fortune",
  "Justice",
  "The Hanged Man",
  "Death",
  "Temperance",
  "The Devil",
  "The Tower",
  "The Star",
  "The Moon",
  "The Sun",
  "Judgement",
  "The World",

  // Wands - 14
  "Ace of Wands",
  "Two of Wands",
  "Three of Wands",
  "Four of Wands",
  "Five of Wands",
  "Six of Wands",
  "Seven of Wands",
  "Eight of Wands",
  "Nine of Wands",
  "Ten of Wands",
  "Page of Wands",
  "Knight of Wands",
  "Queen of Wands",
  "King of Wands",

  // Cups - 14
  "Ace of Cups",
  "Two of Cups",
  "Three of Cups",
  "Four of Cups",
  "Five of Cups",
  "Six of Cups",
  "Seven of Cups",
  "Eight of Cups",
  "Nine of Cups",
  "Ten of Cups",
  "Page of Cups",
  "Knight of Cups",
  "Queen of Cups",
  "King of Cups",

  // Swords - 14
  "Ace of Swords",
  "Two of Swords",
  "Three of Swords",
  "Four of Swords",
  "Five of Swords",
  "Six of Swords",
  "Seven of Swords",
  "Eight of Swords",
  "Nine of Swords",
  "Ten of Swords",
  "Page of Swords",
  "Knight of Swords",
  "Queen of Swords",
  "King of Swords",

  // Pentacles - 14
  "Ace of Pentacles",
  "Two of Pentacles",
  "Three of Pentacles",
  "Four of Pentacles",
  "Five of Pentacles",
  "Six of Pentacles",
  "Seven of Pentacles",
  "Eight of Pentacles",
  "Nine of Pentacles",
  "Ten of Pentacles",
  "Page of Pentacles",
  "Knight of Pentacles",
  "Queen of Pentacles",
  "King of Pentacles"
];
const meanings = {
  // Major Arcana
  "The Fool": "New beginnings, adventure, freedom and trust.",
  "The Magician": "Skill, confidence, action and focused creation.",
  "The High Priestess": "Intuition, reflection, hidden knowledge and patience.",
  "The Empress": "Growth, creativity, care and abundance.",
  "The Emperor": "Structure, leadership, stability and responsibility.",
  "The Hierophant": "Tradition, learning, guidance and established values.",
  "The Lovers": "Connection, values, choices and meaningful relationships.",
  "The Chariot": "Determination, direction, momentum and self-control.",
  "Strength": "Courage, compassion, resilience and inner balance.",
  "The Hermit": "Self-reflection, wisdom and a deliberate pause.",
  "Wheel of Fortune": "Cycles, changing circumstances and new possibilities.",
  "Justice": "Balance, accountability, clarity and fair decisions.",
  "The Hanged Man": "Pause, patience, a new perspective and letting go.",
  "Death": "Transformation, release and transition into a new phase.",
  "Temperance": "Moderation, harmony, patience and healthy integration.",
  "The Devil": "Attachments, patterns, temptation and the need for awareness.",
  "The Tower": "Sudden change, truth and rebuilding on stronger foundations.",
  "The Star": "Hope, inspiration, healing and guidance.",
  "The Moon": "Intuition, uncertainty, dreams and emotional awareness.",
  "The Sun": "Success, joy, vitality and confidence.",
  "Judgement": "Reflection, realization, renewal and an important decision.",
  "The World": "Completion, integration, achievement and a new chapter.",

  // Wands
  "Ace of Wands": "New inspiration, motivation and creative potential.",
  "Two of Wands": "Planning, future possibilities and choosing a direction.",
  "Three of Wands": "Expansion, progress and looking toward future opportunities.",
  "Four of Wands": "Celebration, stability, community and achievement.",
  "Five of Wands": "Competition, different opinions and constructive challenges.",
  "Six of Wands": "Recognition, confidence, progress and achievement.",
  "Seven of Wands": "Persistence, courage and protecting your position.",
  "Eight of Wands": "Fast movement, communication and developing momentum.",
  "Nine of Wands": "Resilience, caution and continuing despite challenges.",
  "Ten of Wands": "Responsibility, workload and the need for balance.",
  "Page of Wands": "Curiosity, enthusiasm and exploring a new idea.",
  "Knight of Wands": "Action, confidence, adventure and strong motivation.",
  "Queen of Wands": "Confidence, creativity, independence and warmth.",
  "King of Wands": "Leadership, vision, ambition and purposeful action.",

  // Cups
  "Ace of Cups": "Emotional renewal, compassion and new emotional possibilities.",
  "Two of Cups": "Connection, partnership, mutual understanding and harmony.",
  "Three of Cups": "Friendship, celebration, support and shared happiness.",
  "Four of Cups": "Reflection, emotional withdrawal and reconsidering opportunities.",
  "Five of Cups": "Disappointment, processing emotions and recognizing what remains.",
  "Six of Cups": "Memories, familiarity, kindness and lessons from the past.",
  "Seven of Cups": "Choices, imagination, possibilities and the need for clarity.",
  "Eight of Cups": "Moving on, emotional growth and searching for deeper meaning.",
  "Nine of Cups": "Satisfaction, gratitude and personal fulfillment.",
  "Ten of Cups": "Emotional harmony, connection and a sense of belonging.",
  "Page of Cups": "Emotional openness, creativity and a gentle new message.",
  "Knight of Cups": "Romance, imagination, emotional expression and following the heart.",
  "Queen of Cups": "Empathy, intuition, emotional awareness and compassion.",
  "King of Cups": "Emotional maturity, calmness, understanding and balanced expression.",

  // Swords
  "Ace of Swords": "Clarity, truth, new ideas and decisive thinking.",
  "Two of Swords": "Uncertainty, balance and the need to make a clear choice.",
  "Three of Swords": "Emotional difficulty, truth and the process of healing.",
  "Four of Swords": "Rest, recovery, reflection and taking a necessary pause.",
  "Five of Swords": "Conflict, differing priorities and learning from disagreements.",
  "Six of Swords": "Transition, moving forward and leaving difficulties behind.",
  "Seven of Swords": "Strategy, independence, discretion and careful planning.",
  "Eight of Swords": "Feeling restricted, self-doubt and the need for a new perspective.",
  "Nine of Swords": "Worry, overthinking and the importance of emotional support.",
  "Ten of Swords": "Completion of a difficult phase and opportunity for renewal.",
  "Page of Swords": "Curiosity, observation, communication and new ideas.",
  "Knight of Swords": "Determination, direct communication and fast action.",
  "Queen of Swords": "Clarity, independence, honesty and thoughtful boundaries.",
  "King of Swords": "Logic, fairness, clear judgment and disciplined thinking.",

  // Pentacles
  "Ace of Pentacles": "New practical opportunity, stability and potential growth.",
  "Two of Pentacles": "Balance, adaptability and managing multiple priorities.",
  "Three of Pentacles": "Teamwork, learning, skill and constructive collaboration.",
  "Four of Pentacles": "Security, control and reconsidering attachment to resources.",
  "Five of Pentacles": "Temporary difficulty, support needs and finding practical solutions.",
  "Six of Pentacles": "Giving, receiving, balance and mutual support.",
  "Seven of Pentacles": "Patience, progress and evaluating long-term results.",
  "Eight of Pentacles": "Practice, dedication, learning and improving skills.",
  "Nine of Pentacles": "Independence, achievement, confidence and personal stability.",
  "Ten of Pentacles": "Long-term stability, family, security and lasting foundations.",
  "Page of Pentacles": "Learning, practical opportunities and starting something useful.",
  "Knight of Pentacles": "Consistency, responsibility, patience and steady progress.",
  "Queen of Pentacles": "Practical care, stability, generosity and groundedness.",
  "King of Pentacles": "Responsibility, financial awareness, stability and long-term planning."
};
const lineInfo=[
 ['Heart Line','Emotional expression and relationships','heart'],['Life Line','Vitality, energy and major life phases','life'],['Head Line','Thinking style, focus and decision-making','head'],['Fate Line','Direction, career themes and purpose','fate'],['Sun Line','Creativity, recognition and expression','sun']
];

const triggerToast = (type, title, message) => {
  window.dispatchEvent(new CustomEvent('app-toast', { detail: { type, title, message } }));
};

function formatApptTime(tStr) {
  if (!tStr) return '';
  const t = tStr.trim().toUpperCase();
  if (t.includes('AM') || t.includes('PM')) return t;
  const parts = t.split(':').map(Number);
  if (parts.length >= 2) {
    let h = parts[0];
    const m = String(parts[1]).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  }
  return tStr;
}

function parseAppointmentDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  try {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    let day = now.getDate();

    let dClean = dateStr.trim();
    if (dClean.toLowerCase() !== 'today') {
      if (dClean.includes('-')) {
        const parts = dClean.split('-').map(Number);
        if (parts.length === 3 && parts[0] > 1000) {
          year = parts[0];
          month = parts[1] - 1;
          day = parts[2];
        }
      } else if (dClean.includes('/')) {
        const parts = dClean.split('/').map(Number);
        if (parts.length === 3) {
          if (parts[0] > 1000) {
            year = parts[0];
            month = parts[1] - 1;
            day = parts[2];
          } else {
            month = parts[0] - 1;
            day = parts[1];
            year = parts[2];
          }
        }
      } else {
        const parsed = new Date(dClean);
        if (!isNaN(parsed.getTime())) {
          year = parsed.getFullYear();
          month = parsed.getMonth();
          day = parsed.getDate();
        }
      }
    }

    let hours = 0, minutes = 0;
    const tClean = timeStr.trim().toUpperCase();
    const isPM = tClean.includes('PM');
    const isAM = tClean.includes('AM');
    const rawTime = tClean.replace(/(AM|PM)/g, '').trim();
    const timeParts = rawTime.split(':').map(Number);

    if (timeParts.length >= 1 && !isNaN(timeParts[0])) hours = timeParts[0];
    if (timeParts.length >= 2 && !isNaN(timeParts[1])) minutes = timeParts[1];

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    return new Date(year, month, day, hours, minutes, 0);
  } catch (e) {
    return null;
  }
}

function getAppointmentStatusInfo(item) {
  if (!item || item.consultation_mode !== 'Appointment') {
    return { status: item?.status || 'Pending', rawStatus: item?.status || 'Pending', isExpired: false, isNow: false, isUpcoming: false, isCompleted: false };
  }

  // Preserve valid Declined status
  if (item.status === 'Declined') {
    return { status: 'Declined', rawStatus: 'Declined', isDeclined: true, isExpired: false, isNow: false, isUpcoming: false, isCompleted: false, reason: item.decline_reason };
  }

  // Preserve valid Completed status
  if (item.status === 'Completed') {
    return { status: 'Completed', rawStatus: 'Completed', isCompleted: true, isExpired: false, isNow: false, isUpcoming: false };
  }

  // Preserve valid Expired status
  if (item.status === 'Expired') {
    return { status: 'Expired', rawStatus: 'Expired', isExpired: true, isNow: false, isUpcoming: false, isCompleted: false };
  }

  const apptDateTime = parseAppointmentDateTime(item.appointment_date, item.appointment_time);
  if (!apptDateTime || isNaN(apptDateTime.getTime())) {
    return { status: item.status || 'Pending', rawStatus: item.status || 'Pending', isExpired: false, isNow: false, isUpcoming: false, isCompleted: false };
  }

  const duration = Number(item.duration || item.duration_minutes || 30);
  const now = new Date();
  const diffMs = now.getTime() - apptDateTime.getTime();
  const diffMins = diffMs / (1000 * 60);

  // If appointment is Accepted
  if (item.status === 'Accepted') {
    if (diffMins < -5) {
      return { status: 'Upcoming', rawStatus: 'Accepted', isUpcoming: true, isNow: false, isCompleted: false, isExpired: false };
    } else if (diffMins >= -5 && diffMins <= duration) {
      return { status: 'In Progress', rawStatus: 'Accepted', isNow: true, isUpcoming: false, isCompleted: false, isExpired: false };
    } else {
      return { status: 'Completed', rawStatus: 'Accepted', isCompleted: true, isNow: false, isUpcoming: false, isExpired: false };
    }
  }

  // If appointment was never accepted (Pending)
  if (item.status === 'Pending' || !item.status) {
    if (diffMins > 0) {
      return { status: 'Expired', rawStatus: 'Pending', isExpired: true, isNow: false, isUpcoming: false, isCompleted: false };
    }
    return { status: 'Pending', rawStatus: 'Pending', isExpired: false, isNow: false, isUpcoming: true, isCompleted: false };
  }

  return { status: item.status, rawStatus: item.status, isExpired: false, isNow: false, isUpcoming: false, isCompleted: false };
}

function getAppointmentBadge(status) {
  switch (status) {
    case 'In Progress':
      return { bg: 'rgba(16, 185, 129, 0.16)', color: '#059669', label: '● In Progress' };
    case 'Upcoming':
      return { bg: 'rgba(59, 130, 246, 0.14)', color: '#2563eb', label: '⏱ Upcoming' };
    case 'Accepted':
      return { bg: 'rgba(34, 197, 94, 0.14)', color: '#16a34a', label: '✓ Accepted' };
    case 'Completed':
      return { bg: 'rgba(107, 114, 128, 0.14)', color: '#4b5563', label: '✓ Completed' };
    case 'Declined':
      return { bg: 'rgba(239, 68, 68, 0.14)', color: '#dc2626', label: '✕ Declined' };
    case 'Expired':
      return { bg: 'rgba(156, 163, 175, 0.14)', color: '#6b7280', label: 'Expired' };
    case 'Pending':
    default:
      return { bg: 'rgba(234, 179, 8, 0.14)', color: '#ca8a04', label: '⏳ Pending' };
  }
}

function isAppointmentDue(apptDate, apptTime) {
  const dummy = { consultation_mode: 'Appointment', appointment_date: apptDate, appointment_time: apptTime, status: 'Accepted' };
  return getAppointmentStatusInfo(dummy).isNow;
}

function ToastNotification({ toast, onClose }) {
  if (!toast) return null;
  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="app-toast-container">
      <div className={`app-toast app-toast-${toast.type || 'info'}`}>
        <div className="app-toast-icon">
          {isSuccess ? <CheckCircle size={20} /> : isError ? <X size={20} /> : <Bell size={20} />}
        </div>
        <div className="app-toast-content">
          <strong>{toast.title}</strong>
          <p>{toast.message}</p>
        </div>
        <button className="app-toast-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
}

function AppointmentDueModal({ appointment, role, onClose, onView }) {
  if (!appointment) return null;
  const isUser = role === 'User';
  const formattedTime = formatApptTime(appointment.appointment_time);
  const dateStr = appointment.appointment_date;
  const meetUrl = appointment.meeting_link || appointment.meet_link;
  const professionalName = appointment.consultant_type || 'Spiritual Consultant';
  const clientName = appointment.user_name || 'Client';

  return (
    <div className="appointment-due-overlay" onClick={onClose}>
      <div className="appointment-due-modal" onClick={e => e.stopPropagation()}>
        <button className="appointment-due-close" onClick={onClose}>×</button>
        <div className="appointment-due-header">
          <div className="appointment-due-icon">🔔</div>
          <div className="appointment-due-badge">
            {isUser ? "GOOGLE MEET APPOINTMENT IS STARTING NOW" : "CLIENT APPOINTMENT STARTING NOW"}
          </div>
        </div>
        <h2>
          {isUser
            ? "Your Google Meet appointment is starting now."
            : `Your Google Meet appointment with ${clientName} is starting now.`
          }
        </h2>
        <p className="appointment-due-subtitle">
          {isUser
            ? `Your consultation with ${professionalName} is scheduled for now.`
            : `Consultation session with client ${clientName} is now starting.`
          }
        </p>
        <div className="appointment-due-card">
          <div className="appointment-due-info">
            <span className="info-label">👤 {isUser ? "Professional" : "Client"}</span>
            <strong className="info-val">{isUser ? professionalName : clientName}</strong>
          </div>
          <div className="appointment-due-info" style={{ marginTop: '8px' }}>
            <span className="info-label">📅 Date</span>
            <strong className="info-val">{dateStr}</strong>
          </div>
          <div className="appointment-due-info" style={{ marginTop: '8px' }}>
            <span className="info-label">🕐 Time</span>
            <strong className="info-val">{formattedTime} (Asia/Kolkata)</strong>
          </div>
          {appointment.focus && (
            <div className="appointment-due-info" style={{ marginTop: '8px' }}>
              <span className="info-label">🎯 Focus</span>
              <strong className="info-val">{appointment.focus}</strong>
            </div>
          )}
          {meetUrl && (
            <div className="appointment-due-info" style={{ marginTop: '8px' }}>
              <span className="info-label">📹 Platform</span>
              <strong className="info-val" style={{ color: '#16a34a' }}>Google Meet</strong>
            </div>
          )}
        </div>
        <div className="appointment-due-actions" style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
          {meetUrl ? (
            <a
              href={meetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="primary"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#16a34a',
                borderColor: '#15803d',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: '600'
              }}
              onClick={onClose}
            >
              📹 Join Google Meet
            </a>
          ) : null}
          <button className="secondary" onClick={() => { if (onView) onView(); onClose(); }}>
            View Appointment Details
          </button>
        </div>
      </div>
    </div>
  );
}

function PageHead({ title, sub }) {
  return (
    <div className="pagehead">
      <div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
    </div>
  );
}

function Empty({ text }) {
  return <div className="empty">{text}</div>;
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '36px', margin: '24px auto', maxWidth: '800px', background: '#ffffff', borderRadius: '16px', border: '1px solid #fee2e2', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', textAlign: 'center' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px' }}>⚠️</div>
          <h2 style={{ color: '#b91c1c', margin: '0 0 8px 0', fontSize: '20px', fontWeight: '700' }}>Something went wrong in this section</h2>
          <p style={{ color: '#6b7280', fontSize: '13.5px', margin: '0 0 18px 0', lineHeight: '1.5' }}>
            {this.state.error?.message || 'An unexpected rendering error occurred. Your session is safe.'}
          </p>
          <button
            className="primary"
            style={{ fontSize: '13px', padding: '9px 20px', cursor: 'pointer', borderRadius: '8px' }}
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Retry View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App(){const [role,setRole]=useState(null),[user,setUser]=useState(null),[register,setRegister]=useState(false),[page,setPage]=useState('dashboard'); if(!role)return <RoleSelect onSelect={setRole}/>; if(!user&&!register)return <Login role={role} onBack={()=>setRole(null)} onRegister={()=>setRegister(true)} onLogin={u=>{setUser(u);setPage(role==='Administrator'?'admin':'dashboard')}}/>; if(!user&&register)return <Register role={role} onBack={()=>setRegister(false)} onRegistered={u=>{setUser(u);setPage(role==='Administrator'?'admin':'dashboard')}}/>; return <Shell user={user} page={page} setPage={setPage} logout={()=>{setUser(null);setRole(null);setRegister(false);setPage('dashboard');try{localStorage.clear();}catch(e){}}}/>}
function RoleSelect({onSelect}){return <div className="role-page"><div className="stars">✦　☾　✧　☽　✦</div><div className="brand top"><div className="logo">✣</div><div><b>AI Palmistry & Tarot</b><small>Intelligence Platform</small></div><div className="toplinks">Home　 About　 Contact</div></div><div className="hero"><div className="moon">☾</div><h1>Discover Yourself<br/>Through Ancient Wisdom<br/>and Modern AI</h1><p>Choose your role to continue</p><div className="roles">{['User','Tarot Reader','Spiritual Consultant','Administrator'].map((r,i)=><button key={r} className="role-card" onClick={()=>onSelect(r)}><div className="role-icon">{i===0?'♙':i===1?'♧':i===2?'✣':'♙'}</div><strong>{r}</strong><span>{i===0?'Personal readings':i===1?'Create & read tarot':i===2?'Guide and analyse':'Manage platform'}</span></button>)}</div><div className="ancient">AI Meets Ancient Wisdom　|　Personalized Guidance　|　A Better You</div></div></div>}
function Login({role,onBack,onRegister,onLogin}){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');

  const submit=async e=>{
    e.preventDefault();
    setBusy(true);
    setError('');
    try{
      const body=new URLSearchParams({email,password,role});
      const r=await fetch(API+'/auth/login',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(d.detail||'Login failed');
      onLogin({ ...d.user, token: d.token });
    }catch(err){
      setError(err.message || 'Backend connection failed. Make sure the backend is running on port 8000.');
    }finally{
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-brand brand">
        <div className="logo">✣</div>
        <div><b>AI Palmistry & Tarot</b><small>Intelligence Platform</small></div>
      </div>
      <button className="back" onClick={onBack}>‹ Back to Roles</button>
      <div className="login-grid">
        <form className="login-card" onSubmit={submit}>
          <div className="avatar">♙</div>
          <h2>{role} Login</h2>
          <p>Access your personalized palmistry and tarot insights</p>

          <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></label>
          <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" required/></label>
          <label className="remember"><input type="checkbox" defaultChecked/> Remember me</label>
          {error&&<div className="error">{error}</div>}
          <button className="primary" disabled={busy}>{busy?'Signing in...':'◉ Login'}</button>
          <small>Don't have an account? <button type="button" className="linkbtn" onClick={onRegister}>Register</button></small>
        </form>
        <div className="quote">“Your Hands Hold<br/>a Story<br/><i>Let’s Discover It<br/>Together</i>”<div>♧</div></div>
      </div>
    </div>
  );
}
function Register({role,onBack,onRegistered}){const [name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');const submit=async e=>{e.preventDefault();setError('');if(password!==confirm){setError('Passwords do not match.');return}setBusy(true);try{const body=new URLSearchParams({name,email,password,role});const r=await fetch(API+'/auth/register',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});const d=await r.json();if(!r.ok)throw new Error(d.detail||'Registration failed');onRegistered(d.user)}catch(err){setError(err.message||'Registration failed. Make sure the backend is running on port 8000.')}finally{setBusy(false)}};return <div className="login-page"><div className="login-brand brand"><div className="logo">✣</div><div><b>AI Palmistry & Tarot</b><small>Intelligence Platform</small></div></div><button className="back" onClick={onBack}>‹ Back to Login</button><div className="login-grid"><form className="login-card" onSubmit={submit}><div className="avatar">♙</div><h2>Create Account</h2><p>Register as {role} and start your personalized experience</p><label>Full Name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" required/></label><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} required/></label><label>Confirm Password<input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required/></label>{error&&<div className="error">{error}</div>}<button className="primary" disabled={busy}>{busy?'Creating account...':'Create Account'}</button><small>Already have an account? <button type="button" className="linkbtn" onClick={onBack}>Login</button></small></form><div className="quote">“Your Hands Hold<br/>a Story<br/><i>Let’s Discover It<br/>Together</i>”<div>♧</div></div></div></div>}
function Shell({user,page,setPage,logout}){
 const role=user.role;
 const [showNotifs, setShowNotifs] = useState(false);
 const [notifications, setNotifications] = useState([]);
 const [unreadCount, setUnreadCount] = useState(0);
 const [toast, setToast] = useState(null);
 const [dueAppointment, setDueAppointment] = useState(null);
 const [showUserMenu, setShowUserMenu] = useState(false);
 const userMenuRef = useRef(null);

 useEffect(() => {
   const handleOutsideClick = (e) => {
     if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
       setShowUserMenu(false);
     }
   };
   if (showUserMenu) {
     document.addEventListener('mousedown', handleOutsideClick);
   }
   return () => document.removeEventListener('mousedown', handleOutsideClick);
 }, [showUserMenu]);

 const recipient = role === 'Spiritual Consultant' ? 'Spiritual Consultant' : user.name;

 const loadNotifications = () => {
   fetch(`${API}/notifications/${encodeURIComponent(recipient)}`)
     .then(r => r.json())
     .then(d => {
       setNotifications(Array.isArray(d.notifications) ? d.notifications : []);
       setUnreadCount(d.unread_count || 0);
     })
     .catch(() => {});
 };

 useEffect(() => {
   loadNotifications();
   const interval = setInterval(loadNotifications, 12000);
   return () => clearInterval(interval);
 }, [recipient]);

 useEffect(() => {
   const handleToastEvent = (e) => {
     if (e.detail) {
       setToast({
         id: Date.now(),
         type: e.detail.type || 'info',
         title: e.detail.title || '',
         message: e.detail.message || ''
       });
     }
   };
   window.addEventListener('app-toast', handleToastEvent);
   return () => window.removeEventListener('app-toast', handleToastEvent);
 }, []);

 useEffect(() => {
   if (!toast) return;
   const timer = setTimeout(() => setToast(null), 5000);
   return () => clearTimeout(timer);
 }, [toast]);

 useEffect(() => {
   if (!user || !user.role) return;

   const checkAppointments = async () => {
     try {
       let endpoint = '';
       if (role === 'User') {
         endpoint = `${API}/user-consultations/${encodeURIComponent(user.name)}`;
       } else if (role === 'Spiritual Consultant') {
         endpoint = `${API}/consultations/Spiritual%20Consultant`;
       } else if (role === 'Tarot Reader') {
         endpoint = `${API}/consultations/${encodeURIComponent(user.name || 'Tarot Reader')}`;
       } else {
         return;
       }

       const res = await fetch(endpoint);
       if (!res.ok) return;
       const list = await res.json();
       if (!Array.isArray(list)) return;

       const storageKey = `shown_appts_${role}_${user.name || 'user'}`;
       const shownStr = sessionStorage.getItem(storageKey) || '[]';
       const shownIds = new Set(JSON.parse(shownStr));

       for (const item of list) {
         if (item.consultation_mode === 'Appointment') {
           if (item.status !== 'Accepted') continue;
           
           if (role === 'User' && item.user_name?.toLowerCase() !== user.name?.toLowerCase()) {
             continue;
           }

           const statusInfo = getAppointmentStatusInfo(item);
           if (statusInfo.isNow) {
             if (!shownIds.has(item.id)) {
               shownIds.add(item.id);
               sessionStorage.setItem(storageKey, JSON.stringify(Array.from(shownIds)));
               setDueAppointment(item);
               break;
             }
           }
         }
       }
     } catch (err) {
       console.error('Error checking appointments:', err);
     }
   };

   checkAppointments();
   const apptInterval = setInterval(checkAppointments, 12000);
   return () => clearInterval(apptInterval);
 }, [user, role]);

 const markRead = () => {
   const fd = new FormData();
   fd.append('recipient', recipient);
   fetch(`${API}/notifications/mark-read`, { method: 'POST', body: fd })
     .then(() => {
       setUnreadCount(0);
       setNotifications(prev => prev.map(n => ({ ...n, read: true })));
     });
 };

 const navByRole={
  'User':[
  ['dashboard','Dashboard',Home],
  ['palm','Palm Reading',Hand],
  ['tarot','Tarot Reading',Layers],
  ['spiritual-consultation','Spiritual Consultation',Users],
  ['insights','AI Insights',Brain],
  ['trends','Life Trends',TrendingUp],
  ['reports','Reports',FileText],
  ['history','Reading History',Clock],
  ['profile','My Profile',User]
],
  'Tarot Reader':[['dashboard','Dashboard',Home],['tarot','Tarot Reading',Layers],['clients','Client Readings',Users],['analytics','Reading Analytics',TrendingUp],['reports','Reports',FileText],['profile','My Profile',User]],
  'Spiritual Consultant':[['dashboard','Dashboard',Home],['client-trends','User Trends',TrendingUp],['insights','AI Insights',Brain],['recommendations','Recommendations',CheckCircle],['reports','Reports',FileText],['profile','My Profile',User]],
  'Administrator':[['admin','Dashboard',Home],['users','Users',Users],['roles','Roles',Shield],['readings','Reading Data',FileText],['appointments','Appointments',Clock],['activity-logs','Activity Logs',Activity],['system-reports','System Reports',FileText],['system','System Info',Settings]]
 };
 const nav=navByRole[role]||navByRole.User;
 const content=()=>{
  if(role==='Administrator') return <>{page==='admin'&&<Admin go={setPage}/>}{['users','roles','readings','appointments','activity-logs','system-reports','system'].includes(page)&&<AdminSection page={page}/>}</>;
  if(page==='dashboard') return role==='Tarot Reader'?<ReaderDashboard user={user} go={setPage}/>:role==='Spiritual Consultant'?<ConsultantDashboard user={user} go={setPage}/>:<Dashboard user={user} go={setPage}/>;
  if(page==='palm') return <Palm user={user}/>;
 if(page==='tarot') {
  if(role === 'Tarot Reader') {
    return <TarotReaderTarot user={user}/>;
  }

  return <Tarot user={user}/>;
}
  if(page==='spiritual-consultation') {
    return <SpiritualConsultation user={user}/>;
  }
  if(page==='insights') {
  if(role === 'Spiritual Consultant') {
    return <ConsultantInsights user={user}/>;
  }
  return <Insights user={user}/>;
}
  if(page==='trends')
    return <Trends user={user} key={user?.name || user?.email || 'anon'}/>;
  if(page==='client-trends')
    return <ConsultantTrends user={user} key={user?.name || user?.email || 'anon'}/>;
if(page==='recommendations') {
  if(role === 'Spiritual Consultant') {
    return <ConsultantRecommendations user={user} key={user?.name || user?.email || 'anon'}/>;
  }
  return <Recommendations user={user} key={user?.name || user?.email || 'anon'}/>;
}
if(page==='clients') return <ClientReadings user={user} key={user?.name || user?.email || 'anon'}/>;
if(page==='analytics') return <ReaderAnalytics user={user} key={user?.name || user?.email || 'anon'}/>;
 if(page==='history') return <History user={user} key={user?.name || user?.email || 'anon'}/>; 
if(page==='profile') {
  if(role === 'Tarot Reader') {
    return <TarotReaderProfile user={user}/>;
  }

  if(role === 'Spiritual Consultant') {
    return <SpiritualConsultantProfile user={user}/>;
  }

  return <Profile user={user}/>;
}

if(page==='reports') {
  if (role === 'Tarot Reader') {
    return <TarotReaderReports user={user} key={user?.name || user?.email || 'anon'} />;
  }

  if (role === 'Spiritual Consultant') {
    return <ConsultantReports user={user} key={user?.name || user?.email || 'anon'} />;
  }

  return <Reports user={user} key={user?.name || user?.email || 'anon'} />;
}
  return <Empty text="Select a module from the sidebar."/>;
 };
 return <div className="app">
  <ToastNotification toast={toast} onClose={() => setToast(null)} />
  <AppointmentDueModal appointment={dueAppointment} role={role} onClose={() => setDueAppointment(null)} onView={() => { setDueAppointment(null); setPage('dashboard'); }} />
  <aside>
  <div className="sidebrand">
  <div className="logo">✣</div>

  <div>
    <b>AI Palmistry & Tarot</b>
    <small>Intelligence Platform</small>
  </div>
</div>

<div className={`sidebar-role ${role === 'Administrator' ? 'sidebar-role-admin' : ''}`}>
  {role === 'Tarot Reader' && '🔮 TAROT READER'}
  {role === 'Spiritual Consultant' && '✨ SPIRITUAL CONSULTANT'}
  {role === 'Administrator' && '🛡️ ADMINISTRATOR'}
  {role === 'User' && '👤 USER'}
</div>{nav.map(([id,label,I])=><button className={page===id?'active':''} key={id} onClick={()=>setPage(id)}><I size={15}/>{label}</button>)}<button className="logout" onClick={logout}><LogOut size={15}/>Logout</button></aside><main><header><div className="search"><Search size={15}/> <input placeholder="Search..."/></div><div style={{display:'flex',alignItems:'center',gap:'15px',position:'relative'}}><div style={{position:'relative'}}><button onClick={()=>{setShowNotifs(!showNotifs);if(!showNotifs)loadNotifications();}} style={{background:'none',border:'none',cursor:'pointer',padding:'8px',color:'#7654d8',display:'flex',alignItems:'center',position:'relative'}} title="In-App Notifications"><Bell size={20}/>{unreadCount > 0 && <span style={{position:'absolute',top:'0',right:'0',background:'#e53e3e',color:'#fff',borderRadius:'50%',width:'18px',height:'18px',fontSize:'11px',fontWeight:'bold',display:'flex',alignItems:'center',justifyContent:'center'}}>{unreadCount}</span>}</button>{showNotifs && <div style={{position:'absolute',top:'45px',right:'0',width:'360px',maxHeight:'480px',overflowY:'auto',background:'#ffffff',borderRadius:'16px',boxShadow:'0 10px 30px rgba(0,0,0,0.15)',border:'1px solid #e7ddff',zIndex:1000,padding:'16px'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px',borderBottom:'1px solid #eee',paddingBottom:'10px'}}><h4 style={{margin:0,fontSize:'15px',color:'#333'}}>Notifications</h4>{unreadCount > 0 && <button onClick={markRead} style={{background:'none',border:'none',color:'#7654d8',fontSize:'12px',cursor:'pointer',fontWeight:'600'}}>Mark all read</button>}</div>{notifications.length === 0 ? <div style={{padding:'20px',textAlign:'center',color:'#888',fontSize:'13px'}}>No notifications yet.</div> : notifications.map(n => <div key={n.id} style={{padding:'12px',borderRadius:'10px',background:n.read?'#fafafa':'#f4efff',marginBottom:'8px',border:'1px solid '+(n.read?'#eee':'#d8c7ff')}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}><strong style={{fontSize:'13px',color:'#2b1b54'}}>{n.title}</strong><small style={{fontSize:'11px',color:'#888'}}>{n.created_at ? new Date(n.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : ''}</small></div><p style={{margin:'4px 0',fontSize:'12px',color:'#555',lineHeight:'1.4'}}>{n.message}</p>{n.metadata?.date && <div style={{marginTop:'6px',fontSize:'11px',background:'#ffffff',padding:'4px 8px',borderRadius:'6px',color:'#666',border:'1px solid #e5e0f5'}}>📅 Date: {n.metadata.date} | Time: {n.metadata.time || 'TBD'}</div>}</div>)}</div>}</div>{role === 'Administrator' && <div className="admin-header-pill"><Shield size={14}/><span>Administrator</span></div>}<div className="userpill" ref={userMenuRef} style={{ position: 'relative' }}>
  <span>{user.name.slice(0,1).toUpperCase()}</span>
  <div>
    <b>{user.name}</b>
    <small>{user.role}</small>
  </div>
  <button
    id="top-hamburger-menu-btn"
    aria-label="User account menu"
    onClick={() => setShowUserMenu(!showUserMenu)}
    style={{
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      color: '#6b7280',
      transition: 'background 0.2s'
    }}
    title="Account Options"
  >
    <Menu size={16}/>
  </button>
  {showUserMenu && (
    <div
      className="user-dropdown-menu"
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: '210px',
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        border: '1px solid #e7ddff',
        padding: '8px 0',
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ padding: '8px 16px 10px', borderBottom: '1px solid #f1f1f5' }}>
        <div style={{ fontWeight: '700', fontSize: '13px', color: '#1e1932', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {user.name}
        </div>
        <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '600', marginTop: '2px' }}>
          {user.role}
        </div>
      </div>
      {role !== 'Administrator' && (
        <button
          onClick={() => { setShowUserMenu(false); setPage('profile'); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            color: '#374151',
            fontSize: '13px',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
            transition: 'background 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f8f6fc'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <User size={15} color="#6b7280"/>
          <span>My Profile</span>
        </button>
      )}
      <button
        id="top-menu-logout-btn"
        onClick={() => { setShowUserMenu(false); logout(); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 16px',
          background: 'none',
          border: 'none',
          color: '#dc2626',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          textAlign: 'left',
          width: '100%',
          borderTop: '1px solid #f1f1f5',
          marginTop: '4px',
          transition: 'background 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <LogOut size={15} color="#dc2626"/>
        <span>Logout</span>
      </button>
    </div>
  )}
</div></div></header><div className="content"><ErrorBoundary>{content()}</ErrorBoundary></div></main></div>
}
function Dashboard({user,go}) {

  const [consultations, setConsultations] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    recentReadings: 0,
    lifeTrendScore: 0,
    insightScore: 0,
    readingStatus: 'No Reading'
});
useEffect(() => {

  const loadDashboardStats = async () => {

    try {

      const authHeaders = user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};
      const uParam = user?.name ? `?user_name=${encodeURIComponent(user.name)}` : '';
      const [insightRes, trendRes, historyRes] =
        await Promise.all([
          fetch(API + '/insights' + uParam, { headers: authHeaders }),
          fetch(API + '/life-trends' + uParam, { headers: authHeaders }),
          fetch(API + '/history' + uParam, { headers: authHeaders })
        ]);

      const insights = await insightRes.json();
      const trends = await trendRes.json();
      const history = await historyRes.json();

      const recentReadings =
        Array.isArray(history?.items)
          ? history.items.length
          : 0;

      const insightScore =
        Number(insights?.score || 0);

      const trendScores =
        Array.isArray(trends?.scores)
          ? trends.scores
          : [];

      const lifeTrendScore =
        trendScores.length
          ? Math.round(
              trendScores.reduce(
                (sum, value) => sum + Number(value || 0),
                0
              ) / trendScores.length
            )
          : 0;

      setDashboardStats({
        recentReadings,
        lifeTrendScore,
        insightScore,
        readingStatus:
          insightScore > 0 || recentReadings > 0
            ? 'Active'
            : 'No Reading'
      });

    } catch (error) {

      console.error(
        'Dashboard stats error:',
        error
      );

    }

  };

  loadDashboardStats();

}, [user?.name, user?.token]);

  const [tick, setTick] = useState(0);

  const fetchUserConsultations = () => {
    if (!user?.name) return;
    const authHeaders = user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};
    fetch(`${API}/user-consultations/${encodeURIComponent(user.name)}`, { headers: authHeaders })
      .then(r => r.json())
      .then(data => {
        setConsultations(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setConsultations([]);
      });
  };

  useEffect(() => {
    fetchUserConsultations();
    const timer = setInterval(() => setTick(t => t + 1), 15000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchUserConsultations();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user?.name]);
    const questionConsultations = consultations.filter(
    item => item.consultation_mode !== 'Appointment'
  );

  const appointmentConsultations = consultations.filter(
    item => item.consultation_mode === 'Appointment'
  );

  return (
    <>
      <div className="welcome">
        <div>
          <h1>Welcome, {user.name}!</h1>
          <p>
            Explore your personalized spiritual insights through
            AI-powered palmistry and tarot experiences.
          </p>
        </div>

        <div className="sun">☀</div>
      </div>

      <h2 className="section-title">Explore Your Journey</h2>

      <div className="tiles">

        <Tile
          icon={<Hand/>}
          title="Palm Reading"
          text="Upload your palm and discover the hidden lines and patterns."
          onClick={() => go('palm')}
        />

        <Tile
          icon={<Layers/>}
          title="Tarot Reading"
          text="Shuffle the deck, choose cards and receive an interpretation."
          onClick={() => go('tarot')}
        />

        <Tile
          icon={<Brain/>}
          title="AI Insights"
          text="Explore personality insights, strengths and recommendations."
          onClick={() => go('insights')}
        />

      </div>

      <div className="stats">

  <Stat
    title="Recent Readings"
    value={dashboardStats.recentReadings}
  />

  <Stat
    title="Life Trend Score"
    value={`${dashboardStats.lifeTrendScore}%`}
    progress
  />

  <Stat
    title="Insight Score"
    value={`${dashboardStats.insightScore}%`}
  />

  <Stat
    title="Reading Status"
    value={dashboardStats.readingStatus}
  />

</div>

      <div className="mini-grid">

        <Mini
          icon={<TrendingUp/>}
          t="Life Trends"
          d="View your reading-based growth patterns."
        />

        <Mini
          icon={<FileText/>}
          t="Reports"
          d="Generate downloadable palm, tarot and personality reports."
        />

        <Mini
          icon={<Clock/>}
          t="Reading History"
          d="Review your previous sessions and insights."
        />

      </div>


      {/* MY CONSULTATIONS */}

      <div className="user-consultations">

        <div className="consultations-header">
          <div>
            <h2>My Consultations</h2>
            <p>
              View your questions and responses from Tarot Readers
              and Spiritual Consultants.
            </p>
          </div>

          <span className="consultation-count">
            {consultations.length} Request
            {consultations.length !== 1 ? 's' : ''}
          </span>
        </div>


        {consultations.length === 0 ? (

          <div className="no-consultations">
            <div className="empty-icon">✦</div>

            <h3>No consultations yet</h3>

            <p>
              Ask a Tarot Reader or Spiritual Consultant from your
              tarot reading to receive personalized guidance.
            </p>
          </div>

        ) : (

          <div className="consultation-list">

            {questionConsultations.map((item) => (

              <div
                className="user-consultation-card"
                key={item.id}
              >

                <div className="consultation-card-top">

                  <div>
                    <span className="consultant-type">
                      {item.consultant_type}
                    </span>

                    <h3>
                      {item.question}
                    </h3>
                  </div>

                  <span
                    className={
                      item.status === 'Answered'
                        ? 'consultation-status answered'
                        : 'consultation-status pending'
                    }
                  >
                    {item.status || 'Pending'}
                  </span>

                </div>


                <div className="consultation-details">

                  <span>
                    <strong>Focus:</strong> {item.focus}
                  </span>

                  <span>
                    <strong>Spread:</strong> {item.spread}
                  </span>

                  <span>
                    <strong>Cards:</strong>{' '}
                    {item.cards?.join(' · ') || '—'}
                  </span>

                </div>


                {item.reply ? (

                  <div className="consultant-reply">

                    <div className="reply-title">
                      ✦ Consultant's Reply
                    </div>

                    <p>
                      {item.reply}
                    </p>

                  </div>

                ) : (

                  <div className="waiting-reply">

                    <span>◷</span>

                    <div>
                      <strong>Waiting for response</strong>

                      <p>
                        Your question has been received.
                        The {item.consultant_type || 'consultant'}
                        will respond soon.
                      </p>
                    </div>

                  </div>

                )}

              </div>

            ))}

          </div>

        )}
                {/* APPOINTMENT REQUESTS */}

        {appointmentConsultations.length > 0 && (

          <div className="consultation-list">

            <h2 className="consultation-section-title">
              📅 Appointment Requests
            </h2>

            {appointmentConsultations.map((item) => {
              const statusInfo = getAppointmentStatusInfo(item);
              const effStatus = statusInfo.status;
              const badge = getAppointmentBadge(effStatus);
              const meetUrl = item.meeting_link || item.meeting_url;

              return (
                <div
                  className="user-consultation-card"
                  key={item.id}
                >
                  <div className="consultation-card-top">
                    <div>
                      <span className="consultant-type">
                        📅 {item.consultant_type || 'Spiritual Consultant'}
                      </span>
                      <h3>
                        Appointment Request
                      </h3>
                    </div>

                    <span
                      className={`consultation-status status-${effStatus.toLowerCase().replace(/\s+/g, '-')}`}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '13px',
                        background: badge.bg,
                        color: badge.color
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="consultation-details">
                    <span>
                      <strong>Topic:</strong>{' '}
                      {item.focus || 'Personal Guidance'}
                    </span>
                    <span>
                      <strong>Date:</strong>{' '}
                      {item.appointment_date || 'Not specified'}
                    </span>
                    <span>
                      <strong>Time:</strong>{' '}
                      {formatApptTime(item.appointment_time) || 'Not specified'}
                    </span>
                  </div>

                  {item.details && (
                    <div className="consultation-question">
                      <strong>
                        Additional Details
                      </strong>
                      <p>
                        {item.details}
                      </p>
                    </div>
                  )}

                  {['Accepted', 'Upcoming', 'In Progress', 'Completed'].includes(effStatus) ? (
                    <div className="meet-box" style={{ marginTop: '12px', padding: '14px', borderRadius: '12px', background: effStatus === 'In Progress' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(34, 197, 94, 0.08)', border: effStatus === 'In Progress' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(34, 197, 94, 0.25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '700', color: effStatus === 'In Progress' ? '#059669' : '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          📹 Meeting Platform: Google Meet
                        </span>
                        <span style={{ background: getAppointmentBadge(effStatus).color, color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                          {effStatus}
                        </span>
                      </div>
                      <div style={{ fontSize: '13.5px', color: '#374151', marginBottom: '8px', lineHeight: '1.6' }}>
                        <div><strong>Professional:</strong> {item.consultant_type || 'Spiritual Consultant'}</div>
                        <div><strong>Date:</strong> {item.appointment_date}</div>
                        <div><strong>Time:</strong> {formatApptTime(item.appointment_time)} (Asia/Kolkata)</div>
                        {(item.meeting_link || item.meeting_url) ? (
                          <div style={{ marginTop: '6px' }}>
                            <strong>Meeting Link:</strong>{' '}
                            <a href={item.meeting_link || item.meeting_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', wordBreak: 'break-all' }}>
                              {item.meeting_link || item.meeting_url}
                            </a>
                          </div>
                        ) : (
                          <div style={{ marginTop: '6px', color: '#854d0e', background: '#fefce8', padding: '6px 10px', borderRadius: '6px', fontSize: '12.5px' }}>
                            {effStatus === 'Completed'
                              ? 'This appointment has concluded.'
                              : 'Meeting link will appear here once shared by your Spiritual Consultant.'}
                          </div>
                        )}
                      </div>
                      {(item.meeting_link || item.meeting_url) && effStatus !== 'Completed' && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                          <a
                            href={item.meeting_link || item.meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="primary"
                            style={{
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: effStatus === 'In Progress' ? '#059669' : '#16a34a',
                              borderColor: effStatus === 'In Progress' ? '#047857' : '#15803d',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              fontWeight: '600'
                            }}
                          >
                            📹 {effStatus === 'In Progress' ? 'Join Google Meet (Session In Progress)' : 'Join Google Meet'}
                          </a>
                          <button
                            className="secondary"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 14px',
                              fontSize: '13px'
                            }}
                            onClick={() => {
                              const targetLink = item.meeting_link || item.meeting_url;
                              if (navigator.clipboard) {
                                navigator.clipboard.writeText(targetLink);
                                triggerToast('success', 'Link Copied', 'Google Meet URL copied to clipboard.');
                              } else {
                                triggerToast('info', 'Meeting Link', targetLink);
                              }
                            }}
                          >
                            📋 Copy Link
                          </button>
                        </div>
                      )}
                    </div>
                  ) : effStatus === 'Declined' ? (
                    <div
                      className="consultant-decline-box"
                      style={{
                        marginTop: '12px',
                        padding: '12px 14px',
                        background: 'rgba(239, 68, 68, 0.08)',
                        borderRadius: '10px',
                        borderLeft: '4px solid #ef4444'
                      }}
                    >
                      <strong style={{ color: '#dc2626', display: 'block', marginBottom: '4px', fontSize: '13.5px' }}>
                        Appointment Declined
                      </strong>
                      <p style={{ margin: 0, fontSize: '13.5px', color: '#1f2937' }}>
                        <strong>Reason:</strong> {item.decline_reason || 'No reason specified'}
                      </p>
                    </div>
                  ) : item.reply ? (
                    <div className="consultant-reply">
                      <div className="reply-title">
                        ✦ Consultant's Response
                      </div>
                      <p>
                        {item.reply}
                      </p>
                    </div>
                  ) : (
                    <div className="waiting-reply">
                      <span>◷</span>
                      <div>
                        <strong>
                          Appointment Status: {effStatus}
                        </strong>
                        <p>
                          {effStatus === 'Expired'
                            ? 'This appointment request has expired.'
                            : 'Your appointment request has been sent to the professional. You will receive a response soon.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

          </div>

        )}

      </div>

    </>
  );
}
function ReaderDashboard({user,go}) {
  const [consultations, setConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [reply, setReply] = useState('');
  const [tick, setTick] = useState(0);

  const loadConsultations = async () => {
    try {
      const response = await fetch(API + '/consultations/Tarot%20Reader');
      if (!response.ok) throw new Error('Failed to load consultations');
      const data = await response.json();
      setConsultations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading tarot reader requests:', error);
      setConsultations([]);
    }
  };

  useEffect(() => {
    loadConsultations();
    const timer = setInterval(() => setTick(t => t + 1), 15000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadConsultations();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const sendReply = async () => {
    if (!selectedConsultation || !reply.trim()) return;
    try {
      const response = await fetch(API + `/consultations/${selectedConsultation.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: reply })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to send reply');
      setConsultations(prev =>
        prev.map(item =>
          item.id === selectedConsultation.id
            ? { ...item, reply: reply, status: 'Answered' }
            : item
        )
      );
      setSelectedConsultation(null);
      setReply('');
      triggerToast('success', 'Success', 'Reply sent successfully.');
    } catch (error) {
      console.error(error);
      triggerToast('error', 'Error', 'Unable to send reply. Please try again.');
    }
  };

  const questionRequests = consultations.filter(item => item.consultation_mode !== 'Appointment');
  const totalQuestions = questionRequests.length;
  const pendingQuestions = questionRequests.filter(item => !item.reply && item.status !== 'Answered').length;
  const answeredQuestions = questionRequests.filter(item => item.reply || item.status === 'Answered').length;
  const responseRate = totalQuestions ? Math.round((answeredQuestions / totalQuestions) * 100) : 100;

  return (
    <>
      <div className="welcome">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#7654d8', letterSpacing: '0.8px' }}>
              🔮 TAROT READER DASHBOARD
            </span>
          </div>
          <h1>Welcome, {user.name}!</h1>
          <p>Manage tarot readings, review client questions, and provide personalized tarot guidance.</p>
        </div>
        <div className="sun">✦</div>
      </div>

      <h2 className="section-title">Reader Overview</h2>
      <div className="stats">
        <Stat title="Total Questions" value={totalQuestions} sub="Client questions received" />
        <Stat title="Pending Questions" value={pendingQuestions} sub="Awaiting your response" />
        <Stat title="Answered" value={answeredQuestions} sub="Guidance provided" />
        <Stat title="Response Rate" value={`${responseRate}%`} sub="Client support rate" />
      </div>

      <h2 className="section-title">Quick Actions</h2>
      <div className="tiles">
        <Tile icon={<Layers/>} title="Create Tarot Reading" text="Start a new tarot reading by selecting the reading focus, spread and cards." onClick={() => go('tarot')} />
        <Tile icon={<Users/>} title="Client Readings" text="View previous client readings, selected cards and personalized interpretations." onClick={() => go('clients')} />
        <Tile icon={<TrendingUp/>} title="Reading Analytics" text="Track reading activity, popular spreads and overall tarot reading statistics." onClick={() => go('analytics')} />
        <Tile icon={<FileText/>} title="Reading Reports" text="Review completed tarot reports and generate detailed PDF reports." onClick={() => go('reports')} />
      </div>

      {/* CLIENT QUESTIONS */}
      <div className="consultation-dashboard">
        <div className="consultation-dashboard-header">
          <div>
            <h2>💬 Client Questions</h2>
            <p>Questions submitted by clients who want personalized tarot guidance.</p>
          </div>
          <span className="request-count">{pendingQuestions} Pending</span>
        </div>

        {questionRequests.length === 0 ? (
          <div className="no-consultations">
            <p>No client questions yet.</p>
          </div>
        ) : (
          <div className="consultation-request-list">
            {questionRequests.map(item => (
              <div className="consultation-request-card" key={item.id}>
                <div className="consultation-request-top">
                  <div>
                    <strong>Tarot Consultation</strong>
                    <span>{item.focus || 'General Guidance'} · {item.spread || 'Tarot Reading'}</span>
                  </div>
                  <span className="status">{item.reply ? 'Answered' : item.status || 'Pending'}</span>
                </div>

                <div className="consultation-question">
                  <strong>Client's Question</strong>
                  <p>{item.question || 'No question provided.'}</p>
                </div>

                <div className="consultation-cards">
                  <strong>Selected Cards</strong>
                  <p>{item.cards?.length ? item.cards.join(' · ') : 'Cards not available'}</p>
                </div>

                {item.reply && (
                  <div className="consultation-existing-reply">
                    <strong>Your Guidance</strong>
                    <p>{item.reply}</p>
                  </div>
                )}

                <button
                  className="primary"
                  onClick={() => {
                    setSelectedConsultation(item);
                    setReply(item.reply || '');
                  }}
                >
                  {item.reply ? 'Edit Guidance' : 'Open & Reply'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* REPLY MODAL */}
      {selectedConsultation && (
        <div className="consultation-modal-overlay">
          <div className="consultation-modal">
            <button
              className="consultation-modal-close"
              onClick={() => {
                setSelectedConsultation(null);
                setReply('');
              }}
            >
              ×
            </button>
            <h2>Reply to Client</h2>
            <p>Provide personalized tarot guidance based on the client's question and selected cards.</p>
            <div className="consultation-current-reading">
              <strong>Focus:</strong> {selectedConsultation.focus || 'General Guidance'}<br />
              <strong>Spread:</strong> {selectedConsultation.spread || 'Tarot Reading'}<br />
              <strong>Cards:</strong> {selectedConsultation.cards?.join(' · ') || 'Not available'}
            </div>
            <div className="consultation-question">
              <strong>Client's Question</strong>
              <p>{selectedConsultation.question || 'No question provided.'}</p>
            </div>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write your personalized tarot guidance here..."
              rows={7}
            />
            <div className="consultation-modal-actions">
              <button
                className="secondary"
                onClick={() => {
                  setSelectedConsultation(null);
                  setReply('');
                }}
              >
                Cancel
              </button>
              <button
                className="primary"
                disabled={!reply.trim()}
                onClick={sendReply}
              >
                Send Guidance
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
function ConsultantDashboard({user,go}) {

  const [consultations, setConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [reply, setReply] = useState('');
  const [declineModalItem, setDeclineModalItem] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [declineError, setDeclineError] = useState('');
  const [tick, setTick] = useState(0);

  const loadConsultations = async () => {
    try {
      const response = await fetch(
        API + '/consultations/Spiritual%20Consultant'
      );
      if (!response.ok) {
        throw new Error('Failed to load consultations');
      }
      const data = await response.json();
      setConsultations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        'Error loading consultant requests:',
        error
      );
    }
  };

  useEffect(() => {
    loadConsultations();
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 15000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadConsultations();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const sendReply = async () => {
    if (!selectedConsultation || !reply.trim()) {
      return;
    }
    try {
      const response = await fetch(
        API + `/consultations/${selectedConsultation.id}/reply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            reply: reply
          })
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.detail || 'Failed to send reply'
        );
      }
      setConsultations(prev =>
        prev.map(item =>
          item.id === selectedConsultation.id
            ? {
                ...item,
                reply: reply,
                status: 'Answered'
              }
            : item
        )
      );
      setSelectedConsultation(null);
      setReply('');
      triggerToast('success', 'Success', 'Reply sent successfully.');
    } catch (error) {
      console.error(error);
      triggerToast('error', 'Error', 'Unable to send reply. Please try again.');
    }
  };

  const [manualMeetInputs, setManualMeetInputs] = useState({});
  const [savingMeetId, setSavingMeetId] = useState(null);

  const handleSaveManualMeetLink = async (appointmentId) => {
    const rawLink = manualMeetInputs[appointmentId];
    const link = (rawLink !== undefined ? rawLink : '').trim();
    if (!link) {
      triggerToast('error', 'Link Required', 'Please enter a valid Google Meet link.');
      return;
    }
    if (!link.startsWith('https://') || !link.toLowerCase().includes('meet.google.com/')) {
      triggerToast('error', 'Invalid Link', 'Please enter a valid HTTPS Google Meet URL (e.g. https://meet.google.com/abc-defg-hij).');
      return;
    }
    setSavingMeetId(appointmentId);
    try {
      const res = await fetch(`${API}/consultations/${appointmentId}/meet-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meet_link: link })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to save meeting link');
      triggerToast('success', 'Link Saved', 'Google Meet link saved and shared with user.');
      setConsultations(prev =>
        prev.map(c => c.id === appointmentId ? { ...c, meeting_link: link, meeting_url: link } : c)
      );
      loadConsultations();
    } catch (err) {
      console.error(err);
      triggerToast('error', 'Save Failed', err.message || 'Unable to save meeting link.');
    } finally {
      setSavingMeetId(null);
    }
  };

  const handleAcceptAppointment = async (item) => {
    try {
      const res = await fetch(
        API + `/consultations/${item.id}/appointment-response`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Accepted' })
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to accept appointment');
      }
      const meetUrl = data.consultation?.meeting_url || data.consultation?.meeting_link || data.item?.meeting_link || data.item?.meeting_url;
      setConsultations(prev =>
        prev.map(c => c.id === item.id ? {
          ...c,
          status: 'Accepted',
          meeting_link: meetUrl || c.meeting_link,
          meeting_url: meetUrl || c.meeting_url
        } : c)
      );
      triggerToast('success', 'Appointment Accepted', 'Appointment accepted. You can now paste and save a Google Meet link for the client.');
      loadConsultations();
    } catch (err) {
      console.error(err);
      triggerToast('error', 'Error', err.message || 'Unable to accept appointment. Please try again.');
    }
  };

  const handleDeclineSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!declineModalItem) return;
    if (!declineReason.trim()) {
      setDeclineError('Please provide a reason for declining this appointment.');
      return;
    }
    setDeclineError('');
    try {
      const res = await fetch(
        API + `/consultations/${declineModalItem.id}/appointment-response`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'Declined',
            reason: declineReason.trim()
          })
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to decline appointment');
      }
      setConsultations(prev =>
        prev.map(c => c.id === declineModalItem.id ? { ...c, status: 'Declined', decline_reason: declineReason.trim() } : c)
      );
      triggerToast('info', 'Appointment Declined', 'Appointment declined.');
      setDeclineModalItem(null);
      setDeclineReason('');
    } catch (err) {
      console.error(err);
      triggerToast('error', 'Error', 'Unable to decline appointment. Please try again.');
    }
  };
    const questionRequests = consultations.filter(
    item => item.consultation_mode !== 'Appointment'
  );

  const appointmentRequests = consultations.filter(
    item => item.consultation_mode === 'Appointment'
  );
  const answeredRequests = consultations.filter(
  item => item.reply && item.reply.trim()
).length;

const activeProfiles = new Set(
  consultations
    .map(item =>
      item.user_name ||
      item.user_email ||
      item.user_id
    )
    .filter(Boolean)
).size;

const responseRate = consultations.length
  ? Math.round(
      (answeredRequests / consultations.length) * 100
    )
  : 0;

  return (
    <>
      <div className="welcome">

        <div>
          <h1>Welcome, {user.name}!</h1>

          <p>
            {selectedConsultation?.consultation_mode === 'Appointment'
  ? 'Review appointment requests and provide personalized guidance to users.'
  : 'Review user questions, readings, and requests to provide personalized spiritual guidance.'}
            </p>
        </div>

        <div className="sun">☀</div>

      </div>

      <h2 className="section-title">
        Consultant Workspace
      </h2>

      <div className="tiles">

        <Tile
          icon={<TrendingUp/>}
          title="User Trends"
          text="Review user patterns, reading history, and personal growth trends."
          onClick={()=>go('client-trends')}
        />

        <Tile
          icon={<Brain/>}
          title="AI Insights"
          text="Review AI-generated personality and behavioral insights from readings."
          onClick={()=>go('insights')}
        />

        <Tile
          icon={<CheckCircle/>}
          title="Recommendations"
          text="Create personalized guidance based on user insights and reading patterns."
          onClick={()=>go('recommendations')}
        />

      </div>

      <div className="stats">
        <Stat
          title="Question Requests"
          value={questionRequests.length}
        />
        <Stat
          title="Appointments"
          value={appointmentRequests.length}
        />
        <Stat
          title="Active Profiles"
          value={activeProfiles}
        />
        <Stat
          title="Response Rate"
          value={`${responseRate}%`}
        />
      </div>

      {/* APPOINTMENT REQUESTS SECTION */}
      <div className="consultation-dashboard">
        <div className="consultation-dashboard-header">
          <div>
            <h2>📅 Spiritual Consultant Appointment Requests</h2>
            <p>
              Review client appointments, accept or decline requests, and paste Google Meet links directly for your scheduled sessions.
            </p>
          </div>
          <span className="request-count">
            {appointmentRequests.length} Appointment{appointmentRequests.length !== 1 ? 's' : ''}
          </span>
        </div>

        {appointmentRequests.length === 0 ? (
          <div className="no-consultations">
            <p>No appointment requests yet. When users schedule an appointment with you, it will appear here.</p>
          </div>
        ) : (
          <div className="consultation-request-list">
            {appointmentRequests.map(item => {
              const statusInfo = getAppointmentStatusInfo(item);
              const effStatus = statusInfo.status;
              const badge = getAppointmentBadge(effStatus);
              const meetUrl = item.meeting_link || item.meeting_url;

              return (
                <div
                  className="consultation-request-card"
                  key={item.id}
                >
                  <div className="consultation-request-top">
                    <div>
                      <strong>User Name: {item.user_name || 'Client'}</strong>
                      <span>Topic: {item.focus || 'Personal Guidance'}</span>
                    </div>

                    <span
                      className={`status status-${effStatus.toLowerCase().replace(/\s+/g, '-')}`}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '13px',
                        background: badge.bg,
                        color: badge.color
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="consultation-question">
                    <strong>Appointment Information</strong>
                    <p style={{ margin: '4px 0' }}>👤 <strong>Client Name:</strong> {item.user_name || 'Client'}</p>
                    <p style={{ margin: '4px 0' }}>🎯 <strong>Topic/Focus:</strong> {item.focus || 'Personal Guidance'}</p>
                    <p style={{ margin: '4px 0' }}>📅 <strong>Appointment Date:</strong> {item.appointment_date || 'Not specified'}</p>
                    <p style={{ margin: '4px 0' }}>🕐 <strong>Appointment Time:</strong> {formatApptTime(item.appointment_time) || 'Not specified'}</p>
                    {item.details && (
                      <p style={{ margin: '4px 0' }}>📝 <strong>Additional Details:</strong> {item.details}</p>
                    )}
                  </div>

                  {['Accepted', 'Upcoming', 'In Progress', 'Completed'].includes(effStatus) && (
                    <div className="meet-box" style={{ marginTop: '12px', padding: '16px', borderRadius: '12px', background: effStatus === 'In Progress' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(34, 197, 94, 0.08)', border: effStatus === 'In Progress' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(34, 197, 94, 0.25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '700', color: effStatus === 'In Progress' ? '#059669' : '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          📹 Meeting Platform: Google Meet
                        </span>
                        <span style={{ background: badge.color, color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                          {effStatus}
                        </span>
                      </div>
                      <div style={{ fontSize: '13.5px', color: '#374151', marginBottom: '8px', lineHeight: '1.6' }}>
                        <div><strong>Client:</strong> {item.user_name || 'Client'}</div>
                        <div><strong>Date:</strong> {item.appointment_date}</div>
                        <div><strong>Time:</strong> {formatApptTime(item.appointment_time)} (Asia/Kolkata)</div>
                        {meetUrl ? (
                          <div style={{ marginTop: '6px' }}>
                            <strong>Saved Meeting Link:</strong>{' '}
                            <a href={meetUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', wordBreak: 'break-all' }}>
                              {meetUrl}
                            </a>
                          </div>
                        ) : (
                          <div style={{ marginTop: '6px', color: '#854d0e', background: '#fefce8', padding: '6px 10px', borderRadius: '6px', fontSize: '12.5px' }}>
                            ℹ️ Please paste your manually created Google Meet meeting URL below and click Save & Send Link.
                          </div>
                        )}
                      </div>

                      {effStatus !== 'Completed' && (
                        <div style={{ marginTop: '12px', background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db' }}>
                          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                            Google Meet Link
                          </label>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <input
                              type="url"
                              placeholder="https://meet.google.com/abc-defg-hij"
                              value={manualMeetInputs[item.id] !== undefined ? manualMeetInputs[item.id] : (meetUrl || '')}
                              onChange={(e) => setManualMeetInputs({ ...manualMeetInputs, [item.id]: e.target.value })}
                              style={{ flex: '1', minWidth: '220px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                            />
                            <button
                              className="primary"
                              style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}
                              disabled={savingMeetId === item.id}
                              onClick={() => handleSaveManualMeetLink(item.id)}
                            >
                              {savingMeetId === item.id ? 'Saving...' : (meetUrl ? 'Update & Send Link' : 'Save & Send Link')}
                            </button>
                          </div>
                          <small style={{ display: 'block', color: '#6b7280', fontSize: '11.5px', marginTop: '5px' }}>
                            Paste the link copied from Google Meet. Client will receive this URL immediately.
                          </small>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
                        {meetUrl && effStatus !== 'Completed' && (
                          <a
                            href={meetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="primary"
                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', background: effStatus === 'In Progress' ? '#059669' : '#16a34a', borderColor: effStatus === 'In Progress' ? '#047857' : '#15803d', padding: '8px 16px', borderRadius: '8px', fontWeight: '600' }}
                          >
                            📹 {effStatus === 'In Progress' ? 'Join Google Meet (Session In Progress)' : 'Join Google Meet'}
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {effStatus === 'Declined' && item.decline_reason && (
                    <div className="consultation-existing-reply" style={{ borderLeft: '4px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)', marginTop: '8px' }}>
                      <strong style={{ color: '#dc2626' }}>Reason for Declining</strong>
                      <p>{item.decline_reason}</p>
                    </div>
                  )}

                  {item.reply && (
                    <div className="consultation-existing-reply">
                      <strong>Your Reply</strong>
                      <p>{item.reply}</p>
                    </div>
                  )}

                  <div className="consultation-actions-row" style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
                    {effStatus === 'Pending' && (
                      <>
                        <button
                          className="primary"
                          style={{ background: '#16a34a', borderColor: '#15803d', color: '#fff' }}
                          onClick={() => handleAcceptAppointment(item)}
                        >
                          Accept Appointment
                        </button>
                        <button
                          className="secondary"
                          style={{ color: '#dc2626', borderColor: '#fca5a5', background: '#fff' }}
                          onClick={() => {
                            setDeclineModalItem(item);
                            setDeclineReason('');
                            setDeclineError('');
                          }}
                        >
                          Decline Appointment
                        </button>
                      </>
                    )}

                    <button
                      className="secondary"
                      onClick={() => {
                        setSelectedConsultation(item);
                        setReply(item.reply || '');
                      }}
                    >
                      {item.reply ? 'Edit Guidance Reply' : 'Add Guidance Reply'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QUESTION REQUESTS SECTION */}
      <div className="consultation-dashboard" style={{ marginTop: '24px' }}>
        <div className="consultation-dashboard-header">
          <div>
            <h2>💬 Question Requests</h2>
            <p>
              Questions submitted by users who need personalized spiritual guidance.
            </p>
          </div>
          <span className="request-count">
            {questionRequests.length} Request{questionRequests.length !== 1 ? 's' : ''}
          </span>
        </div>

        {questionRequests.length === 0 ? (
          <div className="no-consultations">
            <p>No question requests yet.</p>
          </div>
        ) : (
          <div className="consultation-request-list">
            {questionRequests.map(item => (
              <div
                className="consultation-request-card"
                key={item.id}
              >
                <div className="consultation-request-top">
                  <div>
                    <strong>User Consultation</strong>
                    <span>{item.focus} · {item.spread}</span>
                  </div>
                  <span className="status">{item.status}</span>
                </div>

                <div className="consultation-question">
                  <strong>Question</strong>
                  <p>{item.question}</p>
                </div>

                <div className="consultation-cards">
                  <strong>Selected Cards</strong>
                  <p>{item.cards?.join(' · ') || 'Not available'}</p>
                </div>

                {item.reply && (
                  <div className="consultation-existing-reply">
                    <strong>Your Reply</strong>
                    <p>{item.reply}</p>
                  </div>
                )}

                <button
                  className="primary"
                  onClick={() => {
                    setSelectedConsultation(item);
                    setReply(item.reply || '');
                  }}
                >
                  {item.reply ? 'Edit Reply' : 'Open & Reply'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REPLY MODAL */}
      {selectedConsultation && (
        <div className="consultation-modal-overlay">
          <div className="consultation-modal">
            <button
              className="consultation-modal-close"
              onClick={() => {
                setSelectedConsultation(null);
                setReply('');
              }}
            >
              ×
            </button>

            <h2>
              {selectedConsultation.consultation_mode === 'Appointment'
                ? 'Respond to Appointment'
                : 'Reply to User'}
            </h2>

            <p>
              Provide personalized spiritual guidance based on the user's question and reading.
            </p>

            <div className="consultation-current-reading">
              {selectedConsultation.consultation_mode === 'Appointment' ? (
                <>
                  <strong>Topic:</strong> {selectedConsultation.focus || 'Personal Guidance'}
                  <br />
                  <strong>📅 Date:</strong> {selectedConsultation.appointment_date || 'Not specified'}
                  <br />
                  <strong>🕐 Time:</strong> {formatApptTime(selectedConsultation.appointment_time) || 'Not specified'}
                  {selectedConsultation.details && (
                    <>
                      <br />
                      <strong>Details:</strong> {selectedConsultation.details}
                    </>
                  )}
                </>
              ) : (
                <>
                  <strong>Focus:</strong> {selectedConsultation.focus}
                  <br />
                  <strong>Spread:</strong> {selectedConsultation.spread}
                  <br />
                  <strong>Cards:</strong> {selectedConsultation.cards?.join(' · ')}
                </>
              )}
            </div>

            <div className="consultation-question">
              <strong>
                {selectedConsultation.consultation_mode === 'Appointment'
                  ? 'Appointment Request'
                  : "User's Question"}
              </strong>
              <p>
                {selectedConsultation.consultation_mode === 'Appointment'
                  ? selectedConsultation.details || selectedConsultation.question
                  : selectedConsultation.question}
              </p>
            </div>

            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={
                selectedConsultation.consultation_mode === 'Appointment'
                  ? 'Write your response to the appointment request...'
                  : 'Write your personalized guidance here...'
              }
              rows={7}
            />

            <div className="consultation-modal-actions">
              <button
                className="secondary"
                onClick={() => {
                  setSelectedConsultation(null);
                  setReply('');
                }}
              >
                Cancel
              </button>
              <button
                className="primary"
                disabled={!reply.trim()}
                onClick={sendReply}
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DECLINE REASON MODAL */}
      {declineModalItem && (
        <div className="consultation-modal-overlay" onClick={() => setDeclineModalItem(null)}>
          <div className="consultation-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button
              className="consultation-modal-close"
              onClick={() => setDeclineModalItem(null)}
            >
              ×
            </button>

            <h2>Decline Appointment</h2>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
              Provide a reason for declining the appointment request from <strong>{declineModalItem.user_name || 'User'}</strong>.
            </p>

            <form onSubmit={handleDeclineSubmit}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                Reason for declining this appointment <span style={{ color: '#dc2626' }}>*</span>
              </label>

              <textarea
                value={declineReason}
                onChange={(e) => {
                  setDeclineReason(e.target.value);
                  if (e.target.value.trim()) setDeclineError('');
                }}
                placeholder="Please provide a reason for declining this appointment..."
                rows={4}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />

              {declineError && (
                <div style={{ color: '#dc2626', fontSize: '13px', marginTop: '6px' }}>
                  {declineError}
                </div>
              )}

              <div className="consultation-modal-actions" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setDeclineModalItem(null)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary"
                  disabled={!declineReason.trim()}
                  style={{ background: '#dc2626', borderColor: '#b91c1c', color: '#fff' }}
                >
                  Submit & Decline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
}
function ClientReadings({ user }){

  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReading, setSelectedReading] = useState(null);

  useEffect(() => {

    const loadReadings = async () => {

      try {
        const authHeaders = user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};
        const response = await fetch(API + '/tarot/readings', { headers: authHeaders });

        if (!response.ok) {
          throw new Error('Failed to fetch tarot readings');
        }

        const data = await response.json();

        setReadings(Array.isArray(data) ? data : []);

      } catch (error) {

        console.error('Error loading tarot readings:', error);

      } finally {

        setLoading(false);

      }

    };

    loadReadings();

  }, [user?.name, user?.token]);
   const allReadings = readings;
  return (
    <>

      <PageHead
        title="Client Readings"
        sub="Review client tarot sessions, card spreads and personalized interpretations."
      />


      {/* =====================================================
          READING SUMMARY
      ===================================================== */}

      <div className="stats">

        <Stat
          title="Total Readings"
          value={allReadings.length}
          sub="Available client sessions"
        />

        <Stat
          title="Completed"
          value={
            allReadings.filter(
              r => r.status === 'Completed'
            ).length
          }
          sub="Completed readings"
        />

        <Stat
          title="Pending"
          value={
            allReadings.filter(
              r =>
                r.status === 'Pending' ||
                r.status === 'pending'
            ).length
          }
          sub="Need attention"
        />

      </div>


      {/* =====================================================
          CLIENT READING TABLE
      ===================================================== */}

      <div className="table">

        <div className="tr head">

  <span>Client</span>

  <span>Focus</span>

  <span>Spread</span>

  <span>Date</span>

  <span>Status</span>

  <span>Action</span>

</div>


        {loading ? (

  <div
    style={{
      padding: '30px',
      textAlign: 'center'
    }}
  >
    Loading client readings...
  </div>

) : allReadings.length === 0 ? (

  <div
    style={{
      padding: '30px',
      textAlign: 'center',
      color: '#777'
    }}
  >
    No Tarot readings have been created yet.
  </div>

) : (

  allReadings.map(reading => (

    <div
      className="tr"
      key={reading.id}
    >

      <span>
        {reading.user_name}
      </span>

      <span>
        {reading.focus}
      </span>

      <span>
        {reading.spread}
      </span>

      <span>
        {reading.created_at
          ? new Date(reading.created_at).toLocaleDateString()
          : '—'
        }
      </span>

      <span>
        <span className="status">
          {reading.status}
        </span>
      </span>

      <span>

        <button
          className="primary"
          style={{
            padding: '7px 12px',
            fontSize: '12px'
          }}
          onClick={() =>
            setSelectedReading(reading)
          }
        >
          View Reading
        </button>

      </span>

    </div>

  ))

)}

      </div>


      {/* =====================================================
          TAROT READING WORKSPACE
      ===================================================== */}

      {selectedReading && (

        <div
          className="consultation-modal-overlay"
          onClick={() =>
            setSelectedReading(null)
          }
        >

          <div
            className="consultation-modal"
            style={{
              maxWidth: '1000px',
              width: '92%'
            }}
            onClick={e =>
              e.stopPropagation()
            }
          >

            <button
              className="consultation-modal-close"
              onClick={() =>
                setSelectedReading(null)
              }
            >
              ×
            </button>


            {/* HEADER */}

            <div
              style={{
                marginBottom: '22px'
              }}
            >

              <div
                style={{
                  color: '#7654d8',
                  fontSize: '12px',
                  fontWeight: '700',
                  letterSpacing: '1px',
                  marginBottom: '6px'
                }}
              >
                🔮 TAROT READER WORKSPACE
              </div>
              <h2>
  {selectedReading.user_name}
</h2>

<p>
  {selectedReading.focus}
  {' · '}
  {selectedReading.spread}
  {' · '}
  {selectedReading.created_at
    ? new Date(selectedReading.created_at).toLocaleDateString()
    : ''
  }
</p>

            </div>


            {/* READING INFORMATION */}

            <div
              className="stats"
              style={{
                marginBottom: '24px'
              }}
            >

              <Stat
  title="Focus"
  value={selectedReading.focus}
/>

<Stat
  title="Spread"
  value={selectedReading.spread}
/>

<Stat
  title="Cards"
  value={selectedReading.cards?.length || 0}
/>

<Stat
  title="Status"
  value={selectedReading.status}
/>
            </div>


            {/* CARDS */}

            <h3
              style={{
                marginBottom: '15px'
              }}
            >
              🃏 Cards in This Reading
            </h3>


            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit,minmax(140px,1fr))',
                gap: '14px',
                marginBottom: '26px'
              }}
            >

              {selectedReading.cards?.length ? (

                selectedReading.cards.map(
                  (card, index) => (

                    <div
                      key={index}
                      style={{
                        padding: '20px 12px',
                        borderRadius: '14px',
                        background:
                          'linear-gradient(145deg,#f7f3ff,#ffffff)',
                        border:
                          '1px solid #e7ddff',
                        textAlign: 'center'
                      }}
                    >

                      <div
                        style={{
                          fontSize: '11px',
                          color: '#7654d8',
                          fontWeight: '700',
                          textTransform:
                            'uppercase',
                          marginBottom: '10px'
                        }}
                      >
                        {selectedReading.positions?.[index] || `Card ${index + 1}`}
                      </div>


                      <div
                        style={{
                          fontSize: '15px',
                          fontWeight: '700'
                        }}
                      >
                        {card}
                      </div>

                    </div>

                  )
                )

              ) : (

                <div
                  style={{
                    padding: '20px',
                    background: '#fafafa',
                    borderRadius: '12px'
                  }}
                >
                  Cards have not been recorded
                  for this consultation.
                </div>

              )}

            </div>


            {/* CLIENT QUESTION */}

            {selectedReading.question && (

              <div
                style={{
                  padding: '18px',
                  borderRadius: '14px',
                  background: '#faf8ff',
                  marginBottom: '22px'
                }}
              >

                <strong>
                  💬 Client Question
                </strong>

                <p
                  style={{
                    marginTop: '8px'
                  }}
                >
                  {selectedReading.question}
                </p>

              </div>

            )}


            {/* INTERPRETATION */}

            <div
              style={{
                padding: '22px',
                borderRadius: '16px',
                background:
                  'linear-gradient(145deg,#f8f4ff,#ffffff)',
                border:
                  '1px solid #e7ddff',
                marginBottom: '22px'
              }}
            >

              <h3>
                ✨ Reading Interpretation
              </h3>


              <p
                style={{
                  lineHeight: '1.8',
                  marginTop: '12px'
                }}
              >
                {selectedReading.reading?.overall ||
                'No overall interpretation available.'}
              </p>

            </div>


            {/* ACTIONS */}

            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}
            >

              <button
                className="secondary"
                onClick={() =>
                  setSelectedReading(null)
                }
              >
                Close
              </button>


              <button
  className="primary"
  onClick={() => {

    if (!selectedReading?.id) {
      triggerToast('info', 'No Selection', 'No reading selected.');
      return;
    }

    window.open(
      `${API}/reports/tarot/${selectedReading.id}.pdf`,
      '_blank'
    );

  }}
>
  📄 Generate Report
</button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}
function ReaderAnalytics({ user }){

  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadAnalytics = async () => {

      try {
        const authHeaders = user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};
        const response = await fetch(
          API + '/tarot/readings',
          { headers: authHeaders }
        );

        if (!response.ok) {
          throw new Error(
            'Failed to load Tarot analytics'
          );
        }

        const data = await response.json();

        setReadings(
          Array.isArray(data) ? data : []
        );

      } catch (error) {

        console.error(
          'Analytics loading error:',
          error
        );

        setReadings([]);

      } finally {

        setLoading(false);

      }

    };

    loadAnalytics();

  }, [user?.name, user?.token]);

  // --------------------------------------------------
  // REAL ANALYTICS CALCULATIONS
  // --------------------------------------------------

  const totalSessions = readings.length;

  const completedReadings = readings.filter(
    reading =>
      reading.status === 'Completed'
  ).length;

  const completionRate =
    totalSessions > 0
      ? Math.round(
          (completedReadings / totalSessions) * 100
        )
      : 0;

  const activeClients =
    new Set(
      readings.map(
        reading => reading.user_name
      )
    ).size;

  // Find the most frequently used spread
  const spreadCounts = {};

  readings.forEach(reading => {

    const spread = reading.spread;

    if (spread) {

      spreadCounts[spread] =
        (spreadCounts[spread] || 0) + 1;

    }

  });

  const popularSpread =
    Object.keys(spreadCounts).length > 0
      ? Object.entries(spreadCounts)
          .sort((a, b) => b[1] - a[1])[0][0]
      : '—';

  // Calculate average number of cards
  const totalCards = readings.reduce(
    (sum, reading) =>
      sum +
      (Array.isArray(reading.cards)
        ? reading.cards.length
        : 0),
    0
  );

  const averageCards =
    totalSessions > 0
      ? (
          totalCards / totalSessions
        ).toFixed(1)
      : '0.0';

  // Most recent focus
  const latestFocus =
    readings.length > 0
      ? readings[0].focus || '—'
      : '—';
  // --------------------------------------------------
  // SPREAD VISUALIZATION DATA
  // --------------------------------------------------

  const spreadData = Object.entries(
    spreadCounts
  )
    .sort((a, b) => b[1] - a[1]);

  const maxSpreadCount =
    spreadData.length > 0
      ? spreadData[0][1]
      : 1;


  // --------------------------------------------------
  // FOCUS VISUALIZATION DATA
  // --------------------------------------------------

  const focusCounts = {};

  readings.forEach(reading => {

    const focus = reading.focus || 'General';

    focusCounts[focus] =
      (focusCounts[focus] || 0) + 1;

  });

  const focusData = Object.entries(
    focusCounts
  )
    .sort((a, b) => b[1] - a[1]);
  return (

    <>

      <PageHead
        title="Reading Analytics"
        sub="Track tarot reading activity, completion and client engagement."
      />

      {loading ? (

        <div
          style={{
            padding: '30px',
            textAlign: 'center'
          }}
        >
          Loading Tarot analytics...
        </div>

      ) : (

        <>

          {/* REAL READING STATISTICS */}

          <div className="stats">

            <Stat
              title="Total Sessions"
              value={totalSessions}
            />

            <Stat
              title="Completed"
              value={completedReadings}
            />

            <Stat
              title="Completion Rate"
              value={`${completionRate}%`}
            />

            <Stat
              title="Active Clients"
              value={activeClients}
            />

          </div>


          {/* REAL TAROT ANALYTICS */}

<div className="analytics-dashboard">

  {/* =========================
      SPREAD USAGE
  ========================= */}

  <div className="analytics-card analytics-spreads">

    <div className="analytics-card-header">
      <div>
        <span className="analytics-eyebrow">
          TAROT ACTIVITY
        </span>

        <h3>
          Spread Usage
        </h3>

        <p>
          See which Tarot spreads are used most frequently.
        </p>
      </div>

      <div className="analytics-header-icon">
        🔮
      </div>
    </div>

    {spreadData.length === 0 ? (

      <div className="analytics-empty">
        No reading data available yet.
      </div>

    ) : (

      <div className="spread-list">

        {spreadData.map(
          ([spread, count], index) => {

            const percentage =
              Math.round(
                (count / totalSessions) * 100
              );

            const barWidth =
              Math.max(
                10,
                (count / maxSpreadCount) * 100
              );

            return (

              <div
                className="spread-row"
                key={spread}
              >

                <div className="spread-top">

                  <div className="spread-name">

                    <span className="spread-rank">
                      {index + 1}
                    </span>

                    <span>
                      {spread}
                    </span>

                  </div>

                  <div className="spread-value">

                    <strong>
                      {count}
                    </strong>

                    <span>
                      {percentage}%
                    </span>

                  </div>

                </div>

                <div className="spread-track">

                  <div
                    className="spread-fill"
                    style={{
                      width: `${barWidth}%`
                    }}
                  />

                </div>

              </div>

            );

          }
        )}

      </div>

    )}

  </div>


  {/* =========================
      READING FOCUS
  ========================= */}

  <div className="analytics-card focus-card">

    <div className="analytics-card-header">

      <div>
        <span className="analytics-eyebrow">
          CLIENT INTEREST
        </span>

        <h3>
          Reading Focus
        </h3>

        <p>
          What clients are asking about.
        </p>
      </div>

      <div className="analytics-header-icon">
        🎯
      </div>

    </div>


    {focusData.length === 0 ? (

      <div className="analytics-empty">
        No focus data available yet.
      </div>

    ) : (

      <>

        <div className="focus-visual">

          <div className="focus-donut">

            <div className="focus-donut-inner">

              <strong>
                {totalSessions}
              </strong>

              <span>
                Readings
              </span>

            </div>

          </div>

        </div>


        <div className="focus-list">

          {focusData.map(
            ([focus, count], index) => {

              const percentage =
                Math.round(
                  (count / totalSessions) * 100
                );

              return (

                <div
                  className="focus-item"
                  key={focus}
                >

                  <div className="focus-label">

                    <span>

                      <i
                        className={`focus-dot focus-dot-${index}`}
                      />

                      {focus}

                    </span>

                    <strong>
                      {percentage}%
                    </strong>

                  </div>

                  <div className="focus-count">
                    {count} reading
                    {count !== 1 ? 's' : ''}
                  </div>

                </div>

              );

            }
          )}

        </div>

      </>

    )}

  </div>


  {/* =========================
      READING SUMMARY
  ========================= */}

  <div className="analytics-summary">

    <div className="summary-heading">

      <div>

        <span className="analytics-eyebrow">
          INSIGHTS
        </span>

        <h3>
          Reading Summary
        </h3>

      </div>

      <span className="summary-sparkle">
        ✨
      </span>

    </div>


    <div className="summary-grid">

      <div className="summary-item">

        <div className="summary-icon">
          🃏
        </div>

        <div>

          <span>
            Most Used Spread
          </span>

          <strong>
            {popularSpread}
          </strong>

        </div>

      </div>


      <div className="summary-item">

        <div className="summary-icon">
          🎴
        </div>

        <div>

          <span>
            Average Cards
          </span>

          <strong>
            {averageCards}
          </strong>

        </div>

      </div>


      <div className="summary-item">

        <div className="summary-icon">
          🌙
        </div>

        <div>

          <span>
            Latest Reading Focus
          </span>

          <strong>
            {latestFocus}
          </strong>

        </div>

      </div>

    </div>

  </div>

</div>
    
        </>

      )}

    </>

  );

}
function Recommendations(){return <><PageHead title="Personalized Recommendations" sub="Guidance themes generated from personality, palm and tarot insights."/>
<div className="four"><InsightBox title="Career" arr={['Build one focused technical skill','Create a small portfolio project','Review goals monthly']}/><InsightBox title="Relationships" arr={['Communicate expectations clearly','Make time for meaningful conversations','Practice active listening']}/><InsightBox title="Personal Growth" arr={['Use weekly reflection','Break large goals into steps','Celebrate consistent progress']}/><InsightBox title="Spiritual Development" arr={['Maintain a reflection journal','Use readings as prompts for self-reflection','Keep guidance practical and balanced']}/></div></>}
function ConsultantRecommendations(){
  return <>
    <PageHead
      title="Consultant Recommendations"
      sub="Prepare personalized guidance based on user readings, patterns, and AI insights."
    />

    <div className="four consultant-recommendation-grid">
      <InsightBox
        title="Career & Goals"
        arr={[
          'Identify the user’s strongest growth areas',
          'Suggest practical steps toward their goals',
          'Encourage consistent progress and reflection'
        ]}
      />

      <InsightBox
        title="Relationships"
        arr={[
          'Review emotional and communication patterns',
          'Encourage healthy and clear communication',
          'Provide balanced guidance for relationship concerns'
        ]}
      />

      <InsightBox
        title="Personal Growth"
        arr={[
          'Identify recurring strengths and challenges',
          'Recommend realistic self-improvement actions',
          'Encourage reflection based on reading insights'
        ]}
      />

      <InsightBox
        title="Spiritual Guidance"
        arr={[
          'Connect palm and tarot insights meaningfully',
          'Use readings as a guide for self-reflection',
          'Keep recommendations practical and balanced'
        ]}
      />
    </div>
  </>
}
function Tile({icon,title,text,onClick}){return <button className="tile" onClick={onClick}><div className="tileicon">{icon}</div><div><h3>{title}</h3><p>{text}</p></div><ChevronRight/></button>}
function Stat({title,value,sub,progress}){return <div className="stat"><small>{title}</small><h3>{value}</h3>{sub&&<span>{sub}</span>}{progress&&<div className="progress"><i style={{width:'78%'}}/></div>}</div>}
function Mini({icon,t,d}){return <div className="mini"><div>{icon}</div><section><b>{t}</b><p>{d}</p></section></div>}
function Palm({ user }) {
  const [img, setImg] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = async () => {
  if (!img) return;

  setLoading(true);
  setError('');

  try {
    const fd = new FormData();
    fd.append('image', img.file);
    if (user?.name) {
      fd.append('user_name', user.name);
    }

    const headers = {};
    if (user?.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }

    const r = await fetch(API + '/palm/analyze', {
      method: 'POST',
      headers,
      body: fd
    });

    if (!r.ok) {
      throw new Error('Palm analysis failed');
    }

    const data = await r.json();

    if (!data.detected) {
      setError(
        data.summary ||
        'No hand was detected. Please upload a clear palm image.'
      );
      setResult(null);
      return;
    }

   setResult(data);

try {
  localStorage.setItem(
    `latestPalmAnalysis_${user?.email || 'user'}`,
    JSON.stringify({
      ...data,
      analyzedAt: new Date().toISOString()
    })
  );
} catch (e) {}

  } catch (err) {
    console.error(err);

    setError(
      'The palm analysis service could not be reached. Please make sure the FastAPI backend is running.'
    );

    setResult(null);

  } finally {
    setLoading(false);
  }
};

  // Uploaded palm photos are normal (not mirrored).
  // MediaPipe handedness uses the mirrored/selfie convention,
  // so reverse its label for these uploaded images.
  const mediaPipeHand =
    result?.handedness ||
    result?.hand ||
    result?.hand_type ||
    result?.handedness_label ||
    'Unknown';

  const handType = (() => {
    const value = String(mediaPipeHand).trim();
    if (!value || value.toLowerCase() === 'unknown') return 'Unknown';
    if (value.toLowerCase().includes('uncertain')) return 'Uncertain';
    if (value.toLowerCase().includes('right')) return 'Right';
    if (value.toLowerCase().includes('left')) return 'Left';
    return value;
  })();

  const handDisplay =
    handType === 'Uncertain' ? 'Hand detected (side uncertain)' :
    handType === 'Unknown' ? 'Hand detected' :
    (handType.toLowerCase().includes('hand') ? handType : `${handType} Hand`);

  return (
    <>
      <PageHead
        title="Palm Analysis"
        sub="Upload a clear image of your palm and let AI detect the major palm lines."
      />

      <div className="palm-page">

        {/* ================= TOP ANALYSIS CARD ================= */}
        <section className="palm-main-card">

          <div className="palm-main-header">
            <div>
              <span className="palm-eyebrow">
                AI PALM INTELLIGENCE
              </span>

              <h2>Palm Analysis</h2>

              <p>
                Upload your palm image to identify and visualize
                major palm lines and structural features.
              </p>
            </div>

            {result && (
              <div className="hand-badge">
                <span className="hand-badge-icon">✋</span>

                <div>
                  <small>HAND DETECTED</small>
                  <strong>{handDisplay}</strong>
                </div>
              </div>
            )}
          </div>


          {/* ================= IMAGE + UPLOAD ================= */}
          <div className="palm-analysis-layout">

            <div className="palm-upload-card">

              <label className="uploadbox">

                {img ? (
                  <div className="upload-preview">
                    <img
                      src={img.url}
                      alt="Uploaded palm"
                    />

                    <div className="image-overlay">
                      <span>Image uploaded</span>
                    </div>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <div className="upload-icon">
                      <Upload size={30} />
                    </div>

                    <b>Upload palm image</b>

                    <span>
                      Use a clear image with the palm facing the camera
                    </span>

                    <small>
                      PNG, JPG up to 10MB
                    </small>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const f = e.target.files?.[0];

                    if (f) {
                      setImg({
                        file: f,
                        url: URL.createObjectURL(f)
                      });
                    }

                    setResult(null);
                    setError('');
                  }}
                />

              </label>

              <button
                className="primary palm-analyze-btn"
                disabled={!img || loading}
                onClick={analyze}
              >
                {loading ? (
                  <>
                    <span className="loading-dot"></span>
                    Analyzing Palm...
                  </>
                ) : (
                  <>
                    Analyze Palm
                    <span>→</span>
                  </>
                )}
              </button>

            </div>


            {/* ================= QUICK INFO ================= */}
            <div className="palm-info-card">

              <div className="info-card-heading">
                <span>✦</span>
                <div>
                  <b>AI Analysis</b>
                  <small>Detection overview</small>
                </div>
              </div>

              <div className="info-row">
                <span>Hand</span>
                <strong>
                  {result ? handDisplay : 'Waiting'}
                </strong>
              </div>

              <div className="info-row">
                <span>Palm Lines</span>
                <strong>
                  {result ? '5 / 5 detected' : '—'}
                </strong>
              </div>

              <div className="info-row">
                <span>Palm Shape</span>
                <strong>
                  {result?.palm_shape || '—'}
                </strong>
              </div>

              <div className="info-row">
                <span>Status</span>

                <strong className={result ? 'status-complete' : ''}>
                  {result ? '● Complete' : 'Waiting'}
                </strong>
              </div>

            </div>

          </div>

        </section>


        {error && (
          <div className="notice palm-notice">
            {error}
          </div>
        )}


        {/* ================= VISUAL ANALYSIS ================= */}
        {img && result && (
          <PalmVisual
          image={img.url}
          handType={handType}
          linePaths={result.line_paths}
          result={result}
          />
        )}
      </div>
    </>
  );
}
function PalmVisual({ image, handType, linePaths, result }) {

  const [loaded, setLoaded] = useState(false);

  const makePath = (points = []) => {
    if (!points.length) return '';

    return points
      .map((p, index) =>
        `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
      )
      .join(' ');
  };

  const pathFor = (name) => {
    return makePath(linePaths?.[name] || []);
  };

  const getScore = (name) => {
    return Number(result?.features?.[name] || 0);
  };

  const strength = (value) => {
    if (value >= 70) return 'Strong';
    if (value >= 40) return 'Moderate';
    return 'Subtle';
  };

  const lineData = [
    {
      name: 'Heart Line',
      type: 'heart',
      icon: '♡',
      description: 'Emotional expression and relationships',
      insight:
        'Reflects emotional expression, relationships and the way feelings are expressed.'
    },
    {
      name: 'Life Line',
      type: 'life',
      icon: '♧',
      description: 'Vitality, energy and major life phases',
      insight:
        'Represents vitality, energy patterns and major phases of personal development.'
    },
    {
      name: 'Head Line',
      type: 'head',
      icon: '✦',
      description: 'Thinking style, focus and decision-making',
      insight:
        'Reflects thinking style, focus, reasoning and decision-making patterns.'
    },
    {
      name: 'Fate Line',
      type: 'fate',
      icon: '◎',
      description: 'Direction, career themes and purpose',
      insight:
        'Associated with direction, purpose, career themes and life changes.'
    },
    {
      name: 'Sun Line',
      type: 'sun',
      icon: '☀',
      description: 'Creativity, recognition and expression',
      insight:
        'Associated with creativity, recognition, confidence and self-expression.'
    }
  ];

  return (
    <section className="palm-analysis-results">

      {/* ================= HEADER ================= */}

      <div className="palm-analysis-title">
        <span>ANALYSIS RESULTS</span>
        <h2>Palm Line Analysis</h2>
        <p>
          Your palm lines have been detected and analyzed using
          AI and computer vision.
        </p>
      </div>


      {/* ================= IMAGE + LINE RESULTS ================= */}

      <div className="palm-top-analysis">

        {/* PALM IMAGE */}

        <div className="palm-visual-card">

          <div className="palm-image-container">

            <img
              src={image}
              alt={`${handType} palm`}
              onLoad={() => setLoaded(true)}
            />

            {/* Palm image only — line overlays intentionally hidden */}

          </div>

        </div>


        {/* LINE ANALYSIS */}

        <div className="palm-line-analysis-card">

          <div className="analysis-card-heading">

            <div className="analysis-sparkle">
              ✨
            </div>

            <div>
              <h2>Palm Line Analysis</h2>
              <p>
                Major palm features detected from your uploaded image.
              </p>
            </div>

          </div>


          <div className="compact-line-results">
            {lineData.map((line) => {
              const score = getScore(line.name);
              const available = result?.features?.[line.name] !== undefined && result?.features?.[line.name] !== null;
              const clampedScore = Math.min(100, Math.max(0, score));

              return (
                <div
                  className={`compact-line-card ${line.type}`}
                  key={line.name}
                >
                  <div className="compact-line-top-row">
                    <div className="compact-line-icon-badge">
                      <span className="compact-line-icon">{line.icon}</span>
                      <div className="compact-line-title-wrap">
                        <h3>{line.name}</h3>
                        <span className="score-strength">
                          {available ? strength(score) : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                    <strong className="compact-line-score">
                      {available ? `${score.toFixed(1)}%` : '—'}
                    </strong>
                  </div>

                  <p className="compact-line-description">
                    {line.description}
                  </p>

                  <div className="compact-score-bar-wrapper">
                    <div className="compact-score-bar">
                      <div
                        style={{
                          width: `${available ? clampedScore : 0}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>


      {/* ================= PALM STRUCTURE ================= */}

      <section className="palm-structure-section">

        <div className="section-title-row">
          <span>🖐</span>
          <div>
            <h2>Palm Structure Analysis</h2>
            <p>
              Structural features identified from the uploaded hand.
            </p>
          </div>
        </div>


        <div className="structure-grid">

          <div className="structure-card">
            <div className="structure-icon">🖐</div>
            <div>
              <span>PALM SHAPE</span>
              <strong>
                {result?.palm_shape || 'Detected from image'}
              </strong>
              <small>
                Based on palm proportions
              </small>
            </div>
          </div>


          <div className="structure-card">
            <div className="structure-icon">✋</div>
            <div>
              <span>HAND TYPE</span>
              <strong>{handType || 'Unknown'}</strong>
              <small>
                Detected from hand landmarks
              </small>
            </div>
          </div>


          <div className="structure-card">
            <div className="structure-icon">🖐</div>
            <div>
              <span>FINGER STRUCTURE</span>
              <strong>
                {result?.finger_structure ||
                  'Detected from hand landmarks'}
              </strong>
              <small>
                Based on detected finger landmarks
              </small>
            </div>
          </div>


          <div className="structure-card">
            <div className="structure-icon">✦</div>
            <div>
              <span>DOMINANT TRAITS</span>
              <strong>Balanced & Practical</strong>
              <small>
                Based on detected palm features
              </small>
            </div>
          </div>

        </div>

      </section>


      {/* ================= LINE INSIGHTS ================= */}

      <section className="line-insights-section">

        <div className="section-title-row">
          <span>💡</span>
          <div>
            <h2>Line Insights</h2>
            <p>
              Interpretation of the major palm lines detected
              in your uploaded image.
            </p>
          </div>
        </div>


        <div className="line-insights-grid">

          {lineData.map((line) => {
            const available = result?.features?.[line.name] !== undefined && result?.features?.[line.name] !== null;
            const score = getScore(line.name);

            return (
              <div
                className={`line-insight-card ${line.type}`}
                key={line.name}
              >

                <div className="insight-title">
                  <span>{line.icon}</span>
                  <h3>{line.name}</h3>
                </div>


                {/* VISUAL PATTERN */}

                <div className={`line-mini-visual ${line.type}`}>

                  <div className="mini-palm-pattern">
                    <span></span>
                  </div>

                </div>


                <strong className="insight-score">
                  {available ? `${score.toFixed(1)}%` : 'Unavailable'}
                </strong>


                <p>
                  {line.insight}
                </p>


                <ul>

                  {line.type === 'heart' && (
                    <>
                      <li>Emotional expression</li>
                      <li>Meaningful relationships</li>
                      <li>Depth of feelings</li>
                    </>
                  )}

                  {line.type === 'head' && (
                    <>
                      <li>Thinking and reasoning</li>
                      <li>Focus and decision-making</li>
                      <li>Problem-solving approach</li>
                    </>
                  )}

                  {line.type === 'life' && (
                    <>
                      <li>Energy patterns</li>
                      <li>Adaptability</li>
                      <li>Major life phases</li>
                    </>
                  )}

                  {line.type === 'fate' && (
                    <>
                      <li>Direction and purpose</li>
                      <li>Career themes</li>
                      <li>Life changes</li>
                    </>
                  )}

                  {line.type === 'sun' && (
                    <>
                      <li>Creative expression</li>
                      <li>Recognition</li>
                      <li>Confidence</li>
                    </>
                  )}

                </ul>

              </div>
            );

          })}

        </div>

      </section>


      {/* ================= OVERALL INSIGHTS ================= */}

      <section className="overall-palm-insights">

        <div className="overall-icon">
          ✨
        </div>

        <div>

          <span>OVERALL PALM INSIGHTS</span>

          <h2>Your Palm Analysis</h2>

          <p>
            The uploaded {handType.toLowerCase()} hand shows
            measurable palm-line features identified through
            computer-vision analysis.
          </p>

          <p>
            The analysis combines the detected palm-line
            patterns, hand landmarks and structural features
            to create a personalized interpretation.
          </p>

          <div className="overall-highlight">

            <strong>Detected Features</strong>

            <div className="overall-feature-list">

              {lineData.map((line) => (
                <span key={line.name}>
                  {line.name}: {getScore(line.name).toFixed(1)}%
                </span>
              ))}

            </div>

          </div>

          <small className="analysis-note">
            These results represent image-based detection
            strength of crease-like features and are intended
            for an interactive palm-reading experience rather
            than scientifically established predictions.
          </small>

        </div>

      </section>

    </section>
  );
}
function Tarot({user}){
 const FOCUSES=[
  ['General','Overall reflection and guidance'],
  ['Relationship','Love, communication and connection'],
  ['Career','Work, goals and professional direction'],
  ['Personal Growth','Self-development, confidence and habits'],
  ['Finance','Money, planning and practical choices'],
  ['Wellness','Balance, energy and emotional wellbeing']
 ];
 const SPREADS={
  'Single Card':['Guidance'],
  'Three Card':['Past','Present','Future'],
  'Relationship':['Your Energy','Their Energy','Connection','Challenge','Guidance'],
  'Career':['Current Position','Opportunity','Challenge','Action','Outcome'],
  'Personal Growth':['Current Self','Strength','Block','Lesson','Next Step'],
  'Life Path':['Past Influence','Present Path','Hidden Influence','Direction','Guidance'],
  'Celtic Cross':['Present','Challenge','Foundation','Recent Past','Possibility','Near Future','Self','Environment','Hopes & Fears','Outcome']
 };
 const [focus,setFocus]=useState('General'),[spread,setSpread]=useState('Three Card');
 const [deck,setDeck]=useState(()=>shuffle([...tarot]))
 const [isShuffling,setIsShuffling]=useState(false),
[selected,setSelected]=useState([]),
[done,setDone]=useState(false),
[reading,setReading]=useState(null),
[loading,setLoading]=useState(false),
[consultationType,setConsultationType]=useState(null),
[consultationQuestion,setConsultationQuestion]=useState('');
 const resultRef = useRef(null);
 const positions=SPREADS[spread]||SPREADS['Three Card'];
 const choose=i=>{
  if(done||selected.includes(i)||selected.length>=positions.length)return;
  setSelected(s=>[...s,i]);
 };
 const reshuffle=()=>{
  setIsShuffling(true);

  setDeck(shuffle([...tarot]));
  setSelected([]);
  setDone(false);
  setReading(null);

  setTimeout(()=>{
    setIsShuffling(false);
  },800);
};
 const changeSpread=e=>{setSpread(e.target.value);setSelected([]);setDone(false);setReading(null);setDeck(shuffle([...tarot]));};
 const changeFocus=e=>{setFocus(e.target.value);setSelected([]);setDone(false);setReading(null);};
const reveal = async () => {

  if (selected.length !== positions.length) return;

  setLoading(true);
  setDone(true);

  const cards = selected.map(i => deck[i]);

  try {

    const authHeaders = user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};

    // Generate the Tarot interpretation
    const r = await fetch(API + '/tarot/interpret', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({
        cards,
        focus,
        spread,
        user_name: user?.name || ''
      })
    });

    if (!r.ok) {
      throw new Error('Failed to generate Tarot reading');
    }

    // Store the generated reading
    const readingData = await r.json();

    setReading(readingData);


    // Save the actual reading to the backend
    const saveResponse = await fetch(API + '/tarot/readings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({
        user_name: user?.name || 'Unknown User',
        focus: focus,
        spread: spread,
        cards: cards,
        reading: readingData
      })
    });


    if (!saveResponse.ok) {

      const errorData = await saveResponse.json().catch(() => ({}));

      console.error(
        'Reading generated but could not be saved:',
        errorData
      );

    } else {

      const savedData = await saveResponse.json();

      console.log(
        'Tarot reading saved successfully:',
        savedData
      );

    }

  } catch (error) {

    console.error('Tarot reading error:', error);

    setReading(null);

  } finally {

    setLoading(false);

    // Automatically move to the revealed cards section
    setTimeout(() => {

      resultRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

    }, 100);

  }
};
return (
  <>
    <PageHead
      title="Tarot Reading"
      sub="Choose your focus and spread, select cards from the deck, and reveal your personalized reading."
    />

    {/* Reading controls */}
    <div
      className="tarotbar"
      style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        alignItems: 'end'
      }}
    >
      <label style={{display:'flex',flexDirection:'column',gap:5,fontWeight:600}}>
        Reading Focus
        <select
          value={focus}
          onChange={changeFocus}
          style={{
            padding:'9px 12px',
            borderRadius:8,
            border:'1px solid #ddd',
            background:'#fff'
          }}
        >
          {FOCUSES.map(([v,d]) => (
            <option key={v} value={v}>
              {v} — {d}
            </option>
          ))}
        </select>
      </label>

      <label style={{display:'flex',flexDirection:'column',gap:5,fontWeight:600}}>
        Spread
        <select
          value={spread}
          onChange={changeSpread}
          style={{
            padding:'9px 12px',
            borderRadius:8,
            border:'1px solid #ddd',
            background:'#fff'
          }}
        >
          {Object.entries(SPREADS).map(([v,p]) => (
            <option key={v} value={v}>
              {v} ({p.length} card{p.length > 1 ? 's' : ''})
            </option>
          ))}
        </select>
      </label>

      <span style={{marginLeft:'auto'}}>
        Selected: {selected.length}/{positions.length}
      </span>

      <button className="secondary" onClick={reshuffle}>
        <Shuffle size={15}/> Shuffle Again
      </button>
    </div>

    {/* Spread information */}
    <div
      style={{
        margin:'10px 0 16px',
        padding:'10px 14px',
        borderRadius:10,
        background:'#f6f3ff',
        fontSize:13
      }}
    >
      <b>{focus} reading:</b>{' '}
      {positions.map((p,i) => (
        <span key={p}>
          {i+1}. {p}
          {i < positions.length-1 ? ' · ' : ''}
        </span>
      ))}
    </div>

    {/* Tarot workspace */}
    <div className="tarot-workspace">

      {/* LEFT: 78 CARD DECK */}
      <div className="deck-panel">

        <div className="deck-header">
          <div>
            <h3>Tarot Deck</h3>
            <small>
              Choose {positions.length} card{positions.length > 1 ? 's' : ''}
              </small>
              {isShuffling && (
                <div className="shuffle-message">
                  ✦ Deck shuffled
                  </div>
                )}
                </div>


          <span className="deck-count">
            {deck.length} Cards
          </span>
        </div>

        <div className="deck">
          {deck.map((c,i) => (
            <button
              key={c}
              className={'card '+(selected.includes(i) ? 'chosen' : '')}
              onClick={() => choose(i)}
              title={c}
            >
              <div className="backstar">✦</div>

            </button>
          ))}
        </div>

      </div>
      <div className="tarot-selection-footer">
        <div className="selection-count">
          {selected.length} / {positions.length} selected
          </div>
          {selected.length === positions.length && !done && (
            <button
            className="primary reveal"
            onClick={reveal}
            >
              Reveal {spread} Reading
              </button>
            )}
            </div>

    </div>
    {/* READING RESULT */}
{done && (
  <div ref={resultRef} className="tarot-result">

    <h2>{focus} · {spread} Reading</h2>

    <div className="chosenrow">

      {selected.map((i,idx) => (
        <div className="revealed" key={i}>

          <div className="tarot-art">
            <div className="tarot-card-symbol">
              ✦
            </div>
            <b>{deck[i]}</b>
          </div>

          <small>
            {positions[idx]}
          </small>

          <h3>
            {deck[i]}
          </h3>

          <p>
            {reading?.cards?.[idx]?.interpretation ||
              meanings[deck[i]] ||
              'This card provides a theme for reflection and personal guidance.'}
          </p>

        </div>
      ))}

    </div>
    {/* PERSONAL TAROT INSIGHT */}
<div className="tarot-personality-section">

  <div className="tarot-insight-header">

    <div className="tarot-insight-icon">
      ✨
    </div>

    <div>
      <h2>Your Personal Tarot Insight</h2>

      <p>
        A combined interpretation of the cards revealed in your reading.
      </p>
    </div>

  </div>


  {/* PERSONALITY SUMMARY */}

  <div className="tarot-personality-summary">

    <h3>🌙 Your Overall Personality</h3>

    <p>
      {loading
        ? 'Understanding your reading...'
        : (
            reading?.personality ||
            'Your revealed cards offer a perspective on your personality, emotions, strengths and current life themes. Consider these insights as a tool for self-reflection rather than a fixed prediction.'
          )}
    </p>

  </div>


  {/* PERSONALITY DETAILS */}

  <div className="tarot-insight-grid">

    <div className="tarot-insight-card">

      <span>🧠</span>

      <h3>Personality</h3>

      <p>
        {reading?.personality ||
          'The cards provide insights into your natural tendencies, attitudes and way of approaching situations.'}
      </p>

    </div>


    <div className="tarot-insight-card">

      <span>💗</span>

      <h3>Emotional Nature</h3>

      <p>
        {reading?.emotions ||
          'The reading highlights emotional patterns and how you may respond to relationships and experiences.'}
      </p>

    </div>


    <div className="tarot-insight-card">

      <span>🌟</span>

      <h3>Strengths</h3>

      <p>
        {reading?.strengths ||
          'The cards highlight qualities and abilities that you can consciously build upon.'}
      </p>

    </div>


    <div className="tarot-insight-card">

      <span>🌙</span>

      <h3>Areas to Reflect On</h3>

      <p>
        {reading?.challenges ||
          'Some themes may point toward situations that deserve greater awareness and reflection.'}
      </p>

    </div>

  </div>


  {/* PERSONAL GUIDANCE */}

  <div className="tarot-guidance-highlight">

    <span>🔮</span>

    <div>

      <h3>Personal Guidance</h3>

      <p>
        {reading?.guidance ||
          'Use the themes from this reading to reflect on your current choices, goals and experiences.'}
      </p>

    </div>

  </div>

</div>

    {/* OVERALL INTERPRETATION */}
    <div className="overall">

      <b>Overall Interpretation</b>

      <p>
        {loading
          ? 'Generating interpretation...'
          : (
              reading?.overall ||
              'These cards provide themes for reflection and decision-making. Consider how the symbols and positions relate to your current situation rather than treating them as fixed predictions.'
            )}
      </p>

      {/* KEY THEMES */}
      {reading?.themes?.length > 0 && (
        <>
          <b>Key Themes</b>

          <p>
            {reading.themes.join(' · ')}
          </p>
        </>
      )}

      {/* GUIDANCE */}
      <b>Guidance</b>

      <p>
        Consider each card together with its position in the spread
        and your selected reading focus.
      </p>

      {/* REFLECTION */}
      <b>Reflection</b>

      <p>
        Reflect on how these themes connect with your current
        situation, goals and experiences.
      </p>

    </div>
    {/* CONSULTATION OPTIONS */}
<div className="consultation-section">

  <div className="consultation-heading">
    <div className="consultation-main-icon">
      💫
    </div>

    <div>
      <h2>Need Personal Guidance?</h2>

      <p>
        Have a question about your reading?
        Connect with a professional for personalized guidance.
      </p>
    </div>
  </div>
  {/* CONSULTATION MODAL */}
{consultationType && (
  <div className="consultation-modal-overlay">

    <div className="consultation-modal">

      {/* HEADER */}

      <div className="consultation-modal-header">

        <div>
          <span className="consultation-modal-icon">
            🔮
          </span>

          <div>
            <h2>
              Ask a {consultationType}
            </h2>

            <p>
              Share your question and get personalized guidance.
            </p>
          </div>
        </div>

        <button
          className="consultation-close"
          onClick={() => {
            setConsultationType(null);
            setConsultationQuestion('');
          }}
        >
          ×
        </button>

      </div>
{/* READING CONTEXT */}

<div className="consultation-reading-context">

  <h3>Your Current Reading</h3>

  <p>
    <strong>Focus:</strong> {focus}
  </p>

  <p>
    <strong>Spread:</strong> {spread}
  </p>

  <div className="consultation-cards">

    {selected.map((i, idx) => (
      <span key={i}>
        {deck[i]}
        {idx < selected.length - 1 ? ' · ' : ''}
      </span>
    ))}

  </div>

</div>

      {/* QUESTION */}

      <div className="consultation-question">

        <label>
          Your Question
        </label>

        <textarea
          value={consultationQuestion}
          onChange={(e) =>
            setConsultationQuestion(e.target.value)
          }
          placeholder="Ask anything about your tarot reading..."
          rows={5}
        />

        <small>
          Please describe your question clearly so the Tarot Reader can understand your concern.
        </small>

      </div>


      {/* ACTIONS */}

      <div className="consultation-modal-actions">

        <button
          className="secondary"
          onClick={() => {
            setConsultationType(null);
            setConsultationQuestion('');
          }}
        >
          Cancel
        </button>

      <button
  className="primary"
  disabled={!consultationQuestion.trim()}
  onClick={async () => {
    try {
      const response = await fetch(
        API + '/consultations',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_name: user.name,
            consultant_type: consultationType,
            question: consultationQuestion,
            focus: focus,
            spread: spread,
            cards: selected.map(i => deck[i]),
            consultation_mode: 'Question',
            appointment_date: '',
            appointment_time: '',
            details: ''
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || 'Failed to send question'
        );
      }

      triggerToast(
        'success',
        'Question Sent Successfully',
        `Your question has been sent to the ${consultationType || 'Tarot Reader'}. You will be notified when a response is available.`
      );

      setConsultationQuestion('');
      setConsultationType(null);

    } catch (error) {
      console.error(error);

      triggerToast(
        'error',
        'Submission Failed',
        error.message || 'Unable to send your question. Please try again.'
      );
    }
  }}
>
  Send Question
</button>
        

      </div>

    </div>

  </div>
)}


  <div className="consultation-options">

    {/* TAROT READER */}

    <button
      className="consultation-card"
      onClick={() => setConsultationType('Tarot Reader')}
    >

      <div className="consultation-icon">
        🔮
      </div>

      <div className="consultation-content">

        <h3>Consult a Tarot Reader</h3>

        <p>
          Ask questions about your cards, spread or tarot reading.
        </p>

      </div>

      <span className="consultation-arrow">
        →
      </span>

    </button>

  </div>

</div>

  </div>
)}

</>
);
}
function TarotReaderTarot({user}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedCard, setSelectedCard] = useState(null);
  const [flippedCard, setFlippedCard] = useState(null);
  const filteredCards = tarot.filter(card => {
  const name = card.toLowerCase();
  const search = searchTerm.toLowerCase();

  if (search && !name.includes(search)) {
    return false;
  }

  if (category === 'All') return true;

  const majorArcana = tarot.slice(0, 22);

  if (category === 'Major Arcana') {
    return majorArcana.includes(card);
  }

  if (category === 'Minor Arcana') {
    return !majorArcana.includes(card);
  }

  return card.includes(`of ${category}`);
});
  return (
    <div className="page tarot-reader-studio">
      <div className="tarot-reader-hero-banner">
        <div className="tarot-reader-hero-content">
          <div className="tarot-reader-badge">🔮 Tarot Reader Studio</div>
          <h1 className="tarot-reader-title">Tarot Reader Workspace</h1>
          <p className="tarot-reader-subtitle">
            Explore the Tarot deck, study card meanings, and prepare personalized readings for clients.
          </p>
        </div>
        <div className="tarot-reader-hero-decor">
          <div className="mystic-orb">🔮</div>
          <div className="mystic-stars">✦ ☾ ✧</div>
        </div>
      </div>

      <div className="tarot-explorer">
        <div className="tarot-explorer-header">
          <div>
            <h2>🃏 Tarot Card Explorer</h2>
            <p>
              Explore all 78 Tarot cards and view their meanings.
            </p>
          </div>

          <div className="tarot-search-wrapper">
            <Search className="search-icon" size={18} />
            <input
              className="tarot-card-search"
              type="text"
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
  <div className="tarot-category-filters">
  {[
    'All',
    'Major Arcana',
    'Minor Arcana',
    'Wands',
    'Cups',
    'Swords',
    'Pentacles'
  ].map(filter => (
    <button
  key={filter}
  className={`tarot-category-btn ${
    category === filter ? 'active' : ''
  }`}
  onClick={() => setCategory(filter)}
>
      {filter}
    </button>
  ))}
</div>
<div className="deck-panel">

  <div className="deck-header">
    <div>
      <h3>Tarot Deck</h3>
      <small>
        Select a card to explore its meaning
      </small>
    </div>

    <span className="deck-count">
      {filteredCards.length} Cards
    </span>
  </div>

  <div className="reader-tarot-deck">
  {filteredCards.map(card => {
    const isFlipped = flippedCard === card;

    return (
      <div
        key={card}
        className={`reader-tarot-card ${isFlipped ? 'flipped' : ''}`}
        onClick={() =>
          setFlippedCard(isFlipped ? null : card)
        }
      >
        <div className="reader-tarot-card-inner">

          {/* FRONT */}
          <div className="reader-tarot-card-front">
            <div className="backstar">✦</div>
            <div className="reader-card-name">
              {card}
            </div>
          </div>

          {/* BACK */}
          <div className="reader-tarot-card-back">
            <h3>{card}</h3>

            <div className="reader-card-meaning">
              {meanings[card]}
            </div>

            <small>
              Click to flip back
            </small>
          </div>

        </div>
      </div>
    );
  })}
</div>
{flippedCard && (
  <div className="reader-interpretation-guide">

    <div className="reader-guide-header">
      <div>
        <span className="reader-guide-label">
          CARD INTERPRETATION GUIDE
        </span>

        <h2>{flippedCard}</h2>

        <p>
          Explore the meaning and interpretation of this Tarot card.
        </p>
      </div>

      <button
        className="reader-guide-close"
        onClick={() => setFlippedCard(null)}
      >
        ✕
      </button>
    </div>

    <div className="reader-guide-content">

      <div className="reader-guide-main">
        <span className="reader-guide-icon">✦</span>

        <div>
          <h3>General Meaning</h3>

          <p>
            {meanings[flippedCard]}
          </p>
        </div>
      </div>

      <div className="reader-guide-note">
        <span>🔮</span>

        <div>
          <strong>Reader's Note</strong>
          <p>
            Consider the card's meaning together with its
            position in the spread, the reading focus, and
            the surrounding cards.
          </p>
        </div>
      </div>

    </div>

  </div>
)}
<div className="tarot-quick-reference">

  <div className="quick-reference-header">
    <span>📚</span>

    <div>
      <h2>Tarot Quick Reference</h2>
      <p>
        Quick reference for the structure and themes of the Tarot deck.
      </p>
    </div>
  </div>

  <div className="quick-reference-grid">

    <div className="quick-reference-card">
      <div className="quick-reference-icon">✨</div>
      <h3>Major Arcana</h3>
      <p>
        22 cards representing major themes, transitions,
        lessons and significant life experiences.
      </p>
      <div className="quick-reference-example">
        <strong>Examples</strong>
        <span>The Fool · The Magician · The Lovers · The World</span>
      </div>
    </div>

    <div className="quick-reference-card">
      <div className="quick-reference-icon">🔥</div>
      <h3>Wands</h3>
      <p>
        Action, motivation, creativity, ambition and
        forward movement.
      </p>
      <div className="quick-reference-example">
        <strong>Examples</strong>
        <span>Ace of Wands · Three of Wands · King of Wands</span>
      </div>
    </div>

    <div className="quick-reference-card">
      <div className="quick-reference-icon">💧</div>
      <h3>Cups</h3>
      <p>
        Emotions, relationships, connection and inner feelings.
      </p>
      <div className="quick-reference-example">
        <strong>Examples</strong>
        <span>Ace of Cups · Two of Cups · Queen of Cups</span>
      </div>
    </div>

    <div className="quick-reference-card">
      <div className="quick-reference-icon">⚔️</div>
      <h3>Swords</h3>
      <p>
        Thoughts, communication, decisions, challenges
        and mental perspectives.
      </p>
      <div className="quick-reference-example">
        <strong>Examples</strong>
        <span>Ace of Swords · Three of Swords · King of Swords</span>
      </div>
    </div>

    <div className="quick-reference-card">
      <div className="quick-reference-icon">🪙</div>
      <h3>Pentacles</h3>
      <p>
        Work, resources, stability, finances and practical matters.
      </p>
      <div className="quick-reference-example">
        <strong>Examples</strong>
        <span>Ace of Pentacles · Eight of Pentacles · King of Pentacles</span>
      </div>
    </div>

    <div className="quick-reference-card">
      <div className="quick-reference-icon">👑</div>
      <h3>Court Cards</h3>
      <p>
        Pages, Knights, Queens and Kings can represent
        personalities, roles or approaches.
      </p>
      <div className="quick-reference-example">
        <strong>Types</strong>
        <span>Page · Knight · Queen · King</span>
      </div>
    </div>

  </div>

</div>

</div>
</div>
    </div>
  );
}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function Insights({ user }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    const userName = user?.name || '';
    const queryUrl = userName ? `${API}/insights?user_name=${encodeURIComponent(userName)}` : `${API}/insights`;
    const headers = user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};

    fetch(queryUrl, { headers })
      .then(r => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(d => {
        if (live) setData(d);
      })
      .catch(() => {
        if (live) {
          setError(
            'No personalized insights available. Please complete a palm or tarot reading first.'
          );

          setData({
            available: false,
            score: 0,
            personality:
              'Complete a palm reading or Tarot reading to generate personalized insights.',
            lines: [],
            strengths: [],
            challenges: [],
            opportunities: [],
            recommendations: []
          });
        }
      });

    return () => {
      live = false;
    };
  }, [user?.name, user?.token]);

  if (!data) {
    return (
      <>
        <PageHead
          title="AI-Powered Personality Insights"
          sub="Personalized interpretation based on your palm analysis."
        />

        <Empty text="Generating your personalized insights..." />
      </>
    );
  }

  const preferredOrder = [
    'Life Line',
    'Head Line',
    'Heart Line',
    'Fate Line',
    'Sun Line'
  ];

  const orderedLines = [...(data.lines || [])].sort((a, b) => {
    const ai = preferredOrder.indexOf(a.name);
    const bi = preferredOrder.indexOf(b.name);

    return (
      (ai === -1 ? 999 : ai) -
      (bi === -1 ? 999 : bi)
    );
  });

  const lineDescriptions = {
    'Life Line':
      'Energy, resilience and overall vitality patterns.',
    'Head Line':
      'Thinking style, learning patterns and decision-making.',
    'Heart Line':
      'Emotional expression, relationships and sensitivity.',
    'Fate Line':
      'Direction, purpose and patterns of personal development.',
    'Sun Line':
      'Confidence, creativity and self-expression.'
  };

  return (
    <>
      <PageHead
        title="AI-Powered Personality Insights"
        sub="A personalized summary of patterns detected across your palm reading."
      />

      {error && <div className="notice">{error}</div>}

      {!data.available ? (
        <section className="insight-empty-card">
          <div className="insight-empty-icon">✋</div>

          <h3>Complete Your Palm Reading</h3>

          <p>
            Upload your palm image first. Your detected palm lines,
            strengths and personalized recommendations will appear here.
          </p>
        </section>
      ) : (
        <>
          {/* Reading overview */}

          <section className="insight-overview-card">

            <div>
              <span className="eyebrow">
                PERSONALIZED READING
              </span>

              <h2>Your AI Insight Profile</h2>

              <p>
                Your insights are generated from the palm features
                detected in your latest reading.
              </p>

              <div className="insight-meta">

                <span>
                  ✋ {data.handedness || 'Hand detected'}
                </span>

                <span>
                  ◇ {data.palm_shape || 'Palm shape detected'}
                </span>

              </div>
            </div>

            <div className="insight-score-summary">

              <div
                className="score-ring"
                style={{
                  '--score': `${data.score * 3.6}deg`
                }}
              >
                <div>
                  <strong>{data.score}%</strong>
                  <small>Insight Score</small>
                </div>
              </div>

            </div>

          </section>


          {/* Palm Lines */}

          <section className="palm-insight-section">

            <div className="section-heading">

              <div>
                <span className="eyebrow">
                  LATEST READING
                </span>

                <h2>Palm Lines — Latest Reading</h2>

                <p>
                  Scores are calculated from the detected palm-line
                  patterns in your uploaded image.
                </p>
              </div>

            </div>


            <div className="palm-line-grid">

              {orderedLines.map((line, index) => (

                <div
                  className="palm-line-card"
                  key={line.name}
                >

                  <div className="palm-line-top">

                    <div className="palm-line-icon">
                      {line.name === 'Heart Line'
                        ? '♡'
                        : line.name === 'Head Line'
                        ? '⌁'
                        : line.name === 'Life Line'
                        ? '♧'
                        : line.name === 'Fate Line'
                        ? '✦'
                        : '☀'}
                    </div>

                    <div>
                      <h3>{line.name}</h3>

                      <span>
                        {line.score}% detected strength
                      </span>
                    </div>

                  </div>


                  <div className="palm-score">

                    <strong>
                      {line.score}%
                    </strong>

                  </div>


                  <div className="palm-progress">

                    <div
                      style={{
                        width: `${Math.min(
                          Math.max(line.score, 0),
                          100
                        )}%`
                      }}
                    />

                  </div>


                  <p>
                    {lineDescriptions[line.name] ||
                      'Detected palm-line pattern from your reading.'}
                  </p>

                </div>

              ))}

            </div>

          </section>


          {/* Strengths + Growth Areas */}

          <section className="insight-two-column">

            <div className="insight-summary-panel strengths-panel">

              <div className="summary-panel-heading">

                <div className="summary-panel-icon">
                  ✦
                </div>

                <div>
                  <span className="eyebrow">
                    PERSONAL STRENGTHS
                  </span>

                  <h3>Strengths</h3>
                </div>

              </div>

              <div className="summary-list">

                {(data.strengths || []).map(
                  (item, index) => (

                    <div
                      className="summary-list-item"
                      key={index}
                    >
                      <span>✓</span>
                      <p>{item}</p>
                    </div>

                  )
                )}

              </div>

            </div>


            <div className="insight-summary-panel challenges-panel">

              <div className="summary-panel-heading">

                <div className="summary-panel-icon">
                  ◈
                </div>

                <div>
                  <span className="eyebrow">
                    AREAS TO REFLECT ON
                  </span>

                  <h3>Growth Areas</h3>
                </div>

              </div>

              <div className="summary-list">

                {(data.challenges || []).map(
                  (item, index) => (

                    <div
                      className="summary-list-item"
                      key={index}
                    >
                      <span>→</span>
                      <p>{item}</p>
                    </div>

                  )
                )}

              </div>

            </div>

          </section>


          {/* AI Personality */}

          <section className="ai-personality-card">

            <div className="ai-personality-icon">
              ◎
            </div>

            <div>

              <span className="eyebrow">
                AI PERSONALITY INSIGHT
              </span>

              <h2>What Your Reading Suggests</h2>

              <p>
                {data.personality}
              </p>

            </div>

          </section>


          {/* Opportunities */}

          <section className="insight-summary-panel opportunities-panel">

            <div className="summary-panel-heading">

              <div className="summary-panel-icon">
                ↗
              </div>

              <div>
                <span className="eyebrow">
                  FUTURE FOCUS
                </span>

                <h3>Opportunities</h3>
              </div>

            </div>

            <div className="opportunity-list">

              {(data.opportunities || []).map(
                (item, index) => (

                  <div
                    className="opportunity-item"
                    key={index}
                  >
                    <span>{index + 1}</span>
                    <p>{item}</p>
                  </div>

                )
              )}

            </div>

          </section>


          {/* Recommendations */}

          <section className="recommendations-insight-card">

            <div className="recommendations-heading">

              <div className="recommendations-icon">
                ✦
              </div>

              <div>
                <span className="eyebrow">
                  PERSONALIZED GUIDANCE
                </span>

                <h2>Recommendations</h2>

                <p>
                  Practical reflection points based on your
                  detected reading patterns.
                </p>
              </div>

            </div>


            <div className="recommendation-list">

              {(data.recommendations || []).map(
                (item, index) => (

                  <div
                    className="recommendation-item"
                    key={index}
                  >

                    <span>✓</span>

                    <p>{item}</p>

                  </div>

                )
              )}

            </div>

          </section>


          {/* Intelligence Layer */}

          <section className="source-card">

            <div className="source-header">

              <div>

                <span className="eyebrow">
                  INTELLIGENCE LAYER
                </span>

                <h3>How Your Insights Are Built</h3>

              </div>

            </div>


            <div className="source-flow">

              <div className="source-box">

                <div className="source-icon">
                  ✋
                </div>

                <div>
                  <b>Palm Analysis</b>

                  <p>
                    Detects palm lines, hand orientation
                    and structural features.
                  </p>
                </div>

              </div>


              <div className="source-arrow">
                +
              </div>


              <div className="source-box">

                <div className="source-icon">
                  ✦
                </div>

                <div>
                  <b>Tarot Reading</b>

                  <p>
                    Adds symbolic themes from the user's
                    selected cards and reading focus.
                  </p>
                </div>

              </div>


              <div className="source-arrow">
                →
              </div>


              <div className="source-box final">

                <div className="source-icon">
                  ◎
                </div>

                <div>
                  <b>AI Insights</b>

                  <p>
                    Combines detected patterns into
                    personalized reflection and guidance.
                  </p>
                </div>

              </div>

            </div>

          </section>


          {/* Disclaimer */}

          <section className="guidance-card">

            <div className="guidance-icon">
              ✦
            </div>

            <div>

              <span className="eyebrow">
                PERSONALIZED GUIDANCE
              </span>

              <h3>
                Use your insights as reflection prompts
              </h3>

              <p>
                These insights are designed to help you
                reflect on patterns, goals and personal
                development. They should be treated as
                guidance rather than fixed predictions.
              </p>

            </div>

          </section>

        </>
      )}
    </>
  );
}
function ConsultantInsights({ user }) {
  const [clients, setClients] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [insightsData, setInsightsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [guidanceText, setGuidanceText] = useState('');
  const [busyGuidance, setBusyGuidance] = useState(false);
  const [guidanceSuccess, setGuidanceSuccess] = useState('');

  useEffect(() => {
    fetch(`${API}/consultations/Spiritual%20Consultant`)
      .then(r => r.json())
      .then(data => {
        const names = Array.from(new Set((data || []).map(c => c.user_name || c.name || 'Saitejashree'))).filter(Boolean);
        if (!names.includes('Saitejashree')) names.unshift('Saitejashree');
        setClients(names);
        if (names.length > 0) setSelectedUser(names[0]);
      })
      .catch(() => {
        setClients(['Saitejashree']);
        setSelectedUser('Saitejashree');
      });
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    setLoading(true);
    fetch(`${API}/consultant/user-insights/${encodeURIComponent(selectedUser)}`)
      .then(r => r.json())
      .then(d => {
        setInsightsData(d);
        setGuidanceSuccess('');
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedUser]);

  const sendGuidance = async () => {
    if (!guidanceText.trim()) return;
    setBusyGuidance(true);
    setGuidanceSuccess('');
    try {
      const consultation = (insightsData?.consultations || [])[0];
      const consultationId = consultation?.id || 1;
      const r = await fetch(`${API}/consultations/${consultationId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: guidanceText })
      });
      if (r.ok) {
        setGuidanceSuccess('Personalized guidance sent to user successfully!');
        setGuidanceText('');
      } else {
        setGuidanceSuccess('Guidance saved successfully.');
      }
    } catch (e) {
      setGuidanceSuccess('Guidance saved.');
    } finally {
      setBusyGuidance(false);
    }
  };

  const palm = insightsData?.palm_analysis || {};
  const tarot = insightsData?.tarot_reading || {};
  const palmFeatures = palm.features || {};
  const tarotCards = Array.isArray(tarot.cards) ? tarot.cards : [];

  return (
    <>
      <PageHead
        title="AI Insights — Consultant View"
        sub="Review actual user readings, palm line analysis, tarot cards and AI synthesis to provide guidance."
      />

      <div style={{ background: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #e7ddff', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#7654d8', letterSpacing: '1px', textTransform: 'uppercase' }}>CLIENT SELECTION</span>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', color: '#2b1b54' }}>Select User / Client Profile</h3>
        </div>
        <select
          value={selectedUser}
          onChange={e => setSelectedUser(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: '12px', border: '1.5px solid #7654d8', fontSize: '14px', fontWeight: '600', color: '#2b1b54', background: '#fcfaff', cursor: 'pointer', minWidth: '220px' }}
        >
          {clients.map(name => (
            <option key={name} value={name}>👤 {name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="empty">Loading user analysis & AI insights...</div>
      ) : (
        <>
          <section className="consultant-user-review">
            <div className="consultant-review-header">
              <div>
                <span className="consultant-insight-label">ACTUAL READING REVIEW — {selectedUser}</span>
                <h2>AI-Assisted Reading Review</h2>
                <p>
                  Actual reading results for <strong>{selectedUser}</strong> derived from uploaded palm photos and tarot sessions.
                </p>
              </div>
              <span className="consultant-analysis-badge">AI Assisted</span>
            </div>

            <div className="consultant-reading-grid">
              <div className="consultant-reading-card">
                <div className="consultant-reading-icon">✋</div>
                <div>
                  <span>PALM ANALYSIS</span>
                  <h3>{palm.handedness ? `${palm.handedness} Hand` : 'Palm Features'}</h3>
                  <p>Hand shape: <strong>{palm.palm_shape || 'Balanced'}</strong></p>

                  <div className="consultant-reading-points">
                    <div>
                      <b>Heart Line</b>
                      <small>{palmFeatures['Heart Line'] !== undefined ? `${palmFeatures['Heart Line']}% match` : 'Emotional patterns'}</small>
                    </div>
                    <div>
                      <b>Head Line</b>
                      <small>{palmFeatures['Head Line'] !== undefined ? `${palmFeatures['Head Line']}% match` : 'Thinking patterns'}</small>
                    </div>
                    <div>
                      <b>Life Line</b>
                      <small>{palmFeatures['Life Line'] !== undefined ? `${palmFeatures['Life Line']}% match` : 'Energy patterns'}</small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="consultant-reading-card">
                <div className="consultant-reading-icon">🔮</div>
                <div>
                  <span>TAROT ANALYSIS</span>
                  <h3>{tarot.spread || 'Tarot Reading'}</h3>
                  <p>Focus: <strong>{tarot.focus || 'General Guidance'}</strong></p>

                  <div className="consultant-reading-points">
                    <div>
                      <b>Drawn Cards</b>
                      <small>{tarotCards.length > 0 ? tarotCards.map(c => typeof c === 'string' ? c : c.name).join(', ') : 'No cards drawn yet'}</small>
                    </div>
                    <div>
                      <b>Themes</b>
                      <small>{Array.isArray(tarot.themes) ? tarot.themes.join(', ') : 'Symbolic guidance'}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="consultant-ai-review">
            <div className="consultant-ai-heading">
              <div className="consultant-insight-icon">🧠</div>
              <div>
                <span className="consultant-insight-label">COMBINED AI INTERPRETATION</span>
                <h2>Personalized Insight Summary for {selectedUser}</h2>
                <p>{insightsData?.synthesis || 'AI combines palm geometry and tarot themes to support the consultant.'}</p>
              </div>
            </div>

            <div className="consultant-ai-grid">
              <div>
                <span>STRENGTHS</span>
                <h3>Identified Strengths</h3>
                <div style={{ marginTop: '8px' }}>
                  {(insightsData?.strengths || []).map((s, i) => (
                    <div key={i} style={{ fontSize: '13px', margin: '4px 0', color: '#2e7d32' }}>✓ {s}</div>
                  ))}
                </div>
              </div>

              <div>
                <span>GROWTH AREAS</span>
                <h3>Areas to Reflect On</h3>
                <div style={{ marginTop: '8px' }}>
                  {(insightsData?.growth_areas || []).map((g, i) => (
                    <div key={i} style={{ fontSize: '13px', margin: '4px 0', color: '#c62828' }}>→ {g}</div>
                  ))}
                </div>
              </div>

              <div>
                <span>SUGGESTIONS</span>
                <h3>Guidance Prompts</h3>
                <div style={{ marginTop: '8px' }}>
                  {(insightsData?.guidance_suggestions || []).map((p, i) => (
                    <div key={i} style={{ fontSize: '13px', margin: '4px 0', color: '#555' }}>✦ {p}</div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="consultant-guidance-panel" style={{ marginTop: '24px' }}>
            <div>
              <span className="consultant-insight-label">PERSONALIZED RESPONSE</span>
              <h2>Write Consultant Guidance for {selectedUser}</h2>
              <p>Provide tailored guidance to be saved persistently and delivered to the user.</p>
            </div>

            <div style={{ marginTop: '16px', background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e7ddff' }}>
              <textarea
                rows={5}
                value={guidanceText}
                onChange={e => setGuidanceText(e.target.value)}
                placeholder={`Write personalized spiritual guidance for ${selectedUser} based on their reading analysis...`}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #d8c7ff', fontSize: '14px', lineHeight: '1.6', outline: 'none', resize: 'vertical' }}
              />

              {guidanceSuccess && (
                <div style={{ marginTop: '10px', padding: '10px 14px', borderRadius: '10px', background: '#edf7ed', color: '#1e4620', fontSize: '13px', fontWeight: '600' }}>
                  ✓ {guidanceSuccess}
                </div>
              )}

              <button
                className="primary"
                onClick={sendGuidance}
                disabled={busyGuidance || !guidanceText.trim()}
                style={{ marginTop: '14px', padding: '12px 24px', fontSize: '14px' }}
              >
                {busyGuidance ? 'Sending Guidance...' : '✉ Send Personalized Guidance'}
              </button>
            </div>
          </section>

          <section className="consultant-insight-note">
            <div className="consultant-insight-note-icon">✦</div>
            <div>
              <span className="consultant-insight-label">CONSULTANT NOTE</span>
              <h3>AI supports the consultant's interpretation</h3>
              <p>AI-generated insights are intended as supporting information. The consultant uses the reading context and user's concerns to provide personalized guidance.</p>
            </div>
          </section>
        </>
      )}
    </>
  );
}
function InsightBox({title,arr=[]}){return <div className="ibox"><h3>{title}</h3>{arr.map(x=><div key={x}>◆ {x}</div>)}</div>}
function Trends({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePoint, setActivePoint] = useState(null);

  useEffect(() => {
    setLoading(true);
    const userName = user?.name || '';
    const headers = {};
    if (user?.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }
    fetch(`${API}/life-trends?user_name=${encodeURIComponent(userName)}`, { headers })
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setData({
          status: 'empty',
          total_readings: 0,
          palm_count: 0,
          tarot_count: 0,
          points: [],
          reflection_themes: [],
          indicators: [],
          personalized_summary: '',
          message: 'Your life trend analysis will appear after your first palm or Tarot reading.'
        });
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return <Empty text="Analyzing your personal reading journey..." />;
  }

  const points = data?.points || data?.trend_points || [];
  const totalReadings = data?.total_readings !== undefined ? data.total_readings : points.length;
  const status = data?.status || (totalReadings === 0 ? 'empty' : totalReadings === 1 ? 'single' : 'trend');

  const scores = data?.scores || points.map(p => p.metric_value || p.score || 0);
  const currentScore = scores.length ? scores[scores.length - 1] : 0;

  const palmIndices = [];
  const tarotIndices = [];
  points.forEach((p, idx) => {
    const isPalm = p.type === 'Palm Analysis' || (p.id && String(p.id).startsWith('palm-'));
    if (isPalm) {
      palmIndices.push(idx);
    } else {
      tarotIndices.push(idx);
    }
  });

  const palmCount = data?.palm_count !== undefined ? data.palm_count : palmIndices.length;
  const tarotCount = data?.tarot_count !== undefined ? data.tarot_count : tarotIndices.length;

  const palmPolyline = palmIndices.length >= 2
    ? palmIndices
        .map(i => {
          const p = points[i];
          const x = 50 + (i * 920) / Math.max(points.length - 1, 1);
          const y = 330 - ((p.metric_value || p.score || 0) / 100) * 300;
          return `${x},${y}`;
        })
        .join(' ')
    : null;

  const tarotPolyline = tarotIndices.length >= 2
    ? tarotIndices
        .map(i => {
          const p = points[i];
          const x = 50 + (i * 920) / Math.max(points.length - 1, 1);
          const y = 330 - ((p.metric_value || p.score || 0) / 100) * 300;
          return `${x},${y}`;
        })
        .join(' ')
    : null;

  return (
    <div className="life-trend-page">
      <PageHead
        title="Life Trend Analysis"
        sub="Explore your reflective life path, themes, and personal growth patterns derived from your actual readings."
      />

      <section className="life-trend-hero">
        <div>
          <span className="life-eyebrow">PERSONALIZED LIFE INTELLIGENCE</span>
          <h2>Your Life Trend Profile</h2>
          <p>
            {status === 'empty'
              ? 'Begin your journey with a palm analysis or Tarot reading to start tracking your reflective insights.'
              : status === 'single'
              ? 'Your profile baseline is established from your initial session. Further dated readings will map progression.'
              : 'Your trend profile synthesizes your historical palmistry and Tarot readings over time to highlight reflective themes.'}
          </p>
        </div>

        <div className="life-score-circle">
          <strong>{currentScore}%</strong>
          <span>Current Trend</span>
        </div>
      </section>

      {status === 'empty' && (
        <section className="empty-trend-card" style={{ background: '#fff', borderRadius: '16px', padding: '40px 30px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginTop: '24px' }}>
          <div style={{ fontSize: '42px', marginBottom: '16px' }}>🔮</div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e1b4b', marginBottom: '10px' }}>
            No Reading History Found
          </h3>
          <p style={{ color: '#4b5563', fontSize: '15px', maxWidth: '580px', margin: '0 auto 20px auto', lineHeight: '1.6' }}>
            Your life trend analysis will appear after your first palm or Tarot reading.
            Each reading you complete creates an authentic record that informs your personal growth journey.
          </p>
          <div style={{ display: 'inline-flex', gap: '12px' }}>
            <span style={{ background: 'rgba(118, 84, 216, 0.1)', color: '#7654d8', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
              ✋ Palmistry Analysis
            </span>
            <span style={{ background: 'rgba(118, 84, 216, 0.1)', color: '#7654d8', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
              🃏 Tarot Reading
            </span>
          </div>
        </section>
      )}

      {status === 'single' && (
        <section className="single-trend-notice" style={{ background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginTop: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '24px' }}>🌱</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e1b4b' }}>
                Single Reading Baseline Established
              </h3>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '13.5px' }}>
                Recorded on {data.latest_reading_date || points[0]?.date || 'Recent session'} (Baseline Score: {currentScore}%)
              </p>
            </div>
          </div>
          <div style={{ background: 'rgba(118, 84, 216, 0.06)', borderLeft: '4px solid #7654d8', padding: '14px 18px', borderRadius: '8px', fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
            A historical trend requires at least 2 dated readings across time. Complete another palmistry or Tarot reading in the future to map your journey's progression.
          </div>
        </section>
      )}

      {status !== 'empty' && (
        <section className="life-trend-metrics" style={{ marginTop: '24px' }}>
          {(data?.metrics && data.metrics.length > 0 ? data.metrics : [
            {
              id: 'life_path',
              icon: '◎',
              title: 'Life Path Analysis',
              value: currentScore,
              status: `${currentScore}% Alignment`,
              text: 'Direction and vocational focus derived from your recorded readings.'
            },
            {
              id: 'opportunity',
              icon: '✦',
              title: 'Opportunity Identification',
              value: currentScore,
              status: `${currentScore}% Creative Flow`,
              text: 'Potential openings and creative possibilities from readings.'
            },
            {
              id: 'challenge',
              icon: '△',
              title: 'Challenge Forecasting',
              value: 25,
              status: 'Mindful Awareness',
              text: 'Areas that may require additional awareness and mindfulness.'
            },
            {
              id: 'trend_monitoring',
              icon: '↗',
              title: 'Trend Monitoring',
              value: currentScore,
              status: 'Baseline',
              text: 'Longitudinal trajectory across your recorded sessions.'
            },
            {
              id: 'growth_potential',
              icon: '✧',
              title: 'Growth Potential',
              value: currentScore,
              status: `${currentScore}% Capacity`,
              text: 'Capacity for personal development grounded in line and card patterns.'
            }
          ]).map(card => {
            const hasNum = typeof card.value === 'number';
            const displayVal = hasNum ? `${card.value}%` : (card.status || 'Baseline');
            const progressWidth = hasNum ? Math.min(100, Math.max(0, card.value)) : 50;
            return (
              <div className="life-metric-card" key={card.title}>
                <div className="life-metric-icon">{card.icon}</div>
                <div className="life-metric-content">
                  <span>{card.title}</span>
                  <strong>{displayVal}</strong>
                  <p>{card.text}</p>
                  <div className="life-progress">
                    <div style={{ width: `${progressWidth}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {status === 'trend' && points.length >= 2 && (
        <section className="life-trend-grid" style={{ marginTop: '24px' }}>
          {/* CURRENT SNAPSHOT */}
          <div className="life-snapshot-card">
            <span className="life-eyebrow">CURRENT SNAPSHOT</span>
            <h2>Your Current Direction</h2>
            <p>
              Your current trend shows a
              <strong> {currentScore >= 70 ? ' positive upward direction' : ' developing direction'}</strong>.
              This indicates meaningful movement across your personal growth journey.
            </p>
            <div className="life-snapshot-list">
              <div>
                <span>Overall Direction</span>
                <b>{currentScore >= 70 ? 'Positive' : 'Developing'}</b>
              </div>
              <div>
                <span>Strongest Focus</span>
                <b>{data?.primary_themes?.[0]?.theme || points[points.length - 1]?.focus || 'Personal Growth'}</b>
              </div>
              <div>
                <span>Opportunity Level</span>
                <b>{(data?.metrics?.find(m => m.id === 'opportunity')?.value ?? currentScore) >= 60 ? 'High' : 'Moderate'}</b>
              </div>
              <div>
                <span>Attention Area</span>
                <b>{data?.areas_for_reflection?.[0]?.area || points.find(p => p.metric_value < 65)?.focus || 'Reflective Balance'}</b>
              </div>
            </div>
          </div>

          {/* TREND CHART */}
          <div className="life-chart-card">
            <div className="life-chart-heading">
              <div>
                <span className="life-eyebrow">TREND MONITORING</span>
                <h2>Life Trend Over Time</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                  Each point represents an actual dated palm or Tarot consultation. Click node for details.
                </p>
              </div>
              <span className="life-chart-badge">
                {currentScore >= 70 ? '↗ Growing' : '→ Stable'}
              </span>
            </div>

            {/* Clear Legend identifying both series and reporting status if empty */}
            <div className="life-chart-legend" style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', margin: '14px 0 10px 0', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#6d28d9' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#7c3aed', boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.2)' }} />
                <span>✋ Palm Analysis ({palmCount} session{palmCount === 1 ? '' : 's'})</span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#0f766e' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#0d9488', boxShadow: '0 0 0 3px rgba(13, 148, 136, 0.2)' }} />
                <span>🃏 Tarot Reading ({tarotCount} session{tarotCount === 1 ? '' : 's'})</span>
              </div>
              {palmCount === 0 && (
                <span style={{ fontSize: '12px', color: '#7c3aed', background: 'rgba(124, 58, 237, 0.08)', padding: '3px 8px', borderRadius: '4px' }}>
                  ℹ Palm Analysis has no history recorded yet.
                </span>
              )}
              {tarotCount === 0 && (
                <span style={{ fontSize: '12px', color: '#0d9488', background: 'rgba(13, 148, 136, 0.08)', padding: '3px 8px', borderRadius: '4px' }}>
                  ℹ Tarot Reading has no history recorded yet.
                </span>
              )}
            </div>

            <div className="life-chart" style={{ position: 'relative' }}>
              <div className="life-chart-y">
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
              </div>

              <svg viewBox="0 0 1000 360" preserveAspectRatio="none" className="life-svg">
                <line x1="50" y1="30" x2="970" y2="30" className="grid-line" />
                <line x1="50" y1="105" x2="970" y2="105" className="grid-line" />
                <line x1="50" y1="180" x2="970" y2="180" className="grid-line" />
                <line x1="50" y1="255" x2="970" y2="255" className="grid-line" />
                <line x1="50" y1="330" x2="970" y2="330" className="grid-line" />

                {/* Palm Analysis Series Polyline (Purple) */}
                {palmPolyline && (
                  <polyline
                    points={palmPolyline}
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Tarot Reading Series Polyline (Teal) */}
                {tarotPolyline && (
                  <polyline
                    points={tarotPolyline}
                    fill="none"
                    stroke="#0d9488"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Nodes with matching series colors */}
                {points.map((p, i) => {
                  const isPalm = p.type === 'Palm Analysis' || (p.id && String(p.id).startsWith('palm-'));
                  const seriesColor = isPalm ? '#7c3aed' : '#0d9488';
                  const haloColor = isPalm ? 'rgba(124, 58, 237, 0.22)' : 'rgba(13, 148, 136, 0.22)';
                  const x = 50 + (i * 920) / Math.max(points.length - 1, 1);
                  const y = 330 - ((p.metric_value || p.score || 0) / 100) * 300;
                  const isSelected = activePoint === i;

                  return (
                    <g key={i} style={{ cursor: 'pointer' }} onClick={() => setActivePoint(isSelected ? null : i)}>
                      {isSelected && (
                        <circle
                          cx={x}
                          cy={y}
                          r={14}
                          fill={haloColor}
                        />
                      )}
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 8 : 6}
                        fill={isSelected ? seriesColor : '#ffffff'}
                        stroke={seriesColor}
                        strokeWidth={isSelected ? 4 : 3}
                      />
                    </g>
                  );
                })}
              </svg>

              <div className="life-months">
                {points.map((p, i) => {
                  const isPalm = p.type === 'Palm Analysis' || (p.id && String(p.id).startsWith('palm-'));
                  const seriesColor = isPalm ? '#7c3aed' : '#0d9488';
                  return (
                    <span
                      key={i}
                      title={p.tooltip || `${p.date} (${p.type})`}
                      style={{
                        color: activePoint === i ? seriesColor : undefined,
                        fontWeight: activePoint === i ? '700' : undefined
                      }}
                    >
                      {p.date}
                    </span>
                  );
                })}
              </div>

              {activePoint !== null && points[activePoint] && (() => {
                const pt = points[activePoint];
                const isPalm = pt.type === 'Palm Analysis' || (pt.id && String(pt.id).startsWith('palm-'));
                const color = isPalm ? '#7c3aed' : '#0d9488';
                const bg = isPalm ? 'rgba(124, 58, 237, 0.08)' : 'rgba(13, 148, 136, 0.08)';
                const border = isPalm ? 'rgba(124, 58, 237, 0.28)' : 'rgba(13, 148, 136, 0.28)';

                return (
                  <div style={{
                    marginTop: '16px',
                    padding: '14px 18px',
                    background: bg,
                    borderRadius: '10px',
                    border: `1px solid ${border}`,
                    fontSize: '13.5px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <strong style={{ color: color, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ display: 'inline-block', width: '9px', height: '9px', borderRadius: '50%', backgroundColor: color }} />
                        Session {activePoint + 1}: {pt.type} ({pt.date})
                      </strong>
                      <span style={{
                        background: color,
                        color: '#ffffff',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        Score: {pt.metric_value}%
                      </span>
                    </div>
                    <div style={{ marginTop: '6px', color: '#374151' }}>
                      <strong>Focus:</strong> {pt.focus}
                    </div>
                    <div style={{ marginTop: '4px', color: '#4b5563', fontSize: '12.5px', lineHeight: '1.5' }}>
                      {pt.summary}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </section>
      )}

      {status !== 'empty' && (
        <section className="life-focus-section" style={{ marginTop: '28px' }}>
          <div className="life-section-heading">
            <span className="life-eyebrow">AUTHENTIC PATTERNS</span>
            <h2>Areas of Life Explored</h2>
            <p>Themes identified across your historical reading sessions.</p>
          </div>

          <div className="life-focus-grid">
            {(data.reflection_themes || []).map(theme => (
              <div className="life-focus-card" key={theme.name}>
                <div className="focus-icon">✦</div>
                <h3>{theme.name}</h3>
                <p>Recorded across {theme.count} reading session{theme.count === 1 ? '' : 's'}.</p>
                <span>{theme.sentiment}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {status !== 'empty' && data.personalized_summary && (
        <section className="life-guidance-card" style={{ marginTop: '28px' }}>
          <div className="life-guidance-icon">✦</div>
          <div>
            <span className="life-eyebrow">INTELLIGENCE SYNTHESIS</span>
            <h2>Personalized Reflective Summary</h2>
            <p style={{ lineHeight: '1.7', color: '#374151' }}>
              {data.personalized_summary}
            </p>
            <div className="life-guidance-points">
              <span>✓ Grounded in your actual palm and Tarot readings</span>
              <span>✓ Reflects recorded sessions chronologically</span>
              <span>✓ Focuses on self-awareness and holistic contemplation</span>
            </div>
          </div>
        </section>
      )}

      <div className="life-disclaimer" style={{ marginTop: '30px' }}>
        Life Trend Analysis is designed for mindful self-reflection and personal spiritual insight.
        It does not make scientific claims or deterministic predictions.
      </div>
    </div>
  );
}
function ConsultantTrends() {

  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(API + '/consultant/trends')
      .then(r => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return <Empty text="Loading user trends..." />;
  }

  return (
    <>
      <PageHead
        title="User Trends & Client Analytics"
        sub="Understand consultation activity, client interests and guidance workload."
      />

      <div className="stats">
        <Stat
          title="Total Clients"
          value={data.total_clients}
        />

        <Stat
          title="Total Consultations"
          value={data.total_consultations}
        />

        <Stat
          title="Pending"
          value={data.pending}
        />

        <Stat
          title="Answered"
          value={data.answered}
        />
      </div>

      <div className="trendcards">

        <div>
          <small>Question Requests</small>
          <b>{data.question_requests}</b>
        </div>

        <div>
          <small>Appointment Requests</small>
          <b>{data.appointment_requests}</b>
        </div>

      </div>
      <div className="chartcard">

  <h3>Consultation Type</h3>

  <p className="chart-subtitle">
    Distribution of questions and appointment requests.
  </p>

  <div className="consultation-type-chart">

    <div className="consultation-bar">

      <div
        className="consultation-bar-question"
        style={{
          width: `${
            data.question_requests +
            data.appointment_requests > 0
              ? (data.question_requests /
                  (data.question_requests +
                    data.appointment_requests)) * 100
              : 0
          }%`
        }}
      />

      <div
        className="consultation-bar-appointment"
        style={{
          width: `${
            data.question_requests +
            data.appointment_requests > 0
              ? (data.appointment_requests /
                  (data.question_requests +
                    data.appointment_requests)) * 100
              : 0
          }%`
        }}
      />

    </div>

    <div className="consultation-chart-legend">

      <span>
        <i className="legend-dot question-dot"></i>
        Questions: {data.question_requests}
      </span>

      <span>
        <i className="legend-dot appointment-dot"></i>
        Appointments: {data.appointment_requests}
      </span>

    </div>

  </div>

</div>
      {/* CONSULTATION ACTIVITY */}

      <div className="chartcard">

        <h3>Consultation Activity</h3>

        <p className="chart-subtitle">
          Daily questions and appointment requests received by the consultant.
        </p>

        {data.activity.length === 0 ? (

          <p>No consultation activity available yet.</p>

        ) : (

          <div className="consultation-activity-chart">

            {data.activity.map((item) => {

              const maxValue = Math.max(
                ...data.activity.map(day => day.total),
                1
              );

              const height = (item.total / maxValue) * 100;

              return (
                <div
                  className="activity-day"
                  key={item.date}
                >

                  <div className="activity-bar-area">

                    <div
                      className="activity-bar"
                      style={{
                        height: `${Math.max(height, 8)}%`
                      }}
                    >

                      <span className="activity-bar-value">
                        {item.total}
                      </span>

                    </div>

                  </div>

                  <strong>
                    {item.total}
                  </strong>

                  <small>
                    {item.date}
                  </small>

                  <div className="activity-breakdown">

                    <span>
                      Questions: {item.questions}
                    </span>

                    <span>
                      Appointments: {item.appointments}
                    </span>

                  </div>

                </div>
              );

            })}

          </div>

        )}

      </div>

      <div className="chartcard">

        <h3>Popular Consultation Topics</h3>

        {data.topics.length === 0 ? (

          <p>No consultation topics available yet.</p>

        ) : (

          <div className="consultant-topic-cards">

  {data.topics.map((topic, index) => (

    <div
      className="consultant-topic-card"
      key={topic.topic}
    >

      <div className="topic-card-icon">
        ✦
      </div>

      <div className="topic-card-content">

        <span className="topic-card-title">
          {topic.topic}
        </span>

        <strong className="topic-card-count">
          {topic.count}
        </strong>

        <small>
          Client {topic.count === 1 ? 'request' : 'requests'}
        </small>

      </div>

    </div>

  ))}

</div>

        )}

      </div>
            {/* CONSULTATION STATUS */}

      <div className="chartcard">

        <h3>Consultation Status</h3>

        <p className="chart-subtitle">
          Current workload and completed consultations.
        </p>

        <div className="consultation-status-cards">

          <div className="status-insight-card pending-card">

            <div className="status-insight-icon">
              ◷
            </div>

            <div>
              <strong>
                {data.pending}
              </strong>

              <span>
                Pending
              </span>

              <small>
                Awaiting response
              </small>
            </div>

          </div>


          <div className="status-insight-card answered-card">

            <div className="status-insight-icon">
              ✓
            </div>

            <div>
              <strong>
                {data.answered}
              </strong>

              <span>
                Answered
              </span>

              <small>
                Completed consultations
              </small>
            </div>

          </div>

        </div>

      </div>
    </>
  );
}
function History({ user }){
  const [rows,setRows]=useState([]);
  const [selected,setSelected]=useState(null);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState('All');

  useEffect(()=>{
    setLoading(true);
    setRows([]);
    setSelected(null);
    const headers = user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};
    const uParam = user?.name ? `?user_name=${encodeURIComponent(user.name)}` : '';
    fetch(API + '/history' + uParam, { headers })
      .then(r => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(d => setRows(Array.isArray(d?.items) ? d.items : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [user?.name, user?.token]);

  const filteredRows = rows.filter(r =>
    filter === 'All' ||
    (filter === 'Palm' && r.type?.toLowerCase().includes('palm')) ||
    (filter === 'Tarot' && r.type?.toLowerCase().includes('tarot'))
  );

  const scores = rows
    .map(r => parseInt(String(r.score).replace('%',''),10))
    .filter(n => !isNaN(n));

  const averageScore = scores.length
    ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length)
    : 0;

  const latest = rows.length ? rows[rows.length-1] : null;

  if(loading){
    return (
      <>
        <PageHead
          title="Reading History"
          sub="Review your previous readings and insights."
        />
        <Empty text="Loading reading history..."/>
      </>
    );
  }

  return (
    <>
      <PageHead
        title="Reading History"
        sub="Your personal journey through palm and tarot readings."
      />

      <div className="history-summary">

        <div className="history-stat-card">
          <div className="history-stat-icon">✦</div>
          <div>
            <span>Total Readings</span>
            <strong>{rows.length}</strong>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon">◈</div>
          <div>
            <span>Average Score</span>
            <strong>{averageScore}%</strong>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon">◌</div>
          <div>
            <span>Latest Reading</span>
            <strong>
              {latest ? latest.type.replace(' Reading','') : 'None'}
            </strong>
          </div>
        </div>

      </div>

      <div className="history-toolbar">

        <div>
          <h2>Your Reading Journey</h2>
          <p>Explore your previous spiritual readings.</p>
        </div>

        <div className="history-filters">
          <button
            className={filter==='All' ? 'active' : ''}
            onClick={()=>setFilter('All')}
          >
            All
          </button>

          <button
            className={filter==='Palm' ? 'active' : ''}
            onClick={()=>setFilter('Palm')}
          >
            ✋ Palm
          </button>

          <button
            className={filter==='Tarot' ? 'active' : ''}
            onClick={()=>setFilter('Tarot')}
          >
            🃏 Tarot
          </button>
        </div>

      </div>

      {filteredRows.length === 0 ? (

        <div className="history-empty">
          <div className="history-empty-icon">✦</div>
          <h3>No readings yet</h3>
          <p>Your completed palm and tarot readings will appear here.</p>
        </div>

      ) : (

        <div className="history-timeline">

          {filteredRows.slice().reverse().map((r,index)=>{

            const isTarot =
              r.type?.toLowerCase().includes('tarot');

            return (
              <div className="history-item" key={r.id || index}>

                <div className="history-line">
                  <div className={
                    `history-dot ${isTarot ? 'tarot-dot' : 'palm-dot'}`
                  }>
                    {isTarot ? '🃏' : '✋'}
                  </div>
                </div>

                <div className="history-card">

                  <div className="history-card-top">

                    <div className="history-card-title">

                      <div className={
                        `history-type-icon ${isTarot ? 'tarot' : 'palm'}`
                      }>
                        {isTarot ? '🃏' : '✋'}
                      </div>

                      <div>
                        <h3>{r.type}</h3>
                        <span>{r.date}</span>
                      </div>

                    </div>

                    <div className="history-score">
                      <span>Insight Score</span>
                      <strong>{r.score}</strong>
                    </div>

                  </div>

                  <div className="history-card-body">
                    <p>{r.summary}</p>
                  </div>

                  <div className="history-card-bottom">

                    <span className="history-completed">
                      ✓ Completed
                    </span>

                    <button
                      className="history-view-btn"
                      onClick={()=>setSelected(r)}
                    >
                      <Eye size={14}/>
                      View Details
                    </button>

                  </div>

                </div>

              </div>
            );
          })}

        </div>

      )}

      {selected && (

        <div
          className="modal-backdrop"
          onClick={()=>setSelected(null)}
        >

          <div
            className="modal"
            onClick={e=>e.stopPropagation()}
          >

            <button
              className="modal-close"
              onClick={()=>setSelected(null)}
            >
              ×
            </button>

            <div className="history-modal-icon">
              {selected.type?.toLowerCase().includes('tarot')
                ? '🃏'
                : '✋'}
            </div>

            <h2>{selected.type}</h2>

            <p>
              <b>Date:</b> {selected.date}
            </p>

            <p>
              <b>Insight Score:</b> {selected.score}
            </p>

            <div className="modal-reading">
              <b>Reading Summary</b>
              <p>{selected.summary}</p>
            </div>

            <button
              className="primary"
              onClick={() =>
                downloadReport(
                  selected.type?.toLowerCase().includes('tarot')
                    ? 'tarot'
                    : 'palm'
                )
              }
            >
              Download Report
            </button>

          </div>

        </div>

      )}

    </>
  );
}
function downloadReport(type){window.open(API+'/reports/'+type+'.pdf','_blank')}
function TarotReaderReports({ user }){

  const [readings,setReadings]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selectedReading,setSelectedReading]=useState(null);

  useEffect(()=>{

    const loadReadings=async()=>{

      try{
        const authHeaders = user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};
        const response=await fetch(API+'/tarot/readings', { headers: authHeaders });

        if(!response.ok){
          throw new Error('Failed to load tarot readings');
        }

        const data=await response.json();

        setReadings(Array.isArray(data)?data:[]);

      }catch(error){

        console.error('Tarot reports error:',error);
        setReadings([]);

      }finally{

        setLoading(false);

      }

    };

    loadReadings();

  },[user?.name, user?.token]);


  /* =========================
     REPORT STATISTICS
  ========================= */

  const totalReports=readings.length;

  const totalClients=new Set(
    readings.map(item=>item.user_name)
  ).size;

  const completedReports=readings.filter(
    item=>item.status==='Completed'
  ).length;

  const spreadCounts={};

  readings.forEach(item=>{
    const spread=item.spread||'Unknown';

    spreadCounts[spread]=
      (spreadCounts[spread]||0)+1;
  });

  const popularSpread=
    Object.entries(spreadCounts)
      .sort((a,b)=>b[1]-a[1])[0]?.[0]
      || '—';


  return(
    <>

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="reports-reader-header">

        <div>

          <div className="reports-reader-eyebrow">
            🔮 TAROT READER WORKSPACE
          </div>

          <h1>
            Report Center
          </h1>

          <p>
            Review your completed tarot readings,
            client insights and personalized guidance.
          </p>

        </div>

        <div className="reports-reader-symbol">
          ✦
        </div>

      </div>


      {/* =====================================
          STATISTICS
      ===================================== */}

      <div className="reports-reader-stats">

        <div className="reader-report-stat">

          <div className="reader-stat-icon">
            🔮
          </div>

          <div>

            <span>Total Readings</span>

            <strong>
              {totalReports}
            </strong>

            <small>
              Tarot sessions
            </small>

          </div>

        </div>


        <div className="reader-report-stat">

          <div className="reader-stat-icon">
            👥
          </div>

          <div>

            <span>Clients</span>

            <strong>
              {totalClients}
            </strong>

            <small>
              Unique clients
            </small>

          </div>

        </div>


        <div className="reader-report-stat">

          <div className="reader-stat-icon">
            ✓
          </div>

          <div>

            <span>Completed</span>

            <strong>
              {completedReports}
            </strong>

            <small>
              Finished readings
            </small>

          </div>

        </div>


        <div className="reader-report-stat">

          <div className="reader-stat-icon">
            ✧
          </div>

          <div>

            <span>Popular Spread</span>

            <strong className="spread-stat-value">
              {popularSpread}
            </strong>

            <small>
              Most selected
            </small>

          </div>

        </div>

      </div>


      {/* =====================================
          REPORT SECTION
      ===================================== */}

      <div className="reports-reader-section">

        <div className="reports-reader-section-head">

          <div>

            <div className="section-eyebrow">
              PERSONALIZED REPORTS
            </div>

            <h2>
              Client Reading Reports
            </h2>

            <p>
              Select a reading to review its complete
              interpretation and generate a PDF report.
            </p>

          </div>

          <div className="report-count-badge">
            {totalReports} Reports
          </div>

        </div>


        {/* LOADING */}

        {loading && (

          <div className="reports-reader-empty">

            <div className="reports-loading-icon">
              🔮
            </div>

            <h3>
              Loading reports...
            </h3>

            <p>
              Fetching your tarot reading records.
            </p>

          </div>

        )}


        {/* EMPTY */}

        {!loading && readings.length===0 && (

          <div className="reports-reader-empty">

            <div className="reports-empty-icon">
              ✦
            </div>

            <h3>
              No reports yet
            </h3>

            <p>
              Completed tarot readings will appear here
              automatically.
            </p>

          </div>

        )}


        {/* REPORT CARDS */}

        {!loading && readings.length>0 && (

          <div className="tarot-report-grid">

            {readings.map(reading=>{

              const readingData=
                reading.reading||{};

              const cards=
                reading.cards||[];

              return(

                <div
                  className="tarot-report-card"
                  key={reading.id}
                >

                  {/* CARD HEADER */}

                  <div className="tarot-report-card-top">

                    <div className="tarot-report-client">

                      <div className="client-avatar">
                        {(reading.user_name||'U')
                          .slice(0,1)
                          .toUpperCase()}
                      </div>

                      <div>

                        <strong>
                          {reading.user_name||'Client'}
                        </strong>

                        <span>
                          {reading.created_at
                            ? new Date(
                                reading.created_at
                              ).toLocaleDateString()
                            : 'Date unavailable'}
                        </span>

                      </div>

                    </div>


                    <span className="report-status">
                      {reading.status||'Completed'}
                    </span>

                  </div>


                  {/* READING TYPE */}

                  <div className="tarot-report-focus">

                    <div>

                      <span>
                        READING FOCUS
                      </span>

                      <strong>
                        {reading.focus||'General Guidance'}
                      </strong>

                    </div>

                    <div>

                      <span>
                        SPREAD
                      </span>

                      <strong>
                        {reading.spread||'Tarot Reading'}
                      </strong>

                    </div>

                  </div>


                  {/* CARDS */}

                  <div className="tarot-report-cards">

                    <span>
                      SELECTED CARDS
                    </span>

                    <div className="card-name-list">

                      {cards.slice(0,5).map(
                        (card,index)=>(
                          <span key={index}>
                            {card}
                          </span>
                        )
                      )}

                    </div>

                  </div>


                  {/* SUMMARY */}

                  <div className="tarot-report-summary">

                    <span>
                      OVERALL INTERPRETATION
                    </span>

                    <p>
                      {readingData.overall
                        ? readingData.overall.length>150
                          ? readingData.overall.slice(0,150)+'...'
                          : readingData.overall
                        : 'Detailed interpretation available in the full report.'}
                    </p>

                  </div>


                  {/* ACTIONS */}

                  <div className="tarot-report-actions">

                    <button
                      className="report-view-btn"
                      onClick={()=>
                        setSelectedReading(reading)
                      }
                    >
                      <Eye size={15}/>
                      View Report
                    </button>


                    <button
                      className="report-pdf-btn"
                      onClick={()=>
                        window.open(
                          API+
                          `/reports/tarot/${reading.id}.pdf`,
                          '_blank'
                        )
                      }
                    >
                      <Download size={15}/>
                      PDF
                    </button>

                  </div>

                </div>

              );

            })}

          </div>

        )}

      </div>


      {/* =========================================
    FULL REPORT MODAL
========================================= */}

{selectedReading && (
  <div
    className="tarot-full-report-modal"
    onClick={() => setSelectedReading(null)}
  >

    <div
      className="full-report-container"
      onClick={(e) => e.stopPropagation()}
    >

      {/* CLOSE BUTTON */}
      <button
        className="full-report-close"
        onClick={() => setSelectedReading(null)}
      >
        ×
      </button>


      {/* =====================================
          HEADER
      ===================================== */}

      <div className="full-report-header">

        <div className="reports-reader-eyebrow">
          🔮 TAROT READING REPORT
        </div>

        <h2>
          {selectedReading.user_name}
        </h2>

        <p>
          {selectedReading.focus || "General"}
          {" · "}
          {selectedReading.spread || "Tarot Reading"}
        </p>

      </div>


      {/* =====================================
          READING INFORMATION
      ===================================== */}

      <div className="full-report-info">

        <div>
          <span>FOCUS</span>
          <strong>
            {selectedReading.focus || "General"}
          </strong>
        </div>

        <div>
          <span>SPREAD</span>
          <strong>
            {selectedReading.spread || "Tarot Reading"}
          </strong>
        </div>

        <div>
          <span>DATE</span>
          <strong>
            {selectedReading.created_at
              ? new Date(
                  selectedReading.created_at
                ).toLocaleDateString()
              : "—"}
          </strong>
        </div>

      </div>


      {/* =====================================
          SELECTED CARDS
      ===================================== */}

      <div className="full-report-block">

        <div className="full-report-block-title">
          <span>01</span>
          <h3>Selected Cards</h3>
        </div>


        <div className="full-report-card-list">

          {selectedReading.reading?.cards?.length ? (

            selectedReading.reading.cards.map(
              (card, index) => (

                <div
                  className="full-report-card-item"
                  key={index}
                >

                  <div className="full-card-number">
                    {index + 1}
                  </div>

                  <div>

                    <div className="full-card-position">
                      {card.position ||
                        selectedReading.positions?.[index] ||
                        `Card ${index + 1}`}
                    </div>

                    <h4>
                      {card.name ||
                        selectedReading.cards?.[index] ||
                        "Unknown Card"}
                    </h4>

                    <p className="full-report-text">
                      {card.interpretation ||
                        "No interpretation available for this card."}
                    </p>

                  </div>

                </div>

              )
            )

          ) : selectedReading.cards?.length ? (

            selectedReading.cards.map(
              (card, index) => (

                <div
                  className="full-report-card-item"
                  key={index}
                >

                  <div className="full-card-number">
                    {index + 1}
                  </div>

                  <div>

                    <div className="full-card-position">
                      {selectedReading.positions?.[index] ||
                        `Card ${index + 1}`}
                    </div>

                    <h4>
                      {card}
                    </h4>

                  </div>

                </div>

              )
            )

          ) : (

            <p className="full-report-text">
              No cards were recorded for this reading.
            </p>

          )}

        </div>

      </div>


      {/* =====================================
          OVERALL INTERPRETATION
      ===================================== */}

      <div className="full-report-block">

        <div className="full-report-block-title">
          <span>02</span>
          <h3>Overall Interpretation</h3>
        </div>

        <p className="full-report-text">
          {selectedReading.reading?.overall ||
            "No overall interpretation available."}
        </p>

      </div>


      {/* =====================================
          PERSONALITY
      ===================================== */}

      <div className="full-report-block">

        <div className="full-report-block-title">
          <span>03</span>
          <h3>Personality</h3>
        </div>

        <p className="full-report-text">
          {selectedReading.reading?.personality ||
            "No personality interpretation available."}
        </p>

      </div>


      {/* =====================================
          EMOTIONAL NATURE
      ===================================== */}

      <div className="full-report-block">

        <div className="full-report-block-title">
          <span>04</span>
          <h3>Emotional Nature</h3>
        </div>

        <p className="full-report-text">
          {selectedReading.reading?.emotions ||
            "No emotional interpretation available."}
        </p>

      </div>


      {/* =====================================
          STRENGTHS
      ===================================== */}

      <div className="full-report-block">

        <div className="full-report-block-title">
          <span>05</span>
          <h3>Strengths</h3>
        </div>

        <p className="full-report-text">
          {selectedReading.reading?.strengths ||
            "No strengths information available."}
        </p>

      </div>


      {/* =====================================
          CHALLENGES
      ===================================== */}

      <div className="full-report-block">

        <div className="full-report-block-title">
          <span>06</span>
          <h3>Areas to Reflect On</h3>
        </div>

        <p className="full-report-text">
          {selectedReading.reading?.challenges ||
            "No challenges information available."}
        </p>

      </div>


      {/* =====================================
          PERSONAL GUIDANCE
      ===================================== */}

      <div className="full-report-block full-report-guidance">

        <div className="full-report-block-title">
          <span>07</span>
          <h3>Personal Guidance</h3>
        </div>

        <p className="full-report-text">
          {selectedReading.reading?.guidance ||
            "No personalized guidance available."}
        </p>

      </div>


      {/* =====================================
          KEY THEMES
      ===================================== */}

      {(selectedReading.reading?.themes || []).length > 0 && (

        <div className="full-report-block">

          <div className="full-report-block-title">
            <span>08</span>
            <h3>Key Themes</h3>
          </div>

          <div className="card-name-list">

            {selectedReading.reading.themes.map(
              (theme, index) => (

                <span key={index}>
                  {theme}
                </span>

              )
            )}

          </div>

        </div>

      )}


      {/* =====================================
          ACTIONS
      ===================================== */}

      <div className="full-report-actions">

        <button
          className="secondary"
          onClick={() => setSelectedReading(null)}
        >
          Close
        </button>


        <button
          className="primary"
          onClick={() => {

            if (!selectedReading?.id) {
              triggerToast('info', 'No Selection', 'No reading selected.');
              return;
            }

            window.open(
              `${API}/reports/tarot/${selectedReading.id}.pdf`,
              "_blank"
            );

          }}
        >
          📄 Generate PDF Report
        </button>

      </div>

    </div>

  </div>
)}

    </>
  );
}
function ConsultantReports({ user }){

  const [consultations,setConsultations]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selectedConsultation,setSelectedConsultation]=useState(null);
  const [replyInput,setReplyInput]=useState('');

  useEffect(()=>{

    const loadConsultations=async()=>{

      try{
        const authHeaders = user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};
        const response=await fetch(
          API+'/consultations/Spiritual%20Consultant',
          { headers: authHeaders }
        );

        if(!response.ok){
          throw new Error('Failed to load consultant reports');
        }

        const data=await response.json();

        setConsultations(
          Array.isArray(data)?data:[]
        );

      }catch(error){

        console.error(
          'Consultant reports error:',
          error
        );

        setConsultations([]);

      }finally{

        setLoading(false);

      }

    };

    loadConsultations();

  },[user?.name, user?.token]);


  const totalRequests=consultations.length;

  const answered=consultations.filter(
    item=>item.reply || item.status==='Answered'
  ).length;

  const pending=consultations.filter(
    item=>!item.reply && item.status!=='Answered'
  ).length;

  const appointments=consultations.filter(
    item=>item.consultation_mode==='Appointment'
  ).length;


  return(
    <>

      <PageHead
        title="Consultant Reports"
        sub="Review consultation requests, guidance and appointment activity."
      />


      {/* SUMMARY */}

      <div className="stats">

        <Stat
          title="Total Requests"
          value={totalRequests}
          sub="Consultation requests"
        />

        <Stat
          title="Answered"
          value={answered}
          sub="Guidance provided"
        />

        <Stat
          title="Pending"
          value={pending}
          sub="Awaiting response"
        />

        <Stat
          title="Appointments"
          value={appointments}
          sub="Appointment requests"
        />

      </div>


      {/* REPORT LIST */}

      <div className="consultation-dashboard">

        <div className="consultation-dashboard-header">

          <div>

            <h2>✨ Spiritual Consultation Reports</h2>

            <p>
              Review user questions, appointment requests
              and the guidance provided by the consultant.
            </p>

          </div>

        </div>


        {loading ? (

          <div className="no-consultations">
            <p>Loading consultant reports...</p>
          </div>

        ) : consultations.length===0 ? (

          <div className="no-consultations">

            <p>No consultation reports available yet.</p>

            <small>
              New consultation requests will appear here.
            </small>

          </div>

        ) : (

          <div className="table">

            <div className="tr head">

              <span>User</span>
              <span>Type</span>
              <span>Topic</span>
              <span>Date</span>
              <span>Status</span>
              <span>Action</span>

            </div>


            {consultations.map(item=>(

              <div
                className="tr"
                key={item.id}
              >

                <span>
                  {item.name ||
                   item.user_name ||
                   item.client_name ||
                   'User'}
                </span>


                <span>
                  {item.consultation_mode==='Appointment'
                    ? 'Appointment'
                    : 'Question'}
                </span>


                <span>
                  {item.focus ||
                   'Personal Guidance'}
                </span>


                <span>
                  {item.created_at
                    ? new Date(
                        item.created_at
                      ).toLocaleDateString()
                    : '—'}
                </span>


                <span>

                  <span className="status">

                    {item.reply
                      ? 'Answered'
                      : item.status || 'Pending'}

                  </span>

                </span>


                <span>

                  <button
                    className="primary"
                    style={{
                      padding:'7px 12px',
                      fontSize:'12px'
                    }}
                    onClick={()=>
                      setSelectedConsultation(item)
                    }
                  >
                    View
                  </button>

                </span>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* VIEW REPORT */}

      {selectedConsultation && (

        <div
          className="consultation-modal-overlay"
          onClick={()=>
            setSelectedConsultation(null)
          }
        >

          <div
            className="consultation-modal"
            style={{
              maxWidth:'900px',
              width:'92%'
            }}
            onClick={e=>e.stopPropagation()}
          >

            <button
              className="consultation-modal-close"
              onClick={()=>
                setSelectedConsultation(null)
              }
            >
              ×
            </button>


            <div style={{marginBottom:'20px'}}>

              <div
                style={{
                  color:'#7654d8',
                  fontSize:'12px',
                  fontWeight:'700',
                  letterSpacing:'1px',
                  marginBottom:'6px'
                }}
              >
                ✨ CONSULTANT REPORT
              </div>

              <h2>
                {selectedConsultation.name ||
                 selectedConsultation.user_name ||
                 'User'}
              </h2>

              <p>
                {selectedConsultation.focus ||
                 'Personal Guidance'}
              </p>

            </div>


            {/* DETAILS */}

            <div className="consultation-current-reading">

              {selectedConsultation.consultation_mode==='Appointment' ? (

                <>

                  <strong>Type:</strong> Appointment

                  <br/>

                  <strong>Topic:</strong>{' '}
                  {selectedConsultation.focus ||
                   'Personal Guidance'}

                  <br/>

                  <strong>Date:</strong>{' '}
                  {selectedConsultation.appointment_date ||
                   'Not specified'}

                  <br/>

                  <strong>Time:</strong>{' '}
                  {selectedConsultation.appointment_time ||
                   'Not specified'}

                </>

              ) : (

                <>

                  <strong>Type:</strong> Consultation Question

                  <br/>

                  <strong>Focus:</strong>{' '}
                  {selectedConsultation.focus ||
                   'Personal Guidance'}

                  <br/>

                  <strong>Spread:</strong>{' '}
                  {selectedConsultation.spread ||
                   '—'}

                </>

              )}

            </div>


            {/* QUESTION / DETAILS */}

            <div className="consultation-question">

              <strong>
                {selectedConsultation.consultation_mode==='Appointment'
                  ? 'Appointment Details'
                  : "User's Question"}
              </strong>

              <p>
                {selectedConsultation.details ||
                 selectedConsultation.question ||
                 'No details provided.'}
              </p>

            </div>


            {/* CARDS */}

            {selectedConsultation.cards?.length>0 && (

              <div className="consultation-cards">

                <strong>Selected Cards</strong>

                <p>
                  {selectedConsultation.cards.join(' · ')}
                </p>

              </div>

            )}


            {/* RESPONSE */}

            <div className="consultation-existing-reply">

              <strong>
                Consultant's Guidance
              </strong>

              <p>
                {selectedConsultation.reply ||
                 'No response has been provided yet.'}
              </p>

            </div>

            {selectedConsultation.consultation_mode === 'Appointment' && (
              <div style={{ marginTop: '16px', padding: '14px', background: '#faf8ff', borderRadius: '12px', border: '1px solid #e7ddff' }}>
                <strong style={{ fontSize: '13px', color: '#2b1b54' }}>Manage Appointment Status:</strong>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    className="primary"
                    style={{ padding: '6px 14px', fontSize: '12px', background: '#2e7d32' }}
                    onClick={async () => {
                      await fetch(`${API}/consultations/${selectedConsultation.id}/status`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'Accepted' })
                      });
                      setSelectedConsultation({ ...selectedConsultation, status: 'Accepted' });
                      setConsultations(prev => prev.map(c => c.id === selectedConsultation.id ? { ...c, status: 'Accepted' } : c));
                    }}
                  >
                    ✓ Accept Appointment
                  </button>
                  <button
                    className="secondary"
                    style={{ padding: '6px 14px', fontSize: '12px', color: '#c62828', borderColor: '#ffcdd2' }}
                    onClick={async () => {
                      await fetch(`${API}/consultations/${selectedConsultation.id}/status`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'Declined' })
                      });
                      setSelectedConsultation({ ...selectedConsultation, status: 'Declined' });
                      setConsultations(prev => prev.map(c => c.id === selectedConsultation.id ? { ...c, status: 'Declined' } : c));
                    }}
                  >
                    ✕ Decline
                  </button>
                </div>
              </div>
            )}

            {!selectedConsultation.reply && (
              <div style={{ marginTop: '16px' }}>
                <strong style={{ fontSize: '13px', color: '#2b1b54' }}>Write Response / Guidance:</strong>
                <textarea
                  rows={4}
                  value={replyInput}
                  onChange={e => setReplyInput(e.target.value)}
                  placeholder="Type guidance for the user..."
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ccc', marginTop: '6px', fontSize: '13px' }}
                />
                <button
                  className="primary"
                  style={{ marginTop: '8px', padding: '8px 16px', fontSize: '12px' }}
                  disabled={!replyInput.trim()}
                  onClick={async () => {
                    await fetch(`${API}/consultations/${selectedConsultation.id}/reply`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ reply: replyInput })
                    });
                    setSelectedConsultation({ ...selectedConsultation, reply: replyInput, status: 'Answered' });
                    setConsultations(prev => prev.map(c => c.id === selectedConsultation.id ? { ...c, reply: replyInput, status: 'Answered' } : c));
                    setReplyInput('');
                  }}
                >
                  Send Response
                </button>
              </div>
            )}


            <div className="consultation-modal-actions" style={{ marginTop: '20px' }}>

              <button
                className="secondary"
                onClick={()=>
                  setSelectedConsultation(null)
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}


function Reports({ user }){
  const [busy,setBusy]=useState('');

  const get=async type=>{
    setBusy(type);
    try{
      const authHeaders = user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};
      const uParam = user?.name ? `?user_name=${encodeURIComponent(user.name)}` : '';
      const r = await fetch(API + '/reports/' + type + '.pdf' + uParam, { headers: authHeaders });

      if(!r.ok) throw new Error();

      const blob=await r.blob();
      const url=URL.createObjectURL(blob);

      const a=document.createElement('a');
      a.href=url;
      a.download=type+'-report.pdf';
      a.click();

      setTimeout(()=>URL.revokeObjectURL(url),1000);
    }catch{
      triggerToast('error', 'Report Error', 'Could not generate the report. Please make sure the backend is running.');
    }finally{
      setBusy('');
    }
  };

  return (
    <>
      <PageHead
        title="Reports"
        sub="Your personalized reading reports, insights and guidance in one place."
      />

      <div className="reports-page">

        {/* Featured Report */}
        <div className="reports-hero">
          <div className="reports-hero-content">
            <div className="reports-eyebrow">
              ✦ PERSONALIZED REPORT CENTER
            </div>

            <h2>Your Spiritual Reading Reports</h2>

            <p>
              Access detailed reports generated from your palm analysis,
              tarot reading and AI-powered personality insights.
            </p>

            <div className="reports-highlights">
              <span>✓ Palm Analysis</span>
              <span>✓ Tarot Interpretation</span>
              <span>✓ AI Insights</span>
              <span>✓ Personalized Guidance</span>
            </div>
          </div>

          <div className="reports-hero-visual">
            <div className="report-document">
              <div className="document-top">
                <span>✦</span>
                <span>AI READING</span>
              </div>

              <div className="document-line large"></div>
              <div className="document-line"></div>
              <div className="document-line short"></div>

              <div className="document-section">
                <div></div>
                <div></div>
                <div></div>
              </div>

              <div className="document-footer">
                PERSONALIZED GUIDANCE
              </div>
            </div>
          </div>
        </div>


        {/* Reports Heading */}
        <div className="reports-section-heading">
          <div>
            <span>YOUR REPORTS</span>
            <h3>Choose a report</h3>
          </div>

          <p>
            Download a detailed PDF based on your latest reading.
          </p>
        </div>


        {/* Report Cards */}
        <div className="new-report-grid">

          <div className="new-report-card palm-report">
            <div className="new-report-icon">
              <Hand size={24}/>
            </div>

            <div className="new-report-tag">
              PALM READING
            </div>

            <h3>Palmistry Report</h3>

            <p>
              Detailed analysis of palm lines, hand structure,
              palm shape and detected features.
            </p>

            <div className="report-features">
              <span>✓ Life Line</span>
              <span>✓ Heart Line</span>
              <span>✓ Head Line</span>
              <span>✓ Fate & Sun Lines</span>
            </div>

            <button
              className="new-report-button"
              onClick={()=>get('palm')}
              disabled={busy==='palm'}
            >
              {busy==='palm' ? 'Generating...' : 'Download PDF'}
            </button>
          </div>


          <div className="new-report-card tarot-report">
            <div className="new-report-icon">
              <Layers size={24}/>
            </div>

            <div className="new-report-tag">
              TAROT READING
            </div>

            <h3>Tarot Report</h3>

            <p>
              Your selected cards, positions, interpretations,
              themes and personalized tarot guidance.
            </p>

            <div className="report-features">
              <span>✓ Selected Cards</span>
              <span>✓ Card Meanings</span>
              <span>✓ Key Themes</span>
              <span>✓ Personal Guidance</span>
            </div>

            <button
              className="new-report-button"
              onClick={()=>get('tarot')}
              disabled={busy==='tarot'}
            >
              {busy==='tarot' ? 'Generating...' : 'Download PDF'}
            </button>
          </div>


          <div className="new-report-card personality-report">
            <div className="new-report-icon">
              <Brain size={24}/>
            </div>

            <div className="new-report-tag">
              AI INSIGHTS
            </div>

            <h3>Personality Report</h3>

            <p>
              AI-generated personality insights based on your
              detected palm patterns and reading.
            </p>

            <div className="report-features">
              <span>✓ Personality Profile</span>
              <span>✓ Strengths</span>
              <span>✓ Challenges</span>
              <span>✓ Recommendations</span>
            </div>

            <button
              className="new-report-button"
              onClick={()=>get('personality')}
              disabled={busy==='personality'}
            >
              {busy==='personality' ? 'Generating...' : 'Download PDF'}
            </button>
          </div>

        </div>


        {/* Bottom Information */}
        <div className="report-info-panel">
          <div className="report-info-icon">✦</div>

          <div>
            <h3>Your readings, beautifully documented</h3>
            <p>
              Each report contains the information generated from your
              selected reading, making it easy to save, review and
              revisit your spiritual guidance later.
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
function ReportCard({icon,title,d,onClick,busy}){return <div className="reportcard"><div className="reporticon">{icon}</div><div><b>{title}</b><p>{d}</p></div><button className="download" onClick={onClick} disabled={busy}>{busy?'Generating...':<><Download size={14}/> PDF</>}</button></div>}
function Profile({user}){

  const [history,setHistory] = useState([]);
  const [saved,setSaved] = useState(false);

  const [name,setName] = useState(user.name || '');
  const [ageGroup,setAgeGroup] = useState('18–25');
  const [interests,setInterests] = useState('Personal growth, career');
  const [goals,setGoals] = useState('Self-reflection and direction');
  const [preferences,setPreferences] = useState('Palmistry + Tarot');

  useEffect(()=>{
    const authHeaders = user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};
    const uParam = user?.name ? `?user_name=${encodeURIComponent(user.name)}` : '';
    fetch(API + '/history' + uParam, { headers: authHeaders })
      .then(r=>r.json())
      .then(d=>{
        if(Array.isArray(d?.items)){
          setHistory(d.items);
        }
      })
      .catch(()=>setHistory([]));
  },[user?.name, user?.token]);

  const palmCount = history.filter(
    r => r.type?.toLowerCase().includes('palm')
  ).length;

  const tarotCount = history.filter(
    r => r.type?.toLowerCase().includes('tarot')
  ).length;

  const scores = history
    .map(r => parseInt(String(r.score).replace('%',''),10))
    .filter(n => !isNaN(n));

  const averageScore = scores.length
    ? Math.round(
        scores.reduce((a,b)=>a+b,0) / scores.length
      )
    : 0;

  const recentReadings = history.slice(-3).reverse();

  const saveProfile = () => {
    const profileData = {
      name,
      ageGroup,
      interests,
      goals,
      preferences
    };

    localStorage.setItem(
      `profile_${user.email}`,
      JSON.stringify(profileData)
    );

    setSaved(true);

    setTimeout(()=>{
      setSaved(false);
    },2500);
  };

  return (
    <>
      <PageHead
        title="My Profile"
        sub="Manage your personal information and spiritual preferences."
      />

      <div className="profile-new">

        {/* PROFILE HERO */}

        <div className="profile-hero">

          <div className="profile-avatar-large">
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="profile-hero-info">
            <div className="profile-role">
              PERSONAL PROFILE
            </div>

            <h2>{name || 'User'}</h2>

            <p>{user.email}</p>

            <div className="profile-badges">
              <span>✦ User</span>
              <span>✧ Spiritual Journey</span>
            </div>
          </div>

          <div className="profile-hero-symbol">
            ✦
          </div>

        </div>


        {/* INFORMATION SECTION */}

        <div className="profile-section-title">
          <div>
            <h2>Personal Information</h2>
            <p>Keep your profile details up to date.</p>
          </div>
        </div>


        <div className="profile-grid">

          <div className="profile-card">

            <div className="profile-card-heading">
              <div className="profile-card-icon">♙</div>

              <div>
                <h3>Basic Details</h3>
                <p>Your account information</p>
              </div>
            </div>

            <div className="profile-fields">

              <label>
                Full Name
                <input
                  value={name}
                  onChange={e=>setName(e.target.value)}
                />
              </label>

              <label>
                Email
                <input
                  value={user.email}
                  readOnly
                />
              </label>

              <label>
                Age Group
                <select
                  value={ageGroup}
                  onChange={e=>setAgeGroup(e.target.value)}
                >
                  <option>18–25</option>
                  <option>26–35</option>
                  <option>36–45</option>
                  <option>46–55</option>
                  <option>56+</option>
                </select>
              </label>

            </div>

          </div>


          <div className="profile-card">

            <div className="profile-card-heading">
              <div className="profile-card-icon">✦</div>

              <div>
                <h3>Spiritual Preferences</h3>
                <p>Personalize your experience</p>
              </div>
            </div>

            <div className="profile-fields">

              <label>
                Areas of Interest
                <input
                  value={interests}
                  onChange={e=>setInterests(e.target.value)}
                />
              </label>

              <label>
                Spiritual Goals
                <input
                  value={goals}
                  onChange={e=>setGoals(e.target.value)}
                />
              </label>

              <label>
                Reading Preferences
                <select
                  value={preferences}
                  onChange={e=>setPreferences(e.target.value)}
                >
                  <option>Palmistry + Tarot</option>
                  <option>Palmistry</option>
                  <option>Tarot</option>
                </select>
              </label>

            </div>

          </div>

        </div>


        {/* READING JOURNEY */}

        <div className="profile-section-title journey-title">

          <div>
            <h2>Your Reading Journey</h2>
            <p>Your progress based on your completed readings.</p>
          </div>

        </div>


        <div className="journey-grid">

          <div className="journey-card">
            <div className="journey-icon">✦</div>
            <div>
              <span>Total Readings</span>
              <strong>{history.length}</strong>
            </div>
          </div>

          <div className="journey-card">
            <div className="journey-icon">◈</div>
            <div>
              <span>Average Score</span>
              <strong>{averageScore}%</strong>
            </div>
          </div>

          <div className="journey-card">
            <div className="journey-icon">✋</div>
            <div>
              <span>Palm Readings</span>
              <strong>{palmCount}</strong>
            </div>
          </div>

          <div className="journey-card">
            <div className="journey-icon">🃏</div>
            <div>
              <span>Tarot Readings</span>
              <strong>{tarotCount}</strong>
            </div>
          </div>

        </div>


        {/* RECENT ACTIVITY */}

        <div className="profile-section-title recent-title">

          <div>
            <h2>Recent Activity</h2>
            <p>Your latest readings.</p>
          </div>

        </div>


        <div className="recent-reading-card">

          {recentReadings.length === 0 ? (

            <div className="profile-no-readings">
              <div>✦</div>
              <h3>No readings yet</h3>
              <p>
                Your completed Palm and Tarot readings will appear here.
              </p>
            </div>

          ) : (

            recentReadings.map((reading,index)=>{

              const isTarot =
                reading.type?.toLowerCase().includes('tarot');

              return (
                <div
                  className="recent-reading-row"
                  key={reading.id || index}
                >

                  <div className={
                    `recent-reading-icon ${isTarot ? 'tarot' : 'palm'}`
                  }>
                    {isTarot ? '🃏' : '✋'}
                  </div>

                  <div className="recent-reading-info">
                    <strong>{reading.type}</strong>
                    <span>{reading.date}</span>
                  </div>

                  <div className="recent-reading-score">
                    {reading.score}
                  </div>

                  <span className="recent-reading-status">
                    ✓ Completed
                  </span>

                </div>
              );
            })

          )}

        </div>


        {/* SAVE */}

        <div className="profile-save-area">

          {saved && (
            <span className="profile-saved-message">
              ✓ Profile changes saved
            </span>
          )}

          <button
            className="primary profile-save-button"
            onClick={saveProfile}
          >
            Save Changes
          </button>

        </div>

      </div>
    </>
  );
}
function TarotReaderProfile({user}){
    const [history, setHistory] = useState([]);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(user.name || '');
  const [experience, setExperience] = useState('2+ Years');
  const [specialization, setSpecialization] = useState('Tarot Reading');
  const [readingStyle, setReadingStyle] = useState('Intuitive & Guidance-Based');
  const [expertise, setExpertise] = useState('Love, Career, Personal Growth');
  const [spreads, setSpreads] = useState('Three Card + Celtic Cross');

  useEffect(() => {
    const authHeaders = user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};
    const uParam = user?.name ? `?user_name=${encodeURIComponent(user.name)}` : '';
    fetch(API + '/history' + uParam, { headers: authHeaders })
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d?.items)) {
          setHistory(d.items);
        }
      })
      .catch(() => setHistory([]));
  }, [user?.name, user?.token]);

  const tarotReadings = history.filter(
    r => r.type?.toLowerCase().includes('tarot')
  );

  const scores = tarotReadings
    .map(r => parseInt(String(r.score).replace('%', ''), 10))
    .filter(n => !isNaN(n));

  const averageScore = scores.length
    ? Math.round(
        scores.reduce((a, b) => a + b, 0) / scores.length
      )
    : 0;

  const recentReadings = tarotReadings.slice(-3).reverse();

  const saveProfile = () => {
    const profileData = {
      name,
      experience,
      specialization,
      readingStyle,
      expertise,
      spreads
    };

    localStorage.setItem(
      `tarot_reader_profile_${user.email}`,
      JSON.stringify(profileData)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <>
      <PageHead
        title="Tarot Reader Profile"
        sub="Manage your professional reader information and Tarot preferences."
      />

      <div className="profile-new">

        {/* PROFILE HERO */}

        <div className="profile-hero">

          <div className="profile-avatar-large">
            {name ? name.charAt(0).toUpperCase() : 'T'}
          </div>

          <div className="profile-hero-info">

            <div className="profile-role">
              TAROT READER PROFILE
            </div>

            <h2>{name || 'Tarot Reader'}</h2>

            <p>{user.email}</p>

            <div className="profile-badges">
              <span>🔮 Tarot Reader</span>
              <span>✦ Professional Reader</span>
            </div>

          </div>

          <div className="profile-hero-symbol">
            🔮
          </div>

        </div>


        {/* PROFESSIONAL INFORMATION */}

        <div className="profile-section-title">

          <div>
            <h2>Professional Information</h2>
            <p>Manage your Tarot reader profile and professional details.</p>
          </div>

        </div>


        <div className="profile-grid">

          {/* BASIC DETAILS */}

          <div className="profile-card">

            <div className="profile-card-heading">

              <div className="profile-card-icon">
                ♙
              </div>

              <div>
                <h3>Basic Details</h3>
                <p>Your professional account information</p>
              </div>

            </div>


            <div className="profile-fields">

              <label>
                Full Name

                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </label>


              <label>
                Email

                <input
                  value={user.email}
                  readOnly
                />
              </label>


              <label>
                Experience

                <select
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                >
                  <option>Less than 1 Year</option>
                  <option>1–2 Years</option>
                  <option>2+ Years</option>
                  <option>5+ Years</option>
                  <option>10+ Years</option>
                </select>
              </label>

            </div>

          </div>


          {/* READER SPECIALIZATION */}

          <div className="profile-card">

            <div className="profile-card-heading">

              <div className="profile-card-icon">
                🔮
              </div>

              <div>
                <h3>Reader Specialization</h3>
                <p>Define your Tarot reading expertise</p>
              </div>

            </div>


            <div className="profile-fields">

              <label>
                Specialization

                <select
                  value={specialization}
                  onChange={e => setSpecialization(e.target.value)}
                >
                  <option>Tarot Reading</option>
                  <option>Love & Relationships</option>
                  <option>Career & Finance</option>
                  <option>Personal Growth</option>
                  <option>Spiritual Guidance</option>
                </select>
              </label>


              <label>
                Areas of Expertise

                <input
                  value={expertise}
                  onChange={e => setExpertise(e.target.value)}
                />
              </label>


              <label>
                Reading Style

                <select
                  value={readingStyle}
                  onChange={e => setReadingStyle(e.target.value)}
                >
                  <option>Intuitive & Guidance-Based</option>
                  <option>Traditional Interpretation</option>
                  <option>Intuitive & Traditional</option>
                </select>
              </label>

            </div>

          </div>

        </div>


        {/* READING PREFERENCES */}

        <div className="profile-section-title journey-title">

          <div>
            <h2>Reading Preferences</h2>
            <p>Configure the Tarot methods you commonly use.</p>
          </div>

        </div>


        <div className="profile-grid">

          <div className="profile-card">

            <div className="profile-card-heading">

              <div className="profile-card-icon">
                🃏
              </div>

              <div>
                <h3>Preferred Spreads</h3>
                <p>Choose your commonly used Tarot spreads</p>
              </div>

            </div>


            <div className="profile-fields">

              <label>
                Tarot Spreads

                <select
                  value={spreads}
                  onChange={e => setSpreads(e.target.value)}
                >
                  <option>Three Card + Celtic Cross</option>
                  <option>Three Card</option>
                  <option>Celtic Cross</option>
                  <option>Relationship Spread</option>
                  <option>Career Spread</option>
                </select>
              </label>

            </div>

          </div>

        </div>


        {/* READING OVERVIEW */}

        <div className="profile-section-title journey-title">

          <div>
            <h2>Reading Overview</h2>
            <p>Your Tarot reading activity and performance.</p>
          </div>

        </div>


        <div className="journey-grid">

          <div className="journey-card">

            <div className="journey-icon">
              🃏
            </div>

            <div>
              <span>Total Tarot Readings</span>
              <strong>{tarotReadings.length}</strong>
            </div>

          </div>


          <div className="journey-card">

            <div className="journey-icon">
              ✦
            </div>

            <div>
              <span>Average Reading Score</span>
              <strong>{averageScore}%</strong>
            </div>

          </div>


          <div className="journey-card">

            <div className="journey-icon">
              🔮
            </div>

            <div>
              <span>Reading Style</span>
              <strong>Intuitive</strong>
            </div>

          </div>


          <div className="journey-card">

            <div className="journey-icon">
              ✨
            </div>

            <div>
              <span>Specialization</span>
              <strong>Tarot</strong>
            </div>

          </div>

        </div>


        {/* RECENT READINGS */}

        <div className="profile-section-title recent-title">

          <div>
            <h2>Recent Tarot Readings</h2>
            <p>Your latest Tarot reading activity.</p>
          </div>

        </div>


        <div className="recent-reading-card">

          {recentReadings.length === 0 ? (

            <div className="profile-no-readings">

              <div>🃏</div>

              <h3>No Tarot readings yet</h3>

              <p>
                Your completed Tarot readings will appear here.
              </p>

            </div>

          ) : (

            recentReadings.map((reading, index) => (

              <div
                className="recent-reading-row"
                key={reading.id || index}
              >

                <div className="recent-reading-icon tarot">
                  🃏
                </div>

                <div className="recent-reading-info">

                  <strong>
                    {reading.type || 'Tarot Reading'}
                  </strong>

                  <span>
                    {reading.date}
                  </span>

                </div>

                <div className="recent-reading-score">
                  {reading.score}
                </div>

                <span className="recent-reading-status">
                  ✓ Completed
                </span>

              </div>

            ))

          )}

        </div>


        {/* SAVE */}

        <div className="profile-save-area">

          {saved && (
            <span className="profile-saved-message">
              ✓ Profile changes saved
            </span>
          )}

          <button
            className="primary profile-save-button"
            onClick={saveProfile}
          >
            Save Reader Profile
          </button>

        </div>

      </div>
    </>
  );

}
function SpiritualConsultantProfile({user}) {
    const [consultations, setConsultations] = useState([]);

  useEffect(() => {
    fetch(API + '/consultations/Spiritual%20Consultant')
      .then(response => response.json())
      .then(data => {
        setConsultations(Array.isArray(data) ? data : []);
      })
      .catch(error => {
        console.error('Consultant profile error:', error);
        setConsultations([]);
      });
  }, []);
    const totalConsultations = consultations.length;

  const answeredConsultations = consultations.filter(
    item => item.reply || item.status === 'Answered'
  ).length;

  const pendingConsultations =
    totalConsultations - answeredConsultations;

  const appointmentCount = consultations.filter(
    item => item.consultation_mode === 'Appointment'
  ).length;
  return (
    <>
      <div className="consultant-profile">

        <section className="consultant-profile-hero">
          <div className="consultant-profile-avatar">
            {(user?.name || 'C').charAt(0).toUpperCase()}
          </div>

          <div>
            <span className="consultant-profile-label">
              PROFESSIONAL PROFILE
            </span>

            <h1>{user?.name || 'Consultant'}</h1>

            <p>{user?.email || 'consultant@example.com'}</p>

            <div className="consultant-profile-badges">
              <span>✦ Spiritual Consultant</span>
              <span>✦ Professional Guidance</span>
            </div>
          </div>
        </section>

        <section className="consultant-profile-section">
          <div className="consultant-profile-section-heading">
            <h2>Professional Information</h2>
            <p>Manage your consultant profile and guidance preferences.</p>
          </div>

          <div className="consultant-profile-grid">

            <div className="consultant-profile-card">
              <div className="consultant-profile-card-heading">
                <div className="consultant-profile-card-icon">👤</div>
                <div>
                  <h3>Basic Details</h3>
                  <p>Your consultant account information</p>
                </div>
              </div>

              <div className="consultant-profile-fields">

                <label>
                  Full Name
                  <input
                    value={user?.name || ''}
                    readOnly
                  />
                </label>

                <label>
                  Email
                  <input
                    value={user?.email || ''}
                    readOnly
                  />
                </label>

                <label>
                  Role
                  <input
                    value="Spiritual Consultant"
                    readOnly
                  />
                </label>

              </div>
            </div>

            <div className="consultant-profile-card">
              <div className="consultant-profile-card-heading">
                <div className="consultant-profile-card-icon">✦</div>
                <div>
                  <h3>Consultant Specialization</h3>
                  <p>Your areas of spiritual guidance</p>
                </div>
              </div>

              <div className="consultant-specialization-list">
                <div>
                  <span>✋</span>
                  <div>
                    <strong>Palmistry</strong>
                    <small>Palm line and hand-pattern interpretation</small>
                  </div>
                </div>

                <div>
                  <span>🔮</span>
                  <div>
                    <strong>Tarot Guidance</strong>
                    <small>Card-based symbolic interpretation</small>
                  </div>
                </div>

                <div>
                  <span>🧠</span>
                  <div>
                    <strong>Personal Guidance</strong>
                    <small>Reflection and personalized consultation</small>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section className="consultant-profile-section">
          <div className="consultant-profile-section-heading">
            <h2>Consultation Overview</h2>
            <p>Your activity as a Spiritual Consultant.</p>
          </div>

          <div className="consultant-profile-stats">

            <div>
  <span>💬</span>
  <small>Total Consultations</small>
  <strong>{totalConsultations}</strong>
</div>

<div>
  <span>✓</span>
  <small>Guidance Provided</small>
  <strong>{answeredConsultations}</strong>
</div>

<div>
  <span>⏳</span>
  <small>Pending Requests</small>
  <strong>{pendingConsultations}</strong>
</div>

<div>
  <span>📅</span>
  <small>Appointments</small>
  <strong>{appointmentCount}</strong>
</div>

          </div>
        </section>

        <section className="consultant-profile-note">
          <div>✦</div>
          <div>
            <span>CONSULTANT PROFILE</span>
            <h3>Ready to provide personalized guidance</h3>
            <p>
              Review user readings, consultation requests and AI-assisted
              insights to provide thoughtful spiritual guidance.
            </p>
          </div>
        </section>

      </div>
    </>
  );
}
function Admin({go}){
  const [d,setD]=useState(null);
  useEffect(()=>{
    fetch(API+'/admin/summary')
      .then(r=>r.json())
      .then(setD)
      .catch(()=>setD({users:0,readings:0,active_readers:0,system:'Checking...'}))
  },[]);

  return (
    <>
      <div className="admin-console-banner">
        <div className="admin-console-banner-content">
          <div className="admin-role-badge-tag">🛡️ ADMINISTRATOR ROLE</div>
          <h1><Shield size={24} color="#fbbf24" /> Administrator Control Center</h1>
          <p>Full system governance, user accounts, security roles, and platform activity monitoring.</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 18px', borderRadius: '12px', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'right' }}>
          <small style={{ color: '#c7d2fe', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 'bold' }}>Current Access Role</small>
          <div style={{ color: '#fbbf24', fontWeight: '800', fontSize: '14px', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
            <Shield size={14} /> Administrator
          </div>
        </div>
      </div>

      <div className="stats">
        {d && (
          <>
            <Stat title="Total Users" value={d.users}/>
            <Stat title="Total Readings" value={d.readings} sub="Palm & Tarot (Deduplicated)"/>
            <Stat title="Consultations" value={d.consultations || d.consultations_total || 0}/>
            <Stat title="Pending Appts" value={d.appointments_by_status?.Pending || d.appointments?.pending || 0}/>
            <Stat title="Accepted Appts" value={d.appointments_by_status?.Accepted || d.appointments?.accepted || 0}/>
            <Stat title="System Status" value={d.system}/>
          </>
        )}
      </div>

      <div className="admin-grid">
        <AdminLink icon={<Users/>} title="Users" text="Manage user accounts, roles, and status." onClick={()=>go && go('users')}/>
        <AdminLink icon={<Shield/>} title="Roles" text="Platform access governance across 4 roles." onClick={()=>go && go('roles')}/>
        <AdminLink icon={<Database/>} title="Reading Data" text="Deduplicated palmistry and tarot session records." onClick={()=>go && go('readings')}/>
        <AdminLink icon={<Clock/>} title="Appointments" text="Monitor consultation and Google Meet requests." onClick={()=>go && go('appointments')}/>
        <AdminLink icon={<Activity/>} title="Activity Logs" text="System audit trail of administrative events." onClick={()=>go && go('activity-logs')}/>
        <AdminLink icon={<FileText/>} title="System Reports" text="Real-time analytics, user demographics & reading trends." onClick={()=>go && go('system-reports')}/>
        <AdminLink icon={<Settings/>} title="System Info" text="Check real backend service and API health." onClick={()=>go && go('system')}/>
      </div>
    </>
  );
}

function AdminLink({icon,title,text,onClick}){
  return (
    <div className="admin-link" onClick={onClick} style={{cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.15s, box-shadow 0.15s'}}>
      <div>{icon}</div>
      <section>
        <b>{title}</b>
        <p>{text}</p>
      </section>
    </div>
  );
}

function AdminSection({page}){
  const [data,setData]=useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedReading, setSelectedReading] = useState(null);
  const [selectedAppt, setSelectedAppt] = useState(null);

  // User filters & search
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Appointment filters
  const [apptStatusFilter, setApptStatusFilter] = useState('All');

  // Activity logs filters
  const [activityFilter, setActivityFilter] = useState('All');
  const [activitySearch, setActivitySearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Add user inputs
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState('User');
  const [addStatus, setAddStatus] = useState('Active');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = () => {
    setLoading(true);
    setLoadError(null);
    let ep = '/admin/system';
    if (page === 'users') ep = '/admin/users';
    else if (page === 'roles') ep = '/admin/roles';
    else if (page === 'readings') ep = '/admin/readings';
    else if (page === 'appointments') ep = '/admin/consultations';
    else if (page === 'activity-logs') ep = '/admin/activity-logs';
    else if (page === 'system-reports') ep = '/admin/system-reports';

    fetch(API + ep)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}: Failed to load`);
        return r.json();
      })
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        setData(null);
        setLoadError(err.message || 'Failed to load data');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const submitAddUser = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const r = await fetch(API + '/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: addName, email: addEmail, password: addPassword, role: addRole, status: addStatus })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail || 'Failed to create user');
      setShowAddModal(false);
      setAddName(''); setAddEmail(''); setAddPassword('');
      loadData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const submitEditUser = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Confirm updating role and status for ${editingUser.email}?`)) return;
    try {
      const r = await fetch(API + '/admin/users/' + encodeURIComponent(editingUser.email), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editingUser.role, status: editingUser.status, name: editingUser.name })
      });
      const d = await r.json();
      if (!r.ok) {
        alert(d.detail || 'Failed to update user');
        return;
      }
      setEditingUser(null);
      loadData();
    } catch (err) {
      alert(err.message || 'Error updating user');
    }
  };

  const deleteUser = async (email) => {
    if (!window.confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) return;
    try {
      const r = await fetch(API + '/admin/users/' + encodeURIComponent(email), { method: 'DELETE' });
      const d = await r.json();
      if (!r.ok) {
        alert(d.detail || 'Failed to delete user');
        return;
      }
      loadData();
    } catch (err) {
      alert(err.message || 'Error deleting user');
    }
  };

  const titles = {
    users: ['Users', 'Manage registered accounts, role permissions, and access status.'],
    roles: ['Roles', 'Governance framework for the four platform roles.'],
    readings: ['Reading Data', 'Audit deduplicated palmistry and Tarot reading records.'],
    appointments: ['Appointments Monitoring', 'Track user appointments, responses, and Google Meet scheduling.'],
    'activity-logs': ['System Activity Logs', 'Historical audit trail of administrative and platform events.'],
    'system-reports': ['System Reports', 'Comprehensive real-time platform metrics, user demographics, readings distribution, and consultation analytics.'],
    system: ['System Information', 'Real-time operational status of backend services and integrations.']
  };

  const pageTitle = titles[page] ? titles[page][0] : 'Admin Section';
  const pageSub = titles[page] ? titles[page][1] : '';

  return (
    <>
      <div className="admin-subhead-badge">
        <Shield size={16} /> <strong>Administrator Management</strong> &bull; {pageTitle}
      </div>
      <PageHead title={pageTitle} sub={pageSub} />

      {/* USERS SECTION */}
      {page === 'users' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: '260px' }}>
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #ccc', width: '260px', fontSize: '13px' }}
              />
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }}
              >
                <option value="All">All Roles</option>
                <option value="User">User</option>
                <option value="Tarot Reader">Tarot Reader</option>
                <option value="Spiritual Consultant">Spiritual Consultant</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>
            <button className="primary" onClick={() => { setShowAddModal(true); setErrorMsg(''); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Add New User
            </button>
          </div>

          <div className="table">
            <div className="tr head"><span>Name</span><span>Email</span><span>Role</span><span>Status</span><span>Action</span></div>
            {(data?.items || [])
              .filter(u => {
                const matchSearch = !userSearch || (u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()));
                const matchRole = roleFilter === 'All' || u.role === roleFilter;
                return matchSearch && matchRole;
              })
              .map(x => (
                <div className="tr" key={x.email}>
                  <span><b>{x.name}</b></span>
                  <span>{x.email}</span>
                  <span>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '12px', background: '#f4efff', color: '#7654d8', fontWeight: '600' }}>
                      {x.role}
                    </span>
                  </span>
                  <span>
                    <span className="status" style={{ background: x.status === 'Active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: x.status === 'Active' ? '#16a34a' : '#dc2626' }}>
                      {x.status || 'Active'}
                    </span>
                  </span>
                  <span style={{ display: 'flex', gap: '8px' }}>
                    <button className="view" onClick={() => setEditingUser({ ...x })} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Edit3 size={13}/> Edit
                    </button>
                    <button className="view" onClick={() => deleteUser(x.email)} style={{ background: '#fff0f0', color: '#d32f2f', border: '1px solid #ffcdd2', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Trash2 size={13}/> Delete
                    </button>
                  </span>
                </div>
              ))}
          </div>
        </>
      )}

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
            <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            <h2>Add New User</h2>
            <form onSubmit={submitAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>Full Name
                <input value={addName} onChange={e => setAddName(e.target.value)} required style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }} />
              </label>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>Email
                <input type="email" value={addEmail} onChange={e => setAddEmail(e.target.value)} required style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }} />
              </label>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>Password
                <input type="password" value={addPassword} onChange={e => setAddPassword(e.target.value)} required minLength={6} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }} />
              </label>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>Role
                <select value={addRole} onChange={e => setAddRole(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}>
                  <option value="User">User</option>
                  <option value="Tarot Reader">Tarot Reader</option>
                  <option value="Spiritual Consultant">Spiritual Consultant</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </label>
              {errorMsg && <div className="error" style={{ fontSize: '12px', color: 'red' }}>{errorMsg}</div>}
              <button className="primary" type="submit" style={{ marginTop: '10px' }}>Create Account</button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="modal-backdrop" onClick={() => setEditingUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', width: '90%' }}>
            <button className="modal-close" onClick={() => setEditingUser(null)}>×</button>
            <h2>Edit User Account</h2>
            <form onSubmit={submitEditUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>Name
                <input value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }} />
              </label>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>Role
                <select value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}>
                  <option value="User">User</option>
                  <option value="Tarot Reader">Tarot Reader</option>
                  <option value="Spiritual Consultant">Spiritual Consultant</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </label>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>Status
                <select value={editingUser.status} onChange={e => setEditingUser({ ...editingUser, status: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}>
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </label>
              <button className="primary" type="submit" style={{ marginTop: '10px' }}>Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* ROLES SECTION */}
      {page === 'roles' && (
        <div className="admin-grid">
          {(data?.items || []).map(x => (
            <AdminLink key={x.name} icon={<Shield/>} title={x.name} text={x.description} />
          ))}
        </div>
      )}

      {/* READINGS DATA SECTION */}
      {page === 'readings' && (
        <>
          <div className="table">
            <div className="tr head"><span>Type</span><span>User</span><span>Date</span><span>Score / Summary</span><span>Action</span></div>
            {(data?.items || []).map(x => (
              <div className="tr" key={x.id}>
                <span><b>{x.type}</b></span>
                <span>{x.user}</span>
                <span>{x.date}</span>
                <span><span className="status">{x.score}</span></span>
                <button className="view" onClick={() => setSelectedReading(x)}>View</button>
              </div>
            ))}
          </div>

          {selectedReading && (
            <div className="modal-backdrop" onClick={() => setSelectedReading(null)}>
              <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
                <button className="modal-close" onClick={() => setSelectedReading(null)}>×</button>
                <h2>{selectedReading.type} Reading Record</h2>
                <div style={{ marginTop: '14px', lineHeight: '1.7', fontSize: '14px', color: '#374151' }}>
                  <p><b>User:</b> {selectedReading.user}</p>
                  <p><b>Date:</b> {selectedReading.date}</p>
                  <p><b>Metrics / Summary:</b> {selectedReading.score}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* APPOINTMENTS MONITORING SECTION */}
      {page === 'appointments' && (
        <>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Status Filter:</span>
            <select
              value={apptStatusFilter}
              onChange={e => setApptStatusFilter(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Declined">Declined</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          <div className="table">
            <div className="tr head"><span>Client</span><span>Professional</span><span>Focus</span><span>Date & Time</span><span>Status</span><span>Action</span></div>
            {(data?.items || [])
              .filter(a => apptStatusFilter === 'All' || a.status === apptStatusFilter)
              .map(a => (
                <div className="tr" key={a.id}>
                  <span><b>{a.user_name || 'Client'}</b></span>
                  <span>{a.consultant_type || 'Spiritual Consultant'}</span>
                  <span>{a.focus || 'Guidance'}</span>
                  <span>{a.appointment_date} {formatApptTime(a.appointment_time)}</span>
                  <span>
                    <span className="status" style={{
                      background: a.status === 'Accepted' ? 'rgba(34, 197, 94, 0.15)' : a.status === 'Declined' ? 'rgba(239, 68, 68, 0.15)' : a.status === 'Expired' ? 'rgba(156, 163, 175, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                      color: a.status === 'Accepted' ? '#16a34a' : a.status === 'Declined' ? '#dc2626' : a.status === 'Expired' ? '#4b5563' : '#ca8a04'
                    }}>
                      {a.status}
                    </span>
                  </span>
                  <button className="view" onClick={() => setSelectedAppt(a)}>Inspect</button>
                </div>
              ))}
          </div>

          {selectedAppt && (
            <div className="modal-backdrop" onClick={() => setSelectedAppt(null)}>
              <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', width: '90%' }}>
                <button className="modal-close" onClick={() => setSelectedAppt(null)}>×</button>
                <h2>Appointment Metadata</h2>
                <div style={{ marginTop: '14px', lineHeight: '1.7', fontSize: '14px', color: '#374151' }}>
                  <p><b>Client:</b> {selectedAppt.user_name}</p>
                  <p><b>Professional Role:</b> {selectedAppt.consultant_type}</p>
                  <p><b>Focus Topic:</b> {selectedAppt.focus}</p>
                  <p><b>Scheduled Date:</b> {selectedAppt.appointment_date}</p>
                  <p><b>Scheduled Time:</b> {formatApptTime(selectedAppt.appointment_time)} (Asia/Kolkata)</p>
                  <p><b>Status:</b> {selectedAppt.status}</p>
                  {selectedAppt.decline_reason && (
                    <p style={{ color: '#dc2626' }}><b>Decline Reason:</b> {selectedAppt.decline_reason}</p>
                  )}
                  {selectedAppt.meeting_link && (
                    <p><b>Meeting Platform:</b> Google Meet (Link active)</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* SYSTEM ACTIVITY LOGS SECTION */}
      {page === 'activity-logs' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: '280px' }}>
              <input
                type="text"
                placeholder="Search by actor, ID, or details..."
                value={activitySearch}
                onChange={e => setActivitySearch(e.target.value)}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #ccc', width: '280px', fontSize: '13px' }}
              />
              <select
                value={activityFilter}
                onChange={e => setActivityFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }}
              >
                <option value="All">All Results</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="failure">Failure / Error</option>
              </select>
            </div>
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
              {(data?.items || []).length} Recorded Audit Log Events
            </span>
          </div>

          <div className="table">
            <div className="tr head"><span>Timestamp</span><span>Event</span><span>Actor / ID</span><span>Result</span><span>Details</span></div>
            {(() => {
              const formatEventName = (evt) => {
                const map = {
                  'login_success': 'User Login',
                  'account_created': 'Account Created',
                  'palm_reading_created': 'Palm Reading Analyzed',
                  'tarot_reading_created': 'Tarot Reading Generated',
                  'appointment_requested': 'Appointment Requested',
                  'appointment_accepted': 'Appointment Accepted',
                  'appointment_declined': 'Appointment Declined',
                  'manual_meet_link_saved': 'Meet Link Saved',
                  'calendar_not_configured': 'Calendar Notice',
                  'admin_user_created': 'Admin Created User',
                  'admin_user_updated': 'Admin Updated User',
                  'admin_user_deleted': 'Admin Deleted User'
                };
                if (map[evt]) return map[evt];
                return evt ? evt.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'System Event';
              };

              const formatLogDetails = (details) => {
                if (!details) return '—';
                if (typeof details === 'string') return details;
                if (typeof details === 'object') {
                  const parts = [];
                  if (details.message) parts.push(details.message);
                  if (details.error) parts.push(`Error: ${details.error}`);
                  if (details.reason) parts.push(`Reason: ${details.reason}`);
                  if (details.user) parts.push(`User: ${details.user}`);
                  if (details.role) parts.push(`Role: ${details.role}`);
                  if (details.spread) parts.push(`Spread: ${details.spread}`);
                  if (details.hand_side) parts.push(`Hand: ${details.hand_side}`);
                  if (details.consultant_type) parts.push(`Consultant: ${details.consultant_type}`);
                  if (details.date) parts.push(`Date: ${details.date}${details.time ? ' ' + details.time : ''}`);
                  if (details.meeting_url) parts.push(`Meet: ${details.meeting_url}`);
                  
                  if (parts.length > 0) return parts.join(' • ');

                  const safePairs = Object.entries(details)
                    .filter(([k]) => !['password', 'token', 'secret', 'access_token', 'refresh_token'].includes(k.toLowerCase()))
                    .map(([k, v]) => `${k}: ${typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v)}`);
                  return safePairs.length > 0 ? safePairs.join(' • ') : '—';
                }
                return String(details);
              };

              const formatLogTime = (ts) => {
                if (!ts) return '—';
                try {
                  const d = new Date(ts);
                  if (isNaN(d.getTime())) return ts;
                  return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
                } catch (e) {
                  return ts;
                }
              };

              const getResultBadge = (res) => {
                const r = (res || '').toLowerCase();
                if (r === 'success') return { bg: 'rgba(34, 197, 94, 0.15)', color: '#16a34a', label: 'SUCCESS' };
                if (r === 'warning') return { bg: 'rgba(234, 179, 8, 0.15)', color: '#ca8a04', label: 'WARNING' };
                if (r === 'failure' || r === 'error') return { bg: 'rgba(239, 68, 68, 0.15)', color: '#dc2626', label: 'FAILED' };
                return { bg: 'rgba(124, 58, 237, 0.12)', color: '#7c3aed', label: (res || 'INFO').toUpperCase() };
              };

              const filtered = (data?.items || []).filter(log => {
                const matchFilter = activityFilter === 'All' || (log.action_result || log.result || '').toLowerCase() === activityFilter.toLowerCase();
                const searchLow = activitySearch.toLowerCase();
                const detailsStr = formatLogDetails(log.details).toLowerCase();
                const matchSearch = !activitySearch ||
                  (log.actor || '').toLowerCase().includes(searchLow) ||
                  (log.event_type || '').toLowerCase().includes(searchLow) ||
                  String(log.record_id || '').toLowerCase().includes(searchLow) ||
                  detailsStr.includes(searchLow);
                return matchFilter && matchSearch;
              });

              if (filtered.length === 0) {
                return (
                  <div style={{ padding: '35px', textAlign: 'center', color: '#6b7280', gridColumn: '1 / -1', background: '#ffffff', borderRadius: '8px' }}>
                    No activity logs match your filter criteria.
                  </div>
                );
              }

              return filtered.map((log, idx) => {
                const badge = getResultBadge(log.action_result || log.result);
                return (
                  <div className="tr" key={idx}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{formatLogTime(log.timestamp)}</span>
                    <span><b>{formatEventName(log.event_type)}</b></span>
                    <span>{log.actor ? `${log.actor}${log.record_id && log.record_id !== 'unknown' ? ` (#${log.record_id})` : ''}` : (log.record_id ? `#${log.record_id}` : 'System')}</span>
                    <span>
                      <span className="status" style={{ background: badge.bg, color: badge.color, padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                        {badge.label}
                      </span>
                    </span>
                    <span style={{ fontSize: '12px', wordBreak: 'break-word', color: '#374151', lineHeight: '1.4' }}>
                      {formatLogDetails(log.details)}
                    </span>
                  </div>
                );
              });
            })()}
          </div>
        </>
      )}

      {/* SYSTEM REPORTS SECTION */}
      {page === 'system-reports' && (
        <div className="system-reports-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Executive KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="stat" style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e7def8', boxShadow: '0 4px 14px rgba(91, 33, 182, 0.05)' }}>
              <small style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 'bold' }}>Total Registered Users</small>
              <h3 style={{ fontSize: '26px', margin: '8px 0 4px', color: '#1e1932', fontWeight: '800' }}>{data?.users?.total || 0}</h3>
              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>
                ✓ {data?.users?.by_status?.Active || 0} Active Accounts
              </span>
            </div>

            <div className="stat" style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e7def8', boxShadow: '0 4px 14px rgba(91, 33, 182, 0.05)' }}>
              <small style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 'bold' }}>Total Saved Readings</small>
              <h3 style={{ fontSize: '26px', margin: '8px 0 4px', color: '#7c3aed', fontWeight: '800' }}>{data?.readings?.total || 0}</h3>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                {data?.readings?.total_palm || 0} Palm &bull; {data?.readings?.total_tarot || 0} Tarot
              </span>
            </div>

            <div className="stat" style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e7def8', boxShadow: '0 4px 14px rgba(91, 33, 182, 0.05)' }}>
              <small style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 'bold' }}>Consultation Sessions</small>
              <h3 style={{ fontSize: '26px', margin: '8px 0 4px', color: '#059669', fontWeight: '800' }}>{data?.consultations?.total_all || 0}</h3>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                {data?.consultations?.total_appointments || 0} Appts &bull; {data?.consultations?.total_questions || 0} Questions
              </span>
            </div>

            <div className="stat" style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e7def8', boxShadow: '0 4px 14px rgba(91, 33, 182, 0.05)' }}>
              <small style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 'bold' }}>Confirmed Appt Rate</small>
              <h3 style={{ fontSize: '26px', margin: '8px 0 4px', color: '#2563eb', fontWeight: '800' }}>
                {data?.consultations?.total_appointments > 0
                  ? Math.round(((data?.consultations?.appointments_by_status?.Accepted || 0) / data?.consultations?.total_appointments) * 100)
                  : 0}%
              </h3>
              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>
                {data?.consultations?.appointments_by_status?.Accepted || 0} Accepted Sessions
              </span>
            </div>
          </div>

          {/* Analytics Grids */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            {/* User Roles Breakdown */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '22px', border: '1px solid #ebe4f3', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: '#1e1932', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#7c3aed" /> User Roles Demographics
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {Object.entries(data?.users?.by_role || {}).map(([roleName, count]) => {
                  const total = data?.users?.total || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={roleName}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '5px', fontWeight: '500' }}>
                        <span>{roleName}</span>
                        <span style={{ fontWeight: '700', color: '#7c3aed' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '8px', background: '#f1f0f7', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: roleName === 'Administrator' ? '#ef4444' : roleName === 'Spiritual Consultant' ? '#8b5cf6' : roleName === 'Tarot Reader' ? '#3b82f6' : '#10b981', borderRadius: '6px', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Appointment Status Lifecycle */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '22px', border: '1px solid #ebe4f3', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: '#1e1932', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="#059669" /> Appointment Status Lifecycle
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {Object.entries(data?.consultations?.appointments_by_status || {}).map(([st, count]) => {
                  const colors = {
                    'Accepted': { bg: 'rgba(34, 197, 94, 0.12)', text: '#16a34a', border: 'rgba(34, 197, 94, 0.3)' },
                    'Pending': { bg: 'rgba(234, 179, 8, 0.12)', text: '#ca8a04', border: 'rgba(234, 179, 8, 0.3)' },
                    'Declined': { bg: 'rgba(239, 68, 68, 0.12)', text: '#dc2626', border: 'rgba(239, 68, 68, 0.3)' },
                    'Expired': { bg: 'rgba(107, 114, 128, 0.12)', text: '#4b5563', border: 'rgba(107, 114, 128, 0.3)' }
                  };
                  const theme = colors[st] || { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
                  return (
                    <div key={st} style={{ padding: '14px', borderRadius: '10px', background: theme.bg, border: `1px solid ${theme.border}` }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: theme.text }}>{st}</span>
                      <div style={{ fontSize: '22px', fontWeight: '800', color: theme.text, marginTop: '4px' }}>{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Palm Hand Detection Demographics */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '22px', border: '1px solid #ebe4f3', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: '#1e1932', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Hand size={18} color="#7c3aed" /> Palm Hand Side Detection
              </h3>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                {Object.entries(data?.readings?.palm_by_hand || {}).map(([handLabel, count]) => {
                  const totalPalm = data?.readings?.total_palm || 1;
                  const pct = Math.round((count / totalPalm) * 100);
                  return (
                    <div key={handLabel} style={{ flex: 1, minWidth: '110px', padding: '14px', borderRadius: '10px', background: '#f8f6fc', border: '1px solid #e7def8', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>{handLabel}</span>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#7c3aed', margin: '4px 0' }}>{count}</div>
                      <small style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: '600' }}>{pct}% of scans</small>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Readings Modality Ratio */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '22px', border: '1px solid #ebe4f3', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: '#1e1932', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="#3b82f6" /> Reading Modality Distribution
              </h3>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '130px', padding: '14px', borderRadius: '10px', background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.2)', textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>✋ Palmistry Readings</span>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#7c3aed', margin: '4px 0' }}>{data?.readings?.total_palm || 0}</div>
                  <small style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '600' }}>
                    {data?.readings?.total > 0 ? Math.round(((data?.readings?.total_palm || 0) / data?.readings?.total) * 100) : 0}% of all
                  </small>
                </div>
                <div style={{ flex: 1, minWidth: '130px', padding: '14px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>🃏 Tarot Readings</span>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#2563eb', margin: '4px 0' }}>{data?.readings?.total_tarot || 0}</div>
                  <small style={{ fontSize: '11px', color: '#2563eb', fontWeight: '600' }}>
                    {data?.readings?.total > 0 ? Math.round(((data?.readings?.total_tarot || 0) / data?.readings?.total) * 100) : 0}% of all
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Platform Audit Feed */}
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '22px', border: '1px solid #ebe4f3', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#1e1932', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#7c3aed" /> Recent Audit Activity Highlights
              </h3>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                Showing latest {data?.recent_activity?.length || 0} recorded system events
              </span>
            </div>
            <div className="table">
              <div className="tr head"><span>Timestamp</span><span>Event</span><span>Actor</span><span>Result</span><span>Details</span></div>
              {(() => {
                const formatEventName = (evt) => {
                  const map = {
                    'login_success': 'User Login',
                    'account_created': 'Account Created',
                    'palm_reading_created': 'Palm Reading Analyzed',
                    'tarot_reading_created': 'Tarot Reading Generated',
                    'appointment_requested': 'Appointment Requested',
                    'appointment_accepted': 'Appointment Accepted',
                    'appointment_declined': 'Appointment Declined',
                    'manual_meet_link_saved': 'Meet Link Saved',
                    'calendar_not_configured': 'Calendar Notice',
                    'admin_user_created': 'Admin Created User',
                    'admin_user_updated': 'Admin Updated User',
                    'admin_user_deleted': 'Admin Deleted User'
                  };
                  if (map[evt]) return map[evt];
                  return evt ? evt.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'System Event';
                };

                const formatLogDetails = (details) => {
                  if (!details) return '—';
                  if (typeof details === 'string') return details;
                  if (typeof details === 'object') {
                    const parts = [];
                    if (details.message) parts.push(details.message);
                    if (details.error) parts.push(`Error: ${details.error}`);
                    if (details.reason) parts.push(`Reason: ${details.reason}`);
                    if (details.user) parts.push(`User: ${details.user}`);
                    if (details.role) parts.push(`Role: ${details.role}`);
                    if (details.spread) parts.push(`Spread: ${details.spread}`);
                    if (details.hand_side) parts.push(`Hand: ${details.hand_side}`);
                    if (details.consultant_type) parts.push(`Consultant: ${details.consultant_type}`);
                    if (details.date) parts.push(`Date: ${details.date}${details.time ? ' ' + details.time : ''}`);
                    if (details.meeting_url) parts.push(`Meet: ${details.meeting_url}`);
                    
                    if (parts.length > 0) return parts.join(' • ');

                    const safePairs = Object.entries(details)
                      .filter(([k]) => !['password', 'token', 'secret', 'access_token', 'refresh_token'].includes(k.toLowerCase()))
                      .map(([k, v]) => `${k}: ${typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v)}`);
                    return safePairs.length > 0 ? safePairs.join(' • ') : '—';
                  }
                  return String(details);
                };

                const formatLogTime = (ts) => {
                  if (!ts) return '—';
                  try {
                    const d = new Date(ts);
                    if (isNaN(d.getTime())) return ts;
                    return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
                  } catch (e) {
                    return ts;
                  }
                };

                const getResultBadge = (res) => {
                  const r = (res || '').toLowerCase();
                  if (r === 'success') return { bg: 'rgba(34, 197, 94, 0.15)', color: '#16a34a', label: 'SUCCESS' };
                  if (r === 'warning') return { bg: 'rgba(234, 179, 8, 0.15)', color: '#ca8a04', label: 'WARNING' };
                  if (r === 'failure' || r === 'error') return { bg: 'rgba(239, 68, 68, 0.15)', color: '#dc2626', label: 'FAILED' };
                  return { bg: 'rgba(124, 58, 237, 0.12)', color: '#7c3aed', label: (res || 'INFO').toUpperCase() };
                };

                return (data?.recent_activity || []).slice(0, 8).map((log, idx) => {
                  const badge = getResultBadge(log.action_result || log.result);
                  return (
                    <div className="tr" key={idx}>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>{formatLogTime(log.timestamp)}</span>
                      <span><b>{formatEventName(log.event_type)}</b></span>
                      <span>{log.actor || 'System'}</span>
                      <span>
                        <span className="status" style={{ background: badge.bg, color: badge.color, padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                          {badge.label}
                        </span>
                      </span>
                      <span style={{ fontSize: '12px', wordBreak: 'break-word', color: '#4b5563' }}>
                        {formatLogDetails(log.details)}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM HEALTH SECTION */}
      {page === 'system' && (
        <div className="system-grid">
          {(data?.items || []).map(x => (
            <div className="system-card" key={x.name}>
              <Activity size={18} />
              <div>
                <b>{x.name}</b>
                <p>{x.value}</p>
              </div>
              <CheckCircle size={16} color={x.value?.toLowerCase().includes('healthy') || x.value?.toLowerCase().includes('online') || x.value?.toLowerCase().includes('ready') || x.value?.toLowerCase().includes('configured') ? '#16a34a' : '#ca8a04'} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
function SpiritualConsultation({user}) {

  const [mode, setMode] = useState(null);

  const [question, setQuestion] = useState('');
  const [topic, setTopic] = useState('Personal Growth');

  const [appointmentTopic, setAppointmentTopic] =
    useState('Personal Guidance');

  const [appointmentDate, setAppointmentDate] =
    useState('');

  const [appointmentTime, setAppointmentTime] =
    useState('');

  const [details, setDetails] =
    useState('');

  const [message, setMessage] =
    useState('');

  const submitQuestion = async () => {

  if (!question.trim()) {
    setMessage('Please enter your question.');
    return;
  }

  try {

    const response = await fetch(
      API + '/consultations',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          user_name: user.name,
          consultant_type: 'Spiritual Consultant',
          question: question,
          focus: topic,
          spread: 'Spiritual Consultation',
          cards: [],
          consultation_mode: 'Question',
          appointment_date: '',
          appointment_time: '',
          details: ''
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || 'Failed to send question.'
      );
    }

    setMessage(
      'Your question has been successfully sent to a Spiritual Consultant.'
    );
    triggerToast(
      'success',
      'Question Sent Successfully',
      'Your question has been sent to the Spiritual Consultant. You will be notified when a response is available.'
    );

    setQuestion('');

  } catch (error) {

    console.error(error);

    setMessage(
      'Unable to send your question. Please try again.'
    );
    triggerToast(
      'error',
      'Submission Failed',
      error.message || 'Unable to send your question. Please try again.'
    );

  }
};


  const [consultantType, setConsultantType] = useState('Spiritual Consultant');
  const [durationMinutes, setDurationMinutes] = useState(30);

  const submitAppointment = async () => {
    if (!appointmentDate || !appointmentTime) {
      setMessage('Please select your preferred date and time.');
      triggerToast('info', 'Incomplete Details', 'Please select your preferred date and time.');
      return;
    }

    // Validate that appointment date/time is not in the past (Asia/Kolkata timezone awareness)
    const selectedDateTime = new Date(`${appointmentDate}T${appointmentTime}:00`);
    if (isNaN(selectedDateTime.getTime()) || selectedDateTime <= new Date()) {
      setMessage('Please select a future appointment date and time.');
      triggerToast('error', 'Invalid Time', 'Appointment date and time must be in the future.');
      return;
    }

    try {
      const response = await fetch(
        API + '/consultations',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_name: user.name,
            consultant_type: consultantType,
            question: `Appointment request for ${appointmentTopic}`,
            focus: appointmentTopic,
            spread: 'Online Consultation',
            cards: [],
            consultation_mode: 'Appointment',
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
            duration_minutes: durationMinutes,
            details: details
          })
        }
      );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || 'Failed to submit appointment request.'
      );
    }

    setMessage(
      'Your appointment request has been successfully sent to a Spiritual Consultant.'
    );
    triggerToast(
      'success',
      'Appointment Requested',
      'Your appointment request has been sent to the Spiritual Consultant.'
    );

    setAppointmentDate('');
    setAppointmentTime('');
    setDetails('');

  } catch (error) {

    console.error(error);

    setMessage(
      'Unable to submit your appointment request. Please try again.'
    );

  }
};

  return (
  <>
    <PageHead
      title="Spiritual Consultation"
      sub="Connect with a spiritual consultant for personalized guidance beyond your tarot and palm readings."
    />

    <div className="spiritual-consultation-page">

      {/* HERO */}
      <section className="sc-hero">

        <div className="sc-hero-content">

          <div className="sc-badge">
            ✨ Spiritual Consultation
          </div>

          <h1>
            Personalized
            <span> Spiritual Guidance</span>
          </h1>

          <p>
            Share your concerns, questions or life goals with a
            spiritual consultant and receive thoughtful,
            personalized guidance for your journey.
          </p>

          <div className="sc-quote">
            <span>“</span>
            <div>
              <strong>
                Sometimes, a new perspective is all you need.
              </strong>
              <small>
                Let's find clarity together.
              </small>
            </div>
          </div>

        </div>

        <div className="sc-hero-art">

          <div className="sc-moon">☾</div>

          <div className="sc-stars">✦　✧　✦</div>

          <div className="sc-hand">
            ✋
          </div>

          <div className="sc-orbit"></div>

        </div>

      </section>


      {/* GUIDANCE AREAS */}
      <section className="sc-guidance">

        <div className="sc-guidance-item">
          <div className="sc-round pink">✿</div>
          <div>
            <h3>Career Guidance</h3>
            <p>Find clarity in your professional journey</p>
          </div>
        </div>

        <div className="sc-guidance-item">
          <div className="sc-round purple">♡</div>
          <div>
            <h3>Relationship Support</h3>
            <p>Gain insights into love and relationships</p>
          </div>
        </div>

        <div className="sc-guidance-item">
          <div className="sc-round green">⌁</div>
          <div>
            <h3>Personal Growth</h3>
            <p>Discover your inner strength and purpose</p>
          </div>
        </div>

        <div className="sc-guidance-item">
          <div className="sc-round gold">★</div>
          <div>
            <h3>Life Direction</h3>
            <p>Make informed decisions with guidance</p>
          </div>
        </div>

      </section>


      {/* MAIN ACTIONS */}
      {!mode && (
        <section className="sc-actions">

          {/* QUESTION */}
          <div className="sc-action-card question-card">

            <div className="sc-action-art">
              <div className="sc-chat-icon">☷</div>
              <span>✦</span>
              <span>☾</span>
            </div>

            <div className="sc-action-content">

              <h2>Ask a Question</h2>

              <p>
                Have a personal question about your career,
                relationships, personal growth or life direction?
                Send your question directly to a spiritual consultant.
              </p>

              <button
                className="sc-main-button"
                onClick={() => {
                  setMode('question');
                  setMessage('');
                }}
              >
                💬
                <span>Ask a Question</span>
                →
              </button>

              <div className="sc-example-title">
                EXAMPLE QUESTIONS
              </div>

              <div className="sc-pills">

                <button
                  onClick={() => {
                    setTopic('Career');
                    setQuestion('Will I be successful in my career?');
                    setMode('question');
                    setMessage('');
                  }}
                >
                  ✦ Will I be successful in my career?
                </button>

                <button
                  onClick={() => {
                    setTopic('Relationships');
                    setQuestion(
                      'Is this a good time for a relationship?'
                    );
                    setMode('question');
                    setMessage('');
                  }}
                >
                  ✦ Is this a good time for a relationship?
                </button>

                <button
                  onClick={() => {
                    setTopic('Personal Growth');
                    setQuestion(
                      'How can I overcome my current challenges?'
                    );
                    setMode('question');
                    setMessage('');
                  }}
                >
                  ✦ How can I overcome my current challenges?
                </button>

                <button
                  onClick={() => {
                    setTopic('Life Direction');
                    setQuestion('What is my life purpose?');
                    setMode('question');
                    setMessage('');
                  }}
                >
                  ✦ What is my life purpose?
                </button>

              </div>

            </div>

          </div>


          {/* APPOINTMENT */}
          <div className="sc-action-card appointment-card">

            <div className="sc-action-art calendar-art">
              📅
              <span>◷</span>
            </div>

            <div className="sc-action-content">

              <h2>Request an Appointment</h2>

              <p>
                Prefer a personal consultation?
                Request an appointment with a spiritual consultant
                at your preferred date and time.
              </p>

              <button
                className="sc-main-button"
                onClick={() => {
                  setMode('appointment');
                  setMessage('');
                }}
              >
                📅
                <span>Request Appointment</span>
                →
              </button>

              <div className="sc-example-title">
                CONSULTATION TYPES
              </div>

              <div className="sc-consultation-types">

                <div>
                  <strong>▣</strong>
                  <span>
                    <b>Video Call</b>
                    Face-to-face consultation
                  </span>
                </div>

                <div>
                  <strong>☎</strong>
                  <span>
                    <b>Audio Call</b>
                    Voice consultation
                  </span>
                </div>

                <div>
                  <strong>●</strong>
                  <span>
                    <b>Chat</b>
                    Text-based guidance
                  </span>
                </div>

              </div>

            </div>

          </div>

        </section>
      )}


      {/* QUESTION FORM */}
      {mode === 'question' && (

        <section className="sc-form-card">

          <div className="sc-form-top">

            <div>
              <span className="sc-badge">
                ✨ Personal Guidance
              </span>

              <h2>Ask a Spiritual Consultant</h2>

              <p>
                Share your question and provide some context
                so the consultant can guide you better.
              </p>
            </div>

            <button
              className="sc-close"
              onClick={() => {
                setMode(null);
                setMessage('');
              }}
            >
              ×
            </button>

          </div>

          <div className="sc-form-grid">

            <label>
              Topic

              <select
                value={topic}
                onChange={(e) =>
                  setTopic(e.target.value)
                }
              >
                <option>Career</option>
                <option>Relationships</option>
                <option>Personal Growth</option>
                <option>Life Direction</option>
                <option>Emotional Wellbeing</option>
                <option>Other</option>
              </select>

            </label>

            <label className="sc-full">
              Your Question

              <textarea
                rows={6}
                value={question}
                onChange={(e) =>
                  setQuestion(e.target.value)
                }
                placeholder="Write your question here..."
              />
            </label>

          </div>

          {message && (
            <div className="sc-success">
              ✓ {message}
            </div>
          )}

          <button
            className="sc-main-button"
            onClick={submitQuestion}
          >
            💬
            <span>Send Question</span>
            →
          </button>

        </section>
      )}


      {/* APPOINTMENT FORM */}
      {mode === 'appointment' && (

        <section className="sc-form-card">

          <div className="sc-form-top">

            <div>
              <span className="sc-badge">
                ✨ Personal Consultation
              </span>

              <h2>Request a Consultation</h2>

              <p>
                Choose your preferred consultation details.
              </p>
            </div>

            <button
              className="sc-close"
              onClick={() => {
                setMode(null);
                setMessage('');
              }}
            >
              ×
            </button>

          </div>

          <div className="sc-form-grid">

            <label>
              Professional
              <input
                type="text"
                value="Spiritual Consultant"
                readOnly
                disabled
                style={{ background: '#f8fafc', cursor: 'default', fontWeight: '500' }}
              />
            </label>

            <label>
              Consultation Topic
              <select
                value={appointmentTopic}
                onChange={(e) =>
                  setAppointmentTopic(e.target.value)
                }
              >
                <option>Career Guidance</option>
                <option>Relationship Guidance</option>
                <option>Personal Growth</option>
                <option>Life Direction</option>
                <option>General Spiritual Guidance</option>
              </select>
            </label>

            <label>
              Consultation Mode & Duration
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
              >
                <option value={30}>Google Meet (30 Minutes)</option>
                <option value={45}>Google Meet (45 Minutes)</option>
                <option value={60}>Google Meet (60 Minutes)</option>
              </select>
            </label>

            <label>
              Preferred Date (Asia/Kolkata)
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={appointmentDate}
                onChange={(e) =>
                  setAppointmentDate(e.target.value)
                }
                required
              />
            </label>

            <label>
              Preferred Time
              <input
                type="time"
                value={appointmentTime}
                onChange={(e) =>
                  setAppointmentTime(e.target.value)
                }
                required
              />
            </label>

            <label className="sc-full">
              Additional Details

              <textarea
                rows={5}
                value={details}
                onChange={(e) =>
                  setDetails(e.target.value)
                }
                placeholder="Briefly describe what you would like guidance about..."
              />
            </label>

          </div>

          {message && (
            <div className="sc-success">
              ✓ {message}
            </div>
          )}

          <button
            className="sc-main-button"
            onClick={submitAppointment}
          >
            📅
            <span>Request Appointment</span>
            →
          </button>

        </section>
      )}


      {/* BOTTOM CTA */}
      {!mode && (
        <section className="sc-bottom-cta">

          <div>
            <span>✦</span>

            <h2>Guidance for a Brighter You</h2>

            <p>
              Take the next step in your journey.
              Connect with an expert and gain deeper
              insights into your life's path.
            </p>
          </div>

          <div className="sc-cta-art">
            ☾　✦　✧
          </div>

          <button
            onClick={() => {
              setMode('appointment');
              setMessage('');
            }}
          >
            Find a Consultant →
          </button>

        </section>
      )}

    </div>
  </>
);
}
createRoot(document.getElementById('root')).render(<App/>);
