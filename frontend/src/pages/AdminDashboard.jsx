import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Database,
  FileText,
  Fingerprint,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../api/client";
import AdminNotifications from "../components/notifications/AdminNotifications";

export default function AdminDashboard() {
  const { user } = useAuth();

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    loadOverview();
  }, []);


  async function loadOverview() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest(
        "/api/v1/admin/overview"
      );

      setOverview(data);
    } catch (err) {
      setError(
        err.message || "Unable to load administrator data."
      );
    } finally {
      setLoading(false);
    }
  }


  const users = overview?.users || {};
  const roles = overview?.roles || {};
  const readings = overview?.readings || {};
  const reports = overview?.reports || {};


  return (
    <div className="page-container">

      <section className="dashboard-hero role-dashboard-hero">

        <div>

          <div className="eyebrow">
            <ShieldCheck size={15} />
            ADMINISTRATOR WORKSPACE
          </div>

          <h1>
            Platform overview
            <span className="muted-dot">.</span>
          </h1>

          <p>
            Monitor users, readings, reports and platform
            services from one administrative workspace.
          </p>

        </div>

        <div className="role-pill">
          <ShieldCheck size={15} />
          Administrator
        </div>

      </section>


      {error && (
        <div className="panel">
          <strong>Administrator data unavailable</strong>
          <p>{error}</p>
        </div>
      )}


      <section className="role-stat-grid admin-stat-grid">

        <AdminStat
          icon={Users}
          label="Total users"
          value={loading ? "0" : users.total || 0}
          note={`${users.active || 0} active accounts`}
        />

        <AdminStat
          icon={BookOpen}
          label="Tarot readers"
          value={loading ? "0" : roles.tarot_readers || 0}
          note="Registered reader accounts"
        />

        <AdminStat
          icon={UserRound}
          label="Consultants"
          value={loading ? "0" : roles.spiritual_consultants || 0}
          note="Registered consultant accounts"
        />

        <AdminStat
          icon={Activity}
          label="Total readings"
          value={loading ? "0" : readings.total || 0}
          note={`${readings.tarot || 0} Tarot • ${readings.palmistry || 0} Palm`}
        />

      </section>


      <section className="role-stat-grid admin-stat-grid">

        <AdminStat
          icon={ShieldCheck}
          label="Administrators"
          value={loading ? "0" : roles.administrators || 0}
          note="Platform administrator accounts"
        />

        <AdminStat
          icon={BookOpen}
          label="Tarot readings"
          value={loading ? "0" : readings.tarot || 0}
          note="Saved Tarot reading sessions"
        />

        <AdminStat
          icon={Fingerprint}
          label="Palm analyses"
          value={loading ? "0" : readings.palmistry || 0}
          note="Saved palm analysis sessions"
        />

        <AdminStat
          icon={FileText}
          label="Reports generated"
          value={loading ? "0" : reports.total || 0}
          note="Stored reading reports"
        />

      </section>


      <section className="role-dashboard-grid admin-management-grid">

        <div className="panel">

          <div className="panel-heading">

            <div>
              <span className="section-kicker">
                PLATFORM MANAGEMENT
              </span>

              <h2>
                Administration
              </h2>
            </div>

          </div>


          <div className="dashboard-action-list">

            <AdminAction
              to="/admin/users"
              icon={Users}
              title="User Management"
              text="View platform users, roles and account status."
            />

            <AdminAction
              to="/admin/readings"
              icon={Activity}
              title="Reading Management"
              text="Review Tarot and palm reading activity."
            />

            <AdminAction
              to="/admin/tarot"
              icon={BookOpen}
              title="Tarot Management"
              text="Inspect the Tarot dataset and supported spreads."
            />

            <AdminAction
              to="/admin/palmistry"
              icon={Fingerprint}
              title="Palmistry Management"
              text="Review palm analysis activity and records."
            />

            <AdminAction
              to="/admin/reports"
              icon={FileText}
              title="Reports Management"
              text="Review generated reports across the platform."
            />

            <AdminAction
              to="/admin/system"
              icon={Database}
              title="System Overview"
              text="Monitor database and platform services."
            />

          </div>

        </div>


        <div className="panel">

          <div className="panel-heading">

            <div>
              <span className="section-kicker">
                SYSTEM
              </span>

              <h2>
                Platform services
              </h2>
            </div>

          </div>


          <div className="workspace-status-list">

            <SystemStatus
              icon={ShieldCheck}
              label="Authentication"
              status="Connected"
            />

            <SystemStatus
              icon={Database}
              label="PostgreSQL"
              status="Connected"
            />

            <SystemStatus
              icon={BookOpen}
              label="Tarot engine"
              status="Available"
            />

            <SystemStatus
              icon={Fingerprint}
              label="Palmistry"
              status="Available"
            />

            <SystemStatus
              icon={FileText}
              label="Reports"
              status="Available"
            />

          </div>

        </div>

      </section>


      <section className="panel admin-info-panel">

        <div className="admin-info-icon">
          <BarChart3 size={22} />
        </div>

        <div>

          <span className="section-kicker">
            PLATFORM ACTIVITY
          </span>

          <h2>
            Administrator control center
          </h2>

          <p>
            Use the navigation above or the management
            modules below to inspect users, readings,
            Tarot, palmistry, reports and system services.
          </p>

        </div>

      </section>


      <section className="panel dashboard-account-strip">

        <div>

          <span className="section-kicker">
            ADMIN ACCOUNT
          </span>

          <strong>
            {user?.email}
          </strong>

        </div>


        <div className="role-dashboard-security">

          <span>
            Access level
          </span>

          <strong>
            Administrator
          </strong>

        </div>

      </section>

    </div>
  );
}


function AdminStat({
  icon: Icon,
  label,
  value,
  note,
}) {
  return (
    <div className="role-stat-card">

      <div className="role-stat-top">

        <div className="role-stat-icon">
          <Icon size={19} />
        </div>

        <span>
          {label}
        </span>

      </div>

      <strong>
        {value}
      </strong>

      <p>
        {note}
      </p>

    </div>
  );
}


function AdminAction({
  to,
  icon: Icon,
  title,
  text,
}) {
  return (
    <Link
      to={to}
      className="dashboard-action"
    >

      <div className="dashboard-action-icon">
        <Icon size={20} />
      </div>

      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>

      <ArrowRight size={17} />

    </Link>
  );
}


function SystemStatus({
  icon: Icon,
  label,
  status,
}) {
  return (
    <div className="workspace-status-item">

      <div className="system-status-label">

        <Icon size={16} />

        <span>
          {label}
        </span>

      </div>

      <span className="status-available">

        <span className="status-dot" />

        {status}

      </span>
    <AdminNotifications />
    </div>
  );
}