import { useEffect, useMemo, useState } from "react";



import {



  Activity,



  BellRing,



  CalendarCheck,



  MessageSquare,



  UserRoundCog,



  ShieldCheck,



  Send,



  BarChart3,



  BookOpen,



  CheckCircle2,



  ChevronDown,



  Crown,



  Eye,



  FileText,



  Hand,



  Layers3,



  LoaderCircle,



  RefreshCw,



  Search,



  Shield,



  ShieldOff,



  Sparkles,



  UserCheck,



  UserCog,



  Users,



  XCircle,



} from "lucide-react";







import api from "../api/client";







function formatDate(value) {



  if (!value) return "—";



  return new Date(value).toLocaleDateString(undefined, {



    day: "2-digit",



    month: "short",



    year: "numeric",



  });



}







function formatDateTime(value) {



  if (!value) return "—";



  return new Date(value).toLocaleString(undefined, {



    day: "2-digit",



    month: "short",



    year: "numeric",



    hour: "2-digit",



    minute: "2-digit",



  });



}







function MetricCard({ icon: Icon, label, value, note }) {



  return (



    <article className="admin-metric">



      <div className="admin-metric-icon">



        <Icon size={19} />



      </div>



      <div>



        <span>{label}</span>



        <strong>{value ?? 0}</strong>



        <small>{note}</small>



      </div>



    </article>



  );



}







function StatusBadge({ active }) {



  return (



    <span className={`admin-status ${active ? "active" : "inactive"}`}>



      {active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}



      {active ? "Active" : "Inactive"}



    </span>



  );



}







const ROLE_OPTIONS = [



  { value: "user", label: "User" },



  { value: "tarot_reader", label: "Tarot Reader" },



  { value: "consultant", label: "Spiritual Consultant" },



  { value: "admin", label: "Administrator" },



];







function roleLabel(role) {



  return ROLE_OPTIONS.find((item) => item.value === role)?.label || "Unknown role";



}







function RoleBadge({ role }) {



  const isAdmin = role === "admin";



  const isReader = role === "tarot_reader";



  const isConsultant = role === "consultant";







  return (



    <span



      className={`admin-role ${



        isAdmin



          ? "administrator"



          : isReader



            ? "tarot-reader"



            : isConsultant



              ? "consultant"



              : ""



      }`}



    >



      {isAdmin ? <Crown size={12} /> : <UserCheck size={12} />}



      {roleLabel(role)}



    </span>



  );



}







export default function AdminDashboard() {



  const [dashboard, setDashboard] = useState(null);



  const [users, setUsers] = useState([]);



  const [readings, setReadings] = useState([]);



  const [consultations, setConsultations] = useState([]);



  const [feedback, setFeedback] = useState([]);



  const [platformFeedback, setPlatformFeedback] = useState([]);



  const [auditLogs, setAuditLogs] = useState([]);



  const [systemInfo, setSystemInfo] = useState(null);



  const [currentProfile, setCurrentProfile] = useState(null);



  const [announcementTitle, setAnnouncementTitle] = useState("");



  const [announcementMessage, setAnnouncementMessage] = useState("");



  const [announcementPath, setAnnouncementPath] = useState("/dashboard");



  const [announcementNotice, setAnnouncementNotice] = useState("");



  const [announcementBusy, setAnnouncementBusy] = useState(false);



  const [search, setSearch] = useState("");



  const [roleFilter, setRoleFilter] = useState("");



  const [activeFilter, setActiveFilter] = useState("");



  const [readingFilter, setReadingFilter] = useState("");



  const [tab, setTab] = useState("overview");



  const [loading, setLoading] = useState(true);



  const [refreshing, setRefreshing] = useState(false);



  const [busyId, setBusyId] = useState(null);



  const [error, setError] = useState("");







  async function loadAll({ initial = false } = {}) {



    setError("");



    if (initial) setLoading(true);



    else setRefreshing(true);







    try {



      const results = await Promise.allSettled([



        api.get("/api/admin/dashboard"),



        api.get("/api/admin/users", { params: { search: search || undefined, role: roleFilter || undefined, active: activeFilter || undefined } }),



        api.get("/api/admin/readings", { params: { reading_type: readingFilter || undefined } }),



        api.get("/api/admin/consultations"),



        api.get("/api/admin/feedback"),



        api.get("/api/admin/audit-logs"),



        api.get("/api/admin/system"),



        api.get("/api/auth/me"),



      ]);



      const data = results.map((result) => result.status === "fulfilled" ? result.value.data : null);



      if (data[0]) setDashboard(data[0]);



      if (data[1]) setUsers(data[1]?.items || []);



      if (data[2]) setReadings(data[2]?.items || []);



      if (data[3]) setConsultations(data[3]?.items || []);



      if (data[4]) setFeedback(data[4]?.items || []);



      if (data[5]) setAuditLogs(data[5]?.items || []);



      if (data[6]) setSystemInfo(data[6]);



      if (data[7]) setCurrentProfile(data[7]?.user || data[7]?.profile || data[7]);



      try {

        const platformResult = await api.get("/api/platform-feedback/admin");

        setPlatformFeedback(platformResult.data?.items || []);

      } catch (platformErr) {

        console.error("Platform feedback queue could not be loaded", platformErr);

      }



      if (!data[0] || !data[1] || !data[2]) throw results.find((result, index) => index < 3 && result.status === "rejected")?.reason || new Error("Core admin data unavailable");



    } catch (err) {



      setError(



        err?.response?.data?.detail ||



          "Administrator data could not be loaded. Check the backend and your administrator session."



      );



    } finally {



      setLoading(false);



      setRefreshing(false);



    }



  }







  useEffect(() => {



    loadAll({ initial: true });



  }, []);







  useEffect(() => {



    const timer = setTimeout(() => {



      loadAll();



    }, 250);







    return () => clearTimeout(timer);



  }, [search, roleFilter, activeFilter, readingFilter]);







  async function updateRole(user, nextRole) {



    if (user.role === nextRole) return;







    setBusyId(`role-${user.id}`);



    setError("");







    try {



      const response = await api.patch(`/api/admin/users/${user.id}/role`, {



        role: nextRole,



      });







      setUsers((current) =>



        current.map((item) =>



          item.id === user.id ? { ...item, ...response.data } : item



        )



      );



      setDashboard((current) =>



        current



          ? {



              ...current,



              metrics: {



                ...current.metrics,



                admin_users:



                  current.metrics.admin_users +



                  (nextRole === "admin" ? 1 : 0) -



                  (user.role === "admin" ? 1 : 0),



                user_users:



                  (current.metrics.user_users ?? 0) +



                  (nextRole === "user" ? 1 : 0) -



                  (user.role === "user" ? 1 : 0),



                tarot_reader_users:



                  (current.metrics.tarot_reader_users ?? 0) +



                  (nextRole === "tarot_reader" ? 1 : 0) -



                  (user.role === "tarot_reader" ? 1 : 0),



                consultant_users:



                  (current.metrics.consultant_users ?? 0) +



                  (nextRole === "consultant" ? 1 : 0) -



                  (user.role === "consultant" ? 1 : 0),



              },



            }



          : current



      );



    } catch (err) {



      setError(err?.response?.data?.detail || "Role could not be changed.");



    } finally {



      setBusyId(null);



    }



  }







  async function toggleStatus(user) {



    setBusyId(`status-${user.id}`);



    setError("");







    try {



      const response = await api.patch(`/api/admin/users/${user.id}/status`, {



        is_active: !user.is_active,



      });







      setUsers((current) =>



        current.map((item) =>



          item.id === user.id ? { ...item, ...response.data } : item



        )



      );



    } catch (err) {



      setError(err?.response?.data?.detail || "User status could not be changed.");



    } finally {



      setBusyId(null);



    }



  }







  async function updatePlatformFeedback(item, changes) {

    setBusyId(`platform-feedback-${item.id}`);

    setError("");

    try {

      const response = await api.patch(`/api/platform-feedback/admin/${item.id}`, changes);

      setPlatformFeedback((current) => current.map((entry) => entry.id === item.id ? { ...entry, ...response.data } : entry));

      await loadAll();

    } catch (err) {

      setError(err?.response?.data?.detail || "This submission could not be updated.");

    } finally {

      setBusyId(null);

    }

  }



  async function replyToPlatformFeedback(item) {

    const responseText = window.prompt("Write an administrator response:", item.admin_response || "");

    if (responseText === null) return;

    await updatePlatformFeedback(item, {

      admin_response: responseText.trim(),

      status: responseText.trim() ? "resolved" : (item.status || "in_review"),

    });

  }



  async function refreshAuditLogs() {

    try {

      const response = await api.get("/api/admin/audit-logs");

      setAuditLogs(response.data?.items || []);

    } catch (err) {

      setError(err?.response?.data?.detail || "Audit logs could not be refreshed.");

    }

  }



  async function sendAnnouncement(event) {

    event.preventDefault();

    const title = announcementTitle.trim();

    const message = announcementMessage.trim();

    if (title.length < 3 || message.length < 3) {

      setAnnouncementNotice("Enter an announcement title and message (at least 3 characters each).");

      return;

    }



    setAnnouncementNotice("");

    setAnnouncementBusy(true);

    try {

      const response = await api.post("/api/notifications/admin/announcement", {

        title,

        message,

        action_path: announcementPath.trim() || "/dashboard",

      });

      const recipients = Number(response.data?.recipients ?? 0);



      // The announcement is already delivered at this point. Audit logging is

      // attempted separately so an audit refresh error cannot misreport delivery.

      try {

        await api.post("/api/admin/audit-logs", {

          action: "platform_announcement_sent",

          details: `Title: ${title}; eligible recipients notified: ${recipients}`,

        });

        const logs = await api.get("/api/admin/audit-logs");

        setAuditLogs(logs.data?.items || []);

      } catch (auditError) {

        console.error("Announcement sent, but audit logging failed:", auditError);

      }



      setAnnouncementNotice(

        recipients > 0

          ? `Announcement sent successfully to ${recipients} active user${recipients === 1 ? "" : "s"} whose announcement preferences are enabled.`

          : "The announcement was accepted, but no active users currently have platform announcements enabled. Check user notification preferences."

      );

      setAnnouncementTitle("");

      setAnnouncementMessage("");

    } catch (err) {

      setAnnouncementNotice(

        err?.response?.data?.detail ||

          "The announcement could not be sent. Check the backend terminal and your administrator session."

      );

    } finally {

      setAnnouncementBusy(false);

    }

  }







  const metrics = dashboard?.metrics || {};



  const monthly = dashboard?.monthly_activity || [];







  const maxMonthly = Math.max(



    1,



    ...monthly.map((item) => Number(item.readings || 0))



  );







  const totalMix = Math.max(



    1,



    Number(dashboard?.reading_mix?.palm || 0) +



      Number(dashboard?.reading_mix?.tarot || 0)



  );







  const overviewUsers = useMemo(() => users.slice(0, 6), [users]);



  const overviewReadings = useMemo(() => readings.slice(0, 6), [readings]);







  if (loading) {



    return (



      <div className="admin-loading-page">



        <LoaderCircle size={28} className="admin-spin" />



        <p>Preparing administrator workspace…</p>



      </div>



    );



  }







  return (



    <>



      <style>{`



        .admin-page{



          width:min(1240px,calc(100% - 34px));



          margin:28px auto 70px;



          color:#463024;



        }



        .admin-hero{



          display:flex;



          align-items:flex-end;



          justify-content:space-between;



          gap:25px;



          padding:12px 0 27px;



        }



        .admin-eyebrow{



          margin:0 0 8px;



          color:#9a6844;



          font-size:12px;



          font-weight:900;



          letter-spacing:.22em;



        }



        .admin-hero h1{



          margin:0;



          color:#3c271c;



          font-family:Georgia,"Times New Roman",serif;



          font-size:clamp(36px,4vw,51px);



          line-height:1.05;



        }



        .admin-hero p{



          max-width:700px;



          margin:12px 0 0;



          color:#80634f;



          font-size:15px;



          line-height:1.7;



        }



        .admin-hero-actions{



          display:flex;



          align-items:center;



          gap:9px;



        }



        .admin-live{



          display:flex;



          align-items:center;



          gap:7px;



          padding:9px 12px;



          border:1px solid #d9d4b8;



          border-radius:999px;



          background:#f5f3e7;



          color:#66704d;



          font-size:11px;



          font-weight:900;



          letter-spacing:.1em;



          text-transform:uppercase;



        }



        .admin-live-dot{



          width:7px;



          height:7px;



          border-radius:50%;



          background:#6f9a62;



          box-shadow:0 0 0 4px rgba(111,154,98,.12);



        }



        .admin-refresh{



          display:flex;



          align-items:center;



          gap:7px;



          padding:9px 12px;



          border:1px solid #dcc8b0;



          border-radius:11px;



          background:#fffaf3;



          color:#68462f;



          cursor:pointer;



          font-size:12px;



          font-weight:800;



        }



        .admin-refresh:hover{border-color:#b8926a}



        .admin-refresh:disabled{opacity:.6;cursor:wait}







        .admin-error{



          margin-bottom:18px;



          padding:13px 15px;



          border:1px solid #e1bdb3;



          border-radius:13px;



          background:#fff3ef;



          color:#8b4c42;



          font-size:13px;



        }







        .admin-tabs{



          display:flex;



          flex-wrap:wrap;



          gap:5px;



          margin-bottom:18px;



          padding:5px;



          border:1px solid #dfcdb6;



          border-radius:15px;



          background:#eee3d3;



        }



        .admin-tabs button{



          display:flex;



          align-items:center;



          justify-content:center;



          gap:7px;



          flex:1 1 150px;



          min-height:43px;



          border:0;



          border-radius:10px;



          background:transparent;



          color:#785a43;



          cursor:pointer;



          font-size:12px;



          font-weight:900;



          letter-spacing:.04em;



        }



        .admin-tabs button.active{



          background:#fffaf3;



          color:#4f3324;



          box-shadow:0 5px 15px rgba(73,46,29,.08);



        }







        .admin-metrics{



          display:grid;



          grid-template-columns:repeat(4,1fr);



          gap:12px;



        }



        .admin-metric{



          display:flex;



          align-items:flex-start;



          gap:12px;



          padding:17px;



          border:1px solid #dfcdb6;



          border-radius:17px;



          background:#fffaf3;



          box-shadow:0 9px 24px rgba(78,51,32,.045);



        }



        .admin-metric-icon{



          display:grid;



          place-items:center;



          flex:none;



          width:38px;



          height:38px;



          border-radius:11px;



          background:#eee1d1;



          color:#795238;



        }



        .admin-metric span{



          display:block;



          color:#97765d;



          font-size:10px;



          font-weight:900;



          letter-spacing:.12em;



          text-transform:uppercase;



        }



        .admin-metric strong{



          display:block;



          margin-top:3px;



          color:#4c3021;



          font-family:Georgia,"Times New Roman",serif;



          font-size:27px;



        }



        .admin-metric small{



          display:block;



          margin-top:3px;



          color:#a18771;



          font-size:10px;



        }







        .admin-role-strip{



          display:grid;



          grid-template-columns:repeat(4,1fr);



          gap:10px;



          margin-top:12px;



        }



        .admin-role-strip div{



          padding:13px 15px;



          border:1px solid #dfcdb6;



          border-radius:14px;



          background:#fffaf3;



        }



        .admin-role-strip span{



          display:block;



          color:#98765c;



          font-size:10px;



          font-weight:900;



          letter-spacing:.09em;



          text-transform:uppercase;



        }



        .admin-role-strip strong{



          display:block;



          margin-top:4px;



          color:#4c3021;



          font-family:Georgia,"Times New Roman",serif;



          font-size:24px;



        }








        .admin-overview-visuals{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:15px;margin-top:15px}
        .admin-visual-body{padding:4px 18px 19px}
        .admin-ops-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding-top:12px}
        .admin-ops-card{display:flex;align-items:center;gap:10px;min-width:0;padding:13px 11px;border:1px solid #eadbc9;border-radius:12px;background:#fffdf9}
        .admin-ops-icon{display:grid;place-items:center;flex:0 0 34px;width:34px;height:34px;border-radius:10px;background:#eee1d1;color:#795238}
        .admin-ops-card strong{display:block;color:#4c3021;font:23px/1.1 Georgia,serif}
        .admin-ops-card p{margin:4px 0 0;color:#8f7056;font-size:10px;line-height:1.4}

        .admin-role-visual-row{display:grid;grid-template-columns:145px minmax(80px,1fr) 42px;align-items:center;gap:12px;margin-top:17px}
        .admin-role-visual-label{display:flex;align-items:center;gap:8px;color:#76583f;font-size:14px;font-weight:700}
        .admin-role-visual-dot{width:9px;height:9px;border-radius:50%;background:#a27652;flex:none}
        .admin-role-visual-row:nth-child(2) .admin-role-visual-dot,.admin-role-visual-row:nth-child(2) .admin-role-visual-fill{background:#c6a27c}
        .admin-role-visual-row:nth-child(3) .admin-role-visual-dot,.admin-role-visual-row:nth-child(3) .admin-role-visual-fill{background:#80604a}
        .admin-role-visual-row:nth-child(4) .admin-role-visual-dot,.admin-role-visual-row:nth-child(4) .admin-role-visual-fill{background:#d8c1a3}
        .admin-role-visual-track{height:11px;border-radius:99px;background:#efe4d6;overflow:hidden}
        .admin-role-visual-fill{height:100%;border-radius:99px;background:#a27652;transition:width .3s ease}
        .admin-role-visual-count{text-align:right;color:#4c3021;font-family:Georgia,serif;font-size:19px;font-weight:700}
        .admin-health-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .admin-health-card{padding:15px;border:1px solid #eadbc9;border-radius:14px;background:#fffdf9;min-width:0}
        .admin-health-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px;color:#8e6d55;font-size:13px;font-weight:800}
        .admin-health-card-top svg{color:#9b6a46;flex:none}
        .admin-health-card strong{display:block;margin-top:10px;color:#503326;font-family:Georgia,serif;font-size:29px;line-height:1.15}
        .admin-health-card p{margin:6px 0 0;color:#98765c;font-size:13px;line-height:1.5}
        .admin-health-track{height:7px;margin-top:12px;border-radius:99px;background:#eee2d3;overflow:hidden}
        .admin-health-fill{height:100%;border-radius:99px;background:#8a9b6c}
        .admin-health-footnote{margin:13px 0 0;color:#9a7b62;font-size:12px;line-height:1.55}

        .admin-overview{



          display:grid;



          grid-template-columns:1.4fr .9fr;



          gap:15px;



          margin-top:15px;



        }



        .admin-panel{



          min-width:0;



          border:1px solid #dfcdb6;



          border-radius:19px;



          background:#fffaf3;



          box-shadow:0 10px 28px rgba(78,51,32,.045);



        }



        .admin-panel-head{



          display:flex;



          align-items:center;



          justify-content:space-between;



          gap:15px;



          padding:17px 18px 12px;



        }



        .admin-panel-head h2{



          margin:0;



          color:#4c3021;



          font-family:Georgia,"Times New Roman",serif;



          font-size:22px;



        }



        .admin-panel-head p{



          margin:4px 0 0;



          color:#98765c;



          font-size:11px;



        }



        .admin-panel-head button{



          border:0;



          background:transparent;



          color:#906341;



          cursor:pointer;



          font-size:11px;



          font-weight:800;



        }







        .admin-chart{



          display:flex;



          align-items:flex-end;



          gap:10px;



          min-height:205px;



          padding:15px 18px 19px;



          border-top:1px solid #eee1d1;



        }



        .admin-bar-item{



          display:flex;



          flex:1;



          flex-direction:column;



          align-items:center;



          justify-content:flex-end;



          height:170px;



          gap:7px;



        }



        .admin-bar-value{



          color:#8c684e;



          font-size:10px;



          font-weight:800;



        }



        .admin-bar-track{



          display:flex;



          align-items:flex-end;



          width:100%;



          height:122px;



          max-width:38px;



          border-radius:9px;



          background:#f1e7d9;



          overflow:hidden;



        }



        .admin-bar{



          width:100%;



          min-height:4px;



          border-radius:8px;



          background:#9b6a46;



          transition:height .35s ease;



        }



        .admin-bar-label{



          color:#9b7d64;



          font-size:10px;



          font-weight:800;



        }







        .admin-mix{



          padding:0 18px 18px;



        }



        .admin-mix-row{



          display:grid;



          grid-template-columns:1fr 1fr;



          gap:10px;



          margin-top:6px;



        }



        .admin-mix-card{



          padding:15px;



          border:1px solid #eadbc9;



          border-radius:13px;



          background:#fffdf9;



        }



        .admin-mix-card span{



          display:flex;



          align-items:center;



          gap:6px;



          color:#8e6d55;



          font-size:11px;



          font-weight:800;



        }



        .admin-mix-card strong{



          display:block;



          margin-top:4px;



          color:#503326;



          font-family:Georgia,serif;



          font-size:25px;



        }



        .admin-mix-track{



          height:5px;



          margin-top:8px;



          border-radius:99px;



          background:#eee2d3;



          overflow:hidden;



        }



        .admin-mix-fill{



          height:100%;



          border-radius:99px;



          background:#a27652;



        }







        .admin-table-wrap{



          overflow:auto;



          border-top:1px solid #eee1d1;



        }



        .admin-table{



          width:100%;



          min-width:700px;



          border-collapse:collapse;



        }



        .admin-table th{



          padding:10px 14px;



          background:#fbf5ec;



          color:#9a7b62;



          font-size:10px;



          font-weight:900;



          letter-spacing:.12em;



          text-align:left;



          text-transform:uppercase;



        }



        .admin-table td{



          padding:12px 14px;



          border-top:1px solid #eee2d3;



          color:#6e5442;



          font-size:12px;



          vertical-align:middle;



        }



        .admin-user-cell{



          display:flex;



          align-items:center;



          gap:9px;



        }



        .admin-avatar{



          display:grid;



          place-items:center;



          flex:none;



          width:31px;



          height:31px;



          border-radius:10px;



          background:#eee0cf;



          color:#755039;



          font-size:12px;



          font-weight:900;



        }



        .admin-user-cell strong{



          display:block;



          color:#543727;



          font-size:12px;



        }



        .admin-user-cell span{



          display:block;



          margin-top:2px;



          color:#a0836b;



          font-size:10px;



        }



        .admin-status,.admin-role{



          display:inline-flex;



          align-items:center;



          gap:5px;



          padding:5px 7px;



          border-radius:999px;



          font-size:10px;



          font-weight:900;



        }



        .admin-status.active{background:#edf4e8;color:#5d754d}



        .admin-status.inactive{background:#f7e9e5;color:#956157}



        .admin-role{background:#eee5d8;color:#7d5b40}



        .admin-role.administrator{background:#eadbc8;color:#70472d}



        .admin-actions{



          display:flex;



          align-items:center;



          gap:5px;



        }



        .admin-select{



          padding:7px 8px;



          border:1px solid #dfccb6;



          border-radius:8px;



          background:#fffdf9;



          color:#684831;



          font-size:11px;



          outline:none;



        }



        .admin-small-button{



          display:inline-flex;



          align-items:center;



          gap:5px;



          padding:7px 9px;



          border:1px solid #ddc8b0;



          border-radius:8px;



          background:#fffdf9;



          color:#754e34;



          cursor:pointer;



          font-size:10px;



          font-weight:800;



        }



        .admin-small-button:hover{border-color:#b8936d}



        .admin-small-button:disabled{opacity:.5;cursor:wait}







        .admin-toolbar{



          display:flex;



          align-items:center;



          gap:8px;



          flex-wrap:wrap;



          padding:0 18px 14px;



        }



        .admin-search{



          display:flex;



          align-items:center;



          gap:7px;



          flex:1 1 260px;



          min-width:220px;



          padding:9px 11px;



          border:1px solid #ddc9b2;



          border-radius:10px;



          background:#fffdf9;



          color:#98775e;



        }



        .admin-search input{



          width:100%;



          padding:0;



          border:0;



          outline:none;



          background:transparent;



          color:#543729;



          font-size:12px;



        }



        .admin-filter{



          padding:9px 10px;



          border:1px solid #ddc9b2;



          border-radius:10px;



          background:#fffdf9;



          color:#704d36;



          font-size:11px;



        }







        .admin-reading-type{



          display:inline-flex;



          align-items:center;



          gap:5px;



          padding:5px 7px;



          border-radius:999px;



          background:#eee1d1;



          color:#765138;



          font-size:10px;



          font-weight:900;



          text-transform:uppercase;



        }



        .admin-reading-preview{



          max-width:310px;



          color:#7f6551;



          line-height:1.45;



        }







        .admin-empty{



          padding:45px 20px;



          text-align:center;



          color:#967963;



          font-size:13px;



        }



        .admin-empty svg{



          margin-bottom:8px;



          color:#aa8664;



        }



        .admin-loading-page{



          min-height:65vh;



          display:grid;



          place-items:center;



          align-content:center;



          gap:9px;



          color:#7e6049;



          font-size:14px;



        }



        .admin-spin{animation:adminSpin 1s linear infinite}



        @keyframes adminSpin{to{transform:rotate(360deg)}}







        .admin-module-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:16px}

        .admin-module-card{padding:17px;border:1px solid #dfcdb6;border-radius:15px;background:#fffaf3}

        .admin-module-card span{display:block;color:#98765a;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em}

        .admin-module-card strong{display:block;margin-top:8px;color:#4f3324;font-family:Georgia,serif;font-size:30px}

        .admin-module-card p{margin:7px 0 0;color:#8b6c53;font-size:13px;line-height:1.6}

        .admin-module-note{padding:13px 15px;border:1px solid #e4d2bc;border-radius:12px;background:#f8efe3;color:#76583f;font-size:13px;line-height:1.65;margin:16px 20px 20px}

        .admin-module-form{display:grid;grid-template-columns:minmax(0,1.12fr) minmax(280px,.88fr);gap:0;margin:0;padding:0;box-sizing:border-box;width:100%;align-items:stretch}

        .admin-announcement-editor{padding:22px 24px 24px;min-width:0}

        .admin-announcement-editor-top{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:18px}

        .admin-announcement-editor-top h3{margin:0;color:#4f3324;font-family:Georgia,serif;font-size:21px;font-weight:700}

        .admin-announcement-editor-top p{margin:5px 0 0;color:#96765b;font-size:13px;line-height:1.6}

        .admin-announcement-label{display:flex;min-width:0;flex-direction:column;gap:7px;color:#76583f;font-size:13px;font-weight:800;line-height:1.45;margin-bottom:15px}

        .admin-announcement-label input,.admin-announcement-label textarea{display:block;width:100%;min-width:0;max-width:100%;box-sizing:border-box;border:1px solid #dfcbb5;border-radius:11px;padding:12px 13px;background:#fffdf9;color:#4f3324;font:inherit;line-height:1.55;outline:none;transition:border-color .15s,box-shadow .15s}

        .admin-announcement-label input:focus,.admin-announcement-label textarea:focus{border-color:#9a7250;box-shadow:0 0 0 3px rgba(154,114,80,.12)}

        .admin-announcement-label textarea{min-height:145px;resize:vertical;white-space:pre-wrap}

        .admin-announcement-label small{display:flex;justify-content:space-between;gap:10px;color:#a18469;font-size:12px;font-weight:500}

        .admin-announcement-templates{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 18px}

        .admin-announcement-templates button{border:1px solid #e2d0ba;border-radius:999px;background:#fbf3e8;color:#76583f;padding:7px 10px;font:inherit;font-size:12px;font-weight:800;cursor:pointer}

        .admin-announcement-templates button:hover{background:#efe0cb;border-color:#cbb08f}

        .admin-announcement-bottom{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:end}

        .admin-announcement-bottom .admin-announcement-label{margin-bottom:0}

        .admin-announcement-actions{display:flex;align-items:center;justify-content:flex-start;min-width:0;padding:0 0 1px}

        .admin-primary-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:43px;border:0;border-radius:11px;padding:12px 17px;background:#68452f;color:white;font-weight:800;cursor:pointer;white-space:nowrap;box-shadow:0 5px 12px rgba(104,69,47,.14);transition:transform .15s,background .15s}

        .admin-primary-button:hover:not(:disabled){background:#503321;transform:translateY(-1px)}

        .admin-primary-button:disabled{opacity:.55;cursor:wait;box-shadow:none}

        .admin-announcement-preview{padding:24px;background:linear-gradient(155deg,#f6ead9 0%,#f0e0ca 100%);border-left:1px solid #e8d5bd;min-width:0;display:flex;flex-direction:column}

        .admin-announcement-preview-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px}

        .admin-announcement-preview-heading h3{margin:0;color:#76583f;font-size:12px;text-transform:uppercase;letter-spacing:.13em;font-weight:900}

        .admin-announcement-preview-card{border:1px solid rgba(202,174,141,.75);border-radius:16px;background:#fffaf3;padding:18px;box-shadow:0 8px 20px rgba(89,59,37,.06);flex:1;min-height:225px}

        .admin-announcement-preview-brand{display:flex;align-items:center;gap:9px;padding-bottom:14px;border-bottom:1px solid #efe1d0;margin-bottom:15px}

        .admin-announcement-preview-icon{width:34px;height:34px;border-radius:10px;background:#efe0ca;color:#80583a;display:grid;place-items:center;flex-shrink:0}

        .admin-announcement-preview-brand strong{display:block;color:#5a3b28;font-size:13px}

        .admin-announcement-preview-brand span{display:block;margin-top:3px;color:#a08468;font-size:11px}

        .admin-announcement-preview-card h4{margin:0 0 9px;color:#4f3324;font-family:Georgia,serif;font-size:23px;line-height:1.3;overflow-wrap:anywhere}

        .admin-announcement-preview-card p{margin:0;color:#7c6048;font-size:14px;line-height:1.75;white-space:pre-wrap;overflow-wrap:anywhere}

        .admin-announcement-preview-link{display:inline-flex;margin-top:17px;padding:8px 11px;border-radius:8px;background:#efe0ca;color:#6a472e;font-size:12px;font-weight:800;max-width:100%;overflow-wrap:anywhere}

        .admin-announcement-preview-foot{margin-top:14px;color:#94775b;font-size:12px;line-height:1.6}

        .admin-status-text{padding:12px 14px;border-radius:10px;background:#edf5e9;color:#45633c;font-size:14px;line-height:1.6;margin:16px 20px}

        .admin-long-text{max-width:330px;white-space:normal;line-height:1.5;color:#795d46;font-size:13px}

        .admin-tabs button{white-space:nowrap}

        @media(max-width:1000px){.admin-overview-visuals{grid-template-columns:1fr}.admin-role-visual-row{grid-template-columns:155px minmax(80px,1fr) 42px}.admin-ops-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
        @media(max-width:680px){
          .admin-ops-grid{grid-template-columns:1fr}
          .admin-role-visual-row{grid-template-columns:115px minmax(50px,1fr) 32px;gap:8px}
          .admin-role-visual-label{font-size:12px}
        }
        @media(max-width:1000px){.admin-module-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.admin-module-form{grid-template-columns:minmax(0,1fr)}.admin-announcement-preview{border-left:0;border-top:1px solid #e8d5bd}}

        @media(max-width:700px){.admin-module-grid{grid-template-columns:1fr}.admin-announcement-editor,.admin-announcement-preview{padding:17px 14px}.admin-announcement-bottom{grid-template-columns:1fr}.admin-announcement-actions{padding-top:0}.admin-announcement-actions .admin-primary-button{width:100%}.admin-module-note{margin-left:14px;margin-right:14px}.admin-status-text{margin-left:14px;margin-right:14px}}











        @media(max-width:1000px){



          .admin-metrics{grid-template-columns:repeat(2,1fr)}



          .admin-role-strip{grid-template-columns:repeat(2,1fr)}



          .admin-overview{grid-template-columns:1fr}



          .admin-role-strip{grid-template-columns:repeat(2,1fr)}



        }



        @media(max-width:680px){



          .admin-page{width:min(100% - 22px,1240px);margin-top:17px}



          .admin-hero{align-items:flex-start;flex-direction:column}



          .admin-hero-actions{width:100%;justify-content:space-between}



          .admin-tabs button{font-size:11px}



          .admin-metrics{grid-template-columns:1fr}



          .admin-role-strip{grid-template-columns:1fr 1fr}



          .admin-mix-row{grid-template-columns:1fr 1fr}



        }



        /* Responsive containment fix: keep admin headings and controls inside their cards. */
        .admin-page,
        .admin-page * { box-sizing: border-box; }
        .admin-page {
          width: calc(100% - 34px);
          max-width: 1240px;
          min-width: 0;
          margin-left: auto;
          margin-right: auto;
        }
        .admin-panel { min-width: 0; max-width: 100%; overflow: hidden; }
        .admin-panel-head { min-width: 0; flex-wrap: wrap; align-items: flex-start; }
        .admin-panel-head > div { min-width: 0; max-width: 100%; flex: 1 1 220px; }
        .admin-panel-head h2,
        .admin-panel-head p { max-width: 100%; overflow-wrap: anywhere; word-break: normal; }
        .admin-toolbar { min-width: 0; }
        .admin-search { min-width: 0; max-width: 100%; }
        .admin-filter { min-width: 0; max-width: 100%; }
        .admin-table-wrap { max-width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .admin-table { width: 100%; }
        @media (max-width: 760px) {
          .admin-page { width: calc(100% - 22px); margin-top: 17px; }
          .admin-panel-head { gap: 10px; padding: 15px 14px 12px; }
          .admin-panel-head h2 { font-size: clamp(18px, 5vw, 22px); line-height: 1.25; }
          .admin-panel-head p { font-size: 12px; line-height: 1.5; }
          .admin-toolbar { padding-left: 14px; padding-right: 14px; }
          .admin-search { flex: 1 1 100%; }
          .admin-filter { flex: 1 1 100%; width: 100%; }
        }
        @media (max-width: 420px) {
          .admin-page { width: calc(100% - 16px); }
          .admin-panel-head { padding-left: 12px; padding-right: 12px; }
          .admin-panel-head > div { flex-basis: 100%; }
        }

      `}
      </style>



      <main className="admin-page">



        <header className="admin-hero">



          <div>



            <p className="admin-eyebrow">ADMINISTRATOR CONSOLE</p>



            <h1>Platform control centre</h1>



            <p>



              Manage users, review platform activity, monitor Palm and Tarot



              reading volume, and keep the intelligence platform operational.



            </p>



          </div>







          <div className="admin-hero-actions">



            <span className="admin-live">



              <span className="admin-live-dot" />



              System operational



            </span>



            <button



              type="button"



              className="admin-refresh"



              onClick={() => loadAll()}



              disabled={refreshing}



            >



              {refreshing ? (



                <LoaderCircle size={14} className="admin-spin" />



              ) : (



                <RefreshCw size={14} />



              )}



              Refresh



            </button>



          </div>



        </header>







        {error && <div className="admin-error">{error}</div>}







        <div className="admin-tabs" role="tablist" aria-label="Administrator sections">



          {[



            ["overview", BarChart3, "Overview"],



            ["users", Users, "User management"],



            ["readings", FileText, "Reading reports"],





            ["consultations", CalendarCheck, "Consultations"],





            ["announcements", BellRing, "Announcements"],



            ["audit", ShieldCheck, "Audit logs"],





          ].map(([key, Icon, label]) => (



            <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>



              <Icon size={15} /> {label}



            </button>



          ))}



        </div>







        {tab === "overview" && (



          <>



            <section className="admin-metrics">



              <MetricCard



                icon={Users}



                label="Total users"



                value={metrics.total_users}



                note={`${metrics.active_users || 0} currently active`}



              />



              <MetricCard



                icon={BookOpen}



                label="Total readings"



                value={metrics.total_readings}



                note={`${metrics.palm_readings || 0} Palm · ${metrics.tarot_readings || 0} Tarot`}



              />



              <MetricCard



                icon={Shield}



                label="Administrators"



                value={metrics.admin_users}



                note="Role-based access"



              />



              <MetricCard



                icon={UserCog}



                label="Profiles with data"



                value={metrics.profiles_completed}



                note="Profile records available"



              />



            </section>







            







        <div className="admin-overview-visuals">
              <section className="admin-panel">
                <div className="admin-panel-head">
                  <div><h2>Platform audience</h2><p>Registered accounts by role.</p></div>
                  <Users size={17} color="#896346" />
                </div>
                <div className="admin-visual-body">
                  {[
                    { label: "Users", value: Number(metrics.user_users || 0) },
                    { label: "Tarot Readers", value: Number(metrics.tarot_reader_users || 0) },
                    { label: "Spiritual Consultants", value: Number(metrics.consultant_users || 0) },
                    { label: "Administrators", value: Number(metrics.admin_users || 0) },
                  ].map((role) => {
                    const totalRoleUsers = Math.max(1,
                      Number(metrics.user_users || 0) +
                      Number(metrics.tarot_reader_users || 0) +
                      Number(metrics.consultant_users || 0) +
                      Number(metrics.admin_users || 0)
                    );
                    const percentage = Math.min(100, (role.value / totalRoleUsers) * 100);
                    return (
                      <div className="admin-role-visual-row" key={role.label}>
                        <div className="admin-role-visual-label"><span className="admin-role-visual-dot" />{role.label}</div>
                        <div className="admin-role-visual-track" role="progressbar" aria-label={`${role.label} share`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percentage)}>
                          <div className="admin-role-visual-fill" style={{ width: `${percentage}%` }} />
                        </div>
                        <div className="admin-role-visual-count">{role.value}</div>
                      </div>
                    );
                  })}
                  <p className="admin-health-footnote">Based on role totals supplied by the administrator API.</p>
                </div>
              </section>
              <section className="admin-panel">
                <div className="admin-panel-head">
                  <div><h2>Operational activity</h2><p>Support and administration records currently available.</p></div>
                  <Activity size={17} color="#896346" />
                </div>
                <div className="admin-visual-body">
                  <div className="admin-ops-grid">
                    <div className="admin-ops-card">
                      <span className="admin-ops-icon"><CalendarCheck size={16} /></span>
                      <div><strong>{consultations.length}</strong><p>Consultation records</p></div>
                    </div>
                    <div className="admin-ops-card">
                      <span className="admin-ops-icon"><MessageSquare size={16} /></span>
                      <div><strong>{platformFeedback.length}</strong><p>Feedback submissions</p></div>
                    </div>
                    <div className="admin-ops-card">
                      <span className="admin-ops-icon"><ShieldCheck size={16} /></span>
                      <div><strong>{auditLogs.length}</strong><p>Audit log entries</p></div>
                    </div>
                  </div>
                  <p className="admin-health-footnote">Counts reflect records loaded from the administrator APIs.</p>
                </div>
              </section>
            </div>

            <div className="admin-overview">



              <section className="admin-panel">



                <div className="admin-panel-head">



                  <div>



                    <h2>Reading activity</h2>



                    <p>Saved Palm and Tarot sessions across the last six months.</p>



                  </div>



                  <Activity size={17} color="#896346" />



                </div>







                <div className="admin-chart">



                  {monthly.map((month) => (



                    <div className="admin-bar-item" key={month.key}>



                      <span className="admin-bar-value">{month.readings}</span>



                      <div className="admin-bar-track">



                        <div



                          className="admin-bar"



                          style={{



                            height: `${Math.max(



                              4,



                              (Number(month.readings) / maxMonthly) * 100



                            )}%`,



                          }}



                        />



                      </div>



                      <span className="admin-bar-label">{month.label}</span>



                    </div>



                  ))}



                </div>



              </section>







              <section className="admin-panel">



                <div className="admin-panel-head">



                  <div>



                    <h2>Reading mix</h2>



                    <p>Platform-wide Palm and Tarot volume.</p>



                  </div>



                  <Sparkles size={17} color="#896346" />



                </div>







                <div className="admin-mix">



                  <div className="admin-mix-row">



                    <div className="admin-mix-card">



                      <span><Hand size={13} /> Palm</span>



                      <strong>{dashboard?.reading_mix?.palm || 0}</strong>



                      <div className="admin-mix-track">



                        <div



                          className="admin-mix-fill"



                          style={{



                            width: `${(Number(dashboard?.reading_mix?.palm || 0) / totalMix) * 100}%`,



                          }}



                        />



                      </div>



                    </div>



                    <div className="admin-mix-card">



                      <span><Layers3 size={13} /> Tarot</span>



                      <strong>{dashboard?.reading_mix?.tarot || 0}</strong>



                      <div className="admin-mix-track">



                        <div



                          className="admin-mix-fill"



                          style={{



                            width: `${(Number(dashboard?.reading_mix?.tarot || 0) / totalMix) * 100}%`,



                          }}



                        />



                      </div>



                    </div>



                  </div>



                </div>



              </section>



            </div>







            <div className="admin-overview">



              <section className="admin-panel">



                <div className="admin-panel-head">



                  <div>



                    <h2>Recent users</h2>



                    <p>Newest accounts registered on the platform.</p>



                  </div>



                  <button type="button" onClick={() => setTab("users")}>



                    View all



                  </button>



                </div>







                <div className="admin-table-wrap">



                  <table className="admin-table">



                    <thead>



                      <tr>



                        <th>User</th>



                        <th>Role</th>



                        <th>Status</th>



                        <th>Joined</th>



                      </tr>



                    </thead>



                    <tbody>



                      {overviewUsers.map((user) => (



                        <tr key={user.id}>



                          <td>



                            <div className="admin-user-cell">



                              <span className="admin-avatar">



                                {String(user.full_name || "U")



                                  .trim()



                                  .charAt(0)



                                  .toUpperCase()}



                              </span>



                              <div>



                                <strong>{user.full_name}</strong>



                                <span>{user.email}</span>



                              </div>



                            </div>



                          </td>



                          <td><RoleBadge role={user.role} /></td>



                          <td><StatusBadge active={user.is_active} /></td>



                          <td>{formatDate(user.created_at)}</td>



                        </tr>



                      ))}



                    </tbody>



                  </table>



                </div>



              </section>







              <section className="admin-panel">



                <div className="admin-panel-head">



                  <div>



                    <h2>Latest readings</h2>



                    <p>Most recent platform activity.</p>



                  </div>



                  <button type="button" onClick={() => setTab("readings")}>



                    View all



                  </button>



                </div>







                <div className="admin-table-wrap">



                  <table className="admin-table">



                    <thead>



                      <tr>



                        <th>Type</th>



                        <th>User</th>



                        <th>Time</th>



                      </tr>



                    </thead>



                    <tbody>



                      {overviewReadings.map((reading) => (



                        <tr key={reading.id}>



                          <td>



                            <span className="admin-reading-type">



                              {reading.reading_type === "palm" ? (



                                <Hand size={11} />



                              ) : (



                                <Layers3 size={11} />



                              )}



                              {reading.reading_type}



                            </span>



                          </td>



                          <td>{reading.user_name || "User"}</td>



                          <td>{formatDateTime(reading.created_at)}</td>



                        </tr>



                      ))}



                    </tbody>



                  </table>



                </div>



              </section>



            </div>



          </>



        )}







        {tab === "users" && (



          <section className="admin-panel">



            <div className="admin-panel-head">



              <div>



                <h2>User management</h2>



                <p>Search accounts, change roles and control active status.</p>



              </div>



              <Users size={18} color="#896346" />



            </div>







            <div className="admin-toolbar">



              <label className="admin-search">



                <Search size={14} />



                <input



                  value={search}



                  onChange={(event) => setSearch(event.target.value)}



                  placeholder="Search name or email…"



                />



              </label>







              <select



                className="admin-filter"



                value={roleFilter}



                onChange={(event) => setRoleFilter(event.target.value)}



              >



                <option value="">All roles</option>



                {ROLE_OPTIONS.map((role) => (



                  <option key={role.value} value={role.value}>



                    {role.label}s



                  </option>



                ))}



              </select>







              <select



                className="admin-filter"



                value={activeFilter}



                onChange={(event) => setActiveFilter(event.target.value)}



              >



                <option value="">All statuses</option>



                <option value="true">Active</option>



                <option value="false">Inactive</option>



              </select>



            </div>







            <div className="admin-table-wrap">



              <table className="admin-table">



                <thead>



                  <tr>



                    <th>User</th>



                    <th>Role</th>



                    <th>Status</th>



                    <th>Readings</th>



                    <th>Profile</th>



                    <th>Joined</th>



                    <th>Controls</th>



                  </tr>



                </thead>



                <tbody>



                  {users.map((user) => (



                    <tr key={user.id}>



                      <td>



                        <div className="admin-user-cell">



                          <span className="admin-avatar">



                            {String(user.full_name || "U")



                              .trim()



                              .charAt(0)



                              .toUpperCase()}



                          </span>



                          <div>



                            <strong>{user.full_name}</strong>



                            <span>{user.email}</span>



                          </div>



                        </div>



                      </td>



                      <td>



                        <select



                          className="admin-select"



                          value={user.role}



                          disabled={busyId === `role-${user.id}`}



                          onChange={(event) =>



                            updateRole(user, event.target.value)



                          }



                        >



                          {ROLE_OPTIONS.map((role) => (



                            <option key={role.value} value={role.value}>



                              {role.label}



                            </option>



                          ))}



                        </select>



                      </td>



                      <td><StatusBadge active={user.is_active} /></td>



                      <td>{user.reading_count || 0}</td>



                      <td>{user.profile_completed ? "Available" : "Not filled"}</td>



                      <td>{formatDate(user.created_at)}</td>



                      <td>



                        <div className="admin-actions">



                          <button



                            type="button"



                            className="admin-small-button"



                            disabled={busyId === `status-${user.id}`}



                            onClick={() => toggleStatus(user)}



                          >



                            {user.is_active ? (



                              <ShieldOff size={12} />



                            ) : (



                              <Shield size={12} />



                            )}



                            {user.is_active ? "Deactivate" : "Activate"}



                          </button>



                        </div>



                      </td>



                    </tr>



                  ))}



                </tbody>



              </table>







              {!users.length && (



                <div className="admin-empty">



                  <Search size={25} />



                  <div>No users match the current filters.</div>



                </div>



              )}



            </div>



          </section>



        )}







        {tab === "readings" && (



          <section className="admin-panel">



            <div className="admin-panel-head">



              <div>



                <h2>Reading reports</h2>



                <p>Platform-level reading statistics and recent sessions.</p>



              </div>



              <FileText size={18} color="#896346" />



            </div>







            <div className="admin-toolbar">



              <select



                className="admin-filter"



                value={readingFilter}



                onChange={(event) => setReadingFilter(event.target.value)}



              >



                <option value="">All readings</option>



                <option value="palm">Palm only</option>



                <option value="tarot">Tarot only</option>



              </select>



            </div>







            <div className="admin-table-wrap">



              <table className="admin-table">



                <thead>



                  <tr>



                    <th>Type</th>



                    <th>User</th>



                    <th>Title</th>



                    <th>Created</th>



                    <th>AI status</th>



                    <th>Summary</th>



                  </tr>



                </thead>



                <tbody>



                  {readings.map((reading) => (



                    <tr key={reading.id}>



                      <td>



                        <span className="admin-reading-type">



                          {reading.reading_type === "palm" ? (



                            <Hand size={11} />



                          ) : (



                            <Layers3 size={11} />



                          )}



                          {reading.reading_type}



                        </span>



                      </td>



                      <td>



                        <strong>{reading.user_name || "Unknown user"}</strong>



                        <div style={{ marginTop: 3, color: "#a0836b", fontSize: 8 }}>



                          {reading.user_email || ""}



                        </div>



                      </td>



                      <td>{reading.title}</td>



                      <td>{formatDateTime(reading.created_at)}</td>



                      <td>



                        <span className="admin-status active">



                          <CheckCircle2 size={12} />



                          {reading.detection_status || "Saved"}



                        </span>



                      </td>



                      <td>



                        <div className="admin-reading-preview">



                          {reading.result_preview || "No preview available."}



                        </div>



                      </td>



                    </tr>



                  ))}



                </tbody>



              </table>







              {!readings.length && (



                <div className="admin-empty">



                  <FileText size={25} />



                  <div>No readings match the current filter.</div>



                </div>



              )}



            </div>



          </section>



        )}







        {tab === "consultations" && (



          <section className="admin-panel"><div className="admin-panel-head"><div><h2>Consultation management</h2><p>Monitor request status and preferred session schedules. This view is read-only.</p></div><CalendarCheck size={18} color="#896346" /></div>



            <div className="admin-module-grid"><div className="admin-module-card"><span>Total requests</span><strong>{consultations.length}</strong><p>Requests returned by the protected admin endpoint.</p></div><div className="admin-module-card"><span>Pending</span><strong>{consultations.filter((c) => c.status === "pending").length}</strong><p>Waiting for a guide decision.</p></div><div className="admin-module-card"><span>Accepted / in progress</span><strong>{consultations.filter((c) => ["accepted", "in_progress"].includes(c.status)).length}</strong><p>Requests with an active guide response.</p></div></div>



            <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Request</th><th>User</th><th>Guide</th><th>Preferred session</th><th>Status</th><th>Submitted</th></tr></thead><tbody>{consultations.map((c) => <tr key={c.id}><td><strong>{c.topic}</strong><div className="admin-long-text">{c.message}</div></td><td>{c.user_name || "User"}<div>{c.user_email || ""}</div></td><td>{c.expert_name || "Unassigned"}<div>{roleLabel(c.expert_role)}</div></td><td>{c.preferred_time || "Not specified"}</td><td><span className={`admin-status ${["accepted", "completed"].includes(c.status) ? "active" : "inactive"}`}>{c.status || "unknown"}</span></td><td>{formatDateTime(c.created_at)}</td></tr>)}</tbody></table>{!consultations.length && <div className="admin-empty">No consultation requests were returned.</div>}</div>



          </section>



        )}











        {tab === "announcements" && (

          <section className="admin-panel admin-announcement-panel" style={{overflow:"hidden"}}>

            <div className="admin-panel-head">

              <div>

                <h2>Announcement studio</h2>

                <p>Create a clear platform notice and preview exactly how it will appear in users' notifications.</p>

              </div>

              <BellRing size={19} color="#896346" />

            </div>

            <form className="admin-module-form" onSubmit={sendAnnouncement}>

              <div className="admin-announcement-editor">

                <div className="admin-announcement-editor-top">

                  <div><h3>Compose announcement</h3><p>Use a concise title and explain what users need to know.</p></div>

                  <span className="admin-role">IN-APP NOTICE</span>

                </div>

                <div className="admin-announcement-templates" aria-label="Announcement templates">

                  <button type="button" onClick={() => { setAnnouncementTitle("Scheduled maintenance"); setAnnouncementMessage("We will be performing scheduled maintenance on [date] from [start time] to [end time]. Some features may be temporarily unavailable during this period. Thank you for your patience."); setAnnouncementPath("/dashboard"); }}>Scheduled maintenance</button>

                  <button type="button" onClick={() => { setAnnouncementTitle("New feature available"); setAnnouncementMessage("A new feature is now available on Palmistry & Tarot. Visit your dashboard to explore what's new and how it can help you."); setAnnouncementPath("/dashboard"); }}>New feature</button>

                  <button type="button" onClick={() => { setAnnouncementTitle("Important platform notice"); setAnnouncementMessage("Please read this important platform update: [add details]. If you need assistance, contact the platform support team."); setAnnouncementPath("/dashboard"); }}>Important notice</button>

                </div>

                <label className="admin-announcement-label" htmlFor="admin-announcement-title">

                  Announcement title

                  <input id="admin-announcement-title" value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} minLength={3} maxLength={180} required placeholder="e.g. Scheduled maintenance on 12 October" />

                  <small><span>Make the purpose clear at a glance.</span><span>{announcementTitle.length}/180</span></small>

                </label>

                <label className="admin-announcement-label" htmlFor="admin-announcement-message">

                  Message to users

                  <textarea id="admin-announcement-message" value={announcementMessage} onChange={(e) => setAnnouncementMessage(e.target.value)} minLength={3} maxLength={2000} required placeholder="Explain what is changing, when it will happen, and whether users need to take action." />

                  <small><span>Include dates, impact, and next steps when relevant.</span><span>{announcementMessage.length}/2000</span></small>

                </label>

                <div className="admin-announcement-bottom">

                  <label className="admin-announcement-label" htmlFor="admin-announcement-path">

                    Destination link <span style={{fontWeight:500,color:"#a18469"}}>(optional)</span>

                    <input id="admin-announcement-path" value={announcementPath} onChange={(e) => setAnnouncementPath(e.target.value)} maxLength={255} placeholder="/dashboard" />

                    <small><span>Internal page users can open from the notice.</span></small>

                  </label>

                  <div className="admin-announcement-actions">

                    <button className="admin-primary-button" type="submit" disabled={announcementBusy || announcementTitle.trim().length < 3 || announcementMessage.trim().length < 3}>

                      {announcementBusy ? <LoaderCircle size={15} className="admin-spin" /> : <Send size={15} />}

                      {announcementBusy ? "Sending…" : "Publish announcement"}

                    </button>

                  </div>

                </div>

              </div>

              <aside className="admin-announcement-preview" aria-label="Live announcement preview">

                <div className="admin-announcement-preview-heading"><h3>Live preview</h3><span style={{fontSize:10,color:"#98765a"}}>USER VIEW</span></div>

                <article className="admin-announcement-preview-card">

                  <div className="admin-announcement-preview-brand"><div className="admin-announcement-preview-icon"><BellRing size={17} /></div><div><strong>Palmistry &amp; Tarot</strong><span>Platform announcement · Just now</span></div></div>

                  <h4>{announcementTitle.trim() || "Your announcement title"}</h4>

                  <p>{announcementMessage.trim() || "Your message will appear here as users see it in their Notifications page. Keep it clear, helpful, and easy to act on."}</p>

                  <span className="admin-announcement-preview-link">Open {announcementPath.trim() || "/dashboard"} ↗</span>

                </article>

                <p className="admin-announcement-preview-foot">This notice is delivered in-app to active users who have enabled platform announcements. Users with this preference turned off are excluded.</p>

              </aside>

            </form>

            {announcementNotice && <div className="admin-status-text" role="status">{announcementNotice}</div>}

            <div className="admin-module-note"><strong>Before publishing:</strong> double-check the title, dates, and destination. Publishing sends the announcement to eligible users immediately; it does not schedule delivery for a future time.</div>

          </section>

        )}





        {tab === "audit" && (

          <section className="admin-panel">

            <div className="admin-panel-head">

              <div>

                <h2>Audit logs</h2>

                <p>Recorded administrator activity, including announcements and account-management actions.</p>

                <div style={{fontSize:11,color:"#92745b",marginTop:7}}>{auditLogs.length} recent event{auditLogs.length === 1 ? "" : "s"} loaded · newest first</div>

              </div>

              <button type="button" className="admin-refresh" onClick={refreshAuditLogs}><RefreshCw size={13} /> Refresh logs</button>

            </div>

            <div className="admin-table-wrap">

              <table className="admin-table">

                <thead><tr><th>Time</th><th>Administrator</th><th>Action</th><th>Target</th><th>Details</th></tr></thead>

                <tbody>{auditLogs.map((log) => <tr key={log.id}><td>{formatDateTime(log.created_at)}</td><td>{log.actor_name || `Admin #${log.actor_id ?? "—"}`}</td><td>{String(log.action || "").replaceAll("\_", " ")}</td><td>{log.target_type || "platform"}{log.target_id ? ` #${log.target_id}` : ""}</td><td><div className="admin-long-text">{log.details || "—"}</div></td></tr>)}</tbody>

              </table>

              {!auditLogs.length && <div className="admin-empty">No audit events have been recorded yet. Sending an announcement or changing a user role/status will create an entry here. Select <strong>Refresh logs</strong> after another administrator action.</div>}

            </div>

          </section>

        )}







      </main>



    </>



  );



}
