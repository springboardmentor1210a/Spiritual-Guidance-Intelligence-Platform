import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Fingerprint,
  History,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SpiritualConsultantNotifications from "../components/notifications/SpiritualConsultantNotifications";
import AppointmentNavigation from "../components/AppointmentNavigation";
function readHistory() {

  try {

    return JSON.parse(
      localStorage.getItem("reading_history") || "[]"
    );

  } catch {

    return [];

  }

}


function isToday(dateValue) {

  if (!dateValue) {
    return false;
  }


  const date = new Date(dateValue);
  const today = new Date();


  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );

}


export default function SpiritualConsultantDashboard() {

  const { user } = useAuth();

  const history = readHistory();


  /*
   * =====================================================
   * EXISTING READING DATA
   * =====================================================
   */

  const palmReadings = history.filter(
    (item) =>
      item?.type === "palm" ||
      item?.reading_type
        ?.toLowerCase?.()
        .includes("palm")
  );


  const todayHistory = history.filter(
    (item) =>
      isToday(
        item?.createdAt ||
        item?.created_at
      )
  );


  /*
   * =====================================================
   * CONSULTANT WORKSPACE VALUES
   * =====================================================
   *
   * Reading values use existing local history.
   *
   * Client, availability and scheduling values are
   * workspace demonstration values until dedicated
   * backend services are connected.
   */

  const todaysConsultations =
    Math.max(
      todayHistory.length,
      6
    );


  const activeConsultations = 4;


  const palmAssessments =
    Math.max(
      palmReadings.length,
      12
    );


  const completedConsultations =
    Math.max(
      history.length,
      18
    );


  const availableHours = 6;


  const clientRecords = 14;


  const consultationCompletionRate = 86;


  const pendingReports = 3;


  const upcomingConsultations = 4;


  const followUpsToday = 3;


  const recentConsultations =
    palmReadings.length > 0
      ? palmReadings.slice(0, 5)
      : [];


  return (

    <div className="page-container">
      <AppointmentNavigation />


      {/* =================================================
          HERO
          ================================================= */}

      <section className="dashboard-hero role-dashboard-hero">

        <div>

          <div className="eyebrow">

            <Sparkles size={15} />

            SPIRITUAL CONSULTANT WORKSPACE

          </div>


          <h1>

            Welcome, Spiritual Consultant

            <span className="muted-dot">
              .
            </span>

          </h1>


          <p>

            Manage consultations, palm assessments,
            client records and professional reports
            from one workspace.

          </p>

        </div>


        <div className="role-pill">

          <Sparkles size={15} />

          Spiritual Consultant

        </div>

      </section>


      {/* =================================================
          MAIN STATISTICS
          ================================================= */}

      <section className="role-stat-grid">


        <DashboardStat
          icon={CalendarDays}
          label="Today's consultations"
          value={todaysConsultations}
          note="Consultation sessions planned today"
        />


        <DashboardStat
          icon={Users}
          label="Active consultations"
          value={activeConsultations}
          note="Consultations currently in progress"
        />


        <DashboardStat
          icon={Fingerprint}
          label="Palm assessments"
          value={palmAssessments}
          note="Palm assessments handled"
        />


        <DashboardStat
          icon={CheckCircle2}
          label="Completed consultations"
          value={completedConsultations}
          note="Completed consultation records"
        />

      </section>


      {/* =================================================
          CONSULTATION OVERVIEW
          ================================================= */}

      <section
        className="role-dashboard-grid"
        id="consultation-overview"
      >


        {/* =================================================
            TODAY'S WORKLOAD
            ================================================= */}

        <div className="panel">

          <div className="panel-heading">

            <div>

              <span className="section-kicker">
                CONSULTATION OVERVIEW
              </span>

              <h2>
                Today's workload
              </h2>

            </div>

          </div>


          <div className="workspace-status-list">


            <StatusItem
              label="Today's consultations"
              value={todaysConsultations}
              available
            />


            <StatusItem
              label="Active consultations"
              value={activeConsultations}
              available
            />


            <StatusItem
              label="Upcoming consultations"
              value={upcomingConsultations}
              available
            />


            <StatusItem
              label="Follow ups today"
              value={followUpsToday}
              available
            />


            <StatusItem
              label="Available hours"
              value={availableHours}
              available
            />

          </div>

        </div>


        {/* =================================================
            CONSULTATION PERFORMANCE
            ================================================= */}

        <div className="panel">

          <div className="panel-heading">

            <div>

              <span className="section-kicker">
                PERFORMANCE
              </span>

              <h2>
                Consultation performance
              </h2>

            </div>

          </div>


          <div className="workspace-status-list">


            <StatusItem
              label="Completion rate"
              value={`${consultationCompletionRate}%`}
              available
            />


            <StatusItem
              label="Completed consultations"
              value={completedConsultations}
              available
            />


            <StatusItem
              label="Pending reports"
              value={pendingReports}
            />


            <StatusItem
              label="Client records"
              value={clientRecords}
              available
            />

          </div>

        </div>

      </section>


      {/* =================================================
          CONSULTATION SCHEDULE
          ================================================= */}

      <section className="panel role-dashboard-panel">

        <div className="panel-heading">

          <div>

            <span className="section-kicker">
              TODAY
            </span>

            <h2>
              Consultation schedule
            </h2>

          </div>


          <span className="dashboard-date">

            {new Date().toLocaleDateString(
              undefined,
              {
                weekday: "long",
                month: "short",
                day: "numeric",
              }
            )}

          </span>

        </div>


        <div className="role-empty-state">

          <div className="role-empty-icon">

            <CalendarDays size={25} />

          </div>


          <div>

            <strong>

              {todaysConsultations} consultation sessions

            </strong>


            <p>

              {upcomingConsultations} upcoming consultations,
              {followUpsToday} follow ups and
              {availableHours} available hours are planned
              for the consultant workspace.

            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          CONSULTATION TOOLS
          ================================================= */}

      <section className="role-dashboard-grid">


        {/* =================================================
            QUICK ACCESS
            ================================================= */}

        <div className="panel">

          <div className="panel-heading">

            <div>

              <span className="section-kicker">
                QUICK ACCESS
              </span>

              <h2>
                Consultant workspace
              </h2>

            </div>

          </div>


          <div className="dashboard-action-list">


            <Link
              to="/palm-analysis"
              className="dashboard-action"
            >

              <div className="dashboard-action-icon">

                <Fingerprint size={20} />

              </div>


              <div>

                <strong>
                  Palm Analysis
                </strong>

                <span>
                  Perform structured palm assessments for consultations.
                </span>

              </div>


              <ArrowRight size={17} />

            </Link>


            <Link
              to="/history"
              className="dashboard-action"
            >

              <div className="dashboard-action-icon">

                <History size={20} />

              </div>


              <div>

                <strong>
                  Consultation History
                </strong>

                <span>
                  Review previous consultation and assessment records.
                </span>

              </div>


              <ArrowRight size={17} />

            </Link>


            <Link
              to="/reports"
              className="dashboard-action"
            >

              <div className="dashboard-action-icon">

                <FileText size={20} />

              </div>


              <div>

                <strong>
                  Consultation Reports
                </strong>

                <span>
                  Review generated consultation reports and records.
                </span>

              </div>


              <ArrowRight size={17} />

            </Link>


            <Link
              to="/profile"
              className="dashboard-action"
            >

              <div className="dashboard-action-icon">

                <UserRound size={20} />

              </div>


              <div>

                <strong>
                  Consultant Profile
                </strong>

                <span>
                  Manage your consultant account information.
                </span>

              </div>


              <ArrowRight size={17} />

            </Link>

          </div>

        </div>


        {/* =================================================
            WORKSPACE SUMMARY
            ================================================= */}

        <div className="panel">

          <div className="panel-heading">

            <div>

              <span className="section-kicker">
                WORKSPACE SUMMARY
              </span>

              <h2>
                Consultant metrics
              </h2>

            </div>

          </div>


          <div className="workspace-status-list">


            <StatusItem
              label="Palm assessments"
              value={palmAssessments}
              available
            />


            <StatusItem
              label="Active consultations"
              value={activeConsultations}
              available
            />


            <StatusItem
              label="Completed consultations"
              value={completedConsultations}
              available
            />


            <StatusItem
              label="Client records"
              value={clientRecords}
              available
            />


            <StatusItem
              label="Pending reports"
              value={pendingReports}
            />

          </div>

        </div>

      </section>


      {/* =================================================
          RECENT CONSULTATIONS
          ================================================= */}

      <section className="panel">

        <div className="panel-heading">

          <div>

            <span className="section-kicker">
              CONSULTATION ACTIVITY
            </span>

            <h2>
              Recent consultations
            </h2>

          </div>


          <Link to="/history">
            View all
          </Link>

        </div>


        {recentConsultations.length === 0 ? (

          <div className="role-empty-state">

            <div className="role-empty-icon">

              <History size={25} />

            </div>


            <div>

              <strong>
                5 recent consultation slots
              </strong>

              <p>

                Recent consultation records will appear here
                as palm assessments are completed.

              </p>

            </div>

          </div>

        ) : (

          <div className="workspace-status-list">

            {recentConsultations.map(
              (item, index) => {

                const createdDate =
                  item?.createdAt ||
                  item?.created_at;


                return (

                  <div
                    className="workspace-status-item"
                    key={
                      item.id ||
                      createdDate ||
                      index
                    }
                  >

                    <span>

                      {item.title ||
                        item.reading_type ||
                        "Palm Consultation"}

                    </span>


                    <span className="status-available">

                      <span className="status-dot" />

                      {createdDate
                        ? new Date(
                            createdDate
                          ).toLocaleDateString()
                        : "Recorded"}

                    </span>

                  </div>

                );

              }
            )}

          </div>

        )}

      </section>


      {/* =================================================
          CLIENT RECORDS
          ================================================= */}

      <section className="role-dashboard-grid">


        <div className="panel">

          <div className="panel-heading">

            <div>

              <span className="section-kicker">
                CLIENT RECORDS
              </span>

              <h2>
                Client overview
              </h2>

            </div>

          </div>


          <div className="profile-stat">

            <Users size={18} />

            <div>

              <span>
                Registered client records
              </span>

              <strong>
                {clientRecords}
              </strong>

            </div>

          </div>


          <div className="profile-stat">

            <CalendarDays size={18} />

            <div>

              <span>
                Active consultations
              </span>

              <strong>
                {activeConsultations}
              </strong>

            </div>

          </div>


          <div className="profile-stat">

            <History size={18} />

            <div>

              <span>
                Completed consultations
              </span>

              <strong>
                {completedConsultations}
              </strong>

            </div>

          </div>


          <Link
            className="button secondary full"
            to="/history"
          >

            View consultation history

            <ArrowRight size={16} />

          </Link>

        </div>


        {/* =================================================
            REPORTING
            ================================================= */}

        <div className="panel">

          <div className="panel-heading">

            <div>

              <span className="section-kicker">
                REPORTING
              </span>

              <h2>
                Consultation reports
              </h2>

            </div>

          </div>


          <div className="profile-stat">

            <FileText size={18} />

            <div>

              <span>
                Completed consultation records
              </span>

              <strong>
                {completedConsultations}
              </strong>

            </div>

          </div>


          <div className="profile-stat">

            <Clock3 size={18} />

            <div>

              <span>
                Pending reports
              </span>

              <strong>
                {pendingReports}
              </strong>

            </div>

          </div>


          <div className="profile-stat">

            <CheckCircle2 size={18} />

            <div>

              <span>
                Completion rate
              </span>

              <strong>
                {consultationCompletionRate}%
              </strong>

            </div>

          </div>


          <Link
            className="button secondary full"
            to="/reports"
          >

            Open reports

            <ArrowRight size={16} />

          </Link>

        </div>

      </section>


      {/* =================================================
          CONSULTANT PROFILE
          ================================================= */}

      <section className="panel">

        <div className="panel-heading">

          <div>

            <span className="section-kicker">
              CONSULTANT PROFILE
            </span>

            <h2>
              Workspace account
            </h2>

          </div>

        </div>


        <div className="role-dashboard-grid">


          <div className="profile-stat">

            <UserRound size={18} />

            <div>

              <span>
                Signed in as
              </span>

              <strong>
                {user?.email || "Spiritual Consultant"}
              </strong>

            </div>

          </div>


          <div className="profile-stat">

            <CheckCircle2 size={18} />

            <div>

              <span>
                Workspace status
              </span>

              <strong>
                Active
              </strong>

            </div>

          </div>

        </div>


        <Link
          className="button secondary"
          to="/profile"
        >

          Manage consultant profile

          <ArrowRight size={16} />

        </Link>

      </section>


      {/* =================================================
          ACCOUNT STRIP
          ================================================= */}

      <section className="panel dashboard-account-strip">

        <div>

          <span className="section-kicker">
            SIGNED IN AS
          </span>

          <strong>
            {user?.email}
          </strong>

        </div>


        <div className="role-dashboard-security">

          <span>
            Role
          </span>

          <strong>
            Spiritual Consultant
          </strong>

        </div>

      </section>


      <p className="disclaimer">

        Consultant workspace focuses on consultations,
        palm analysis, client records, history and professional reporting.

      </p>

    </div>

  );
}


/* =========================================================
   DASHBOARD STAT
   ========================================================= */

function DashboardStat({
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


/* =========================================================
   WORKSPACE STATUS
   ========================================================= */

function StatusItem({
  label,
  value,
  available = false,
}) {

  return (

    <div className="workspace-status-item">

      <span>
        {label}
      </span>


      <span
        className={
          available
            ? "status-available"
            : "status-pending"
        }
      >

        <span className="status-dot" />

        {value}

      </span>
      <SpiritualConsultantNotifications />
    </div>
  
  );

}