
import { useEffect, useState } from "react";
import {
  getMyNotifications,
  markNotificationRead,
} from "../api/appointments";
import "./../App.css";

function normalizeList(result) {
  return Array.isArray(result)
    ? result
    : result?.items || result?.data || [];
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString();
}

export default function AppointmentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function loadNotifications() {
    setLoading(true);
    setError("");

    try {
      setNotifications(
        normalizeList(await getMyNotifications())
      );
    } catch (err) {
      setError(err.message || "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function handleMarkRead(notification) {
    if (notification.read_at) return;

    setBusyId(notification.id);
    setError("");

    try {
      await markNotificationRead(notification.id);
      await loadNotifications();
    } catch (err) {
      setError(
        err.message || "Could not mark notification as read."
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="appointment-notifications-page">
      <div className="appointment-notifications-header">
        <p className="appointment-notifications-eyebrow">
          YOUR APPOINTMENTS
        </p>

        <h1>Notifications</h1>

        <p className="appointment-notifications-subtitle">
          Stay updated with your appointments and reading sessions.
        </p>

        <button
          type="button"
          className="appointment-notifications-refresh"
          onClick={loadNotifications}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Notifications"}
        </button>
      </div>

      {error && (
        <p
          className="appointment-notifications-error"
          role="alert"
        >
          {error}
        </p>
      )}

      {loading && (
        <div className="appointment-notifications-empty">
          Loading your notifications...
        </div>
      )}

      {!loading && notifications.length === 0 && !error && (
        <div className="appointment-notifications-empty">
          <span className="appointment-notifications-empty-icon">
            ✧
          </span>
          <h2>You're all caught up</h2>
          <p>You have no notifications right now.</p>
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <div className="appointment-notifications-list">
          <div className="appointment-notifications-list-heading">
            <h2>Your updates</h2>
            <span>
              {notifications.length}{" "}
              {notifications.length === 1
                ? "notification"
                : "notifications"}
            </span>
          </div>

          {notifications.map((notification) => (
            <section
              key={notification.id}
              className={`appointment-notification-card ${
                notification.read_at ? "is-read" : "is-unread"
              }`}
            >
              <div className="appointment-notification-indicator">
                {notification.read_at ? "✓" : "✧"}
              </div>

              <div className="appointment-notification-content">
                <div className="appointment-notification-topline">
                  <h3>
                    {notification.title || "Appointment Update"}
                  </h3>

                  <span
                    className={`appointment-notification-status ${
                      notification.read_at
                        ? "status-read"
                        : "status-unread"
                    }`}
                  >
                    {notification.read_at ? "Read" : "Unread"}
                  </span>
                </div>

                <p className="appointment-notification-message">
                  {notification.message}
                </p>

                <time className="appointment-notification-time">
                  {formatDate(notification.created_at)}
                </time>

                {!notification.read_at && (
                  <button
                    type="button"
                    className="appointment-notification-read-button"
                    onClick={() => handleMarkRead(notification)}
                    disabled={busyId === notification.id}
                  >
                    {busyId === notification.id
                      ? "Updating..."
                      : "Mark as Read"}
                  </button>
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
