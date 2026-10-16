const ACTIVE_READING_KEY =
  "active_reading_session_id";

export function setActiveReadingSession(sessionId) {
  if (!sessionId) {
    return;
  }

  localStorage.setItem(
    ACTIVE_READING_KEY,
    String(sessionId)
  );

  window.dispatchEvent(
    new Event("active-reading-session-changed")
  );
}

export function getActiveReadingSession() {
  return localStorage.getItem(
    ACTIVE_READING_KEY
  );
}

export function clearActiveReadingSession() {
  localStorage.removeItem(
    ACTIVE_READING_KEY
  );

  window.dispatchEvent(
    new Event("active-reading-session-changed")
  );
}