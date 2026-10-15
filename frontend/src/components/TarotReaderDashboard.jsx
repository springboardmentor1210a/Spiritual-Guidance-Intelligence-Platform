import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  User, 
  Layers, 
  Plus, 
  CheckCircle2, 
  Eye, 
  Play, 
  BookOpen, 
  TrendingUp, 
  Award,
  Search,
  Filter,
  FileText,
  MessageSquare
} from 'lucide-react';
import RescheduleChatModal from './RescheduleChatModal';

const TarotReaderDashboard = ({ onOpenTarotTab, practitionerName = 'Navya Parchuri' }) => {
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedAppointmentForReschedule, setSelectedAppointmentForReschedule] = useState(null);
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      clientName: 'Ananya Sharma',
      spread: '10-Card Celtic Cross',
      time: 'Today, 2:30 PM',
      focus: 'Life Path & Transition',
      status: 'Ready',
      fee: '$45.00'
    },
    {
      id: 2,
      clientName: 'Vikram Roy',
      spread: 'Career Crossroads (5-Card)',
      time: 'Today, 4:00 PM',
      focus: 'New Business Opportunity',
      status: 'Confirmed',
      fee: '$35.00'
    },
    {
      id: 3,
      clientName: 'Priya Kapoor',
      spread: 'Soul Resonance (3-Card)',
      time: 'Tomorrow, 11:00 AM',
      focus: 'Relationship Clarity',
      status: 'Upcoming',
      fee: '$25.00'
    },
    {
      id: 4,
      clientName: 'Rohan Mehta',
      spread: 'Yearly Astrological Arcana',
      time: 'Tomorrow, 3:30 PM',
      focus: 'Financial Solar Progression',
      status: 'Upcoming',
      fee: '$60.00'
    }
  ]);

  const [pastReadings, setPastReadings] = useState([
    {
      id: 101,
      clientName: 'Deepa Nair',
      date: 'Yesterday, 5:15 PM',
      spread: 'Celtic Cross',
      keyCard: 'The Star (XVII)',
      rating: '5.0 ★',
      notes: 'Strong alignment towards creative healing path. Seeker confirmed clarity.'
    },
    {
      id: 102,
      clientName: 'Karthik Varma',
      date: 'Oct 07, 2:00 PM',
      spread: '3-Card Past/Present/Future',
      keyCard: 'Wheel of Fortune (X)',
      rating: '4.9 ★',
      notes: 'Major turning point in career; advised patience during upcoming eclipse cycle.'
    },
    {
      id: 103,
      clientName: 'Sneha Patel',
      date: 'Oct 05, 6:30 PM',
      spread: 'Love & Harmony',
      keyCard: 'The Lovers (VI)',
      rating: '5.0 ★',
      notes: 'Deep soul connection identified; focus on authentic vulnerability.'
    }
  ]);

  const [activeDeck, setActiveDeck] = useState('Rider-Waite Classic');
  const [activeSpreadFilter, setActiveSpreadFilter] = useState('All');
  const [notesText, setNotesText] = useState('');
  const [quickNotes, setQuickNotes] = useState([
    'Remember: Swords in reverse denote releasing anxiety rather than conflict.',
    'Celtic Cross Position 5 (Crown) represents seeker’s highest conscious aspiration.'
  ]);

  const handleStartSession = (apt) => {
    if (onOpenTarotTab) {
      onOpenTarotTab();
    }
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!notesText.trim()) return;
    setQuickNotes([notesText.trim(), ...quickNotes]);
    setNotesText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#f8fafc' }}>
      
      {/* Top Banner: Practitioner Status */}
      <div style={{
        padding: '1.5rem 2rem',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.15), rgba(168, 85, 247, 0.15))',
        border: '1px solid rgba(234, 88, 12, 0.35)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ea580c, #f97316)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 20px rgba(234, 88, 12, 0.4)'
          }}>
            <Sparkles size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                {practitionerName || 'Celestial Arcana Reader'}
              </h2>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: '700',
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                color: '#4ade80'
              }}>
                ● Live & Certified
              </span>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.86rem', color: '#cbd5e1' }}>
              Senior Cartomancer & Arcana Interpreter • <strong>Active Deck:</strong> {activeDeck}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenTarotTab}
          style={{
            padding: '0.75rem 1.4rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ea580c, #c2410c)',
            border: 'none',
            color: '#ffffff',
            fontSize: '0.9rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(234, 88, 12, 0.4)',
            transition: 'transform 0.15s ease'
          }}
        >
          <Play size={16} />
          <span>Launch Live 3D Tarot Table</span>
        </button>
      </div>

      {/* 4 Core Metric Pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        <div className="metric-pill" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(234, 88, 12, 0.25)', padding: '1.25rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Consultations</span>
            <Layers size={18} style={{ color: '#ea580c' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff', marginTop: '6px' }}>48</div>
          <div style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '4px' }}>+12 this week</div>
        </div>

        <div className="metric-pill" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(168, 85, 247, 0.25)', padding: '1.25rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Certified Spreads</span>
            <Award size={18} style={{ color: '#a855f7' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff', marginTop: '6px' }}>6 Spreads</div>
          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>Celtic Cross, 3-Card, Love</div>
        </div>

        <div className="metric-pill" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '1.25rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Client Satisfaction</span>
            <TrendingUp size={18} style={{ color: '#38bdf8' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#38bdf8', marginTop: '6px' }}>98.4%</div>
          <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '4px' }}>★★★★★ (4.9 / 5.0)</div>
        </div>

        <div className="metric-pill" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(251, 191, 36, 0.25)', padding: '1.25rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg. Session Time</span>
            <Clock size={18} style={{ color: '#fbbf24' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff', marginTop: '6px' }}>24 mins</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Real-time synchronized</div>
        </div>
      </div>

      {/* Main 2-Column Split: Upcoming Appointment Queue & Spread Decks Studio */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* COLUMN 1: Upcoming Appointment Queue */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} style={{ color: '#ea580c' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0, color: '#ffffff' }}>
                Upcoming Appointment Queue
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(234, 88, 12, 0.15)', color: '#ea580c', fontWeight: '700' }}>
              {appointments.length} Scheduled
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {appointments.map((apt) => (
              <div
                key={apt.id}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'background 0.15s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '700', color: '#f8fafc', fontSize: '0.95rem' }}>{apt.clientName}</span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>• {apt.fee}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#ea580c', fontWeight: '600', marginTop: '2px' }}>
                    {apt.spread}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    <span>{apt.time}</span> • <span>{apt.focus}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAppointmentForReschedule(apt);
                      setIsRescheduleOpen(true);
                    }}
                    style={{
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      background: 'rgba(168, 85, 247, 0.15)',
                      border: '1px solid rgba(168, 85, 247, 0.35)',
                      color: '#c084fc',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <MessageSquare size={12} />
                    <span>Reschedule</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartSession(apt)}
                    style={{
                      padding: '0.55rem 0.9rem',
                      borderRadius: '8px',
                      background: apt.status === 'Ready' ? 'linear-gradient(135deg, #ea580c, #f97316)' : 'rgba(255,255,255,0.06)',
                      border: apt.status === 'Ready' ? 'none' : '1px solid rgba(255,255,255,0.12)',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Play size={12} />
                    <span>{apt.status === 'Ready' ? 'Start Now' : 'Session'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: Spread Creator & Decks Studio */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} style={{ color: '#a855f7' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0, color: '#ffffff' }}>
              Interactive Spread Creator & Decks
            </h3>
          </div>

          {/* Active Decks Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
              Select Active Working Deck:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {['Rider-Waite Classic', 'Celestial Gold Arcana', 'Marseille Historic'].map((deck) => (
                <button
                  key={deck}
                  type="button"
                  onClick={() => setActiveDeck(deck)}
                  style={{
                    padding: '0.6rem 0.5rem',
                    borderRadius: '8px',
                    background: activeDeck === deck ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: activeDeck === deck ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: activeDeck === deck ? '#c084fc' : '#cbd5e1',
                    fontSize: '0.75rem',
                    fontWeight: activeDeck === deck ? '700' : '500',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  {deck}
                </button>
              ))}
            </div>
          </div>

          {/* Certified Spreads Library */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
              Registered Spread Templates:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { name: '10-Card Traditional Celtic Cross', cards: 10, type: 'Full Destiny & Influences' },
                { name: '3-Card Chronological Trinity', cards: 3, type: 'Past, Present, Immediate Future' },
                { name: '5-Card Crossroads Decision Matrix', cards: 5, type: 'Opportunity vs Obstacle' },
                { name: '4-Card Elemental Guidance', cards: 4, type: 'Fire, Water, Air, Earth' }
              ].map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#f1f5f9' }}>{s.name}</span>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{s.type}</div>
                  </div>
                  <span style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: '4px', background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', fontWeight: '700' }}>
                    {s.cards} Cards
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Arcana Interpretation Scratchpad */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
              Practitioner Notes & Arcana Journal:
            </label>
            <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                placeholder="Log a card reflection or seeker insight..."
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.55rem 0.85rem',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: '8px',
                  background: '#a855f7',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </form>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {quickNotes.slice(0, 2).map((qn, i) => (
                <div key={i} style={{ fontSize: '0.74rem', color: '#cbd5e1', padding: '4px 8px', background: 'rgba(168,85,247,0.08)', borderRadius: '6px', borderLeft: '3px solid #a855f7' }}>
                  • {qn}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Full Width Table: Recent Client Consultations History */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} style={{ color: '#38bdf8' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0, color: '#ffffff' }}>
              Client Reading Archives & Interpretation History
            </h3>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Showing recent verified readings
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', color: '#cbd5e1' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94a3b8' }}>
                <th style={{ padding: '0.75rem' }}>Seeker Name</th>
                <th style={{ padding: '0.75rem' }}>Spread Used</th>
                <th style={{ padding: '0.75rem' }}>Key Significator</th>
                <th style={{ padding: '0.75rem' }}>Session Date</th>
                <th style={{ padding: '0.75rem' }}>Seeker Review</th>
                <th style={{ padding: '0.75rem' }}>Practitioner Synthesis</th>
              </tr>
            </thead>
            <tbody>
              {pastReadings.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: '700', color: '#ffffff' }}>
                    {r.clientName}
                  </td>
                  <td style={{ padding: '0.75rem', color: '#ea580c' }}>
                    {r.spread}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', fontSize: '0.75rem', fontWeight: '600' }}>
                      {r.keyCard}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', color: '#94a3b8' }}>
                    {r.date}
                  </td>
                  <td style={{ padding: '0.75rem', color: '#fbbf24', fontWeight: '700' }}>
                    {r.rating}
                  </td>
                  <td style={{ padding: '0.75rem', color: '#cbd5e1', fontSize: '0.78rem', maxWidth: '280px' }}>
                    {r.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reschedule Chat Modal */}
      <RescheduleChatModal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        appointment={selectedAppointmentForReschedule}
        onRescheduled={(updated) => {
          setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a));
        }}
      />
    </div>
  );
};

export default TarotReaderDashboard;
