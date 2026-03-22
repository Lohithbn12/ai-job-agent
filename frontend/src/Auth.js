// ─── Auth.js ─────────────────────────────────────────────────────────────────
// Premium Login — Option O (Deep Ocean)
// Near-black bg · Blue accents · Split layout · No stats
// Import in App.js: import AuthWrapper from "./Auth";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { API } from "./constants";

const ANIM_CSS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes shimmer {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50%       { opacity: 1;   transform: scale(1.03); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-6px); }
  }
  @keyframes orb {
    0%, 100% { transform: translate(0,0); }
    50%       { transform: translate(15px,-10px); }
  }
  .ocean-input::placeholder { color: rgba(255,255,255,0.18) !important; }
  .ocean-input:focus { outline: none !important; }
`;

export default function AuthWrapper({ onLogin }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ANIM_CSS }} />
      <div style={{
        minHeight: "100vh",
        background: "#020617",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background orbs */}
        <div style={{
          position: "absolute", width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(29,78,216,0.12) 0%, transparent 70%)",
          top: "-150px", left: "-100px",
          animation: "orb 12s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)",
          bottom: "-100px", right: "-80px",
          animation: "orb 9s ease-in-out infinite reverse",
        }} />
        {/* Grid lines */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }} />
        {/* Radial fade over grid */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, transparent 40%, #020617 80%)",
          pointerEvents: "none",
        }} />

        <LoginPage onLogin={onLogin} />
      </div>
    </>
  );
}

function LoginPage({ onLogin }) {
  const remembered = (() => {
    try { return JSON.parse(localStorage.getItem("js_remember")) || null; } catch { return null; }
  })();

  const [email, setEmail]           = useState(remembered?.email || "");
  const [password, setPassword]     = useState(remembered?.password || "");
  const [rememberMe, setRememberMe] = useState(!!remembered);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [showPwd, setShowPwd]       = useState(false);
  const [ready, setReady]           = useState(false);
  const [focused, setFocused]       = useState(null);

  useEffect(() => { setTimeout(() => setReady(true), 60); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError("Please fill in all fields.");
    try {
      setLoading(true); setError("");
      const res = await axios.post(`${API}/auth/login`, {
        email: email.toLowerCase().trim(), password,
      });
      if (rememberMe) {
        localStorage.setItem("js_remember", JSON.stringify({ email: email.toLowerCase().trim(), password }));
      } else {
        localStorage.removeItem("js_remember");
      }
      localStorage.setItem("js_token", res.data.token);
      localStorage.setItem("js_user", JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      display: "flex",
      width: "100%",
      maxWidth: 860,
      minHeight: 520,
      borderRadius: 20,
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
      animation: ready ? "fadeUp 0.65s cubic-bezier(0.22,1,0.36,1) forwards" : "none",
      opacity: ready ? 1 : 0,
      position: "relative",
      zIndex: 2,
    }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        width: "42%",
        background: "linear-gradient(180deg, #0c1a3d 0%, #0f2854 50%, #0c1a3d 100%)",
        padding: "48px 40px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle top highlight */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)",
        }} />

        {/* Inner glow */}
        <div style={{
          position: "absolute", top: "30%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 260, height: 260, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 13,
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 800, color: "white",
              boxShadow: "0 6px 20px rgba(59,130,246,0.4)",
              border: "1px solid rgba(255,255,255,0.12)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>J</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "white", letterSpacing: "-0.5px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                JobScan
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                AI Career Platform
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{
              fontSize: 26, fontWeight: 800, color: "white",
              letterSpacing: "-0.8px", lineHeight: 1.2, marginBottom: 12,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              Find your<br />
              <span style={{
                background: "linear-gradient(90deg, #60a5fa, #3b82f6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>next role.</span>
            </h2>
            <p style={{
              fontSize: 13, color: "rgba(255,255,255,0.35)",
              lineHeight: 1.7, maxWidth: 200,
            }}>
              AI-powered job search across 5 platforms with real-time experience matching.
            </p>
          </div>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["💼", "Search across 5 job platforms"],
              ["📄", "ATS-optimised resume builder"],
              ["🎓", "Free courses & certifications"],
              ["🎯", "Interview prep & Q&A"],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: "rgba(59,130,246,0.12)",
                  border: "1px solid rgba(59,130,246,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13,
                }}>{icon}</div>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tag */}
        <div style={{
          fontSize: 11, color: "rgba(255,255,255,0.18)",
          letterSpacing: "0.3px",
        }}>
          v2.1.0 · Built with Node.js + React
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div style={{
        flex: 1,
        background: "#020b1a",
        padding: "48px 44px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}>

        {/* Heading */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontSize: 26, fontWeight: 700,
            color: "rgba(255,255,255,0.9)",
            letterSpacing: "-0.6px", marginBottom: 7,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>Welcome back</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>
            Sign in to your dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Email */}
          <div>
            <label style={{
              fontSize: 11, fontWeight: 600,
              color: "rgba(255,255,255,0.4)",
              display: "block", marginBottom: 8,
              letterSpacing: "0.8px", textTransform: "uppercase",
            }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: 14, top: "50%",
                transform: "translateY(-50%)", fontSize: 14,
                pointerEvents: "none",
                opacity: focused === "email" ? 0.8 : 0.3,
                transition: "opacity 0.15s",
              }}>✉</span>
              <input
                className="ocean-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                type="email"
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  padding: "13px 14px 13px 42px",
                  background: focused === "email"
                    ? "rgba(59,130,246,0.08)"
                    : "rgba(255,255,255,0.04)",
                  border: `1px solid ${focused === "email"
                    ? "rgba(59,130,246,0.5)"
                    : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 11,
                  fontSize: 14, color: "rgba(255,255,255,0.85)",
                  outline: "none", transition: "all 0.2s",
                  boxShadow: focused === "email"
                    ? "0 0 0 3px rgba(59,130,246,0.12)"
                    : "none",
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{
              fontSize: 11, fontWeight: 600,
              color: "rgba(255,255,255,0.4)",
              display: "block", marginBottom: 8,
              letterSpacing: "0.8px", textTransform: "uppercase",
            }}>Password</label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: 14, top: "50%",
                transform: "translateY(-50%)", fontSize: 14,
                pointerEvents: "none",
                opacity: focused === "password" ? 0.8 : 0.3,
                transition: "opacity 0.15s",
              }}>🔒</span>
              <input
                className="ocean-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                type={showPwd ? "text" : "password"}
                placeholder="Your password"
                style={{
                  width: "100%",
                  padding: "13px 50px 13px 42px",
                  background: focused === "password"
                    ? "rgba(59,130,246,0.08)"
                    : "rgba(255,255,255,0.04)",
                  border: `1px solid ${focused === "password"
                    ? "rgba(59,130,246,0.5)"
                    : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 11,
                  fontSize: 14, color: "rgba(255,255,255,0.85)",
                  outline: "none", transition: "all 0.2s",
                  boxShadow: focused === "password"
                    ? "0 0 0 3px rgba(59,130,246,0.12)"
                    : "none",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(p => !p)}
                style={{
                  position: "absolute", right: 14, top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: 600,
                  color: "rgba(255,255,255,0.3)",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
              >{showPwd ? "Hide" : "Show"}</button>
            </div>
          </div>

          {/* Remember me */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <label style={{
              display: "flex", alignItems: "center",
              gap: 9, cursor: "pointer", userSelect: "none",
            }}>
              <div
                onClick={() => setRememberMe(p => !p)}
                style={{
                  width: 18, height: 18, borderRadius: 5,
                  border: `1.5px solid ${rememberMe ? "rgba(59,130,246,0.7)" : "rgba(255,255,255,0.15)"}`,
                  background: rememberMe ? "rgba(59,130,246,0.2)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s", cursor: "pointer", flexShrink: 0,
                }}
              >
                {rememberMe && (
                  <span style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✓</span>
                )}
              </div>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>
                Remember me
              </span>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: "11px 14px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 10, fontSize: 13,
              color: "#fca5a5",
              display: "flex", gap: 8, alignItems: "center",
            }}>
              <span>⚠</span>{error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              padding: "14px",
              background: loading
                ? "rgba(59,130,246,0.2)"
                : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              border: "1px solid rgba(59,130,246,0.3)",
              borderRadius: 11,
              fontSize: 15, fontWeight: 700, color: "white",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: 9,
              boxShadow: loading
                ? "none"
                : "0 6px 24px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
              transition: "all 0.2s",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: "0.2px",
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 10px 32px rgba(59,130,246,0.5), inset 0 1px 0 rgba(255,255,255,0.12)";
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 6px 24px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.1)";
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 16, height: 16,
                  border: "2px solid rgba(255,255,255,0.25)",
                  borderTopColor: "white", borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                }} />
                Signing in…
              </>
            ) : "Sign In →"}
          </button>
        </form>

        {/* Saved credentials */}
        {remembered && (
          <div style={{
            marginTop: 14, padding: "10px 14px",
            background: "rgba(59,130,246,0.07)",
            border: "1px solid rgba(59,130,246,0.15)",
            borderRadius: 10,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 12, color: "rgba(96,165,250,0.85)" }}>✓ Credentials saved</span>
            <button
              onClick={() => {
                localStorage.removeItem("js_remember");
                setEmail(""); setPassword(""); setRememberMe(false);
                window.location.reload();
              }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 600,
              }}
            >Forget me</button>
          </div>
        )}

        {/* Divider + note */}
        <div style={{
          marginTop: 28, paddingTop: 22,
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <span style={{ fontSize: 14, opacity: 0.3 }}>🔒</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
            New accounts are created by admins via User Management
          </span>
        </div>
      </div>
    </div>
  );
}
