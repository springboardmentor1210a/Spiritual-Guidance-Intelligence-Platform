import {
  Bell,
  BookOpen,
  Sparkles,
  FileText,
  History,
  UserRound,
} from "lucide-react";

export default function TarotReaderNotifications() {
  const notifications = [
    {
      id: 1,
      icon: BookOpen,
      title: "Reading activity",
      message:
        "A tarot reading has been completed and added to the reading history.",
      time: "Just now",
    },
    {
      id: 2,
      icon: Sparkles,
      title: "Tarot interpretation ready",
      message:
        "The selected tarot spread has generated a new interpretation.",
      time: "Today",
    },
    {
      id: 3,
      icon: History,
      title: "Reading history updated",
      message:
        "Your latest tarot session is now available in Reading History.",
      time: "Today",
    },
    {
      id: 4,
      icon: FileText,
      title: "Report available",
      message:
        "A tarot reading report is ready to view or download.",
      time: "Recently",
    },
    {
      id: 5,
      icon: UserRound,
      title: "Reader profile",
      message:
        "Your tarot reader workspace and profile information are available.",
      time: "Recently",
    },
  ];

  return (
    <section className="notification-panel">
      <div className="notification-panel-header">
        <div>
          <span className="section-kicker">
            READER NOTIFICATIONS
          </span>

          <h2>
            Tarot workspace updates
          </h2>

          <p>
            Stay informed about readings,
            interpretations and reader activity.
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