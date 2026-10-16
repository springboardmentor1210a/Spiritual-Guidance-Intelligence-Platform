
import { useEffect, useState } from "react";
import {
  getProfessionals,
  getAvailability,
  bookAppointment,
} from "../api/appointments";

function formatDate(value) {
  if (!value) return "Not specified";
  return new Date(value).toLocaleString();
}

function normalizeList(result) {
  return Array.isArray(result)
    ? result
    : result?.items || result?.data || [];
}

export default function AppointmentBooking() {
  const [professionals, setProfessionals] = useState([]);
  const [slots, setSlots] = useState([]);
  const [professionalId, setProfessionalId] = useState("");
  const [sessionType, setSessionType] = useState("Tarot Reading");
  const [notes, setNotes] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadProfessionals() {
    setError("");

    try {
      const result = await getProfessionals();
      setProfessionals(normalizeList(result));
    } catch (err) {
      setError(err.message || "Could not load professionals.");
    } finally {
      setLoading(false);
    }
  }

  async function loadSlots(id = professionalId) {
    setError("");
    setMessage("");
    setSelectedSlot("");
    setRefreshing(true);

    try {
      const result = await getAvailability(
        id ? { professional_id: id } : {}
      );

      const list = normalizeList(result);

      setSlots(
        list.filter((slot) => {
          const status = String(
            slot.status || "available"
          ).toLowerCase();

          return ![
            "booked",
            "cancelled",
            "unavailable",
          ].includes(status);
        })
      );
    } catch (err) {
      setError(err.message || "Could not load available slots.");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadProfessionals();
    loadSlots("");
  }, []);

  async function handleProfessionalChange(value) {
    setProfessionalId(value);
    await loadSlots(value);
  }

  async function handleBooking(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!selectedSlot) {
      setError("Select an available appointment slot first.");
      return;
    }

    setBooking(true);

    try {
      await bookAppointment({
        availability_id: Number(selectedSlot),
        session_type: sessionType.trim(),
        notes: notes.trim() || null,
      });

      setMessage("Appointment booked successfully.");
      setNotes("");
      setSelectedSlot("");
      await loadSlots(professionalId);
    } catch (err) {
      setError(err.message || "Booking failed. Please try again.");
    } finally {
      setBooking(false);
    }
  }

  return (
    <main className="appointment-page booking-page">
      <header className="appointment-page-header">
        <p className="appointment-eyebrow">
          YOUR NEXT SESSION
        </p>
        <h1>Book an Appointment</h1>
        <p className="appointment-page-description">
          Choose a tarot reader or spiritual consultant and
          select an available time.
        </p>
      </header>

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

      <section className="appointment-panel professional-panel">
        <label htmlFor="professional">Professional</label>

        <select
          id="professional"
          className="appointment-field"
          value={professionalId}
          onChange={(e) => handleProfessionalChange(e.target.value)}
        >
          <option value="">All professionals</option>
          {professionals.map((person) => (
            <option key={person.id} value={person.id}>
              {person.email || `Professional ${person.id}`} —{" "}
              {person.role || "Professional"}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="appointment-button secondary"
          onClick={() => loadSlots(professionalId)}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing…" : "Refresh Availability"}
        </button>
      </section>

      <section className="appointment-slots-section">
        <div className="appointment-section-heading">
          <div>
            <p className="appointment-eyebrow">AVAILABLE TIMES</p>
            <h2>Available Time Slots</h2>
          </div>
          <span className="appointment-count">
            {slots.length} available
          </span>
        </div>

        {loading && (
          <p className="appointment-empty">Loading professionals…</p>
        )}

        {!loading && refreshing && (
          <p className="appointment-empty">Refreshing available times…</p>
        )}

        {!loading && !refreshing && slots.length === 0 && (
          <div className="appointment-empty">
            No available slots were returned. Try another
            professional or refresh availability.
          </div>
        )}

        <div className="appointment-slot-list">
          {slots.map((slot) => {
            const isSelected =
              String(selectedSlot) === String(slot.id);

            return (
              <label
                key={slot.id}
                className={`appointment-slot-card${
                  isSelected ? " selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="appointmentSlot"
                  value={slot.id}
                  checked={isSelected}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                />

                <span className="appointment-slot-indicator" />

                <span className="appointment-slot-content">
                  <strong className="appointment-slot-time">
                    {formatDate(slot.start_at)}
                    <span className="appointment-time-separator">
                      {" "}—{" "}
                    </span>
                    {formatDate(slot.end_at)}
                  </strong>

                  <span className="appointment-slot-meta">
                    Professional ID: {slot.professional_id}
                    {" · "}
                    Status: {slot.status || "Available"}
                  </span>
                </span>

                <span className="appointment-slot-select-label">
                  {isSelected ? "Selected" : "Select"}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <form className="appointment-panel appointment-details" onSubmit={handleBooking}>
        <p className="appointment-eyebrow">PERSONALIZE YOUR SESSION</p>
        <h2>Appointment Details</h2>
        <p className="appointment-panel-description">
          Add the type of session you need and any optional
          details for your professional.
        </p>

        <div className="appointment-form-group">
          <label htmlFor="sessionType">Session type</label>
          <input
            id="sessionType"
            className="appointment-field"
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
            minLength={2}
            maxLength={100}
            required
          />
        </div>

        <div className="appointment-form-group">
          <label htmlFor="notes">Notes <span>(optional)</span></label>
          <textarea
            id="notes"
            className="appointment-field appointment-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="Add any details the professional should know."
          />
        </div>

        <button
          type="submit"
          className="appointment-button primary"
          disabled={booking || !selectedSlot}
        >
          {booking ? "Booking…" : "Confirm Booking"}
        </button>

        {!selectedSlot && (
          <p className="appointment-form-hint">
            Select an available time slot before confirming.
          </p>
        )}
      </form>
    </main>
  );
}
