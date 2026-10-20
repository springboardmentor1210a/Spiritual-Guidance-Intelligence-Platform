import { useEffect, useMemo, useState } from "react";

import {

  Activity,

  BarChart3,

  BookOpen,

  CalendarDays,

  CheckCircle2,

  ChevronRight,

  Clock3,

  Download,

  FileText,

  RefreshCw,

  Search,

  Sparkles,

  XCircle,

  Users,

  X,

} from "lucide-react";

import api from "../api/client";



const roleLabel = "Tarot Reader";



function formatDate(value) {

  if (!value) return "—";

  return new Date(value).toLocaleString([], {

    day: "2-digit",

    month: "short",

    year: "numeric",

    hour: "2-digit",

    minute: "2-digit",

  });

}



function shortDate(value) {

  if (!value) return "—";

  return new Date(value).toLocaleDateString([], {

    day: "2-digit",

    month: "short",

    year: "numeric",

  });

}



function MetricCard({ icon: Icon, label, value, note }) {

  return (

    <article className="tr-metric">

      <div className="tr-metric-icon"><Icon size={19} /></div>

      <div>

        <p>{label}</p>

        <strong>{value}</strong>

        <span>{note}</span>

      </div>

    </article>

  );

}



function Section({ title, subtitle, icon: Icon, children, action }) {

  return (

    <section className="tr-panel">

      <div className="tr-panel-head">

        <div>

          <div className="tr-eyebrow">

            {Icon && <Icon size={13} />}

            <span>READER WORKSPACE</span>

          </div>

          <h2>{title}</h2>

          {subtitle && <p>{subtitle}</p>}

        </div>

        {action}

      </div>

      {children}

    </section>

  );

}



function ReportModal({ report, onClose }) {

  if (!report) return null;



  const cards = Array.isArray(report.cards) ? report.cards : [];



  return (

    <div className="tr-modal-backdrop" onMouseDown={onClose}>

      <div className="tr-modal" onMouseDown={(event) => event.stopPropagation()}>

        <div className="tr-modal-head">

          <div>

            <p className="tr-eyebrow">SAVED TAROT REPORT</p>

            <h2>{report.title || "Tarot reading"}</h2>

            <p>{formatDate(report.created_at)}</p>

          </div>

          <button className="tr-icon-button" onClick={onClose} aria-label="Close">

            <X size={18} />

          </button>

        </div>



        <div className="tr-report-meta">

          <div><span>Reader client</span><strong>{report.user_name}</strong></div>

          <div><span>Spread</span><strong>{report.spread}</strong></div>

          <div><span>Question</span><strong>{report.question}</strong></div>

        </div>



        <div className="tr-card-strip">

          {cards.length ? cards.map((card, index) => {

            const name = typeof card === "object" ? card.card : card;

            const orientation =

              typeof card === "object" ? card.orientation : "upright";

            return (

              <div className="tr-card-chip" key={`${name}-${index}`}>

                <span>{index + 1}</span>

                <strong>{name}</strong>

                <small>{orientation || "upright"}</small>

              </div>

            );

          }) : (

            <p className="tr-empty">Card details were not stored in this report.</p>

          )}

        </div>



        <div className="tr-report-body">

          <p className="tr-eyebrow">AI INTERPRETATION</p>

          <div className="tr-report-text">{report.result_text || "No interpretation text was saved."}</div>

        </div>



        <div className="tr-modal-foot">

          <span>For reflective and cultural use only.</span>

          <button className="tr-secondary-button" onClick={onClose}>Close report</button>

        </div>

      </div>

    </div>

  );

}



export default function TarotReaderDashboard() {

  const [dashboard, setDashboard] = useState(null);

  const [reports, setReports] = useState([]);

  const [sessions, setSessions] = useState([]);

  const [sessionRequests, setSessionRequests] = useState([]);

  const [requestsLoading, setRequestsLoading] = useState(false);

  const [requestWorking, setRequestWorking] = useState(null);

  const [requestResponses, setRequestResponses] = useState({});

  const [search, setSearch] = useState("");

  const [spreadFilter, setSpreadFilter] = useState("");

  const [activeTab, setActiveTab] = useState("overview");

  const [selectedDayKey, setSelectedDayKey] = useState(null);

  const [selectedSpread, setSelectedSpread] = useState(null);

  const [selectedCard, setSelectedCard] = useState(null);

  const [selectedReport, setSelectedReport] = useState(null);

  const [loading, setLoading] = useState(true);

  const [reportsLoading, setReportsLoading] = useState(false);

  const [error, setError] = useState("");



  async function loadDashboard() {

    setLoading(true);

    setError("");



    try {

      const [dashboardResponse, sessionResponse] = await Promise.all([

        api.get("/api/tarot-reader/dashboard"),

        api.get("/api/tarot-reader/sessions"),

      ]);



      setDashboard(dashboardResponse.data);

      setSessions(sessionResponse.data.items || []);

      await loadSessionRequests();

    } catch (err) {

      setError(

        err.response?.data?.detail ||

          "Unable to load the Tarot Reader workspace."

      );

    } finally {

      setLoading(false);

    }

  }



  async function loadSessionRequests() {

    setRequestsLoading(true);

    try {

      const response = await api.get("/api/consultations/incoming");

      setSessionRequests(response.data?.items || []);

    } catch (err) {

      // Keep analytics and report management usable if the request endpoint is unavailable.

      setSessionRequests([]);

      setError(

        err.response?.data?.detail ||

          "Session requests could not be loaded. Check the consultations API."

      );

    } finally {

      setRequestsLoading(false);

    }

  }



  async function decideSessionRequest(requestId, status) {

    setRequestWorking(requestId);

    setError("");

    try {

      await api.post(`/api/consultations/${requestId}/decision`, {

        status,

        response_message: requestResponses[requestId]?.trim() || null,

      });

      await loadSessionRequests();

    } catch (err) {

      setError(

        err.response?.data?.detail ||

          "Could not update this session request. Please try again."

      );

    } finally {

      setRequestWorking(null);

    }

  }



  async function loadReports() {

    setReportsLoading(true);



    try {

      const params = new URLSearchParams();

      if (search.trim()) params.set("search", search.trim());

      if (spreadFilter) params.set("spread", spreadFilter);



      const response = await api.get(

        `/api/tarot-reader/reports?${params.toString()}`

      );



      setReports(response.data.items || []);

    } catch (err) {

      setError(

        err.response?.data?.detail ||

          "Unable to load tarot reports."

      );

    } finally {

      setReportsLoading(false);

    }

  }



  useEffect(() => {

    loadDashboard();

  }, []);



  useEffect(() => {

    const timer = setTimeout(() => {

      if (activeTab === "reports") loadReports();

    }, 250);



    return () => clearTimeout(timer);

  }, [search, spreadFilter, activeTab]);



  const metrics = dashboard?.metrics || {};

  const topCardsRaw = dashboard?.top_cards || [];

  const spreadMixRaw = dashboard?.spread_mix || [];

  const engagement = dashboard?.engagement || [];

  const recentReports = dashboard?.recent_reports || [];



  // Aggregate duplicate labels so each spread/card appears once even if the API

  // returns variants with different capitalization or whitespace.

  const spreadMix = Object.values(spreadMixRaw.reduce((acc, item) => {

    const label = String(item.spread || "Unknown spread").trim();

    const key = label.toLowerCase();

    if (!acc[key]) acc[key] = { spread: label, count: 0 };

    acc[key].count += Number(item.count || 0);

    return acc;

  }, {})).sort((a, b) => b.count - a.count);



  const topCards = Object.values(topCardsRaw.reduce((acc, item) => {

    const label = String(item.card || "Unknown card").trim();

    const key = label.toLowerCase();

    if (!acc[key]) acc[key] = { card: label, count: 0 };

    acc[key].count += Number(item.count || 0);

    return acc;

  }, {})).sort((a, b) => b.count - a.count).slice(0, 6);



  // Build a daily series from the existing session endpoint, which groups

  // saved readings by client and calendar day. No fabricated reading counts.

  const daysInRange = 14;

  const dailyCounts = sessions.reduce((acc, session) => {

    const rawDate = session.date || session.session_date || session.created_at;

    if (!rawDate) return acc;

    const date = new Date(rawDate);

    if (Number.isNaN(date.getTime())) return acc;

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    acc[key] = (acc[key] || 0) + Number(session.reading_count || 0);

    return acc;

  }, {});

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const dailyActivity = Array.from({ length: daysInRange }, (_, index) => {

    const date = new Date(today);

    date.setDate(today.getDate() - (daysInRange - 1 - index));

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    return {

      key,

      label: date.toLocaleDateString([], { weekday: "short" }),

      dateLabel: `${date.getDate()}${date.getDate() % 100 >= 11 && date.getDate() % 100 <= 13 ? "th" : ({1: "st", 2: "nd", 3: "rd"}[date.getDate() % 10] || "th")} ${date.toLocaleDateString([], { month: "short" })}`,

      readings: dailyCounts[key] || 0,

    };

  });

  const maxDaily = Math.max(1, ...dailyActivity.map((item) => item.readings));

  const selectedDay = dailyActivity.find((item) => item.key === selectedDayKey) || dailyActivity[dailyActivity.length - 1] || null;

  const dailyTotal = dailyActivity.reduce((sum, item) => sum + item.readings, 0);

  const peakDay = dailyActivity.reduce((best, item) => item.readings > (best?.readings ?? -1) ? item : best, null);

  const linePoints = dailyActivity.map((item, index) => ({

    ...item,

    x: dailyActivity.length <= 1 ? 500 : 28 + index * (944 / (dailyActivity.length - 1)),

    y: 214 - (item.readings / maxDaily) * 170,

  }));

  const linePath = linePoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  const areaPath = linePoints.length ? `${linePath} L ${linePoints[linePoints.length - 1].x} 222 L ${linePoints[0].x} 222 Z` : "";

  const spreadTotal = spreadMix.reduce((sum, item) => sum + item.count, 0);

  let spreadOffset = 0;

  const spreadSegments = spreadMix.map((item, index) => {

    const start = spreadOffset;

    const portion = spreadTotal ? item.count / spreadTotal * 100 : 0;

    spreadOffset += portion;

    return { ...item, start, end: spreadOffset, color: ["#805438", "#bd8b60", "#d9b994", "#8b9872", "#b86f58", "#d7c8b5"][index % 6] };

  });

  const maxCardCount = Math.max(1, ...topCards.map((item) => Number(item.count || 0)));



  const visibleReports = useMemo(() => reports, [reports]);



  async function exportReports() {

    try {

      const query = search.trim()

        ? `?search=${encodeURIComponent(search.trim())}`

        : "";



      const response = await api.get(

        `/api/tarot-reader/reports/export${query}`,

        { responseType: "blob" }

      );



      const blobUrl = URL.createObjectURL(response.data);

      const link = document.createElement("a");

      link.href = blobUrl;

      link.download = "tarot-reader-reports.csv";

      document.body.appendChild(link);

      link.click();

      link.remove();

      URL.revokeObjectURL(blobUrl);

    } catch (err) {

      setError(

        err.response?.data?.detail ||

          "Unable to export tarot reports."

      );

    }

  }



  if (loading) {

    return (

      <div className="tr-loading">

        <Sparkles size={20} />

        <strong>Preparing the Tarot Reader workspace...</strong>

      </div>

    );

  }



  return (

    <div className="tr-page">

      <style>{TAROT_READER_CSS}</style>



      <header className="tr-hero">

        <div>

          <div className="tr-hero-kicker">

            <span className="tr-live-dot" />

            TAROT READER · ROLE WORKSPACE

          </div>

          <h1>Tarot Reader Dashboard</h1>

          <p>

            Review tarot reading activity, follow client engagement,

            track sessions and manage saved tarot reports from one workspace.

          </p>

        </div>



        <div className="tr-hero-actions">

          <button

            className="tr-secondary-button"

            onClick={loadDashboard}

            disabled={loading}

          >

            <RefreshCw size={15} /> Refresh

          </button>

          <button className="tr-primary-button" onClick={() => setActiveTab("reports")}>

            <FileText size={15} /> Manage reports

          </button>

        </div>

      </header>



      {error && <div className="tr-alert">{error}</div>}



      <div className="tr-role-note">

        <Sparkles size={15} />

        <span>

          <strong>Tarot Reader workspace</strong>

          <span>

            Your dashboard is focused on reading analytics, user engagement,

            session tracking and report management.

          </span>

        </span>

      </div>



      <nav className="tr-tabs">

        <button

          className={activeTab === "overview" ? "active" : ""}

          onClick={() => setActiveTab("overview")}

        >

          <BarChart3 size={15} /> Overview

        </button>

        <button

          className={activeTab === "sessions" ? "active" : ""}

          onClick={() => setActiveTab("sessions")}

        >

          <CalendarDays size={15} /> Sessions

        </button>

        <button

          className={activeTab === "requests" ? "active" : ""}

          onClick={() => {

            setActiveTab("requests");

            loadSessionRequests();

          }}

        >

          <Users size={15} /> Session requests

          {sessionRequests.filter((request) => request.status === "pending").length > 0 && (

            <span className="tr-request-count">

              {sessionRequests.filter((request) => request.status === "pending").length}

            </span>

          )}

        </button>

        <button

          className={activeTab === "reports" ? "active" : ""}

          onClick={() => setActiveTab("reports")}

        >

          <FileText size={15} /> Report management

        </button>

      </nav>



      {activeTab === "overview" && (

        <>

          <section className="tr-metrics">

            <MetricCard

              icon={BookOpen}

              label="Tarot readings"

              value={metrics.total_tarot_readings ?? 0}

              note="All saved tarot sessions"

            />

            <MetricCard

              icon={Users}

              label="Clients reached"

              value={metrics.unique_users ?? 0}

              note="Unique users with tarot activity"

            />

            <MetricCard

              icon={Activity}

              label="This month"

              value={metrics.this_month ?? 0}

              note="Current calendar month"

            />

            <MetricCard

              icon={Clock3}

              label="Reading days"

              value={metrics.sessions ?? 0}

              note="Days with saved tarot activity"

            />

            <MetricCard

              icon={BarChart3}

              label="Avg. readings / client"

              value={metrics.average_readings_per_user ?? 0}

              note="Across saved tarot activity"

            />

          </section>



          <div className="tr-grid-main">

            <Section

              title="Daily reading activity"

              subtitle="Daily saved-reading counts for the last 14 consecutive calendar days through today. Days without readings are shown as zero."

              icon={Activity}

            >

              <div className="tr-chart-summary">

                <div className="tr-chart-total"><span>READINGS IN VIEW</span><strong>{dailyTotal}</strong><small><Activity size={12}/> Last 14 calendar days</small></div>

                <div className="tr-chart-insight"><span>BUSIEST DAY</span><strong>{peakDay?.dateLabel || "—"}</strong><small>{Number(peakDay?.readings || 0)} saved readings</small></div>

              </div>

              <div className="tr-line-chart-wrap">

                <div className="tr-line-y-labels"><span>{maxDaily}</span><span>{Math.round(maxDaily / 2)}</span><span>0</span></div>

                <svg className="tr-line-chart" viewBox="0 0 1000 240" preserveAspectRatio="none" role="img" aria-label="Daily readings over the last 14 consecutive calendar days">

                  <defs><linearGradient id="trDailyArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b47d53" stopOpacity=".28"/><stop offset="100%" stopColor="#b47d53" stopOpacity=".015"/></linearGradient></defs>

                  {[44, 130, 222].map((y) => <line key={y} x1="12" x2="988" y1={y} y2={y} className="tr-line-grid" />)}

                  <path d={areaPath} fill="url(#trDailyArea)" />

                  <path d={linePath} className="tr-line-path" />

                  {linePoints.map((point) => {

                    const active = (selectedDayKey || selectedDay?.key) === point.key;

                    return <g key={point.key} className="tr-line-point" role="button" tabIndex="0" aria-label={`${point.dateLabel}: ${point.readings} readings`} onClick={() => setSelectedDayKey(point.key)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedDayKey(point.key); } }}>

                      <text x={point.x} y={Math.max(16, point.y - 12)} textAnchor="middle" className="tr-line-value">{point.readings}</text>

                      <circle cx={point.x} cy={point.y} r={active ? 7 : 5} className={active ? "active" : ""} />

                    </g>;

                  })}

                </svg>

                <div className="tr-line-x-labels">{linePoints.map((point, index) => <button key={point.key} type="button" className={(selectedDayKey || selectedDay?.key) === point.key ? "active" : ""} onClick={() => setSelectedDayKey(point.key)}>{point.dateLabel}</button>)}</div>

              </div>

              <div className="tr-chart-detail" key={selectedDay?.key || "empty"}>

                <div className="tr-chart-detail-icon"><Sparkles size={16}/></div>

                <div><span>SELECTED DAY</span><strong>{selectedDay?.dateLabel || "No activity yet"}</strong><small>{Number(selectedDay?.readings || 0)} saved tarot reading{Number(selectedDay?.readings || 0) === 1 ? "" : "s"} recorded</small></div>

                <span className="tr-detail-pulse"><i/></span>

              </div>

            </Section>



            <Section

              title="Spread mix"

              subtitle="A different view of which spread formats are used most. Select a segment to inspect it."

              icon={LayersIcon}

            >

              {spreadSegments.length ? <div className="tr-spread-viz">

                <button type="button" className="tr-donut" style={{ background: `conic-gradient(${spreadSegments.map((item) => `${item.color} ${item.start}% ${item.end}%`).join(", ")})` }} aria-label="Spread mix donut chart">

                  <span><strong>{spreadTotal}</strong><small>READINGS</small></span>

                </button>

                <div className="tr-spread-legend">{spreadSegments.map((item) => <button type="button" key={item.spread} className={selectedSpread === item.spread ? "active" : ""} onClick={() => setSelectedSpread(item.spread)}>

                  <i style={{ background: item.color }}/><span><strong>{item.spread}</strong><small>{item.count} reading{item.count === 1 ? "" : "s"} · {spreadTotal ? Math.round(item.count / spreadTotal * 100) : 0}%</small></span>

                </button>)}</div>

                <div className="tr-spread-selected"><span>SELECTED SPREAD</span><strong>{(spreadSegments.find((item) => item.spread === selectedSpread) || spreadSegments[0]).spread}</strong><small>{(spreadSegments.find((item) => item.spread === selectedSpread) || spreadSegments[0]).count} saved reading(s)</small></div>

              </div> : <p className="tr-empty">No tarot readings yet.</p>}

            </Section>

          </div>



          <div className="tr-grid-main">

            <Section

              title="Most selected cards"

              subtitle="Card picks shown as individual tarot-style tiles, ranked by saved selections."

              icon={Sparkles}

            >

              <div className="tr-card-wall">

                {topCards.length ? topCards.map((item, index) => (

                  <button type="button" className={`tr-mini-tarot ${selectedCard === item.card ? "active" : ""}`} key={item.card} onClick={() => setSelectedCard(item.card)} aria-pressed={selectedCard === item.card}>

                    <span className="tr-mini-tarot-number">{String(index + 1).padStart(2, "0")}</span>

                    <span className="tr-mini-tarot-symbol">{["☼", "☾", "✧", "♧", "◇", "✦"][index % 6]}</span>

                    <strong>{item.card}</strong>

                    <small>{item.count} selection{item.count === 1 ? "" : "s"}</small>

                    <span className="tr-mini-tarot-meter"><i style={{ width: `${(Number(item.count || 0) / maxCardCount) * 100}%` }}/></span>

                  </button>

                )) : <p className="tr-empty">No card selection data yet.</p>}

                {topCards.length > 0 && <div className="tr-card-selected"><span>SPOTLIGHT CARD</span><strong>{(topCards.find((item) => item.card === selectedCard) || topCards[0]).card}</strong><small>{(topCards.find((item) => item.card === selectedCard) || topCards[0]).count} saved selection(s)</small></div>}

              </div>

            </Section>



            <Section

              title="Client engagement"

              subtitle="Clients with the strongest saved tarot activity."

              icon={Users}

              action={

                <button className="tr-inline-button" onClick={() => setActiveTab("reports")}>

                  View reports <ChevronRight size={14} />

                </button>

              }

            >

              <div className="tr-engagement-list">

                {engagement.length ? engagement.map((item) => (

                  <div className="tr-engagement-row" key={item.user_id}>

                    <div className="tr-avatar">{item.user_name?.charAt(0)?.toUpperCase() || "U"}</div>

                    <div>

                      <strong>{item.user_name}</strong>

                      <span>{item.user_email}</span>

                    </div>

                    <div className="tr-engagement-count">

                      <strong>{item.reading_count}</strong>

                      <span>readings</span>

                    </div>

                    <div className="tr-last">

                      <span>Last activity</span>

                      <strong>{shortDate(item.last_reading)}</strong>

                    </div>

                  </div>

                )) : <p className="tr-empty">No client activity yet.</p>}

              </div>

            </Section>

          </div>



          <Section

            title="Latest tarot reports"

            subtitle="Most recent saved reports available to the Tarot Reader."

            icon={FileText}

            action={

              <button className="tr-inline-button" onClick={() => setActiveTab("reports")}>

                Manage all <ChevronRight size={14} />

              </button>

            }

          >

            <div className="tr-table-wrap">

              <table className="tr-table">

                <thead>

                  <tr>

                    <th>Client</th>

                    <th>Spread</th>

                    <th>Question</th>

                    <th>Cards</th>

                    <th>Created</th>

                    <th />

                  </tr>

                </thead>

                <tbody>

                  {recentReports.length ? recentReports.map((report) => (

                    <tr key={report.id}>

                      <td>

                        <strong>{report.user_name}</strong>

                        <span>{report.user_email}</span>

                      </td>

                      <td>{report.spread}</td>

                      <td className="tr-question">{report.question}</td>

                      <td>{report.cards?.length || 0}</td>

                      <td>{formatDate(report.created_at)}</td>

                      <td>

                        <button

                          className="tr-view-button"

                          onClick={() => setSelectedReport(report)}

                        >

                          View

                        </button>

                      </td>

                    </tr>

                  )) : (

                    <tr><td colSpan="6" className="tr-empty-cell">No saved tarot reports yet.</td></tr>

                  )}

                </tbody>

              </table>

            </div>

          </Section>

        </>

      )}



      {activeTab === "sessions" && (

        <Section

          title="Tarot reading activity tracking"

          subtitle="This activity log groups saved tarot readings by client and calendar day. It tracks app usage—not appointment duration or live consultation time."

          icon={CalendarDays}

        >

          <div className="tr-session-grid">

            {sessions.length ? sessions.map((session) => (

              <article className="tr-session-card" key={session.session_key}>

                <div className="tr-session-top">

                  <div className="tr-avatar">{session.user_name?.charAt(0)?.toUpperCase() || "U"}</div>

                  <div>

                    <strong>{session.user_name}</strong>

                    <span>{session.user_email}</span>

                  </div>

                </div>

                <div className="tr-session-date">

                  <CalendarDays size={15} />

                  {shortDate(session.date)}

                </div>

                <div className="tr-session-stat">

                  <strong>{session.reading_count}</strong>

                  <span>tarot reading{session.reading_count === 1 ? "" : "s"} in this session</span>

                </div>

                <div className="tr-session-items">

                  {session.readings.slice(0, 3).map((reading) => (

                    <div key={reading.id}>

                      <span>{formatDate(reading.created_at)}</span>

                      <strong>{reading.spread}</strong>

                    </div>

                  ))}

                </div>

              </article>

            )) : (

              <div className="tr-empty-box">No tarot sessions have been recorded yet.</div>

            )}

          </div>

        </Section>

      )}



      {activeTab === "requests" && (

        <Section

          title="Incoming session requests"

          subtitle="These are actual consultation requests sent by users. Accept or reject pending requests, then mark accepted sessions In Progress and Completed."

          icon={CalendarDays}

          action={

            <button className="tr-secondary-button" onClick={loadSessionRequests} disabled={requestsLoading}>

              <RefreshCw size={15} /> Refresh requests

            </button>

          }

        >

          {requestsLoading ? (

            <div className="tr-inline-loading"><RefreshCw size={16} /> Loading session requests...</div>

          ) : sessionRequests.length ? (

            <div className="tr-request-list">

              {sessionRequests.map((request) => (

                <article className="tr-request-card" key={request.id}>

                  <div className="tr-request-heading">

                    <div className="tr-avatar">

                      {request.user_name?.charAt(0)?.toUpperCase() || "U"}

                    </div>

                    <div className="tr-request-person">

                      <strong>{request.user_name || "Platform user"}</strong>

                      <span>{request.user_email || "Email not available"}</span>

                    </div>

                    <span className={`tr-request-status ${String(request.status || "pending").toLowerCase()}`}>

                      {String(request.status || "pending").replaceAll("_", " ")}

                    </span>

                  </div>

                  <h3>{request.topic || "Tarot consultation request"}</h3>

                  <p className="tr-request-message">{request.message || "No additional details were provided."}</p>

                  <div className="tr-request-meta">

                    <span><CalendarDays size={13} /> Requested: {formatDate(request.created_at)}</span>

                    {request.preferred_time && (

                      <span><Clock3 size={13} /> Preferred time: {formatDate(request.preferred_time)}</span>

                    )}

                    {request.reading_type && (

                      <span>Reading context: {request.reading_type === "palm" ? "Palm" : "Tarot"}</span>

                    )}

                  </div>

                  {request.response_message && (
                    <div className="tr-request-response">
                      <strong>Previous response</strong>
                      <p>{request.response_message}</p>
                    </div>
                  )}

                  {request.meet_link && (
                    <a
                      className="tr-consultation-meet-link"
                      href={request.meet_link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <CalendarDays size={15} /> Join Google Meet <ChevronRight size={14} />
                    </a>
                  )}

                  <label className="tr-response-field">
                    {request.status === "pending" ? "Response / decline reason" : "Message to client (optional)"}
                    <textarea
                      rows="3"
                      value={requestResponses[request.id] ?? request.response_message ?? ""}
                      onChange={(event) => setRequestResponses((current) => ({
                        ...current,
                        [request.id]: event.target.value,
                      }))}
                      placeholder={request.status === "pending"
                        ? "Add a message, or explain why this time is unavailable..."
                        : "Optional update for the client..."}
                    />
                  </label>

                  <div className="tr-request-actions">

                    {request.status === "pending" ? (

                      <>

                        <button

                          className="tr-accept-button"

                          disabled={requestWorking === request.id}

                          onClick={() => decideSessionRequest(request.id, "accepted")}

                        >

                          <CheckCircle2 size={15} /> {requestWorking === request.id ? "Saving..." : "Accept & create Meet"}

                        </button>

                        <button

                          className="tr-reject-button"

                          disabled={requestWorking === request.id}

                          onClick={() => decideSessionRequest(request.id, "rejected")}

                        >

                          <XCircle size={15} /> Reject request

                        </button>

                      </>

                    ) : request.status === "accepted" ? (

                      <button

                        className="tr-secondary-button"

                        disabled={requestWorking === request.id}

                        onClick={() => decideSessionRequest(request.id, "in_progress")}

                      >

                        Mark session in progress

                      </button>

                    ) : request.status === "in_progress" ? (

                      <button

                        className="tr-secondary-button"

                        disabled={requestWorking === request.id}

                        onClick={() => decideSessionRequest(request.id, "completed")}

                      >

                        Mark session completed

                      </button>

                    ) : (

                      <span className="tr-request-final">This request has been {request.status === "rejected" ? "rejected" : "completed"}.</span>

                    )}

                  </div>

                </article>

              ))}

            </div>

          ) : (

            <div className="tr-empty-box">No incoming session requests yet. New requests from users will appear here.</div>

          )}

        </Section>

      )}



      {activeTab === "reports" && (

        <Section

          title="Report management"

          subtitle="Search, inspect and export saved tarot reports."

          icon={FileText}

          action={

            <button className="tr-secondary-button" onClick={exportReports}>

              <Download size={15} /> Export CSV

            </button>

          }

        >

          <div className="tr-report-filters">

            <label>

              <Search size={15} />

              <input

                value={search}

                onChange={(event) => setSearch(event.target.value)}

                placeholder="Search client, question or card..."

              />

            </label>



            <select value={spreadFilter} onChange={(event) => setSpreadFilter(event.target.value)}>

              <option value="">All spreads</option>

              {(dashboard?.spread_mix || []).map((item) => (

                <option key={item.spread} value={item.spread}>{item.spread}</option>

              ))}

            </select>

          </div>



          {reportsLoading ? (

            <div className="tr-inline-loading"><RefreshCw size={16} /> Loading reports...</div>

          ) : (

            <div className="tr-table-wrap">

              <table className="tr-table">

                <thead>

                  <tr>

                    <th>Client</th>

                    <th>Spread</th>

                    <th>Question</th>

                    <th>Cards</th>

                    <th>Created</th>

                    <th />

                  </tr>

                </thead>

                <tbody>

                  {visibleReports.length ? visibleReports.map((report) => (

                    <tr key={report.id}>

                      <td>

                        <strong>{report.user_name}</strong>

                        <span>{report.user_email}</span>

                      </td>

                      <td>{report.spread}</td>

                      <td className="tr-question">{report.question}</td>

                      <td>{report.cards?.length || 0}</td>

                      <td>{formatDate(report.created_at)}</td>

                      <td>

                        <button

                          className="tr-view-button"

                          onClick={() => setSelectedReport(report)}

                        >

                          Open report

                        </button>

                      </td>

                    </tr>

                  )) : (

                    <tr><td colSpan="6" className="tr-empty-cell">No reports match your filters.</td></tr>

                  )}

                </tbody>

              </table>

            </div>

          )}

        </Section>

      )}



      <div className="tr-disclaimer">

        <Sparkles size={14} />

        <span>

          Tarot readings are presented for reflection and cultural/spiritual exploration.

          Dashboard analytics describe saved platform activity and do not make claims about future events.

        </span>

      </div>



      <ReportModal

        report={selectedReport}

        onClose={() => setSelectedReport(null)}

      />

    </div>

  );

}



function LayersIcon({ size = 18 }) {

  return (

    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">

      <path d="m12 3 8 4-8 4-8-4 8-4Z" />

      <path d="m4 12 8 4 8-4" />

      <path d="m4 17 8 4 8-4" />

    </svg>

  );

}



const TAROT_READER_CSS = `



.tr-line-chart-wrap{position:relative;padding:18px 18px 5px 35px;height:260px}.tr-line-y-labels{position:absolute;left:20px;top:25px;bottom:48px;display:flex;flex-direction:column;justify-content:space-between;color:#a0846d;font-size:9px}.tr-line-chart{width:100%;height:210px;overflow:visible;display:block}.tr-line-grid{stroke:#eadbc9;stroke-width:1.2;stroke-dasharray:7 11}.tr-line-path{fill:none;stroke:#795038;stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:2600;stroke-dashoffset:2600;animation:trLineDraw 1.25s ease forwards;filter:drop-shadow(0 2px 1px rgba(95,63,42,.08))}.tr-line-point{cursor:pointer;outline:none}.tr-line-value{font-size:13px;fill:#765039;font-weight:800;pointer-events:none;opacity:0;animation:trValueFade .5s ease .7s forwards}.tr-line-point circle{transform-box:fill-box;transform-origin:center;animation:trPointPop .45s cubic-bezier(.2,.8,.2,1) both}.tr-line-point:nth-of-type(2n) circle{animation-delay:.04s}.tr-line-point:nth-of-type(3n) circle{animation-delay:.08s}.tr-line-point circle{fill:#fffaf4;stroke:#795038;stroke-width:3.5;transition:r .2s,fill .2s,stroke .2s}.tr-line-point circle.active,.tr-line-point:hover circle{fill:#795038;stroke:#fffaf4;stroke-width:2.5}.tr-line-point:focus-visible circle{stroke:#9b6b49;stroke-width:5}.tr-line-x-labels{display:flex;justify-content:space-between;gap:2px;margin-top:5px}.tr-line-x-labels button{border:0;background:transparent;color:#a0846d;font-size:8px;padding:4px 1px;cursor:pointer;min-width:0}.tr-line-x-labels button.active{color:#68422c;font-weight:900;text-decoration:underline;text-underline-offset:3px}.tr-spread-viz{padding:17px 19px 19px;display:grid;grid-template-columns:145px 1fr;gap:12px 17px;align-items:center}.tr-donut{width:137px;height:137px;border:0;border-radius:50%;display:grid;place-items:center;position:relative;cursor:pointer;box-shadow:0 8px 20px #7b573015;transition:transform .25s}.tr-donut:hover{transform:rotate(-5deg) scale(1.025)}.tr-donut:before{content:"";position:absolute;inset:24px;border-radius:50%;background:#fffaf4;border:1px solid #eadbc9}.tr-donut>span{position:relative;z-index:1;display:grid;gap:3px;text-align:center}.tr-donut strong{font:700 24px Georgia,serif;color:#543522}.tr-donut small{font-size:7px;letter-spacing:.12em;color:#a07b5d;font-weight:900}.tr-spread-legend{display:grid;gap:6px;max-height:170px;overflow:auto}.tr-spread-legend button{display:flex;align-items:center;gap:8px;text-align:left;padding:6px;border:1px solid transparent;border-radius:8px;background:transparent;cursor:pointer;min-width:0}.tr-spread-legend button.active,.tr-spread-legend button:hover{background:#f8eee2;border-color:#ead9c6}.tr-spread-legend button>i{width:9px;height:9px;border-radius:3px;flex:none}.tr-spread-legend button span{min-width:0}.tr-spread-legend strong{display:block;font-size:10px;color:#62422f;overflow-wrap:anywhere}.tr-spread-legend small{display:block;font-size:8px;color:#a0846d;margin-top:2px}.tr-spread-selected{grid-column:1/-1;display:grid;gap:4px;padding:10px 12px;background:#f8efe5;border:1px solid #ead9c6;border-radius:10px}.tr-spread-selected span,.tr-card-selected>span{font-size:8px;font-weight:900;letter-spacing:.12em;color:#a07b5d}.tr-spread-selected strong,.tr-card-selected strong{font:700 15px Georgia,serif;color:#5d3c28}.tr-spread-selected small,.tr-card-selected small{font-size:9px;color:#9c7d65}.tr-card-wall{padding:17px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.tr-mini-tarot{min-height:157px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;padding:11px 8px;border:1px solid #d9c2a7;border-radius:11px;background:linear-gradient(160deg,#fffaf2,#f1e1ce);color:#65432f;cursor:pointer;position:relative;overflow:hidden;transition:transform .2s,box-shadow .2s,border-color .2s}.tr-mini-tarot:before{content:"";position:absolute;inset:5px;border:1px solid #dfc9af;border-radius:7px;pointer-events:none}.tr-mini-tarot:hover,.tr-mini-tarot.active{transform:translateY(-3px);box-shadow:0 9px 17px #65432f18;border-color:#986b48}.tr-mini-tarot.active{background:linear-gradient(160deg,#f7e5cd,#dfbd96)}.tr-mini-tarot-number{position:absolute;top:11px;left:13px;font-size:8px;color:#a0846d;font-weight:900}.tr-mini-tarot-symbol{font-size:29px;line-height:1;color:#956641;text-shadow:0 2px #fff8ef}.tr-mini-tarot strong{font:700 11px Georgia,serif;line-height:1.25;z-index:1;overflow-wrap:anywhere}.tr-mini-tarot small{font-size:8px;color:#9c7d65}.tr-mini-tarot-meter{width:75%;height:3px;border-radius:9px;background:#e6d4bf;overflow:hidden}.tr-mini-tarot-meter i{display:block;height:100%;background:#9b6b49;border-radius:9px}.tr-card-selected{grid-column:1/-1;display:grid;gap:4px;padding:10px 12px;border:1px solid #ead9c6;border-radius:10px;background:#fffdf9}.tr-card-selected strong{font-size:16px}

@keyframes trLineDraw{to{stroke-dashoffset:0}}@keyframes trValueFade{to{opacity:1}}@keyframes trPointPop{from{transform:scale(.25);opacity:.25}to{transform:scale(1);opacity:1}}

@media(max-width:520px){.tr-spread-viz{grid-template-columns:1fr;justify-items:center}.tr-spread-legend{width:100%;max-height:none}.tr-spread-selected{width:100%;box-sizing:border-box}.tr-card-wall{grid-template-columns:repeat(2,minmax(0,1fr));padding:12px}.tr-line-chart-wrap{padding-left:31px;padding-right:10px;height:225px}.tr-line-chart{height:175px}.tr-line-x-labels button{font-size:7px}}

.tr-page{max-width:1320px;margin:0 auto;padding:38px 28px 70px;color:#4f3325}

.tr-hero{display:flex;justify-content:space-between;gap:28px;align-items:flex-end;margin-bottom:22px}

.tr-hero-kicker,.tr-eyebrow{display:flex;align-items:center;gap:7px;color:#997457;font-size:10px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}

.tr-live-dot{width:7px;height:7px;border-radius:50%;background:#6f8c62;box-shadow:0 0 0 4px #e8efdf}

.tr-hero h1{font-family:Georgia,serif;font-size:42px;line-height:1.05;margin:10px 0 9px;color:#4a2e20}

.tr-hero p{max-width:720px;margin:0;color:#8b6d57;line-height:1.65}

.tr-hero-actions{display:flex;gap:9px;flex-wrap:wrap}

.tr-primary-button,.tr-secondary-button,.tr-inline-button,.tr-view-button,.tr-icon-button{font:inherit;cursor:pointer}

.tr-primary-button,.tr-secondary-button{border-radius:10px;padding:11px 14px;font-size:12px;font-weight:800;display:inline-flex;align-items:center;gap:7px}

.tr-primary-button{border:1px solid #75492f;background:#75492f;color:#fffaf4}

.tr-secondary-button{border:1px solid #d8c5ad;background:#fffaf3;color:#68452f}

.tr-primary-button:hover{filter:brightness(.97)}

.tr-secondary-button:hover{background:#f7eee2}

.tr-role-note{display:flex;gap:10px;align-items:flex-start;padding:13px 15px;border:1px solid #ddccb7;background:#fbf5ec;border-radius:12px;margin-bottom:18px;color:#795a43}

.tr-role-note>span{display:grid;gap:2px}

.tr-role-note strong{font-size:12px;color:#5e3d2b}

.tr-role-note span span{font-size:11px}

.tr-tabs{display:flex;gap:6px;border-bottom:1px solid #dfcfbc;margin-bottom:20px}

.tr-tabs button{border:0;background:transparent;padding:12px 15px;color:#95745c;font-weight:800;font-size:11px;display:flex;align-items:center;gap:7px;cursor:pointer;border-bottom:2px solid transparent}

.tr-tabs button.active{color:#68422c;border-bottom-color:#8a5a39}

.tr-metrics{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:14px}

.tr-metric{border:1px solid #dfccb4;background:#fffaf4;border-radius:14px;padding:15px;display:flex;gap:12px;min-height:112px}

.tr-metric-icon{width:38px;height:38px;border-radius:11px;background:#f1e4d4;color:#805638;display:grid;place-items:center;flex:none}

.tr-metric p{margin:0 0 3px;color:#98765c;font-size:9px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}

.tr-metric strong{display:block;font:700 27px Georgia,serif;color:#4e3021}

.tr-metric span{display:block;color:#a0846d;font-size:9px;margin-top:3px}

.tr-grid-main{display:grid;grid-template-columns:1.25fr .95fr;gap:14px;margin-bottom:14px}

.tr-panel{border:1px solid #dfccb4;background:#fffaf4;border-radius:16px;overflow:hidden;margin-bottom:14px}

.tr-panel-head{display:flex;justify-content:space-between;gap:15px;padding:18px 20px;border-bottom:1px solid #eadbc9}

.tr-panel-head h2{font:700 22px Georgia,serif;margin:7px 0 4px;color:#4d3022}

.tr-panel-head p{font-size:10px;color:#9a7a63;margin:0;line-height:1.5}

.tr-chart-switch{display:flex;gap:3px;padding:3px;border:1px solid #e3d1bd;border-radius:10px;background:#f8efe5;flex:none}.tr-chart-switch button{border:0;border-radius:7px;padding:7px 9px;background:transparent;color:#98775e;font:800 9px inherit;cursor:pointer}.tr-chart-switch button.active{background:#795038;color:#fff8f0;box-shadow:0 3px 8px rgba(86,54,33,.15)}

.tr-chart-summary{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:15px 20px 0}.tr-chart-total,.tr-chart-insight{display:flex;flex-direction:column;align-items:flex-start;padding:13px 15px;border:1px solid #ead9c6;border-radius:12px;background:linear-gradient(135deg,#fffaf3,#f8eee2);animation:trRiseIn .45s ease both}.tr-chart-total>span,.tr-chart-insight>span,.tr-chart-detail>div:nth-child(2)>span{font-size:8px;letter-spacing:.12em;font-weight:900;color:#a07b5d}.tr-chart-total strong{font:700 29px Georgia,serif;color:#543522;margin-top:3px}.tr-chart-insight strong{font:700 19px Georgia,serif;color:#6f4a31;margin-top:8px}.tr-chart-total small,.tr-chart-insight small{display:flex;align-items:center;gap:5px;color:#9d8067;font-size:9px;margin-top:4px}

.tr-chart-animated{height:245px;align-items:stretch;padding-top:19px;padding-bottom:15px}.tr-bar-column{appearance:none;border:0;background:transparent;padding:0 4px 4px;cursor:pointer;transition:transform .2s ease;position:relative;flex:1;max-width:85px}.tr-bar-column:hover,.tr-bar-column.selected{transform:translateY(-4px)}.tr-bar-column strong{font-size:11px;transition:color .2s}.tr-bar-column.selected strong{color:#b0784d}.tr-bar-track{height:155px;width:min(100%,43px);border:1px solid #efe2d3;box-shadow:inset 0 1px 3px rgba(95,63,42,.035);transition:background .2s}.tr-bar-column.selected .tr-bar-track{background:#e9d7c2;border-color:#d3b494}.tr-bar{display:block;transition:height .7s cubic-bezier(.2,.8,.2,1),filter .2s;background:linear-gradient(180deg,#c49366 0%,#895a3c 100%);box-shadow:0 4px 12px rgba(112,73,46,.12);animation:trBarGrow .85s cubic-bezier(.2,.8,.2,1) both;transform-origin:bottom}.tr-bar-column.selected .tr-bar{background:linear-gradient(180deg,#d8ac7e,#70442c);filter:saturate(1.15)}.tr-bar-label{font-size:9px;color:#9a7b63;font-weight:800}.tr-chart-detail{display:flex;align-items:center;gap:11px;margin:0 20px 17px;padding:12px 14px;border:1px solid #e5d2bd;border-radius:11px;background:#fffdf9;animation:trRiseIn .28s ease both}.tr-chart-detail-icon{width:32px;height:32px;display:grid;place-items:center;flex:none;border-radius:9px;background:#f1e1ce;color:#835638}.tr-chart-detail>div:nth-child(2){display:grid;gap:3px;min-width:0}.tr-chart-detail>div:nth-child(2)>strong{font:700 15px Georgia,serif;color:#5d3c28}.tr-chart-detail>div:nth-child(2)>small{font-size:9px;color:#9c7d65}.tr-detail-pulse{margin-left:auto;width:9px;height:9px;border-radius:50%;background:#81956a;box-shadow:0 0 0 5px #edf1e6;flex:none;animation:trPulse 1.8s ease-in-out infinite}

@keyframes trBarGrow{from{transform:scaleY(.08);opacity:.35}to{transform:scaleY(1);opacity:1}}@keyframes trRiseIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}@keyframes trPulse{0%,100%{box-shadow:0 0 0 4px #edf1e6}50%{box-shadow:0 0 0 7px #edf1e6}}@media(prefers-reduced-motion:reduce){.tr-bar,.tr-chart-detail,.tr-chart-total,.tr-chart-insight,.tr-detail-pulse{animation:none!important;transition:none!important}}

.tr-chart{height:270px;padding:20px 30px 18px;display:flex;align-items:flex-end;justify-content:space-around;gap:18px}

.tr-bar-column{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;min-width:48px;gap:6px}

.tr-bar-column strong{font-size:10px;color:#805637}

.tr-bar-track{height:185px;width:42px;background:#f0e5d7;border-radius:9px;display:flex;align-items:flex-end;overflow:hidden}

.tr-bar{width:100%;background:#9a6847;border-radius:8px 8px 3px 3px;min-height:4px}

.tr-bar-column>span{font-size:9px;color:#9a7b63;font-weight:800}

.tr-ranking{padding:16px 20px 20px}

.tr-rank-row{display:grid;grid-template-columns:1fr 38%;gap:15px;align-items:center;padding:11px 0;border-bottom:1px solid #eee1d3}

.tr-rank-row:last-child{border-bottom:0}

.tr-rank-row>div:first-child{min-width:0}

.tr-rank-row strong{display:block;font-size:12px;color:#62422f}

.tr-rank-row span{display:block;font-size:9px;color:#a0836c;margin-top:3px}

.tr-rank-track{height:7px;background:#eee2d4;border-radius:99px;overflow:hidden}

.tr-rank-track span{height:100%;display:block;background:#a06d4a;border-radius:99px}

.tr-rank-number{display:inline-grid!important;place-items:center;width:20px;height:20px;border-radius:50%;background:#efe1d0;color:#785238;margin:0 7px 0 0!important}

.tr-engagement-list{padding:7px 20px 13px}

.tr-engagement-row{display:grid;grid-template-columns:38px 1fr auto auto;gap:11px;align-items:center;padding:11px 0;border-bottom:1px solid #eee1d3}

.tr-engagement-row:last-child{border-bottom:0}

.tr-avatar{width:34px;height:34px;border-radius:10px;background:#eadbc8;color:#765037;display:grid;place-items:center;font-weight:900;font-size:12px}

.tr-engagement-row>div:nth-child(2){min-width:0}

.tr-engagement-row strong{display:block;font-size:11px;color:#5e3d2b}

.tr-engagement-row span{display:block;font-size:9px;color:#a0846d;margin-top:2px}

.tr-engagement-count{text-align:right}

.tr-engagement-count strong{font:700 17px Georgia,serif}

.tr-last{text-align:right}

.tr-table-wrap{overflow:auto}

.tr-table{width:100%;border-collapse:collapse;min-width:780px}

.tr-table th{background:#fbf4ea;color:#96755c;font-size:8px;letter-spacing:.11em;text-transform:uppercase;text-align:left;padding:10px 15px;border-bottom:1px solid #e5d5c2}

.tr-table td{padding:12px 15px;border-bottom:1px solid #eee1d3;color:#75563f;font-size:10px;vertical-align:middle}

.tr-table tbody tr:last-child td{border-bottom:0}

.tr-table td strong{display:block;color:#5b3a29;font-size:11px}

.tr-table td span{display:block;color:#a0846d;font-size:8px;margin-top:3px}

.tr-question{max-width:260px}

.tr-view-button{border:1px solid #dac5ac;background:#fffaf4;color:#70492f;border-radius:8px;padding:7px 9px;font-size:9px;font-weight:800}

.tr-view-button:hover{background:#f5ebde}

.tr-inline-button{border:0;background:transparent;color:#805638;font-size:10px;font-weight:900;display:flex;align-items:center;gap:4px}

.tr-empty,.tr-empty-cell{color:#a48770!important;text-align:center;padding:28px!important;font-size:11px!important}

.tr-session-grid{padding:17px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px}

.tr-session-card{border:1px solid #e2d2bf;background:#fffdf9;border-radius:12px;padding:15px}

.tr-session-top{display:flex;gap:10px;align-items:center}

.tr-session-top strong{display:block;font-size:11px;color:#5d3c2b}

.tr-session-top span{display:block;color:#a0846d;font-size:8px;margin-top:2px}

.tr-session-date{display:flex;gap:7px;align-items:center;color:#79583f;font-size:10px;font-weight:800;margin:15px 0 10px;padding:8px;background:#f7eee3;border-radius:8px}

.tr-session-stat{display:flex;align-items:baseline;gap:7px}

.tr-session-stat strong{font:700 25px Georgia,serif;color:#563624}

.tr-session-stat span{font-size:9px;color:#9b7c65}

.tr-session-items{margin-top:12px;display:grid;gap:6px}

.tr-session-items div{display:flex;justify-content:space-between;gap:8px;font-size:8px;color:#a0846d;padding-top:6px;border-top:1px solid #eee1d3}

.tr-session-items strong{color:#72523b}

.tr-report-filters{display:flex;gap:9px;padding:15px 18px;border-bottom:1px solid #eadbc9}

.tr-report-filters label{flex:1;display:flex;align-items:center;gap:7px;border:1px solid #dcc9b3;background:#fffdf9;border-radius:9px;padding:0 10px;color:#a18168}

.tr-report-filters input{border:0;outline:0;background:transparent;width:100%;padding:10px 2px;font:inherit;font-size:10px;color:#62422f}

.tr-report-filters select{border:1px solid #dcc9b3;background:#fffdf9;color:#68452f;border-radius:9px;padding:9px 11px;font-size:10px}

.tr-inline-loading{display:flex;gap:7px;justify-content:center;align-items:center;padding:30px;color:#8f7159;font-size:10px}

.tr-disclaimer{display:flex;gap:9px;align-items:flex-start;border:1px solid #dfcfbc;background:#fbf5ec;border-radius:11px;padding:12px 14px;color:#9a7c65;font-size:9px;line-height:1.55}

.tr-modal-backdrop{position:fixed;inset:0;background:rgba(56,38,27,.45);display:flex;align-items:center;justify-content:center;padding:20px;z-index:1000}

.tr-modal{width:min(920px,100%);max-height:90vh;overflow:auto;background:#fffaf4;border:1px solid #ddc8ad;border-radius:18px;box-shadow:0 25px 80px rgba(56,38,27,.25)}

.tr-modal-head{display:flex;justify-content:space-between;gap:15px;padding:20px 22px;border-bottom:1px solid #e6d7c5}

.tr-modal-head h2{font:700 24px Georgia,serif;margin:7px 0 4px;color:#4e3021}

.tr-modal-head p:last-child{margin:0;color:#9a7b63;font-size:9px}

.tr-icon-button{border:1px solid #ddc9b3;background:#fffdf9;color:#755037;border-radius:9px;width:34px;height:34px;display:grid;place-items:center}

.tr-report-meta{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:15px 22px;background:#fbf3e9}

.tr-report-meta div{border:1px solid #e2d2bf;background:#fffdf9;border-radius:9px;padding:10px}

.tr-report-meta span{display:block;color:#a0836c;font-size:8px;text-transform:uppercase;font-weight:900;letter-spacing:.08em}

.tr-report-meta strong{display:block;color:#65432f;font-size:10px;margin-top:5px}

.tr-card-strip{display:flex;gap:8px;flex-wrap:wrap;padding:16px 22px;border-bottom:1px solid #eadbc9}

.tr-card-chip{border:1px solid #ddc9b3;background:#fffdf9;border-radius:10px;padding:9px 11px;min-width:130px}

.tr-card-chip span{display:inline-grid;place-items:center;width:19px;height:19px;border-radius:50%;background:#efe1d0;color:#765037;font-size:8px;font-weight:900;margin-right:6px}

.tr-card-chip strong{font-size:10px;color:#60402d}

.tr-card-chip small{display:block;margin:6px 0 0 25px;color:#a08068;font-size:8px;text-transform:capitalize}

.tr-report-body{padding:20px 22px}

.tr-report-text{white-space:pre-wrap;color:#674a36;font-size:11px;line-height:1.75;margin-top:8px}

.tr-modal-foot{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:14px 22px;border-top:1px solid #eadbc9;color:#9b7b64;font-size:9px}

.tr-loading{min-height:55vh;display:grid;place-items:center;align-content:center;gap:8px;color:#8a684f;font-size:12px}

.tr-alert{border:1px solid #e1b6a9;background:#fff2ee;color:#9b503f;border-radius:10px;padding:11px 13px;margin-bottom:15px;font-size:10px}

.tr-empty-box{grid-column:1/-1;text-align:center;padding:45px;color:#9a7c65;font-size:11px}

.tr-request-count{display:inline-grid;place-items:center;min-width:18px;height:18px;padding:0 5px;border-radius:99px;background:#8b5b3b;color:#fffaf4;font-size:9px}

.tr-request-list{display:grid;gap:12px;padding:16px}

.tr-request-card{border:1px solid #e2d2bf;background:#fffdf9;border-radius:13px;padding:16px}

.tr-request-heading{display:flex;align-items:center;gap:10px}

.tr-request-person{flex:1;min-width:0}

.tr-request-person strong{display:block;font-size:12px;color:#5d3c2b}

.tr-request-person span{display:block;font-size:9px;color:#a0846d;margin-top:3px;overflow-wrap:anywhere}

.tr-request-status{padding:6px 9px;border-radius:99px;font-size:9px;font-weight:900;text-transform:capitalize;background:#f2e7d9;color:#79583f}

.tr-request-status.pending{background:#fff0d9;color:#986222}

.tr-request-status.accepted,.tr-request-status.completed{background:#e8f1e4;color:#4e7547}

.tr-request-status.rejected{background:#f8e8e4;color:#9b5143}

.tr-request-card h3{font:700 18px Georgia,serif;color:#563624;margin:15px 0 6px}

.tr-request-message{font-size:11px;line-height:1.65;color:#80634f;white-space:pre-wrap}

.tr-request-meta{display:flex;gap:12px;flex-wrap:wrap;margin:12px 0;color:#997b63;font-size:9px}

.tr-request-meta span{display:inline-flex;align-items:center;gap:5px}

.tr-request-response{border-left:3px solid #a06d4a;background:#f8efe5;padding:9px 12px;margin:10px 0;color:#72523b;font-size:10px}

.tr-request-response p{margin:4px 0 0}

.tr-response-field{display:grid;gap:6px;color:#8d6c53;font-size:10px;font-weight:800;margin:12px 0}

.tr-response-field textarea{width:100%;resize:vertical;box-sizing:border-box;border:1px solid #dcc9b3;background:#fffaf4;border-radius:9px;padding:10px;color:#62422f;font:inherit;line-height:1.5}

.tr-request-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}

.tr-accept-button,.tr-reject-button{display:inline-flex;align-items:center;gap:6px;border-radius:9px;padding:9px 12px;font:inherit;font-size:10px;font-weight:900;cursor:pointer}

.tr-accept-button{border:1px solid #65835a;background:#eaf2e6;color:#4f7047}

.tr-reject-button{border:1px solid #d9aaa0;background:#fff1ee;color:#9b5143}

.tr-accept-button:disabled,.tr-reject-button:disabled{opacity:.6;cursor:wait}

.tr-request-final{font-size:10px;color:#9a7b63}

.tr-consultation-meet-link{display:inline-flex;align-items:center;gap:7px;margin-top:10px;padding:9px 12px;border-radius:8px;background:#e7f1e5;color:#42643e;font-size:11px;font-weight:900;text-decoration:none;border:1px solid #cbdcc5}
.tr-consultation-meet-link:hover{background:#dcebd7}
.tr-request-response{margin-top:12px;padding:11px 12px;border:1px solid #e3cfb5;border-radius:9px;background:#fbf4e9;color:#75543d;font-size:11px;line-height:1.55}
.tr-request-response p{margin:5px 0 0}


@media(max-width:1100px){.tr-metrics{grid-template-columns:repeat(3,1fr)}.tr-session-grid{grid-template-columns:repeat(2,1fr)}}

@media(max-width:800px){.tr-page{padding:25px 15px 55px}.tr-hero{display:block}.tr-hero-actions{margin-top:15px}.tr-hero h1{font-size:32px}.tr-grid-main{grid-template-columns:1fr}.tr-metrics{grid-template-columns:repeat(2,1fr)}.tr-report-meta{grid-template-columns:1fr}.tr-report-filters{display:grid}.tr-session-grid{grid-template-columns:1fr}}

@media(max-width:520px){.tr-chart-summary{padding:12px 12px 0;gap:7px}.tr-chart-total,.tr-chart-insight{padding:10px}.tr-chart-animated{padding-left:9px;padding-right:9px;gap:5px}.tr-bar-track{width:28px}.tr-chart-switch button{padding:7px 6px}.tr-chart-detail{margin-left:12px;margin-right:12px}.tr-metrics{grid-template-columns:1fr}.tr-chart{padding-left:10px;padding-right:10px;gap:7px}.tr-bar-track{width:32px}.tr-engagement-row{grid-template-columns:34px 1fr auto}.tr-last{display:none}}

`;


