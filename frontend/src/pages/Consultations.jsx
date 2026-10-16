import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Fingerprint,
  History,
  Users,
  BookOpen,
} from "lucide-react";

import { Link } from "react-router-dom";


export default function Consultations() {

  const consultations = [

    {
      id: "C-001",
      client: "Client 01",
      type: "Tarot Consultation",
      time: "10:00 AM",
      status: "Completed",
    },

    {
      id: "C-002",
      client: "Client 02",
      type: "Palm Consultation",
      time: "11:30 AM",
      status: "Active",
    },

    {
      id: "C-003",
      client: "Client 03",
      type: "Tarot + Palm",
      time: "02:00 PM",
      status: "Upcoming",
    },

    {
      id: "C-004",
      client: "Client 04",
      type: "Palm Consultation",
      time: "04:00 PM",
      status: "Upcoming",
    },

  ];


  return (

    <div className="page-container">

      <section className="dashboard-hero role-dashboard-hero">

        <div>

          <div className="eyebrow">

            <CalendarDays size={15} />

            CONSULTATION MANAGEMENT

          </div>


          <h1>

            Consultations

            <span className="muted-dot">
              .
            </span>

          </h1>


          <p>

            Manage Tarot, palmistry and combined spiritual
            consultation sessions from one workspace.

          </p>

        </div>


        <div className="role-pill">

          <Users size={15} />

          Spiritual Consultant

        </div>

      </section>


      {/* =================================================
          STATISTICS
          ================================================= */}

      <section className="role-stat-grid">

        <Stat
          icon={CalendarDays}
          label="Today's consultations"
          value="6"
          note="Scheduled sessions"
        />


        <Stat
          icon={Clock3}
          label="Active consultations"
          value="4"
          note="Sessions in progress"
        />


        <Stat
          icon={CheckCircle2}
          label="Completed"
          value="18"
          note="Completed consultation records"
        />


        <Stat
          icon={Users}
          label="Client records"
          value="14"
          note="Consultant workspace records"
        />

      </section>


      {/* =================================================
          CONSULTATION LIST
          ================================================= */}

      <section className="panel">

        <div className="panel-heading">

          <div>

            <span className="section-kicker">
              TODAY
            </span>

            <h2>
              Consultation sessions
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

          {consultations.map(
            (consultation) => (

              <div
                className="workspace-status-item"
                key={consultation.id}
              >

                <div>

                  <strong>
                    {consultation.client}
                  </strong>

                  <span>
                    {consultation.type} · {consultation.time}
                  </span>

                </div>


                <span
                  className={
                    consultation.status === "Completed"
                      ? "status-available"
                      : consultation.status === "Active"
                      ? "status-available"
                      : "status-pending"
                  }
                >

                  <span className="status-dot" />

                  {consultation.status}

                </span>

              </div>

            )
          )}

        </div>

      </section>


      {/* =================================================
          CONSULTATION TYPES
          ================================================= */}

      <section className="role-dashboard-grid">


        <div className="panel">

          <div className="panel-heading">

            <div>

              <span className="section-kicker">
                SESSION TYPES
              </span>

              <h2>
                Consultation mix
              </h2>

            </div>

          </div>


          <div className="workspace-status-list">

            <StatusItem
              label="Tarot consultations"
              value="8"
            />


            <StatusItem
              label="Palm consultations"
              value="7"
            />


            <StatusItem
              label="Tarot + Palm"
              value="3"
            />

          </div>

        </div>


        <div className="panel">

          <div className="panel-heading">

            <div>

              <span className="section-kicker">
                FOLLOW-UP
              </span>

              <h2>
                Consultant workload
              </h2>

            </div>

          </div>


          <div className="workspace-status-list">

            <StatusItem
              label="Follow-ups today"
              value="3"
            />


            <StatusItem
              label="Pending reports"
              value="3"
            />


            <StatusItem
              label="Available hours"
              value="6"
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
              QUICK ACTIONS
            </span>

            <h2>
              Consultation tools
            </h2>

          </div>

        </div>


        <div className="dashboard-action-list">


          <Link
            to="/palm-analysis"
            className="dashboard-action"
          >

            <div className="dashboard-action-icon">

              <Fingerprint size={20} />

            </div>


            <div>

              <strong>
                Start Palm Consultation
              </strong>

              <span>
                Open the palm analysis workflow.
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
                Start Tarot Consultation
              </strong>

              <span>
                Open the Tarot reading workflow.
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
                Review consultant client records.
              </span>

            </div>


            <ArrowRight size={17} />

          </Link>


          <Link
            to="/reports"
            className="dashboard-action"
          >

            <div className="dashboard-action-icon">

              <FileText size={20} />

            </div>


            <div>

              <strong>
                Consultation Reports
              </strong>

              <span>
                Open generated consultation reports.
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