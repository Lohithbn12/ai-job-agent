// ─── Auth.js ─────────────────────────────────────────────────────────────────
// Premium Login — Option O (Deep Ocean) — Fully Mobile Responsive
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
  @keyframes orb {
    0%, 100% { transform: translate(0,0); }
    50%       { transform: translate(15px,-10px); }
  }
  .ocean-input::placeholder { color: rgba(255,255,255,0.18) !important; }
  .ocean-input:focus { outline: none !important; }

  /* ── Auth Layout ── */
  
.auth-card {
  display: flex;
  width: 100%;
  max-width: 920px;
  min-height: 560px;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.06);
  box-shadow: 0 30px 80px rgba(0,0,0,0.55);
  animation: fadeUp 0.65s cubic-bezier(0.22,1,0.36,1) forwards;
  backdrop-filter: blur(12px);
}


  .auth-left {
    width: 42%;
    background: linear-gradient(180deg, #0c1a3d 0%, #0f2854 50%, #0c1a3d 100%);
    padding: 48px 40px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border-right: 1px solid rgba(255,255,255,0.05);
    position: relative;
    overflow: hidden;
  }
  .auth-right { flex: 1; background: linear-gradient(180deg, #020b1a 0%, #071426 100%); padding: 56px 48px; display: flex; flex-direction: column; justify-content: center; }

  /* ── Mobile: stack vertically, hide left panel ── */
  @media (max-width: 640px) {
    .auth-card {
      flex-direction: column;
      min-height: unset;
      border-radius: 16px;
      max-width: 100%;
    }
    .auth-left {
      width: 100%;
      padding: 24px 20px;
      min-height: unset;
      border-right: none;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .auth-left-features { display: none !important; }
    .auth-left-tagline  { display: none !important; }
    .auth-left-version  { display: none !important; }
    .auth-right {
      padding: 28px 20px 32px;
    }
    .auth-heading { font-size: 22px !important; }
    .auth-sub     { font-size: 12px !important; }
  }

  @media (max-width: 400px) {
    .auth-right { padding: 22px 16px 28px; }
  }
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
        padding: "16px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background orbs */}
        <div style={{
          position:"absolute", width:500, height:500, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(29,78,216,0.12) 0%, transparent 70%)",
          top:"-150px", left:"-100px", animation:"orb 12s ease-in-out infinite",
          pointerEvents:"none",
        }} />
        <div style={{
          position:"absolute", width:400, height:400, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)",
          bottom:"-100px", right:"-80px", animation:"orb 9s ease-in-out infinite reverse",
          pointerEvents:"none",
        }} />
        {/* Grid lines */}
        <div style={{
          position:"absolute", inset:0,
          backgroundImage:"linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize:"40px 40px", pointerEvents:"none",
        }} />
        <div style={{
          position:"absolute", inset:0,
          background:"radial-gradient(ellipse at center, transparent 40%, #020617 80%)",
          pointerEvents:"none",
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

  const inputStyle = (field) => ({
    width: "100%",
    padding: "13px 13px 13px 42px",
    background: focused === field ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.04)",
    border: `1px solid ${focused === field ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.07)"}`,
    borderRadius: 11,
    fontSize: 14,
    color: "white",
    outline: "none",
    transition: "all 0.2s",
    boxShadow: focused === field ? "0 0 0 3px rgba(59,130,246,0.12)" : "none",
  });

  return (
    <div className="auth-card" style={{ opacity: ready ? 1 : 0, position:"relative", zIndex:2 }}>

      {/* ── LEFT PANEL ── */}
      <div className="auth-left">
        {/* Top shimmer */}
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:1,
          background:"linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)",
        }} />

        {/* Logo */}
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
            <div style={{
              width:40, height:40, borderRadius:12,
              background:"linear-gradient(135deg, #3b82f6, #1d4ed8)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:18, fontWeight:800, color:"white",
              boxShadow:"0 6px 20px rgba(59,130,246,0.4)",
              border:"1px solid rgba(255,255,255,0.12)",
              flexShrink:0,
            }}>J</div>
            <div>
              <div style={{ fontSize:16, fontWeight:800, color:"white", letterSpacing:"-0.5px" }}>JobScan</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:"1.5px", textTransform:"uppercase" }}>
                AI Career Platform
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className="auth-left-tagline" style={{ marginBottom:24 }}>
            <h2 style={{
              fontSize:22, fontWeight:800, color:"white",
              letterSpacing:"-0.8px", lineHeight:1.2, marginBottom:10,
            }}>
              Find your<br />
              <span style={{
                background:"linear-gradient(90deg, #60a5fa, #3b82f6)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              }}>next role.</span>
            </h2>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)", lineHeight:1.7 }}>
              AI-powered job search across 5 platforms with real-time experience matching.
            </p>
          </div>

          {/* Features */}
          <div className="auth-left-features" style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[
              ["💼","Search across 5 job platforms"],
              ["📄","ATS-optimised resume builder"],
              ["🎓","Free courses & certifications"],
              ["🎯","Interview prep & Q&A"],
            ].map(([icon, text]) => (
              <div key={text} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{
                  width:26, height:26, borderRadius:7, flexShrink:0,
                  background:"rgba(59,130,246,0.12)",
                  border:"1px solid rgba(59,130,246,0.15)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:12,
                }}>{icon}</div>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.45)", lineHeight:1.4 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Version */}
        <div className="auth-left-version" style={{ fontSize:10, color:"rgba(255,255,255,0.18)" }}>
          v2.1.0 · Built with Node.js + React
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-right">
        <div style={{ marginBottom:24 }}>
          <h1 className="auth-heading" style={{ fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,0.95)", letterSpacing: "-0.8px", marginBottom: 8 }} >Welcome back</h1>
          <p className="auth-sub" style={{ fontSize:13, color:"rgba(255,255,255,0.3)", lineHeight:1.5 }}>
            Sign in to your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Email */}
          <div>
            <label style={{
              fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.4)",
              display:"block", marginBottom:7, letterSpacing:"0.8px", textTransform:"uppercase",
            }}>Email Address</label>
            <div style={{ position:"relative" }}>
              <span style={{
                position:"absolute", left:14, top:"50%", transform:"translateY(-50%)",
                fontSize:14, pointerEvents:"none",
                opacity: focused==="email" ? 0.8 : 0.3, transition:"opacity 0.15s",
              }}>✉</span>
              <input
                className="ocean-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                type="email"
                placeholder="you@example.com"
                style={inputStyle("email")}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{
              fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.4)",
              display:"block", marginBottom:7, letterSpacing:"0.8px", textTransform:"uppercase",
            }}>Password</label>
            <div style={{ position:"relative" }}>
              <span style={{
                position:"absolute", left:14, top:"50%", transform:"translateY(-50%)",
                fontSize:14, pointerEvents:"none",
                opacity: focused==="password" ? 0.8 : 0.3, transition:"opacity 0.15s",
              }}>🔒</span>
              <input
                className="ocean-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                type={showPwd ? "text" : "password"}
                placeholder="Your password"
                style={{ ...inputStyle("password"), paddingRight:52 }}
              />
              <button type="button" onClick={() => setShowPwd(p => !p)}
                style={{
                  position:"absolute", right:14, top:"50%", transform:"translateY(-50%)",
                  background:"none", border:"none", cursor:"pointer",
                  fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.35)",
                  transition:"color 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.color="rgba(255,255,255,0.7)"}
                onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,0.35)"}
              >{showPwd ? "Hide" : "Show"}</button>
            </div>
          </div>

          {/* Remember me */}
          <div style={{ display:"flex", alignItems:"center" }}>
            <label style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer", userSelect:"none" }}>
              <div onClick={() => setRememberMe(p => !p)} style={{
                width:18, height:18, borderRadius:5, cursor:"pointer", flexShrink:0,
                border:`1.5px solid ${rememberMe ? "rgba(59,130,246,0.7)" : "rgba(255,255,255,0.15)"}`,
                background: rememberMe ? "rgba(59,130,246,0.2)" : "transparent",
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"all 0.15s",
              }}>
                {rememberMe && <span style={{ color:"#60a5fa", fontSize:11, fontWeight:700, lineHeight:1 }}>✓</span>}
              </div>
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.35)", fontWeight:500 }}>Remember me</span>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding:"11px 14px",
              background:"rgba(239,68,68,0.08)",
              border:"1px solid rgba(239,68,68,0.2)",
              borderRadius:10, fontSize:13, color:"#fca5a5",
              display:"flex", gap:8, alignItems:"center",
            }}>
              <span>⚠</span>{error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading}
            
style={{
  width: "100%",
  padding: "14px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  color: "white",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
  boxShadow: "0 6px 18px rgba(59,130,246,0.35)",
  transition: "all 0.2s ease"
}}


            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 10px 32px rgba(59,130,246,0.5)"; }}}
            onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 6px 24px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.1)"; }}
          >
            {loading ? (
              <>
                <span style={{
                  width:16, height:16,
                  border:"2px solid rgba(255,255,255,0.25)",
                  borderTopColor:"white", borderRadius:"50%",
                  display:"inline-block", animation:"spin 0.7s linear infinite",
                }} />
                Signing in…
              </>
            ) : "Sign In →"}
          </button>
        </form>

        {/* Saved credentials */}
        {remembered && (
          <div style={{
            marginTop:14, padding:"10px 14px",
            background:"rgba(59,130,246,0.07)",
            border:"1px solid rgba(59,130,246,0.15)",
            borderRadius:10,
            display:"flex", justifyContent:"space-between", alignItems:"center",
          }}>
            <span style={{ fontSize:12, color:"rgba(96,165,250,0.85)" }}>✓ Credentials saved</span>
            <button onClick={() => {
              localStorage.removeItem("js_remember");
              setEmail(""); setPassword(""); setRememberMe(false);
              window.location.reload();
            }} style={{
              background:"none", border:"none", cursor:"pointer",
              fontSize:12, color:"rgba(255,255,255,0.3)", fontWeight:600,
            }}>Forget me</button>
          </div>
        )}

        {/* Admin note */}
        <div style={{
          marginTop:20, paddingTop:18,
          borderTop:"1px solid rgba(255,255,255,0.05)",
          display:"flex", alignItems:"center", justifyContent:"center", gap:6,
        }}>
          <span style={{ fontSize:13, opacity:0.3 }}>🔒</span>
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.2)", textAlign:"center" }}>
            New accounts are created by admins via User Management
          </span>
        </div>
      </div>
    </div>
  );
}
