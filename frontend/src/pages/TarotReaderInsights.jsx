
import { useState } from "react";
import {
  Activity,
  CalendarCheck,
  Star,
  Users,
  TrendingUp,
  Clock3,
  Sparkles,
} from "lucide-react";

const demoMonths = [
  { month: "May", consultations: 12 },
  { month: "Jun", consultations: 18 },
  { month: "Jul", consultations: 15 },
  { month: "Aug", consultations: 24 },
  { month: "Sep", consultations: 21 },
  { month: "Oct", consultations: 28 },
];

const demoServices = [
  { name: "General Tarot Reading", count: 18 },
  { name: "Love & Relationships", count: 14 },
  { name: "Career Guidance", count: 11 },
  { name: "Spiritual Guidance", count: 8 },
];

export default function TarotReaderInsights() {
  const [period, setPeriod] = useState("6months");

  const months =
    period === "3months" ? demoMonths.slice(-3) : demoMonths;

  const totalConsultations = months.reduce(
    (sum, month) => sum + month.consultations,
    0
  );

  const maxConsultations = Math.max(
    ...months.map((month) => month.consultations),
    1
  );

  return (
    <main className="tr-insights page-enter">
      <header className="tr-page-heading">
        <div>
          <span className="tr-eyebrow">PERFORMANCE OVERVIEW</span>
          <h1>Tarot Reader Insights</h1>
          <p>
            Understand your consultation activity and service trends.
          </p>
        </div>

        <div className="tr-demo-label">
          <span />
          Demo data
        </div>
      </header>

      <section className="tr-insight-banner">
        <div className="tr-banner-icon">
          <Sparkles size={24} />
        </div>
        <div>
          <h2>Your practice at a glance</h2>
          <p>
            Explore consultation volume, service preferences, and
            performance indicators.
          </p>
        </div>
      </section>

      <section className="tr-stat-grid">
        <article className="tr-stat-card">
          <div className="tr-stat-top">
            <span>Consultations</span>
            <span className="tr-stat-icon purple">
              <CalendarCheck size={20} />
            </span>
          </div>
          <strong>{totalConsultations}</strong>
          <small>Across the selected demo period</small>
        </article>

        <article className="tr-stat-card">
          <div className="tr-stat-top">
            <span>Services Offered</span>
            <span className="tr-stat-icon gold">
              <Activity size={20} />
            </span>
          </div>
          <strong>{demoServices.length}</strong>
          <small>Example consultation categories</small>
        </article>

        <article className="tr-stat-card">
          <div className="tr-stat-top">
            <span>Average Rating</span>
            <span className="tr-stat-icon gold">
              <Star size={20} />
            </span>
          </div>
          <strong>—</strong>
          <small>Connect actual client reviews to display</small>
        </article>

        <article className="tr-stat-card">
          <div className="tr-stat-top">
            <span>Returning Clients</span>
            <span className="tr-stat-icon green">
              <Users size={20} />
            </span>
          </div>
          <strong>—</strong>
          <small>Requires actual client history</small>
        </article>
      </section>

      <section className="tr-insight-grid">
        <article className="tr-panel">
          <div className="tr-panel-heading">
            <div>
              <h2>Consultation Activity</h2>
              <p>Number of consultations by month</p>
            </div>

            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              aria-label="Consultation reporting period"
            >
              <option value="6months">Last 6 months</option>
              <option value="3months">Last 3 months</option>
            </select>
          </div>

          <div
            className="tr-chart"
            role="img"
            aria-label="Demo monthly consultation activity bar chart"
          >
            {months.map((item, index) => (
              <div className="tr-chart-column" key={item.month}>
                <span className="tr-chart-value">
                  {item.consultations}
                </span>
                <div className="tr-chart-track">
                  <div
                    className="tr-chart-bar"
                    style={{
                      "--bar-height":
                        `${(item.consultations / maxConsultations) * 100}%`,
                      animationDelay: `${index * 80}ms`,
                    }}
                  />
                </div>
                <span className="tr-chart-label">{item.month}</span>
              </div>
            ))}
          </div>

          <div className="tr-chart-legend">
            <span />
            Demo consultations
          </div>
        </article>

        <article className="tr-panel">
          <div className="tr-panel-heading">
            <div>
              <h2>Popular Services</h2>
              <p>Example consultation distribution</p>
            </div>
          </div>

          <div className="tr-service-list">
            {demoServices.map((service, index) => {
              const maxServiceCount = Math.max(
                ...demoServices.map((item) => item.count),
                1
              );

              return (
                <div className="tr-service-item" key={service.name}>
                  <div className="tr-service-meta">
                    <span>{service.name}</span>
                    <strong>{service.count}</strong>
                  </div>
                  <div className="tr-service-track">
                    <div
                      className={`tr-service-bar tr-service-color-${index}`}
                      style={{
                        width: `${
                          (service.count / maxServiceCount) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="tr-demo-note">
            <TrendingUp size={15} />
            Service counts are illustrative, not live bookings.
          </p>
        </article>
      </section>

      <section className="tr-panel tr-insight-footer">
        <div className="tr-footer-icon">
          <Clock3 size={21} />
        </div>
        <div>
          <h2>Make insights more useful</h2>
          <p>
            Once connected to your backend, this page can report actual
            completed sessions, cancellations, returning clients, and
            monthly consultation growth.
          </p>
        </div>
      </section>
    </main>
  );
}
