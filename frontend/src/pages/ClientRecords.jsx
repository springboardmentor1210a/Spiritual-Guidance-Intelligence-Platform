import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  History,
  UserRound,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";


export default function ClientRecords() {

  const clients = [

    {
      id: "CL-001",
      name: "Client 01",
      consultations: 4,
      lastSession: "Tarot",
      status: "Active",
    },

    {
      id: "CL-002",
      name: "Client 02",
      consultations: 3,
      lastSession: "Palm",
      status: "Active",
    },

    {
      id: "CL-003",
      name: "Client 03",
      consultations: 2,
      lastSession: "Tarot + Palm",
      status: "Follow-up",
    },

    {
      id: "CL-004",
      name: "Client 04",
      consultations: 5,
      lastSession: "Palm",
      status: "Active",
    },

  ];


  return (

    <div className="page-container">

      <section className="dashboard-hero role-dashboard-hero">

        <div>

          <div className="eyebrow">

            <Users size={15} />

            CLIENT MANAGEMENT

          </div>


          <h1>

            Client Records

            <span className="muted-dot">
              .
            </span>

          </h1>


          <p>

            Review consultation activity, session history
            and follow-up information for your spiritual clients.

          </p>

        </div>


        <div className="role-pill">

          <Users size={15} />

          Client Workspace

        </div>

      </section>


      {/* =================================================
          CLIENT STATISTICS
          ================================================= */}

      <section className="role-stat-grid">

        <Stat
          icon={Users}
          label="Client records"
          value="14"
          note="Consultant workspace records"
        />


        <Stat
          icon={CheckCircle2}
          label="Active clients"
          value="9"
          note="Currently active records"
        />


        <Stat
          icon={CalendarDays}
          label="Follow-ups"
          value="3"
          note="Follow-ups requiring attention"
        />


        <Stat
          icon={History}
          label="Total sessions"
          value="18"
          note="Recorded consultation sessions"
        />

      </section>


      {/* =================================================
          CLIENT LIST
          ================================================= */}

      <section className="panel">

        <div className="panel-heading">

          <div>

            <span className="section-kicker">
              CLIENT DIRECTORY
            </span>

            <h2>
              Consultation clients
            </h2>

          </div>

        </div>


        <div className="workspace-status-list">

          {clients.map(
            (client) => (

              <div
                className="workspace-status-item"
                key={client.id}
              >

                <div>

                  <strong>
                    {client.name}
                  </strong>

                  <span>

                    {client.id} ·{" "}
                    {client.consultations} consultations ·{" "}
                    {client.lastSession}

                  </span>

                </div>


                <span
                  className={
                    client.status === "Active"
                      ? "status-available"
                      : "status-pending"
                  }
                >

                  <span className="status-dot" />

                  {client.status}

                </span>

              </div>

            )
          )}

        </div>

      </section>


      {/* =================================================
          CLIENT OVERVIEW
          ================================================= */}

      <section className="role-dashboard-grid">


        <div className="panel">

          <div className="panel-heading">

            <div>

              <span className="section-kicker">
                CLIENT ACTIVITY
              </span>

              <h2>
                Client activity
              </h2>

            </div>

          </div>


          <div className="workspace-status-list">

            <StatusItem
              label="Active clients"
              value="9"
            />


            <StatusItem
              label="Follow-up clients"
              value="3"
            />


            <StatusItem
              label="New client records"
              value="2"
            />


            <StatusItem
              label="Completed client sessions"
              value="18"
            />

          </div>

        </div>


        <div className="panel">

          <div className="panel-heading">

            <div>

              <span className="section-kicker">
                READING PREFERENCE
              </span>

              <h2>
                Consultation types
              </h2>

            </div>

          </div>


          <div className="workspace-status-list">

            <StatusItem
              label="Tarot-focused"
              value="8"
            />


            <StatusItem
              label="Palm-focused"
              value="7"
            />


            <StatusItem
              label="Combined readings"
              value="3"
            />

          </div>

        </div>

      </section>


      {/* =================================================
          CLIENT ACTIONS
          ================================================= */}

      <section className="panel">

        <div className="panel-heading">

          <div>

            <span className="section-kicker">
              CLIENT ACTIONS
            </span>

            <h2>
              Quick access
            </h2>

          </div>

        </div>


        <div className="dashboard-action-list">


          <Link
            to="/history"
            className="dashboard-action"
          >

            <div className="dashboard-action-icon">

              <History size={20} />

            </div>


            <div>

              <strong>
                Consultation History
              </strong>

              <span>
                Review previous client reading activity.
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
                Client Reports
              </strong>

              <span>
                Review available consultation reports.
              </span>

            </div>


            <ArrowRight size={17} />

          </Link>


          <Link
            to="/profile"
            className="dashboard-action"
          >

            <div className="dashboard-action-icon">

              <UserRound size={20} />

            </div>


            <div>

              <strong>
                Consultant Profile
              </strong>

              <span>
                Manage your consultant account.
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