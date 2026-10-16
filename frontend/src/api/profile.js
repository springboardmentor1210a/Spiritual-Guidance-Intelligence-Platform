import { apiRequest } from "./client";

export function getProfile() {
  return apiRequest("/api/v1/profile");
}

export function createProfile(payload) {
  return apiRequest("/api/v1/profile", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProfile(payload) {
  return apiRequest("/api/v1/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}