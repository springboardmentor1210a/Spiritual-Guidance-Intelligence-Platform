// src/api.js

import axios from 'axios';

/*
 * ============================================================
 * LUNARA API CLIENT
 * ============================================================
 *
 * Central Axios configuration for communication between
 * the Lunara React frontend and FastAPI backend.
 *
 * Existing backend:
 * http://127.0.0.1:8000
 *
 * All components should continue using:
 *
 * import api from '../api';
 *
 * Example:
 * api.get('/api/auth/me');
 * api.post('/api/analyze-palm', formData);
 *
 * ============================================================
 */

// ------------------------------------------------------------
// Backend Configuration
// ------------------------------------------------------------

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// ------------------------------------------------------------
// Axios Instance
// ------------------------------------------------------------

const api = axios.create({
  baseURL: API_BASE_URL,

  // Prevent requests from hanging indefinitely.
  timeout: 30000,

  headers: {
    Accept: 'application/json',
  },
});

// ------------------------------------------------------------
// Request Interceptor
// ------------------------------------------------------------
//
// Automatically attaches the JWT token to every authenticated
// request.
//
// This preserves the existing authentication system:
// localStorage -> token -> Authorization header
// ------------------------------------------------------------

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers = config.headers || {};

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ------------------------------------------------------------
// Response Interceptor
// ------------------------------------------------------------
//
// We intentionally DO NOT automatically redirect or remove the
// token here.
//
// Your App.jsx already handles authentication validation and
// logout, so keeping that responsibility there prevents the API
// layer from unexpectedly logging users out.
//
// This interceptor simply passes successful responses and errors
// back to the component that made the request.
// ------------------------------------------------------------

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    // Keep the original Axios error available to the component.
    // Existing components such as Login, PalmUploader, TarotReader
    // and Dashboards can continue using error.response normally.

    if (error.response) {
      console.warn(
        `Lunara API Error: ${error.response.status}`,
        error.response.data
      );
    } else if (error.request) {
      console.warn(
        'Lunara API: No response received from the backend.'
      );
    } else {
      console.warn(
        'Lunara API: Request configuration error.',
        error.message
      );
    }

    return Promise.reject(error);
  }
);

// ------------------------------------------------------------
// Export
// ------------------------------------------------------------

export default api;