import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROUTE_ACCESS, DASHBOARD_PATH } from "../../config/roles";

export default function ProtectedRoute() {
  const { role, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-inkMuted">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = ROUTE_ACCESS[location.pathname];
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Logged in, but this route isn't theirs — send them home instead of 404ing
    return <Navigate to={DASHBOARD_PATH[role]} replace />;
  }

  return <Outlet />;
}