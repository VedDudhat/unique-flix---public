import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiUser, FiMail, FiCalendar, FiShield, FiLogOut, FiArrowLeft, FiEdit2 } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getMe } from "../utils/api";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(setProfile)
      .catch(() => {
        // Fall back to auth context data if endpoint fails
        setProfile(user);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingTop: "80px" }}>
      {/* Header gradient strip */}
      <div style={{
        background: "linear-gradient(180deg, rgba(229,9,20,0.07) 0%, transparent 100%)",
        borderBottom: "1px solid var(--border)",
        padding: "40px 0 32px",
        marginBottom: 40,
      }}>
        <div className="container">
          <Link
            to="/"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: 20,
              transition: "color 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "white")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            <FiArrowLeft size={14} /> Back to home
          </Link>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: 4 }}>
            My Profile
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Manage your UniqueFlix account
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 800 }}>
        {loading ? (
          <div className="spinner-wrap">
            <div className="spinner" />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Avatar + name card */}
            <div style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 16, padding: "32px 28px",
              display: "flex", alignItems: "center", gap: 24,
            }}>
              {/* Avatar circle */}
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "var(--accent)", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: "2rem", fontWeight: 900, color: "white",
                flexShrink: 0, boxShadow: "0 0 0 4px rgba(229,9,20,0.2)",
              }}>
                {(profile?.username || "U")[0].toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 4 }}>
                  {profile?.username || "Unknown User"}
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  {profile?.email || ""}
                </div>
                {profile?.role && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    marginTop: 10, padding: "3px 10px", borderRadius: 20,
                    background: profile.role === "admin"
                      ? "rgba(229,9,20,0.15)" : "rgba(255,255,255,0.07)",
                    border: `1px solid ${profile.role === "admin" ? "rgba(229,9,20,0.4)" : "var(--border)"}`,
                    fontSize: "0.75rem", fontWeight: 700,
                    color: profile.role === "admin" ? "var(--accent)" : "var(--text-secondary)",
                    textTransform: "uppercase", letterSpacing: "0.5px",
                  }}>
                    <FiShield size={11} />
                    {profile.role}
                  </span>
                )}
              </div>
            </div>

            {/* Details grid */}
            <div style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 16, overflow: "hidden",
            }}>
              <div style={{
                padding: "18px 24px", borderBottom: "1px solid var(--border)",
                fontWeight: 700, fontSize: "0.85rem",
                textTransform: "uppercase", letterSpacing: "0.5px",
                color: "var(--text-secondary)",
              }}>
                Account Details
              </div>

              {[
                {
                  icon: <FiUser size={16} />,
                  label: "Username",
                  value: profile?.username,
                },
                {
                  icon: <FiMail size={16} />,
                  label: "Email Address",
                  value: profile?.email,
                },
                joinedDate && {
                  icon: <FiCalendar size={16} />,
                  label: "Member Since",
                  value: joinedDate,
                },
                profile?.role && {
                  icon: <FiShield size={16} />,
                  label: "Role",
                  value: profile.role.charAt(0).toUpperCase() + profile.role.slice(1),
                },
              ]
                .filter(Boolean)
                .map((row, i, arr) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex", alignItems: "center", gap: 16,
                      padding: "16px 24px",
                      borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <span style={{ color: "var(--accent)", flexShrink: 0 }}>{row.icon}</span>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem", width: 130, flexShrink: 0 }}>
                      {row.label}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{row.value}</span>
                  </div>
                ))}
            </div>

            {/* Extra profile fields if backend returns them */}
            {(profile?.bio || profile?.location) && (
              <div style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 16, overflow: "hidden",
              }}>
                <div style={{
                  padding: "18px 24px", borderBottom: "1px solid var(--border)",
                  fontWeight: 700, fontSize: "0.85rem",
                  textTransform: "uppercase", letterSpacing: "0.5px",
                  color: "var(--text-secondary)",
                }}>
                  About
                </div>
                {profile.bio && (
                  <div style={{ padding: "16px 24px", borderBottom: profile.location ? "1px solid var(--border)" : "none" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Bio</div>
                    <p style={{ fontSize: "0.9rem", lineHeight: 1.6, color: "var(--text-secondary)" }}>{profile.bio}</p>
                  </div>
                )}
                {profile.location && (
                  <div style={{ padding: "16px 24px" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Location</div>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{profile.location}</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 16, overflow: "hidden",
            }}>
              <div style={{
                padding: "18px 24px", borderBottom: "1px solid var(--border)",
                fontWeight: 700, fontSize: "0.85rem",
                textTransform: "uppercase", letterSpacing: "0.5px",
                color: "var(--text-secondary)",
              }}>
                Actions
              </div>
              <button
                onClick={handleLogout}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "16px 24px", background: "none", cursor: "pointer",
                  color: "#ff6b6b", fontSize: "0.9rem", fontWeight: 600,
                  fontFamily: "inherit", transition: "background 0.15s",
                  borderBottom: "none",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "rgba(229,9,20,0.08)")}
                onMouseOut={(e) => (e.currentTarget.style.background = "none")}
              >
                <FiLogOut size={16} />
                Sign out of UniqueFlix
              </button>
            </div>

            {/* Raw data (dev/admin only) */}
            {profile?.role === "admin" && (
              <details style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 16, padding: "16px 24px",
              }}>
                <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  Raw API Response (admin only)
                </summary>
                <pre style={{
                  marginTop: 14, padding: 14, background: "var(--bg-secondary)",
                  borderRadius: 10, fontSize: "0.75rem", color: "var(--text-muted)",
                  overflowX: "auto", whiteSpace: "pre-wrap",
                }}>
                  {JSON.stringify(profile, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>

      <div style={{ height: 60 }} />
    </div>
  );
}