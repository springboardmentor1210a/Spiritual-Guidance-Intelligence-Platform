import { useState, useEffect, useRef } from "react";
import { X, FileText, Calendar, User, Clock, Edit3, Save, Trash2, CheckCircle2 } from "lucide-react";
import Button from "./Button";

export default function SessionNotesModal({
  isOpen,
  onClose,
  session,
  user,
  onNoteSaved,
  formatDate
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const backdropRef = useRef(null);

  // Sync content when session changes or modal opens
  useEffect(() => {
    if (session) {
      const initialText = session.notes || "";
      setContent(initialText);
      // If there are no existing notes, start in edit mode; otherwise, start in read-only view
      setIsEditing(!initialText.trim());
      setSaveSuccess(false);

      // Verify and fetch fresh note directly from users/{uid}/session_notes/{sessionId}
      const uid = user?.uid || session.userId;
      if (uid && session.id) {
        import("firebase/firestore").then(async ({ doc, getDoc }) => {
          const { db } = await import("../../firebase");
          try {
            const snap = await getDoc(doc(db, "users", uid, "session_notes", session.id));
            if (snap.exists()) {
              const data = snap.data();
              const noteText = data.notes || "";
              setContent(noteText);
              setIsEditing(!noteText.trim());
              if (onNoteSaved && noteText !== session.notes) {
                onNoteSaved(session.id, noteText, data.updatedAt || data.notesUpdatedAt);
              }
            }
          } catch (err) {
            console.warn("Could not fetch user session note:", err);
          }
        });
      }
    }
  }, [session, isOpen, user]);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !session) return null;

  const sessionTime = session.scheduledTime || session.scheduledFor || session.createdAt;
  const consultantName = session.readerName || session.Reader?.name || "Consultant";
  const sessionTitle = session.title || session.category || session.expertType 
    ? `${session.category || session.expertType || session.title} Consultation Notes` 
    : "Session Notes";

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const { doc, setDoc, deleteField, updateDoc } = await import("firebase/firestore");
      const { db } = await import("../../firebase");
      const nowIso = new Date().toISOString();
      const uid = user?.uid || session.userId;

      if (!uid) {
        throw new Error("User must be logged in to save session notes.");
      }

      // Store user session notes strictly under users/{auth.currentUser.uid}/session_notes/{sessionId}
      await setDoc(doc(db, "users", uid, "session_notes", session.id), {
        notes: content,
        sessionId: session.id,
        userId: uid,
        updatedAt: nowIso,
        notesUpdatedAt: nowIso
      }, { merge: true });

      // Clean up any legacy notes on shared collections so experts have zero access or visibility
      try {
        await updateDoc(doc(db, "sessions", session.id), {
          notes: deleteField(),
          notesUpdatedAt: deleteField()
        });
      } catch {}
      try {
        await updateDoc(doc(db, "consultations", session.id), {
          notes: deleteField(),
          notesUpdatedAt: deleteField()
        });
      } catch {}

      // Notify parent to update local state
      if (onNoteSaved) {
        onNoteSaved(session.id, content, nowIso);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
      }, 1200);
    } catch (err) {
      console.error("Failed to save session notes:", err);
      alert("Failed to save notes: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Are you sure you want to clear the notes for this session?")) return;
    setSaving(true);
    try {
      const { doc, deleteDoc, deleteField, updateDoc } = await import("firebase/firestore");
      const { db } = await import("../../firebase");
      const uid = user?.uid || session.userId;

      if (uid) {
        await deleteDoc(doc(db, "users", uid, "session_notes", session.id));
      }

      try {
        await updateDoc(doc(db, "sessions", session.id), {
          notes: deleteField(),
          notesUpdatedAt: deleteField()
        });
      } catch {}
      try {
        await updateDoc(doc(db, "consultations", session.id), {
          notes: deleteField(),
          notesUpdatedAt: deleteField()
        });
      } catch {}

      setContent("");
      if (onNoteSaved) {
        onNoteSaved(session.id, "", null);
      }
      setIsEditing(true);
    } catch (err) {
      console.error("Failed to clear notes:", err);
      alert("Failed to clear notes: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-void/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-full max-w-xl bg-surface border border-line rounded-card shadow-2xl flex flex-col gap-5 p-6 animate-in zoom-in-95 duration-150 relative text-ink my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-line pb-4">
          <div className="flex flex-col gap-1.5 pr-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
                <FileText size={16} />
              </div>
              <h2 className="text-lg font-semibold text-ink leading-tight">
                {sessionTitle}
              </h2>
            </div>
            
            {/* Context details: Consultant Name & Original Session Date/Time */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-inkMuted">
              <span className="flex items-center gap-1.5">
                <User size={13} className="text-gold" />
                <span>Consultant:</span>
                <strong className="text-ink font-medium">{consultantName}</strong>
              </span>

              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-gold" />
                <span>Scheduled:</span>
                <span className="text-ink font-medium">
                  {formatDate ? formatDate(sessionTime) : new Date(sessionTime).toLocaleString()}
                </span>
              </span>

              <span className="px-2 py-0.5 rounded-full text-[10px] border border-line bg-void text-inkMuted uppercase tracking-wider">
                {session.status || "Completed"}
              </span>
            </div>
          </div>

          {/* Close button in header */}
          <button
            type="button"
            onClick={onClose}
            className="text-inkMuted hover:text-ink hover:bg-void p-1.5 rounded-full transition-colors cursor-pointer"
            title="Close modal (Esc)"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Full Details View */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold flex items-center gap-1.5">
              <FileText size={13} />
              {isEditing ? "Edit Personal Takeaways & Advice" : "Saved Session Summary & Advice"}
            </span>

            {!isEditing && session.notesUpdatedAt && (
              <span className="text-[11px] text-inkMuted flex items-center gap-1">
                <Clock size={11} />
                Last saved: {formatDate ? formatDate(session.notesUpdatedAt) : new Date(session.notesUpdatedAt).toLocaleString()}
              </span>
            )}
          </div>

          {isEditing ? (
            /* Edit Mode View */
            <div className="flex flex-col gap-3">
              <textarea
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type personal takeaways, key advice, answers to your questions, or discussion points from this session..."
                className="w-full bg-void border border-line rounded-card p-3.5 text-sm text-ink outline-none focus:border-gold transition-colors resize-none placeholder:text-inkMuted/60 leading-relaxed font-sans"
                autoFocus
              />
              <p className="text-[11px] text-inkMuted">
                Notes are securely saved to your private record and synced with Firestore.
              </p>
            </div>
          ) : (
            /* Full Details View (Formatted Read-Only) */
            content.trim() ? (
              <div className="p-4 bg-void/80 border border-line/60 rounded-card text-sm text-ink whitespace-pre-wrap leading-relaxed select-text max-h-[50vh] overflow-y-auto">
                {content}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-line rounded-card bg-void/40 flex flex-col items-center justify-center gap-2">
                <FileText size={32} className="text-inkMuted/50" />
                <p className="text-sm text-inkMuted">
                  No personal notes have been saved for this session yet.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setIsEditing(true)}
                  className="text-xs py-1.5 px-3 mt-1 flex items-center gap-1.5"
                >
                  <Edit3 size={13} /> Add Notes Now
                </Button>
              </div>
            )
          )}
        </div>

        {/* Modal Footer / Interactive Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-line mt-1">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={saving}
                  className="text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  {saving ? (
                    "Saving..."
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle2 size={14} className="text-green-400" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>

                {session.notes && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setContent(session.notes || "");
                      setIsEditing(false);
                    }}
                    disabled={saving}
                    className="text-xs py-2 px-3"
                  >
                    Cancel
                  </Button>
                )}

                {content.trim() && (
                  <Button
                    variant="ghost"
                    onClick={handleClear}
                    disabled={saving}
                    className="text-xs py-2 px-2 text-inkMuted hover:text-red-400 flex items-center gap-1"
                  >
                    <Trash2 size={13} />
                    <span>Clear</span>
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setIsEditing(true)}
                  className="text-xs py-2 px-3.5 flex items-center gap-1.5 border-gold/40 text-gold hover:bg-gold/10"
                >
                  <Edit3 size={13} />
                  <span>{content.trim() ? "Edit Notes" : "Add Notes"}</span>
                </Button>

                {content.trim() && (
                  <Button
                    variant="ghost"
                    onClick={handleClear}
                    disabled={saving}
                    className="text-xs py-2 px-2 text-inkMuted hover:text-red-400 flex items-center gap-1"
                  >
                    <Trash2 size={13} />
                    <span>Clear</span>
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Close / Dismiss button */}
          <Button
            variant="secondary"
            onClick={onClose}
            className="text-xs py-2 px-4"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
