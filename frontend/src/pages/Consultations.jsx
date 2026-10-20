import { useEffect, useState } from "react";

import {

  BellRing, CheckCircle2, Clock3, Handshake, LoaderCircle,

  RefreshCw, Send, Sparkles, UserRound, XCircle, CalendarDays, ChevronRight

} from "lucide-react";

import api from "../api/client";

import { useAuth } from "../context/AuthContext";



const ROLE_LABELS = { tarot_reader: "Tarot Reader", consultant: "Spiritual Consultant" };



const TIME_OPTIONS = Array.from({ length: 25 }, (_, index) => {

  // Offer appointments every 30 minutes from 9:00 AM through 9:00 PM.

  const totalMinutes = 9 * 60 + index * 30;

  const hour24 = Math.floor(totalMinutes / 60);

  const minute = totalMinutes % 60;

  const period = hour24 >= 12 ? "PM" : "AM";

  const hour12 = hour24 % 12 || 12;

  return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;

});

const roleOf = (u) => String(u?.role || "").toLowerCase();



function fmt(value) {

  if (!value) return "—";

  const d = new Date(value);

  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString(undefined, {

    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true

  });

}

function previewSession(dateValue, timeValue) {

  const match = String(timeValue || "").trim().match(/^(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM)$/i);

  if (!dateValue || !match) return "Select a date and time";

  let hours = Number(match[1]);

  const minutes = Number(match[2]);

  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;

  if (period === "AM" && hours === 12) hours = 0;

  const selected = new Date(`${dateValue}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`);

  if (Number.isNaN(selected.getTime())) return "Select a valid date and time";

  return selected.toLocaleString(undefined, {

    weekday: "short", day: "2-digit", month: "short", year: "numeric",

    hour: "2-digit", minute: "2-digit", hour12: true

  });

}



function formatRequestedTime(value) {

  if (!value) return "No date/time selected";

  const normalized = String(value).length === 16 ? `${value}:00` : value;

  const d = new Date(normalized);

  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString(undefined, {

    weekday: "short", day: "2-digit", month: "short", year: "numeric",

    hour: "2-digit", minute: "2-digit", hour12: true

  });

}

function Status({ status }) {

  const s = String(status || "pending").toLowerCase();

  const data = s === "accepted" ? ["Accepted", CheckCircle2, "accepted"]

    : s === "rejected" ? ["Declined", XCircle, "rejected"]

    : s === "in_progress" ? ["In progress", LoaderCircle, "progress"]

    : s === "completed" ? ["Completed", CheckCircle2, "completed"]

    : ["Waiting for verification", Clock3, "pending"];

  const Icon = data[1];

  return <span className={`consult-status ${data[2]}`}><Icon size={15}/>{data[0]}</span>;

}

function Empty({ title, text }) {

  return <div className="consult-empty"><Sparkles size={25}/><h3>{title}</h3><p>{text}</p></div>;

}



function UserView({ experts, readings, requests, loading, reload }) {

  const [expertId, setExpertId] = useState("");

  const [topic, setTopic] = useState("");

  const [message, setMessage] = useState("");

  const [readingId, setReadingId] = useState("");

  const [preferredDate, setPreferredDate] = useState("");

  const [preferredClock, setPreferredClock] = useState("");

  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const selected = experts.find((x) => String(x.id) === String(expertId));

  const today = new Date();

  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;



  async function submit(e) {

    e.preventDefault();

    setError(""); setSuccess("");

    if (!expertId || !topic.trim() || !message.trim()) {

      setError("Choose a guide, enter a topic and explain your request."); return;

    }

    if (!preferredDate || !preferredClock) {

      setError("Please select a preferred consultation date and time."); return;

    }

    // The dropdown stores values like "10:00 AM". Convert them to 24-hour

    // time for the API, but keep AM/PM visible in the interface.

    const timeMatch = preferredClock.trim().match(/^(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM)$/i);

    if (!timeMatch) {

      setError("Please choose a time from the dropdown.");

      return;

    }



    let hours = Number(timeMatch[1]);

    const minutes = Number(timeMatch[2]);

    const period = timeMatch[3].toUpperCase();



    if (period === "PM" && hours !== 12) hours += 12;

    if (period === "AM" && hours === 12) hours = 0;



    const selectedDateTime = new Date(

      `${preferredDate}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`

    );

    if (Number.isNaN(selectedDateTime.getTime()) || selectedDateTime <= new Date()) {

      setError("Please select a date and time in the future.");

      return;

    }



    setSending(true);

    try {

      // Store a standard local datetime for the existing backend.

      const preferred_time = `${preferredDate}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;

      const r = await api.post("/api/consultations", {

        expert_id: Number(expertId),

        topic: topic.trim(),

        message: message.trim(),

        reading_id: readingId ? Number(readingId) : null,

        preferred_time,

      });

      setSuccess(r.data?.message || "Request sent. Your guide will be notified.");

      setTopic(""); setMessage(""); setReadingId(""); setPreferredDate(""); setPreferredClock("");

      await reload();

    } catch (err) {

      setError(err?.response?.data?.detail || "Could not send the request.");

    } finally { setSending(false); }

  }



  return <>

    <form className="consult-card request-form" onSubmit={submit}>

      <div className="consult-heading">

        <div className="consult-icon"><Send size={22}/></div>

        <div><small>SEND A REQUEST</small><h2>Ask a Tarot Reader or Spiritual Consultant</h2>

          <p>Your guide receives a consultation request and must accept or decline it.</p></div>

      </div>

      <label>Choose your guide

        <select value={expertId} onChange={(e) => setExpertId(e.target.value)} required>

          <option value="">Select a guide</option>

          {experts.map((x) => <option key={x.id} value={x.id}>{x.name} · {x.role_label}{x.specialization ? ` · ${x.specialization}` : ""}</option>)}

        </select>

      </label>

      {selected && <div className="selected-guide"><UserRound size={20}/><div><strong>{selected.name}</strong><span>{selected.role_label}{selected.experience_years != null ? ` · ${selected.experience_years} years experience` : ""}</span>{selected.bio && <p>{selected.bio}</p>}</div></div>}

      <div className="two-col">

        <label>What do you need guidance about?

          <input value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={180} placeholder="Example: Career direction" required/>

        </label>

        <label>Preferred date

          <span className="input-with-icon"><CalendarDays size={17}/><input type="date" value={preferredDate} min={minDate} onChange={(e) => setPreferredDate(e.target.value)} required/></span>

        </label>

      </div>

      <label className="time-label">Preferred time

        <select

          value={preferredClock}

          onChange={(e) => { setPreferredClock(e.target.value); setError(""); }}

          required

        >

          <option value="">Select a time (AM / PM)</option>

          {TIME_OPTIONS.map((time) => (

            <option key={time} value={time}>{time}</option>

          ))}

        </select>

      </label>

      {preferredDate && preferredClock && <div className="selected-datetime"><CalendarDays size={17}/><span><b>Selected session:</b> {previewSession(preferredDate, preferredClock)}</span></div>}

      <label>Optional Palm/Tarot context

        <select value={readingId} onChange={(e) => setReadingId(e.target.value)}>

          <option value="">No specific reading</option>

          {readings.map((r) => <option key={r.id} value={r.id}>{String(r.reading_type).toLowerCase() === "palm" ? "Palm analysis" : "Tarot reading"} · {fmt(r.created_at)}</option>)}

        </select>

      </label>

      <label>Your request

        <textarea rows="5" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={4000} placeholder="Explain what you want the guide to review or help you understand..." required/>

      </label>

      {error && <div className="consult-alert error">{error}</div>}

      {success && <div className="consult-alert success"><CheckCircle2 size={18}/>{success}</div>}

      <button className="primary" disabled={sending || !experts.length} type="submit">

        {sending ? <><LoaderCircle className="spin" size={18}/> Sending...</> : <><Send size={18}/> Send consultation request</>}

      </button>

      {!experts.length && !loading && <p className="muted">No active Tarot Readers or Spiritual Consultants are available right now.</p>}

    </form>

    <section className="consult-card">

      <div className="section-head"><div><small>MY REQUESTS</small><h2>Consultation status</h2><p>See whether your selected guide has verified your request.</p></div><Handshake size={25}/></div>

      {loading ? <div className="inline-loading"><LoaderCircle className="spin" size={18}/> Loading...</div>

        : requests.length ? <div className="request-list">{requests.map((x) => <article className="request-item" key={x.id}>

          <div className="item-top"><div><small>{ROLE_LABELS[x.expert_role] || "Spiritual Guide"}</small><h3>{x.topic}</h3></div><Status status={x.status}/></div>

          <p>{x.message}</p><div className="meta"><span>Guide: <b>{x.expert_name}</b></span><span>Sent: <b>{fmt(x.created_at)}</b></span>

            {x.preferred_time && <span>Preferred session: <b>{formatRequestedTime(x.preferred_time)}</b></span>}</div>

          {x.response_message && <div className="response"><b>{x.status === "rejected" ? "Why the guide declined" : "Guide response"}</b><p>{x.response_message}</p></div>}

          {x.meet_link && <div className="meet-link-card"><div><b>Your Google Meet session</b><p>Your guide has scheduled the session and sent a Calendar invitation.</p></div><a href={x.meet_link} target="_blank" rel="noreferrer">Join Google Meet <ChevronRight size={15}/></a></div>}

        </article>)}</div> : <Empty title="No requests yet" text="Choose a guide above and send your first request."/>}

    </section>

  </>;

}



function ExpertView({ requests, loading, reload }) {

  const [working, setWorking] = useState(null);

  const [responses, setResponses] = useState({});

  const [error, setError] = useState("");

  async function decide(id, status) {

    setWorking(id); setError("");

    try {

      await api.post(`/api/consultations/${id}/decision`, { status, response_message: responses[id] || null });

      await reload();

    } catch (err) { setError(err?.response?.data?.detail || "Could not update the request."); }

    finally { setWorking(null); }

  }

  return <section className="consult-card">

    <div className="section-head"><div><small>VERIFY REQUESTS</small><h2>Incoming consultation requests</h2><p>Review each request. Accepting or declining is the verification step.</p></div><BellRing size={25}/></div>

    {error && <div className="consult-alert error">{error}</div>}

    {loading ? <div className="inline-loading"><LoaderCircle className="spin" size={18}/> Loading requests...</div>

      : requests.length ? <div className="request-list">{requests.map((x) => <article className={`incoming ${x.status === "pending" ? "pending" : ""}`} key={x.id}>

        <div className="item-top"><div><small>{x.reading_type ? `${x.reading_type === "palm" ? "Palm" : "Tarot"} context` : "General consultation"}</small><h3>{x.topic}</h3></div><Status status={x.status}/></div>

        <div className="user-line"><UserRound size={18}/><b>{x.user_name}</b><span>{x.user_email}</span></div><p>{x.message}</p>

        {x.preferred_time && <div className="preferred"><CalendarDays size={17}/><span>Preferred session: <b>{formatRequestedTime(x.preferred_time)}</b></span></div>}

        <label className="response-field">Response message<textarea rows="3" value={responses[x.id] ?? x.response_message ?? ""} onChange={(e) => setResponses((c) => ({...c, [x.id]: e.target.value}))} placeholder="Optional message to the user..."/></label>

        {x.status === "pending" ? <div className="decision">

          <button type="button" className="accept" disabled={working === x.id} onClick={() => decide(x.id, "accepted")}>{working === x.id ? <LoaderCircle className="spin" size={17}/> : <CheckCircle2 size={17}/>} Accept request</button>

          <button type="button" className="reject" disabled={working === x.id} onClick={() => decide(x.id, "rejected")}><XCircle size={17}/> Decline</button>

        </div> : <div className="decision">

          {x.status === "accepted" && <button type="button" className="secondary" onClick={() => decide(x.id, "in_progress")}>Mark in progress</button>}

          {x.status === "in_progress" && <button type="button" className="secondary" onClick={() => decide(x.id, "completed")}>Mark completed</button>}

        </div>}

      </article>)}</div> : <Empty title="No incoming requests" text="New user requests will appear here and in your Notifications."/>}

  </section>;

}



export default function Consultations() {

  const { user } = useAuth();

  const role = roleOf(user);

  const isUser = role === "user";

  const isExpert = role === "tarot_reader" || role === "consultant";

  const [experts, setExperts] = useState([]);

  const [readings, setReadings] = useState([]);

  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");



  async function load() {

    setLoading(true); setError("");

    try {

      if (isUser) {

        const [e, r, c] = await Promise.all([

          api.get("/api/consultations/experts"), api.get("/api/readings/me"), api.get("/api/consultations/me")

        ]);

        setExperts(e.data?.items || []); setReadings(r.data?.items || []); setRequests(c.data?.items || []);

      } else if (isExpert) {

        const r = await api.get("/api/consultations/incoming");

        setRequests(r.data?.items || []);

      }

    } catch (err) { setError(err?.response?.data?.detail || "Could not load consultations."); }

    finally { setLoading(false); }

  }

  useEffect(() => { load(); }, [isUser, isExpert]);



  return <div className="page-container"><style>{styles}</style><main className="consult-page">

    <header className="consult-hero"><div><div className="eyebrow"><span/>HUMAN GUIDANCE WORKFLOW</div>

      <h1>{isUser ? "Connect with a Tarot Reader or Spiritual Consultant" : "Consultation Requests"}</h1>

      <p>{isUser ? "Send a request connected to your Palm analysis or Tarot reading. Your guide is notified and must verify your request before the consultation moves forward." : `Review and verify requests sent to you as a ${ROLE_LABELS[role] || "spiritual guide"}.`}</p>

    </div><button className="refresh" type="button" onClick={load} disabled={loading}><RefreshCw size={17}/> Refresh</button></header>

    {error && <div className="consult-alert error">{error}</div>}

    {isUser && <UserView experts={experts} readings={readings} requests={requests} loading={loading} reload={load}/>}

    {isExpert && <ExpertView requests={requests} loading={loading} reload={load}/>}

  </main></div>;

}



const styles = `

.page-container:has(.consult-page){min-height:100vh;background:#f5eee4;background-image:radial-gradient(ellipse at top left,rgba(220,194,163,.22),transparent 42%),linear-gradient(180deg,#f8f2e9 0%,#f2e7d9 100%)}
.consult-page{width:min(1200px,calc(100% - 40px));box-sizing:border-box;margin:0 auto 64px;padding:30px 0 46px;color:#3e2d22;font-size:15px}

.consult-hero{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;padding:38px 40px;border:1px solid #dcc8b5;border-radius:20px;background:linear-gradient(135deg,rgba(255,250,241,.98),rgba(246,235,220,.94));box-shadow:0 12px 30px rgba(77,47,27,.07)}

.eyebrow{display:flex;align-items:center;gap:9px;color:#966f52;font-size:11px;font-weight:900;letter-spacing:.18em}.eyebrow span{width:24px;height:1px;background:#a67b5b}

.consult-hero h1{max-width:900px;margin:12px 0 0;color:#39281f;font:500 clamp(30px,3.2vw,43px)/1.15 Georgia,serif}.consult-hero p{max-width:850px;margin:13px 0 0;color:#735d4c;font-size:15px;line-height:1.8}

.refresh{display:inline-flex;align-items:center;gap:8px;border:1px solid #cbb09a;border-radius:9px;padding:12px 15px;background:#fff;color:#634a38;font-size:13px;font-weight:850;cursor:pointer}

.consult-card{margin-top:20px;padding:30px;border:1px solid #dccbbe;border-radius:17px;background:rgba(255,250,241,.9);box-shadow:0 10px 28px rgba(77,47,27,.045)}.request-form{background:linear-gradient(135deg,#fff8ed,#f4e7d7)}

.consult-heading,.section-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.consult-heading{justify-content:flex-start}

.consult-icon{display:flex;align-items:center;justify-content:center;width:52px;height:52px;flex:none;border-radius:13px;background:#f4e9df;color:#6e4d38}

.consult-heading h2,.section-head h2{margin:6px 0 0;color:#453126;font:500 28px/1.25 Georgia,serif}.consult-heading p,.section-head p{max-width:850px;margin:8px 0 0;color:#765f4e;font-size:13px;line-height:1.75}

.consult-heading small,.section-head small{color:#966f52;font-size:11px;font-weight:900;letter-spacing:.17em}

.consult-card label{display:block;margin-top:21px;color:#654a38;font-size:13px;font-weight:850}

.consult-card input,.consult-card select,.consult-card textarea{display:block;box-sizing:border-box;width:100%;min-height:47px;margin-top:8px;border:1px solid #ddcec1;border-radius:10px;padding:12px 14px;outline:none;background:#fffaf2;color:#50392b;font:inherit;font-size:14px}

.consult-card input[type=date],.consult-card input[type=time]{min-height:47px;color-scheme:light}

.consult-card textarea{resize:vertical;line-height:1.65;min-height:125px}

.consult-card input:focus,.consult-card select:focus,.consult-card textarea:focus{border-color:#ad8669;box-shadow:0 0 0 3px rgba(173,134,105,.12)}

.two-col{display:grid;grid-template-columns:1.2fr 1fr;gap:18px}.time-label{max-width:calc(50% - 9px)}.time-label input{letter-spacing:.02em}

.input-with-icon{position:relative;display:block}.input-with-icon>svg{position:absolute;top:23px;left:13px;color:#92715a;pointer-events:none}.input-with-icon input{padding-left:40px}

.selected-guide{display:flex;gap:12px;align-items:flex-start;margin-top:16px;padding:16px;border:1px solid #e3d5c8;border-radius:11px;background:#fbf5ef;color:#6e4d38}

.selected-guide strong,.selected-guide span{display:block}.selected-guide strong{font-size:15px}.selected-guide span{margin-top:4px;color:#927765;font-size:12px}.selected-guide p{margin:8px 0 0;color:#725b4b;font-size:13px;font-weight:400;line-height:1.6}

.selected-datetime,.preferred{display:flex;align-items:center;gap:9px;margin-top:12px;padding:12px 14px;border:1px solid #e6d6c5;border-radius:10px;background:#fbf4eb;color:#78583f;font-size:13px;line-height:1.6}

.primary,.accept,.reject,.secondary{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:9px;padding:13px 16px;font-size:13px;font-weight:850;cursor:pointer}

.primary{margin-top:20px;border:1px solid #5a3e2d;background:#5a3e2d;color:#fff9f2}.primary:disabled,.accept:disabled,.reject:disabled{opacity:.55;cursor:not-allowed}

.consult-alert{display:flex;align-items:center;gap:9px;margin-top:16px;padding:13px 15px;border-radius:9px;font-size:13px;line-height:1.55}.consult-alert.error{border:1px solid #e1c1b8;background:#fff4f1;color:#8a493d}.consult-alert.success{border:1px solid #c9ddc8;background:#f4faf2;color:#4e724b}.muted{color:#9b6b55;font-size:12px}

.inline-loading{display:flex;align-items:center;gap:9px;padding:28px 0;color:#826b59;font-size:14px}.request-list{display:grid;gap:14px;margin-top:22px}

.request-item,.incoming{padding:22px;border:1px solid #e0d2c5;border-radius:13px;background:rgba(255,250,241,.94);box-shadow:0 8px 22px rgba(77,47,27,.035)}.incoming.pending{border-color:#c8a988;box-shadow:0 7px 20px rgba(93,65,45,.055)}

.item-top{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.item-top small{color:#9a765d;font-size:10px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.item-top h3{margin:6px 0 0;color:#4b3427;font:500 24px Georgia,serif}

.consult-status{display:inline-flex;align-items:center;gap:6px;flex:none;padding:7px 10px;border-radius:999px;font-size:11px;font-weight:900}.consult-status.pending{border:1px solid #dec49f;background:#fff7e9;color:#8c633b}.consult-status.accepted,.consult-status.completed{border:1px solid #bfd4bb;background:#f1f8ef;color:#54714e}.consult-status.rejected{border:1px solid #dfc0ba;background:#fff3f0;color:#8b5148}.consult-status.progress{border:1px solid #c9c5dc;background:#f5f3fb;color:#62577e}

.request-item>p,.incoming>p{margin:14px 0 0;color:#665143;font-size:14px;line-height:1.8}.meta{display:flex;flex-wrap:wrap;gap:10px 18px;margin-top:15px;color:#927a68;font-size:12px}.meta b{color:#654b39}

.response{margin-top:15px;padding:14px;border-radius:9px;background:#faf3ec}.response b{font-size:12px;color:#6d503c}.meet-link-card{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;border:1px solid #b9d2ad;background:#f0f7eb;border-radius:11px;padding:12px 14px;margin:12px 0;color:#42643b}.meet-link-card b{font-size:12px}.meet-link-card p{font-size:10px;margin:4px 0 0;color:#67865d}.meet-link-card a{display:inline-flex;align-items:center;gap:5px;border-radius:8px;padding:9px 11px;background:#4f7546;color:white;text-decoration:none;font-size:10px;font-weight:900}.response p{margin:6px 0 0;font-size:13px;color:#745e4e}

.user-line{display:flex;align-items:center;gap:8px;margin-top:15px;color:#816957;font-size:13px}.user-line span{color:#a08776}.response-field{margin-top:17px!important}

.decision{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.accept{border:1px solid #5c754f;background:#5c754f;color:#fff}.reject{border:1px solid #caa095;background:#fff8f5;color:#815046}.secondary{border:1px solid #bca58f;background:#f7eee3;color:#634a38}

.consult-empty{margin-top:22px;padding:36px;border:1px dashed #dbcabd;border-radius:13px;text-align:center;color:#73523e}.consult-empty h3{margin:12px 0 0;color:#513a2c;font:500 24px Georgia,serif}.consult-empty p{max-width:600px;margin:8px auto 0;color:#816b5b;font-size:13px;line-height:1.7}

.workflow{display:grid;grid-template-columns:1fr auto 1fr auto 1fr auto 1fr;align-items:center;gap:13px;margin-top:20px;padding:24px;border:1px solid #dccbbd;border-radius:15px;background:#fbf4ed}.workflow b{display:flex;align-items:center;justify-content:center;width:31px;height:31px;border-radius:50%;background:#5a3e2d;color:#fff;font-size:12px}.workflow strong{display:block;margin-top:10px;color:#553d2e;font-size:13px}.workflow p{margin:6px 0 0;color:#806a59;font-size:11px;line-height:1.6}.workflow i{color:#b08a6e;font-size:22px}

.spin{animation:consultSpin 1s linear infinite}@keyframes consultSpin{to{transform:rotate(360deg)}}

@media(max-width:850px){.two-col,.workflow{grid-template-columns:1fr}.workflow i{display:none}.time-label{max-width:none}}

@media(max-width:700px){.consult-page{width:calc(100% - 22px);margin-top:16px}.consult-hero{align-items:flex-start;flex-direction:column;padding:27px 21px}.consult-hero h1{font-size:30px}.consult-card{padding:20px}.item-top{flex-direction:column}.consult-heading h2,.section-head h2{font-size:24px}}

`;
