import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function roleHome(user) {
  if (user?.role === "admin") return "/admin";
  if (user?.role === "tarot_reader") return "/tarot-reader";
  if (user?.role === "consultant") return "/consultant";
  return "/dashboard";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function initializeAuth() {
      try {
        // The backend redirects back to /login#access_token=...
        // The URL fragment is read by the browser and is not sent to the server.
        const hash = window.location.hash.startsWith("#")
          ? window.location.hash.slice(1)
          : window.location.hash;
        const fragmentParams = new URLSearchParams(hash);
        const queryParams = new URLSearchParams(window.location.search);
        const oauthToken =
          fragmentParams.get("access_token") ||
          queryParams.get("access_token");

        if (oauthToken) {
          localStorage.setItem("palmistry_token", oauthToken);
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const token = localStorage.getItem("palmistry_token");
        if (!token) {
          if (active) setUser(null);
          return;
        }

        const response = await api.get("/api/auth/me");
        if (active) setUser(response.data);
      } catch {
        localStorage.removeItem("palmistry_token");
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    initializeAuth();
    return () => {
      active = false;
    };
  }, []);

  async function login(email, password) {
    const body = new URLSearchParams();
    body.append("username", email);
    body.append("password", password);

    const response = await api.post("/api/auth/login", body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    localStorage.setItem("palmistry_token", response.data.access_token);

    try {
      const me = await api.get("/api/auth/me");
      setUser(me.data);
      return me.data;
    } catch (error) {
      localStorage.removeItem("palmistry_token");
      setUser(null);
      throw error;
    }
  }

  async function register(fullName, email, password, role = "user") {
    await api.post("/api/auth/register", {
      full_name: fullName,
      email,
      password,
      role,
    });
    return login(email, password);
  }

  function logout() {
    localStorage.removeItem("palmistry_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, roleHome }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
