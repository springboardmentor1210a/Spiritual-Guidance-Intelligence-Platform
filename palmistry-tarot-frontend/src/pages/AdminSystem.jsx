import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import FullSystemStatusPanel from "../components/admin/FullSystemStatusPanel";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  writeBatch,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { Megaphone, Send, AlertTriangle, CheckCircle2, Radio, Bell, Users, Clock, ShieldAlert } from "lucide-react";

export default function AdminSystem() {
  const { user, token } = useAuth();

  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetScope, setTargetScope] = useState("All Roles");
  const [priority, setPriority] = useState("Normal");
  const [submitting, setSubmitting] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState(null);

  // Past Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  // 1. Subscribe to system_announcements in real-time
  useEffect(() => {
    const q = query(
      collection(db, "system_announcements"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        setAnnouncements(list);
        setLoadingAnnouncements(false);
      },
      (err) => {
        console.error("Failed to load announcements:", err);
        setLoadingAnnouncements(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Handle Announcement Broadcast Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSubmitting(true);
    setStatusFeedback(null);

    try {
      // Step A: Fetch all registered users from Firestore
      const usersSnapshot = await getDocs(collection(db, "users"));
      const targetUsers = [];

      usersSnapshot.forEach((docSnap) => {
        const userData = docSnap.data();
        const role = (userData.role || "").toLowerCase();
        const isExpert =
          role.includes("reader") ||
          role.includes("consultant") ||
          role === "tarot reader" ||
          role === "spiritual consultant";
        const isClient =
          role === "user" ||
          role === "client" ||
          role === "" ||
          role === undefined;

        if (targetScope === "All Roles") {
          targetUsers.push({ id: docSnap.id, ...userData });
        } else if (targetScope === "Clients Only" && isClient) {
          targetUsers.push({ id: docSnap.id, ...userData });
        } else if (targetScope === "Experts Only" && isExpert) {
          targetUsers.push({ id: docSnap.id, ...userData });
        }
      });

      const createdAt = new Date().toISOString();

      // Step B: Write to global Firestore collection `system_announcements`
      const announcementRef = await addDoc(collection(db, "system_announcements"), {
        title: title.trim(),
        message: message.trim(),
        targetScope,
        priority,
        createdBy: user?.uid || "admin",
        createdByName: user?.name || user?.displayName || user?.email || "Administrator",
        createdAt,
        recipientCount: targetUsers.length
      });

      // Step C: Batch broadcast individual notification copies to matching users
      // Firestore batch limit is 500 operations; we chunk by 400
      const BATCH_SIZE = 400;
      for (let i = 0; i < targetUsers.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = targetUsers.slice(i, i + BATCH_SIZE);

        chunk.forEach((targetUser) => {
          const notifRef = doc(collection(db, "users", targetUser.id, "notifications"));
          batch.set(notifRef, {
            title: title.trim(),
            message: message.trim(),
            priority,
            type: "announcement",
            announcementId: announcementRef.id,
            targetScope,
            read: false, // Ensures unread red badge counter activates on recipient's bell
            createdAt
          });
        });

        await batch.commit();
      }

      // Step D: Trigger backend broadcast for SQLite sync if API is running
      try {
        const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
        await fetch(`${API_BASE}/admin/announcements`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            title: title.trim(),
            message: message.trim(),
            targetScope,
            priority
          })
        });
      } catch (backendErr) {
        // Backend SQLite sync failure is non-blocking since Firestore broadcast succeeded
        console.warn("Backend announcement sync skipped or unavailable:", backendErr);
      }

      // Reset Form & Show Success Message
      setTitle("");
      setMessage("");
      setTargetScope("All Roles");
      setPriority("Normal");
      setStatusFeedback({
        type: "success",
        message: `Announcement broadcast successfully to ${targetUsers.length} recipient${targetUsers.length === 1 ? "" : "s"} across the platform!`
      });
    } catch (err) {
      console.error("Failed to post announcement:", err);
      setStatusFeedback({
        type: "error",
        message: `Failed to broadcast announcement: ${err.message || "Unknown error occurred"}`
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl mb-1 flex items-center gap-2">
          <Megaphone className="text-gold" size={24} /> System Management
        </h1>
        <p className="text-inkMuted text-sm">
          Platform configuration, global broadcast announcements, and maintenance tools.
        </p>
      </div>

      {/* Full System Status & Diagnostics Panel */}
      <FullSystemStatusPanel activeListenersCount={3} />

      {/* 1. Post Announcement Form Section */}
      <Card className="border border-gold/40 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-line mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gold/15 flex items-center justify-center border border-gold/30">
              <Radio className="text-gold" size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink">Post System Announcement</h2>
              <p className="text-xs text-inkMuted">
                Broadcast instant notifications directly to platform users, experts, and administrators.
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold font-medium">
            Global Broadcast
          </span>
        </div>

        {statusFeedback && (
          <div
            className={`p-3.5 mb-5 rounded-lg flex items-center gap-3 text-xs leading-relaxed border ${
              statusFeedback.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-300"
                : "bg-red-500/10 border-red-500/30 text-red-300"
            }`}
          >
            {statusFeedback.type === "success" ? (
              <CheckCircle2 size={16} className="text-green-400 shrink-0" />
            ) : (
              <AlertTriangle size={16} className="text-red-400 shrink-0" />
            )}
            <p className="flex-1">{statusFeedback.message}</p>
            <button
              type="button"
              onClick={() => setStatusFeedback(null)}
              className="text-xs text-inkMuted hover:text-ink transition-colors px-1"
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Announcement Title */}
          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">
              Announcement Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Scheduled Platform Maintenance or Lunar Cycle Update"
              className="w-full bg-surface border border-line rounded-card px-3.5 py-2.5 text-sm text-ink placeholder:text-inkMuted focus:border-gold outline-none transition-colors"
            />
          </div>

          {/* Controls: Target Audience Scope & Priority Level */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Target Audience Scope */}
            <div>
              <label className="block text-xs font-medium text-ink mb-1.5 flex items-center gap-1.5">
                <Users size={14} className="text-gold" /> Target Audience Scope
              </label>
              <select
                value={targetScope}
                onChange={(e) => setTargetScope(e.target.value)}
                className="w-full bg-surface border border-line rounded-card px-3.5 py-2.5 text-sm text-ink focus:border-gold outline-none transition-colors"
              >
                <option value="All Roles">All Roles (Clients, Experts &amp; Admins)</option>
                <option value="Clients Only">Clients Only (Standard Users)</option>
                <option value="Experts Only">Experts Only (Tarot Readers &amp; Consultants)</option>
              </select>
              <p className="text-[11px] text-inkMuted mt-1">
                {targetScope === "All Roles" && "Broadcasts to all registered users across the platform."}
                {targetScope === "Clients Only" && "Delivers to users seeking palm and tarot readings."}
                {targetScope === "Experts Only" && "Delivers strictly to verified spiritual consultants & readers."}
              </p>
            </div>

            {/* Priority Level */}
            <div>
              <label className="block text-xs font-medium text-ink mb-1.5 flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-gold" /> Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-surface border border-line rounded-card px-3.5 py-2.5 text-sm text-ink focus:border-gold outline-none transition-colors"
              >
                <option value="Normal">Normal Priority</option>
                <option value="Urgent">Urgent (Highlighted Alert Badge)</option>
              </select>
              <p className="text-[11px] text-inkMuted mt-1">
                {priority === "Urgent" ? (
                  <span className="text-red-400 font-medium">
                    Displays with a prominent URGENT red alert tag in notifications.
                  </span>
                ) : (
                  "Standard notification delivery with announcement badge."
                )}
              </p>
            </div>
          </div>

          {/* Message Body / Content */}
          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">
              Message Body / Content <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter comprehensive announcement content. This will be placed into the notifications feed of all targeted recipients..."
              className="w-full bg-surface border border-line rounded-card px-3.5 py-2.5 text-sm text-ink placeholder:text-inkMuted focus:border-gold outline-none transition-colors resize-y leading-relaxed"
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-inkMuted">
              Recipients will receive an instant unread notification badge on their bell icon.
            </span>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting || !title.trim() || !message.trim()}
              className="flex items-center gap-2 text-xs px-5 py-2.5"
            >
              <Send size={14} className={submitting ? "animate-pulse" : ""} />
              {submitting ? "Broadcasting..." : "Broadcast Announcement"}
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. Global Announcements History Feed */}
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-gold" />
            <h3 className="text-base font-semibold text-ink">Broadcast History</h3>
          </div>
          <span className="text-xs text-inkMuted">
            {announcements.length} announcement{announcements.length === 1 ? "" : "s"} recorded
          </span>
        </div>

        {loadingAnnouncements ? (
          <div className="h-28 bg-line/10 rounded animate-pulse" />
        ) : announcements.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-line rounded-lg">
            <p className="text-inkMuted text-sm">No announcements broadcast yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 bg-void/50 border border-line rounded-card hover:border-gold/30 transition-colors flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-sm text-ink">{ann.title}</h4>
                    {ann.priority === "Urgent" ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 uppercase font-bold tracking-wider">
                        Urgent
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30 uppercase font-medium">
                        Normal
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-line/30 text-inkMuted border border-line">
                      {ann.targetScope || "All Roles"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-inkMuted text-xs shrink-0">
                    <Clock size={12} />
                    <span>
                      {ann.createdAt ? new Date(ann.createdAt).toLocaleString() : "Recently"}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-inkMuted leading-relaxed">{ann.message}</p>

                <div className="flex items-center justify-between text-[11px] text-inkMuted border-t border-line/40 pt-2 mt-1">
                  <span>Author: {ann.createdByName || "Administrator"}</span>
                  <span className="text-gold font-medium">
                    {ann.recipientCount !== undefined
                      ? `Delivered to ${ann.recipientCount} recipient${ann.recipientCount === 1 ? "" : "s"}`
                      : "Broadcasted"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 3. System Status (Preserved) */}
      <Card>
        <h3 className="text-sm text-inkMuted uppercase tracking-wide mb-3">System Status</h3>
        <p className="text-sm text-inkMuted">
          All services operational. (Platform services, WebSocket/Firestore listeners, and notification brokers active.)
        </p>
      </Card>

      {/* 4. Maintenance Tools (Preserved) */}
      <Card className="flex flex-col gap-3">
        <h3 className="text-sm text-inkMuted uppercase tracking-wide mb-1">Maintenance</h3>
        <div className="flex gap-3 flex-wrap">
          <Button variant="secondary">Run Backup</Button>
          <Button variant="secondary">View System Logs</Button>
          <Button variant="ghost" className="text-red-500 hover:text-red-400">
            Enable Maintenance Mode
          </Button>
        </div>
      </Card>
    </div>
  );
}