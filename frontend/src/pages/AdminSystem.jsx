import {
  Activity,
  BookOpen,
  Database,
  FileText,
  Fingerprint,
  Server,
  ShieldCheck,
} from "lucide-react";

import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";


export default function AdminSystem() {

  const [system, setSystem] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    loadSystem();

  }, []);


  async function loadSystem() {

    try {

      const data = await apiRequest(
        "/api/v1/admin/system"
      );

      setSystem(data);

    } finally {

      setLoading(false);

    }

  }


  const services = system?.services || {};
  const database = system?.database || {};
  const platform = system?.platform || {};


  return (
    <div className="page-container">

      <section className="dashboard-hero role-dashboard-hero">

        <div>

          <div className="eyebrow">
            <Server size={15} />
            ADMINISTRATION
          </div>

          <h1>
            System overview
            <span className="muted-dot">.</span>
          </h1>

          <p>
            Monitor platform services, database activity and system information.
          </p>

        </div>

        <div className="role-pill">
          <ShieldCheck size={15} />
          Administrator
        </div>

      </section>


      <section className="role-stat-grid">

        <SystemStat
          icon={Database}
          label="Users"
          value={25}
        />

        <SystemStat
          icon={Activity}
          label="Reading sessions"
          value={25}
        />

        <SystemStat
          icon={FileText}
          label="Reports"
          value={25}
        />

        <SystemStat
          icon={Server}
          label="Platform version"
          value={platform.version || "1.0.0"}
        />

      </section>


      <section className="panel">

        <div className="panel-heading">

          <div>

            <span className="section-kicker">
              PLATFORM SERVICES
            </span>

            <h2>
              Service status
            </h2>

          </div>

        </div>


        <div className="workspace-status-list">

          <SystemStatus
            icon={ShieldCheck}
            label="Authentication"
            status={services.authentication}
          />

          <SystemStatus
            icon={Database}
            label="PostgreSQL"
            status={services.database}
          />

          <SystemStatus
            icon={BookOpen}
            label="Tarot engine"
            status={services.tarot_engine}
          />

          <SystemStatus
            icon={Fingerprint}
            label="Palmistry"
            status={services.palmistry}
          />

          <SystemStatus
            icon={FileText}
            label="Reports"
            status={services.reports}
          />

        </div>

      </section>

    </div>
  );
}


function SystemStat({
  icon: Icon,
  label,
  value,
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
        Current platform information
      </p>

    </div>
  );
}


function SystemStatus({
  icon: Icon,
  label,
  status,
}) {
  const available =
    status === "Connected" ||
    status === "Available";

  return (
    <div className="workspace-status-item">

      <div className="system-status-label">

        <Icon size={16} />

        <span>
          {label}
        </span>

      </div>

      <span
        className={
          available
            ? "status-available"
            : "status-pending"
        }
      >

        <span className="status-dot" />

        {status || "Unavailable"}

      </span>

    </div>
  );
}