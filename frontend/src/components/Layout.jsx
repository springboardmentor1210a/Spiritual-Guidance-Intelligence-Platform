import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Activity, Bell, BookOpen, Compass, Crown, Gift, Hand, HeartHandshake, History, Layers3, LayoutDashboard, Lightbulb, LogOut, MessageSquare, Shield, Sparkles, TrendingUp, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

const userTabs = [
  ["/dashboard","Dashboard",LayoutDashboard], ["/palm-reading","Palm reading",Hand],
  ["/tarot-reading","Tarot reading",Layers3], ["/life-trends","Life trends",TrendingUp],
  ["/insights","Insights",Lightbulb], ["/guidance","Guidance",Compass],
  ["/recommendations","Recommendations",Gift], ["/history","History",History],
  ["/consultations","Consultations",HeartHandshake], ["/feedback","Complaints",MessageSquare],
  ["/notifications","Notifications",Bell],
];
const tarotReaderTabs = [["/tarot-reader","Reader dashboard",BookOpen],["/tarot-reading","Tarot workspace",Layers3],["/feedback","Complaints",MessageSquare],["/notifications","Notifications",Bell]];
const consultantTabs = [["/consultant","Consultant dashboard",HeartHandshake],["/feedback","Complaints",MessageSquare],["/notifications","Notifications",Bell]];
const adminTabs = [["/admin","Admin console",Shield],["/admin/complaints","Complaints",MessageSquare],["/notifications","Notifications",Bell]];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const role = String(user?.role || "user").toLowerCase();
  const isAdmin = role === "admin", isTarotReader = role === "tarot_reader", isConsultant = role === "consultant";
  const tabs = isAdmin ? adminTabs : isTarotReader ? tarotReaderTabs : isConsultant ? consultantTabs : userTabs;
  const loadUnreadCount = useCallback(async () => {
    if (!user) { setUnreadCount(0); return; }
    try { const r = await api.get("/api/notifications/unread-count"); setUnreadCount(Math.max(0, Number(r.data?.unread_count ?? 0))); }
    catch (e) { console.error("Unable to load unread notification count.", e); }
  }, [user]);
  useEffect(() => {
    if (!user) { setUnreadCount(0); return undefined; }
    loadUnreadCount();
    const timer = window.setInterval(loadUnreadCount, 30000);
    return () => window.clearInterval(timer);
  }, [user, loadUnreadCount]);
  useEffect(() => {
    window.addEventListener("notifications-updated", loadUnreadCount);
    return () => window.removeEventListener("notifications-updated", loadUnreadCount);
  }, [loadUnreadCount]);
  const homePath = isAdmin ? "/admin" : isTarotReader ? "/tarot-reader" : isConsultant ? "/consultant" : "/dashboard";
  const shellClass = ["app-shell", isAdmin && "admin-shell", isTarotReader && "tarot-reader-shell", isConsultant && "consultant-shell"].filter(Boolean).join(" ");
  return <div className={shellClass}>
    <header className="topbar">
      <Link to={homePath} className="brand"><span className="brand-icon">{isAdmin?<Crown size={21}/>:isTarotReader?<BookOpen size={21}/>:isConsultant?<HeartHandshake size={21}/>:<Sparkles size={21}/>}</span><span>Palmistry <i>&amp;</i> Tarot</span></Link>
      <nav className="top-actions">{user ? <>
        {isAdmin && <span className="role-mode-pill admin"><Shield size={13}/> Administrator</span>}
        {isTarotReader && <span className="role-mode-pill reader"><BookOpen size={13}/> Tarot Reader</span>}
        {isConsultant && <span className="role-mode-pill consultant"><HeartHandshake size={13}/> Spiritual Consultant</span>}
        <span className="signed-user">{user.full_name || user.email || "Signed in"}</span>
        <NavLink to="/profile"><UserRound size={16}/> My profile</NavLink>
        <button type="button" className="nav-logout" onClick={()=>{logout();navigate("/login");}}><LogOut size={16}/> Sign out</button>
      </> : <><NavLink to="/login">Sign in</NavLink><Link className="nav-cta" to="/register">Create account</Link></>}</nav>
    </header>
    {user && <div className={`feature-nav ${isAdmin?"admin-feature-nav":isTarotReader?"tarot-reader-feature-nav":isConsultant?"consultant-feature-nav":""}`} aria-label="Main navigation">
      {tabs.map(([to,label,Icon])=><NavLink key={to} to={to} end={["/dashboard","/admin","/tarot-reader","/consultant"].includes(to)}>
        <span className="layout-tab-icon"><Icon size={16}/>{label==="Notifications"&&unreadCount>0&&<span className="notification-count" aria-label={`${unreadCount} unread notifications`}>{unreadCount>99?"99+":unreadCount}</span>}</span><span>{label}</span>
      </NavLink>)}
    </div>}
    <main>{children}</main>
    <footer>© {new Date().getFullYear()} Palmistry &amp; Tarot Intelligence · {isAdmin?"Administrator control centre":isTarotReader?"Tarot Reader workspace":isConsultant?"Spiritual Consultant workspace":"A space for reflection and self-discovery"}</footer>
    <style>{`.role-mode-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border-radius:999px;font-size:9px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.role-mode-pill.admin,.role-mode-pill.reader,.role-mode-pill.consultant{border:1px solid #d8c6a9;background:#f3e7d5;color:#70482e}.feature-nav a{position:relative;white-space:nowrap}.layout-tab-icon{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:6px}.notification-count{position:absolute;top:-10px;right:-13px;min-width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;padding:0 4px;border:2px solid #fffaf2;border-radius:999px;background:#a94335;color:#fff;font-size:9px;font-weight:900;line-height:1;z-index:2}.admin-feature-nav,.tarot-reader-feature-nav,.consultant-feature-nav{display:flex;align-items:center;gap:7px}@media(max-width:760px){.feature-nav{overflow-x:auto}.notification-count{top:-8px;right:-10px}}`}</style>
  </div>;
}
