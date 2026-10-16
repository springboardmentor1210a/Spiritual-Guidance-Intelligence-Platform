
import {
  Activity,
  Fingerprint,
  ShieldCheck,
} from "lucide-react";

import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";

const demoReadings = [
  {
    id: "DEMO-P001",
    user_email: "ananya.sharma@example.com",
    reading_type: "Palmistry Analysis",
    created_at: "2026-10-12T09:30:00",
    demo: true,
  },
  {
    id: "DEMO-P002",
    user_email: "rahul.menon@example.com",
    reading_type: "Palm Reading",
    created_at: "2026-10-11T14:15:00",
    demo: true,
  },
  {
    id: "DEMO-P003",
    user_email: "priya.krishnan@example.com",
    reading_type: "Palmistry Analysis",
    created_at: "2026-10-10T11:45:00",
    demo: true,
  },
  {
    id: "DEMO-P004",
    user_email: "arjun.reddy@example.com",
    reading_type: "Palm Reading",
    created_at: "2026-10-09T16:20:00",
    demo: true,
  },
  {
    id: "DEMO-P005",
    user_email: "meera.nair@example.com",
    reading_type: "Palmistry Analysis",
    created_at: "2026-10-08T10:00:00",
    demo: true,
  },
];

export default function AdminPalmistry() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPalmistry();
  }, []);

  async function loadPalmistry() {
    try {
      const data = await apiRequest(
        "/api/v1/admin/readings"
      );

      const palmReadings = (data.readings || [])
        .filter((item) =>
          item.reading_type
            ?.toLowerCase()
            .includes("palm")
        );

      setReadings(
        palmReadings.length > 0
          ? palmReadings
          : demoReadings
      );
    } catch (error) {
      console.error("Failed to load palmistry readings:", error);
      setReadings(demoReadings);
    } finally {
      setLoading(false);
    }
  }

  const isDemo = readings.some((reading) => reading.demo);

  return (
    <div className="page-container">
      <section className="dashboard-hero role-dashboard-hero">
        <div>
          <div className="eyebrow">
            <Fingerprint size={15} />
            ADMINISTRATION
          </div>

          <h1>
            Palmistry management
            <span className="muted-dot">.</span>
          </h1>

          <p>
            Review palm analysis activity and saved palm reading sessions.
          </p>
        </div>

        <div className="role-pill">
          <ShieldCheck size={15} />
          Administrator
        </div>
      </section>

      {isDemo && !loading && (
        <p className="section-kicker">
        </p>
      )}

      <section className="role-stat-grid">
        <div className="role-stat-card">
          <div className="role-stat-top">
            <div className="role-stat-icon">
              <Fingerprint size={19} />
            </div>

            <span>Total analyses</span>
          </div>

          <strong>{readings.length}</strong>

          <p>Saved palm analysis sessions</p>
        </div>

        <div className="role-stat-card">
          <div className="role-stat-top">
            <div className="role-stat-icon">
              <Activity size={19} />
            </div>

            <span>Analysis activity</span>
          </div>

          <strong>{readings.length}</strong>

          <p>Recorded in reading sessions</p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="section-kicker">
              PALMISTRY ACTIVITY
            </span>

            <h2>Recent palm analyses</h2>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading palmistry activity...</p>
          </div>
        ) : readings.length === 0 ? (
          <div className="empty-state">
            <Fingerprint size={28} />

            <p>
              No palm analysis sessions have been recorded yet.
            </p>
          </div>
        ) : (
          <div className="admin-table">
            <div className="admin-table-head">
              <span>ID</span>
              <span>User</span>
              <span>Type</span>
              <span>Date</span>
            </div>

            {readings.map((reading) => (
              <div
                className="admin-table-row"
                key={reading.id}
              >
                <span>
                  #{reading.id}
                </span>

                <strong>
                  {reading.user_email || "Email unavailable"}
                </strong>

                <span>
                  {reading.reading_type}
                </span>

                <span>
                  {reading.created_at
                    ? new Date(reading.created_at).toLocaleString()
                    : "Date unavailable"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
