import {
  Activity,
  BookOpen,
  CalendarDays,
  Database,
  FileText,
  Fingerprint,
  History,
  Home,
  LogOut,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  ChartNoAxesCombined,
  TrendingUp,
  Wallet
} from "lucide-react";

import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import { useAuth } from "../context/AuthContext";
import { getActiveReadingSession } from "../services/activeReading";

export default function Navbar() {

  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const [
    activeReadingSession,
    setActiveReadingSession,
  ] = useState(
    getActiveReadingSession()
  );

  useEffect(() => {

    function refreshReadingSession() {

      setActiveReadingSession(
        getActiveReadingSession()
      );

    }

    window.addEventListener(
      "active-reading-session-changed",
      refreshReadingSession
    );

    window.addEventListener(
      "storage",
      refreshReadingSession
    );

    return () => {

      window.removeEventListener(
        "active-reading-session-changed",
        refreshReadingSession
      );

      window.removeEventListener(
        "storage",
        refreshReadingSession
      );

    };

  }, []);

  function handleLogout() {

    logout();

    navigate(
      "/login",
      { replace: true }
    );

  }

  function intelligencePath(path) {

    if (!activeReadingSession) {
      return path;
    }

    return `${path}?reading_session_id=${activeReadingSession}`;

  }

  const isTarotReader =
    user?.role === "tarot_reader";

  const isSpiritualConsultant =
    user?.role === "spiritual_consultant";

  const isAdministrator =
    user?.role === "administrator";

  /* ========================================================
     TAROT READER
     ======================================================== */

  const tarotReaderNav = [

    {
      to: "/dashboard",
      icon: Home,
      label: "Dashboard",
    },

    {
      to: "/appointment-schedule",
      icon: CalendarDays,
      label: "Manage Schedule",
    },

    {
      to: "/client-records",
      icon: Users,
      label: "Clients",
    },

    {
      to: "/reports",
      icon: FileText,
      label: "Reports",
    },
    {
  to: "/tarot-reader/earnings",
  icon: Wallet,
  label: "Earnings & Payments",
},
{
  to: "/tarot-reader/insights",
  icon: TrendingUp,
  label: "Tarot Reader Insights",
},

    {
      to: "/profile",
      icon: UserRound,
      label: "Reader Profile",
    },

    {
      to: "/settings",
      icon: SettingsIcon,
      label: "Settings",
    },


  ];

  /* ========================================================
     SPIRITUAL CONSULTANT
     ======================================================== */

  const spiritualConsultantNav = [

    {
      to: "/dashboard",
      icon: Home,
      label: "Dashboard",
    },

    {
      to: "/consultations",
      icon: CalendarDays,
      label: "Consultations",
    },
       {
    to: "/appointment-schedule",
    icon: CalendarDays,
    label: "Manage Schedule",
    },

    {
      to: "/client-records",
      icon: Users,
      label: "Client Records",
    },

    {
      to: "/consultant-schedule",
      icon: CalendarDays,
      label: "Schedule",
    },

     {
    to: "/consultant-insights",
    icon: Activity,
    label: "Consultant Insights",
  },
    {
    to: "/consultant-earnings",
    icon: Database,
    label: "Earnings & Payments",
  },  
 {
      to: "/profile",
      icon: UserRound,
      label: "Consultant Profile",
    },

    {
      to: "/settings",
      icon: SettingsIcon,
      label: "Settings",
    },


  ];

  /* ========================================================
     ADMINISTRATOR
     ======================================================== */

  const administratorNav = [

    {
      to: "/dashboard",
      icon: Home,
      label: "Dashboard",
    },

    {
      to: "/admin/users",
      icon: Users,
      label: "Users",
    },

    {
      to: "/admin/tarot",
      icon: BookOpen,
      label: "Tarot",
    },

    {
      to: "/admin/palmistry",
      icon: Fingerprint,
      label: "Palmistry",
    },

    {
      to: "/admin/reports",
      icon: FileText,
      label: "Reports",
    },

    {
      to: "/admin/system",
      icon: Database,
      label: "System",
    },
    
{
  to: "/admin/analytics",
  icon: TrendingUp,
  label: "Analytics",
},
{
  to: "/admin/audit-logs",
  icon: ShieldCheck,
  label: "Audit Logs",
},


    {
      to: "/settings",
      icon: SettingsIcon,
      label: "Settings",
    },

    {
      to: "/profile",
      icon: UserRound,
      label: "Admin Profile",
    },

  ];

  /* ========================================================
     NORMAL USER
     ======================================================== */

  const defaultNav = [

    {
      to: "/dashboard",
      icon: Home,
      label: "Dashboard",
    },

    {
      to: "/palm-analysis",
      icon: Fingerprint,
      label: "Palm",
    },

    {
      to: "/tarot-reading",
      icon: BookOpen,
      label: "Tarot",
    },

    {
      to: "/history",
      icon: History,
      label: "History",
    },

    {
      to: "/reports",
      icon: FileText,
      label: "Reports",
    },

    {
      to: "/profile",
      icon: UserRound,
      label: "Profile",
    },

    {
      to: intelligencePath(
        "/ai-interpretation"
      ),
      icon: Sparkles,
      label: "AI Interpretation",
    },

    {
      to: intelligencePath(
        "/personality-intelligence"
      ),
      icon: Sparkles,
      label: "Personality Intelligence",
    },

    {
      to: intelligencePath(
        "/recommendations"
      ),
      icon: Sparkles,
      label: "Recommendations",
    },

    {
      to: intelligencePath(
        "/life-trends"
      ),
      icon: Sparkles,
      label: "Life Trends",
    },

    {
      to: intelligencePath(
        "/milestone3-dashboard"
      ),
      icon: Sparkles,
      label: "Personalized Dashboard",
    },

    {
      to: "/settings",
      icon: SettingsIcon,
      label: "Settings",
    },

  ];

  let navItems = defaultNav;

  if (isTarotReader) {
    navItems = tarotReaderNav;
  }

  if (isSpiritualConsultant) {
    navItems = spiritualConsultantNav;
  }

  if (isAdministrator) {
    navItems = administratorNav;
  }

  return (

    <header className="topbar">

      <Link
        to="/dashboard"
        className="brand"
      >

        <span className="brand-mark">
          <Sparkles size={17} />
        </span>

        <span>
          <strong>Arcana</strong>
          <small>Intelligence</small>
        </span>

      </Link>

      <nav className="nav-links">

        {navItems.map(
          ({
            to,
            icon: Icon,
            label,
          }) => (

            <NavLink
              key={label}
              to={to}
            >

              <Icon size={16} />

              <span>
                {label}
              </span>

            </NavLink>

          )
        )}

      </nav>

      <div className="nav-user">

        <div className="avatar">
          {(
            user?.email?.[0] || "U"
          ).toUpperCase()}
        </div>

        <div className="nav-user-text">

          <strong>
            {user?.email?.split("@")[0]}
          </strong>

          <span>
            {user?.role?.replaceAll(
              "_",
              " "
            )}
          </span>

        </div>

        <button
          className="icon-button"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={17} />
        </button>

      </div>

    </header>

  );
}
