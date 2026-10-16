
import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";

import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";

import PalmAnalysis from "../pages/PalmAnalysis";
import TarotReading from "../pages/TarotReading";

import History from "../pages/History";
import Reports from "../pages/Reports";
import ReportView from "../pages/ReportView";

import AIInterpretation from "../pages/AIInterpretation";
import PersonalityIntelligence from "../pages/PersonalityIntelligence";
import Recommendations from "../pages/Recommendations";
import LifeTrends from "../pages/LifeTrends";
import Milestone3Dashboard from "../pages/Milestone3Dashboard";

import Settings from "../pages/Settings";

import Consultations from "../pages/Consultations";
import ClientRecords from "../pages/ClientRecords";
import ConsultantSchedule from "../pages/ConsultantSchedule";

import AdminUsers from "../pages/AdminUsers";
import AdminReadings from "../pages/AdminReadings";
import AdminTarot from "../pages/AdminTarot";
import AdminPalmistry from "../pages/AdminPalmistry";
import AdminReports from "../pages/AdminReports";
import AdminSystem from "../pages/AdminSystem";

import AdminAuditLogs from "../pages/AdminAuditLogs";
import AdminAnalytics from "../pages/AdminAnalytics";

import AppointmentBooking from "../pages/AppointmentBooking";
import MyAppointments from "../pages/MyAppointments";
import AppointmentNotifications from "../pages/AppointmentNotifications";
import AppointmentSchedule from "../pages/AppointmentSchedule";

import ConsultantEarnings from "../pages/ConsultantEarnings";
import ConsultantInsights from "../pages/ConsultantInsights";

import TarotReaderEarnings from "../pages/TarotReaderEarnings";
import TarotReaderInsights from "../pages/TarotReaderInsights";

import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC */}

      <Route
        path="/"
        element={<Landing />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* PROTECTED */}

      <Route element={<ProtectedRoute />}>

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/palm-analysis"
          element={<PalmAnalysis />}
        />

        <Route
          path="/tarot-reading"
          element={<TarotReading />}
        />

        <Route
          path="/history"
          element={<History />}
        />

        <Route
          path="/reports"
          element={<Reports />}
        />

        <Route
          path="/reports/:reportId"
          element={<ReportView />}
        />

        <Route
          path="/ai-interpretation"
          element={<AIInterpretation />}
        />

        <Route
          path="/personality-intelligence"
          element={<PersonalityIntelligence />}
        />

        <Route
          path="/recommendations"
          element={<Recommendations />}
        />

        <Route
          path="/life-trends"
          element={<LifeTrends />}
        />

        <Route
          path="/milestone3-dashboard"
          element={<Milestone3Dashboard />}
        />

        {/* SETTINGS */}

        <Route
          path="/settings"
          element={<Settings />}
        />

        {/* SPIRITUAL CONSULTANT */}

        <Route
          path="/consultations"
          element={<Consultations />}
        />

        <Route
          path="/client-records"
          element={<ClientRecords />}
        />

        <Route
          path="/consultant-schedule"
          element={<ConsultantSchedule />}
        />

        {/* ADMINISTRATOR */}

        <Route
          path="/admin/users"
          element={<AdminUsers />}
        />

        <Route
          path="/admin/readings"
          element={<AdminReadings />}
        />

        <Route
          path="/admin/tarot"
          element={<AdminTarot />}
        />

        <Route
          path="/admin/palmistry"
          element={<AdminPalmistry />}
        />

        <Route
          path="/admin/reports"
          element={<AdminReports />}
        />

        <Route
          path="/admin/system"
          element={<AdminSystem />}
        />

        {/* ADMIN AUDIT LOGS */}

        <Route
          path="/admin/audit-logs"
          element={
            <ProtectedRoute allowedRoles={["administrator"]} />
          }
        >
          <Route
            index
            element={<AdminAuditLogs />}
          />
        </Route>

        {/* ADMIN PLATFORM ANALYTICS */}

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={["administrator"]} />
          }
        >
          <Route
            index
            element={<AdminAnalytics />}
          />
        </Route>

        {/* CUSTOMER APPOINTMENTS */}

        <Route
          element={<ProtectedRoute allowedRoles={["user"]} />}
        >
          <Route
            path="/appointments/book"
            element={<AppointmentBooking />}
          />

          <Route
            path="/appointments/mine"
            element={<MyAppointments />}
          />
        </Route>

        {/* PROFESSIONAL SCHEDULE */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["tarot_reader", "spiritual_consultant"]}
            />
          }
        >
          <Route
            path="/appointment-schedule"
            element={<AppointmentSchedule />}
          />
        </Route>

        {/* APPOINTMENT NOTIFICATIONS */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "user",
                "tarot_reader",
                "spiritual_consultant",
              ]}
            />
          }
        >
          <Route
            path="/notifications"
            element={<AppointmentNotifications />}
          />
        </Route>

        {/* SPIRITUAL CONSULTANT — EARNINGS AND INSIGHTS */}

        <Route
          element={
            <ProtectedRoute allowedRoles={["spiritual_consultant"]} />
          }
        >
          <Route
            path="/consultant-earnings"
            element={<ConsultantEarnings />}
          />

          <Route
            path="/consultant-insights"
            element={<ConsultantInsights />}
          />
        </Route>

        {/* TAROT READER — EARNINGS AND INSIGHTS */}

        <Route
          element={
            <ProtectedRoute allowedRoles={["tarot_reader"]} />
          }
        >
          <Route
            path="/tarot-reader/earnings"
            element={<TarotReaderEarnings />}
          />

          <Route
            path="/tarot-reader/insights"
            element={<TarotReaderInsights />}
          />
        </Route>

      </Route>

      {/* NOT FOUND */}

      <Route
        path="/404"
        element={<NotFound />}
      />

      <Route
        path="*"
        element={<Navigate to="/404" replace />}
      />

    </Routes>
  );
}
