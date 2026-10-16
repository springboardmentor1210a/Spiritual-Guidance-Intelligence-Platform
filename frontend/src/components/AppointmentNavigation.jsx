
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppointmentNavigation() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const role = user.role;

  const getLinkClass = (path) =>
    `appointment-nav-link${
      location.pathname === path ? " active" : ""
    }`;

  return (
    <nav
      className="appointment-navigation"
      aria-label="Appointment navigation"
    >
      {role === "user" && (
        <>
          <Link
            to="/appointments/book"
            className={`appointment-nav-link appointment-nav-left ${getLinkClass(
              "/appointments/book"
            ).includes("active") ? "active" : ""}`}
          >
            Book Appointment
          </Link>

          <Link
            to="/appointments/mine"
            className={`appointment-nav-link appointment-nav-center ${
              location.pathname === "/appointments/mine" ? "active" : ""
            }`}
          >
            My Appointments
          </Link>
        </>
      )}

      {(role === "tarot_reader" ||
        role === "spiritual_consultant") && (
        <Link
          to="/appointment-schedule"
          className={`appointment-nav-link appointment-nav-left ${
            location.pathname === "/appointment-schedule" ? "active" : ""
          }`}
        >
          Manage Schedule
        </Link>
      )}

      {(role === "user" ||
        role === "tarot_reader" ||
        role === "spiritual_consultant") && (
        <Link
          to="/notifications"
          className={`appointment-nav-link appointment-nav-right ${
            location.pathname === "/notifications" ? "active" : ""
          }`}
        >
          Notifications
          <span
            className="appointment-notification-dot"
            aria-label="New notifications"
            title="New notifications"
          />
        </Link>
      )}
    </nav>
  );
}
