import { useCallback, useEffect, useMemo, useState } from "react";

import {

  AlertCircle,

  CheckCircle2,

  Clock3,

  MessageSquareWarning,

  RefreshCw,

  Search,

  Send,

  ShieldCheck,

  CircleCheck,

  Inbox,

} from "lucide-react";

import api from "../api/client";



const STATUSES = [

  ["", "All statuses"],

  ["open", "Open"],

  ["in_review", "In review"],

  ["resolved", "Resolved"],

  ["closed", "Closed"],

];



function dateTime(value) {

  if (!value) return "Date unavailable";

  const date = new Date(value);

  return Number.isNaN(date.getTime())

    ? "Date unavailable"

    : date.toLocaleString(undefined, {

        day: "2-digit", month: "short", year: "numeric",

        hour: "2-digit", minute: "2-digit",

      });

}



function statusLabel(value) {

  const status = String(value || "open").toLowerCase();

  return ({ open: "Open", in_review: "In review", resolved: "Resolved", closed: "Closed" })[status] || "Open";

}



function StatusIcon({ status }) {

  if (status === "resolved" || status === "closed") return <CircleCheck size={14} />;

  if (status === "in_review") return <Clock3 size={14} />;

  return <MessageSquareWarning size={14} />;

}



export default function ComplaintsAdmin() {

  const [items, setItems] = useState([]);

  const [status, setStatus] = useState("");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [busyId, setBusyId] = useState(null);

  const [error, setError] = useState("");

  const [notice, setNotice] = useState("");

  const [responses, setResponses] = useState({});
  const [editingCompleted, setEditingCompleted] = useState({});



  const loadComplaints = useCallback(async (initial = false) => {

    setError("");

    if (initial) setLoading(true);

    else setRefreshing(true);

    try {

      const response = await api.get("/api/platform-feedback/admin", {

        params: { submission_type: "complaint", limit: 300 },

      });

      const data = (response.data?.items || []).filter(

        (item) => String(item.submission_type || "").toLowerCase() === "complaint"

      );

      setItems(data);

      setResponses((current) => {

        const next = { ...current };

        for (const item of data) {

          if (!(item.id in next)) next[item.id] = item.admin_response || "";

        }

        return next;

      });

    } catch (err) {

      setError(err?.response?.data?.detail || "Complaints could not be loaded. Check the platform-feedback API and administrator session.");

    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  }, []);



  useEffect(() => { loadComplaints(true); }, [loadComplaints]);



  const counts = useMemo(() => ({

    total: items.length,

    open: items.filter((item) => ["open", "in_review"].includes(String(item.status || "open").toLowerCase())).length,

    resolved: items.filter((item) => ["resolved", "closed"].includes(String(item.status || "").toLowerCase())).length,

  }), [items]);



  const visibleItems = useMemo(() => {

    const query = search.trim().toLowerCase();

    return items.filter((item) => {

      const matchesStatus = !status || String(item.status || "open").toLowerCase() === status;

      const searchable = [item.subject, item.message, item.category, item.user_name, item.full_name, item.user_email, item.id]

        .filter(Boolean).join(" ").toLowerCase();

      return matchesStatus && (!query || searchable.includes(query));

    });

  }, [items, search, status]);



  async function updateComplaint(item) {

    setBusyId(item.id);

    setError("");

    setNotice("");

    const changes = {

      status: item.status || "open",

      admin_response: (responses[item.id] ?? item.admin_response ?? "").trim(),

    };

    try {

      const response = await api.patch(`/api/platform-feedback/admin/${item.id}`, changes);

      const updated = response.data || { ...item, ...changes };

      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, ...updated } : entry));

      setResponses((current) => ({ ...current, [item.id]: updated.admin_response ?? changes.admin_response }));

      setNotice(`Complaint #${item.id} has been updated.`);

      await loadComplaints();

    } catch (err) {

      setError(err?.response?.data?.detail || "The complaint could not be updated. Please try again.");

    } finally {

      setBusyId(null);

    }

  }



  if (loading) {

    return <div className="complaints-pro-page"><div className="cp-loading"><RefreshCw size={22} className="cp-spin"/><span>Loading complaint workspace…</span></div></div>;

  }



  return (

    <div className="complaints-pro-page">

      <style>{`

        .complaints-pro-page{--cp-ink:#3f2b20;--cp-muted:#806a58;--cp-line:#e6d4bf;--cp-bg:#fbf6ee;--cp-paper:#fffdf9;--cp-accent:#755039;max-width:1180px;width:calc(100% - 40px);margin:30px auto 72px;color:var(--cp-ink)}

        .cp-hero{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:30px 32px;margin-bottom:22px;border:1px solid var(--cp-line);border-radius:22px;background:linear-gradient(118deg,#fffaf3 0%,#f2e5d4 100%)}

        .cp-hero:after{content:"";position:absolute;width:210px;height:210px;border:1px solid rgba(117,80,57,.12);border-radius:50%;right:-62px;top:-90px;box-shadow:0 0 0 22px rgba(117,80,57,.035),0 0 0 46px rgba(117,80,57,.025);pointer-events:none}

        .cp-eyebrow{margin:0 0 9px;color:#986d4b;font-size:10px;font-weight:900;letter-spacing:.2em;text-transform:uppercase}

        .cp-hero h1{margin:0;font:clamp(34px,4vw,46px)/1.06 Georgia,'Times New Roman',serif;letter-spacing:-.025em;color:#432d20}

        .cp-hero-copy{max-width:680px;margin:12px 0 0;color:var(--cp-muted);font-size:13px;line-height:1.7}

        .cp-hero-icon{position:relative;z-index:1;flex:0 0 64px;width:64px;height:64px;border:1px solid #dfc9ae;border-radius:19px;background:rgba(255,253,249,.72);display:grid;place-items:center;color:#81583b}

        .cp-alert{display:flex;align-items:flex-start;gap:9px;padding:12px 15px;margin:0 0 16px;border-radius:12px;font-size:12px;line-height:1.5}

        .cp-error{background:#fff0ed;border:1px solid #e8c2b9;color:#91483d}.cp-notice{background:#edf5e8;border:1px solid #c9dabb;color:#526c43}

        .cp-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-bottom:22px}

        .cp-metric{display:flex;align-items:center;gap:14px;min-height:94px;padding:18px 20px;border:1px solid var(--cp-line);border-radius:17px;background:var(--cp-paper);box-shadow:0 3px 12px rgba(73,48,29,.025)}

        .cp-metric-icon{width:43px;height:43px;flex:0 0 43px;display:grid;place-items:center;border-radius:13px;background:#f3e6d5;color:#795338}

        .cp-metric span{display:block;color:#92765e;font-size:9px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}.cp-metric strong{display:block;margin-top:5px;font:30px/1 Georgia,serif;color:#432d20}.cp-metric small{display:block;margin-top:5px;color:#987e68;font-size:10px}

        .cp-panel{overflow:hidden;border:1px solid var(--cp-line);border-radius:20px;background:var(--cp-paper);box-shadow:0 8px 26px rgba(73,48,29,.035)}

        .cp-panel-head{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:22px 24px;border-bottom:1px solid #eee0d0}

        .cp-panel-head h2{margin:0;font:26px/1.15 Georgia,'Times New Roman',serif;color:#4b3223}.cp-panel-head p{margin:7px 0 0;color:#90745d;font-size:12px;line-height:1.5}

        .cp-refresh{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:39px;padding:0 13px;border:1px solid #dfcbb5;border-radius:10px;background:#fffdf9;color:#67462f;font-size:11px;font-weight:800;white-space:nowrap;cursor:pointer;transition:background .15s,transform .15s}.cp-refresh:hover{background:#f6ecdf}.cp-refresh:active{transform:translateY(1px)}.cp-refresh:disabled{opacity:.55;cursor:wait}

        .cp-toolbar{display:grid;grid-template-columns:minmax(220px,1fr) minmax(180px,.45fr);gap:14px;padding:17px 24px;background:#fcf7f0;border-bottom:1px solid #eee0d0}

        .cp-field-label{display:block;margin:0 0 7px;color:#785b43;font-size:11px;font-weight:800}

        .cp-search-wrap{position:relative}.cp-search-wrap svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#9a8069}.cp-control{box-sizing:border-box;width:100%;min-height:41px;padding:10px 12px;border:1px solid #dfcdb8;border-radius:10px;background:#fffdf9;color:#493426;font:inherit;font-size:12px;outline:none}.cp-search-wrap .cp-control{padding-left:37px}.cp-control:focus{border-color:#a7805e;box-shadow:0 0 0 3px rgba(167,128,94,.13)}

        .cp-results-line{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 24px 0;color:#92765e;font-size:11px}

        .cp-list{display:grid;gap:14px;padding:16px 20px 22px}

        .cp-complaint{border:1px solid #e7d7c4;border-radius:16px;background:#fffefa;overflow:hidden;transition:box-shadow .15s,border-color .15s}.cp-complaint:hover{border-color:#dac2a7;box-shadow:0 5px 18px rgba(73,48,29,.045)}

        .cp-item-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:19px 20px 16px;border-bottom:1px solid #f0e5d8}

        .cp-item-kicker{display:flex;align-items:center;gap:8px;margin-bottom:8px;color:#9a7656;font-size:9px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.cp-item-title{margin:0;font-size:17px;font-weight:750;line-height:1.4;overflow-wrap:anywhere;color:#493124}.cp-item-meta{display:flex;flex-wrap:wrap;gap:6px 13px;margin:7px 0 0;color:#987d66;font-size:10px;line-height:1.5}

        .cp-status-pill{display:inline-flex;align-items:center;gap:6px;flex:0 0 auto;padding:7px 10px;border-radius:999px;background:#f7ead8;color:#7a573a;font-size:9px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}.cp-status-pill.open{background:#fff0dc;color:#9a642c}.cp-status-pill.in_review{background:#eaf0fa;color:#526a91}.cp-status-pill.resolved,.cp-status-pill.closed{background:#eaf3e5;color:#557345}

        .cp-item-body{padding:18px 20px}.cp-message-label{margin:0 0 7px;color:#9a7c61;font-size:9px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}.cp-message{margin:0;color:#5f4937;font-size:13px;line-height:1.75;white-space:pre-wrap;overflow-wrap:anywhere}.cp-category{display:inline-flex;align-items:center;gap:6px;margin:14px 0 0;padding:6px 9px;border:1px solid #eadac7;border-radius:8px;background:#fcf5eb;color:#85664b;font-size:10px}

        .cp-editor{display:grid;grid-template-columns:minmax(170px,.55fr) minmax(0,1.45fr);gap:15px;padding:18px 20px;background:#fcf7f0;border-top:1px solid #eee0d0}.cp-editor label{display:block;color:#76573f;font-size:11px;font-weight:800}.cp-editor select,.cp-editor textarea{box-sizing:border-box;width:100%;margin-top:8px;padding:11px 12px;border:1px solid #dfcdb8;border-radius:10px;background:#fffefa;color:#493426;font:inherit;font-size:12px;line-height:1.55;outline:none}.cp-editor select:focus,.cp-editor textarea:focus{border-color:#a7805e;box-shadow:0 0 0 3px rgba(167,128,94,.12)}.cp-editor textarea{min-height:94px;resize:vertical}.cp-editor textarea::placeholder{color:#b09a84}

        .cp-item-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 20px;border-top:1px solid #eee0d0}.cp-last-response{display:flex;align-items:flex-start;gap:7px;max-width:70%;margin:0;color:#92775f;font-size:10px;line-height:1.55}.cp-last-response span{overflow-wrap:anywhere}.cp-save{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:40px;padding:0 15px;border:1px solid #67462f;border-radius:10px;background:#704b32;color:#fffaf3;font-size:11px;font-weight:850;cursor:pointer;box-shadow:0 2px 4px rgba(63,43,32,.08);transition:background .15s,transform .15s}.cp-save:hover{background:#563823}.cp-save:active{transform:translateY(1px)}.cp-save:disabled{opacity:.55;cursor:wait}

        .cp-resolution{display:flex;align-items:flex-start;gap:12px;padding:17px 20px;background:#f6f8f1;border-top:1px solid #e3ead9}
        .cp-resolution-icon{display:grid;place-items:center;flex:0 0 34px;width:34px;height:34px;border-radius:10px;background:#e7efdf;color:#587449}
        .cp-resolution-copy{min-width:0;flex:1}
        .cp-resolution-copy strong{display:block;color:#4f6842;font-size:12px;font-weight:850}
        .cp-resolution-copy p{margin:5px 0 0;color:#68765e;font-size:12px;line-height:1.65;white-space:pre-wrap;overflow-wrap:anywhere}
        .cp-reopen{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:38px;padding:0 13px;border:1px solid #d8c4ad;border-radius:10px;background:#fffdf9;color:#704b32;font-size:11px;font-weight:800;cursor:pointer;white-space:nowrap}
        .cp-reopen:hover{background:#f5eadc;border-color:#c9a987}
        .cp-reopen:disabled{opacity:.55;cursor:wait}
        .cp-save:disabled{opacity:.55;cursor:wait}
        .cp-empty{padding:48px 20px;text-align:center}.cp-empty-icon{display:grid;place-items:center;width:54px;height:54px;margin:0 auto 14px;border:1px solid #ead9c5;border-radius:17px;background:#f8efe3;color:#8a6547}.cp-empty h3{margin:0;color:#4b3223;font:22px Georgia,serif}.cp-empty p{max-width:390px;margin:8px auto 0;color:#92765e;font-size:12px;line-height:1.6}

        .cp-loading{display:flex;align-items:center;justify-content:center;gap:12px;min-height:240px;border:1px solid var(--cp-line);border-radius:18px;background:var(--cp-paper);color:#80664e;font-size:13px}.cp-spin{animation:cp-spin 1s linear infinite}@keyframes cp-spin{to{transform:rotate(360deg)}}

        @media(max-width:720px){.complaints-pro-page{width:calc(100% - 24px);margin:18px auto 42px}.cp-hero{padding:23px 21px}.cp-hero-icon{display:none}.cp-metrics{grid-template-columns:1fr;gap:10px}.cp-metric{min-height:74px}.cp-toolbar{grid-template-columns:1fr;padding:15px}.cp-panel-head{padding:19px 16px;align-items:flex-start}.cp-panel-head h2{font-size:23px}.cp-list{padding:12px}.cp-item-head{padding:16px;flex-direction:column}.cp-item-body{padding:16px}.cp-editor{grid-template-columns:1fr;padding:16px}.cp-item-footer{padding:14px 16px}.cp-last-response{max-width:100%}.cp-results-line{padding:12px 16px 0}}

      `}</style>



      <header className="cp-hero">

        <div>

          <p className="cp-eyebrow">Administrator workspace · Support operations</p>

          <h1>Complaints centre</h1>

          <p className="cp-hero-copy">Review concerns raised by users, record the next action, and send a clear response. Only submissions filed as complaints appear in this workspace.</p>

        </div>

        <div className="cp-hero-icon" aria-hidden="true"><MessageSquareWarning size={29}/></div>

      </header>



      {error && <div className="cp-alert cp-error" role="alert"><AlertCircle size={16}/><span>{error}</span></div>}

      {notice && <div className="cp-alert cp-notice" role="status"><CheckCircle2 size={16}/><span>{notice}</span></div>}



      <section className="cp-metrics" aria-label="Complaint summary">

        <article className="cp-metric"><div className="cp-metric-icon"><Inbox size={20}/></div><div><span>Total complaints</span><strong>{counts.total}</strong><small>All submitted complaints</small></div></article>

        <article className="cp-metric"><div className="cp-metric-icon"><Clock3 size={20}/></div><div><span>Needs attention</span><strong>{counts.open}</strong><small>Open or being reviewed</small></div></article>

        <article className="cp-metric"><div className="cp-metric-icon"><CheckCircle2 size={20}/></div><div><span>Completed</span><strong>{counts.resolved}</strong><small>Resolved or closed</small></div></article>

      </section>



      <section className="cp-panel">

        <div className="cp-panel-head">

          <div><h2>Complaint queue</h2><p>Manage the status and official response for each submission.</p></div>

          <button type="button" className="cp-refresh" onClick={() => loadComplaints()} disabled={refreshing}><RefreshCw size={14} className={refreshing ? "cp-spin" : ""}/>{refreshing ? "Refreshing…" : "Refresh queue"}</button>

        </div>

        <div className="cp-toolbar">

          <div><label className="cp-field-label" htmlFor="cp-search">Search complaints</label><div className="cp-search-wrap"><Search size={15}/><input id="cp-search" className="cp-control" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search subject, user, category, or details"/></div></div>

          <div><label className="cp-field-label" htmlFor="cp-status-filter">Filter by status</label><select id="cp-status-filter" className="cp-control" value={status} onChange={(event) => setStatus(event.target.value)}>{STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>

        </div>

        <div className="cp-results-line"><span>{visibleItems.length} {visibleItems.length === 1 ? "complaint" : "complaints"} shown</span><span>Newest submissions first</span></div>



        {visibleItems.length ? <div className="cp-list">{visibleItems.map((item) => {
          const currentStatus = String(item.status || "open").toLowerCase();
          const isCompleted = ["resolved", "closed"].includes(currentStatus);
          const isEditing = Boolean(editingCompleted[item.id]);
          const showEditor = !isCompleted || isEditing;
          const currentResponse = responses[item.id] ?? item.admin_response ?? "";
          return <article className="cp-complaint" key={item.id}>
            <div className="cp-item-head">
              <div>
                <div className="cp-item-kicker"><MessageSquareWarning size={13}/> Complaint #{item.id}</div>
                <h3 className="cp-item-title">{item.subject || "Complaint submitted by user"}</h3>
                <div className="cp-item-meta"><span>{item.user_name || item.full_name || `User #${item.user_id}`}</span>{item.user_email && <span>{item.user_email}</span>}<span>{dateTime(item.created_at)}</span></div>
              </div>
              <span className={`cp-status-pill ${currentStatus}`}><StatusIcon status={currentStatus}/>{statusLabel(currentStatus)}</span>
            </div>

            <div className="cp-item-body">
              <p className="cp-message-label">Complaint details</p>
              <p className="cp-message">{item.message || "No additional details were provided."}</p>
              <span className="cp-category">Category · {item.category || "General"}</span>
            </div>

            {showEditor ? (
              <>
                <div className="cp-editor">
                  <label htmlFor={`cp-status-${item.id}`}>Update status
                    <select id={`cp-status-${item.id}`} value={currentStatus} onChange={(event) => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: event.target.value } : entry))}>
                      {STATUSES.filter(([value]) => value).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </label>
                  <label htmlFor={`cp-response-${item.id}`}>Response to user
                    <textarea id={`cp-response-${item.id}`} value={currentResponse} onChange={(event) => setResponses((current) => ({ ...current, [item.id]: event.target.value }))} maxLength={2000} placeholder="Acknowledge the concern, explain what happens next, or share the resolution…"/>
                  </label>
                </div>
                <div className="cp-item-footer">
                  {item.admin_response ? <p className="cp-last-response"><ShieldCheck size={14}/><span><strong>Previously sent:</strong> {item.admin_response}</span></p> : <p className="cp-last-response"><ShieldCheck size={14}/><span>No response has been sent yet.</span></p>}
                  <button type="button" className="cp-save" disabled={busyId === item.id} onClick={() => updateComplaint(item)}>
                    {busyId === item.id ? <RefreshCw size={14} className="cp-spin"/> : <Send size={14}/>}
                    {busyId === item.id ? "Saving…" : "Save status & response"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="cp-resolution">
                  <div className="cp-resolution-icon"><CheckCircle2 size={18}/></div>
                  <div className="cp-resolution-copy">
                    <strong>{currentStatus === "closed" ? "Complaint closed" : "Complaint resolved"}</strong>
                    <p>{item.admin_response?.trim() || "This complaint has been marked complete. No response was recorded."}</p>
                  </div>
                </div>
                <div className="cp-item-footer">
                  <p className="cp-last-response"><ShieldCheck size={14}/><span>Completed {item.updated_at ? dateTime(item.updated_at) : "and saved"} · Read-only</span></p>
                  <button type="button" className="cp-reopen" disabled={busyId === item.id} onClick={() => {
                    setEditingCompleted((current) => ({ ...current, [item.id]: true }));
                    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "in_review" } : entry));
                  }}>
                    <RefreshCw size={14}/> Reopen / edit
                  </button>
                </div>
              </>
            )}
          </article>;
        })}</div> : <div className="cp-empty"><div className="cp-empty-icon"><Inbox size={24}/></div><h3>{items.length ? "No matching complaints" : "No complaints yet"}</h3><p>{items.length ? "Try changing your search or status filter." : "When a user submits a complaint, it will appear here for review and follow-up."}</p></div>}

      </section>

    </div>

  );

}
