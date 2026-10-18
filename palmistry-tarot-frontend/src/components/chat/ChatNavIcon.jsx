import { MessageSquare } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";

export default function ChatNavIcon({ className = "" }) {
  const { user, role } = useAuth();
  const { totalUnreadCount, toggleChat } = useChat();

  const isAdmin = role === "Administrator" || role === "admin" || user?.role === "Administrator" || user?.role === "admin";
  if (isAdmin) return null;

  const displayCount = totalUnreadCount > 9 ? "9+" : totalUnreadCount;
  const hasBadge = totalUnreadCount > 0;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggleChat}
        className="relative p-2 text-inkMuted hover:text-ink transition-colors rounded-full hover:bg-void flex items-center justify-center chat-nav-button"
        aria-label="Consultation chat messages"
        title="Open consultation chats"
      >
        <div className="relative inline-flex items-center justify-center">
          <MessageSquare size={24} />
          {/* Dynamic red badge element positioned absolutely at top-right corner of chat icon */}
          {hasBadge && (
            <span
              id="chat-notification-badge"
              data-testid="chat-notification-badge"
              className="notification-badge absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 bg-[#ff0000] text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-surface shadow-sm leading-none z-10 pointer-events-none"
              style={{ backgroundColor: "#ff0000", color: "#ffffff", fontWeight: "bold" }}
            >
              {displayCount}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
