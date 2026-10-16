import {
  FileText,
  ShieldCheck,
} from "lucide-react";

import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";


export default function AdminReports() {

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    loadReports();

  }, []);


  async function loadReports() {

    try {

      const data = await apiRequest(
        "/api/v1/admin/reports"
      );

      setReports(data.reports || []);

    } finally {

      setLoading(false);

    }

  }


  return (
    <div className="page-container">

      <section className="dashboard-hero role-dashboard-hero">

        <div>

          <div className="eyebrow">
            <FileText size={15} />
            ADMINISTRATION
          </div>

          <h1>
            Reports management
            <span className="muted-dot">.</span>
          </h1>

          <p>
            Review generated reading reports across the platform.
          </p>

        </div>

        <div className="role-pill">
          <ShieldCheck size={15} />
          Administrator
        </div>

      </section>


      <section className="role-stat-grid">

        <div className="role-stat-card">

          <div className="role-stat-top">

            <div className="role-stat-icon">
              <FileText size={19} />
            </div>

            <span>Total reports</span>

          </div>

          <strong>
            {reports.length}
          </strong>

          <p>
            Reports stored in PostgreSQL
          </p>

        </div>

      </section>


      <section className="panel">

        <div className="panel-heading">

          <div>

            <span className="section-kicker">
              GENERATED REPORTS
            </span>

            <h2>
              Report records
            </h2>

          </div>

        </div>


        {loading ? (

          <div className="empty-state">
            <p>Loading reports...</p>
          </div>

        ) : reports.length === 0 ? (

          <div className="empty-state">

            <FileText size={28} />

            <p>
              No reports have been generated yet.
            </p>

          </div>

        ) : (

          <div className="admin-table">

            <div className="admin-table-head">

              <span>ID</span>
              <span>User</span>
              <span>Type</span>
              <span>Title</span>
              <span>Date</span>

            </div>


            {reports.map((report) => (

              <div
                className="admin-table-row"
                key={report.id}
              >

                <span>
                  #{report.id}
                </span>

                <strong>
                  {report.user_email}
                </strong>

                <span>
                  {report.report_type}
                </span>

                <span>
                  {report.title}
                </span>

                <span>
                  {new Date(
                    report.created_at
                  ).toLocaleString()}
                </span>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}