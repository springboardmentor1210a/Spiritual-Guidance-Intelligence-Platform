import { useState } from "react";
import { Calendar, Clock, X, AlertTriangle, Send } from "lucide-react";
import Button from "../ui/Button";
import { doc, updateDoc, addDoc, collection, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { getLocalDateStr } from "../../utils/scheduleConflict";

export default function RescheduleModal({
  session,
  isOpen,
  onClose,
  onSuccess,
  expertName = "Your Expert"
}) {
  const todayStr = getLocalDateStr(new Date());

  const [date, setDate] = useState(
    session?.scheduledFor ? getLocalDateStr(session.scheduledFor) : todayStr
  );
  const [time, setTime] = useState("14:00");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen || !session) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time) {
      alert("Please specify a valid date and time.");
      return;
    }

    const proposedDateTime = new Date(`${date}T${time}:00`);
    if (proposedDateTime.getTime() < Date.now()) {
      alert("Please select a future date and time.");
      return;
    }

    setSaving(true);
    const newIso = proposedDateTime.toISOString();
    const formattedProposed = proposedDateTime.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    });

    try {
      const updates = {
        status: "rescheduled",
        scheduledFor: newIso,
        scheduledTime: newIso,
        proposedTime: newIso,
        rescheduleNote: note.trim() || "Proposed new time due to scheduling availability.",
        rescheduledAt: new Date().toISOString(),
        rescheduledBy: "expert"
      };

      // 1. Update in sessions collection
      try {
        await updateDoc(doc(db, "sessions", session.id), updates);
      } catch {
        // Fallback
      }

      // 2. Update in consultations collection
      const consultId = session.consultationId || session.id;
      try {
        await setDoc(doc(db, "consultations", consultId), updates, { merge: true });
      } catch (err) {
        console.warn("Could not sync reschedule to consultations:", err);
      }

      // 3. Send notification to the client user
      if (session.userId) {
        try {
          await addDoc(collection(db, "users", session.userId, "notifications"), {
            title: "Session Rescheduled by Expert",
            message: `${expertName} has proposed to reschedule your session to ${formattedProposed}.${note.trim() ? ` Note: "${note.trim()}"` : ""}`,
            sessionId: session.id,
            consultationId: consultId,
            newScheduledTime: newIso,
            read: false,
            createdAt: new Date().toISOString()
          });
        } catch (notifErr) {
          console.warn("Notification error:", notifErr);
        }
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Reschedule error:", err);
      alert("Failed to reschedule session: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-surface border border-line rounded-card shadow-2xl p-5 flex flex-col gap-4 animate-scaleUp">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gold" />
            <h3 className="text-base font-semibold text-ink font-display">Reschedule Session</h3>
          </div>
          <button
            onClick={onClose}
            className="text-inkMuted hover:text-ink transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        <div className="text-xs text-inkMuted bg-void/60 p-3 rounded-card border border-line">
          <div className="font-medium text-ink">Client: {session.userName || session.clientName || "Client"}</div>
          <div className="mt-0.5">Topic: {session.category || session.topic || "Consultation"}</div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* New Date */}
          <div>
            <label className="text-xs text-inkMuted uppercase tracking-wider block mb-1 font-semibold">
              Proposed New Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              required
              min={todayStr}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-void border border-line rounded px-3 py-2 text-sm text-ink outline-none focus:border-gold"
            />
          </div>

          {/* New Time */}
          <div>
            <label className="text-xs text-inkMuted uppercase tracking-wider block mb-1 font-semibold">
              Proposed New Time <span className="text-red-400">*</span>
            </label>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-void border border-line rounded px-3 py-2 text-sm text-ink outline-none focus:border-gold"
            />
          </div>

          {/* Explanation / Note for Client */}
          <div>
            <label className="text-xs text-inkMuted uppercase tracking-wider block mb-1 font-semibold">
              Message / Reason for Client
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Schedule conflict with another confirmed booking. Proposing this alternative slot."
              className="w-full bg-void border border-line rounded px-3 py-2 text-sm text-ink outline-none focus:border-gold resize-none"
            />
          </div>

          <div className="pt-2 border-t border-line flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-xs py-1.5 px-3"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className="text-xs py-1.5 px-4 shadow-sm flex items-center gap-1.5"
            >
              <Send size={13} />
              <span>{saving ? "Proposing..." : "Send Reschedule Request"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
