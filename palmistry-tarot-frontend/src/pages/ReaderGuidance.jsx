import { useState, useEffect } from "react";
import {
  ClipboardList, RefreshCw, AlertCircle, Send, Clock,
  AlertTriangle, Check
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { checkScheduleConflict, formatSessionDateTime } from "../utils/scheduleConflict";

export default function ReaderGuidance() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [confirmedSessions, setConfirmedSessions] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const fetchData = async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError(null);
    try {
      const list = [];
      const seenIds = new Set();
      const confirmed = [];
      const blocks = [];

      // 1. Fetch from guidance_requests
      const reqSnap = await getDocs(collection(db, "guidance_requests"));
      reqSnap.forEach((d) => {
        const data = d.data();
        const isTargetedToMe = data.expertId === user.uid;
        const isLegacyUnassigned =
          !data.expertId &&
          (data.expertType === "Tarot Reader" || data.category === "Tarot Reader");
        if (isTargetedToMe || isLegacyUnassigned) {
          seenIds.add(d.id);
          if (data.consultationId) seenIds.add(data.consultationId);
          list.push({ id: d.id, ...data });
        }
      });

      // 2. Fetch from global consultations collection
      const consultQ = query(collection(db, "consultations"), where("expertId", "==", user.uid));
      const consultSnap = await getDocs(consultQ);
      consultSnap.forEach((d) => {
        const data = d.data();
        if (data.type === "blocked" || data.status === "blocked") {
          blocks.push({ id: d.id, ...data });
        } else if (data.status === "accepted" || data.status === "active") {
          confirmed.push({ id: d.id, ...data });
        }

        if (data.type === "guidance" && !seenIds.has(d.id)) {
          seenIds.add(d.id);
          list.push({
            id: d.id,
            consultationId: d.id,
            ...data,
            status: data.status === "completed" ? "Expert Responded" : "Awaiting Expert Response"
          });
        }
      });

      setConfirmedSessions(confirmed);
      setBlockedSlots(blocks);
      setRequests(list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
    } catch (err) {
      console.error(err);
      setError("Unable to load guidance requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (id) => {
    if (!replyText.trim() || !user) return;
    try {
      const req = requests.find((r) => r.id === id);
      const respondedAt = new Date().toISOString();
      const expertName = user.name || "Tarot Reader";

      // 1. Update guidance_requests document
      try {
        await updateDoc(doc(db, "guidance_requests", id), {
          expertResponse: replyText,
          expertId: user.uid,
          expertName,
          status: "Expert Responded",
          respondedAt
        });
      } catch {
        // Fallback
      }

      // 2. Update global consultations document
      const cId = req?.consultationId || id;
      try {
        const { setDoc } = await import("firebase/firestore");
        await setDoc(
          doc(db, "consultations", cId),
          {
            expertResponse: replyText,
            expertId: user.uid,
            expertName,
            status: "completed",
            respondedAt
          },
          { merge: true }
        );
      } catch (err) {
        console.warn("Could not sync response to consultations collection:", err);
      }

      // 3. Send notification to client user
      if (req?.userId) {
        try {
          const { addDoc } = await import("firebase/firestore");
          await addDoc(collection(db, "users", req.userId, "notifications"), {
            title: "Expert Response Received",
            message: `${expertName} has replied to your tarot guidance request.`,
            category: req.category || "Tarot Reader",
            read: false,
            createdAt: respondedAt
          });
        } catch (err) {
          console.warn("Notification error:", err);
        }
      }

      setReplyText("");
      setReplyingTo(null);
      fetchData(); // Refresh the list
    } catch (err) {
      console.error(err);
      alert("Failed to send reply. Please try again.");
    }
  };

  useEffect(() => {
    if (token && user?.uid) fetchData();
  }, [token, user]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl mb-1 flex items-center gap-2">
            <ClipboardList size={24} className="text-gold" /> Guidance
          </h1>
          <p className="text-inkMuted text-sm">Review incoming user requests and provide expert guidance.</p>
        </div>
        <Button variant="secondary" onClick={fetchData} className="flex items-center gap-2 text-xs">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-200 text-sm">
          <AlertCircle size={18} className="text-red-400" />
          <p className="flex-1">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="h-40 bg-line/10 rounded animate-pulse" />
      ) : requests.length === 0 ? (
        <Card>
          <p className="text-sm text-inkMuted text-center py-6">No pending guidance requests at this time.</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {requests.map((r) => {
            const hasRequestedTime = Boolean(r.scheduledFor || r.scheduledTime);
            const conflict = hasRequestedTime
              ? checkScheduleConflict(r, confirmedSessions, blockedSlots)
              : { hasConflict: false };

            return (
              <Card key={r.id} className="flex flex-col gap-3 bg-void/50 border border-line">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{r.userName || r.Client?.name || "Unknown User"}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      r.status === "Expert Responded"
                        ? "text-green-400 border-green-500/40 bg-green-500/10"
                        : "text-gold border-gold/40 bg-gold/10"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <div className="text-xs text-inkMuted flex justify-between">
                  <span>Category: {r.category || "General"}</span>
                  <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Requested Session Time & Conflict Check */}
                {hasRequestedTime && (
                  <div className="flex flex-col gap-1.5 p-2.5 rounded bg-void border border-line/80">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="text-xs text-ink font-medium flex items-center gap-1.5">
                        <Clock size={12} className="text-gold" />
                        <span>Requested Time: {formatSessionDateTime(r.scheduledFor || r.scheduledTime)}</span>
                      </span>
                      {conflict.hasConflict ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 font-bold flex items-center gap-1">
                          <AlertTriangle size={11} /> Scheduling Conflict
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/30 font-medium flex items-center gap-1">
                          <Check size={11} /> Slot Available
                        </span>
                      )}
                    </div>
                    {conflict.hasConflict && (
                      <p className="text-[11px] text-red-400 font-medium mt-0.5">
                        ⚠️ {conflict.message}
                      </p>
                    )}
                  </div>
                )}

                <div className="bg-surface p-3 rounded border border-line/50">
                  <p className="text-sm italic text-inkMuted">"{r.description}"</p>
                  {r.data && r.data.type === "tarot" && (
                    <div className="mt-3 pt-3 border-t border-line/50">
                      <p className="text-xs text-gold uppercase mb-2">Attached Tarot Reading: {r.data.spread?.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {r.data.cards?.map((c) => (
                          <span key={c.id} className="text-xs bg-void border border-gold/30 px-2 py-1 rounded">
                            {c.name} {c.reversed ? "(R)" : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {r.data && r.data.type === "palm" && (
                    <div className="mt-3 pt-3 border-t border-line/50">
                      <p className="text-xs text-gold uppercase mb-2">Attached Palm Reading</p>
                      <p className="text-xs text-inkMuted">Score: {r.data.guidanceScore}</p>
                    </div>
                  )}
                </div>

                {r.status !== "Expert Responded" ? (
                  replyingTo === r.id ? (
                    <div className="mt-2 flex flex-col gap-2">
                      <textarea
                        className="w-full bg-void border border-line rounded p-2 text-sm outline-none focus:border-gold transition-colors resize-none"
                        rows={4}
                        placeholder="Write your detailed expert response here..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <Button variant="secondary" onClick={() => setReplyingTo(null)} className="text-xs">
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => handleReply(r.id)}
                          className="text-xs flex items-center gap-1"
                        >
                          <Send size={12} /> Send Reply
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="primary" onClick={() => setReplyingTo(r.id)} className="mt-2 text-xs">
                      Write Reply
                    </Button>
                  )
                ) : (
                  <div className="mt-2 p-3 bg-gold/5 rounded border border-gold/20">
                    <p className="text-xs text-gold uppercase tracking-wide mb-1">Your Response</p>
                    <p className="text-sm whitespace-pre-wrap">{r.expertResponse}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
