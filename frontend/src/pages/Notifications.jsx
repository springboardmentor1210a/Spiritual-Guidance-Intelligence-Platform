import { useEffect, useMemo, useState } from "react";

import {

  Bell, Check, CheckCheck, ExternalLink, Settings2, Sparkles, Trash2,

  CalendarClock, RefreshCw

} from "lucide-react";

import { useNavigate } from "react-router-dom";

import api from "../api/client";

import { useAuth } from "../context/AuthContext";



const TYPE_META = {

  daily_guidance: { label: "Daily guidance", icon: Sparkles },

  reading_reminder: { label: "Reading reminder", icon: Bell },

  insight_update: { label: "Insight update", icon: Sparkles },

  spiritual_growth: { label: "Spiritual growth", icon: Sparkles },

  platform_announcement: { label: "Platform announcement", icon: Bell },

  consultation_update: { label: "Consultation update", icon: CalendarClock },

};



const ROLE_SETTINGS = {

  user: [

    ["daily_guidance", "Daily guidance", "Personal reflection prompts and daily guidance."],

    ["reading_reminders", "Reading reminders", "Reminders to return to your Palm or Tarot readings."],

    ["insight_updates", "Insight updates", "Updates about saved readings and reflection activity."],

    ["spiritual_growth_alerts", "Spiritual growth", "Prompts to reflect on recurring themes."],

    ["platform_announcements", "Platform announcements", "Important updates from the platform."],

  ],

  tarot_reader: [

    ["insight_updates", "Reading activity updates", "Updates related to Tarot reading activity in your workspace."],

    ["platform_announcements", "Platform announcements", "Important platform updates."],

  ],

  consultant: [

    ["platform_announcements", "Platform announcements", "Important platform updates."],

  ],

  admin: [

    ["platform_announcements", "Platform announcements", "Platform-level announcements and important updates."],

  ],

};



function roleOf(user) {

  const role = String(user?.role || "user").toLowerCase();

  return ROLE_SETTINGS[role] ? role : "user";

}

function roleTitle(role) {

  return ({

    user: "Member",

    tarot_reader: "Tarot Reader",

    consultant: "Spiritual Consultant",

    admin: "Administrator",

  })[role] || "Member";

}

function relativeTime(value) {

  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));

  if (minutes < 1) return "Just now";

  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString();

}



function NotificationPreferences({ preferences, role, onSave, saving }) {

  const [draft, setDraft] = useState(preferences);

  useEffect(() => setDraft(preferences), [preferences]);

  const settings = ROLE_SETTINGS[role] || ROLE_SETTINGS.user;

  return (

    <section className="ntf-preferences">

      <div className="ntf-section-heading">

        <p className="ntf-eyebrow">PERSONAL SETTINGS · {roleTitle(role).toUpperCase()}</p>

        <h2>{role === "user" ? "Your notification preferences" : `${roleTitle(role)} notification preferences`}</h2>

        <p>These options are tailored to your role. Essential consultation request and status updates are kept visible so you do not miss workflow changes.</p>

      </div>

      <div className="ntf-setting-list">

        {settings.map(([key, title, description]) => (

          <label className="ntf-setting" key={key}>

            <span><strong>{title}</strong><small>{description}</small></span>

            <input

              type="checkbox"

              checked={Boolean(draft?.[key])}

              onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.checked }))}

            />

          </label>

        ))}

      </div>

      <button type="button" className="ntf-button ntf-button-primary" onClick={() => onSave(draft)} disabled={saving}>

        {saving ? "Saving..." : "Save preferences"}

      </button>

    </section>

  );

}



export default function Notifications() {

  const navigate = useNavigate();

  const { user } = useAuth();

  const role = roleOf(user);

  const [items, setItems] = useState([]);

  const [unread, setUnread] = useState(0);

  const [preferences, setPreferences] = useState(null);

  const [showPreferences, setShowPreferences] = useState(false);

  const [busy, setBusy] = useState(true);

  const [saving, setSaving] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");



  async function load(showSpinner = true) {

    if (showSpinner) setBusy(true);

    setError("");

    try {
      const notificationResponse = await api.get("/api/notifications?limit=100");
      const loaded = Array.isArray(notificationResponse.data?.items)
        ? notificationResponse.data.items
        : [];

      setItems(loaded);
      setUnread(
        Number(
          notificationResponse.data?.unread_count ??
          loaded.filter((item) => !item.is_read).length
        )
      );

      // Notification display must not depend on preferences being available.
      try {
        const preferenceResponse = await api.get("/api/notifications/preferences");
        setPreferences(
          preferenceResponse.data?.preferences || preferenceResponse.data || {}
        );
      } catch (preferenceError) {
        console.warn("Unable to load notification preferences.", preferenceError);
        setPreferences({});
      }

      window.dispatchEvent(new Event("notifications-updated"));
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        "Unable to load notifications. Please refresh and try again."
      );
    } finally {

      setBusy(false);

      setRefreshing(false);

    }

  }

  useEffect(() => { load(); }, []);



  async function refresh() {

    setRefreshing(true);

    await load(false);

  }

  async function markRead(item, navigateAfter = true) {

    if (!item.is_read) {

      try {

        await api.patch(`/api/notifications/${item.id}/read`);

        setItems((current) => current.map((x) => x.id === item.id ? { ...x, is_read: true } : x));

        setUnread((count) => Math.max(0, count - 1));
        window.dispatchEvent(new Event("notifications-updated"));

      } catch (err) {

        setError(err?.response?.data?.detail || "Unable to mark this notification as read.");

        return;

      }

    }

    if (navigateAfter && item.action_path) navigate(item.action_path);

  }

  async function markAllRead() {

    try {

      await api.post("/api/notifications/read-all");

      setItems((current) => current.map((item) => ({ ...item, is_read: true })));

      setUnread(0);
      window.dispatchEvent(new Event("notifications-updated"));

    } catch (err) {

      setError(err?.response?.data?.detail || "Unable to mark notifications as read.");

    }

  }

  async function remove(item) {

    try {

      await api.delete(`/api/notifications/${item.id}`);

      setItems((current) => current.filter((x) => x.id !== item.id));

      if (!item.is_read) setUnread((count) => Math.max(0, count - 1));
      window.dispatchEvent(new Event("notifications-updated"));

    } catch (err) {

      setError(err?.response?.data?.detail || "Unable to delete this notification.");

    }

  }

  async function savePreferences(next) {

    setSaving(true);

    try {

      // Send the complete preference object so hidden role settings are preserved.

      const payload = {

        daily_guidance: Boolean(next.daily_guidance),

        reading_reminders: Boolean(next.reading_reminders),

        insight_updates: Boolean(next.insight_updates),

        spiritual_growth_alerts: Boolean(next.spiritual_growth_alerts),

        platform_announcements: Boolean(next.platform_announcements),

      };

      const response = await api.put("/api/notifications/preferences", payload);

      setPreferences(response.data?.preferences || response.data || payload);

      setShowPreferences(false);

      await load(false);

    } catch (err) {

      setError(err?.response?.data?.detail || "Unable to save notification preferences.");

    } finally {

      setSaving(false);

    }

  }



  const grouped = useMemo(() => {

    const groups = new Map();

    items.forEach((item) => {

      const d = new Date(item.created_at);

      const key = Number.isNaN(d.getTime()) ? "Earlier" : d.toLocaleDateString(undefined, {

        year: "numeric", month: "long", day: "numeric"

      });

      if (!groups.has(key)) groups.set(key, []);

      groups.get(key).push(item);

    });

    return Array.from(groups.entries());

  }, [items]);



  return (

    <div className="page-container ntf-page">

      <style>{`

        .ntf-page{width:min(1160px,calc(100% - 36px));margin:34px auto 64px;color:#493226;font-size:15px}

        .ntf-hero{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;padding:36px 40px;border:1px solid #dfcbb7;border-radius:22px;background:linear-gradient(135deg,#fffdf9 0%,#f8ecdc 100%);box-shadow:0 14px 36px rgba(72,48,32,.06)}

        .ntf-eyebrow{margin:0 0 11px;color:#a16f48;font-size:11px;font-weight:900;letter-spacing:.19em}

        .ntf-hero h1{margin:0;color:#432d20;font:500 clamp(32px,4vw,45px)/1.12 Georgia,serif}

        .ntf-hero-copy{max-width:750px;margin:13px 0 0;color:#79614f;font-size:15px;line-height:1.8}

        .ntf-role-pill{display:inline-flex;margin-top:14px;padding:7px 10px;border:1px solid #e1cbb4;border-radius:999px;background:#fff8ef;color:#866044;font-size:11px;font-weight:850;letter-spacing:.06em}

        .ntf-hero-actions{display:flex;flex-wrap:wrap;gap:9px;flex-shrink:0}

        .ntf-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;border:1px solid #d7bda4;border-radius:10px;padding:11px 15px;background:#fffdf9;color:#654731;font-size:13px;font-weight:800;cursor:pointer;transition:background .18s ease,transform .18s ease}

        .ntf-button:hover{background:#f7ecdf;transform:translateY(-1px)}.ntf-button:disabled{opacity:.6;cursor:wait;transform:none}

        .ntf-button-primary{border-color:#5c3e2b;background:#5c3e2b;color:#fffaf4}.ntf-button-primary:hover{background:#714d35}

        .ntf-summary{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:18px 0;padding:16px 20px;border:1px solid #e4d2c0;border-radius:13px;background:rgba(255,252,247,.85);color:#755b46;font-size:14px}

        .ntf-summary strong{color:#533927;font-size:17px}

        .ntf-error{margin:16px 0;padding:14px 16px;border:1px solid #e3bfb6;border-radius:11px;background:#fff4f1;color:#8b493d;font-size:14px;line-height:1.6}

        .ntf-preferences{margin-top:18px;padding:26px;border:1px solid #dfcbb7;border-radius:18px;background:#fffdf9;box-shadow:0 10px 28px rgba(72,48,32,.04)}

        .ntf-section-heading h2{margin:0;font:500 28px Georgia,serif;color:#493226}.ntf-section-heading>p:last-child{margin:9px 0 0;color:#826b59;font-size:13px;line-height:1.7}

        .ntf-setting-list{margin:20px 0;border-top:1px solid #eee1d5}.ntf-setting{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:17px 3px;border-bottom:1px solid #eee1d5;cursor:pointer}

        .ntf-setting strong,.ntf-setting small{display:block}.ntf-setting strong{color:#5a4030;font-size:15px}.ntf-setting small{margin-top:5px;color:#907967;font-size:12px;line-height:1.6}.ntf-setting input{width:19px;height:19px;accent-color:#765039;flex:none}

        .ntf-day{margin-top:28px}.ntf-day-label{margin:0 0 12px 3px;color:#9b704f;font-size:12px;font-weight:900;letter-spacing:.09em;text-transform:uppercase}

        .ntf-list{display:grid;gap:13px}.ntf-item{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:stretch;gap:10px;overflow:hidden;border:1px solid #e2d2c2;border-radius:15px;background:#fffdf9;box-shadow:0 5px 17px rgba(72,48,32,.035);transition:border-color .18s ease,box-shadow .18s ease}

        .ntf-item:hover{border-color:#c9a783;box-shadow:0 9px 24px rgba(72,48,32,.07)}.ntf-item.is-unread{border-left:5px solid #a97850;background:#fffaf3}

        .ntf-main{display:flex;align-items:flex-start;gap:15px;width:100%;min-width:0;padding:20px 18px;border:0;background:transparent;color:inherit;text-align:left;cursor:pointer}

        .ntf-icon{display:flex;align-items:center;justify-content:center;width:48px;height:48px;flex:0 0 48px;border-radius:13px;background:#f1e3d3;color:#795236}

        .ntf-copy{display:flex;flex:1;flex-direction:column;min-width:0;gap:8px}.ntf-meta{display:flex;align-items:center;flex-wrap:wrap;gap:9px;color:#9a775c;font-size:12px}

        .ntf-type{padding:5px 9px;border:1px solid #ead8c4;border-radius:999px;background:#fcf4e9;color:#8b6547;font-weight:850}.ntf-meta time{color:#a28c7a}

        .ntf-title{color:#4a3223;font-size:16px;font-weight:850;line-height:1.5;overflow-wrap:anywhere}.ntf-message{color:#78614f;font-size:14px;line-height:1.75;overflow-wrap:anywhere}

        .ntf-link{display:inline-flex;align-items:center;gap:6px;margin-top:2px;color:#986d49;font-size:12px;font-weight:850}

        .ntf-unread-dot{width:9px;height:9px;flex:0 0 9px;margin:8px 0 0 3px;border-radius:50%;background:#a97850}

        .ntf-actions{display:flex;align-items:center;gap:7px;padding:0 15px 0 0}

        .ntf-icon-button{display:inline-flex;align-items:center;justify-content:center;width:39px;height:39px;border:1px solid #e2d1bf;border-radius:10px;background:#fffaf4;color:#76543b;cursor:pointer}

        .ntf-icon-button:hover{border-color:#b68d69;background:#f4e7d8}

        .ntf-empty{margin-top:18px;padding:54px 24px;border:1px dashed #d9c4ae;border-radius:17px;background:#fffdf9;text-align:center;color:#8c6c52}

        .ntf-empty-icon{display:flex;align-items:center;justify-content:center;width:62px;height:62px;margin:0 auto 16px;border-radius:18px;background:#f1e3d3;color:#795236}

        .ntf-empty h2{margin:0;color:#4b3324;font:500 28px Georgia,serif}.ntf-empty p{max-width:550px;margin:10px auto 0;color:#846c59;font-size:14px;line-height:1.8}

        .ntf-loading{margin-top:18px;padding:34px;border:1px solid #e2d2c2;border-radius:14px;background:#fffdf9;color:#795f4a;font-size:15px}

        @media(max-width:800px){.ntf-page{width:calc(100% - 22px);margin-top:16px}.ntf-hero{align-items:flex-start;flex-direction:column;padding:26px 22px}.ntf-hero-actions{width:100%}.ntf-button{flex:1}.ntf-item{grid-template-columns:minmax(0,1fr)}.ntf-actions{justify-content:flex-end;padding:0 14px 14px}.ntf-main{padding:16px 13px;gap:11px}.ntf-icon{width:40px;height:40px;flex-basis:40px}.ntf-summary{align-items:flex-start;flex-direction:column}}

      `}</style>



      <header className="ntf-hero">

        <div>

          <p className="ntf-eyebrow">STAY CONNECTED</p>

          <h1>Notifications</h1>

          <p className="ntf-hero-copy">Important updates for your Palmistry &amp; Tarot workspace, gathered in one place.</p>

          <span className="ntf-role-pill">{roleTitle(role)} workspace</span>

        </div>

        <div className="ntf-hero-actions">

          <button type="button" className="ntf-button" onClick={() => setShowPreferences((v) => !v)}><Settings2 size={17}/> Preferences</button>

          <button type="button" className="ntf-button" onClick={refresh} disabled={refreshing}><RefreshCw size={17}/>{refreshing ? "Refreshing..." : "Refresh"}</button>

          {unread > 0 && <button type="button" className="ntf-button ntf-button-primary" onClick={markAllRead}><CheckCheck size={17}/> Mark all read ({unread})</button>}

        </div>

      </header>



      <div className="ntf-summary"><span><strong>{items.length}</strong> notifications</span><span><strong>{unread}</strong> unread</span></div>

      {showPreferences && preferences && <NotificationPreferences preferences={preferences} role={role} onSave={savePreferences} saving={saving}/>}

      {error && <div className="ntf-error">{error}</div>}

      {busy ? <section className="ntf-loading">Loading your notifications...</section> : !items.length ? (

        <section className="ntf-empty"><div className="ntf-empty-icon"><Bell size={28}/></div><h2>You are all caught up</h2><p>New notifications relevant to your {roleTitle(role).toLowerCase()} workspace will appear here. Consultation updates are shown here when available.</p></section>

      ) : (

        <div className="ntf-groups">{grouped.map(([date, group]) => (

          <section className="ntf-day" key={date}><h2 className="ntf-day-label">{date}</h2><div className="ntf-list">

            {group.map((item) => {

              const meta = TYPE_META[item.type] || { label: "Notification", icon: Bell };

              const Icon = meta.icon;

              return <article className={`ntf-item ${item.is_read ? "is-read" : "is-unread"}`} key={item.id}>

                <button type="button" className="ntf-main" onClick={() => markRead(item)} aria-label={`Open notification: ${item.title}`}>

                  <span className="ntf-icon"><Icon size={22}/></span>

                  <span className="ntf-copy"><span className="ntf-meta"><span className="ntf-type">{meta.label}</span><time>{relativeTime(item.created_at)}</time></span>

                    <strong className="ntf-title">{item.title}</strong><span className="ntf-message">{item.message}</span>

                    {item.action_path && <span className="ntf-link">Open related space <ExternalLink size={14}/></span>}

                  </span>

                  {!item.is_read && <span className="ntf-unread-dot"/>}

                </button>

                <div className="ntf-actions">

                  {!item.is_read && <button type="button" className="ntf-icon-button" title="Mark as read" aria-label="Mark as read" onClick={() => markRead(item, false)}><Check size={18}/></button>}

                  <button type="button" className="ntf-icon-button" title="Delete notification" aria-label="Delete notification" onClick={() => remove(item)}><Trash2 size={18}/></button>

                </div>

              </article>;

            })}

          </div></section>

        ))}</div>

      )}

    </div>

  );

}
