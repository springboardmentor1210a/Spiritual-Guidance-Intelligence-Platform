import { useState, useEffect, useCallback, useMemo } from "react";
import {
  HistoryIcon, RefreshCw, MessageSquare, Calendar as CalendarIcon,
  Video, AlertTriangle, Clock, Check, ExternalLink, CalendarDays
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { collection, query, where, getDocs, doc, updateDoc, setDoc, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import RescheduleModal from "../components/expert/RescheduleModal";
import {
  getSessionTimestamp,
  checkScheduleConflict,
  formatSessionTime,
  formatSessionDateTime
} from "../utils/scheduleConflict";

export default function ConsultantSessions() {
  const { token, user } = useAuth();
  const { openChat } = useChat();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming' | 'calendar' | 'past'

  // Reschedule Modal State
  const [rescheduleSession, setRescheduleSession] = useState(null);

  const isSessionPast = (s, curTime = Date.now()) => {
    const status = (s.status || "").toLowerCase();
    if (status === "completed" || status === "missed") return true;
    const timestamp = getSessionTimestamp(s);
    if (timestamp && timestamp <= curTime) return true;
    return false;
  };

  const isSessionUpcoming = (s, curTime = Date.now()) => {
    if (isSessionPast(s, curTime)) return false;
    const status = (s.status || "").toLowerCase();
    if (status === "completed" || status === "missed" || status === "declined") return false;
    return true;
  };

  const fetchData = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const sessionMap = new Map();
      const blocks = [];

      // 1. Fetch from sessions where readerId == user.uid
      const sSnap1 = await getDocs(query(collection(db, "sessions"), where("readerId", "==", user.uid)));
      sSnap1.forEach((d) => {
        const data = d.data();
        delete data.notes;
        delete data.notesUpdatedAt;
        sessionMap.set(d.id, { id: d.id, ...data });
      });

      // 2. Fetch from sessions where expertId == user.uid
      const sSnap2 = await getDocs(query(collection(db, "sessions"), where("expertId", "==", user.uid)));
      sSnap2.forEach((d) => {
        const data = d.data();
        delete data.notes;
        delete data.notesUpdatedAt;
        sessionMap.set(d.id, { id: d.id, ...data });
      });

      // 3. Fetch from consultations where expertId == user.uid
      const cSnap1 = await getDocs(query(collection(db, "consultations"), where("expertId", "==", user.uid)));
      cSnap1.forEach((d) => {
        const data = d.data();
        delete data.notes;
        delete data.notesUpdatedAt;
        if (data.type === "blocked" || data.status === "blocked") {
          blocks.push({ id: d.id, ...data });
        } else if (data.type === "session" || data.scheduledFor || data.scheduledTime) {
          if (!sessionMap.has(d.id) && !sessionMap.has(data.consultationId)) {
            sessionMap.set(d.id, { id: d.id, ...data });
          } else {
            // Merge fields
            const existing = sessionMap.get(d.id) || sessionMap.get(data.consultationId);
            if (existing) {
              sessionMap.set(existing.id, { ...data, ...existing });
            }
          }
        }
      });

      const list = Array.from(sessionMap.values());

      // Auto-migrate expired sessions to completed
      const now = Date.now();
      for (const s of list) {
        const sched = getSessionTimestamp(s);
        const status = (s.status || "").toLowerCase();
        if (sched && sched <= now && status !== "completed" && status !== "missed" && status !== "declined") {
          s.status = "completed";
          s.completedAt = new Date().toISOString();
          try {
            await updateDoc(doc(db, "sessions", s.id), {
              status: "completed",
              completedAt: s.completedAt
            });
            try {
              const cId = s.consultationId || s.id;
              await setDoc(doc(db, "consultations", cId), {
                status: "completed",
                completedAt: s.completedAt
              }, { merge: true });
            } catch {
              // Ignore
            }
          } catch (e) {
            console.warn("Could not auto-update expired consultant session:", e);
          }
        }
      }

      setSessions(list.sort((a, b) => (getSessionTimestamp(b) || 0) - (getSessionTimestamp(a) || 0)));
      setBlockedSlots(blocks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Real-time evaluation interval
  useEffect(() => {
    if (!sessions.length) return;
    const interval = setInterval(async () => {
      const now = Date.now();
      let hasExpired = false;
      const updated = await Promise.all(
        sessions.map(async (s) => {
          const sched = getSessionTimestamp(s);
          const status = (s.status || "").toLowerCase();
          if (sched && sched <= now && status !== "completed" && status !== "missed" && status !== "declined") {
            hasExpired = true;
            const completedAt = new Date().toISOString();
            try {
              await updateDoc(doc(db, "sessions", s.id), { status: "completed", completedAt });
            } catch (e) {
              console.warn("Real-time migration error:", e);
            }
            return { ...s, status: "completed", completedAt };
          }
          return s;
        })
      );
      if (hasExpired) setSessions(updated);
    }, 10000);
    return () => clearInterval(interval);
  }, [sessions]);

  // Accept incoming session booking
  const handleAccept = async (id, userId) => {
    const meetLink = window.prompt("Enter Google Meet Link for this session (e.g., https://meet.google.com/xyz-abcd-efg):");
    if (!meetLink) return;

    const formattedLink = meetLink.trim().startsWith("http") ? meetLink.trim() : `https://${meetLink.trim()}`;

    try {
      // 1. Update session
      await updateDoc(doc(db, "sessions", id), { status: "accepted", meetLink: formattedLink });

      // 2. Sync consultation
      const s = sessions.find((x) => x.id === id);
      const cId = s?.consultationId || id;
      try {
        await setDoc(doc(db, "consultations", cId), { status: "accepted", meetLink: formattedLink }, { merge: true });
      } catch (err) {
        console.warn("Consultation sync error:", err);
      }

      // 3. Notify client user
      const targetUserId = userId || s?.userId;
      if (targetUserId) {
        await addDoc(collection(db, "users", targetUserId, "notifications"), {
          title: "Session Booking Accepted!",
          message: `Your consultant has accepted your live session request. Google Meet link is attached.`,
          meetingLink: formattedLink,
          sessionId: id,
          read: false,
          createdAt: new Date().toISOString()
        });
      }

      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error accepting session.");
    }
  };

  // Decline incoming session booking
  const handleDecline = async (id) => {
    if (!window.confirm("Are you sure you want to decline this session request?")) return;
    try {
      await updateDoc(doc(db, "sessions", id), { status: "declined" });
      const s = sessions.find((x) => x.id === id);
      const cId = s?.consultationId || id;
      try {
        await setDoc(doc(db, "consultations", cId), { status: "declined" }, { merge: true });
      } catch {
        // Ignore
      }

      const targetUserId = s?.userId;
      if (targetUserId) {
        await addDoc(collection(db, "users", targetUserId, "notifications"), {
          title: "Session Request Declined",
          message: "Your consultant was unable to accept this booking slot. Please choose another time.",
          sessionId: id,
          read: false,
          createdAt: new Date().toISOString()
        });
      }

      fetchData();
    } catch {
      alert("Error declining session.");
    }
  };

  useEffect(() => {
    if (token && user?.uid) fetchData();
  }, [token, user, fetchData]);

  const confirmedSessions = useMemo(() => {
    return sessions.filter((s) => {
      const st = (s.status || "").toLowerCase();
      return st === "accepted" || st === "active";
    });
  }, [sessions]);

  const pendingSessions = useMemo(() => {
    return sessions.filter((s) => (s.status || "").toLowerCase() === "pending");
  }, [sessions]);

  const upcomingSessions = useMemo(() => {
    return sessions.filter((s) => isSessionUpcoming(s));
  }, [sessions]);

  const pastSessions = useMemo(() => {
    return sessions.filter((s) => isSessionPast(s));
  }, [sessions]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h1 className="text-2xl mb-1 flex items-center gap-2 font-display">
            <HistoryIcon size={24} className="text-gold" />
            <span>Consultant Sessions</span>
          </h1>
          <p className="text-inkMuted text-sm">
            Review incoming bookings, check scheduling conflicts, and view past consultation history.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={fetchData} className="flex items-center gap-2 text-xs">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 sm:gap-4 border-b border-line">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`pb-2.5 text-sm transition-colors flex items-center gap-2 ${
            activeTab === "upcoming"
              ? "text-gold border-b-2 border-gold font-semibold"
              : "text-inkMuted hover:text-ink"
          }`}
        >
          <span>Upcoming &amp; Pending</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-surface border border-line">
            {upcomingSessions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("past")}
          className={`pb-2.5 text-sm transition-colors flex items-center gap-2 ${
            activeTab === "past"
              ? "text-gold border-b-2 border-gold font-semibold"
              : "text-inkMuted hover:text-ink"
          }`}
        >
          <span>Past Sessions</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-surface border border-line">
            {pastSessions.length}
          </span>
        </button>
      </div>

      {/* TAB 1: UPCOMING & PENDING SESSIONS */}
      {activeTab === "upcoming" && (
        <Card>
          {loading ? (
            <div className="h-40 bg-line/10 rounded animate-pulse" />
          ) : upcomingSessions.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-line rounded-lg">
              <p className="text-inkMuted text-sm">No upcoming or pending session requests.</p>
              <p className="text-xs text-inkMuted mt-1">
                Your schedule is clear. Check the schedule on your Dashboard to manage your working hours.
              </p>
            </div>
          ) : (
            <SessionTable
              sessions={upcomingSessions}
              confirmedSessions={confirmedSessions}
              blockedSlots={blockedSlots}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onReschedule={(s) => setRescheduleSession(s)}
              onChat={openChat}
            />
          )}
        </Card>
      )}

      {/* TAB 2: PAST SESSIONS */}
      {activeTab === "past" && (
        <Card>
          {loading ? (
            <div className="h-40 bg-line/10 rounded animate-pulse" />
          ) : pastSessions.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-line rounded-lg">
              <p className="text-inkMuted text-sm">No historical sessions found.</p>
            </div>
          ) : (
            <SessionTable
              sessions={pastSessions}
              confirmedSessions={confirmedSessions}
              blockedSlots={blockedSlots}
              onChat={openChat}
            />
          )}
        </Card>
      )}

      {/* Reschedule Modal */}
      <RescheduleModal
        session={rescheduleSession}
        isOpen={Boolean(rescheduleSession)}
        onClose={() => setRescheduleSession(null)}
        onSuccess={() => {
          fetchData();
          alert("Reschedule proposal sent to client successfully!");
        }}
        expertName={user?.name || "Your Consultant"}
      />
    </div>
  );
}

function SessionTable({
  sessions,
  confirmedSessions = [],
  blockedSlots = [],
  onAccept,
  onDecline,
  onReschedule,
  onChat
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-inkMuted border-b border-line">
            <th className="pb-2.5 font-normal">Client &amp; Topic</th>
            <th className="pb-2.5 font-normal">Scheduled For</th>
            <th className="pb-2.5 font-normal">Duration</th>
            <th className="pb-2.5 font-normal">Status &amp; Conflicts</th>
            <th className="pb-2.5 font-normal text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => {
            const isPending = (s.status || "").toLowerCase() === "pending";
            const conflict = isPending ? checkScheduleConflict(s, confirmedSessions, blockedSlots) : { hasConflict: false };
            const meet = s.meetLink || s.meetingLink || s.googleMeetLink;

            return (
              <tr key={s.id} className="border-b border-line last:border-0 hover:bg-void/30 transition-colors">
                <td className="py-3 font-semibold">
                  <div>{s.userName || s.clientName || s.Client?.name || "Unknown"}</div>
                  <div className="text-xs text-inkMuted font-normal mt-0.5">{s.category || s.topic || "Spiritual Consultation"}</div>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1.5 text-xs text-ink font-medium">
                    <Clock size={12} className="text-gold" />
                    <span>
                      {s.scheduledFor || s.scheduledTime
                        ? formatSessionDateTime(s.scheduledFor || s.scheduledTime)
                        : new Date(s.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {meet && (
                    <a
                      href={meet}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-violet hover:underline text-xs mt-1 font-semibold"
                    >
                      <Video size={12} />
                      <span>Join Google Meet</span>
                    </a>
                  )}
                </td>
                <td className="py-3">{s.duration ? `${s.duration}m` : "45m"}</td>
                <td className="py-3">
                  <div className="flex flex-col gap-1 items-start">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs border ${
                        s.status === "active"
                          ? "bg-green-500/10 text-green-400 border-green-500/30"
                          : s.status === "accepted"
                          ? "bg-gold/15 text-gold border-gold/40"
                          : s.status === "completed"
                          ? "bg-line/20 border-line text-inkMuted"
                          : s.status === "pending"
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/40"
                          : s.status === "rescheduled"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          : "bg-violet/10 text-violet border-violet/40"
                      }`}
                    >
                      {s.status}
                    </span>

                    {/* Conflict Badge & Details for Pending Requests */}
                    {isPending && conflict.hasConflict && (
                      <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/40 rounded px-2 py-0.5 flex items-center gap-1 mt-0.5">
                        <AlertTriangle size={11} className="shrink-0" />
                        <span className="font-semibold">Scheduling Conflict</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3 text-right">
                  <div className="flex justify-end gap-1.5 items-center flex-wrap">
                    {isPending && onAccept && onDecline && (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => onDecline(s.id)}
                          className="text-xs px-2.5 py-1 h-auto"
                        >
                          Decline
                        </Button>
                        {onReschedule && (
                          <Button
                            variant="secondary"
                            onClick={() => onReschedule(s)}
                            className="text-xs px-2.5 py-1 h-auto text-gold border-gold/40 hover:bg-gold/10"
                            title="Propose an alternative time"
                          >
                            Reschedule
                          </Button>
                        )}
                        <Button
                          variant="primary"
                          onClick={() => onAccept(s.id, s.userId)}
                          className="text-xs px-2.5 py-1 h-auto"
                        >
                          Accept
                        </Button>
                      </>
                    )}
                    {onChat && (
                      <Button
                        variant="secondary"
                        onClick={() => onChat(s)}
                        className="text-xs px-2.5 py-1 h-auto flex items-center gap-1 border-gold/40 text-gold hover:bg-gold/10"
                        title="Open consultation chat"
                      >
                        <MessageSquare size={12} />
                        <span>Chat</span>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
