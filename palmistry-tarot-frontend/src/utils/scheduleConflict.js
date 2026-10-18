/**
 * Schedule & Conflict Detection Utilities
 * Handles timezone-accurate date extraction, interval overlap analysis,
 * and working hours / availability checking for Tarot Readers & Consultants.
 */

export function getLocalDateStr(dateInput) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getSessionTimestamp(item) {
  if (!item) return null;
  const val =
    item.scheduledTime ||
    item.scheduledFor ||
    (item.date && item.startTime ? `${item.date}T${item.startTime}` : null) ||
    item.date ||
    item.createdAt;
  if (!val) return null;
  const t = new Date(val).getTime();
  return isNaN(t) ? null : t;
}

export function formatSessionTime(dateInput) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function formatSessionDate(dateInput) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export function formatSessionDateTime(dateInput) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

/**
 * Checks if a requested session or block has a time overlap with any confirmed session or personal blocked slot.
 * Standard consultation duration assumed to be 45 minutes unless specified otherwise.
 *
 * @param {Object|string|number} targetItem Session object or timestamp to test
 * @param {Array} confirmedSessions List of accepted sessions
 * @param {Array} blockedSlots List of blocked availability slots
 * @param {number} durationMinutes Default duration in minutes (default 45)
 * @returns {Object} { hasConflict: boolean, type: string|null, conflictingWith: Object|null, message: string|null }
 */
export function checkScheduleConflict(targetItem, confirmedSessions = [], blockedSlots = [], durationMinutes = 45) {
  let targetStart = null;
  let targetDuration = durationMinutes;
  let targetId = null;

  if (typeof targetItem === "object" && targetItem !== null) {
    targetStart = getSessionTimestamp(targetItem);
    targetId = targetItem.id;
    if (targetItem.duration) targetDuration = Number(targetItem.duration) || durationMinutes;
  } else {
    targetStart = new Date(targetItem).getTime();
  }

  if (!targetStart || isNaN(targetStart)) {
    return { hasConflict: false };
  }

  const targetEnd = targetStart + targetDuration * 60 * 1000;

  // 1. Check against Confirmed (accepted / active) Sessions
  for (const s of confirmedSessions) {
    if (s.id && targetId && s.id === targetId) continue; // Skip self
    const status = (s.status || "").toLowerCase();
    if (status !== "accepted" && status !== "active") continue;

    const sStart = getSessionTimestamp(s);
    if (!sStart) continue;

    const sDuration = s.duration ? Number(s.duration) : durationMinutes;
    const sEnd = sStart + sDuration * 60 * 1000;

    // Interval intersection condition: startA < endB && endA > startB
    if (targetStart < sEnd && targetEnd > sStart) {
      const clientName = s.userName || s.clientName || s.userEmail || "Confirmed Client";
      return {
        hasConflict: true,
        type: "session",
        conflictingWith: s,
        message: `Overlaps with confirmed session for ${clientName} (${formatSessionTime(sStart)} - ${formatSessionTime(sEnd)})`
      };
    }
  }

  // 2. Check against Blocked Availability Slots
  for (const b of blockedSlots) {
    if (b.id && targetId && b.id === targetId) continue;
    const bStart = getSessionTimestamp(b);
    if (!bStart) continue;

    let bEnd;
    if (b.date && b.endTime) {
      const parsedEnd = new Date(`${b.date}T${b.endTime}`).getTime();
      bEnd = isNaN(parsedEnd) ? bStart + 60 * 60 * 1000 : parsedEnd;
    } else {
      bEnd = bStart + 60 * 60 * 1000;
    }

    if (targetStart < bEnd && targetEnd > bStart) {
      return {
        hasConflict: true,
        type: "blocked",
        conflictingWith: b,
        message: `Overlaps with blocked time "${b.title || "Personal Time Off"}" (${formatSessionTime(bStart)} - ${formatSessionTime(bEnd)})`
      };
    }
  }

  return { hasConflict: false };
}
