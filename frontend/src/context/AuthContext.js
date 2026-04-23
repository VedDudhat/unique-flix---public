import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getToken, getUser, saveToken, saveUser, clearAuth } from "../utils/auth";
import { login as apiLogin, register as apiRegister, logout as apiLogout } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize from localStorage so a page refresh keeps the session alive
  const [user, setUser]       = useState(() => getUser());
  const [token, setToken]     = useState(() => getToken());
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const isAuthenticated = Boolean(token && user);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async ({ username, email, password }) => {
    setLoading(true);
    setError(null);
    try {
      await apiRegister({ username, email, password });
      // After register, immediately log the user in
      const data = await apiLogin({ email, password });
      saveToken(data.access_token);
      saveUser({ id: data.user_id, username: data.username, email });
      setToken(data.access_token);
      setUser({ id: data.user_id, username: data.username, email });
      return { success: true };
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Registration failed. Please try again.";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiLogin({ email, password });
      saveToken(data.access_token);
      saveUser({ id: data.user_id, username: data.username, email });
      setToken(data.access_token);
      setUser({ id: data.user_id, username: data.username, email });
      return { success: true };
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Invalid email or password.";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await apiLogout(); // revoke token on server
    } catch {
      // Even if the server call fails, clear local state
    }
    clearAuth();
    setToken(null);
    setUser(null);
  }, []);

  // ── Clear transient error ──────────────────────────────────────────────────
  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, loading, error, register, login, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Convenience hook — use this in any component
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}