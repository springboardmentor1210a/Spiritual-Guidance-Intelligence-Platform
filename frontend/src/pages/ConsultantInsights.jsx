
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Star,
  TrendingUp,
  Info,
  UsersRound,
} from "lucide-react";
import { useState } from "react";

const DEMO_STATS = {
  total: 128,
  completed: 104,
  upcoming: 12,
  cancelled: 12,
  rating: 4.8,
};

const DEMO_MONTHLY_TRENDS = [
  { month: "May", consultations: 62 },
  { month: "June", consultations: 74 },
  { month: "July", consultations: 81 },
  { month: "August", consultations: 93 },
  { month: "September", consultations: 107 },
  { month: "October", consultations: 128 },
];

const DEMO_SERVICES = [
  { name: "Tarot Reading", count: 58 },
  { name: "Spiritual Guidance", count: 42 },
  { name: "Birth Chart Reading", count: 28 },
];

export default function ConsultantInsights() {
  const [lastRefreshed, setLastRefreshed] = useState(0);

  const completionRate = Number(
    ((DEMO_STATS.completed / DEMO_STATS.total) * 100).toFixed(2)
  );

  const stats = [
    {
      title: "Total Consultations",
      value: DEMO_STATS.total,
      subtitle: "All demo sessions",
      icon: CalendarDays,
    },
    {
      title: "Completed Sessions",
      value: DEMO_STATS.completed,
      subtitle: "Successfully completed",
      icon: CheckCircle2,
    },
    {
      title: "Upcoming Sessions",
      value: DEMO_STATS.upcoming,
      subtitle: "Scheduled demo sessions",
      icon: Clock,
    },
    {
      title: "Cancelled Sessions",
      value: DEMO_STATS.cancelled,
      subtitle: "Cancelled demo sessions",
      icon: XCircle,
    },
  ];

  const maxMonthly = Math.max(
    ...DEMO_MONTHLY_TRENDS.map((item) => item.consultations)
  );

  function refreshInsights() {
    setLastRefreshed((value) => value + 1);
  }

  return (
    <main className="consultant-page consultant-page-animated">
      <header className="consultant-page-header">
        <div>
          <p className="consultant-eyebrow">PERFORMANCE OVERVIEW</p>
          <h1>Consultant Insights</h1>
          <p>
            Understand your consultation activity and appointment outcomes.
          </p>
        </div>

        <button
          type="button"
          className="consultant-refresh-button"
          onClick={refreshInsights}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      <div
        role="note"
        style={{
          marginBottom: 20,
          padding: "12px 16px",
          border: "1px solid rgba(185,154,104,0.3)",
          borderRadius: 10,
          background: "rgba(185,154,104,0.08)",
          color: "#d9c49d",
          fontSize: 13,
        }}
      >
      </div>

      <section className="consultant-stat-grid">
        {stats.map(({ title, value, subtitle, icon: Icon }) => (
          <article className="consultant-stat-card" key={title}>
            <div className="consultant-stat-icon">
              <Icon size={21} />
            </div>
            <p>{title}</p>
            <h2>{value}</h2>
            <span>{subtitle}</span>
          </article>
        ))}
      </section>

      
<section className="consultant-insights-grid">
  <article className="consultant-stat-card">
    <div className="consultant-stat-icon">
      <Activity size={21} />
    </div>
    <p>Completion Rate</p>
    <h2>{completionRate}%</h2>
    <span>Completed out of all demo consultations</span>
  </article>

  <article className="consultant-stat-card">
    <div className="consultant-stat-icon">
      <Star size={21} />
    </div>
    <p>Average Session Rating</p>
    <h2>{DEMO_STATS.rating}/5</h2>
    <span>Illustrative client rating</span>
  </article>

  <article className="consultant-stat-card">
    <div className="consultant-stat-icon">
      <TrendingUp size={21} />
    </div>
    <p>Popular Service</p>
    <h2 style={{ fontSize: 19 }}>Tarot Reading</h2>
    <span>58 demo consultations</span>
  </article>

  <article className="consultant-stat-card">
    <div className="consultant-stat-icon">
      <UsersRound size={21} />
    </div>
    <p>Client Retention</p>
    <h2>36%</h2>
    <span>Illustrative returning-client rate</span>
  </article>
</section>


      <section className="consultant-panel">
        <h2>
          <Activity size={20} style={{ verticalAlign: "middle", marginRight: 8 }} />
          Appointment Completion
        </h2>

        <div className="consultant-progress-track">
          <div
            className="consultant-progress-fill"
            style={{ width: `${completionRate}%` }}
          />
        </div>

        <p className="consultant-completion-value">
          {completionRate}% completed
        </p>

        <p>
          {DEMO_STATS.completed} of {DEMO_STATS.total} demo consultations are
          marked as completed.
        </p>
      </section>

      <section className="consultant-panel">
        <h2>Monthly Consultation Trends</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
            gap: 12,
            alignItems: "end",
            minHeight: 220,
            padding: "24px 0 8px",
          }}
        >
          {DEMO_MONTHLY_TRENDS.map((item) => (
            <div
              key={item.month}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 9,
                minWidth: 0,
              }}
            >
              <span style={{ color: "#d9c49d", fontSize: 12 }}>
                {item.consultations}
              </span>

              <div
                title={`${item.month}: ${item.consultations} consultations`}
                style={{
                  width: "100%",
                  maxWidth: 52,
                  height: `${(item.consultations / maxMonthly) * 135}px`,
                  minHeight: 8,
                  borderRadius: "7px 7px 2px 2px",
                  background: "linear-gradient(180deg, #b99a68, #8b76d8)",
                }}
              />

              <span
                style={{
                  color: "#aaa7bd",
                  fontSize: 11,
                  textAlign: "center",
                  overflowWrap: "anywhere",
                }}
              >
                {item.month}
              </span>
            </div>
          ))}
        </div>

      
      </section>

      <section className="consultant-panel">
        <h2>Popular Consultation Services</h2>

        <div style={{ display: "grid", gap: 20, marginTop: 20 }}>
          {DEMO_SERVICES.map((service) => {
            const percentage = (service.count / DEMO_STATS.total) * 100;

            return (
              <div key={service.name}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 8,
                    color: "#d0ccdf",
                    fontSize: 13,
                  }}
                >
                  <span>{service.name}</span>
                  <span style={{ color: "#d9c49d" }}>
                    {service.count} sessions
                  </span>
                </div>

                <div
                  className="consultant-progress-track"
                  style={{ overflow: "hidden" }}
                >
                  <div
                    className="consultant-progress-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {lastRefreshed > 0 && (
        <p style={{ color: "#aaa7bd", fontSize: 12 }}>
          Demo view refreshed. The sample values remain unchanged.
        </p>
      )}
    </main>
  );
}
