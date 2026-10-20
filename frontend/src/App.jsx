import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import TarotReaderDashboard from "./pages/TarotReaderDashboard";
import ConsultantDashboard from "./pages/ConsultantDashboard";
import Consultations from "./pages/Consultations";
import Notifications from "./pages/Notifications";
import Feedback from "./pages/Feedback";
import ComplaintsAdmin from "./pages/ComplaintsAdmin";
import { PalmReading, TarotReading, LifeTrends, Insights, Guidance, Recommendations, ReadingHistory } from "./pages/FeaturePages";
import Milestone3 from "./pages/Milestone3";
import { useAuth } from "./context/AuthContext";

function LoadingScreen() { return <div className="loading-screen">Preparing your space...</div>; }
function roleOf(user) { return String(user?.role || "").toLowerCase(); }

function LandingRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  const role = roleOf(user);
  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "tarot_reader") return <Navigate to="/tarot-reader" replace />;
  if (role === "consultant") return <Navigate to="/consultant" replace />;
  return <Navigate to="/dashboard" replace />;
}
function AuthRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
}
function RoleRoute({ children, allowed }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  const role = roleOf(user);
  if (allowed.includes(role)) return children;
  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "tarot_reader") return <Navigate to="/tarot-reader" replace />;
  if (role === "consultant") return <Navigate to="/consultant" replace />;
  return <Navigate to="/dashboard" replace />;
}
function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return children;
  const role = roleOf(user);
  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "tarot_reader") return <Navigate to="/tarot-reader" replace />;
  if (role === "consultant") return <Navigate to="/consultant" replace />;
  return <Navigate to="/dashboard" replace />;
}
export default function App() {
  const userPage = (Component) => <RoleRoute allowed={["user"]}><Component /></RoleRoute>;
  return <Layout><Routes>
    <Route path="/" element={<LandingRedirect />} />
    <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
    <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
    <Route path="/admin" element={<RoleRoute allowed={["admin"]}><AdminDashboard /></RoleRoute>} />
    <Route path="/admin/complaints" element={<RoleRoute allowed={["admin"]}><ComplaintsAdmin /></RoleRoute>} />
    <Route path="/tarot-reader" element={<RoleRoute allowed={["tarot_reader"]}><TarotReaderDashboard /></RoleRoute>} />
    <Route path="/consultant" element={<RoleRoute allowed={["consultant"]}><ConsultantDashboard /></RoleRoute>} />
    <Route path="/dashboard" element={userPage(Dashboard)} />
    <Route path="/profile" element={<AuthRoute><Profile /></AuthRoute>} />
    <Route path="/palm-reading" element={userPage(PalmReading)} />
    <Route path="/tarot-reading" element={<RoleRoute allowed={["user", "tarot_reader"]}><TarotReading /></RoleRoute>} />
    <Route path="/life-trends" element={userPage(LifeTrends)} />
    <Route path="/insights" element={userPage(Insights)} />
    <Route path="/guidance" element={userPage(Guidance)} />
    <Route path="/recommendations" element={userPage(Recommendations)} />
    <Route path="/history" element={userPage(ReadingHistory)} />
    <Route path="/intelligence" element={userPage(Milestone3)} />
    <Route path="/consultations" element={<AuthRoute><Consultations /></AuthRoute>} />
    <Route path="/notifications" element={<AuthRoute><Notifications /></AuthRoute>} />
    <Route path="/feedback" element={<AuthRoute><Feedback /></AuthRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Layout>;
}
