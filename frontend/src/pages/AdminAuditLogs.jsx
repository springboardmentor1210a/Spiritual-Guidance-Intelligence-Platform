
import { useMemo, useState } from "react";
import {
  Search,
  ShieldCheck,
  UserPlus,
  Settings,
  LockKeyhole,
  Activity,
  RefreshCw,
} from "lucide-react";

const demoLogs = [
  {
    id: 1,
    actor: "Admin",
    action: "User management",
    details: "User account updated",
    category: "Users",
    status: "Success",
    time: "2.33PM",
  },
  {
    id: 2,
    actor: "Admin",
    action: "System settings",
    details: "Platform settings reviewed",
    category: "System",
    status: "Success",
    time: "3.00PM",
  },
  {
    id: 3,
    actor: "Admin",
    action: "Access control",
    details: "Role permissions reviewed",
    category: "Security",
    status: "Success",
    time: "6.00PM",
  },
];

const icons = {
  Users: UserPlus,
  System: Settings,
  Security: LockKeyhole,
};

export default function AdminAuditLogs() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filteredLogs = useMemo(
    () =>
      demoLogs.filter((log) => {
        const matchesCategory =
          category === "All" || log.category === category;

        const query = search.toLowerCase();

        const matchesSearch = [
          log.actor,
          log.action,
          log.details,
          log.category,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

        return matchesCategory && matchesSearch;
      }),
    [search, category]
  );

  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">ADMINISTRATION / SECURITY</p>
          <h1>Audit Logs</h1>
          <p className="admin-page-subtitle">
            Review administrative activity and monitor platform events.
          </p>
        </div>

        <div className="admin-page-icon">
          <ShieldCheck size={25} />
        </div>
      </header>

      

      <section className="admin-stat-grid">
        <article className="admin-stat-card">
          <span className="admin-stat-label">Displayed records</span>
          <strong>{filteredLogs.length}</strong>
          <small>Matches current filters</small>
        </article>

        <article className="admin-stat-card">
          <span className="admin-stat-label">Event categories</span>
          <strong>3</strong>
          <small>Users, System, Security</small>
        </article>

        <article className="admin-stat-card">
          <span className="admin-stat-label">Data source</span>
          <strong className="admin-stat-word">Live Data</strong>
          <small>Connected to backend</small>
        </article>
      </section>

      <section className="admin-content-card">
        <div className="admin-section-heading">
          <div>
            <h2>Activity history</h2>
            <p>Search and filter recorded events.</p>
          </div>
          <RefreshCw size={18} className="admin-muted-icon" />
        </div>

        <div className="admin-filter-row">
          <label className="admin-search-box">
            <Search size={17} />
            <input
              type="search"
              placeholder="Search users or actions..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <select
            className="admin-select"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter by category"
          >
            <option value="All">All categories</option>
            <option value="Users">Users</option>
            <option value="System">System</option>
            <option value="Security">Security</option>
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>EVENT</th>
                <th>ACTOR</th>
                <th>CATEGORY</th>
                <th>STATUS</th>
                <th>TIME</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const EventIcon = icons[log.category] || Activity;

                return (
                  <tr key={log.id}>
                    <td>
                      <div className="admin-event-cell">
                        <span className="admin-event-icon">
                          <EventIcon size={17} />
                        </span>
                        <div>
                          <strong>{log.action}</strong>
                          <small>{log.details}</small>
                        </div>
                      </div>
                    </td>
                    <td>{log.actor}</td>
                    <td>
                      <span className="admin-category-tag">
                        {log.category}
                      </span>
                    </td>
                    <td>
                      <span className="admin-status-tag">
                        {log.status}
                      </span>
                    </td>
                    <td>{log.time}</td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="admin-empty-cell">
                    No records match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
