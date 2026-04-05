import React, { useState } from "react";

export const API = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

// ─── Constants ────────────────────────────────────────────────────────────────
export const EXP_OPTIONS = [
  { value: "0-1", label: "0–1 yrs" },
  { value: "1-3", label: "1–3 yrs" },
  { value: "3-5", label: "3–5 yrs" },
  { value: "5-10", label: "5–10 yrs" },
  { value: "10+", label: "10+ yrs" },
];
export const EXP_LABEL = Object.fromEntries(EXP_OPTIONS.map((o) => [o.value, o.label]));

export const SOURCE_CONFIG = {
  indeed:      { label: "Indeed",      color: "#2563eb", dot: "#2563eb" },
  naukri:      { label: "Naukri",      color: "#fb923c", dot: "#f97316" },
  internshala: { label: "Internshala", color: "#a78bfa", dot: "#8b5cf6" },
  foundit:     { label: "Foundit",     color: "#f472b6", dot: "#ec4899" },
  apna:        { label: "Apna",        color: "#34d399", dot: "#10b981" },
  linkedin:    { label: "LinkedIn",    color: "#0a66c2", dot: "#0a66c2" },
};

export const PLATFORM_CONFIG = {
  YouTube:               { color: "#ff4444", icon: "▶" },
  Coursera:              { color: "#60a5fa", icon: "◆" },
  edX:                   { color: "#34d399", icon: "✦" },
  Simplilearn:           { color: "#fb923c", icon: "◉" },
  "Google Certificates": { color: "#facc15", icon: "G" },
  "Google Digital Garage":{ color: "#a78bfa", icon: "G" },
};

export const SKILLS_PREVIEW = 12;

// ─── ATS Resume defaults ──────────────────────────────────────────────────────
export const EMPTY_RESUME = {
  personal: { name: "", email: "", phone: "", location: "", linkedin: "", portfolio: "" },
  summary: "",
  experience: [],
  education: [],
  skills: { technical: [], soft: [], tools: [] },
  certifications: [],
  projects: [],
  languages: [],
};

// ─── Global CSS ───────────────────────────────────────────────────────────────
export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    /* ── White Canvas + Navy Ocean Theme ── */

    /* Sidebar — deep navy */
    --sb-bg:     #0a1628;
    --sb-bg2:    #0f1f3d;
    --sb-text:   #e8edf5;
    --sb-text2:  #8899b4;
    --sb-border: rgba(255,255,255,.06);
    --sb-hover:  rgba(30,111,212,.1);
    --sb-active: rgba(30,111,212,.18);
    --sb-width:  268px;

    /* Content — white/light */
    --bg:     #f0f4f9;
    --bg1:    #ffffff;
    --bg2:    #e8eef6;
    --border: rgba(30,111,212,.1);
    --border2:rgba(30,111,212,.2);

    /* Ocean accent */
    --ocean:     #1e6fd4;
    --ocean-dim: #1558b0;
    --ocean-glow:rgba(30,111,212,.15);
    --ocean-soft:rgba(30,111,212,.07);
    --teal:      #0891b2;
    --teal-dim:  #0e7490;
    --teal-glow: rgba(8,145,178,.15);
    --teal-soft: rgba(8,145,178,.08);
    --blue:      #3b82f6;
    --blue-dim:  #1d4ed8;

    /* Text — dark on white */
    --text:  #0f172a;
    --text2: #475569;
    --text3: #94a3b8;

    /* Status */
    --green:  #16a34a;
    --red:    #dc2626;
    --yellow: #d97706;
    --orange: #ea580c;
    --purple: #7c3aed;

    /* Shadows — soft blue-tinted */
    --shadow:    0 1px 3px rgba(30,111,212,.08), 0 4px 12px rgba(30,111,212,.06);
    --shadow-md: 0 4px 16px rgba(30,111,212,.12);
    --shadow-lg: 0 8px 32px rgba(30,111,212,.16);

    --r:  14px;
    --r2: 8px;
    --topbar: 64px;
  }

  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(30,111,212,.2); border-radius:6px; }
  ::-webkit-scrollbar-thumb:hover { background:rgba(30,111,212,.35); }
  input, button, textarea, select { font-family:inherit; }
  input:focus, textarea:focus, select:focus { outline:none; }
  a { text-decoration:none; color:inherit; }

  /* ── Animations ── */
  @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes slideIn { from{transform:translateX(-6px);opacity:0} to{transform:none;opacity:1} }
  @keyframes ringFill { from{stroke-dashoffset:283} to{stroke-dashoffset:var(--target)} }

  .fade-up  { animation: fadeUp  .4s cubic-bezier(.22,1,.36,1) both; }
  .fade-in  { animation: fadeIn  .25s ease both; }
  .slide-in { animation: slideIn .3s cubic-bezier(.22,1,.36,1) both; }

  /* ══════════════════════════════════════════════════════
     SIDEBAR — deep navy panel
  ══════════════════════════════════════════════════════ */

.sidebar {
  width: var(--sb-width);
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 100;
  display: flex;
  flex-direction: column;
  background: linear-gradient(
    180deg,
    #10284f 0%,
    #173a6f 50%,
    #1d4f8e 100%
  ) !important;
  overflow: hidden;
}


.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.18);
  border-radius: 10px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}










  .sidebar-overlay {
    display:none; position:fixed; inset:0;
    background:rgba(10,22,40,.6); backdrop-filter:blur(4px); z-index:45;
  }
  .sidebar-overlay.open { display:block; }

  /* ── Sidebar Brand ── */
  .sb-brand {
    display:flex; align-items:center; gap:12px;
    padding:20px 18px 16px;
    border-bottom:1px solid rgba(255,255,255,.06);
    flex-shrink:0;
  }
  .sb-logo {
    width:38px; height:38px; border-radius:11px;
    background:linear-gradient(135deg,#3b82f6,#1e6fd4);
    display:flex; align-items:center; justify-content:center;
    font-size:19px; flex-shrink:0;
    box-shadow:0 4px 14px rgba(30,111,212,.45);
  }
  .sb-wordmark {
    font-family:'Outfit',sans-serif; font-size:16px; font-weight:800;
    color:#e8edf5; letter-spacing:-.4px;
  }
  .sb-tagline { font-size:10px; color:rgba(255,255,255,.32); margin-top:1px; letter-spacing:.3px; }

  /* ── Sidebar User Card ── */



.signout-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(239,68,68,0.22);
  transition: all 0.25s ease;
}





.signout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(239,68,68,0.35);
}

.sb-user {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 14px 14px 12px;
  padding: 14px;
  background: rgba(255,255,255,0.07) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 14px rgba(0,0,0,0.08) !important;
}






  .sb-avatar {
    width:34px; height:34px; border-radius:9px;
    background:linear-gradient(135deg,#3b82f6,#0891b2);
    display:flex; align-items:center; justify-content:center;
    font-size:14px; font-weight:800; color:white; flex-shrink:0;
    font-family:'Outfit',sans-serif;
  }
  .sb-uname  { font-size:13px; font-weight:700; color:#e8edf5; }
  .sb-urole  { font-size:10.5px; color:rgba(255,255,255,.35); margin-top:1px; }
  .sb-online-dot {
    width:8px; height:8px; border-radius:50%;
    background:#22c55e; flex-shrink:0; margin-left:auto;
    box-shadow:0 0 7px rgba(34,197,94,.7);
    animation:pulse 2.5s ease-in-out infinite;
  }

  /* ── Sidebar Search ── */
  .sb-search { padding:10px 10px 4px; flex-shrink:0; }
  .sb-search-wrap {
    display:flex; align-items:center; gap:8px;
    background:rgba(255,255,255,.05);
    border:1px solid rgba(255,255,255,.07);
    border-radius:9px; padding:8px 12px;
    transition:all .15s;
  }
  .sb-search-wrap:focus-within {
    border-color:rgba(30,111,212,.5);
    background:rgba(30,111,212,.06);
  }
  .sb-search-icon { font-size:13px; opacity:.5; }
  .sb-search-wrap input {
    background:none; border:none; outline:none;
    font-size:12.5px; color:rgba(255,255,255,.6); width:100%;
  }
  .sb-search-wrap input::placeholder { color:rgba(255,255,255,.25); }

  /* ── Sidebar Nav ── */

.sb-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 0 16px;
  scrollbar-width: thin;
  min-height: 0;
}

.sb-nav::-webkit-scrollbar {
  width: 6px;
}

.sb-nav::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.18);
  border-radius: 10px;
}


  .sb-section-lbl {
    font-size:9px; font-weight:700; letter-spacing:1.4px;
    text-transform:uppercase; color:rgba(255,255,255,.22);
    padding:8px 10px 6px;
    font-family:'JetBrains Mono',monospace;
  }
  



.sb-nav-item { display: flex; align-items: center; gap: 12px; width: calc(100% - 24px); margin: 6px 12px; padding: 14px 16px !important; border-radius: 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05); box-shadow: none !important; transition: all .22s ease; position: relative; }




.sb-nav-item {
  transition: all 0.22s ease;
}

.sb-nav-item:hover {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,.08),
    rgba(30,111,212,.06)
  );
  transform: translateX(4px);
}



.sb-nav-item.active { background: rgba(255,255,255,0.10) !important; border: 1px solid rgba(255,255,255,0.06) !important; box-shadow: 0 4px 12px rgba(0,0,0,0.06) !important; }




  .sb-nav-item.active::before {
    content:''; position:absolute; left:0; top:50%;
    transform:translateY(-50%);
    width:3px; height:62%; background:#3b82f6;
    border-radius:0 3px 3px 0;
  }

 .sb-nav-icon { width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; background: rgba(255,255,255,.05); transition: all .2s ease; }
  .sb-nav-item:hover .sb-nav-icon {
  background: rgba(30,111,212,.18);
  transform: scale(1.06);
}
  .sb-nav-item.active .sb-nav-icon {
  background: rgba(30,111,212,.25);
  box-shadow: 0 0 16px rgba(30,111,212,.28);
  transform: scale(1.05);
}

  .sb-nav-label {
    font-size:13px; font-weight:600; color:rgba(255,255,255,.6);
    transition:color .15s;
  }
  .sb-nav-item:hover .sb-nav-label { color:rgba(255,255,255,.85); }
  .sb-nav-item.active .sb-nav-label { color:#93c5fd; }

  .sb-nav-sub { font-size:10.5px; color:rgba(255,255,255,.28); margin-top:1px; }
  .sb-nav-item.active .sb-nav-sub { color:rgba(147,197,253,.5); }

  .sb-badge {
    background:#e11d48; color:white; border-radius:10px;
    font-size:10px; font-weight:700; padding:2px 6px; flex-shrink:0;
    box-shadow:0 2px 6px rgba(225,29,72,.4);
  }

  /* ── Sidebar Steps ── */
  .sb-steps { padding:4px 6px 8px; }
  .sb-step-title {
    font-size:9px; font-weight:700; letter-spacing:1.2px;
    text-transform:uppercase; color:rgba(255,255,255,.25);
    margin-bottom:10px;
    font-family:'JetBrains Mono',monospace;
  }
  .sb-step-row { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
  .sb-step-num {
    width:22px; height:22px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:10px; font-weight:700; flex-shrink:0;
    transition:all .2s;
  }
  .sb-step-lbl { font-size:12px; font-weight:500; transition:color .15s; }

  /* ── Sidebar Status ── */
  .sb-status {
    display:flex; align-items:center; gap:8px;
    padding:9px 14px; margin:4px 10px 6px;
    background:rgba(8,145,178,.08);
    border:1px solid rgba(8,145,178,.18);
    border-radius:8px; flex-shrink:0;
  }
  .sb-status-dot {
    width:6px; height:6px; border-radius:50%;
    background:#0891b2; flex-shrink:0;
    animation:pulse 2s ease-in-out infinite;
  }
  .sb-status-txt { font-size:11px; color:rgba(255,255,255,.45); }

  /* ── Sidebar Footer ── */
  .sb-footer {
  padding: 14px;
  background: rgba(16,40,79,0.98);
  border-top: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
  position: relative;
}
  .sb-logout {
    width:100%; padding:9px 14px;
    background:rgba(255,255,255,.04);
    border:1px solid rgba(255,255,255,.07);
    border-radius:9px; color:rgba(255,255,255,.38);
    font-size:13px; font-weight:500; cursor:pointer;
    display:flex; align-items:center; gap:8px;
    transition:all .15s;
  }
  .sb-logout:hover {
    background:rgba(220,38,38,.08);
    border-color:rgba(220,38,38,.22);
    color:#f87171;
  }

  /* ══════════════════════════════════════════════════════
     TOP BAR — white with ocean accents
  ══════════════════════════════════════════════════════ */
  .top-bar-left { display:flex; align-items:center; gap:10px; }
  .top-bar-right { display:flex; align-items:center; gap:8px; }

  .topbar-divider {
    width:1px; height:20px;
    background:rgba(30,111,212,.15); flex-shrink:0;
  }
  .topbar-greeting {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  font-family: 'Outfit', sans-serif;
  letter-spacing: -0.3px;
}
  .topbar-date { font-size:11px; color:#94a3b8; margin-top:1px; }

  .home-btn {
  padding: 8px 12px;
  background: white;
  border: 1px solid rgba(30,111,212,.12);
  border-radius: 12px;
  font-size: 16px;
  cursor: pointer;
  transition: all .2s ease;
  box-shadow: 0 2px 8px rgba(30,111,212,.06);
}
  .home-btn:hover {
  background: rgba(30,111,212,.06);
  border-color: rgba(30,111,212,.25);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(30,111,212,.12);
}

  .tb-chip {
    padding:6px 14px; border-radius:20px;
    font-size:12px; font-weight:600;
    border:1px solid rgba(30,111,212,.12);
    background:white;
    color:#475569;
    box-shadow:0 1px 3px rgba(30,111,212,.05);
    display:flex; align-items:center; gap:5px;
  }
  .tb-chip-clock { font-family:'JetBrains Mono',monospace; font-size:11.5px; color:#64748b; }
  .tb-chip-notif { cursor:pointer; transition:all .15s; }
  .tb-chip-notif:hover { border-color:rgba(30,111,212,.3); background:rgba(30,111,212,.05); }
  .tb-chip-mode { background:rgba(30,111,212,.07); border-color:rgba(30,111,212,.2); color:#1e6fd4; font-weight:700; }
  .tb-chip-count { background:rgba(13,148,136,.07); border-color:rgba(13,148,136,.2); color:#0891b2; font-weight:700; }

  /* ══════════════════════════════════════════════════════
     HOME PAGE CARDS
  ══════════════════════════════════════════════════════ */
  .page-eyebrow {
    display:inline-flex; align-items:center; gap:7px;
    font-size:11px; font-weight:700; letter-spacing:1.2px;
    text-transform:uppercase; color:#1e6fd4;
    font-family:'JetBrains Mono',monospace;
    margin-bottom:10px;
  }
  .page-title {
    font-family:'Outfit',sans-serif;
    font-size:28px; font-weight:800;
    color:#0f172a; letter-spacing:-.5px; line-height:1.2;
  }
  .page-subtitle { font-size:14px; color:#64748b; margin-top:6px; line-height:1.6; }

  .hero-card {
    background:white;
    border:1px solid rgba(30,111,212,.1);
    border-radius:16px;
    padding:22px;
    cursor:pointer;
    transition:all .22s cubic-bezier(.22,1,.36,1);
    box-shadow:0 1px 4px rgba(30,111,212,.06), 0 4px 16px rgba(30,111,212,.04);
    position:relative; overflow:hidden;
  }
  .hero-card::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,rgba(30,111,212,.03),transparent);
    opacity:0; transition:opacity .22s;
  }
  .hero-card:hover {
    transform:translateY(-3px);
    box-shadow:0 4px 20px rgba(30,111,212,.14), 0 8px 32px rgba(30,111,212,.08);
    border-color:rgba(30,111,212,.25);
  }
  .hero-card:hover::before { opacity:1; }

  .hero-card-icon {
    width:46px; height:46px; border-radius:12px;
    display:flex; align-items:center; justify-content:center;
    font-size:22px; margin-bottom:14px;
  }
  .hero-card-title {
    font-family:'Outfit',sans-serif;
    font-size:15.5px; font-weight:700; color:#0f172a;
    margin-bottom:6px;
  }
  .hero-card-desc { font-size:12.5px; color:#64748b; line-height:1.55; margin-bottom:14px; }
  .hero-card-arrow {
    font-size:12px; font-weight:700; color:#1e6fd4;
    display:flex; align-items:center; gap:4px;
    transition:gap .15s;
  }
  .hero-card:hover .hero-card-arrow { gap:8px; }

  /* ══════════════════════════════════════════════════════
     CARDS & LAYOUT
  ══════════════════════════════════════════════════════ */
  .card {
    background: white;
    border: 1px solid rgba(30,111,212,.1);
    border-radius: var(--r);
    box-shadow: var(--shadow);
    transition: box-shadow .2s ease, transform .2s ease, border-color .2s;
  }
  .card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
    border-color: rgba(30,111,212,.2);
  }

  .section-card {
    background:white;
    border:1px solid rgba(30,111,212,.1);
    border-radius:var(--r);
    padding:22px;
    box-shadow:var(--shadow);
    margin-bottom:14px;
  }

  /* ── Inputs — light theme ── */
  .inp {
    width:100%; padding:10px 13px 10px 40px;
    background:white; border:1px solid rgba(30,111,212,.15);
    border-radius:var(--r2); font-size:13.5px; color:var(--text);
    transition:all .15s;
    box-shadow:0 1px 2px rgba(30,111,212,.04);
  }
  .inp::placeholder { color:#94a3b8; }
  .inp:focus {
    border-color:rgba(30,111,212,.5);
    box-shadow:0 0 0 3px rgba(30,111,212,.1);
  }

  .inp-plain {
    width:100%; padding:10px 13px;
    background:white; border:1px solid rgba(30,111,212,.15);
    border-radius:var(--r2); font-size:13.5px; color:var(--text);
    transition:all .15s;
    box-shadow:0 1px 2px rgba(30,111,212,.04);
  }
  .inp-plain::placeholder { color:#94a3b8; }
  .inp-plain:focus {
    border-color:rgba(30,111,212,.5);
    box-shadow:0 0 0 3px rgba(30,111,212,.1);
  }

  .textarea-plain {
    width:100%; padding:10px 13px;
    background:white; border:1px solid rgba(30,111,212,.15);
    border-radius:var(--r2); font-size:13.5px; color:var(--text);
    resize:vertical; line-height:1.65; transition:all .15s;
    box-shadow:0 1px 2px rgba(30,111,212,.04);
  }
  .textarea-plain::placeholder { color:#94a3b8; }
  .textarea-plain:focus {
    border-color:rgba(30,111,212,.5);
    box-shadow:0 0 0 3px rgba(30,111,212,.1);
  }

  /* dark-input/textarea kept for ResumeMaker compat — now light */
  .dark-input {
    width:100%; padding:10px 13px;
    background:white; border:1px solid rgba(30,111,212,.15);
    border-radius:var(--r2); font-size:13px; color:var(--text);
    min-width:0; transition:all .15s; box-sizing:border-box;
    box-shadow:0 1px 2px rgba(30,111,212,.04);
  }
  .dark-input::placeholder { color:#94a3b8; }
  .dark-input:focus {
    border-color:rgba(30,111,212,.5);
    box-shadow:0 0 0 3px rgba(30,111,212,.1);
  }
  .dark-textarea {
    width:100%; padding:10px 13px;
    background:white; border:1px solid rgba(30,111,212,.15);
    border-radius:var(--r2); font-size:13px; color:var(--text);
    resize:vertical; line-height:1.65; transition:all .15s; box-sizing:border-box;
  }
  .dark-textarea::placeholder { color:#94a3b8; }
  .dark-textarea:focus {
    border-color:rgba(30,111,212,.5);
    box-shadow:0 0 0 3px rgba(30,111,212,.1);
  }

  /* ── Buttons ── */
  .btn-primary {
    padding:10px 22px;
    background:linear-gradient(135deg,#1e6fd4,#1558b0); color:white;
    border:none; border-radius:var(--r2);
    font-size:13.5px; font-weight:700;
    cursor:pointer; transition:all .15s;
    box-shadow:0 4px 16px rgba(30,111,212,.35);
    letter-spacing:.1px;
  }
  .btn-primary:hover { box-shadow:0 6px 24px rgba(30,111,212,.5); transform:translateY(-1px); }
  .btn-primary:active { transform:scale(.98); }
  .btn-primary:disabled { opacity:.55; cursor:not-allowed; transform:none; }

  .btn-secondary {
    padding:10px 22px;
    background:var(--ocean); color:white;
    border:none; border-radius:var(--r2);
    font-size:13.5px; font-weight:600;
    cursor:pointer; transition:all .15s;
    box-shadow:0 2px 8px rgba(30,111,212,.25);
  }
  .btn-secondary:hover { background:var(--ocean-dim); }

  .btn-ghost {
    padding:9px 18px;
    background:white; border:1px solid rgba(30,111,212,.15);
    color:#475569; border-radius:var(--r2);
    font-size:13px; font-weight:500; cursor:pointer; transition:all .15s;
    box-shadow:0 1px 3px rgba(30,111,212,.05);
  }
  .btn-ghost:hover {
    border-color:rgba(30,111,212,.4);
    color:#1e6fd4;
    background:rgba(30,111,212,.05);
    box-shadow:0 2px 8px rgba(30,111,212,.1);
  }

  .btn-danger {
    padding:5px 11px;
    background:rgba(220,38,38,.06); border:1px solid rgba(220,38,38,.18);
    color:#dc2626; border-radius:6px; font-size:11.5px;
    cursor:pointer; transition:all .15s;
  }
  .btn-danger:hover { background:rgba(220,38,38,.12); }

  .btn-add {
    padding:9px 14px;
    background:rgba(30,111,212,.08); border:1px solid rgba(30,111,212,.2);
    color:var(--ocean); border-radius:var(--r2);
    font-size:13px; font-weight:600; white-space:nowrap; cursor:pointer; transition:all .15s;
  }
  .btn-add:hover { background:rgba(30,111,212,.14); }

  .btn-dashed {
    width:100%; padding:12px;
    background:rgba(30,111,212,.04); border:1.5px dashed rgba(30,111,212,.25);
    color:var(--ocean); border-radius:var(--r2);
    font-size:13px; font-weight:600; cursor:pointer; transition:all .15s;
  }
  .btn-dashed:hover { background:rgba(30,111,212,.08); border-color:rgba(30,111,212,.4); }

  /* ── Tags & Chips ── */
  .chip {
    padding:5px 13px; border-radius:20px; font-size:12.5px;
    border:1.5px solid rgba(30,111,212,.12); background:white;
    color:#64748b; transition:all .15s; cursor:pointer;
    box-shadow:0 1px 2px rgba(30,111,212,.04);
  }
  .chip:hover { border-color:var(--ocean); color:var(--ocean); }
  .chip.on { font-weight:600; background:rgba(30,111,212,.07); border-color:rgba(30,111,212,.3); color:var(--ocean); }

  .chip-btn { transition:all .15s; }
  .chip-btn:hover { opacity:.85; }

  /* ── Spinner ── */
  .spinner {
    display:inline-block; width:15px; height:15px;
    border:2px solid rgba(255,255,255,.35); border-top-color:white;
    border-radius:50%; animation:spin .65s linear infinite;
  }
  .spinner-dark {
    display:inline-block; width:14px; height:14px;
    border:2px solid rgba(30,111,212,.2); border-top-color:var(--ocean);
    border-radius:50%; animation:spin .65s linear infinite;
  }

  /* ── Label ── */
  .lbl {
    font-size:10.5px; font-weight:700; letter-spacing:1px;
    text-transform:uppercase; color:#94a3b8;
    font-family:'JetBrains Mono',monospace;
    margin-bottom:10px; display:block;
  }

  /* ── Stat card icon box ── */
  .stat-icon {
    width:46px; height:46px; border-radius:12px;
    display:flex; align-items:center; justify-content:center;
    font-size:22px; flex-shrink:0;
  }

  /* ── Progress bars ── */
  .pbar-track { height:5px; background:rgba(30,111,212,.08); border-radius:4px; overflow:hidden; }
  .pbar-fill  { height:100%; border-radius:4px; transition:width .6s ease; }

  /* ── Score ring ── */
  .score-track { fill:none; stroke:rgba(30,111,212,.08); stroke-width:8; }
  .score-fill  { fill:none; stroke-width:8; stroke-linecap:round;
    transform:rotate(-90deg); transform-origin:50% 50%;
    transition:stroke-dashoffset 1s cubic-bezier(.22,1,.36,1), stroke .3s; }
  .score-ring { animation:ringFill 1.2s cubic-bezier(.22,1,.36,1) forwards; }

  /* ── Tip box ── */
  .tip {
    padding:10px 13px; border-radius:var(--r2); font-size:12px; line-height:1.6; margin-top:12px;
    background:rgba(30,111,212,.05); border:1px solid rgba(30,111,212,.15); color:#1558b0;
  }

  /* ── Job / course card ── */
  .job-card { transition:transform .18s ease, box-shadow .18s ease; }
  .job-card:hover { transform:translateY(-2px); box-shadow:var(--shadow-md) !important; }

  /* ── Misc ── */
  .apply-btn { transition:opacity .15s; }
  .apply-btn:hover { opacity:.85; }
  .tag-remove:hover { color:var(--red) !important; }
  .add-btn:hover { background:rgba(30,111,212,.1) !important; }
  .nav-btn { transition:all .15s; cursor:pointer; }
  .nav-btn:hover { background:rgba(30,111,212,.05) !important; }
  .overlay { display: none !important; position:fixed; inset:0; background:rgba(10,22,40,.5); z-index:45; backdrop-filter:blur(4px); }
  .overlay.open { display:block; }
  .nav-active::before { content:''; position:absolute; left:0; top:50%; transform:translateY(-50%); width:3px; height:60%; border-radius:0 3px 3px 0; background:var(--ocean); }
  .resume-preview { background:white; color:#111; }

  /* ── Table ── */
  table { width:100%; border-collapse:collapse; }
  th {
    font-size:11px; font-weight:700; color:#94a3b8;
    text-transform:uppercase; letter-spacing:.7px;
    padding:10px 16px;
    background:rgba(30,111,212,.04);
    border-bottom:1px solid rgba(30,111,212,.1);
    text-align:left;
  }
  td {
    padding:12px 16px; font-size:13px; color:#334155;
    border-bottom:1px solid rgba(30,111,212,.07);
  }
  tr:hover td { background:rgba(30,111,212,.03); }

  /* ── Responsive ── */
  @media (max-width:768px) {
    .sidebar { transform:translateX(-100%); }
    .sidebar.open { transform:none; }
    .sidebar-overlay.open { display:block; }
    .content-area { margin-left:0 !important; }
    .top-bar { padding:0 12px !important; }
    .hamburger { display:flex !important; }
    .page-main { padding:16px 12px !important; }
    .two-col { grid-template-columns:1fr !important; }
    .card-grid { grid-template-columns:1fr !important; }
    .ats-cols { flex-direction:column !important; }
    .hero-title { font-size:26px !important; }
    .results-h2 { font-size:20px !important; }
    .nav-item { padding:10px 12px !important; font-size:13px !important; }
  }
  @media (max-width:480px) {
    .page-main { padding:12px 10px !important; }
    .hero-title { font-size:22px !important; }
    .card { border-radius:10px !important; }
    .section-card { padding:14px !important; border-radius:10px !important; }
    .btn-primary { padding:10px 16px !important; font-size:13px !important; }
    .btn-ghost   { padding:8px 14px !important; font-size:12px !important; }
    .inp, .inp-plain, .dark-input { font-size:14px !important; }
  }


`;

// ─── Shared UI Components ─────────────────────────────────────────────────────
export function Spinner() {
  return <span className="spinner" />;
}

export function Label({ children }) {
  return <div style={{ fontSize:10.5, fontWeight:700, color:"#374151", textTransform:"uppercase", letterSpacing:"1.2px", fontFamily:"'Geist Mono', monospace", marginBottom:10 }}>{children}</div>;
}

export function Tag({ label, color = "var(--teal)", onRemove }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 10px 5px 12px", background:`${color}18`, border:`1px solid ${color}28`, color, borderRadius:20, fontSize:12, fontWeight:500, lineHeight:1 }}>
      {label}
      {onRemove && <button onClick={onRemove} className="tag-remove" style={{ background:"none", border:"none", cursor:"pointer", color:"inherit", fontSize:14, padding:0, lineHeight:1, display:"flex", alignItems:"center", opacity:.5 }}>×</button>}
    </span>
  );
}

export function FilterChip({ label, active, onClick, color = "var(--teal)" }) {
  return (
    <button onClick={onClick} className="chip-btn"
      style={{ padding:"6px 14px", border:`1.5px solid ${active ? color : "rgba(0,0,0,.1)"}`, borderRadius:20, fontSize:12, fontWeight:active ? 600 : 500, background:active ? `${color}14` : "white", color:active ? color : "#475569", cursor:"pointer", transition:"all .15s" }}>
      {label}
    </button>
  );
}

export function MetaRow({ icon, text }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:7 }}>
      <span style={{ fontSize:12, marginTop:1, flexShrink:0 }}>{icon}</span>
      <span style={{ fontSize:12, color:"#475569", lineHeight:1.5 }}>{text}</span>
    </div>
  );
}

export function AddRow({ value, onChange, onAdd, placeholder }) {
  return (
    <div style={{ display:"flex", gap:6, marginTop:8 }}>
      <input value={value} onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onAdd()}
        placeholder={placeholder} className="dark-input" style={{ flex:1 }} />
      <button onClick={onAdd} className="btn-add">+ Add</button>
    </div>
  );
}

export function Section({ label, note, children }) {
  return (
    <div className="section-card">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <Label>{label}</Label>
        {note && <span style={{ fontSize:11, color:"#64748b" }}>{note}</span>}
      </div>
      {children}
    </div>
  );
}
