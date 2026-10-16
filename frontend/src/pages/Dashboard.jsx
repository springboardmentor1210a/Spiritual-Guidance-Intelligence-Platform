import {
  ArrowRight,
  BookOpen,
  Clock3,
  Fingerprint,
  History,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import TarotReaderDashboard from "./TarotReaderDashboard";
import SpiritualConsultantDashboard from "./SpiritualConsultantDashboard";
import AdminDashboard from "./AdminDashboard";
import AppointmentNavigation from "../components/AppointmentNavigation";
import UserNotifications from "../components/notifications/UserNotifications";
function readHistory() {
  try {
    return JSON.parse(
      localStorage.getItem("reading_history") || "[]"
    );
  } catch {
    return [];
  }
}


export default function Dashboard() {

  const { user } = useAuth();

  const role = user?.role;


  // =====================================================
  // ROLE-SPECIFIC DASHBOARDS
  // =====================================================

  if (role === "tarot_reader") {
    return <TarotReaderDashboard />;
  }

  if (role === "spiritual_consultant") {
    return <SpiritualConsultantDashboard />;
  }

  if (role === "administrator") {
    return <AdminDashboard />;
  }


  // =====================================================
  // DEFAULT USER DASHBOARD
  // =====================================================

  return <UserDashboard user={user} />;
}


/* =========================================================
   USER DASHBOARD
   Existing personal dashboard
   ========================================================= */

function UserDashboard({ user }) {

  const history = readHistory();


  const cards = [
    {
      to: "/palm-analysis",
      icon: Fingerprint,
      title: "Palm Analysis",
      text: "Upload a palm image and explore a structured feature reading.",
      label: "Explore palm",
    },
    {
      to: "/tarot-reading",
      icon: BookOpen,
      title: "Tarot Reading",
      text: "Draw three cards and reveal a Past, Present and Future spread.",
      label: "Draw cards",
    },
  ];


  return (
    <div className="page-container">
      <AppointmentNavigation />

      {/* =================================================
          HERO
          ================================================= */}

      <section className="dashboard-hero">

        <div>

          <div className="eyebrow">
            <Sparkles size={15} />
            Your personal reading space
          </div>

          <h1>
            Welcome back<span className="muted-dot">.</span>
          </h1>

          <p>
            Choose a reading to begin exploring today's
            reflection.
          </p>

        </div>


        <div className="role-pill">

          <ShieldCheck size={15} />

          {user?.role?.replaceAll("_", " ")}

        </div>

      </section>


      {/* =================================================
          READING OPTIONS
          ================================================= */}

      <div className="reading-grid">

        {cards.map(
          ({
            to,
            icon: Icon,
            title,
            text,
            label,
          }) => (

            <Link
              to={to}
              className="reading-card"
              key={to}
            >

              <div className="reading-card-top">

                <div className="reading-icon">
                  <Icon size={25} />
                </div>

                <ArrowRight size={19} />

              </div>


              <h2>
                {title}
              </h2>


              <p>
                {text}
              </p>


              <span>
                {label}
                <ArrowRight size={15} />
              </span>

            </Link>

          )
        )}

      </div>


      {/* =================================================
          LOWER DASHBOARD
          ================================================= */}

      <section className="dashboard-lower">

        {/* Recent activity */}

        <div className="panel">

          <div className="panel-heading">

            <div>

              <span className="section-kicker">
                RECENT ACTIVITY
              </span>

              <h2>
                Your reading history
              </h2>

            </div>

            <Link to="/history">
              View all
            </Link>

          </div>


          {history.length === 0 ? (

            <div className="empty-state">

              <History size={28} />

              <p>
                No readings yet. Your completed local
                demo readings will appear here.
              </p>

            </div>

          ) : (

            history
              .slice(0, 4)
              .map((item) => (

                <div
                  className="history-row"
                  key={item.id}
                >

                  <div className="history-symbol">

                    {item.type === "tarot"
                      ? "✦"
                      : "☽"}

                  </div>


                  <div>

                    <strong>
                      {item.title}
                    </strong>

                    <span>
                      {new Date(
                        item.createdAt
                      ).toLocaleString()}
                    </span>

                  </div>


                  <span className="history-type">
                    {item.type}
                  </span>

                </div>

              ))

          )}

        </div>


        {/* Profile */}

        <div className="panel profile-summary">

          <div className="panel-heading">

            <div>

              <span className="section-kicker">
                PROFILE
              </span>

              <h2>
                Personal context
              </h2>

            </div>

            <Link to="/profile">
              <UserRound size={17} />
            </Link>

          </div>


          <div className="profile-stat">

            <Clock3 size={18} />

            <div>

              <span>
                Reading sessions
              </span>

              <strong>
                {history.length}
              </strong>

            </div>

          </div>


          <div className="profile-stat">

            <Sparkles size={18} />

            <div>

              <span>
                Account role
              </span>

              <strong>
                {user?.role?.replaceAll("_", " ")}
              </strong>

            </div>

          </div>


          <Link
            className="button secondary full"
            to="/profile"
          >

            Manage profile

            <ArrowRight size={16} />

          </Link>

        </div>

      </section>
    <UserNotifications />
    </div>
  );
}