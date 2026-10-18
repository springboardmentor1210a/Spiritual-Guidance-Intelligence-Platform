import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./components/layout/PublicLayout";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/routing/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserGuidance from "./pages/UserGuidance";
import Dashboard from "./pages/Dashboard";
import PalmReading from "./pages/PalmReading";
import PalmResults from "./pages/PalmResults";
import TarotReading from "./pages/TarotReading";
import TarotResults from "./pages/TarotResults";
import Insights from "./pages/Insights";
import Recommendations from "./pages/Recommendations";
import History from "./pages/History";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

import ReaderDashboard from "./pages/ReaderDashboard";
import ReaderRequests from "./pages/ReaderRequests";
import ReaderAnalytics from "./pages/ReaderAnalytics";
import ReaderEngagement from "./pages/ReaderEngagement";
import ReaderSessions from "./pages/ReaderSessions";
import ReaderGuidance from "./pages/ReaderGuidance";

import ConsultantDashboard from "./pages/ConsultantDashboard";
import ConsultantTrends from "./pages/ConsultantTrends";
import ConsultantGuidance from "./pages/ConsultantGuidance";
import ConsultantInsights from "./pages/ConsultantInsights";
import ConsultantSessions from "./pages/ConsultantSessions";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminReadings from "./pages/AdminReadings";
import AdminSystem from "./pages/AdminSystem";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/palm-reading" element={<PalmReading />} />
            <Route path="/palm-results" element={<PalmResults />} />
            <Route path="/tarot-reading" element={<TarotReading />} />
            <Route path="/tarot-results" element={<TarotResults />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/history" element={<History />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/user-guidance" element={<UserGuidance />} />

            <Route path="/reader-dashboard" element={<ReaderDashboard />} />
            <Route path="/reader-requests" element={<ReaderRequests />} />
            <Route path="/reader-analytics" element={<ReaderAnalytics />} />
            <Route path="/reader-engagement" element={<ReaderEngagement />} />
            <Route path="/reader-sessions" element={<ReaderSessions />} />
            <Route path="/reader-guidance" element={<ReaderGuidance />} />

            <Route path="/consultant-dashboard" element={<ConsultantDashboard />} />
            <Route path="/consultant-trends" element={<ConsultantTrends />} />
            <Route path="/consultant-guidance" element={<ConsultantGuidance />} />
            <Route path="/consultant-insights" element={<ConsultantInsights />} />
            <Route path="/consultant-sessions" element={<ConsultantSessions />} />

            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-users" element={<AdminUsers />} />
            <Route path="/admin-readings" element={<AdminReadings />} />
            <Route path="/admin-analytics" element={<Reports />} />
            <Route path="/admin-system" element={<AdminSystem />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
} 