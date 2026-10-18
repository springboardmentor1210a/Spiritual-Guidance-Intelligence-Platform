import {
  LayoutDashboard, Hand, Sparkles, Lightbulb, ListChecks, History as HistoryIcon,
  FileText, User, Settings, Users, UserCog, ShieldCheck, ClipboardList,
  BarChart3, Database, MessageCircleQuestion
} from "lucide-react";

export const ROLES = {
  USER: "User",
  TAROT_READER: "Tarot Reader",
  SPIRITUAL_CONSULTANT: "Spiritual Consultant",
  ADMIN: "Administrator",
};

// Where each role lands after login
export const DASHBOARD_PATH = {
  [ROLES.USER]: "/dashboard",
  [ROLES.TAROT_READER]: "/reader-dashboard",
  [ROLES.SPIRITUAL_CONSULTANT]: "/consultant-dashboard",
  [ROLES.ADMIN]: "/admin-dashboard",
};

// Every protected route mapped to which roles may access it.
// A route with no entry here is denied to everyone by default (fail closed).
export const ROUTE_ACCESS = {
  "/dashboard": [ROLES.USER],
  "/palm-reading": [ROLES.USER],
  "/palm-results": [ROLES.USER],
  "/tarot-reading": [ROLES.USER, ROLES.TAROT_READER],
  "/tarot-results": [ROLES.USER, ROLES.TAROT_READER],
  "/insights": [ROLES.USER, ROLES.SPIRITUAL_CONSULTANT],
  "/recommendations": [ROLES.USER, ROLES.SPIRITUAL_CONSULTANT],
  "/history": [ROLES.USER, ROLES.TAROT_READER],
  "/reports": [ROLES.ADMIN],
  "/admin-analytics": [ROLES.ADMIN],
  "/profile": [ROLES.USER, ROLES.TAROT_READER, ROLES.SPIRITUAL_CONSULTANT],
  "/settings": [ROLES.USER, ROLES.TAROT_READER, ROLES.SPIRITUAL_CONSULTANT, ROLES.ADMIN],
  "/request-guidance": [ROLES.USER],
  "/user-guidance": [ROLES.USER],

  "/reader-dashboard": [ROLES.TAROT_READER],
  "/reader-analytics": [ROLES.TAROT_READER],
  "/reader-engagement": [ROLES.TAROT_READER],
  "/reader-sessions": [ROLES.TAROT_READER],
  "/reader-guidance": [ROLES.TAROT_READER],

  "/consultant-dashboard": [ROLES.SPIRITUAL_CONSULTANT],
  "/consultant-trends": [ROLES.SPIRITUAL_CONSULTANT],
  "/consultant-guidance": [ROLES.SPIRITUAL_CONSULTANT],
  "/consultant-insights": [ROLES.SPIRITUAL_CONSULTANT],
  "/consultant-sessions": [ROLES.SPIRITUAL_CONSULTANT],

  "/admin-dashboard": [ROLES.ADMIN],
  "/admin-users": [ROLES.ADMIN],
  "/admin-readings": [ROLES.ADMIN],
  "/admin-system": [ROLES.ADMIN],
};

// Sidebar nav items per role — Sidebar.jsx just reads this, no per-role branching there
export const SIDEBAR_CONFIG = {
  [ROLES.USER]: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/palm-reading", label: "Palm Reading", icon: Hand },
    { to: "/tarot-reading", label: "Tarot Reading", icon: Sparkles },
    { to: "/insights", label: "Insights", icon: Lightbulb },
    { to: "/recommendations", label: "Recommendations", icon: ListChecks },
    { to: "/history", label: "Reading History", icon: HistoryIcon },

    { to: "/user-guidance", label: "Guidance & Sessions", icon: MessageCircleQuestion },
    { to: "/profile", label: "Profile", icon: User },
    { to: "/settings", label: "Settings", icon: Settings },
  ],
  [ROLES.TAROT_READER]: [
    { to: "/reader-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/reader-analytics", label: "Reading Analytics", icon: BarChart3 },
    { to: "/reader-engagement", label: "User Engagement Insights", icon: Users },
    { to: "/reader-sessions", label: "Session Tracking", icon: HistoryIcon },
    { to: "/reader-guidance", label: "Guidance", icon: FileText },
    { to: "/profile", label: "Profile", icon: User },
    { to: "/settings", label: "Settings", icon: Settings },
  ],
  [ROLES.SPIRITUAL_CONSULTANT]: [
    { to: "/consultant-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/consultant-trends", label: "User Trend Analysis", icon: BarChart3 },
    { to: "/consultant-guidance", label: "Guidance Effectiveness", icon: ClipboardList },
    { to: "/consultant-insights", label: "Consultation Insights", icon: Lightbulb },
    { to: "/consultant-sessions", label: "Sessions", icon: HistoryIcon },
    { to: "/profile", label: "Profile", icon: User },
    { to: "/settings", label: "Settings", icon: Settings },
  ],
  [ROLES.ADMIN]: [
    { to: "/admin-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin-users", label: "Users", icon: Users },
    { to: "/admin-readings", label: "Reading Statistics", icon: FileText },
    { to: "/reports", label: "Platform Analytics", icon: BarChart3 },
    { to: "/admin-system", label: "System Management", icon: Database },
    { to: "/settings", label: "Settings", icon: Settings },
  ],
};