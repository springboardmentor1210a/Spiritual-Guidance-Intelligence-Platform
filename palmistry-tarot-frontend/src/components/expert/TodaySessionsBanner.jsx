import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar, Clock, Video, CheckCircle2,
  ExternalLink, Sparkles, MessageSquare, Plus, ChevronRight
} from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { getLocalDateStr, formatSessionTime, getSessionTimestamp } from "../../utils/scheduleConflict";

export default function TodaySessionsBanner({ roleName = "Consultant", sessionsUrl = "/consultant-sessions" }) {
  const { user } = useAuth();
  const { openChat } = useChat ? useChat() : { openChat: null };
  const [todaySessions, setTodaySessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const todayStr = getLocalDateStr(new Date());

    // 1. Listen to consultations where expertId == user.uid
    const consultQ = query(
      collection(db, "consultations"),
      where("expertId", "==", user.uid)
    );

    // 2. Also listen where readerId == user.uid (as backup)
    const readerQ = query(
      collection(db, "consultations"),
      where("readerId", "==", user.uid)
    );

    // 3. And listen to sessions collection as fallback
    const sessionsQ = query(
      collection(db, "sessions"),
      where("readerId", "==", user.uid)
    );

    const activeMap = new Map();

    const processSnapshot = (snapshot) => {
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;
        const status = (data.status || "").toLowerCase();

        // Must be accepted or active
        if (status !== "accepted" && status !== "active") {
          activeMap.delete(id);
          return;
        }

        const timestamp = getSessionTimestamp(data);
        if (!timestamp) return;

        const sessionDateStr = getLocalDateStr(timestamp);
        if (sessionDateStr === todayStr) {
          activeMap.set(id, { id, ...data, timestamp });
        } else {
          activeMap.delete(id);
        }
      });

      const list = Array.from(activeMap.values()).sort((a, b) => a.timestamp - b.timestamp);
      setTodaySessions(list);
      setLoading(false);
    };

    const unsubConsult = onSnapshot(consultQ, processSnapshot, (err) => {
      console.warn("consultations listener error:", err);
      setLoading(false);
    });

    const unsubReader = onSnapshot(readerQ, processSnapshot, () => {});
    const unsubSessions = onSnapshot(sessionsQ, processSnapshot, () => {});

    return () => {
      unsubConsult();
      unsubReader();
      unsubSessions();
    };
  }, [user]);

  const handleAddMeetLink = async (sessionId, consultationId) => {
    const link = window.prompt("Enter Google Meet Link (e.g., https://meet.google.com/abc-defg-hij):");
    if (!link || !link.trim()) return;

    const formattedLink = link.trim().startsWith("http") ? link.trim() : `https://${link.trim()}`;

    try {
      const targets = [sessionId, consultationId].filter(Boolean);
      for (const targetId of targets) {
        try {
          await updateDoc(doc(db, "consultations", targetId), { meetLink: formattedLink });
        } catch {
          // Ignore
        }
        try {
          await updateDoc(doc(db, "sessions", targetId), { meetLink: formattedLink });
        } catch {
          // Ignore
        }
      }
    } catch (err) {
      console.error("Error setting meet link:", err);
      alert("Could not update Meet link. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="h-28 bg-void/50 border border-line rounded-card animate-pulse flex items-center justify-center text-inkMuted text-xs">
        Loading today's schedule...
      </div>
    );
  }

  // Case 1: No sessions scheduled for today
  if (todaySessions.length === 0) {
    return (
      <Card className="border border-line/80 bg-gradient-to-r from-void via-surface to-void p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-ink flex items-center gap-2">
                  <Calendar size={18} className="text-gold" />
                  <span>Your Sessions Today</span>
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/30 font-medium">
                  0 Sessions
                </span>
              </div>
              <p className="text-sm text-inkMuted mt-0.5 font-medium">
                No sessions scheduled for today. You are free!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link to={sessionsUrl}>
              <Button variant="secondary" className="text-xs py-2 px-3.5 flex items-center gap-1.5">
                <span>View Sessions Log</span>
                <ChevronRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  // Case 2: One or more sessions scheduled for today
  return (
    <Card className="border border-gold/40 bg-gradient-to-br from-gold/10 via-void to-surface p-5 shadow-md flex flex-col gap-4">
      {/* Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gold/20 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/50 flex items-center justify-center text-gold shrink-0">
            <Calendar size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-ink font-display flex items-center gap-2">
                <span>Your Sessions Today</span>
              </h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/40 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                {todaySessions.length} {todaySessions.length === 1 ? "Session Scheduled" : "Sessions Scheduled"}
              </span>
            </div>
            <p className="text-xs text-inkMuted mt-0.5">
              Confirmed consultations scheduled for today ({new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}).
            </p>
          </div>
        </div>

        <Link to={sessionsUrl} className="shrink-0 self-start sm:self-auto">
          <Button variant="ghost" className="text-xs py-1.5 px-3 text-gold hover:text-gold hover:bg-gold/10 flex items-center gap-1">
            <span>View Sessions Log</span>
            <ChevronRight size={14} />
          </Button>
        </Link>
      </div>

      {/* Grid of Today's Confirmed Session Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {todaySessions.map((session) => {
          const clientName = session.userName || session.clientName || session.userEmail || "Consultation Client";
          const focusTopic = session.category || session.topic || session.focusTopic || "Spiritual Consultation";
          const formattedTime = formatSessionTime(session.timestamp);
          const meetLink = session.meetLink || session.meetingLink || session.googleMeetLink;

          return (
            <div
              key={session.id}
              className="p-3.5 rounded-card bg-void/80 border border-gold/30 hover:border-gold/60 transition-all flex flex-col justify-between gap-3 shadow-sm"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-xs text-inkMuted uppercase tracking-wider block font-medium">Client</span>
                    <h3 className="text-sm font-semibold text-ink truncate">{clientName}</h3>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/40 font-semibold shrink-0 flex items-center gap-1">
                    <Clock size={11} />
                    {formattedTime}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-inkMuted bg-surface/60 px-2.5 py-1 rounded border border-line">
                  <Sparkles size={12} className="text-gold shrink-0" />
                  <span className="truncate">{focusTopic}</span>
                </div>
              </div>

              {/* Action buttons (Meet Link & Chat) */}
              <div className="pt-2 border-t border-line/60 flex items-center gap-2">
                {meetLink ? (
                  <a
                    href={meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button
                      variant="primary"
                      className="w-full py-1.5 text-xs flex items-center justify-center gap-1.5 shadow-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0"
                    >
                      <Video size={14} className="shrink-0" />
                      <span className="font-semibold">Join Google Meet</span>
                      <ExternalLink size={12} className="opacity-80 shrink-0" />
                    </Button>
                  </a>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => handleAddMeetLink(session.id, session.consultationId)}
                    className="flex-1 py-1.5 text-xs flex items-center justify-center gap-1 text-gold border-gold/40 hover:bg-gold/10"
                  >
                    <Plus size={13} />
                    <span>Set Meet Link</span>
                  </Button>
                )}

                {openChat && (
                  <Button
                    variant="ghost"
                    onClick={() => openChat(session)}
                    className="py-1.5 px-2.5 text-xs text-inkMuted hover:text-gold hover:bg-gold/10 border border-line"
                    title="Open chat with client"
                  >
                    <MessageSquare size={14} />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
