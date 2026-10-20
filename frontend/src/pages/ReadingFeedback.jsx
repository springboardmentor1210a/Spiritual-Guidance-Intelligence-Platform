import { useEffect, useState } from "react";
import { Check, HeartHandshake, ThumbsDown, ThumbsUp, Send } from "lucide-react";
import api from "../api/client";

const CSS = `
.reading-feedback{margin-top:18px;padding:18px;border:1px solid #e4d4bf;border-radius:14px;background:#fbf5eb;color:#5d402d}
.reading-feedback *{box-sizing:border-box}
.reading-feedback-head{display:flex;align-items:flex-start;gap:10px}
.reading-feedback-head svg{flex:none;color:#8b6445;margin-top:1px}
.reading-feedback-head strong{display:block;font-size:15px}
.reading-feedback-head span{display:block;margin-top:5px;color:#8b7158;font-size:12px;line-height:1.55}
.reading-feedback-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:14px}
.reading-feedback-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:10px 14px;border:1px solid #d9c3a7;border-radius:10px;background:#fffaf3;color:#684832;font-size:13px;font-weight:800;cursor:pointer}
.reading-feedback-button:hover{background:#f0e2cf}
.reading-feedback-button.selected{background:#765039;color:#fff;border-color:#765039}
.reading-feedback textarea{display:block;width:100%;min-height:82px;margin-top:12px;padding:12px;border:1px solid #d9c3a7;border-radius:10px;background:#fffdf8;color:#553827;font:inherit;font-size:13px;resize:vertical;outline:none}
.reading-feedback textarea:focus{border-color:#a87851;box-shadow:0 0 0 3px #a8785122}
.reading-feedback-submit{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;margin-top:10px!important;padding:10px 15px!important;border:1px solid #765039!important;border-radius:10px!important;background:#765039!important;color:#fff!important;font-size:13px!important;font-weight:800!important;cursor:pointer!important;opacity:1!important;visibility:visible!important}
.reading-feedback-submit:disabled{opacity:.55!important;cursor:not-allowed!important}
.reading-feedback-error{margin-top:9px;padding:9px 11px;border:1px solid #e7b7aa;border-radius:9px;background:#fff2ee;color:#984d40;font-size:12px;line-height:1.5}
.reading-feedback-success{display:flex;align-items:center;gap:8px;color:#55764d;font-size:13px;font-weight:800}
.reading-feedback-footnote{margin-top:8px;color:#987b62;font-size:11px;line-height:1.5}
`;

export default function ReadingFeedback({ readingId }) {
  const [helpful, setHelpful] = useState(null);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setError("");
    api.get("/api/consultant/feedback/me")
      .then((response) => {
        const items = Array.isArray(response.data?.items) ? response.data.items : [];
        const item = items.find((entry) => Number(entry.reading_id) === Number(readingId));
        if (active && item) {
          setHelpful(Boolean(item.helpful));
          setComment(item.comment || "");
          setSaved(true);
        }
      })
      .catch(() => {
        // Do not block submitting feedback if the optional lookup fails.
      });
    return () => { active = false; };
  }, [readingId]);

  async function submit(event) {
    event.preventDefault();
    if (helpful === null) {
      setError("Please choose “Yes, it helped” or “Not really” before saving.");
      return;
    }
    if (busy || !readingId) return;

    setBusy(true);
    setError("");
    try {
      await api.post(`/api/consultant/feedback/${readingId}`, {
        reading_id: Number(readingId),
        helpful,
        comment: comment.trim() || null,
      });
      setSaved(true);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setError("Your login session has expired. Sign out, sign in again, then submit your feedback.");
      } else {
        const detail = err.response?.data?.detail;
        let message = "We could not save your feedback. Please try again.";
        if (typeof detail === "string" && detail.trim()) {
          message = detail;
        } else if (Array.isArray(detail)) {
          message = detail.map((item) => {
            if (typeof item === "string") return item;
            if (item && typeof item === "object") {
              const field = Array.isArray(item.loc) ? item.loc.filter((part) => part !== "body").join(" → ") : "";
              return `${field ? `${field}: ` : ""}${item.msg || "Invalid value"}`;
            }
            return String(item);
          }).join(" ");
        } else if (detail && typeof detail === "object") {
          message = detail.message || detail.msg || JSON.stringify(detail);
        }
        setError(message);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="reading-feedback" aria-labelledby={`reading-feedback-title-${readingId}`}>
      <style>{CSS}</style>
      {saved ? (
        <div className="reading-feedback-success" role="status">
          <Check size={17} /> Thank you — your feedback has been recorded.
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="reading-feedback-head">
            <HeartHandshake size={20} />
            <div>
              <strong id={`reading-feedback-title-${readingId}`}>Was this reading helpful?</strong>
              <span>Your feedback helps the consultant understand how useful the guidance was.</span>
            </div>
          </div>

          <div className="reading-feedback-actions">
            <button type="button" className={`reading-feedback-button ${helpful === true ? "selected" : ""}`}
              onClick={() => { setHelpful(true); setError(""); }} disabled={busy} aria-pressed={helpful === true}>
              <ThumbsUp size={15} /> Yes, it helped
            </button>
            <button type="button" className={`reading-feedback-button ${helpful === false ? "selected" : ""}`}
              onClick={() => { setHelpful(false); setError(""); }} disabled={busy} aria-pressed={helpful === false}>
              <ThumbsDown size={15} /> Not really
            </button>
          </div>

          <label htmlFor={`reading-feedback-comment-${readingId}`} style={{display:"block",marginTop:12,fontSize:12,fontWeight:700,color:"#765039"}}>
            Optional comment
          </label>
          <textarea id={`reading-feedback-comment-${readingId}`} value={comment}
            onChange={(event) => setComment(event.target.value)} maxLength={1000} disabled={busy}
            placeholder="What was useful, or what could be clearer?" />

          {error && <div className="reading-feedback-error" role="alert">{error}</div>}

          <button className="reading-feedback-submit" type="submit" disabled={busy || helpful === null}>
            <Send size={14} /> {busy ? "Saving feedback…" : "Submit feedback"}
          </button>
          <div className="reading-feedback-footnote">Choose a response above, then select Submit feedback to save it.</div>
        </form>
      )}
    </section>
  );
}
