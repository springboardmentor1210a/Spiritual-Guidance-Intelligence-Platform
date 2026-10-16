
import { useState } from "react";

const initialNotifications = [
  {
    id: 1,
    title: "Appointment Reminder",
    message: "Check your upcoming spiritual consultation appointments.",
    time: "Recently",
    unread: true,
  },
  {
    id: 2,
    title: "Booking Updates",
    message: "Stay updated on your appointment booking status.",
    time: "Recently",
    unread: true,
  },
  {
    id: 3,
    title: "New Availability",
    message: "Check the available appointment slots.",
    time: "Earlier",
    unread: true,
  },
  {
    id: 4,
    title: "Profile Updates",
    message: "Keep your profile information up to date.",
    time: "Earlier",
    unread: false,
  },
  {
    id: 5,
    title: "Welcome",
    message: "Your latest updates will appear here.",
    time: "Earlier",
    unread: false,
  },
];

export default function UserNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(
    initialNotifications
  );

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  const markAsRead = (id) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  return (
    <div className="notification-panel">
      <button
        type="button"
        className="notification-toggle"
        aria-label="Open notifications"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((previous) => !previous)}
      >
        <span aria-hidden="true">🔔</span>

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          className="notification-popup"
          aria-label="Notifications"
        >
          <div className="notification-panel-header">
            <div>
              <h3>Notifications</h3>
              <p>Your latest updates</p>
            </div>

            <button
              type="button"
              className="notification-close"
              aria-label="Close notifications"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="notification-list">
            {notifications.map((notification) => (
              <button
                type="button"
                key={notification.id}
                className="notification-item"
                onClick={() => markAsRead(notification.id)}
              >
                <span
                  className="notification-item-icon"
                  aria-hidden="true"
                >
                  {notification.unread ? "●" : "○"}
                </span>

                <span className="notification-content">
                  <strong>{notification.title}</strong>
                  <span>{notification.message}</span>
                  <small className="notification-time">
                    {notification.time}
                  </small>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
