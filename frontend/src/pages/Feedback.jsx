import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle, MessageSquare, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

const labels = { open:"Open", in_review:"In review", resolved:"Resolved", closed:"Closed" };
const dateText = (v) => v ? new Date(v).toLocaleString() : "—";

export default function Feedback() {
  const { user } = useAuth();
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";
  const [items,setItems] = useState([]);
  const [category,setCategory] = useState("general");
  const [subject,setSubject] = useState("");
  const [message,setMessage] = useState("");
  const [statusFilter,setStatusFilter] = useState("");
  const [statuses,setStatuses] = useState({});
  const [responses,setResponses] = useState({});
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [busyId,setBusyId] = useState(null);
  const [notice,setNotice] = useState("");
  const [error,setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const r = isAdmin
        ? await api.get("/api/platform-feedback/admin",{params:{submission_type:"complaint",status:statusFilter||undefined}})
        : await api.get("/api/platform-feedback/me");
      const data = (r.data?.items || []).filter(x => String(x.submission_type || "").toLowerCase() === "complaint");
      setItems(data);
      setStatuses(old => { const n={...old}; data.forEach(x=>{if(n[x.id]===undefined)n[x.id]=x.status||"open";}); return n; });
      setResponses(old => { const n={...old}; data.forEach(x=>{if(n[x.id]===undefined)n[x.id]=x.admin_response||"";}); return n; });
    } catch(e) { setError(e?.response?.data?.detail || "Unable to load submissions. Check your login and backend."); }
    finally { setLoading(false); }
  },[isAdmin,statusFilter]);
  useEffect(()=>{load();},[load]);

  async function submit(e) {
    e.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      await api.post("/api/platform-feedback",{submission_type:"complaint",category,rating:null,subject:subject.trim(),message:message.trim()});
      setSubject(""); setMessage(""); setNotice("Your complaint was submitted successfully.");
      await load(); window.dispatchEvent(new Event("notifications-updated"));
    } catch(e) { setError(e?.response?.data?.detail || "Your submission could not be sent."); }
    finally { setSaving(false); }
  }
  async function review(item) {
    setBusyId(item.id); setError(""); setNotice("");
    try {
      await api.patch(`/api/platform-feedback/admin/${item.id}`,{status:statuses[item.id]||item.status,admin_response:responses[item.id]?.trim()||null});
      setNotice(`Submission #${item.id} updated.`); await load(); window.dispatchEvent(new Event("notifications-updated"));
    } catch(e) { setError(e?.response?.data?.detail || "Could not save this review."); }
    finally { setBusyId(null); }
  }

  return <div className="platform-feedback">
    <style>{`
      .platform-feedback{width:min(1120px,calc(100% - 32px));margin:30px auto 70px;color:#493123}
      .pf-hero{padding:25px;border:1px solid #dfcbb4;border-radius:22px;background:linear-gradient(135deg,#fffaf2,#f0e2d1);margin-bottom:20px}
      .pf-eyebrow{font-size:10px;letter-spacing:.18em;font-weight:900;color:#986744;margin:0 0 8px;text-transform:uppercase}
      .pf-hero h1{font:clamp(30px,4vw,44px) Georgia,serif;margin:0 0 10px}
      .pf-hero p,.pf-muted{color:#80634f;font-size:12px;line-height:1.7}
      .pf-columns{display:grid;grid-template-columns:minmax(270px,.8fr) minmax(0,1.2fr);gap:18px;align-items:start}
      .pf-card{padding:21px;border:1px solid #dfcbb4;border-radius:18px;background:#fffaf3}
      .pf-card h2{font:23px Georgia,serif;margin:0 0 8px}
      .pf-form label,.pf-filters label{display:block;font-size:11px;font-weight:800;color:#76553e;margin:13px 0 6px}
      .pf-form input,.pf-form select,.pf-form textarea,.pf-filters select,.pf-response{box-sizing:border-box;width:100%;padding:10px 11px;border:1px solid #ddc9b1;border-radius:10px;background:#fffdf9;color:#493123;font:inherit;font-size:12px}
      .pf-form textarea,.pf-response{min-height:95px;resize:vertical}
      .pf-stars{display:flex;gap:6px;margin-top:6px}.pf-stars button{border:1px solid #e0ceb9;border-radius:9px;background:#fff7eb;padding:8px;color:#aaa;cursor:pointer}.pf-stars button.selected{color:#a66a2e;background:#f7e7c9}
      .pf-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;border:0;border-radius:10px;padding:11px 14px;background:#6c4932;color:#fffaf2;font-size:12px;font-weight:800;cursor:pointer;margin-top:14px}.pf-btn:disabled{opacity:.55}
      .pf-notice,.pf-error{padding:12px 14px;border-radius:11px;margin:0 0 14px;font-size:12px}.pf-notice{background:#edf5e9;color:#42633c;border:1px solid #c9dfbf}.pf-error{background:#fff0eb;color:#8a4337;border:1px solid #e5bfb5}
      .pf-item{border:1px solid #e4d3c0;border-radius:14px;padding:14px;margin-top:12px;background:#fffdf9}
      .pf-item-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.pf-item h3{margin:0 0 6px;font-size:15px}.pf-meta{font-size:10px;color:#9a7c63}.pf-pill{display:inline-block;border-radius:999px;padding:5px 8px;background:#eee1d1;color:#704a30;font-size:9px;font-weight:900;text-transform:uppercase}
      .pf-item p{font-size:12px;line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere}.pf-filters{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      @media(max-width:780px){.pf-columns{grid-template-columns:1fr}.pf-card{padding:16px}}
    `}</style>
    <header className="pf-hero"><p className="pf-eyebrow">{isAdmin?"Administrator workspace":"Your voice matters"}</p><h1>Complaints</h1><p>{isAdmin?"Review complaints, update their status, and send replies to users.":"Report a problem and track its status and administrator response here."}</p></header>
    {notice&&<div className="pf-notice"><CheckCircle2 size={15} style={{verticalAlign:"middle",marginRight:6}}/>{notice}</div>}
    {error&&<div className="pf-error"><AlertCircle size={15} style={{verticalAlign:"middle",marginRight:6}}/>{error}</div>}
    {!isAdmin&&<div className="pf-columns">
      <section className="pf-card"><h2>Submit a complaint</h2><p className="pf-muted">Describe the problem clearly. Please don't include passwords or sensitive personal information.</p>
        <form className="pf-form" onSubmit={submit}>
          <label htmlFor="pf-category">Category</label><select id="pf-category" value={category} onChange={e=>setCategory(e.target.value)}>{["general","account","readings","consultations","notifications","technical","privacy","other"].map(x=><option key={x} value={x}>{x[0].toUpperCase()+x.slice(1)}</option>)}</select>
          <label htmlFor="pf-subject">Subject</label><input id="pf-subject" required minLength={3} maxLength={180} value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Briefly describe it"/>
          <label htmlFor="pf-message">Details</label><textarea id="pf-message" required minLength={5} maxLength={5000} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Describe what happened, where it happened, and what help you need."/>
          <button className="pf-btn" disabled={saving}>{saving?<LoaderCircle size={15}/>:<Send size={15}/>} {saving?"Submitting…":"Submit complaint"}</button>
        </form>
      </section>
      <section className="pf-card"><h2>Your complaints</h2><p className="pf-muted">Track each complaint and read administrator replies here.</p>
        {loading?<p className="pf-muted">Loading…</p>:items.length===0?<p className="pf-muted">No complaints submitted yet.</p>:items.map(x=><article className="pf-item" key={x.id}><div className="pf-item-head"><div><h3>{x.subject}</h3><div className="pf-meta">#{x.id} · {dateText(x.created_at)}</div></div><span className="pf-pill">{labels[x.status]||x.status}</span></div><p>{x.message}</p><div className="pf-meta">{x.category}</div>{x.admin_response&&<div style={{marginTop:10,padding:12,borderRadius:10,background:"#f2e8db"}}><strong>Administrator response</strong><p>{x.admin_response}</p></div>}</article>)}
      </section>
    </div>}
    {isAdmin&&<section className="pf-card"><h2>Complaints</h2><div className="pf-filters">
      <div><label htmlFor="pf-status-filter">Status</label><select id="pf-status-filter" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="">All statuses</option>{Object.entries(labels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
    </div>{loading?<p className="pf-muted">Loading submissions…</p>:items.length===0?<p className="pf-muted">No complaints match these filters.</p>:items.map(x=><article className="pf-item" key={x.id}><div className="pf-item-head"><div><h3>{x.subject}</h3><div className="pf-meta">#{x.id} · {x.user_name||`User #${x.user_id}`} · {x.user_email||""}</div></div><span className="pf-pill">{x.submission_type}</span></div><p>{x.message}</p><div className="pf-meta">{x.category}{x.rating?` · ${x.rating}/5 stars`:""} · {dateText(x.created_at)}</div>
      <div className="pf-filters"><div><label htmlFor={`pf-status-${x.id}`}>Status</label><select id={`pf-status-${x.id}`} value={statuses[x.id]||x.status} onChange={e=>setStatuses(s=>({...s,[x.id]:e.target.value}))}>{Object.entries(labels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div><div><label htmlFor={`pf-response-${x.id}`}>Admin response</label><textarea className="pf-response" id={`pf-response-${x.id}`} value={responses[x.id]??""} onChange={e=>setResponses(s=>({...s,[x.id]:e.target.value}))} placeholder="Reply to the user…"/></div></div>
      <button className="pf-btn" disabled={busyId===x.id} onClick={()=>review(x)}>{busyId===x.id?<LoaderCircle size={15}/>:<MessageSquare size={15}/>} Save complaint</button>
    </article>)}</section>}
  </div>;
}
