import {
  Bell,
  Users,
  ShieldCheck,
  FileText,
  Activity,
  Settings,
} from "lucide-react";

export default function AdminNotifications() {
  const notifications = [
    {
      id: 1,
      icon: Users,
      title: "User activity",
      message:
        "User accounts and role-based platform activity are available for review.",
      time: "Just now",
    },
    {
      id: 2,
      icon: ShieldCheck,
      title: "Security status",
      message:
        "Role-based access and authenticated platform areas are active.",
      time: "Today",
    },
    {
      id: 3,
      icon: FileText,
      title: "Reports available",
      message:
        "Platform reading and report information is available for administration.",
      time: "Today",
    },
    {
      id: 4,
      icon: Activity,
      title: "System activity",
      message:
        "Review current platform activity and application workflows.",
      time: "Recently",
    },
    {
      id: 5,
      icon: Settings,
      title: "Administration",
      message:
        "Administrator settings and system management options are available.",
      time: "Recently",
    },
  ];

  return (
    <section className="notification-panel">
      <div className="notification-panel-header">
        <div>
          <span className="section-kicker">
            ADMIN NOTIFICATIONS
          </span>

          <h2>
            System updates
          </h2>

          <p>
            Monitor users, security, reports and
            platform activity.
          </p>
        </div>

        <div className="notification-bell">
          <Bell size={20} />
          <span>{notifications.length}</span>
        </div>
      </div>

      <div className="notification-list">
        {notifications.map((notification) => {
          const Icon = notification.icon;

          return (
            <div
              className="notification-item"
              key={notification.id}
            >
              <div className="notification-icon">
                <Icon size={18} />
              </div>

              <div className="notification-content">
                <div className="notification-title-row">
                  <h3>
                    {notification.title}
                  </h3>

                  <span className="notification-time">
                    {notification.time}
                  </span>
                </div>

                <p>
                  {notification.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}