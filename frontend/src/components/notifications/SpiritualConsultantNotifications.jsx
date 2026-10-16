import {
  Bell,
  CalendarDays,
  Users,
  Sparkles,
  BookOpen,
  FileText,
} from "lucide-react";

export default function SpiritualConsultantNotifications() {
  const notifications = [
    {
      id: 1,
      icon: CalendarDays,
      title: "Schedule update",
      message:
        "Your consultation schedule is ready to review.",
      time: "Just now",
    },
    {
      id: 2,
      icon: Users,
      title: "Client records",
      message:
        "Your client workspace is available for consultation management.",
      time: "Today",
    },
    {
      id: 3,
      icon: Sparkles,
      title: "Palm analysis available",
      message:
        "Palm analysis information is available for the current consultation workflow.",
      time: "Today",
    },
    {
      id: 4,
      icon: BookOpen,
      title: "Tarot activity",
      message:
        "A tarot reading workflow is available for your consultation workspace.",
      time: "Recently",
    },
    {
      id: 5,
      icon: FileText,
      title: "Report update",
      message:
        "Consultation and reading reports are available to review.",
      time: "Recently",
    },
  ];

  return (
    <section className="notification-panel">
      <div className="notification-panel-header">
        <div>
          <span className="section-kicker">
            CONSULTANT NOTIFICATIONS
          </span>

          <h2>
            Consultation workspace updates
          </h2>

          <p>
            Stay informed about consultations,
            client activity and analysis workflows.
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