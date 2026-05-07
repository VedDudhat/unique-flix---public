import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, isAuthenticated, loading, error, clearError } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || "/";

  const [form, setForm]         = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [localErr, setLocalErr] = useState("");

  // Already logged in → redirect immediately
  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  // Sync server-side errors into local display
  useEffect(() => {
    if (error) setLocalErr(error);
  }, [error]);

  const handleChange = (e) => {
    clearError();
    setLocalErr("");
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalErr("");

    if (!form.email || !form.password) {
      setLocalErr("Please fill in both fields.");
      return;
    }

    const result = await login(form);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-backdrop" />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">Unique<span>Flix</span></div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue watching</p>

        {localErr && (
          <div className="auth-error">
            <span>⚠️</span> {localErr}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="auth-field">
            <label className="auth-label">Email address</label>
            <div className="auth-input-wrap">
              <FiMail className="auth-input-icon" />
              <input
                className="auth-input"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrap">
              <FiLock className="auth-input-icon" />
              <input
                className="auth-input"
                type={showPass ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowPass((v) => !v)}
                tabIndex={-1}
              >
                {showPass ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? (
              <span className="auth-spinner" />
            ) : (
              <><FiLogIn style={{ marginRight: 8 }} /> Sign In</>
            )}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">Create one</Link>
        </p>
        <p className="auth-subtitle">email: admin@gmail.com , Pass: Admin@123</p>
        <p className="auth-subtitle">instruction: password is case sensitive</p>
      </div>
    </div>
  );
}