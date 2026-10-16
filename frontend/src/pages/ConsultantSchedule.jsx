import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Users,
  ArrowRight,
} from "lucide-react";

import { Link } from "react-router-dom";


export default function ConsultantSchedule() {

  const slots = [

    {
      time: "09:00 AM",
      client: "Client 01",
      type: "Tarot Consultation",
      status: "Completed",
    },

    {
      time: "11:00 AM",
      client: "Client 02",
      type: "Palm Consultation",
      status: "Completed",
    },

    {
      time: "02:00 PM",
      client: "Client 03",
      type: "Tarot + Palm",
      status: "Upcoming",
    },

    {
      time: "04:00 PM",
      client: "Client 04",
      type: "Palm Consultation",
      status: "Upcoming",
    },

  ];


  return (

    <div className="page-container">

      <section className="dashboard-hero role-dashboard-hero">

        <div>

          <div className="eyebrow">

            <CalendarDays size={15} />

            CONSULTANT SCHEDULE

          </div>


          <h1>

            Schedule

            <span className="muted-dot">
              .
            </span>

          </h1>


          <p>

            View consultation slots, working hours and
            upcoming Tarot and palmistry sessions.

          </p>

        </div>


        <div className="role-pill">

          <CalendarDays size={15} />

          Consultant Schedule

        </div>

      </section>


      {/* =================================================
          SCHEDULE STATISTICS
          ================================================= */}

      <section className="role-stat-grid">

        <Stat
          icon={CalendarDays}
          label="Today's sessions"
          value="6"
          note="Planned consultation sessions"
        />


        <Stat
          icon={Clock3}
          label="Available hours"
          value="6"
          note="Available consultant hours"
        />


        <Stat
          icon={CheckCircle2}
          label="Completed"
          value="2"
          note="Completed today's slots"
        />


        <Stat
          icon={Users}
          label="Upcoming"
          value="4"
          note="Upcoming consultation slots"
        />

      </section>


      {/* =================================================
          DAILY SCHEDULE
          ================================================= */}

      <section className="panel">

        <div className="panel-heading">

          <div>

            <span className="section-kicker">
              DAILY SCHEDULE
            </span>

            <h2>
              Today's consultation slots
            </h2>

          </div>


          <span className="dashboard-date">

            {new Date().toLocaleDateString(
              undefined,
              {
                weekday: "long",
                month: "short",
                day: "numeric",
              }
            )}

          </span>

        </div>


        <div className="workspace-status-list">

          {slots.map(
            (slot) => (

              <div
                className="workspace-status-item"
                key={`${slot.time}-${slot.client}`}
              >

                <div>

                  <strong>
                    {slot.time}
                  </strong>

                  <span>

                    {slot.client} ·{" "}
                    {slot.type}

                  </span>

                </div>


                <span
                  className={
                    slot.status === "Completed"
                      ? "status-available"
                      : "status-pending"
                  }
                >

                  <span className="status-dot" />

                  {slot.status}

                </span>

              </div>

            )
          )}

        </div>

      </section>


      {/* =================================================
          AVAILABILITY
          ================================================= */}

      <section className="role-dashboard-grid">


        <div className="panel">

          <div className="panel-heading">

            <div>

              <span className="section-kicker">
                AVAILABILITY
              </span>

              <h2>
                Working hours
              </h2>

            </div>

          </div>


          <div className="workspace-status-list">

            <StatusItem
              label="Morning availability"
              value="2 hrs"
            />


            <StatusItem
              label="Afternoon availability"
              value="3 hrs"
            />


            <StatusItem
              label="Evening availability"
              value="1 hr"
            />


            <StatusItem
              label="Total available"
              value="6 hrs"
            />

          </div>

        </div>


        <div className="panel">

          <div className="panel-heading">

            <div>

              <span className="section-kicker">
                SESSION BREAKDOWN
              </span>

              <h2>
                Today's sessions
              </h2>

            </div>

          </div>


          <div className="workspace-status-list">

            <StatusItem
              label="Tarot sessions"
              value="2"
            />


            <StatusItem
              label="Palm sessions"
              value="3"
            />


            <StatusItem
              label="Combined sessions"
              value="1"
            />

          </div>

        </div>

      </section>


      {/* =================================================
          QUICK ACTIONS
          ================================================= */}

      <section className="panel">

        <div className="panel-heading">

          <div>

            <span className="section-kicker">
              SCHEDULE ACTIONS
            </span>

            <h2>
              Quick access
            </h2>

          </div>

        </div>


        <div className="dashboard-action-list">


          <Link
            to="/consultations"
            className="dashboard-action"
          >

            <div className="dashboard-action-icon">

              <CalendarDays size={20} />

            </div>


            <div>

              <strong>
                Consultation Sessions
              </strong>

              <span>
                Review today's consultation workload.
              </span>

            </div>


            <ArrowRight size={17} />

          </Link>


          <Link
            to="/client-records"
            className="dashboard-action"
          >

            <div className="dashboard-action-icon">

              <Users size={20} />

            </div>


            <div>

              <strong>
                Client Records
              </strong>

              <span>
                Review client consultation information.
              </span>

            </div>


            <ArrowRight size={17} />

          </Link>

        </div>

      </section>

    </div>

  );
}


/* =========================================================
   STAT
   ========================================================= */

function Stat({
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

function StatusItem({
  label,
  value,
}) {

  return (

    <div className="workspace-status-item">

      <span>
        {label}
      </span>


      <span className="status-available">

        <span className="status-dot" />

        {value}

      </span>

    </div>

  );

}