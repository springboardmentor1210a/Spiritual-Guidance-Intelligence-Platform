import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import api from "../api";

import {
  Link,
  useLocation,
} from "react-router-dom";

/*
 * ============================================================
 * LUNARA NAVBAR
 * ============================================================
 *
 * Visual direction:
 *
 * Ancient:
 * - Aged parchment
 * - Burnt wood
 * - Antique gold
 * - Manuscript ornaments
 *
 * Futuristic:
 * - Smooth transitions
 * - Animated gold sweep
 * - Hover illumination
 * - Mobile navigation animation
 * - Active route illumination
 *
 * ============================================================
 */

const Navbar = ({
  user,
}) => {
  const location = useLocation();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  // Persistent notifications are loaded from the authenticated backend.
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationPosition, setNotificationPosition] = useState({ top: 72, right: 16 });
  const notificationButtonRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");

  const notificationAccountKey = user?.id ?? user?.email ?? user?.role ?? null;

  const loadNotifications = useCallback(async () => {
    if (!notificationAccountKey) return;
    setNotificationLoading(true);
    setNotificationError("");
    try {
      const response = await api.get("/api/notifications/me", {
        params: { limit: 50 },
      });
      const payload = response?.data || {};
      const items = Array.isArray(payload.items)
        ? payload.items
        : Array.isArray(payload.notifications)
          ? payload.notifications
          : [];
      setNotifications(items);
      setNotificationUnreadCount(
        Number.isFinite(Number(payload.unread_count))
          ? Number(payload.unread_count)
          : items.filter((item) => !item.is_read).length
      );
    } catch (error) {
      setNotificationError(
        error?.response?.data?.detail ||
          "Notifications could not be loaded. Please try again."
      );
    } finally {
      setNotificationLoading(false);
    }
  }, [notificationAccountKey]);

  useEffect(() => {
    // Defer the initial request until after the effect has completed so
    // notification state updates do not happen synchronously in the effect.
    const timerId = window.setTimeout(() => {
      loadNotifications();
    }, 0);

    // Refresh when the authenticated account changes; the panel also supports manual refresh.
    return () => window.clearTimeout(timerId);
  }, [loadNotifications]);

  useEffect(() => {
    if (!notificationsOpen) return undefined;
    const reposition = () => {
      const rect = notificationButtonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const top = Math.min(rect.bottom + 8, Math.max(12, window.innerHeight - 220));
      setNotificationPosition({
        top,
        right: Math.max(12, window.innerWidth - rect.right),
        maxHeight: Math.max(180, window.innerHeight - top - 16),
      });
    };
    reposition();
    window.addEventListener('resize', reposition);
    return () => window.removeEventListener('resize', reposition);
  }, [notificationsOpen]);

  const markNotificationRead = async (notification) => {
    if (!notification?.id || notification.is_read) return;
    try {
      await api.patch(`/api/notifications/${notification.id}/read`, {
        is_read: true,
      });
      setNotifications((current) => current.map((item) =>
        item.id === notification.id ? { ...item, is_read: true } : item
      ));
      setNotificationUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      setNotificationError(
        error?.response?.data?.detail ||
          "This notification could not be marked as read."
      );
    }
  };

  /*
   * ==========================================================
   * ROLE-AWARE NAVIGATION
   * ==========================================================
   *
   * Lunara serves several different kinds of authenticated users.
   * The navigation therefore changes according to the authenticated
   * role instead of presenting every account with the seeker's tools.
   *
   * Supported roles:
   *   User / Seeker
   *   Tarot Reader
   *   Palm Analyst
   *   Spiritual Consultant
   *   Administrator
   *
   * Existing URLs are intentionally preserved.
   */

  const normalizedRole = (() => {
    if (user?.role === null || user?.role === undefined) {
      return "";
    }

    return String(user.role)
      .trim()
      .toLowerCase()
      .replace(/[-_]+/g, " ")
      .replace(/\\s+/g, " ");
  })();

  const roleNavigation = {
    user: {
      label: "Seeker",
      badge: "SEEKER",
      descriptor: "Personal Archive",
      items: [
        { label: "Dashboard", path: "/dashboard", symbol: "⌂", description: "Your Lunara journey" },
        { label: "Palm Reading", path: "/palm-reader", symbol: "✋", description: "Read the lines of destiny" },
        { label: "Tarot", path: "/tarot-reader", symbol: "◇", description: "Consult the arcana" },
        { label: "Guidance", path: "/guidance", symbol: "☾", description: "Explore spiritual guidance" },
        { label: "Profile", path: "/profile", symbol: "♙", description: "Your personal archive" },
      ],
    },

    seeker: {
      label: "Seeker",
      badge: "SEEKER",
      descriptor: "Personal Archive",
      items: [
        { label: "Dashboard", path: "/dashboard", symbol: "⌂", description: "Your Lunara journey" },
        { label: "Palm Reading", path: "/palm-reader", symbol: "✋", description: "Read the lines of destiny" },
        { label: "Tarot", path: "/tarot-reader", symbol: "◇", description: "Consult the arcana" },
        { label: "Guidance", path: "/guidance", symbol: "☾", description: "Explore spiritual guidance" },
        { label: "Profile", path: "/profile", symbol: "♙", description: "Your personal archive" },
      ],
    },

    tarot: {
      label: "Tarot Reader",
      badge: "TAROT READER",
      descriptor: "Arcana Practitioner",
      items: [
        { label: "Dashboard", path: "/dashboard", symbol: "⌂", description: "Reader command center" },
        { label: "Tarot Workspace", path: "/tarot-workspace", symbol: "◇", description: "Review and evaluate seeker tarot readings" },
        { label: "Profile", path: "/profile", symbol: "♙", description: "Practitioner archive" },
      ],
    },

    "tarot reader": {
      label: "Tarot Reader",
      badge: "TAROT READER",
      descriptor: "Arcana Practitioner",
      items: [
        { label: "Dashboard", path: "/dashboard", symbol: "⌂", description: "Reader command center" },
        { label: "Tarot Workspace", path: "/tarot-workspace", symbol: "◇", description: "Review and evaluate seeker tarot readings" },
        { label: "Profile", path: "/profile", symbol: "♙", description: "Practitioner archive" },
      ],
    },

    tarotreader: {
      label: "Tarot Reader",
      badge: "TAROT READER",
      descriptor: "Arcana Practitioner",
      items: [
        { label: "Dashboard", path: "/dashboard", symbol: "⌂", description: "Reader command center" },
        { label: "Tarot Workspace", path: "/tarot-workspace", symbol: "◇", description: "Review and evaluate seeker tarot readings" },
        { label: "Profile", path: "/profile", symbol: "♙", description: "Practitioner archive" },
      ],
    },

    palm: {
      label: "Palm Analyst",
      badge: "PALM ANALYST",
      descriptor: "Palmistry Practitioner",
      items: [
        { label: "Dashboard", path: "/dashboard", symbol: "⌂", description: "Analyst command center" },
        { label: "Palm Workspace", path: "/palm-workspace", symbol: "✋", description: "Review AI-generated palm analyses" },
        { label: "Profile", path: "/profile", symbol: "♙", description: "Practitioner archive" },
      ],
    },

    "palm analyst": {
      label: "Palm Analyst",
      badge: "PALM ANALYST",
      descriptor: "Palmistry Practitioner",
      items: [
        { label: "Dashboard", path: "/dashboard", symbol: "⌂", description: "Analyst command center" },
        { label: "Palm Workspace", path: "/palm-workspace", symbol: "✋", description: "Review AI-generated palm analyses" },
        { label: "Profile", path: "/profile", symbol: "♙", description: "Practitioner archive" },
      ],
    },

    palmanalyst: {
      label: "Palm Analyst",
      badge: "PALM ANALYST",
      descriptor: "Palmistry Practitioner",
      items: [
        { label: "Dashboard", path: "/dashboard", symbol: "⌂", description: "Analyst command center" },
        { label: "Palm Workspace", path: "/palm-workspace", symbol: "✋", description: "Review AI-generated palm analyses" },
        { label: "Profile", path: "/profile", symbol: "♙", description: "Practitioner archive" },
      ],
    },

    consultant: {
      label: "Spiritual Consultant",
      badge: "SPIRITUAL CONSULTANT",
      descriptor: "Guidance Practitioner",
      items: [
        { label: "Dashboard", path: "/dashboard", symbol: "⌂", description: "Consultant command center" },
        { label: "Consultations", path: "/consultations", symbol: "☿", description: "Manage guidance work" },
        { label: "Profile", path: "/profile", symbol: "♙", description: "Practitioner archive" },
      ],
    },

    "spiritual consultant": {
      label: "Spiritual Consultant",
      badge: "SPIRITUAL CONSULTANT",
      descriptor: "Guidance Practitioner",
      items: [
        { label: "Dashboard", path: "/dashboard", symbol: "⌂", description: "Consultant command center" },
        { label: "Consultations", path: "/consultations", symbol: "☿", description: "Manage guidance work" },
        { label: "Profile", path: "/profile", symbol: "♙", description: "Practitioner archive" },
      ],
    },

    spiritualconsultant: {
      label: "Spiritual Consultant",
      badge: "SPIRITUAL CONSULTANT",
      descriptor: "Guidance Practitioner",
      items: [
        { label: "Dashboard", path: "/dashboard", symbol: "⌂", description: "Consultant command center" },
        { label: "Consultations", path: "/consultations", symbol: "☿", description: "Manage guidance work" },
        { label: "Profile", path: "/profile", symbol: "♙", description: "Practitioner archive" },
      ],
    },

    admin: {
      label: "Administrator",
      badge: "ADMINISTRATOR",
      descriptor: "System Archive",
      items: [
        { label: "Dashboard", path: "/dashboard", symbol: "⌂", description: "System command center" },
        { label: "Profiles", path: "/profile", symbol: "♙", description: "Administrator profile" },
      ],
    },

    administrator: {
      label: "Administrator",
      badge: "ADMINISTRATOR",
      descriptor: "System Archive",
      items: [
        { label: "Dashboard", path: "/dashboard", symbol: "⌂", description: "System command center" },
        { label: "Profiles", path: "/profile", symbol: "♙", description: "Administrator profile" },
      ],
    },
  };

  const activeRoleConfig =
    roleNavigation[normalizedRole] || roleNavigation.user;

  const navigationItems = activeRoleConfig.items;
  const displayName = user?.nickname || user?.first_name || activeRoleConfig.label;
  const avatarInitials = String(displayName || 'L')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  const getNavigationAccessibility = (item, active) => {
    const currentSuffix = active ? ' — current page' : '';

    return {
      ariaLabel: `${item.label}${currentSuffix}: ${item.description}`,
      title: `${item.label}${currentSuffix}`
    };
  };

  /*
   * ==========================================================
   * ACTIVE ROUTE
   * ==========================================================
   */

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    return location.pathname.startsWith(path);
  };

  /*
   * ==========================================================
   * CLOSE MOBILE NAVIGATION
   * ==========================================================
   */

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const handleNavigationClick = (path) => {
    closeMobileMenu();

    if (path === "/guidance") {
      window.setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 0);
    }
  };

  /*
   * ==========================================================
   * NAVBAR
   * ==========================================================
   */

  return (
    <>
      <header
        style={{
          position: "fixed",

          top: 0,

          left: 0,

          right: 0,

          zIndex: 1000,

          width: "100%",

          padding:
            "10px 18px",

          boxSizing: "border-box",

          display: "flex",

          justifyContent: "center",

          pointerEvents: "none",
        }}
      >
        <div
          style={{
            pointerEvents: "auto",

            width: "min(1240px, 100%)",

            minHeight: "68px",

            display: "flex",

            alignItems: "center",

            justifyContent: "space-between",

            gap: "20px",

            padding:
              "8px 12px 8px 20px",

            boxSizing: "border-box",

            border:
              "2px solid rgba(107,53,24,.88)",

            borderRadius: "12px",

            background:
              "linear-gradient(135deg, rgba(224,173,82,.97), rgba(183,117,36,.96))",

            boxShadow:
              "0 12px 35px rgba(58,28,13,.38), inset 0 1px 0 rgba(255,235,166,.65)",

            backdropFilter: "blur(10px)",

            WebkitBackdropFilter: "blur(10px)",

            position: "relative",

            overflow: "hidden",
          }}
        >

          {/* =================================================
              ANIMATED GOLD LIGHT
              ================================================= */}

          <span
            aria-hidden="true"
            style={{
              position: "absolute",

              top: 0,

              bottom: 0,

              left: "-30%",

              width: "25%",

              transform:
                "skewX(-20deg)",

              background:
                "linear-gradient(90deg, transparent, rgba(255,236,166,.25), transparent)",

              animation:
                "lunaraNavbarSweep 7s ease-in-out infinite",

              pointerEvents: "none",
            }}
          />

          {/* =================================================
              BRAND
              ================================================= */}

          <Link
            to="/dashboard"
            onClick={closeMobileMenu}
            style={{
              position: "relative",

              zIndex: 2,

              display: "flex",

              alignItems: "center",

              gap: "10px",

              color: "#3a1c0d",

              textDecoration: "none",

              minWidth: "150px",
            }}
          >
            <span
              style={{
                width: "42px",

                height: "42px",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                border:
                  "1px solid #9a6b20",

                borderRadius: "50%",

                color: "#e5bd5b",

                background:
                  "linear-gradient(145deg, #4a2412, #6b3518)",

                fontSize: "1.35rem",

                boxShadow:
                  "0 0 18px rgba(229,189,91,.25)",

                animation:
                  "lunaraBrandPulse 4s ease-in-out infinite",
              }}
            >
              ✧
            </span>

            <span
              style={{
                display: "flex",

                flexDirection: "column",

                lineHeight: 1,
              }}
            >
              <span
                style={{
                  fontSize: "1.45rem",

                  fontWeight: 700,

                  letterSpacing: "0.08em",

                  textShadow:
                    "0 1px rgba(255,224,137,.6)",
                }}
              >
                LUNARA
              </span>

              <span
                style={{
                  marginTop: "5px",

                  fontSize: "0.58rem",

                  fontWeight: 700,

                  letterSpacing: "0.18em",

                  textTransform: "uppercase",

                  opacity: 0.68,
                }}
              >
                Ancient Wisdom
              </span>

              <span
                style={{
                  marginTop: "4px",

                  fontSize: "0.48rem",

                  fontWeight: 800,

                  letterSpacing: "0.12em",

                  textTransform: "uppercase",

                  color: "#6b3518",

                  opacity: 0.76,
                }}
              >
                {activeRoleConfig.descriptor}
              </span>
            </span>
          </Link>

          {/* =================================================
              DESKTOP NAVIGATION
              ================================================= */}

          <nav
            className="lunara-desktop-nav"
            style={{
              position: "relative",

              zIndex: 2,

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              gap: "5px",

              flex: 1,
            }}
          >
            {navigationItems.map((item) => {
              const active =
                isActive(item.path);

              const accessibility =
                getNavigationAccessibility(item, active);

              return (
                <Link
                  key={`${item.path}-${item.label}`}
                  to={item.path}
                  onClick={() =>
                    handleNavigationClick(item.path)
                  }
                  aria-label={accessibility.ariaLabel}
                  title={accessibility.title}
                  aria-current={active ? "page" : undefined}
                  style={{
                    position: "relative",

                    display: "flex",

                    alignItems: "center",

                    gap: "7px",

                    padding:
                      "10px 13px",

                    borderRadius: "7px",

                    color: active
                      ? "#f7df9b"
                      : "#3a1c0d",

                    background: active
                      ? "linear-gradient(135deg, #4a2412, #6b3518)"
                      : "transparent",

                    border:
                      active
                        ? "1px solid #c89b3c"
                        : "1px solid transparent",

                    textDecoration: "none",

                    fontSize: "0.86rem",

                    fontWeight: 700,

                    transition:
                      "all 220ms ease",

                    boxShadow: active
                      ? "0 5px 15px rgba(58,28,13,.28), 0 0 14px rgba(229,189,91,.18)"
                      : "none",
                  }}
                  onMouseEnter={(event) => {
                    if (!active) {
                      event.currentTarget.style.background =
                        "rgba(240,198,106,.42)";

                      event.currentTarget.style.borderColor =
                        "rgba(107,53,24,.4)";

                      event.currentTarget.style.transform =
                        "translateY(-2px)";
                    }
                  }}
                  onMouseLeave={(event) => {
                    if (!active) {
                      event.currentTarget.style.background =
                        "transparent";

                      event.currentTarget.style.borderColor =
                        "transparent";

                      event.currentTarget.style.transform =
                        "translateY(0)";
                    }
                  }}
                >
                  <span
                    style={{
                      fontSize: "1rem",

                      color: active
                        ? "#e5bd5b"
                        : "#6b3518",
                    }}
                  >
                    {item.symbol}
                  </span>

                  <span>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* =================================================
              USER AREA
              ================================================= */}

          <div
            className="lunara-desktop-user"
            style={{
              position: "relative",

              zIndex: 2,

              display: "flex",

              alignItems: "center",

              gap: "9px",
            }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <button
                ref={notificationButtonRef}
                type="button"
                aria-label={`Notifications${notificationUnreadCount ? `, ${notificationUnreadCount} unread` : ""}`}
                aria-expanded={notificationsOpen}
                onClick={() => {
                  const nextOpen = !notificationsOpen;
                  setNotificationsOpen(nextOpen);
                  if (nextOpen) {
                    const rect = notificationButtonRef.current?.getBoundingClientRect();
                    if (rect) {
                      const top = Math.min(rect.bottom + 8, Math.max(12, window.innerHeight - 220));
                      setNotificationPosition({ top, right: Math.max(12, window.innerWidth - rect.right), maxHeight: Math.max(180, window.innerHeight - top - 16) });
                    }
                  }
                  if (nextOpen) loadNotifications();
                }}
                style={{
                  position: "relative",
                  minWidth: "40px",
                  minHeight: "40px",
                  padding: "8px",
                  border: "1px solid #9a6b20",
                  borderRadius: "7px",
                  color: "#f7df9b",
                  background: "linear-gradient(135deg, #4a2412, #6b3518)",
                  cursor: "pointer",
                  fontSize: "1.05rem",
                }}
              >
                ♧
                {notificationUnreadCount > 0 && (
                  <span style={{
                    position: "absolute", top: "-6px", right: "-6px",
                    minWidth: "17px", height: "17px", padding: "0 3px",
                    borderRadius: "999px", background: "#8b0000", color: "#fff7df",
                    border: "1px solid #f3d27a", fontSize: "0.62rem",
                    fontWeight: 800, lineHeight: "16px",
                  }}>{notificationUnreadCount > 99 ? "99+" : notificationUnreadCount}</span>
                )}
              </button>
              {notificationsOpen && createPortal(
                <div role="dialog" aria-label="Notifications" style={{
                  position: "fixed", top: notificationPosition.top, right: notificationPosition.right,
                  width: "min(360px, calc(100vw - 24px))",
                  maxHeight: `min(480px, ${notificationPosition.maxHeight || 480}px)`, overflowY: "auto", zIndex: 3000,
                  padding: "14px", border: "1px solid #9a6b20", borderRadius: "10px",
                  background: "linear-gradient(145deg, #fff6d9, #ead5a4)",
                  boxShadow: "0 14px 35px rgba(35,18,8,.32)", color: "#3a1c0d", textAlign: "left",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "10px" }}>
                    <strong style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>Notifications</strong>
                    <button type="button" onClick={loadNotifications} disabled={notificationLoading} style={{ border: "1px solid #9a6b20", borderRadius: "5px", padding: "5px 8px", background: "#fff1c4", color: "#4a2412", cursor: "pointer" }}>
                      {notificationLoading ? "Refreshing…" : "Refresh"}
                    </button>
                  </div>
                  {notificationError && <p role="alert" style={{ color: "#8b0000", fontSize: "0.82rem" }}>{notificationError}</p>}
                  {notificationLoading && notifications.length === 0 && <p style={{ fontSize: "0.84rem" }}>Loading notifications…</p>}
                  {!notificationLoading && notifications.length === 0 && !notificationError && <p style={{ fontSize: "0.84rem", lineHeight: 1.5 }}>You’re all caught up. New updates will appear here.</p>}
                  {notifications.map((notification) => (
                    <div key={notification.id} style={{ padding: "10px 0", borderTop: "1px solid rgba(107,53,24,.2)", opacity: notification.is_read ? 0.78 : 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                        <strong style={{ fontSize: "0.84rem" }}>{notification.title || "Lunara update"}</strong>
                        {!notification.is_read && <span aria-label="Unread" style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#8b0000", flexShrink: 0, marginTop: "5px" }} />}
                      </div>
                      <p style={{ margin: "5px 0 7px", fontSize: "0.8rem", lineHeight: 1.45, whiteSpace: "pre-wrap" }}>{notification.message}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "0.68rem", color: "#76502d" }}>{notification.created_at ? new Date(notification.created_at).toLocaleString() : ""}</span>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          {!notification.is_read && <button type="button" onClick={() => markNotificationRead(notification)} style={{ border: 0, padding: 0, background: "transparent", color: "#6b3518", textDecoration: "underline", cursor: "pointer", fontSize: "0.72rem" }}>Mark read</button>}
                          {notification.action_url && <Link onClick={() => markNotificationRead(notification)} to={notification.action_url} style={{ color: "#6b3518", fontSize: "0.72rem", fontWeight: 700 }}>Open</Link>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>,
                document.body
              )}
            </div>
            <div
              style={{
                display: "flex",

                flexDirection: "column",

                alignItems: "flex-end",

                maxWidth: "170px",
              }}
            >
              <span
                style={{
                  maxWidth: "180px",

                  overflow: "hidden",

                  textOverflow: "ellipsis",

                  whiteSpace: "nowrap",

                  color: "#3a1c0d",

                  fontSize: "0.72rem",

                  fontWeight: 700,
                }}
              >
                {`Hello, ${displayName}`}
              </span>

              <span
                style={{
                  marginTop: "3px",

                  padding:
                    "3px 8px",

                  border:
                    "1px solid rgba(107,53,24,.45)",

                  borderRadius: "999px",

                  color: "#4a2412",

                  fontSize: "0.55rem",

                  fontWeight: 800,

                  letterSpacing: "0.08em",

                  textTransform: "uppercase",

                  background:
                    "rgba(255,235,166,.38)",

                  boxShadow:
                    "inset 0 1px rgba(255,250,220,.45)",
                }}
              >
                {activeRoleConfig.badge}
              </span>
            </div>

            <Link
              to="/profile"
              onClick={closeMobileMenu}
              aria-label="Open your profile"
              title="Open your profile"
              style={{
                width: 42,
                height: 42,
                padding: 0,
                overflow: 'hidden',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                border: '2px solid #f3d783',
                borderRadius: '50%',
                color: '#f7df9b',
                background: 'linear-gradient(145deg,#4a2412,#8b571d)',
                textDecoration: 'none',
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: '.86rem',
                fontWeight: 800,
                boxShadow: '0 3px 10px rgba(58,28,13,.25)',
              }}
            >
              {user?.profile_image
                ? <img src={user.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : avatarInitials}
            </Link>
          </div>

          {/* =================================================
              MOBILE MENU BUTTON
              ================================================= */}

          <button
            type="button"
            aria-label={
              mobileOpen
                ? "Close navigation"
                : "Open navigation"
            }
            aria-expanded={mobileOpen}
            onClick={() =>
              setMobileOpen((current) => !current)
            }
            className="lunara-mobile-menu-button"
            style={{
              position: "relative",

              zIndex: 5,

              display: "none",

              width: "44px",

              height: "44px",

              alignItems: "center",

              justifyContent: "center",

              flexDirection: "column",

              gap: "5px",

              border:
                "1px solid #9a6b20",

              borderRadius: "7px",

              background:
                "#4a2412",

              cursor: "pointer",
            }}
          >
            <span
              style={{
                width: "19px",
                height: "2px",
                background: "#e5bd5b",
                transition:
                  "transform .25s ease",
              }}
            />

            <span
              style={{
                width: "19px",
                height: "2px",
                background: "#e5bd5b",
              }}
            />

            <span
              style={{
                width: "19px",
                height: "2px",
                background: "#e5bd5b",
                transition:
                  "transform .25s ease",
              }}
            />
          </button>
        </div>

        {/* ===================================================
            MOBILE NAVIGATION
            =================================================== */}

        {mobileOpen && (
          <div
            className="lunara-mobile-panel"
            style={{
              position: "absolute",

              top: "82px",

              left: "18px",

              right: "18px",

              padding: "12px",

              border:
                "2px solid rgba(107,53,24,.88)",

              borderRadius: "12px",

              background:
                "linear-gradient(145deg, rgba(224,173,82,.98), rgba(183,117,36,.98))",

              boxShadow:
                "0 18px 40px rgba(58,28,13,.42)",

              animation:
                "lunaraMobileOpen .3s ease both",

              pointerEvents: "auto",
            }}
          >
            {navigationItems.map((item) => {
              const active =
                isActive(item.path);

              const accessibility =
                getNavigationAccessibility(item, active);

              return (
                <Link
                  key={`${item.path}-${item.label}-mobile`}
                  to={item.path}
                  onClick={() =>
                    handleNavigationClick(item.path)
                  }
                  aria-label={accessibility.ariaLabel}
                  title={accessibility.title}
                  aria-current={active ? "page" : undefined}
                  style={{
                    display: "flex",

                    alignItems: "center",

                    gap: "12px",

                    padding:
                      "13px 14px",

                    marginBottom: "5px",

                    borderRadius: "8px",

                    color: active
                      ? "#f7df9b"
                      : "#3a1c0d",

                    background: active
                      ? "#4a2412"
                      : "rgba(240,198,106,.25)",

                    border:
                      active
                        ? "1px solid #c89b3c"
                        : "1px solid rgba(107,53,24,.25)",

                    textDecoration: "none",

                    fontWeight: 700,
                  }}
                >
                  <span
                    style={{
                      color: "#9a6b20",

                      fontSize: "1.15rem",
                    }}
                  >
                    {item.symbol}
                  </span>

                  {item.label}
                </Link>
              );
            })}

            <div
              style={{
                margin:
                  "10px 5px",

                height: "1px",

                background:
                  "linear-gradient(90deg, transparent, #9a6b20, transparent)",
              }}
            />

            <div
              style={{
                padding:
                  "11px 12px",

                color: "#3a1c0d",

                textAlign: "center",

                background:
                  "rgba(255,235,166,.18)",

                border:
                  "1px solid rgba(107,53,24,.18)",

                borderRadius: "8px",

                marginBottom: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",

                  fontWeight: 700,

                  overflow: "hidden",

                  textOverflow: "ellipsis",

                  whiteSpace: "nowrap",
                }}
              >
                {`Hello, ${displayName}`}
              </div>

              <div
                style={{
                  marginTop: "4px",

                  color: "#6b3518",

                  fontSize: "0.55rem",

                  fontWeight: 800,

                  letterSpacing: "0.09em",

                  textTransform: "uppercase",
                }}
              >
                {activeRoleConfig.badge}
              </div>
            </div>

            <Link
              to="/profile"
              onClick={closeMobileMenu}
              aria-label="Open your profile"
              style={{
                width: 46,
                height: 46,
                margin: '10px auto 0',
                padding: 0,
                overflow: 'hidden',
                display: 'grid',
                placeItems: 'center',
                border: '2px solid #9a6b20',
                borderRadius: '50%',
                color: '#f7df9b',
                background: '#4a2412',
                textDecoration: 'none',
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 700,
              }}
            >
              {user?.profile_image
                ? <img src={user.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : avatarInitials}
            </Link>
          </div>
        )}
      </header>

      {/* =====================================================
          NAVBAR ANIMATIONS + RESPONSIVE CSS
          ===================================================== */}

      <style>
        {`
          @keyframes lunaraNavbarSweep {
            0%, 55% {
              left: -35%;
              opacity: 0;
            }

            65% {
              opacity: 1;
            }

            90%, 100% {
              left: 135%;
              opacity: 0;
            }
          }

          @keyframes lunaraBrandPulse {
            0%, 100% {
              box-shadow:
                0 0 12px rgba(229,189,91,.18);
            }

            50% {
              box-shadow:
                0 0 25px rgba(229,189,91,.4);
            }
          }

          @keyframes lunaraMobileOpen {
            from {
              opacity: 0;
              transform: translateY(-10px) scale(.98);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @media (max-width: 1050px) {
            .lunara-desktop-nav {
              gap: 1px !important;
            }

            .lunara-desktop-nav a {
              padding-left: 8px !important;
              padding-right: 8px !important;
            }

            .lunara-desktop-user > div:first-child {
              display: none !important;
            }
          }

          @media (max-width: 780px) {
            header {
              padding: 8px !important;
            }

            header > div {
              min-height: 60px !important;
              padding-left: 13px !important;
            }

            .lunara-desktop-nav,
            .lunara-desktop-user {
              display: none !important;
            }

            .lunara-mobile-menu-button {
              display: flex !important;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            header *,
            header {
              animation: none !important;
              transition: none !important;
            }
          }
        `}
      </style>
    </>
  );
};


/*
 * ============================================================
 * ROLE-AWARE NAVIGATION DESIGN CONTRACT
 * ============================================================
 *
 * 01. SEEKER
 * ------------------------------------------------------------
 * The seeker receives the discovery tools:
 * Dashboard, Palm Reading, Tarot and Profile.
 *
 * This is the original navigation experience and remains intact.
 *
 * 02. TAROT READER
 * ------------------------------------------------------------
 * A Tarot Reader receives:
 * Dashboard, Tarot Review Workspace and Profile.
 * The Tarot Reader does NOT receive the seeker card-drawing tool.
 *
 * Palm Reading is intentionally removed from the primary
 * navigation because it is not the reader's professional tool.
 *
 * 03. PALM ANALYST
 * ------------------------------------------------------------
 * A Palm Analyst receives:
 * Dashboard, Palm Workspace and Profile.
 *
 * Tarot is intentionally removed from the primary navigation
 * because it is not the analyst's professional workspace.
 *
 * 04. SPIRITUAL CONSULTANT
 * ------------------------------------------------------------
 * The current application does not expose a separate consultation
 * route, so the Consultations entry points to the consultant's
 * dashboard until such a route is introduced.
 *
 * This avoids inventing a backend route that does not exist.
 *
 * 05. ADMINISTRATOR
 * ------------------------------------------------------------
 * The administrator receives a minimal system-oriented navigation.
 *
 * Additional admin routes can be added later when the backend
 * exposes dedicated administration pages.
 *
 * 06. PROFILE
 * ------------------------------------------------------------
 * Profile remains available to every role, but Profile.jsx should
 * determine the correct professional or seeker presentation from
 * the same authenticated user role.
 *
 * 07. DASHBOARD
 * ------------------------------------------------------------
 * /dashboard remains the canonical landing route. App.jsx selects
 * the correct dashboard component for the current role.
 *
 * 08. ROUTE COMPATIBILITY
 * ------------------------------------------------------------
 * No existing PalmUploader or TarotReader routes were deleted.
 * Seekers continue to use /palm-reader and /tarot-reader. Professional roles are
 * routed to their review dashboards instead of seeker reading tools.
 *
 * 09. VISUAL LANGUAGE
 * ------------------------------------------------------------
 * The navbar remains intentionally ancient rather than becoming
 * a neon, glassmorphism or purple interface.
 *
 * The futuristic layer comes from:
 * - animated light sweep
 * - hover lift
 * - active route illumination
 * - role-aware information
 * - responsive navigation
 * - reduced-motion support
 *
 * 10. ACCOUNT IDENTITY
 * ------------------------------------------------------------
 * The right side of the desktop navbar now communicates:
 *
 *   EMAIL
 *   ROLE BADGE
 *
 * instead of simply echoing the raw backend role value.
 *
 * 11. MOBILE PARITY
 * ------------------------------------------------------------
 * The mobile drawer consumes the same navigationItems array.
 * Therefore desktop and mobile cannot accidentally disagree about
 * which tools belong to the current role.
 *
 * 12. UNKNOWN ROLES
 * ------------------------------------------------------------
 * Unknown roles fall back to seeker navigation for compatibility.
 * This is safer than rendering an empty navigation bar.
 *
 * 13. LOGOUT
 * ------------------------------------------------------------
 * Logout remains owned by App.jsx. Navbar only invokes onLogout.
 *
 * 14. AUTHENTICATION
 * ------------------------------------------------------------
 * Navbar does not read, write, refresh or validate JWT tokens.
 * Authentication responsibilities remain in App.jsx and api.js.
 *
 * 15. DATA SAFETY
 * ------------------------------------------------------------
 * The navbar only reads user.email and user.role for presentation.
 * No additional personal information is introduced.
 *
 * 16. ACCESSIBILITY
 * ------------------------------------------------------------
 * Navigation links expose their descriptions through aria-label
 * and title attributes. The mobile menu keeps its existing
 * aria-expanded and aria-label behaviour.
 *
 * 17. ACTIVE STATE
 * ------------------------------------------------------------
 * /dashboard uses exact matching while workspace/profile routes
 * continue to use prefix matching. This preserves the original
 * route highlighting behaviour.
 *
 * 18. MOBILE STATE
 * ------------------------------------------------------------
 * Clicking a navigation link closes the mobile drawer.
 * Logging out also closes the drawer before App.jsx clears auth.
 *
 * 19. RESPONSIVE DESIGN
 * ------------------------------------------------------------
 * Desktop navigation remains visible above the mobile breakpoint.
 * The existing compact tablet behaviour and mobile drawer remain
 * intact.
 *
 * 20. FUTURE EXTENSION
 * ------------------------------------------------------------
 * New role-specific routes should be added to roleNavigation first.
 * Avoid creating separate navigation implementations for each role.
 *
 * ============================================================
 */

export default Navbar;

/* Tarot Reader navigation intentionally opens the professional review dashboard. */


/*
 * ============================================================
 * TAROT READER NAVIGATION CONTRACT
 * ============================================================
 *
 * Dashboard and Tarot Workspace are deliberately different links.
 *
 * Dashboard (/dashboard)
 *   The Tarot Reader's professional landing and command center.
 *
 * Tarot Workspace (/tarot-workspace)
 *   The dedicated queue for reviewing seeker-generated tarot
 *   interpretations and submitting expert feedback.
 *
 * Tarot Readers never use /tarot-reader from this navigation.
 * That route belongs to seekers who actually perform the card
 * selection and request an AI tarot interpretation.
 * ============================================================
 */
