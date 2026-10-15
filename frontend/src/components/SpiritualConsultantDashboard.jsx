import React, { useState } from 'react';
import { 
  Feather, 
  Compass, 
  Hand, 
  TrendingUp, 
  Award, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  BarChart3,
  Calendar,
  FileCheck,
  Users,
  MessageSquare
} from 'lucide-react';
import RescheduleChatModal from './RescheduleChatModal';

const SpiritualConsultantDashboard = ({ onOpenAstrologyTab, onOpenPalmTab, consultantName = 'Navya Parchuri' }) => {
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [consultations, setConsultations] = useState([
    {
      id: 201,
      seekerName: 'Maya Sundaram',
      type: 'Vedic Kundali + Palm Alignment',
      concern: 'Rahu Mahadasha Career Transition',
      time: 'Today, 3:00 PM',
      status: 'Confirmed'
    },
    {
      id: 202,
      seekerName: 'Rahul Verma',
      type: 'Biometric Palm Line Depth & Life Curve',
      concern: 'Vitality & Long-Term Relocation',
      time: 'Today, 5:30 PM',
      status: 'Confirmed'
    },
    {
      id: 203,
      seekerName: 'Ananya Deshmukh',
      type: 'Ashtakoota Soul Compatibility (36 Pts)',
      concern: 'Marriage & Graha Maitri Analysis',
      time: 'Tomorrow, 10:30 AM',
      status: 'Scheduled'
    }
  ]);

  const [trends, setTrends] = useState([
    { theme: 'Career & Life Purpose (Dharma)', share: '38%', count: 24, growth: '+15%' },
    { theme: 'Relationships & Soul Connection', share: '32%', count: 20, growth: '+8%' },
    { theme: 'Spiritual Awakening & Mindfulness', share: '18%', count: 11, growth: '+22%' },
    { theme: 'Emotional Resilience & Balance', share: '12%', count: 8, growth: '+5%' }
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#f8fafc' }}>
      
      {/* Top Banner: Consultant Status */}
      <div style={{
        padding: '1.5rem 2rem',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))',
        border: '1px solid rgba(16, 185, 129, 0.35)',
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
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
          }}>
            <Feather size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                {consultantName || 'Vedic Life Consultant'}
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
                ● Master Consultant
              </span>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.86rem', color: '#cbd5e1' }}>
              Holistic Life Coach & Vedic Astrologer • Specialization: <strong>Swiss Ephemeris & MediaPipe Biometrics</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            type="button"
            onClick={onOpenAstrologyTab}
            style={{
              padding: '0.7rem 1.2rem',
              borderRadius: '10px',
              background: 'rgba(251, 191, 36, 0.15)',
              border: '1px solid rgba(251, 191, 36, 0.4)',
              color: '#fbbf24',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Compass size={15} />
            <span>Open Vedic Chart</span>
          </button>
          <button
            type="button"
            onClick={onOpenPalmTab}
            style={{
              padding: '0.7rem 1.2rem',
              borderRadius: '10px',
              background: 'rgba(236, 72, 153, 0.15)',
              border: '1px solid rgba(236, 72, 153, 0.4)',
              color: '#f472b6',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Hand size={15} />
            <span>Open Palm Scanner</span>
          </button>
        </div>
      </div>

      {/* 4 Core Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        <div className="metric-pill" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '1.25rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Guidance Effectiveness</span>
            <Award size={18} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#34d399', marginTop: '6px' }}>94.8%</div>
          <div style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '4px' }}>Vedic & Biometric Correlation</div>
        </div>

        <div className="metric-pill" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(251, 191, 36, 0.25)', padding: '1.25rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Horoscopes Computed</span>
            <Compass size={18} style={{ color: '#fbbf24' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff', marginTop: '6px' }}>64 Charts</div>
          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>Swiss Ephemeris Sidereal</div>
        </div>

        <div className="metric-pill" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(236, 72, 153, 0.25)', padding: '1.25rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Biometric Palm Scans</span>
            <Hand size={18} style={{ color: '#ec4899' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff', marginTop: '6px' }}>39 Scans</div>
          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>7 Critical Palm Lines</div>
        </div>

        <div className="metric-pill" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '1.25rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Goal Alignment Rate</span>
            <TrendingUp size={18} style={{ color: '#38bdf8' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#38bdf8', marginTop: '6px' }}>91.2%</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Seeker Self-Reflection Score</div>
        </div>
      </div>

      {/* 2-Column Split: Active Consultations & User Trend Analysis */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* Column 1: Consultation Insights Queue */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} style={{ color: '#10b981' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0, color: '#ffffff' }}>
                Consultation Insights & Appointments
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: '700' }}>
              {consultations.length} Active
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {consultations.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ fontWeight: '700', color: '#f8fafc', fontSize: '0.95rem' }}>{c.seekerName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: '600', marginTop: '2px' }}>
                    {c.type}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '3px' }}>
                    Focus: {c.concern} • <span style={{ color: '#fbbf24' }}>{c.time}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedConsultation(c);
                      setIsRescheduleOpen(true);
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: 'rgba(168, 85, 247, 0.15)',
                      border: '1px solid rgba(168, 85, 247, 0.35)',
                      color: '#c084fc',
                      fontSize: '0.74rem',
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

                  <span style={{
                    fontSize: '0.72rem',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#4ade80',
                    fontWeight: '700'
                  }}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: User Trend Analysis (PDF Page 7) */}
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
            <BarChart3 size={20} style={{ color: '#38bdf8' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0, color: '#ffffff' }}>
              User Trend Analysis (PDF Section 10)
            </h3>
          </div>

          <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
            Aggregated spiritual focus areas and life themes across recent seeker sessions.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {trends.map((t, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#f1f5f9' }}>{t.theme}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: '700' }}>{t.share}</span>
                    <span style={{ fontSize: '0.7rem', color: '#4ade80' }}>({t.growth})</span>
                  </div>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: t.share,
                    height: '100%',
                    background: idx === 0 ? '#38bdf8' : idx === 1 ? '#ec4899' : idx === 2 ? '#fbbf24' : '#10b981',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '0.85rem', background: 'rgba(56, 189, 248, 0.08)', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <span style={{ fontSize: '0.78rem', color: '#bae6fd', lineHeight: '1.5' }}>
              <strong>Consultant Recommendation:</strong> High concentration of Dharma & Career seekers aligns with current Saturn transit over the 10th solar house. Focus on structured discipline and long-term milestones.
            </span>
          </div>
        </div>

      </div>

      {/* Reschedule Chat Modal */}
      <RescheduleChatModal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        appointment={selectedConsultation}
        onRescheduled={(updated) => {
          setConsultations(prev => prev.map(c => c.id === updated.id ? updated : c));
        }}
      />
    </div>
  );
};

export default SpiritualConsultantDashboard;
