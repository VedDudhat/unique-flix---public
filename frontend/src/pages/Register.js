import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiUserPlus, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, isAuthenticated, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]         = useState({ username: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [localErr, setLocalErr] = useState("");

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) setLocalErr(error);
  }, [error]);

  const handleChange = (e) => {
    clearError();
    setLocalErr("");
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.username || !form.email || !form.password || !form.confirm)
      return "Please fill in all fields.";
    if (!/^[a-zA-Z0-9_]+$/.test(form.username))
      return "Username may only contain letters, numbers and underscores.";
    if (form.username.length < 3)
      return "Username must be at least 3 characters.";
    if (form.password.length < 6)
      return "Password must be at least 6 characters.";
    if (form.password !== form.confirm)
      return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setLocalErr(err); return; }

    const result = await register({
      username: form.username,
      email:    form.email,
      password: form.password,
    });

    if (result.success) navigate("/", { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-backdrop" />

      <div className="auth-card">
        <div className="auth-logo">Unique<span>Flix</span></div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join and start watching for free</p>

        {localErr && (
          <div className="auth-error">
            <span>⚠️</span> {localErr}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Username */}
          <div className="auth-field">
            <label className="auth-label">Username</label>
            <div className="auth-input-wrap">
              <FiUser className="auth-input-icon" />
              <input
                className="auth-input"
                type="text"
                name="username"
                autoComplete="username"
                placeholder="john_doe"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

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
                autoComplete="new-password"
                placeholder="At least 6 characters"
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

          {/* Confirm Password */}
          <div className="auth-field">
            <label className="auth-label">Confirm password</label>
            <div className="auth-input-wrap">
              <FiLock className="auth-input-icon" />
              <input
                className="auth-input"
                type={showPass ? "text" : "password"}
                name="confirm"
                autoComplete="new-password"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password strength hint */}
          {form.password && (
            <div className="auth-strength">
              <div
                className="auth-strength-bar"
                style={{
                  width:
                    form.password.length >= 10 ? "100%" :
                    form.password.length >= 6  ? "60%"  : "30%",
                  background:
                    form.password.length >= 10 ? "#22c55e" :
                    form.password.length >= 6  ? "#f59e0b" : "#e50914",
                }}
              />
              <span className="auth-strength-label">
                {form.password.length >= 10 ? "Strong" :
                 form.password.length >= 6  ? "Medium" : "Weak"}
              </span>
            </div>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? (
              <span className="auth-spinner" />
            ) : (
              <><FiUserPlus style={{ marginRight: 8 }} /> Create Account</>
            )}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}