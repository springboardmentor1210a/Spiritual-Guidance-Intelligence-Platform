
import {
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";

const demoUsers = [
  {
    id: "DEMO-U001",
    email: "admin@example.com",
    role: "administrator",
    is_active: true,
    created_at: "2026-09-01T09:00:00",
    demo: true,
  },
  {
    id: "DEMO-U002",
    email: "ananya.sharma@example.com",
    role: "user",
    is_active: true,
    created_at: "2026-09-05T10:30:00",
    demo: true,
  },
  {
    id: "DEMO-U003",
    email: "rahul.menon@example.com",
    role: "tarot_reader",
    is_active: true,
    created_at: "2026-09-08T12:15:00",
    demo: true,
  },
  {
    id: "DEMO-U004",
    email: "priya.krishnan@example.com",
    role: "spiritual_consultant",
    is_active: true,
    created_at: "2026-09-12T14:00:00",
    demo: true,
  },
  {
    id: "DEMO-U005",
    email: "arjun.reddy@example.com",
    role: "user",
    is_active: false,
    created_at: "2026-09-18T16:45:00",
    demo: true,
  },
  {
    id: "DEMO-U006",
    email: "meera.nair@example.com",
    role: "tarot_reader",
    is_active: true,
    created_at: "2026-09-22T11:20:00",
    demo: true,
  },
  {
    id: "DEMO-U007",
    email: "karthik.iyer@example.com",
    role: "spiritual_consultant",
    is_active: true,
    created_at: "2026-09-26T13:10:00",
    demo: true,
  },
  {
    id: "DEMO-U008",
    email: "divya.krish@example.com",
    role: "user",
    is_active: true,
    created_at: "2026-10-02T08:45:00",
    demo: true,
  },
];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await apiRequest(
        "/api/v1/admin/users"
      );

      const apiUsers = data.users || [];

      setUsers(
        apiUsers.length > 0
          ? apiUsers
          : demoUsers
      );
    } catch (error) {
      console.error("Failed to load users:", error);
      setUsers(demoUsers);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = (user.email || "")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const isDemo = users.some((user) => user.demo);

  return (
    <div className="page-container">
      <section className="dashboard-hero role-dashboard-hero">
        <div>
          <div className="eyebrow">
            <Users size={15} />
            ADMINISTRATION
          </div>

          <h1>
            User management
            <span className="muted-dot">.</span>
          </h1>

          <p>
            View registered accounts, roles and account status.
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

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="section-kicker">
              PLATFORM USERS
            </span>

            <h2>{users.length} {isDemo ? "sample accounts" : "registered users"}</h2>
          </div>
        </div>

        <div className="admin-filter-row">
          <div className="admin-search">
            <Search size={17} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by email"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value)
            }
          >
            <option value="all">All roles</option>
            <option value="administrator">Administrators</option>
            <option value="tarot_reader">Tarot Readers</option>
            <option value="spiritual_consultant">
              Spiritual Consultants
            </option>
            <option value="user">Users</option>
          </select>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <UserRound size={28} />
            <p>No users match the current filter.</p>
          </div>
        ) : (
          <div className="admin-table">
            <div className="admin-table-head">
              <span>ID</span>
              <span>Email</span>
              <span>Role</span>
              <span>Status</span>
              <span>Created</span>
            </div>

            {filteredUsers.map((user) => (
              <div
                className="admin-table-row"
                key={user.id}
              >
                <span>#{user.id}</span>

                <strong>{user.email}</strong>

                <span>
                  {(user.role || "user").replaceAll("_", " ")}
                </span>

                <span
                  className={
                    user.is_active
                      ? "status-available"
                      : "status-pending"
                  }
                >
                  <span className="status-dot" />
                  {user.is_active ? "Active" : "Inactive"}
                </span>

                <span>
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
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
