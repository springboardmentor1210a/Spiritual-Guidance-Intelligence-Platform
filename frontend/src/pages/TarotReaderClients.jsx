
import {
  ArrowRight,
  Search,
  UserPlus,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useState } from "react";
import AppointmentNavigation from "../components/AppointmentNavigation";

const DEMO_CLIENTS = [
  {
    name: "Ananya S.",
    email: "ananya.demo@example.com",
    reading: "Career Reading",
    lastSession: "Sep 28, 2026",
    status: "Returning",
    sessions: 6,
  },
  {
    name: "Rahul K.",
    email: "rahul.demo@example.com",
    reading: "Relationship Reading",
    lastSession: "Sep 25, 2026",
    status: "Returning",
    sessions: 4,
  },
  {
    name: "Priya M.",
    email: "priya.demo@example.com",
    reading: "Celtic Cross",
    lastSession: "Sep 20, 2026",
    status: "Follow-up",
    sessions: 3,
  },
  {
    name: "Meera R.",
    email: "meera.demo@example.com",
    reading: "Three Card",
    lastSession: "Sep 18, 2026",
    status: "New",
    sessions: 1,
  },
  {
    name: "Kavya P.",
    email: "kavya.demo@example.com",
    reading: "Life Path",
    lastSession: "Sep 14, 2026",
    status: "Returning",
    sessions: 8,
  },
  {
    name: "Arjun V.",
    email: "arjun.demo@example.com",
    reading: "Career Reading",
    lastSession: "Sep 10, 2026",
    status: "Follow-up",
    sessions: 2,
  },
];

export default function TarotReaderClients() {
  const [search, setSearch] = useState("");

  const filteredClients =
    DEMO_CLIENTS.filter(
      (client) => {

        const query =
          search.trim().toLowerCase();

        if (!query) {
          return true;
        }

        return (
          client.name
            .toLowerCase()
            .includes(query) ||

          client.email
            .toLowerCase()
            .includes(query) ||

          client.reading
            .toLowerCase()
            .includes(query)
        );

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
            <Users size={15} />
            READER CLIENTS
          </div>

          <h1>
            Client workspace
            <span className="muted-dot">.</span>
          </h1>

          <p>
            Review your client list, recent readings and
            reader-client history.
          </p>

        </div>

        <div className="role-pill">
          <Users size={15} />
          18 Active Clients
        </div>

      </section>

      {/* =================================================
          DEMO NOTICE
          ================================================= */}

      <section className="reader-demo-notice">

        <div className="reader-demo-notice-icon">
          <Users size={17} />
        </div>

        <div>

          <strong>
            Demo client workspace
          </strong>

          <p>
            These client records are demonstration data.
            Real client management will be connected to
            the FastAPI backend in the next stage.
          </p>

        </div>

      </section>

      {/* =================================================
          CLIENT HEADER
          ================================================= */}

      <section className="panel">

        <div className="panel-heading">

          <div>

            <span className="section-kicker">
              CLIENT DIRECTORY
            </span>

            <h2>
              Your clients
            </h2>

          </div>

          <button
            className="button secondary"
            type="button"
            disabled
            title="Available when client backend is connected"
          >

            <UserPlus size={16} />

            Add Client

          </button>

        </div>

        {/* =================================================
            SEARCH
            ================================================= */}

        <div className="reader-search">

          <Search size={17} />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search clients..."
          />

        </div>

        {/* =================================================
            TABLE
            ================================================= */}

        <div className="reader-client-table">

          <div className="reader-table-header">

            <span>
              Client
            </span>

            <span>
              Latest Reading
            </span>

            <span>
              Last Session
            </span>

            <span>
              Sessions
            </span>

            <span>
              Status
            </span>

          </div>

          {filteredClients.length === 0 ? (

            <div className="reader-no-results">

              <Users size={24} />

              <strong>
                No clients found
              </strong>

              <span>
                Try a different client name or reading type.
              </span>

            </div>

          ) : (

            filteredClients.map(
              (client) => (

                <div
                  className="reader-client-row"
                  key={client.email}
                >

                  <div className="reader-client-name">

                    <strong>
                      {client.name}
                    </strong>

                    <span>
                      {client.email}
                    </span>

                  </div>

                  <span>
                    {client.reading}
                  </span>

                  <span>
                    {client.lastSession}
                  </span>

                  <strong>
                    {client.sessions}
                  </strong>

                  <span
                    className={`reader-client-status ${getClientStatusClass(
                      client.status
                    )}`}
                  >
                    {client.status}
                  </span>

                </div>

              )
            )

          )}

        </div>

      </section>

      {/* =================================================
          QUICK ACTIONS
          ================================================= */}

      <section className="reader-main-grid">

        <div className="panel">

          <div className="panel-heading">

            <div>

              <span className="section-kicker">
                READER ACTIONS
              </span>

              <h2>
                Client workflow
              </h2>

            </div>

          </div>

          <div className="dashboard-action-list">

            <Link
              to="/tarot-reading"
              className="dashboard-action"
            >

              <div className="dashboard-action-icon">
                <Users size={20} />
              </div>

              <div>

                <strong>
                  Start Client Reading
                </strong>

                <span>
                  Open the Tarot system for a new session.
                </span>

              </div>

              <ArrowRight size={17} />

            </Link>

            <Link
              to="/appointment-schedule"
              className="dashboard-action"
            >

              <div className="dashboard-action-icon">
                <Users size={20} />
              </div>

              <div>

                <strong>
                  View Client Schedule
                </strong>

                <span>
                  Review today's reader appointment workspace.
                </span>

              </div>

              <ArrowRight size={17} />

            </Link>

          </div>

        </div>

        <div className="panel">

          <div className="panel-heading">

            <div>

              <span className="section-kicker">
                CLIENT SUMMARY
              </span>

              <h2>
                Practice overview
              </h2>

            </div>

          </div>

          <div className="reader-summary-list">

            <SummaryItem
              label="Active clients"
              value="18"
            />

            <SummaryItem
              label="Returning clients"
              value="14"
            />

            <SummaryItem
              label="New this week"
              value="3"
            />

            <SummaryItem
              label="Follow-ups"
              value="4"
            />

          </div>

        </div>

      </section>

    </div>
  );
}

function getClientStatusClass(status) {

  if (status === "Returning") {
    return "client-returning";
  }

  if (status === "Follow-up") {
    return "client-followup";
  }

  return "client-new";
}

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

    </div>
  );
}
