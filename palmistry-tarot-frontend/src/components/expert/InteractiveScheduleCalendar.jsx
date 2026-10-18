import { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight,
  Plus, Trash2, Video, CheckCircle, AlertTriangle, ShieldAlert,
  Sparkles, X, User, ExternalLink
} from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import {
  collection, query, where, onSnapshot, addDoc, deleteDoc,
  doc, updateDoc, setDoc
} from "firebase/firestore";
import { db } from "../../firebase";
import RescheduleModal from "./RescheduleModal";
import {
  getLocalDateStr,
  formatSessionTime,
  getSessionTimestamp,
  checkScheduleConflict
} from "../../utils/scheduleConflict";

const COMMON_BLOCK_REASONS = [
  "Personal Time Off",
  "Lunch / Break",
  "Meditation & Energy Prep",
  "Out of Office / Travel",
  "Emergency / Unavailable"
];

export default function InteractiveScheduleCalendar({
  pendingSessions = [],
  onAcceptSession,
  onDeclineSession,
  onRescheduleSession
}) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("week"); // 'week' | 'day'
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Block Modal State
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockForm, setBlockForm] = useState({
    date: getLocalDateStr(new Date()),
    startTime: "13:00",
    endTime: "14:00",
    title: "Personal Time Off"
  });
  const [savingBlock, setSavingBlock] = useState(false);

  // Internal Reschedule Modal State
  const [internalRescheduleSession, setInternalRescheduleSession] = useState(null);

  // Calculate start of current week (Monday)
  const currentWeekDays = useMemo(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    // Adjust to Monday as first day (0 is Sunday, so if 0, diff is -6)
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      weekDays.push(nextDay);
    }
    return weekDays;
  }, [selectedDate]);

  // Real-time synchronization for expert's sessions and blocked slots
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const consultQ = query(
      collection(db, "consultations"),
      where("expertId", "==", user.uid)
    );

    const readerQ = query(
      collection(db, "consultations"),
      where("readerId", "==", user.uid)
    );

    const sessionsReaderQ = query(
      collection(db, "sessions"),
      where("readerId", "==", user.uid)
    );

    const sessionsExpertQ = query(
      collection(db, "sessions"),
      where("expertId", "==", user.uid)
    );

    const activeMap = new Map();

    const handleSnapshot = (snap) => {
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;
        const timestamp = getSessionTimestamp(data);
        activeMap.set(id, { id, ...data, timestamp });
      });
      setAllEvents(Array.from(activeMap.values()));
      setLoading(false);
    };

    const unsubConsult = onSnapshot(consultQ, handleSnapshot, () => setLoading(false));
    const unsubReader = onSnapshot(readerQ, handleSnapshot, () => {});
    const unsubSessionsReader = onSnapshot(sessionsReaderQ, handleSnapshot, () => {});
    const unsubSessionsExpert = onSnapshot(sessionsExpertQ, handleSnapshot, () => {});

    return () => {
      unsubConsult();
      unsubReader();
      unsubSessionsReader();
      unsubSessionsExpert();
    };
  }, [user]);

  // Separate confirmed sessions and blocked slots
  const confirmedSessions = useMemo(() => {
    return allEvents.filter((ev) => {
      const status = (ev.status || "").toLowerCase();
      const type = (ev.type || "").toLowerCase();
      return (status === "accepted" || status === "active") && type !== "blocked";
    });
  }, [allEvents]);

  const blockedSlots = useMemo(() => {
    return allEvents.filter((ev) => {
      const status = (ev.status || "").toLowerCase();
      const type = (ev.type || "").toLowerCase();
      return type === "blocked" || status === "blocked";
    });
  }, [allEvents]);

  // Automatically determine pending sessions from props or real-time events
  const effectivePendingSessions = useMemo(() => {
    if (pendingSessions && pendingSessions.length > 0) return pendingSessions;
    return allEvents.filter((ev) => {
      const status = (ev.status || "").toLowerCase();
      const type = (ev.type || "").toLowerCase();
      return status === "pending" && type !== "blocked";
    });
  }, [pendingSessions, allEvents]);

  // Week navigation handlers
  const handlePrevWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 7);
    setSelectedDate(d);
  };

  const handleNextWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 7);
    setSelectedDate(d);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Open Block Modal for specific date
  const handleOpenBlockForDate = (dateObj) => {
    setBlockForm((prev) => ({
      ...prev,
      date: getLocalDateStr(dateObj)
    }));
    setIsBlockModalOpen(true);
  };

  // Save new personal blocked availability slot
  const handleSaveBlock = async (e) => {
    if (e) e.preventDefault();
    if (!blockForm.date || !blockForm.startTime || !blockForm.endTime) {
      alert("Please specify date, start time, and end time.");
      return;
    }
    if (blockForm.startTime >= blockForm.endTime) {
      alert("End time must be after start time.");
      return;
    }

    setSavingBlock(true);
    try {
      const scheduledIso = `${blockForm.date}T${blockForm.startTime}:00`;
      await addDoc(collection(db, "consultations"), {
        expertId: user.uid,
        readerId: user.uid,
        type: "blocked",
        status: "blocked",
        title: blockForm.title.trim() || "Personal Time Off",
        date: blockForm.date,
        startTime: blockForm.startTime,
        endTime: blockForm.endTime,
        scheduledFor: scheduledIso,
        scheduledTime: scheduledIso,
        createdAt: new Date().toISOString()
      });

      setIsBlockModalOpen(false);
      setBlockForm({
        date: getLocalDateStr(new Date()),
        startTime: "13:00",
        endTime: "14:00",
        title: "Personal Time Off"
      });
    } catch (err) {
      console.error("Error creating block slot:", err);
      alert("Failed to block slot: " + err.message);
    } finally {
      setSavingBlock(false);
    }
  };

  // Delete/Unblock a personal slot
  const handleUnblock = async (blockId) => {
    if (!window.confirm("Unblock this time slot and make it available for client bookings?")) return;
    try {
      await deleteDoc(doc(db, "consultations", blockId));
    } catch (err) {
      console.error("Error unblocking slot:", err);
      alert("Failed to unblock slot.");
    }
  };

  // Accept session action
  const handleTriggerAccept = async (id, userId) => {
    if (onAcceptSession) {
      onAcceptSession(id, userId);
      return;
    }
    const meetLink = window.prompt("Enter Google Meet Link for this session (e.g., https://meet.google.com/xyz-abcd-efg):");
    if (!meetLink) return;
    const formattedLink = meetLink.trim().startsWith("http") ? meetLink.trim() : `https://${meetLink.trim()}`;
    try {
      const target = allEvents.find((x) => x.id === id);
      await updateDoc(doc(db, "sessions", id), { status: "accepted", meetLink: formattedLink }).catch(() => {});
      const cId = target?.consultationId || id;
      await setDoc(doc(db, "consultations", cId), { status: "accepted", meetLink: formattedLink }, { merge: true }).catch(() => {});
      const targetUser = userId || target?.userId;
      if (targetUser) {
        await addDoc(collection(db, "users", targetUser, "notifications"), {
          title: "Session Booking Accepted!",
          message: "Your expert has accepted your live session request. Google Meet link is attached.",
          meetingLink: formattedLink,
          sessionId: id,
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Accept error:", err);
      alert("Error accepting session.");
    }
  };

  // Decline session action
  const handleTriggerDecline = async (id) => {
    if (onDeclineSession) {
      onDeclineSession(id);
      return;
    }
    if (!window.confirm("Are you sure you want to decline this session request?")) return;
    try {
      const target = allEvents.find((x) => x.id === id);
      await updateDoc(doc(db, "sessions", id), { status: "declined" }).catch(() => {});
      const cId = target?.consultationId || id;
      await setDoc(doc(db, "consultations", cId), { status: "declined" }, { merge: true }).catch(() => {});
      if (target?.userId) {
        await addDoc(collection(db, "users", target.userId, "notifications"), {
          title: "Session Request Declined",
          message: "Your expert was unable to accept this booking slot. Please choose another time.",
          sessionId: id,
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    } catch {
      alert("Error declining session.");
    }
  };

  // Reschedule session action
  const handleTriggerReschedule = (s) => {
    if (onRescheduleSession) {
      onRescheduleSession(s);
      return;
    }
    setInternalRescheduleSession(s);
  };

  const todayStr = getLocalDateStr(new Date());

  return (
    <Card className="flex flex-col gap-5 border border-line shadow-sm">
      {/* Calendar Top Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon size={20} className="text-gold" />
            <h2 className="text-lg font-semibold text-ink font-display">
              Interactive Schedule &amp; Availability
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full border border-gold/40 text-gold bg-gold/10 font-medium">
              Live Agenda
            </span>
          </div>
          <p className="text-xs text-inkMuted mt-0.5">
            Confirmed sessions and working hours. Block off personal time to prevent incoming booking conflicts.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Week / Day View Mode Toggle */}
          <div className="bg-void border border-line rounded-card p-0.5 flex items-center text-xs">
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === "week" ? "bg-gold/15 text-gold font-semibold" : "text-inkMuted hover:text-ink"
              }`}
            >
              Weekly Grid
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === "day" ? "bg-gold/15 text-gold font-semibold" : "text-inkMuted hover:text-ink"
              }`}
            >
              Day Detail
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1 bg-void border border-line rounded-card p-1">
            <button
              onClick={handlePrevWeek}
              className="p-1 hover:text-gold text-inkMuted rounded hover:bg-surface transition-colors"
              title="Previous Week"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-0.5 text-xs text-ink hover:text-gold font-medium rounded hover:bg-surface transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNextWeek}
              className="p-1 hover:text-gold text-inkMuted rounded hover:bg-surface transition-colors"
              title="Next Week"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Block Personal Time Button */}
          <Button
            variant="primary"
            onClick={() => setIsBlockModalOpen(true)}
            className="text-xs py-1.5 px-3 flex items-center gap-1.5 whitespace-nowrap shadow-sm"
          >
            <Plus size={14} />
            <span>Block Availability</span>
          </Button>
        </div>
      </div>

      {/* Week Date Range Title Banner */}
      <div className="flex items-center justify-between text-xs text-inkMuted bg-void/60 px-3.5 py-2 rounded-card border border-line/60">
        <span className="font-medium text-ink flex items-center gap-2">
          <Clock size={13} className="text-gold" />
          <span>
            {currentWeekDays[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} —{" "}
            {currentWeekDays[6].toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </span>
        <div className="flex items-center gap-4 text-[11px] flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-gold/20 border border-gold" />
            Confirmed Session
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500/20 border border-red-500/60" />
            Personal Blocked Time
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/20 border border-amber-500/60" />
            Pending Request
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: WEEKLY 7-DAY GRID */}
      {/* ========================================================================= */}
      {viewMode === "week" && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {currentWeekDays.map((dayObj) => {
            const dateStr = getLocalDateStr(dayObj);
            const isToday = dateStr === todayStr;

            // Filter confirmed sessions on this date
            const daySessions = confirmedSessions.filter((s) => {
              const sDate = getLocalDateStr(getSessionTimestamp(s));
              return sDate === dateStr;
            });

            // Filter blocked slots on this date
            const dayBlocks = blockedSlots.filter((b) => {
              const bDate = b.date || getLocalDateStr(getSessionTimestamp(b));
              return bDate === dateStr;
            });

            // Filter pending incoming requests on this date
            const dayPending = effectivePendingSessions.filter((p) => {
              const pDate = getLocalDateStr(getSessionTimestamp(p));
              return pDate === dateStr;
            });

            return (
              <div
                key={dateStr}
                className={`flex flex-col rounded-card border transition-all min-h-[220px] ${
                  isToday
                    ? "border-gold/60 bg-gold/5 shadow-sm ring-1 ring-gold/20"
                    : "border-line bg-void/40 hover:border-line/80"
                }`}
              >
                {/* Day Header */}
                <div
                  className={`px-3 py-2 border-b flex items-center justify-between text-xs font-medium ${
                    isToday ? "border-gold/30 bg-gold/10 text-gold" : "border-line/60 text-inkMuted"
                  }`}
                >
                  <div>
                    <span className="block font-semibold">
                      {dayObj.toLocaleDateString(undefined, { weekday: "short" })}
                    </span>
                    <span className={`text-[11px] ${isToday ? "font-bold text-gold" : "text-ink"}`}>
                      {dayObj.toLocaleDateString(undefined, { month: "numeric", day: "numeric" })}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenBlockForDate(dayObj)}
                    className="p-1 rounded hover:bg-gold/20 text-inkMuted hover:text-gold transition-colors"
                    title={`Block time on ${dateStr}`}
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Day Content Area */}
                <div className="p-2 flex-1 flex flex-col gap-2 overflow-y-auto max-h-[300px]">
                  {/* Confirmed Sessions */}
                  {daySessions.map((s) => {
                    const client = s.userName || s.clientName || s.userEmail || "Client";
                    const time = formatSessionTime(s.timestamp);
                    const meet = s.meetLink || s.meetingLink || s.googleMeetLink;

                    return (
                      <div
                        key={s.id}
                        className="p-2 rounded-card bg-gold/10 border border-gold/40 flex flex-col gap-1 text-xs shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gold truncate flex items-center gap-1">
                            <Clock size={11} /> {time}
                          </span>
                          {meet && (
                            <a
                              href={meet}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gold hover:text-white transition-colors"
                              title="Join Google Meet"
                            >
                              <Video size={12} />
                            </a>
                          )}
                        </div>
                        <span className="font-medium text-ink truncate">{client}</span>
                        <span className="text-[10px] text-inkMuted truncate">{s.category || s.topic || "Session"}</span>
                      </div>
                    );
                  })}

                  {/* Blocked Availability Slots */}
                  {dayBlocks.map((b) => {
                    const bStart = b.startTime ? formatSessionTime(`${b.date}T${b.startTime}:00`) : "Blocked";
                    const bEnd = b.endTime ? formatSessionTime(`${b.date}T${b.endTime}:00`) : "";

                    return (
                      <div
                        key={b.id}
                        className="p-2 rounded-card bg-red-500/10 border border-red-500/30 flex flex-col gap-1 text-xs text-red-300 shadow-xs relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[11px] flex items-center gap-1 text-red-400">
                            <ShieldAlert size={11} />
                            {bStart} {bEnd && `– ${bEnd}`}
                          </span>
                          <button
                            onClick={() => handleUnblock(b.id)}
                            className="text-red-400 hover:text-red-200 transition-colors opacity-80 hover:opacity-100"
                            title="Unblock this slot"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <span className="text-[10px] text-red-200/80 truncate">
                          {b.title || "Personal Blocked Time"}
                        </span>
                      </div>
                    );
                  })}

                  {/* Pending Incoming Requests */}
                  {dayPending.map((p) => {
                    const conflict = checkScheduleConflict(p, confirmedSessions, blockedSlots);
                    const pTime = formatSessionTime(p.timestamp);

                    return (
                      <div
                        key={p.id}
                        className={`p-2 rounded-card border flex flex-col gap-1 text-xs shadow-xs ${
                          conflict.hasConflict
                            ? "bg-red-500/15 border-red-500/50 text-red-300"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[11px] flex items-center gap-1">
                            <Clock size={11} /> {pTime}
                          </span>
                          <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-amber-500/20 text-amber-400">
                            Pending
                          </span>
                        </div>
                        <span className="font-medium truncate text-ink">
                          {p.userName || p.clientName || "New Request"}
                        </span>
                        {conflict.hasConflict && (
                          <div className="text-[10px] text-red-400 flex items-center gap-1 font-semibold mt-0.5">
                            <AlertTriangle size={11} className="shrink-0" />
                            <span>Conflict!</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Empty state for the day */}
                  {daySessions.length === 0 && dayBlocks.length === 0 && dayPending.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-3 text-inkMuted/60 text-[11px]">
                      <span>Open for bookings</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: DAY DETAIL AGENDA */}
      {/* ========================================================================= */}
      {viewMode === "day" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-void p-3 rounded-card border border-line">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-ink">
                Selected Day Agenda: {selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </span>
              {getLocalDateStr(selectedDate) === todayStr && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/40 font-medium">
                  Today
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={getLocalDateStr(selectedDate)}
                onChange={(e) => {
                  if (e.target.value) setSelectedDate(new Date(`${e.target.value}T12:00:00`));
                }}
                className="bg-surface border border-line rounded px-2.5 py-1 text-xs text-ink outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* Agenda items for selectedDate */}
          {(() => {
            const dateStr = getLocalDateStr(selectedDate);
            const daySessions = confirmedSessions.filter((s) => getLocalDateStr(getSessionTimestamp(s)) === dateStr);
            const dayBlocks = blockedSlots.filter((b) => (b.date || getLocalDateStr(getSessionTimestamp(b))) === dateStr);
            const dayPending = effectivePendingSessions.filter((p) => getLocalDateStr(getSessionTimestamp(p)) === dateStr);

            const allDayItems = [
              ...daySessions.map((s) => ({ ...s, itemType: "session" })),
              ...dayBlocks.map((b) => ({ ...b, itemType: "block" })),
              ...dayPending.map((p) => ({ ...p, itemType: "pending" }))
            ].sort((a, b) => (getSessionTimestamp(a) || 0) - (getSessionTimestamp(b) || 0));

            if (allDayItems.length === 0) {
              return (
                <div className="text-center py-12 border border-dashed border-line rounded-card">
                  <CheckCircle size={32} className="mx-auto text-green-400 mb-2 opacity-80" />
                  <h3 className="text-sm font-semibold text-ink">No scheduled sessions or blocks on this date</h3>
                  <p className="text-xs text-inkMuted mt-1">
                    Your calendar is completely open. Click "Block Availability" above if you need personal time off.
                  </p>
                </div>
              );
            }

            return (
              <div className="flex flex-col gap-2.5">
                {allDayItems.map((item) => {
                  if (item.itemType === "session") {
                    const time = formatSessionTime(item.timestamp);
                    const meet = item.meetLink || item.meetingLink;
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-card bg-void border border-gold/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gold/20 text-gold flex items-center justify-center shrink-0">
                            <User size={18} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-ink">
                                {item.userName || item.clientName || "Client"}
                              </h4>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30">
                                {item.category || item.topic || "Confirmed Session"}
                              </span>
                            </div>
                            <p className="text-xs text-inkMuted mt-0.5 flex items-center gap-1.5">
                              <Clock size={12} className="text-gold" />
                              <span>{time}</span>
                              {item.duration && <span>• {item.duration} mins</span>}
                            </p>
                          </div>
                        </div>

                        {meet && (
                          <a href={meet} target="_blank" rel="noopener noreferrer">
                            <Button variant="primary" className="text-xs py-1.5 px-3 flex items-center gap-1.5">
                              <Video size={13} />
                              <span>Join Google Meet</span>
                              <ExternalLink size={12} />
                            </Button>
                          </a>
                        )}
                      </div>
                    );
                  }

                  if (item.itemType === "block") {
                    const bStart = item.startTime ? formatSessionTime(`${item.date}T${item.startTime}:00`) : "Blocked";
                    const bEnd = item.endTime ? formatSessionTime(`${item.date}T${item.endTime}:00`) : "";
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-card bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                            <ShieldAlert size={18} />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-red-300">
                              {item.title || "Personal Time Off"}
                            </h4>
                            <p className="text-xs text-red-400/80 mt-0.5 flex items-center gap-1.5">
                              <Clock size={12} />
                              <span>{bStart} {bEnd && `– ${bEnd}`}</span>
                              <span>• Blocked from Client Bookings</span>
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="secondary"
                          onClick={() => handleUnblock(item.id)}
                          className="text-xs py-1 px-2.5 text-red-400 border-red-500/40 hover:bg-red-500/20 flex items-center gap-1"
                        >
                          <Trash2 size={13} />
                          <span>Unblock</span>
                        </Button>
                      </div>
                    );
                  }

                  if (item.itemType === "pending") {
                    const conflict = checkScheduleConflict(item, confirmedSessions, blockedSlots);
                    const pTime = formatSessionTime(item.timestamp);
                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-card border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          conflict.hasConflict
                            ? "bg-red-500/10 border-red-500/50"
                            : "bg-amber-500/10 border-amber-500/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            conflict.hasConflict ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                          }`}>
                            {conflict.hasConflict ? <AlertTriangle size={18} /> : <Clock size={18} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-ink">
                                {item.userName || item.clientName || "Client Booking Request"}
                              </h4>
                              {conflict.hasConflict ? (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 font-bold flex items-center gap-1">
                                  <AlertTriangle size={10} /> Scheduling Conflict
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                  Pending Review
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-inkMuted mt-0.5">
                              Requested for {pTime} ({item.category || "Consultation"})
                            </p>
                            {conflict.hasConflict && (
                              <p className="text-xs text-red-400 mt-1 font-medium">
                                ⚠️ {conflict.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => handleTriggerDecline(item.id)}
                            className="text-xs py-1 px-2.5"
                          >
                            Decline
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => handleTriggerReschedule(item)}
                            className="text-xs py-1 px-2.5 text-gold border-gold/40"
                          >
                            Reschedule
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => handleTriggerAccept(item.id, item.userId)}
                            className="text-xs py-1 px-2.5"
                          >
                            Accept
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BLOCK PERSONAL AVAILABILITY TIME */}
      {/* ========================================================================= */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-surface border border-line rounded-card shadow-2xl p-5 flex flex-col gap-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-gold" />
                <h3 className="text-base font-semibold text-ink font-display">Block Availability Slot</h3>
              </div>
              <button
                onClick={() => setIsBlockModalOpen(false)}
                className="text-inkMuted hover:text-ink transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBlock} className="flex flex-col gap-3.5">
              {/* Date Picker */}
              <div>
                <label className="text-xs text-inkMuted uppercase tracking-wider block mb-1 font-semibold">
                  Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={blockForm.date}
                  onChange={(e) => setBlockForm((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-void border border-line rounded px-3 py-2 text-sm text-ink outline-none focus:border-gold"
                />
              </div>

              {/* Start & End Time Pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-inkMuted uppercase tracking-wider block mb-1 font-semibold">
                    Start Time <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={blockForm.startTime}
                    onChange={(e) => setBlockForm((prev) => ({ ...prev, startTime: e.target.value }))}
                    className="w-full bg-void border border-line rounded px-3 py-2 text-sm text-ink outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="text-xs text-inkMuted uppercase tracking-wider block mb-1 font-semibold">
                    End Time <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={blockForm.endTime}
                    onChange={(e) => setBlockForm((prev) => ({ ...prev, endTime: e.target.value }))}
                    className="w-full bg-void border border-line rounded px-3 py-2 text-sm text-ink outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Reason / Title */}
              <div>
                <label className="text-xs text-inkMuted uppercase tracking-wider block mb-1 font-semibold">
                  Reason / Label
                </label>
                <input
                  type="text"
                  value={blockForm.title}
                  onChange={(e) => setBlockForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Personal Break, Out of Office"
                  className="w-full bg-void border border-line rounded px-3 py-2 text-sm text-ink outline-none focus:border-gold"
                />

                {/* Quick chip suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {COMMON_BLOCK_REASONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setBlockForm((prev) => ({ ...prev, title: r }))}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                        blockForm.title === r
                          ? "bg-gold/20 text-gold border-gold/40"
                          : "border-line text-inkMuted hover:border-gold/30 hover:text-ink"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-line flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="text-xs py-1.5 px-3"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={savingBlock}
                  className="text-xs py-1.5 px-4 shadow-sm"
                >
                  {savingBlock ? "Saving..." : "Save Blocked Time"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Internal Reschedule Modal */}
      <RescheduleModal
        session={internalRescheduleSession}
        isOpen={Boolean(internalRescheduleSession)}
        onClose={() => setInternalRescheduleSession(null)}
        expertName={user?.name || "Your Expert"}
      />
    </Card>
  );
}
