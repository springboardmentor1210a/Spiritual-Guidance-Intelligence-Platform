import React, { useState } from 'react';
import { 
  MessageSquare, 
  Clock, 
  Calendar, 
  User, 
  X, 
  Send, 
  CheckCircle2, 
  Mail, 
  Loader2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : window.location.origin
);

const RescheduleChatModal = ({ 
  isOpen, 
  onClose, 
  appointment, 
  onRescheduled 
}) => {
  if (!isOpen || !appointment) return null;

  const [inputMessage, setInputMessage] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(appointment.time || 'Tomorrow at 4:30 PM');
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: `Greetings! I am your Celestial Scheduling Coordinator. Your current consultation for "${appointment.spread || appointment.type || 'Spiritual Reading'}" is set for ${appointment.time}. Choose a new slot or type your desired time below to reschedule and dispatch an email alert.`
    }
  ]);

  const quickSlots = [
    'Today at 6:00 PM',
    'Tomorrow at 4:30 PM',
    'Tomorrow at 7:00 PM',
    'Saturday at 11:00 AM',
    'Sunday at 3:00 PM',
    'Next Monday at 5:00 PM'
  ];

  const handleSendCustomMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setSelectedSlot(userText);

    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { 
          sender: 'assistant', 
          text: `I have noted your preferred slot: "${userText}". Click "Confirm Reschedule & Send Email" below to lock this slot in and notify the client/practitioner.` 
        }
      ]);
    }, 400);
  };

  const handleConfirmReschedule = async () => {
    setIsSending(true);
    setStatusMessage('');

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const res = await axios.post(
        `${API_BASE}/appointments/reschedule`,
        {
          appointment_id: appointment.id || 1,
          new_time: selectedSlot,
          client_name: appointment.clientName || appointment.seekerName || 'Seeker',
          reason: 'Seeker requested schedule adjustment via chat'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsSuccess(true);
      setStatusMessage(`Session confirmed for ${selectedSlot}. Email notification sent!`);
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: `✦ Confirmed! ✦ Your appointment has been updated to ${selectedSlot}. An automated email alert has been dispatched to your inbox.`
        }
      ]);

      if (onRescheduled) {
        onRescheduled({ ...appointment, time: selectedSlot, status: 'Rescheduled' });
      }

      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setStatusMessage('');
      }, 2500);
    } catch (err) {
      setStatusMessage('Could not reschedule: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'radial-gradient(ellipse at top, #1e1b4b, #0f172a)',
          borderRadius: '22px',
          border: '1px solid rgba(168, 85, 247, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(168, 85, 247, 0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <MessageSquare size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#f8fafc' }}>
                Reschedule Session Chat
              </h3>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                {appointment.clientName || appointment.seekerName || 'Client Consultation'} • Currently: {appointment.time}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Chat Stream */}
        <div style={{
          padding: '1.25rem',
          maxHeight: '260px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                background: m.sender === 'user' 
                  ? 'linear-gradient(135deg, #a855f7, #6366f1)' 
                  : 'rgba(255, 255, 255, 0.06)',
                border: m.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                color: '#f8fafc',
                fontSize: '0.84rem',
                lineHeight: '1.45',
                whiteSpace: 'pre-line'
              }}
            >
              {m.text}
            </div>
          ))}
        </div>

        {/* Quick Selection Chips */}
        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', background: 'rgba(0, 0, 0, 0.2)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={12} color="#fbbf24" />
            <span>Select Available Celestial Slot:</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {quickSlots.map((slot, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedSlot(slot);
                  setMessages(prev => [
                    ...prev, 
                    { sender: 'user', text: `I would like to reschedule to ${slot}` },
                    { sender: 'assistant', text: `Slot set to "${slot}". Click "Confirm Reschedule & Send Email" to finalize.` }
                  ]);
                }}
                style={{
                  padding: '5px 10px',
                  borderRadius: '8px',
                  background: selectedSlot === slot ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255, 255, 255, 0.04)',
                  border: selectedSlot === slot ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: selectedSlot === slot ? '#ffffff' : '#94a3b8',
                  fontSize: '0.74rem',
                  fontWeight: selectedSlot === slot ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input Form */}
        <form onSubmit={handleSendCustomMessage} style={{ padding: '0.75rem 1.25rem', display: 'flex', gap: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <input
            type="text"
            placeholder="Or type custom time (e.g. Wednesday 2:00 PM)..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              background: 'rgba(168, 85, 247, 0.25)',
              border: '1px solid rgba(168, 85, 247, 0.5)',
              color: '#c084fc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Send size={15} />
          </button>
        </form>

        {/* Status / Error Toast */}
        {statusMessage && (
          <div style={{
            padding: '8px 1.25rem',
            background: isSuccess ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            borderTop: `1px solid ${isSuccess ? '#22c55e' : '#ef4444'}`,
            color: isSuccess ? '#4ade80' : '#f87171',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {isSuccess ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{
          padding: '1rem 1.25rem',
          background: 'rgba(0, 0, 0, 0.4)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#94a3b8' }}>
            <Mail size={13} color="#fbbf24" />
            <span>Sends email confirmation to registered inbox</span>
          </div>

          <button
            type="button"
            onClick={handleConfirmReschedule}
            disabled={isSending || isSuccess}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              border: 'none',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: isSending ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)'
            }}
          >
            {isSending ? (
              <>
                <Loader2 size={14} className="spinner-ring" />
                Rescheduling...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 size={14} />
                Rescheduled!
              </>
            ) : (
              <>
                <Calendar size={14} />
                Confirm Reschedule & Send Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleChatModal;
