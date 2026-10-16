
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Sparkles,
} from "lucide-react";

import { Link } from "react-router-dom";
import AppointmentNavigation from "../components/AppointmentNavigation";

const DEMO_SCHEDULE = [
  {
    time: "10:30 AM",
    client: "Ananya S.",
    reading: "Career Reading",
    duration: "45 min",
    status: "Confirmed",
  },
  {
    time: "1:00 PM",
    client: "Rahul K.",
    reading: "Relationship Reading",
    duration: "60 min",
    status: "Confirmed",
  },
  {
    time: "3:30 PM",
    client: "Priya M.",
    reading: "Celtic Cross",
    duration: "75 min",
    status: "Upcoming",
  },
  {
    time: "6:00 PM",
    client: "Available",
    reading: "Open Reader Slot",
    duration: "60 min",
    status: "Available",
  },
  {
    time: "7:30 PM",
    client: "Available",
    reading: "Open Reader Slot",
    duration: "60 min",
    status: "Available",
  },
  {
    time: "9:00 PM",
    client: "Available",
    reading: "Open Reader Slot",
    duration: "60 min",
    status: "Available",
  },
];

export default function TarotReaderSchedule() {
  const today = new Date().toLocaleDateString(
    undefined,
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  return (
    <div className="page-container">

      <AppointmentNavigation />

      {/* =================================================
          HEADER
          ================================================= */}

      <section className="dashboard-hero role-dashboard-hero">

        <div>

          <div className="eyebrow">
            <CalendarDays size={15} />
            READER SCHEDULE
          </div>

          <h1>
            Reading schedule
            <span className="muted-dot">.</span>
          </h1>

          <p>
            Manage today's Tarot sessions and available
            reader time slots.
          </p>

        </div>

        <div className="role-pill">
          <CalendarDays size={15} />
          {today}
        </div>

      </section>

      {/* =================================================
          DEMO NOTICE
          ================================================= */}

      <section className="reader-demo-notice">

        <div className="reader-demo-notice-icon">
          <CalendarDays size={17} />
        </div>

        <div>

          <strong>
            Demo schedule workspace
          </strong>

          <p>
            The appointments and availability shown here
            are demonstration data. Live scheduling will be
            connected to the backend in the next stage.
          </p>

        </div>

      </section>

      {/* =================================================
          SCHEDULE SUMMARY
          ================================================= */}

      <section className="role-stat-grid">

        <DashboardStat
          icon={CalendarDays}
          label="Today's readings"
          value="4"
          note="3 client sessions + 1 open slot"
        />

        <DashboardStat
          icon={Clock3}
          label="Available slots"
          value="3"
          note="6:00 PM · 7:30 PM · 9:00 PM"
        />

        <DashboardStat
          icon={CheckCircle2}
          label="Confirmed"
          value="2"
          note="Confirmed client sessions"
        />

        <DashboardStat
          icon={Sparkles}
          label="Upcoming"
          value="1"
          note="Next session at 3:30 PM"
        />

      </section>

      {/* =================================================
          FULL SCHEDULE
          ================================================= */}

      <section className="panel">

        <div className="panel-heading">

          <div>

            <span className="section-kicker">
              TODAY
            </span>

            <h2>
              Session timeline
            </h2>

          </div>

          <span className="dashboard-date">
            Demo workspace
          </span>

        </div>

        <div className="reader-full-schedule">

          {DEMO_SCHEDULE.map(
            (item) => (

              <div
                className="reader-full-schedule-row"
                key={`${item.time}-${item.client}`}
              >

                <div className="reader-full-schedule-time">

                  <Clock3 size={16} />

                  <strong>
                    {item.time}
                  </strong>

                </div>

                <div className="reader-full-schedule-main">

                  <strong>
                    {item.client}
                  </strong>

                  <span>
                    {item.reading}
                  </span>

                </div>

                <span className="reader-duration">
                  {item.duration}
                </span>

                <StatusBadge
                  status={item.status}
                />

              </div>

            )
          )}

        </div>

      </section>

      {/* =================================================
          AVAILABILITY
          ================================================= */}

      <section className="reader-main-grid">

        <div className="panel">

          <div className="panel-heading">

            <div>

              <span className="section-kicker">
                AVAILABILITY
              </span>

              <h2>
                Open reader slots
              </h2>

            </div>

          </div>

          <div className="reader-availability-grid">

            <AvailabilitySlot
              time="6:00 PM"
            />

            <AvailabilitySlot
              time="7:30 PM"
            />

            <AvailabilitySlot
              time="9:00 PM"
            />

          </div>

        </div>

        <div className="panel">

          <div className="panel-heading">

            <div>

              <span className="section-kicker">
                NEXT STEP
              </span>

              <h2>
                Reader workflow
              </h2>

            </div>

          </div>

          <div className="dashboard-action-list">

            <Link
              to="/clients"
              className="dashboard-action"
            >

              <div className="dashboard-action-icon">
                <CalendarDays size={20} />
              </div>

              <div>

                <strong>
                  Review Clients
                </strong>

                <span>
                  Open the reader client workspace.
                </span>

              </div>

              <span>
                →
              </span>

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
                  Start Reading
                </strong>

                <span>
                  Open the Tarot card reading system.
                </span>

              </div>

              <span>
                →
              </span>

            </Link>

          </div>

        </div>

      </section>

    </div>
  );
}

/* =========================================================
   STAT
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
   STATUS
   ========================================================= */

function StatusBadge({
  status,
}) {
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
   AVAILABILITY SLOT
   ========================================================= */

function AvailabilitySlot({
  time,
}) {
  return (

    <div className="reader-availability-slot">

      <div className="reader-availability-icon">
        <Clock3 size={18} />
      </div>

      <div>

        <strong>
          {time}
        </strong>

        <span>
          Available
        </span>

      </div>

    </div>
  );
}
