import { useState, useEffect, useRef } from "react";
import { MessageSquare, Minus, X, Send, ChevronUp, UserCheck, ShieldCheck, ArrowLeft } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export default function ChatWidget() {
  const { user, role } = useAuth();
  const {
    activeChat,
    setActiveChat,
    isOpen,
    isMinimized,
    userChats,
    totalUnreadCount,
    closeChat,
    toggleMinimize,
    sendMessage,
    markMessagesAsRead,
  } = useChat();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const messagesEndRef = useRef(null);

  // 1. Subscribe to Real-Time Messages for Active Chat
  useEffect(() => {
    if (!isOpen || !activeChat?.id) {
      setMessages([]);
      return;
    }

    const messagesQuery = query(
      collection(db, "chats", activeChat.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMessages(list);

        // Mark unread messages as read
        if (!isMinimized) {
          markMessagesAsRead();
        }
      },
      (err) => {
        console.error("Error loading chat messages:", err);
      }
    );

    return () => unsubscribe();
  }, [isOpen, activeChat?.id, isMinimized]);

  // 2. Auto-scroll to Bottom on New Message
  useEffect(() => {
    if (!isMinimized && isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMinimized, isOpen]);

  // 3. Handle Send
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const textToSend = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      await sendMessage(textToSend);
    } catch (err) {
      console.error("Failed to send message:", err);
      setInputText(textToSend); // Restore on error
    } finally {
      setSending(false);
    }
  };

  const isAdmin = role === "Administrator" || role === "admin" || user?.role === "Administrator" || user?.role === "admin";
  if (isAdmin || !isOpen) return null;

  // Determine other party's details
  const isClient = user?.uid === activeChat?.userId;
  const otherPartyName = isClient
    ? (activeChat?.expertName || "Expert")
    : (activeChat?.userName || "Client");
  const otherPartyRole = isClient ? "Consultant / Reader" : "Client";

  // Minimized state view
  if (isMinimized) {
    return (
      <aside
        aria-label="Minimized consultation chat"
        onClick={toggleMinimize}
        className="fixed bottom-6 right-6 z-50 bg-surface border border-gold/40 hover:border-gold px-4 py-3 rounded-full shadow-2xl flex items-center gap-3 cursor-pointer transition-all transform hover:scale-105"
      >
        <div className="relative">
          <MessageSquare size={18} className="text-gold" />
          {totalUnreadCount > 0 && (
            <span
              className="notification-badge absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 bg-[#ff0000] text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-surface leading-none pointer-events-none"
              style={{ backgroundColor: "#ff0000" }}
            >
              {totalUnreadCount > 9 ? "9+" : totalUnreadCount}
            </span>
          )}
        </div>
        <span className="text-xs font-semibold text-ink truncate max-w-[150px]">
          {otherPartyName}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMinimize();
          }}
          className="text-inkMuted hover:text-ink transition-colors p-0.5"
          title="Expand Chat"
        >
          <ChevronUp size={16} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            closeChat();
          }}
          className="text-inkMuted hover:text-red-400 transition-colors p-0.5"
          title="Close Chat"
        >
          <X size={16} />
        </button>
      </aside>
    );
  }

  // Expanded Floating Window Docked at Bottom-Right
  return (
    <aside
      aria-label="Consultation chat window"
      className="fixed bottom-6 right-6 z-50 w-84 md:w-96 h-[490px] max-h-[85vh] bg-surface border border-line rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      {/* Widget Header with Window Controls */}
      <div className="p-3.5 border-b border-line bg-void/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          {showConversations ? (
            <button
              onClick={() => setShowConversations(false)}
              className="text-inkMuted hover:text-ink p-1 rounded transition-colors"
              title="Back to conversation"
            >
              <ArrowLeft size={16} />
            </button>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center shrink-0 border border-gold/30">
              <MessageSquare size={16} className="text-gold" />
            </div>
          )}

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-ink truncate">
              {showConversations ? "Consultation Chats" : otherPartyName}
            </h3>
            <p className="text-[10px] text-inkMuted flex items-center gap-1 truncate">
              {showConversations ? (
                `${userChats.length} active conversation${userChats.length === 1 ? "" : "s"}`
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  <span>{otherPartyRole}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Window Controls: Switch Chat, Minimize, Close */}
        <div className="flex items-center gap-1.5 shrink-0">
          {userChats.length > 1 && !showConversations && (
            <button
              onClick={() => setShowConversations(true)}
              className="text-[11px] text-gold hover:underline px-2 py-0.5 transition-colors"
              title="Switch conversation"
            >
              Chats ({userChats.length})
            </button>
          )}

          <button
            onClick={toggleMinimize}
            className="p-1.5 text-inkMuted hover:text-ink rounded hover:bg-void transition-colors"
            title="Minimize Chat"
            aria-label="Minimize"
          >
            <Minus size={16} />
          </button>

          <button
            onClick={closeChat}
            className="p-1.5 text-inkMuted hover:text-red-400 rounded hover:bg-void transition-colors"
            title="Close Chat"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Conversations Switcher View */}
      {showConversations ? (
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {userChats.length === 0 ? (
            <div className="text-center py-8 text-xs text-inkMuted">
              No active consultation chats.
            </div>
          ) : (
            userChats.map((c) => {
              const clientView = user?.uid === c.userId;
              const name = clientView ? (c.expertName || "Expert") : (c.userName || "Client");
              const isCurrent = c.id === activeChat?.id;

              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveChat(c);
                    setShowConversations(false);
                  }}
                  className={`w-full text-left p-3 rounded-card border transition-colors flex items-center justify-between ${
                    isCurrent
                      ? "bg-gold/10 border-gold/40 text-gold"
                      : "bg-void/40 border-line hover:border-gold/30 text-ink"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate">{name}</p>
                    <p className="text-[11px] text-inkMuted truncate mt-0.5">
                      {c.lastMessage || "No messages yet"}
                    </p>
                  </div>
                  <span className="text-[10px] text-inkMuted ml-2">
                    {c.updatedAt ? new Date(c.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </span>
                </button>
              );
            })
          )}
        </div>
      ) : (
        /* Real-Time Messaging Feed */
        <>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-void/20">
            {messages.length === 0 ? (
              <div className="text-center py-12 px-4 flex flex-col items-center justify-center gap-2 text-inkMuted">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-1">
                  <MessageSquare size={22} className="text-gold" />
                </div>
                <p className="text-xs font-medium text-ink">Private Session Channel</p>
                <p className="text-[11px] leading-relaxed max-w-[240px]">
                  Send a message below to coordinate your consultation session in real-time.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === user?.uid;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    {!isMe && (
                      <span className="text-[10px] text-gold font-medium mb-1 px-1">
                        {msg.senderName || otherPartyName}
                      </span>
                    )}

                    <div
                      className={`px-3.5 py-2 text-xs leading-relaxed max-w-[82%] break-words shadow-sm ${
                        isMe
                          ? "bg-gold text-void font-medium rounded-2xl rounded-tr-xs"
                          : "bg-surfaceHover border border-line text-ink rounded-2xl rounded-tl-xs"
                      }`}
                    >
                      {msg.text}
                    </div>

                    <span className="text-[9px] text-inkMuted mt-1 px-1">
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : ""}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box & Send Button */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-line bg-void/70 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-surface border border-line rounded-card px-3.5 py-2 text-xs text-ink placeholder:text-inkMuted focus:border-gold outline-none transition-colors"
              disabled={sending}
            />

            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="p-2 h-8 w-8 bg-gold hover:bg-goldHover text-void rounded-full flex items-center justify-center transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              title="Send message"
              aria-label="Send message"
            >
              <Send size={14} className={sending ? "animate-pulse" : ""} />
            </button>
          </form>
        </>
      )}
    </aside>
  );
}
