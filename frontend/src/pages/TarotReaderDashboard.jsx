import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  History,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TarotReaderNotifications from "../components/notifications/TarotReaderNotifications";
import AppointmentNavigation from "../components/AppointmentNavigation";
/*
 * =========================================================
 * DEMO READER WORKSPACE DATA
 * =========================================================
 *
 * These values are intentionally frontend demo data.
 * They are NOT presented as backend/database records.
 *
 * Stage 2 can replace these values with FastAPI data from:
 * clients
 * bookings
 * availability
 * reading_notes
 */

const DEMO_STATS = {
  todayReadings: 4,
  activeClients: 18,
  availableSlots: 3,
  completedReadings: 126,
};


const DEMO_SCHEDULE = [
  {
    time: "10:30 AM",
    client: "Ananya S.",
    reading: "Career Reading",
    status: "Confirmed",
  },
  {
    time: "1:00 PM",
    client: "Rahul K.",
    reading: "Relationship Reading",
    status: "Confirmed",
  },
  {
    time: "3:30 PM",
    client: "Priya M.",
    reading: "Celtic Cross",
    status: "Upcoming",
  },
  {
    time: "6:00 PM",
    client: "Available",
    reading: "Open Reader Slot",
    status: "Available",
  },
];


const DEMO_CLIENTS = [
  {
    name: "Ananya S.",
    reading: "Career",
    lastSession: "Sep 28",
    status: "Returning",
  },
  {
    name: "Rahul K.",
    reading: "Relationship",
    lastSession: "Sep 25",
    status: "Returning",
  },
  {
    name: "Priya M.",
    reading: "Life Path",
    lastSession: "Sep 20",
    status: "Follow-up",
  },
  {
    name: "Meera R.",
    reading: "Three Card",
    lastSession: "Sep 18",
    status: "New",
  },
];


const DEMO_RECENT_READINGS = [
  {
    client: "Ananya S.",
    type: "Career Reading",
    date: "Sep 28",
  },
  {
    client: "Priya M.",
    type: "Celtic Cross",
    date: "Sep 20",
  },
  {
    client: "Rahul K.",
    type: "Relationship Reading",
    date: "Sep 25",
  },
];


export default function TarotReaderDashboard() {

  const { user } = useAuth();


  const today = new Date().toLocaleDateString(
    undefined,
    {
      weekday: "long",
      month: "short",
      day: "numeric",
    }
  );


  return (
    <div className="page-container">
      <AppointmentNavigation />

      {/* =================================================
          HERO
          ================================================= */}

      <section className="dashboard-hero role-dashboard-hero">

        <div>

          <div className="eyebrow">
            <Sparkles size={15} />
            TAROT READER WORKSPACE
          </div>


          <h1>
            Welcome, Tarot Reader
            <span className="muted-dot">.</span>
          </h1>


          <p>
            Manage your Tarot practice, readings and client
            workspace from one place.
          </p>

        </div>


        <div className="role-pill">
          <BookOpen size={15} />
          Tarot Reader
        </div>

      </section>



      {/* =================================================
          QUICK STATISTICS
          ================================================= */}

      <section className="role-stat-grid">

        <DashboardStat
          icon={CalendarDays}
          label="Today's readings"
          value={DEMO_STATS.todayReadings}
          note="4 scheduled sessions"
        />


        <DashboardStat
          icon={Users}
          label="Active clients"
          value={DEMO_STATS.activeClients}
          note="3 new clients this week"
        />


        <DashboardStat
          icon={Clock3}
          label="Available slots"
          value={DEMO_STATS.availableSlots}
          note="6:00 PM · 7:30 PM · 9:00 PM"
        />


        <DashboardStat
          icon={History}
          label="Completed readings"
          value={DEMO_STATS.completedReadings}
          note="+12 readings this month"
        />

      </section>


      {/* =================================================
          TODAY'S READING SCHEDULE
          ================================================= */}

      <section className="panel role-dashboard-panel">

        <div className="panel-heading">

          <div>

            <span className="section-kicker">
              TODAY'S WORKLOAD
            </span>

            <h2>
              Reading schedule
            </h2>

          </div>


          <div className="reader-panel-heading-right">

            <span className="dashboard-date">
              {today}
            </span>

            <Link to="/schedule">
              View full schedule
            </Link>

          </div>

        </div>


        <div className="reader-schedule-list">

          {DEMO_SCHEDULE.map(
            (item) => (

              <div
                className="reader-schedule-row"
                key={`${item.time}-${item.client}`}
              >

                <div className="reader-schedule-time">
                  <Clock3 size={15} />
                  <strong>
                    {item.time}
                  </strong>
                </div>


                <div className="reader-schedule-client">

                  <strong>
                    {item.client}
                  </strong>

                  <span>
                    {item.reading}
                  </span>

                </div>


                <StatusBadge
                  status={item.status}
                />

              </div>

            )
          )}

        </div>

      </section>


      {/* =================================================
          CLIENT OVERVIEW + READING TOOLS
          ================================================= */}

      <section className="reader-main-grid">

        {/* =================================================
            CLIENT OVERVIEW
            ================================================= */}

        <div className="panel">

          <div className="panel-heading">

            <div>

              <span className="section-kicker">
                CLIENTS
              </span>

              <h2>
                Client overview
              </h2>

            </div>


            <Link to="/clients">
              View all
            </Link>

          </div>


          <div className="reader-client-table">

            <div className="reader-table-header">

              <span>
                Client
              </span>

              <span>
                Reading
              </span>

              <span>
                Last session
              </span>

              <span>
                Status
              </span>

            </div>


            {DEMO_CLIENTS.map(
              (client) => (

                <div
                  className="reader-client-row"
                  key={client.name}
                >

                  <strong>
                    {client.name}
                  </strong>

                  <span>
                    {client.reading}
                  </span>

                  <span>
                    {client.lastSession}
                  </span>

                  <span
                    className={`reader-client-status ${getClientStatusClass(
                      client.status
                    )}`}
                  >
                    {client.status}
                  </span>

                </div>

              )
            )}

          </div>

        </div>


        {/* =================================================
            READING TOOLS
            ================================================= */}

        <div className="panel">

          <div className="panel-heading">

            <div>

              <span className="section-kicker">
                READING TOOLS
              </span>

              <h2>
                Quick reading actions
              </h2>

            </div>

          </div>


          <div className="dashboard-action-list">

            <Link
              to="/tarot-reading"
              className="dashboard-action"
            >

              <div className="dashboard-action-icon">
                <BookOpen size={20} />
              </div>


              <div>

                <strong>
                  Start New Reading
                </strong>

                <span>
                  Open the 78-card Tarot system.
                </span>

              </div>


              <ArrowRight size={17} />

            </Link>


            <Link
              to="/tarot-reading"
              className="dashboard-action"
            >

              <div className="dashboard-action-icon">
                <Sparkles size={20} />
              </div>


              <div>

                <strong>
                  Three Card Reading
                </strong>

                <span>
                  Past · Present · Future.
                </span>

              </div>


              <ArrowRight size={17} />

            </Link>


            <Link
              to="/tarot-reading"
              className="dashboard-action"
            >

              <div className="dashboard-action-icon">
                <Users size={20} />
              </div>


              <div>

                <strong>
                  Relationship Reading
                </strong>

                <span>
                  You · Other Person · Energy.
                </span>

              </div>


              <ArrowRight size={17} />

            </Link>


            <Link
              to="/tarot-reading"
              className="dashboard-action"
            >

              <div className="dashboard-action-icon">
                <Sparkles size={20} />
              </div>


              <div>

                <strong>
                  Career Reading
                </strong>

                <span>
                  Career · Challenge · Guidance.
                </span>

              </div>


              <ArrowRight size={17} />

            </Link>


            <Link
              to="/tarot-reading"
              className="dashboard-action"
            >

              <div className="dashboard-action-icon">
                <BookOpen size={20} />
              </div>


              <div>

                <strong>
                  Celtic Cross
                </strong>

                <span>
                  Ten-card comprehensive reading.
                </span>

              </div>


              <ArrowRight size={17} />

            </Link>

          </div>

        </div>

      </section>


      {/* =================================================
          RECENT READINGS + PRACTICE SUMMARY
          ================================================= */}

      <section className="reader-main-grid">

        {/* =================================================
            RECENT READINGS
            ================================================= */}

        <div className="panel">

          <div className="panel-heading">

            <div>

              <span className="section-kicker">
                READING HISTORY
              </span>

              <h2>
                Recent readings
              </h2>

            </div>


            <Link to="/history">
              View history
            </Link>

          </div>


          <div className="reader-recent-list">

            {DEMO_RECENT_READINGS.map(
              (reading) => (

                <div
                  className="reader-recent-row"
                  key={`${reading.client}-${reading.date}`}
                >

                  <div className="reader-recent-icon">
                    <CheckCircle2 size={17} />
                  </div>


                  <div>

                    <strong>
                      {reading.type}
                    </strong>

                    <span>
                      {reading.client}
                    </span>

                  </div>


                  <time>
                    {reading.date}
                  </time>

                </div>

              )
            )}

          </div>

        </div>


        {/* =================================================
            PRACTICE SUMMARY
            ================================================= */}

        <div className="panel">

          <div className="panel-heading">

            <div>

              <span className="section-kicker">
                PRACTICE
              </span>

              <h2>
                Reader summary
              </h2>

            </div>

          </div>


          <div className="reader-summary-list">

            <SummaryItem
              label="Total readings"
              value="126"
            />

            <SummaryItem
              label="This month"
              value="+12"
            />

            <SummaryItem
              label="Active clients"
              value="18"
            />

            <SummaryItem
              label="Returning clients"
              value="14"
            />

          </div>


          <Link
            to="/reports"
            className="button secondary full"
          >

            <FileText size={16} />

            View reading reports

            <ArrowRight size={16} />

          </Link>

        </div>

      </section>


      {/* =================================================
          READER PROFILE
          ================================================= */}

      <section className="panel dashboard-account-strip">

        <div>

          <span className="section-kicker">
            READER ACCOUNT
          </span>

          <strong>
            {user?.email}
          </strong>

        </div>


        <div className="role-dashboard-security">

          <span>
            Role
          </span>

          <strong>
            Tarot Reader
          </strong>

        </div>


        <Link
          to="/profile"
          className="button secondary"
        >

          <UserRound size={15} />

          Profile

        </Link>

      </section>


      <p className="disclaimer">
        Client, booking and availability metrics are currently
        demo workspace data and will be connected to FastAPI
        services in the next implementation stage.
      </p>

    </div>
  );
}


/* =========================================================
   STAT CARD
   ========================================================= */

function DashboardStat({
  icon: Icon,
  label,
  value,
  note,
}) {

  return (

    <div className="role-stat-card">

      <div className="role-stat-top">

        <div className="role-stat-icon">
          <Icon size={19} />
        </div>

        <span>
          {label}
        </span>

      </div>


      <strong>
        {value}
      </strong>


      <p>
        {note}
      </p>

    </div>

  );
}


/* =========================================================
   STATUS BADGE
   ========================================================= */

function StatusBadge({ status }) {

  const className =
    status === "Confirmed"
      ? "reader-status-confirmed"
      : status === "Upcoming"
        ? "reader-status-upcoming"
        : "reader-status-available";


  return (

    <span className={className}>

      <span className="reader-status-dot" />

      {status}

    </span>

  );
}


/* =========================================================
   CLIENT STATUS
   ========================================================= */

function getClientStatusClass(status) {

  if (status === "Returning") {
    return "client-returning";
  }

  if (status === "Follow-up") {
    return "client-followup";
  }

  return "client-new";
}


/* =========================================================
   SUMMARY ITEM
   ========================================================= */

function SummaryItem({
  label,
  value,
}) {

  return (

    <div className="reader-summary-item">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    <TarotReaderNotifications />
    </div>
  
  );
}