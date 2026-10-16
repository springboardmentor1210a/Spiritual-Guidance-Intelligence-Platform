import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import { apiRequest } from "../api/client";

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm Arcana AI. I can help you explore your readings, insights, recommendations, and personal growth.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage() {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    const userMessage = {
      role: "user",
      content: trimmedMessage,
    };

    const conversation = messages
  .slice(-6)
  .map((item) => ({
    role: item.role,
    content: item.content,
  }));
    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setMessage("");
    setLoading(true);

    try {
      const data = await apiRequest(
        "/api/v1/ai-chat",
        {
          method: "POST",
          body: JSON.stringify({
            message: trimmedMessage,
            conversation,
          }),
        }
      );

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error.message ||
            "I couldn't connect to Arcana AI right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {!open && (
  <button
    type="button"
    className="ai-chat-launcher"
    onClick={() => setOpen(true)}
    aria-label="Open Arcana AI"
    title="Arcana AI"
  >
    <span className="ai-orbit ai-orbit-one" />
    <span className="ai-orbit ai-orbit-two" />

    <span className="ai-chat-launcher-icon">
      <Sparkles size={20} />
    </span>

    <span className="ai-chat-launcher-label">
      <strong>Arcana AI</strong>
      <small>Ask me anything</small>
    </span>
  </button>
)}
      {open && (
        <section className="ai-chat-panel">
          <header className="ai-chat-header">
            <div className="ai-chat-title">
              <div className="ai-chat-icon">
                <Sparkles size={17} />
              </div>

              <div>
                <strong>Arcana AI</strong>
                <span>Intelligence Assistant</span>
              </div>
            </div>

            <button
              type="button"
              className="ai-chat-close"
              onClick={() => setOpen(false)}
              aria-label="Close Arcana AI"
            >
              <X size={18} />
            </button>
          </header>

          <div className="ai-chat-messages">
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`ai-chat-message ${
                  item.role === "user"
                    ? "user-message"
                    : "assistant-message"
                }`}
              >
                {item.role === "assistant" && (
                  <div className="ai-message-icon">
                    <Bot size={14} />
                  </div>
                )}

                <div className="ai-message-bubble">
                  {item.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="ai-chat-message assistant-message">
                <div className="ai-message-icon">
                  <Bot size={14} />
                </div>

                <div className="ai-message-bubble ai-thinking">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="ai-chat-input-area">
            <textarea
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask Arcana AI..."
              rows={1}
              disabled={loading}
            />

            <button
              type="button"
              className="ai-send-button"
              onClick={sendMessage}
              disabled={
                loading || !message.trim()
              }
              aria-label="Send message"
            >
              <Send size={17} />
            </button>
          </div>
        </section>
      )}
    </>
  );
}