import { apiRequest } from "./client";

export function registerUser(payload) {
  return apiRequest("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload) {
  return apiRequest("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}