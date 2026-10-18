import { useState, useEffect, useRef } from "react";
import { Bell, X, Video, AlertCircle, Radio, Clock, Calendar, Check, ExternalLink } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  writeBatch,
  updateDoc,
  where,
  getDocs
} from "firebase/firestore";
import Button from "./Button";

function formatRelativeTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function NotificationBell({ count, maxCount, className = "" }) {
  const { user, role } = useAuth();
  const isAdmin = role === "Administrator" || role === "admin" || user?.role === "Administrator" || user?.role === "admin";
  if (isAdmin) return null;

  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const dropdownRef = useRef(null);

  // 1. Real-Time Listener for Notifications
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "notifications"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setNotifications(notifs);
    });
    return () => unsubscribe();
  }, [user]);

  // 2. Time-Sensitive Session Countdown Reminders Engine
  useEffect(() => {
    if (!user) return;
    const checkReminders = async () => {
      try {
        const q = query(
          collection(db, "sessions"), 
          where("userId", "==", user.uid), 
          where("status", "==", "accepted")
        );
        const snapshot = await getDocs(q);
        
        const now = new Date().getTime();
        
        for (const sessionDoc of snapshot.docs) {
          const session = sessionDoc.data();
          if (!session.scheduledFor) continue;
          
          const scheduledTime = new Date(session.scheduledFor).getTime();
          const timeDiff = scheduledTime - now;
          const hoursLeft = timeDiff / (1000 * 60 * 60);
          
          const batch = writeBatch(db);
          let needsUpdate = false;
          
          // 24-Hour Reminder (triggers if within 25 hours and hasn't been sent)
          if (hoursLeft <= 25 && hoursLeft > 2 && !session.reminder24hSent) {
            const notifRef = doc(collection(db, "users", user.uid, "notifications"));
            batch.set(notifRef, {
              title: "Session Reminder",
              message: "Your spiritual guidance session is in 24 hours.",
              read: false,
              createdAt: new Date().toISOString()
            });
            batch.update(sessionDoc.ref, { reminder24hSent: true });
            needsUpdate = true;
          }
          
          // Final Countdown Reminder (triggers if within 3 hours and hasn't been sent)
          if (hoursLeft <= 3 && hoursLeft > 0 && !session.reminderFinalSent) {
            const notifRef = doc(collection(db, "users", user.uid, "notifications"));
            batch.set(notifRef, {
              title: "Session Starting Soon!",
              message: "Your live session starts in a few hours! Click here to join your consultant.",
              meetingLink: session.meetLink || "",
              read: false,
              createdAt: new Date().toISOString()
            });
            batch.update(sessionDoc.ref, { reminderFinalSent: true });
            needsUpdate = true;
          }
          
          if (needsUpdate) {
            await batch.commit();
          }
        }
      } catch (e) {
        console.error("Reminder engine check failed", e);
      }
    };
    
    checkReminders();
    const interval = setInterval(checkReminders, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, [user]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard Escape listener to dismiss modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setSelectedNotification(null);
      }
    }
    if (selectedNotification) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [selectedNotification]);

  // Mark single notification as read on click and open detail modal
  const handleNotificationClick = async (notif) => {
    setSelectedNotification(notif);
    setIsOpen(false); // Close dropdown to focus on detail modal

    if (!notif.read && user?.uid) {
      try {
        await updateDoc(doc(db, "users", user.uid, "notifications", notif.id), {
          read: true
        });
        // Optimistic local update
        setNotifications((prev) =>
          prev.map((item) => (item.id === notif.id ? { ...item, read: true } : item))
        );
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }
  };

  // Optional: Mark all as read
  const markAllAsRead = async () => {
    if (!user) return;
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    const batch = writeBatch(db);
    unread.forEach((n) => {
      batch.update(doc(db, "users", user.uid, "notifications", n.id), { read: true });
    });
    try {
      await batch.commit();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch (e) {
      console.error("Failed to mark notifications as read", e);
    }
  };

  const notifUnread = notifications.filter((n) => !n.read).length;
  const extraCount = count !== undefined
    ? (typeof count === "number" ? count : (parseInt(count, 10) || 0))
    : 0;
  const unreadCount = extraCount + notifUnread;
  const hasBadge = unreadCount > 0;

  const cap = maxCount !== undefined ? maxCount : 9;
  const displayCount = unreadCount > cap ? `${cap}+` : unreadCount;

  return (
    <>
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-inkMuted hover:text-ink transition-colors rounded-full hover:bg-void bell-container flex items-center justify-center"
          aria-label="Notifications"
          title="Notifications"
        >
          <div className="relative inline-flex items-center justify-center">
            <Bell size={24} />
            {/* Dynamic red badge element positioned absolutely at the top-right corner of the bell icon */}
            {hasBadge && (
              <span
                id="notification-badge"
                data-testid="notification-badge"
                className="notification-badge absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 bg-[#ff0000] text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-surface shadow-sm leading-none z-10 pointer-events-none"
                style={{ backgroundColor: "#ff0000", color: "#ffffff", fontWeight: "bold" }}
              >
                {displayCount}
              </span>
            )}
          </div>
        </button>

        {/* 1. Notification List View (Compact Title-Only Display) */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-line rounded-card shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="p-3.5 border-b border-line bg-void/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-ink">Notifications</h3>
                {notifUnread > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 font-semibold border border-red-500/30">
                    {notifUnread} unread
                  </span>
                )}
              </div>

              {notifUnread > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-gold hover:underline transition-colors font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
            
            <div className="max-h-96 overflow-y-auto divide-y divide-line/30">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-inkMuted flex flex-col items-center gap-2">
                  <Bell size={24} className="opacity-30" />
                  <span>No notifications yet.</span>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full text-left p-3.5 transition-colors flex items-center justify-between gap-3 group ${
                      !n.read
                        ? "bg-gold/5 hover:bg-gold/10"
                        : "hover:bg-void/50 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Unread Status Dot Indicator */}
                      {!n.read ? (
                        <span
                          className="w-2 h-2 rounded-full bg-[#ff0000] shrink-0 shadow-sm"
                          title="Unread"
                        />
                      ) : (
                        <span
                          className="w-2 h-2 rounded-full bg-line/60 shrink-0"
                          title="Read"
                        />
                      )}

                      {/* Title & Priority Tag (No body/paragraph) */}
                      <div className="flex items-center gap-1.5 min-w-0 flex-1 flex-wrap">
                        <span
                          className={`text-xs truncate ${
                            !n.read
                              ? "font-semibold text-gold"
                              : "font-normal text-ink"
                          }`}
                        >
                          {n.title || "Notification"}
                        </span>

                        {n.priority === "Urgent" && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 uppercase font-bold shrink-0">
                            Urgent
                          </span>
                        )}

                        {n.type === "announcement" && n.priority !== "Urgent" && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-gold/15 text-gold border border-gold/30 uppercase font-medium shrink-0">
                            Announcement
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <span className="text-[10px] text-inkMuted shrink-0">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Click-to-View Detail Pop-up Modal */}
      {selectedNotification && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="relative w-full max-w-lg bg-surface border border-line rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-line bg-void/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center shrink-0 border border-gold/30">
                  <Bell size={16} className="text-gold" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-ink truncate">
                      {selectedNotification.title || "Notification Details"}
                    </h3>
                    {selectedNotification.priority === "Urgent" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 uppercase font-bold">
                        Urgent
                      </span>
                    )}
                    {selectedNotification.type === "announcement" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30 uppercase font-medium">
                        Announcement
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedNotification(null)}
                className="p-1.5 text-inkMuted hover:text-ink rounded-lg hover:bg-void transition-colors"
                title="Dismiss details"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              {/* Full Descriptive Body */}
              <div className="bg-void/40 p-4 rounded-xl border border-line/60">
                <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                  {selectedNotification.message || "No detailed message provided."}
                </p>
              </div>

              {/* Contextual Metadata & Timestamps */}
              <div className="flex flex-col gap-1.5 text-xs text-inkMuted border-t border-line/40 pt-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-gold" /> Received At
                  </span>
                  <span className="text-ink font-medium">
                    {selectedNotification.createdAt
                      ? new Date(selectedNotification.createdAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short"
                        })
                      : "Recently"}
                  </span>
                </div>

                {selectedNotification.targetScope && (
                  <div className="flex items-center justify-between">
                    <span>Audience Scope</span>
                    <span className="text-ink font-medium">
                      {selectedNotification.targetScope}
                    </span>
                  </div>
                )}
              </div>

              {/* Direct Action Link (e.g. Join Google Meet for Session) */}
              {selectedNotification.meetingLink && (
                <div className="pt-2">
                  <a
                    href={selectedNotification.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-violet hover:bg-violetHover text-white rounded-lg transition-colors text-sm font-medium shadow-md"
                  >
                    <Video size={16} /> Join Google Meet Session
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-3.5 border-t border-line bg-void/50 flex justify-end">
              <Button
                variant="secondary"
                onClick={() => setSelectedNotification(null)}
                className="text-xs px-4 py-2"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
