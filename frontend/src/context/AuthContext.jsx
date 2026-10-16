import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginUser, registerUser } from "../api/auth";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("auth_user") || "null");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem("auth_user", JSON.stringify(user));
    else localStorage.removeItem("auth_user");
  }, [user]);

  async function login(email, password, selectedRole) {
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      const backendUser = data.user;

      // Backend is authoritative. The selected UI role never grants permissions.
      if (selectedRole && backendUser.role !== selectedRole) {
        const error = new Error(
          `The backend authenticated this account as "${backendUser.role}", not "${selectedRole}".`
        );
        error.code = "ROLE_MISMATCH";
        error.backendUser = backendUser;
        throw error;
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token_type", data.token_type || "bearer");
      setUser(backendUser);
      return backendUser;
    } finally {
      setLoading(false);
    }
  }

  async function register(email, password) {
    setLoading(true);
    try {
      return await registerUser({ email, password });
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("auth_user");
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;

  const { user } = useAuth();
  console.log("Logged-in user:", user);
  console.log("Logged-in role:", user?.role);
}
