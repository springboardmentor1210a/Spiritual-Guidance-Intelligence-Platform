
import { useEffect, useState } from "react";
import {
  getMyAppointments,
  cancelAppointment,
} from "../api/appointments";

function dateText(value) {
  return value ? new Date(value).toLocaleString() : "Not specified";
}

function normalizeList(result) {
  return Array.isArray(result)
    ? result
    : result?.items || result?.data || [];
}

function statusClass(status) {
  const normalized = String(status || "pending").toLowerCase();

  if (["cancelled", "canceled"].includes(normalized)) {
    return "cancelled";
  }

  if (normalized === "completed") {
    return "completed";
  }

  if (["confirmed", "approved", "booked"].includes(normalized)) {
    return "confirmed";
  }

  if (["rejected", "failed"].includes(normalized)) {
    return "cancelled";
  }

  return "pending";
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function loadAppointments() {
    setLoading(true);
    setError("");

    try {
      setAppointments(normalizeList(await getMyAppointments()));
    } catch (err) {
      setError(err.message || "Could not load your appointments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  async function handleCancel(appointment) {
    const status = String(appointment.status || "").toLowerCase();

    if (["cancelled", "canceled", "completed"].includes(status)) {
      setError("This appointment cannot be cancelled.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to cancel this appointment?"
      )
    ) {
      return;
    }

    setBusyId(appointment.id);
    setError("");
    setMessage("");

    try {
      await cancelAppointment(appointment.id);
      setMessage(`Appointment ${appointment.id} cancelled.`);
      await loadAppointments();
    } catch (err) {
      setError(err.message || "Cancellation failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="appointment-page my-appointments-page">
      <header className="appointment-page-header">
        <p className="appointment-eyebrow">YOUR SESSIONS</p>
        <h1>My Appointments</h1>
        <p className="appointment-page-description">
          Review your upcoming sessions, check appointment details,
          and manage your bookings.
        </p>
      </header>

      <div className="appointment-list-toolbar">
        <span className="appointment-count">
          {appointments.length}{" "}
          {appointments.length === 1 ? "appointment" : "appointments"}
        </span>

        <button
          type="button"
          className="appointment-button secondary"
          onClick={loadAppointments}
          disabled={loading}
        >
          {loading ? "Refreshing…" : "Refresh Appointments"}
        </button>
      </div>

      {error && (
        <div className="appointment-message error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="appointment-message success" role="status">
          {message}
        </div>
      )}

      {loading && (
        <div className="appointment-empty">
          Loading your appointments…
        </div>
      )}

      {!loading && appointments.length === 0 && (
        <div className="appointment-empty appointment-no-results">
          <h2>No appointments yet</h2>
          <p>
            Your booked sessions will appear here once you make
            an appointment.
          </p>
        </div>
      )}

      {!loading && appointments.length > 0 && (
        <div className="my-appointment-list">
          {appointments.map((appointment) => {
            const slot = appointment.availability || {};
            const status = String(
              appointment.status || "pending"
            ).toLowerCase();

            const canCancel = ![
              "cancelled",
              "canceled",
              "completed",
            ].includes(status);

            return (
              <section
                key={appointment.id}
                className="my-appointment-card"
              >
                <div className="my-appointment-card-header">
                  <div>
                    <p className="appointment-eyebrow">
                      APPOINTMENT
                    </p>
                    <h2>Session #{appointment.id}</h2>
                  </div>

                  <span
                    className={`appointment-status ${statusClass(status)}`}
                  >
                    {appointment.status || "Pending"}
                  </span>
                </div>

                <div className="my-appointment-details-grid">
                  <div className="my-appointment-detail">
                    <span>Session type</span>
                    <strong>
                      {appointment.session_type || "Not specified"}
                    </strong>
                  </div>

                  <div className="my-appointment-detail">
                    <span>Professional ID</span>
                    <strong>
                      {appointment.professional_id ?? "Not specified"}
                    </strong>
                  </div>

                  <div className="my-appointment-detail">
                    <span>Start time</span>
                    <strong>{dateText(slot.start_at)}</strong>
                  </div>

                  <div className="my-appointment-detail">
                    <span>End time</span>
                    <strong>{dateText(slot.end_at)}</strong>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="my-appointment-notes">
                    <span>Notes</span>
                    <p>{appointment.notes}</p>
                  </div>
                )}

                {appointment.meeting_url && (
                  <div className="my-appointment-meeting">
                    <span>Online session</span>
                    <a
                      href={appointment.meeting_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Join session ↗
                    </a>
                  </div>
                )}

                {canCancel && (
                  <div className="my-appointment-actions">
                    <button
                      type="button"
                      className="appointment-button danger"
                      onClick={() => handleCancel(appointment)}
                      disabled={busyId === appointment.id}
                    >
                      {busyId === appointment.id
                        ? "Cancelling…"
                        : "Cancel Appointment"}
                    </button>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
