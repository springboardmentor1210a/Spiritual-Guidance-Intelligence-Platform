import { apiRequest } from "./client";

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

// Professionals
export function getProfessionals(professionalRole) {
  return apiRequest(
    `/api/v1/appointments/professionals${buildQuery({
      professional_role: professionalRole,
    })}`
  );
}

// Availability slots
export function createAvailability(payload) {
  return apiRequest("/api/v1/appointments/availability", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAvailability(filters = {}) {
  return apiRequest(
    `/api/v1/appointments/availability${buildQuery(filters)}`
  );
}

export function deleteAvailability(slotId) {
  return apiRequest(`/api/v1/appointments/availability/${slotId}`, {
    method: "DELETE",
  });
}

// Appointment bookings
export function bookAppointment(payload) {
  return apiRequest("/api/v1/appointments/book", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMyAppointments() {
  return apiRequest("/api/v1/appointments/mine");
}

export function getMyProfessionalAppointments() {
  return apiRequest("/api/v1/appointments/professional/mine");
}

export function cancelAppointment(appointmentId) {
  return apiRequest(`/api/v1/appointments/${appointmentId}/cancel`, {
    method: "POST",
  });
}

// Notifications
export function getMyNotifications() {
  return apiRequest("/api/v1/notifications");
}

export function markNotificationRead(notificationId) {
  return apiRequest(`/api/v1/notifications/${notificationId}/read`, {
    method: "POST",
  });
}
