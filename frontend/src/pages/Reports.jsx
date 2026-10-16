
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FileText,
  Download,
  Eye,
  CalendarDays,
  Sparkles,
  FileDown,
} from "lucide-react";

import {
  getMyReports,
  downloadReportPdf,
} from "../api/reports";

export default function Reports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      const data = await getMyReports();

      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.message || "Unable to load reports."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function handleDownload(reportId) {
    try {
      await downloadReportPdf(reportId);
    } catch (err) {
      setError(
        err.message || "Unable to download report."
      );
    }
  }

  if (loading) {
    return (
      <div className="page-shell reports-page tr-report">
        <div className="reports-loading">
          <div className="reports-loading-icon">
            <FileText size={26} />
          </div>

          <h1>Loading Reports</h1>

          <p>
            Preparing your personal reading reports...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell reports-page tr-report">

      {/* PAGE HEADER */}
      <section className="reports-hero">

        <div className="reports-hero-content">

          <div className="reports-icon">
            <FileText size={28} />
          </div>

          <div>
            <span className="section-kicker">
              YOUR READING ARCHIVE
            </span>

            <h1>My Reports</h1>

            <p>
              View and download your Palmistry and Tarot
              reading reports in one place.
            </p>
          </div>

        </div>

        <div className="reports-count">
          <strong>{reports.length}</strong>
          <span>
            {reports.length === 1
              ? "Report"
              : "Reports"}
          </span>
        </div>

      </section>

      {/* ERROR */}
      {error && (
        <div className="error-message reports-error">
          {error}
        </div>
      )}

      {/* EMPTY STATE */}
      {reports.length === 0 ? (
        <section className="reports-empty">

          <div className="reports-empty-icon">
            <FileDown size={30} />
          </div>

          <span className="section-kicker">
            NO REPORTS FOUND
          </span>

          <h2>No reports yet</h2>

          <p>
            Complete a Palmistry or Tarot analysis
            to generate your first report.
          </p>

          <div className="reports-empty-actions">

            <button
              className="button"
              onClick={() => navigate("/palm")}
            >
              Start Palmistry
            </button>

            <button
              className="button secondary"
              onClick={() => navigate("/tarot")}
            >
              Explore Tarot
            </button>

          </div>

        </section>
      ) : (

        /* REPORT LIST */
        <section className="reports-section">

          <div className="reports-section-heading">

            <div>
              <span className="section-kicker">
                REPORT LIBRARY
              </span>

              <h2>Your Reports</h2>
            </div>

            <div className="reports-section-meta">
              <Sparkles size={16} />
              <span>
                Your personalized readings
              </span>
            </div>

          </div>

          <div className="reports-list">

            {reports.map((report) => (

              <article
                className="report-card tr-report-card"
                key={report.id}
              >

                <div className="report-card-main">

                  <div className="report-file-icon">
                    <FileText size={22} />
                  </div>

                  <div className="report-info">

                    <div className="report-meta-row">

                      <span className="history-type">
                        {report.report_type}
                      </span>

                      <span className="report-date">
                        <CalendarDays size={14} />

                        {new Date(
                          report.created_at
                        ).toLocaleString()}
                      </span>

                    </div>

                    <h3>
                      {report.title}
                    </h3>

                    <p>
                      Personalized spiritual
                      intelligence report generated
                      from your reading.
                    </p>

                  </div>

                </div>

                <div className="report-actions">

                  <button
                    className="button"
                    onClick={() =>
                      navigate(
                        `/reports/${report.id}`
                      )
                    }
                  >
                    <Eye size={16} />
                    View Report
                  </button>

                  <button
                    className="button secondary"
                    onClick={() =>
                      handleDownload(report.id)
                    }
                  >
                    <Download size={16} />
                    Download PDF
                  </button>

                </div>

              </article>

            ))}

          </div>

        </section>

      )}

    </div>
  );
}
