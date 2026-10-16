
import { useEffect, useState } from "react";
import {
  createAvailability,
  getAvailability,
  deleteAvailability,
  getMyProfessionalAppointments,
} from "../api/appointments";
import { useAuth } from "../context/AuthContext";
function normalizeList(result) {
  return Array.isArray(result) ? result : result?.items || result?.data || [];
}

function readUserId() {
  const directId =
    localStorage.getItem("user_id") ||
    localStorage.getItem("current_user_id");

  if (directId) return String(directId);

  for (const key of ["user", "current_user", "auth_user", "user_data"]) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      const id = value?.id ?? value?.user_id;
      if (id !== undefined && id !== null) return String(id);
    } catch {
      // Ignore storage entries that are not JSON.
    }
  }

  return "";
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "Not specified";
}

export default function AppointmentSchedule() {
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const userId = user?.id;



  async function loadSchedule() {
    setLoading(true);
    setError("");

    try {
      const [slotResult, appointmentResult] = await Promise.all([
        getAvailability(userId ? { professional_id: userId } : {}),
        getMyProfessionalAppointments(),
      ]);

      setSlots(normalizeList(slotResult));
      setAppointments(normalizeList(appointmentResult));
    } catch (err) {
      setError(err.message || "Could not load the professional schedule.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSchedule();
  }, []);

  async function handleCreate(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const start = new Date(startAt);
    const end = new Date(endAt);

    if (!startAt || !endAt || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setError("Enter a valid start and end date/time.");
      return;
    }

    if (end <= start) {
      setError("The end time must be later than the start time.");
      return;
    }

    setSaving(true);

    try {
      await createAvailability({
        start_at: start.toISOString(),
        end_at: end.toISOString(),
      });

      setMessage("Availability slot created.");
      setStartAt("");
      setEndAt("");
      await loadSchedule();
    } catch (err) {
      setError(err.message || "Could not create the availability slot.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slotId) {
    if (!window.confirm("Delete this availability slot?")) return;

    setError("");
    setMessage("");

    try {
      await deleteAvailability(slotId);
      setMessage("Availability slot deleted.");
      await loadSchedule();
    } catch (err) {
      setError(err.message || "Could not delete this slot. It may be booked or belong to another professional.");
    }
  }

  return (
    <main className="manage-schedule-page">
      <h1>Professional Schedule</h1>
      <p>Create time slots for customers to book.</p>

      {error && <p role="alert" style={{ color: "#b42318" }}>{error}</p>}
      {message && <p role="status" style={{ color: "#16794b" }}>{message}</p>}

      <form
        onSubmit={handleCreate}
        style={{ border: "1px solid #ddd", borderRadius: 12, padding: 18 }}
      >
        <h2>Create Availability</h2>

        <label htmlFor="startAt">Start date and time</label>
        <input
          id="startAt"
          type="datetime-local"
          value={startAt}
          onChange={(e) => setStartAt(e.target.value)}
          required
          style={{ display: "block", width: "100%", padding: 10, margin: "8px 0 16px", boxSizing: "border-box" }}
        />

        <label htmlFor="endAt">End date and time</label>
        <input
          id="endAt"
          type="datetime-local"
          value={endAt}
          onChange={(e) => setEndAt(e.target.value)}
          required
          style={{ display: "block", width: "100%", padding: 10, margin: "8px 0 16px", boxSizing: "border-box" }}
        />

        <button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Create Slot"}
        </button>
      </form>

      <section style={{ marginTop: 28 }}>
        <h2>Availability Slots</h2>
        <button type="button" onClick={loadSchedule}>Refresh Schedule</button>

        {loading && <p>Loading schedule…</p>}
        {!loading && slots.length === 0 && <p>No availability slots found.</p>}

        {slots.map((slot) => (
          <article
            key={slot.id}
            style={{ border: "1px solid #ddd", borderRadius: 10, padding: 16, margin: "12px 0" }}
          >
            <p><strong>Start:</strong> {formatDate(slot.start_at)}</p>
            <p><strong>End:</strong> {formatDate(slot.end_at)}</p>
            <p><strong>Status:</strong> {slot.status || "Available"}</p>
            <p><strong>Professional ID:</strong> {slot.professional_id}</p>
            <button type="button" onClick={() => handleDelete(slot.id)}>
              Delete Slot
            </button>
          </article>
        ))}
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>My Booked Appointments</h2>
        {!loading && appointments.length === 0 && <p>No appointments booked with you yet.</p>}

        {appointments.map((appointment) => (
          <article
            key={appointment.id}
            style={{ border: "1px solid #ddd", borderRadius: 10, padding: 16, margin: "12px 0" }}
          >
            <p><strong>Appointment:</strong> #{appointment.id}</p>
            <p><strong>Customer ID:</strong> {appointment.customer_id}</p>
            <p><strong>Session:</strong> {appointment.session_type}</p>
            <p><strong>Status:</strong> {appointment.status}</p>
            {appointment.notes && <p><strong>Notes:</strong> {appointment.notes}</p>}
          </article>
        ))}
      </section>
    </main>
  );
}
