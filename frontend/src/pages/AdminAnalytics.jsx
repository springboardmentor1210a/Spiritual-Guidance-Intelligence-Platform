
import {
  Users,
  BookOpen,
  CalendarCheck,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const registrationData = [
  { month: "May", users: 18 },
  { month: "Jun", users: 27 },
  { month: "Jul", users: 23 },
  { month: "Aug", users: 39 },
  { month: "Sep", users: 32 },
  { month: "Oct", users: 46 },
];

const featureData = [
  { feature: "Tarot", usage: 42 },
  { feature: "Palmistry", usage: 35 },
  { feature: "Readings", usage: 28 },
  { feature: "Bookings", usage: 21 },
];

const tooltipStyle = {
  backgroundColor: "#17172a",
  border: "1px solid rgba(185,154,104,0.3)",
  borderRadius: "10px",
  color: "#eeeaf5",
};

export default function AdminAnalytics() {
  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">ADMINISTRATION / INSIGHTS</p>
          <h1>Platform Analytics</h1>
          <p className="admin-page-subtitle">
            Explore user growth and platform feature usage.
          </p>
        </div>

        <div className="admin-page-icon">
          <TrendingUp size={25} />
        </div>
      </header>

      <section className="admin-stat-grid">
        <article className="admin-stat-card">
          <span className="admin-stat-icon">
            <Users size={19} />
          </span>
          <span className="admin-stat-label">Total users</span>
          <strong>120</strong>
          <small>Registered users</small>
        </article>

        <article className="admin-stat-card">
          <span className="admin-stat-icon">
            <BookOpen size={19} />
          </span>
          <span className="admin-stat-label">Total readings</span>
          <strong>86</strong>
          <small>Readings completed</small>
        </article>

        <article className="admin-stat-card">
          <span className="admin-stat-icon">
            <CalendarCheck size={19} />
          </span>
          <span className="admin-stat-label">Appointments</span>
          <strong>42</strong>
          <small>Appointments booked</small>
        </article>

        <article className="admin-stat-card">
          <span className="admin-stat-icon">
            <TrendingUp size={19} />
          </span>
          <span className="admin-stat-label">User growth</span>
          <strong>18%</strong>
          <small>Illustrative growth</small>
        </article>
      </section>

      <section className="admin-chart-grid">
        <article className="admin-content-card">
          <div className="admin-section-heading">
            <div>
              <h2>User registrations</h2>
              <p>Illustrative monthly registration trend</p>
            </div>
            <Users size={18} className="admin-muted-icon" />
          </div>

          <div className="admin-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationData}>
                <defs>
                  <linearGradient
                    id="registrationFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#8b76d8"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor="#8b76d8"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="rgba(255,255,255,0.07)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="#9798aa"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9798aa"
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="users"
                  name="Registrations"
                  stroke="#b99a68"
                  strokeWidth={2}
                  fill="url(#registrationFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="admin-content-card">
          <div className="admin-section-heading">
            <div>
              <h2>Feature usage</h2>
              <p>Illustrative activity comparison</p>
            </div>
            <Activity size={18} className="admin-muted-icon" />
          </div>

          <div className="admin-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureData} barSize={25}>
                <CartesianGrid
                  stroke="rgba(255,255,255,0.07)"
                  vertical={false}
                />
                <XAxis
                  dataKey="feature"
                  stroke="#9798aa"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9798aa"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="usage"
                  name="Feature usage"
                  fill="#8b76d8"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>
    </main>
  );
}
