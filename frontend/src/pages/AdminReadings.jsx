import {
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";


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

      setUsers(data.users || []);

    } finally {

      setLoading(false);

    }

  }


  const filteredUsers = useMemo(() => {

    return users.filter((user) => {

      const matchesSearch =
        user.email
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      return matchesSearch && matchesRole;

    });

  }, [users, search, roleFilter]);


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


      <section className="panel">

        <div className="panel-heading">

          <div>
            <span className="section-kicker">
              PLATFORM USERS
            </span>

            <h2>
              {users.length} registered users
            </h2>
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

            <option value="all">
              All roles
            </option>

            <option value="administrator">
              Administrators
            </option>

            <option value="tarot_reader">
              Tarot Readers
            </option>

            <option value="spiritual_consultant">
              Spiritual Consultants
            </option>

            <option value="user">
              Users
            </option>

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

                <span>
                  #{user.id}
                </span>

                <strong>
                  {user.email}
                </strong>

                <span>
                  {user.role.replaceAll("_", " ")}
                </span>

                <span
                  className={
                    user.is_active
                      ? "status-available"
                      : "status-pending"
                  }
                >
                  <span className="status-dot" />
                  {user.is_active
                    ? "Active"
                    : "Inactive"}
                </span>

                <span>
                  {new Date(
                    user.created_at
                  ).toLocaleDateString()}
                </span>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}