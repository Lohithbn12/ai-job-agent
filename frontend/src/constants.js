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
  indeed:      { label: "Indeed",      color: "#60a5fa", dot: "#60a5fa" },
  naukri:      { label: "Naukri",      color: "#fb923c", dot: "#f97316" },
  internshala: { label: "Internshala", color: "#a78bfa", dot: "#8b5cf6" },
  foundit:     { label: "Foundit",     color: "#f472b6", dot: "#ec4899" },
  apna:        { label: "Apna",        color: "#34d399", dot: "#10b981" },
  linkedin:    { label: "LinkedIn",    color: "#38bdf8", dot: "#0ea5e9" },
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

// ─── Global CSS — Obsidian Night × Amber Ember ────────────────────────────────
export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,800&display=swap');

  :root {
    /* ── Obsidian Night × Amber Ember Theme ── */
    --obsidian: #0a0a0f;
    --void:     #0d0d14;
    --ink:      #12121c;
    --panel:    #16161f;
    --surface:  #1c1c28;
    --raise:    #222230;
    --rim:      #2a2a3d;
    --line:     rgba(255,255,255,0.06);
    --lineMd:   rgba(255,255,255,0.10);

    /* Amber accent */
    --amber:    #f59e0b;
    --ember:    #d97706;
    --gold:     #fbbf24;

    /* Semantic */
    --rose:     #fb7185;
    --mint:     #34d399;
    --sky:      #38bdf8;
    --purple:   #a78bfa;

    /* Text */
    --text:     #f1f1f5;
    --text2:    #8888a8;
    --text3:    #444460;

    /* Compat aliases used by sub-pages */
    --bg:        #0d0d14;
    --bg1:       #16161f;
    --bg2:       #1c1c28;
    --border:    rgba(255,255,255,0.06);
    --border2:   rgba(255,255,255,0.10);
    --ocean:     #f59e0b;
    --ocean-dim: #d97706;
    --ocean-glow:rgba(245,158,11,0.15);
    --ocean-soft:rgba(245,158,11,0.07);
    --teal:      #34d399;
    --teal-dim:  #10b981;
    --teal-glow: rgba(52,211,153,0.15);
    --teal-soft: rgba(52,211,153,0.08);
    --blue:      #38bdf8;
    --blue-dim:  #0ea5e9;
    --green:     #34d399;
    --red:       #fb7185;
    --yellow:    #fbbf24;
    --orange:    #fb923c;

    --shadow:    0 2px 8px rgba(0,0,0,0.4);
    --shadow-md: 0 6px 20px rgba(0,0,0,0.5);
    --shadow-lg: 0 12px 40px rgba(0,0,0,0.6);

    --r:       14px;
    --r2:      8px;
    --sb-width:268px;
    --topbar:  62px;
  }

  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; }
  body {
    background: var(--void);
    color: var(--text);
    font-family: 'Bricolage Grotesque', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12); border-radius:6px; }
  ::-webkit-scrollbar-thumb:hover { background:rgba(255,255,255,0.2); }
  input, button, textarea, select { font-family:inherit; }
  input:focus, textarea:focus, select:focus { outline:none; }
  a { text-decoration:none; color:inherit; }

  /* ── Animations ── */
  @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes slideIn { from{transform:translateX(-6px);opacity:0} to{transform:none;opacity:1} }
  @keyframes ringFill { from{stroke-dashoffset:283} to{stroke-dashoffset:var(--target)} }
  @keyframes popIn   { 0%{opacity:0;transform:scale(.88)} 70%{transform:scale(1.04)} 100%{opacity:1;transform:scale(1)} }
  @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
  @keyframes floatY  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
  @keyframes glow    { 0%,100%{box-shadow:0 0 20px rgba(245,158,11,0.2)} 50%{box-shadow:0 0 40px rgba(245,158,11,0.4)} }

  .fade-up  { animation: fadeUp  .4s cubic-bezier(.22,1,.36,1) both; }
  .fade-in  { animation: fadeIn  .25s ease both; }
  .slide-in { animation: slideIn .3s cubic-bezier(.22,1,.36,1) both; }
  .pop-in   { animation: popIn   .35s cubic-bezier(.22,1,.36,1) both; }

  .stagger-list > * { animation: fadeUp .4s cubic-bezier(.22,1,.36,1) both; }
  .stagger-list > *:nth-child(1)  { animation-delay:.04s }
  .stagger-list > *:nth-child(2)  { animation-delay:.08s }
  .stagger-list > *:nth-child(3)  { animation-delay:.12s }
  .stagger-list > *:nth-child(4)  { animation-delay:.16s }
  .stagger-list > *:nth-child(5)  { animation-delay:.20s }
  .stagger-list > *:nth-child(6)  { animation-delay:.24s }
  .stagger-list > *:nth-child(n+7){ animation-delay:.28s }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration:.01ms !important; transition-duration:.01ms !important; }
  }

  /* ══════════════════════════════════════════════════════
     SIDEBAR — Obsidian Night
  ══════════════════════════════════════════════════════ */
  .sidebar {
    width: var(--sb-width);
    position: fixed;
    top: 0; left: 0;
    height: 100vh;
    z-index: 100;
    display: flex;
    flex-direction: column;
    background: #12121c;
    border-right: 1px solid rgba(255,255,255,0.06);
    overflow: hidden;
    transition: transform .3s cubic-bezier(.22,1,.36,1);
  }
  .sidebar::-webkit-scrollbar { width:4px; }
  .sidebar::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12); border-radius:8px; }

  .sidebar-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.65); backdrop-filter:blur(4px); z-index:45; }
  .sidebar-overlay.open { display:block; }

  /* ── Brand ── */
  .sb-brand {
    display:flex; align-items:center; gap:12px;
    padding:20px 18px 16px;
    border-bottom:1px solid rgba(255,255,255,0.06);
    flex-shrink:0;
  }
  .sb-logo {
    width:38px; height:38px; border-radius:11px;
    background:linear-gradient(135deg,#f59e0b,#d97706);
    display:flex; align-items:center; justify-content:center;
    font-size:19px; flex-shrink:0;
    box-shadow:0 4px 16px rgba(245,158,11,0.35);
  }
  .sb-wordmark { font-family:'Syne',sans-serif; font-size:16px; font-weight:800; color:#f1f1f5; letter-spacing:-.4px; }
  .sb-tagline  { font-size:10px; color:#444460; margin-top:1px; letter-spacing:.5px; font-family:'DM Mono',monospace; text-transform:uppercase; }

  /* ── User card ── */
  .sb-user {
    display:flex; align-items:center; gap:12px;
    margin:14px 12px 10px;
    padding:12px 14px;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.06);
    border-radius:14px;
    transition:border-color .2s;
  }
  .sb-user:hover { border-color:rgba(255,255,255,0.10); }
  .sb-avatar {
    width:34px; height:34px; border-radius:10px;
    background:linear-gradient(135deg,#f59e0b,#d97706);
    display:flex; align-items:center; justify-content:center;
    font-size:14px; font-weight:800; color:#0a0a0f; flex-shrink:0;
    font-family:'Syne',sans-serif;
  }
  .sb-uname  { font-size:13px; font-weight:700; color:#f1f1f5; font-family:'Syne',sans-serif; }
  .sb-urole  { font-size:10px; color:#444460; margin-top:2px; font-family:'DM Mono',monospace; text-transform:uppercase; letter-spacing:.5px; }
  .sb-online-dot {
    width:8px; height:8px; border-radius:50%;
    background:#34d399; flex-shrink:0; margin-left:auto;
    box-shadow:0 0 8px rgba(52,211,153,0.6);
    animation:pulse 2.5s ease-in-out infinite;
  }

  /* ── Search ── */
  .sb-search { padding:8px 10px 4px; flex-shrink:0; }
  .sb-search-wrap {
    display:flex; align-items:center; gap:8px;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.06);
    border-radius:8px; padding:8px 12px;
    transition:all .15s;
  }
  .sb-search-wrap:focus-within {
    border-color:rgba(245,158,11,0.3);
    background:rgba(245,158,11,0.04);
  }
  .sb-search-icon { font-size:12px; opacity:.4; }
  .sb-search-wrap input { background:none; border:none; outline:none; font-size:12px; color:#8888a8; width:100%; }
  .sb-search-wrap input::placeholder { color:#444460; }

  /* ── Nav ── */
  .sb-nav {
    flex:1; overflow-y:auto; overflow-x:hidden;
    padding:8px 0 16px;
    scrollbar-width:thin; min-height:0;
  }
  .sb-nav::-webkit-scrollbar { width:4px; }
  .sb-nav::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.10); border-radius:8px; }

  .sb-section-lbl {
    font-size:9px; font-weight:700; letter-spacing:1.4px;
    text-transform:uppercase; color:#444460;
    padding:8px 10px 6px;
    font-family:'DM Mono',monospace;
  }

  .sb-nav-item {
    display:flex; align-items:center; gap:11px;
    width:calc(100% - 20px); margin:3px 10px;
    padding:10px 14px;
    border-radius:12px;
    background:none; border:1px solid transparent;
    cursor:pointer; text-align:left; position:relative;
    transition:all .18s ease;
    overflow:hidden;
  }
  .sb-nav-item:hover {
    background:rgba(255,255,255,0.04);
    border-color:rgba(255,255,255,0.06);
    transform:translateX(2px);
  }
  .sb-nav-item.active {
    background:rgba(245,158,11,0.08);
    border-color:rgba(245,158,11,0.16);
  }
  .sb-nav-item.active::before {
    content:''; position:absolute; left:0; top:50%;
    transform:translateY(-50%);
    width:3px; height:58%; background:#f59e0b;
    border-radius:0 3px 3px 0;
  }

  .sb-nav-icon {
    width:36px; height:36px; border-radius:10px;
    display:flex; align-items:center; justify-content:center;
    font-size:15px; flex-shrink:0;
    background:rgba(255,255,255,0.04);
    transition:all .18s ease;
  }
  .sb-nav-item:hover .sb-nav-icon { background:rgba(255,255,255,0.08); transform:scale(1.06); }
  .sb-nav-item.active .sb-nav-icon { background:rgba(245,158,11,0.12); box-shadow:0 0 12px rgba(245,158,11,0.2); }

  .sb-nav-label { font-size:13px; font-weight:700; color:#8888a8; font-family:'Syne',sans-serif; transition:color .15s; }
  .sb-nav-item:hover .sb-nav-label { color:#f1f1f5; }
  .sb-nav-item.active .sb-nav-label { color:#f59e0b; }

  .sb-nav-sub { font-size:10px; color:#444460; margin-top:1px; font-family:'DM Mono',monospace; }
  .sb-nav-item.active .sb-nav-sub { color:rgba(245,158,11,0.5); }

  .sb-badge { background:rgba(251,63,99,0.15); color:#fb7185; border:1px solid rgba(251,63,99,0.25); border-radius:10px; font-size:10px; font-weight:700; padding:2px 6px; flex-shrink:0; font-family:'DM Mono',monospace; }

  /* ── Steps ── */
  .sb-steps { padding:4px 10px 8px; }
  .sb-divider { height:1px; background:rgba(255,255,255,0.06); margin-bottom:12px; }
  .sb-step-title { font-size:9px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:#444460; margin-bottom:10px; font-family:'DM Mono',monospace; }
  .sb-step-row  { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
  .sb-step-num  { width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; flex-shrink:0; font-family:'DM Mono',monospace; transition:all .2s; }
  .sb-step-lbl  { font-size:12px; font-weight:600; font-family:'Syne',sans-serif; transition:color .15s; }

  /* ── Status ── */
  .sb-status {
    display:flex; align-items:center; gap:8px;
    padding:9px 14px; margin:4px 10px 6px;
    background:rgba(245,158,11,0.06);
    border:1px solid rgba(245,158,11,0.15);
    border-radius:8px; flex-shrink:0;
  }
  .sb-status-dot { width:6px; height:6px; border-radius:50%; background:#f59e0b; flex-shrink:0; animation:pulse 2s ease-in-out infinite; }
  .sb-status-txt { font-size:11px; color:#f59e0b; font-family:'DM Mono',monospace; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

  /* ── Footer ── */
  .sb-footer { padding:12px; background:#12121c; border-top:1px solid rgba(255,255,255,0.06); flex-shrink:0; }
  .sb-logout {
    width:100%; padding:10px 14px;
    background:rgba(251,63,99,0.08); border:1px solid rgba(251,63,99,0.16);
    border-radius:10px; color:#fb7185;
    font-size:13px; font-weight:700; font-family:'Syne',sans-serif; cursor:pointer;
    display:flex; align-items:center; gap:8px; justify-content:center;
    transition:all .18s;
  }
  .sb-logout:hover { background:rgba(251,63,99,0.14); border-color:rgba(251,63,99,0.28); transform:translateY(-1px); box-shadow:0 4px 14px rgba(251,63,99,0.2); }

  /* Signout button (duplicate alias) */
  .signout-btn {
    width:100%; padding:12px 14px; border:none; border-radius:12px;
    background:rgba(251,63,99,0.12); border:1px solid rgba(251,63,99,0.2);
    color:#fb7185; font-weight:700; font-size:14px; font-family:'Syne',sans-serif; cursor:pointer;
    transition:all 0.2s ease;
  }
  .signout-btn:hover { transform:translateY(-2px); box-shadow:0 6px 18px rgba(251,63,99,0.25); }

  /* ══════════════════════════════════════════════════════
     TOP BAR — Dark glass
  ══════════════════════════════════════════════════════ */
  .top-bar-left  { display:flex; align-items:center; gap:10px; }
  .top-bar-right { display:flex; align-items:center; gap:8px; }

  .topbar-divider { width:1px; height:20px; background:rgba(255,255,255,0.06); flex-shrink:0; }

  .topbar-greeting { font-size:14px; font-weight:800; color:#f1f1f5; font-family:'Syne',sans-serif; letter-spacing:-0.3px; }
  .topbar-date     { font-size:11px; color:#8888a8; margin-top:1px; font-family:'DM Mono',monospace; }

  .home-btn {
    padding:7px 11px;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.08);
    border-radius:10px; font-size:16px; cursor:pointer;
    transition:all .18s ease;
  }
  .home-btn:hover { background:rgba(245,158,11,0.08); border-color:rgba(245,158,11,0.2); transform:translateY(-1px); }

  .tb-chip {
    padding:5px 12px; border-radius:8px;
    font-size:12px; font-weight:600;
    border:1px solid rgba(255,255,255,0.06);
    background:rgba(255,255,255,0.04);
    color:#8888a8;
    display:flex; align-items:center; gap:5px;
    transition:all .15s;
  }
  .tb-chip:hover { border-color:rgba(255,255,255,0.10); color:#f1f1f5; }

  .tb-chip-clock { font-family:'DM Mono',monospace; font-size:12px; color:#f59e0b; border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.06); }
  .tb-chip-notif { cursor:pointer; }
  .tb-chip-notif:hover { background:rgba(251,63,99,0.08); border-color:rgba(251,63,99,0.2); color:#fb7185; }
  .tb-chip-mode  { background:rgba(245,158,11,0.08); border-color:rgba(245,158,11,0.2); color:#f59e0b; font-weight:700; font-family:'Syne',sans-serif; font-size:11px; text-transform:uppercase; letter-spacing:.5px; }
  .tb-chip-count { background:rgba(52,211,153,0.08); border-color:rgba(52,211,153,0.2); color:#34d399; font-weight:700; font-family:'DM Mono',monospace; }

  /* ══════════════════════════════════════════════════════
     CONTENT AREA & PAGE
  ══════════════════════════════════════════════════════ */
  .content-area { margin-left:var(--sb-width); flex:1; display:flex; flex-direction:column; min-height:100vh; background:#0d0d14; }

  .top-bar {
    height:62px; position:sticky; top:0; z-index:30;
    background:rgba(13,13,20,0.88);
    backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
    border-bottom:1px solid rgba(255,255,255,0.06);
    box-shadow:0 1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.4);
    display:flex; align-items:center; padding:0 28px;
    justify-content:space-between; flex-shrink:0;
  }

  .page-main { flex:1; padding:32px 36px; width:100%; max-width:1320px; align-self:center; box-sizing:border-box; }

  /* ══════════════════════════════════════════════════════
     HOME PAGE
  ══════════════════════════════════════════════════════ */
  .page-eyebrow {
    display:inline-flex; align-items:center; gap:7px;
    font-size:10px; font-weight:700; letter-spacing:1.5px;
    text-transform:uppercase; color:#f59e0b;
    font-family:'DM Mono',monospace;
    margin-bottom:8px;
  }
  .page-title   { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; color:#f1f1f5; letter-spacing:-.8px; line-height:1.2; }
  .page-subtitle{ font-size:14px; color:#8888a8; margin-top:6px; line-height:1.6; }

  /* Welcome banner */
  .welcome-banner {
    background:#1c1c28; border:1px solid rgba(255,255,255,0.06);
    border-radius:18px; padding:28px 32px; margin-bottom:28px;
    position:relative; overflow:hidden;
    transition:border-color .2s, box-shadow .2s;
  }
  .welcome-banner::before {
    content:''; position:absolute; top:-60px; right:-40px;
    width:260px; height:260px; border-radius:50%;
    background:radial-gradient(circle,rgba(245,158,11,0.12) 0%,transparent 70%);
    pointer-events:none;
  }
  .welcome-banner::after {
    content:''; position:absolute; bottom:-80px; left:-30px;
    width:220px; height:220px; border-radius:50%;
    background:radial-gradient(circle,rgba(56,189,248,0.06) 0%,transparent 70%);
    pointer-events:none;
  }
  .welcome-banner:hover { border-color:rgba(245,158,11,0.15); box-shadow:0 8px 40px rgba(0,0,0,0.5); }

  .welcome-badge {
    display:inline-flex; align-items:center; gap:8px;
    background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.2);
    padding:5px 12px; border-radius:20px; color:#f59e0b;
    font-size:10px; font-weight:700; font-family:'DM Mono',monospace;
    text-transform:uppercase; letter-spacing:.6px; margin-bottom:14px;
  }
  .welcome-dot { width:7px; height:7px; border-radius:50%; background:#f59e0b; animation:pulse 2s infinite; }
  .welcome-title { font-family:'Syne',sans-serif; font-size:26px; font-weight:800; color:#f1f1f5; margin-bottom:8px; letter-spacing:-.6px; }
  .welcome-subtitle { font-size:14px; color:#8888a8; line-height:1.6; }

  /* Stats grid */
  .stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px; margin-bottom:28px; }

  /* Home dashboard cards */
  .home-dashboard-card {
    background:#1c1c28; border:1px solid rgba(255,255,255,0.06);
    border-radius:14px; padding:22px; cursor:pointer;
    position:relative; overflow:hidden;
    transition:transform .28s cubic-bezier(.22,1,.36,1), box-shadow .28s ease, border-color .2s;
  }
  .home-dashboard-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:1px;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent);
  }
  .home-dashboard-card:hover { transform:translateY(-5px) scale(1.01); box-shadow:0 20px 50px rgba(0,0,0,0.5); border-color:rgba(245,158,11,0.18); }

  .home-card-icon { width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:22px; margin-bottom:14px; }
  .home-card-title { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; color:#f1f1f5; margin-bottom:6px; }
  .home-card-desc  { font-size:12px; color:#8888a8; line-height:1.55; margin-bottom:14px; }
  .hero-card-arrow { font-size:12px; font-weight:700; color:#f59e0b; display:flex; align-items:center; gap:4px; font-family:'Syne',sans-serif; transition:gap .15s; }
  .home-dashboard-card:hover .hero-card-arrow { gap:8px; }

  /* ══════════════════════════════════════════════════════
     CARDS & LAYOUT
  ══════════════════════════════════════════════════════ */
  .card {
    background:#1c1c28; border:1px solid rgba(255,255,255,0.06);
    border-radius:var(--r); box-shadow:0 4px 16px rgba(0,0,0,0.3);
    transition:box-shadow .2s ease, transform .2s ease, border-color .2s;
  }
  .card:hover { box-shadow:0 10px 32px rgba(0,0,0,0.5); transform:translateY(-2px); border-color:rgba(255,255,255,0.10); }

  .section-card {
    background:#1c1c28; border:1px solid rgba(255,255,255,0.06);
    border-radius:var(--r); padding:22px;
    box-shadow:0 2px 8px rgba(0,0,0,0.3); margin-bottom:14px;
  }

  .card-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:18px; }
  .two-col   { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .grid-2    { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
  .grid-3    { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }

  /* ── Inputs ── */
  .inp {
    width:100%; padding:10px 13px 10px 40px;
    background:#16161f; border:1px solid rgba(255,255,255,0.08);
    border-radius:var(--r2); font-size:13.5px; color:#f1f1f5;
    transition:all .15s; box-shadow:none;
  }
  .inp::placeholder { color:#444460; }
  .inp:focus { border-color:rgba(245,158,11,0.4); box-shadow:0 0 0 3px rgba(245,158,11,0.08); }

  .inp-plain {
    width:100%; padding:10px 13px;
    background:#16161f; border:1px solid rgba(255,255,255,0.08);
    border-radius:var(--r2); font-size:13.5px; color:#f1f1f5;
    transition:all .15s;
  }
  .inp-plain::placeholder { color:#444460; }
  .inp-plain:focus { border-color:rgba(245,158,11,0.4); box-shadow:0 0 0 3px rgba(245,158,11,0.08); }

  .textarea-plain {
    width:100%; padding:10px 13px;
    background:#16161f; border:1px solid rgba(255,255,255,0.08);
    border-radius:var(--r2); font-size:13.5px; color:#f1f1f5;
    resize:vertical; line-height:1.65; transition:all .15s;
  }
  .textarea-plain::placeholder { color:#444460; }
  .textarea-plain:focus { border-color:rgba(245,158,11,0.4); box-shadow:0 0 0 3px rgba(245,158,11,0.08); }

  .dark-input {
    width:100%; padding:10px 13px;
    background:#16161f; border:1px solid rgba(255,255,255,0.08);
    border-radius:var(--r2); font-size:13px; color:#f1f1f5;
    min-width:0; transition:all .15s; box-sizing:border-box;
  }
  .dark-input::placeholder { color:#444460; }
  .dark-input:hover { border-color:rgba(255,255,255,0.12); }
  .dark-input:focus { border-color:rgba(245,158,11,0.4); box-shadow:0 0 0 3px rgba(245,158,11,0.08); }

  .dark-textarea {
    width:100%; padding:10px 13px;
    background:#16161f; border:1px solid rgba(255,255,255,0.08);
    border-radius:var(--r2); font-size:13px; color:#f1f1f5;
    resize:vertical; line-height:1.65; transition:all .15s; box-sizing:border-box;
  }
  .dark-textarea::placeholder { color:#444460; }
  .dark-textarea:focus { border-color:rgba(245,158,11,0.4); box-shadow:0 0 0 3px rgba(245,158,11,0.08); }

  /* ── Buttons ── */
  .btn-primary {
    padding:10px 22px;
    background:linear-gradient(135deg,#f59e0b,#d97706); color:#0a0a0f;
    border:none; border-radius:var(--r2);
    font-size:13.5px; font-weight:800; font-family:'Syne',sans-serif;
    cursor:pointer;
    transition:transform .22s cubic-bezier(.22,1,.36,1), box-shadow .22s ease;
    box-shadow:0 4px 18px rgba(245,158,11,0.35);
    position:relative; overflow:hidden; will-change:transform;
  }
  .btn-primary::after {
    content:''; position:absolute; inset:0;
    background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.18) 50%,transparent 65%);
    transform:translateX(-100%); transition:transform .5s ease;
  }
  .btn-primary:hover::after { transform:translateX(100%); }
  .btn-primary:hover { box-shadow:0 8px 28px rgba(245,158,11,0.45); transform:translateY(-2px); }
  .btn-primary:active { transform:scale(.97) translateY(0); }
  .btn-primary:disabled { opacity:.45; cursor:not-allowed; transform:none; box-shadow:none; }

  .btn-secondary {
    padding:10px 22px;
    background:rgba(245,158,11,0.1); color:#f59e0b;
    border:1px solid rgba(245,158,11,0.2); border-radius:var(--r2);
    font-size:13.5px; font-weight:700; font-family:'Syne',sans-serif;
    cursor:pointer;
    transition:transform .2s cubic-bezier(.22,1,.36,1), box-shadow .2s ease, background .15s;
    will-change:transform;
  }
  .btn-secondary:hover { background:rgba(245,158,11,0.16); transform:translateY(-1px); box-shadow:0 5px 16px rgba(245,158,11,0.2); }
  .btn-secondary:active { transform:scale(.97); }

  .btn-ghost {
    padding:9px 18px;
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
    color:#8888a8; border-radius:var(--r2);
    font-size:13px; font-weight:700; font-family:'Syne',sans-serif; cursor:pointer;
    transition:all .18s cubic-bezier(.22,1,.36,1);
    will-change:transform;
  }
  .btn-ghost:hover { border-color:rgba(255,255,255,0.14); color:#f1f1f5; background:rgba(255,255,255,0.07); transform:translateY(-1px); }
  .btn-ghost:active { transform:scale(.97); }

  .btn-danger {
    padding:5px 11px;
    background:rgba(251,63,99,0.08); border:1px solid rgba(251,63,99,0.2);
    color:#fb7185; border-radius:6px; font-size:11.5px; font-family:'Syne',sans-serif;
    cursor:pointer; transition:background .15s, transform .15s cubic-bezier(.22,1,.36,1);
  }
  .btn-danger:hover { background:rgba(251,63,99,0.16); transform:scale(1.06) rotate(4deg); }
  .btn-danger:active { transform:scale(.96); }

  .btn-add {
    padding:9px 14px;
    background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.2);
    color:#f59e0b; border-radius:var(--r2);
    font-size:13px; font-weight:700; font-family:'Syne',sans-serif; white-space:nowrap; cursor:pointer;
    transition:background .15s, transform .18s cubic-bezier(.22,1,.36,1);
  }
  .btn-add:hover { background:rgba(245,158,11,0.16); transform:scale(1.04); }
  .btn-add:active { transform:scale(.97); }

  .btn-dashed {
    width:100%; padding:12px;
    background:rgba(245,158,11,0.04); border:1.5px dashed rgba(245,158,11,0.2);
    color:#f59e0b; border-radius:var(--r2);
    font-size:13px; font-weight:700; font-family:'Syne',sans-serif; cursor:pointer;
    transition:background .15s, border-color .15s, transform .2s cubic-bezier(.22,1,.36,1);
  }
  .btn-dashed:hover { background:rgba(245,158,11,0.08); border-color:rgba(245,158,11,0.35); transform:translateY(-1px); }
  .btn-dashed:active { transform:scale(.98); }

  /* ── Tags & Chips ── */
  .chip {
    padding:5px 13px; border-radius:20px; font-size:12.5px;
    border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04);
    color:#8888a8;
    transition:all .15s; cursor:pointer;
  }
  .chip:hover { border-color:rgba(245,158,11,0.3); color:#f59e0b; transform:translateY(-1px); }
  .chip:active { transform:scale(.96); }
  .chip.on { font-weight:700; background:rgba(245,158,11,0.1); border-color:rgba(245,158,11,0.25); color:#f59e0b; }

  .chip-btn { transition:opacity .15s, transform .15s cubic-bezier(.22,1,.36,1); }
  .chip-btn:hover { opacity:.85; transform:scale(1.04); }

  /* ── Spinner ── */
  .spinner      { display:inline-block; width:15px; height:15px; border:2px solid rgba(10,10,15,0.3); border-top-color:#0a0a0f; border-radius:50%; animation:spin .65s linear infinite; }
  .spinner-dark { display:inline-block; width:14px; height:14px; border:2px solid rgba(245,158,11,0.2); border-top-color:#f59e0b; border-radius:50%; animation:spin .65s linear infinite; }

  /* ── Label ── */
  .lbl { font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:#444460; font-family:'DM Mono',monospace; margin-bottom:10px; display:block; }

  /* ── Stat card icon box ── */
  .stat-icon { width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }

  /* ── Progress bars ── */
  .pbar-track { height:5px; background:rgba(255,255,255,0.06); border-radius:4px; overflow:hidden; }
  .pbar-fill  { height:100%; border-radius:4px; transition:width .6s ease; }

  /* ── Score ring ── */
  .score-track { fill:none; stroke:rgba(255,255,255,0.06); stroke-width:8; }
  .score-fill  { fill:none; stroke-width:8; stroke-linecap:round; transform:rotate(-90deg); transform-origin:50% 50%; transition:stroke-dashoffset 1s cubic-bezier(.22,1,.36,1),stroke .3s; }
  .score-ring  { animation:ringFill 1.2s cubic-bezier(.22,1,.36,1) forwards; }

  /* ── Tip box ── */
  .tip { padding:10px 13px; border-radius:var(--r2); font-size:12px; line-height:1.6; margin-top:12px; background:rgba(245,158,11,0.06); border:1px solid rgba(245,158,11,0.15); color:#f59e0b; }

  /* ── Job / course card ── */
  .job-card { transition:transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s ease, border-color .2s; will-change:transform; }
  .job-card:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(0,0,0,0.5) !important; border-color:rgba(255,255,255,0.10) !important; }

  /* ── Misc interactive ── */
  .apply-btn   { transition:opacity .15s, transform .18s cubic-bezier(.22,1,.36,1); }
  .apply-btn:hover { opacity:.88; transform:translateY(-1px); }
  .apply-btn:active { transform:scale(.97); }
  .tag-remove  { transition:color .12s, transform .15s; }
  .tag-remove:hover { color:#fb7185 !important; transform:scale(1.2); }
  .add-btn     { transition:background .15s, transform .15s cubic-bezier(.22,1,.36,1); }
  .add-btn:hover { background:rgba(245,158,11,0.1) !important; transform:scale(1.04); }
  .nav-btn     { transition:background .15s, transform .15s; cursor:pointer; }
  .nav-btn:hover { background:rgba(255,255,255,0.04) !important; transform:translateX(2px); }

  .overlay { display:none !important; position:fixed; inset:0; background:rgba(0,0,0,.65); z-index:45; backdrop-filter:blur(4px); }
  .overlay.open { display:block !important; }
  .nav-active::before { content:''; position:absolute; left:0; top:50%; transform:translateY(-50%); width:3px; height:60%; border-radius:0 3px 3px 0; background:#f59e0b; }
  .resume-preview { background:#16161f; color:#f1f1f5; }

  /* ── Table ── */
  table { width:100%; border-collapse:collapse; }
  th { font-size:11px; font-weight:700; color:#444460; text-transform:uppercase; letter-spacing:.7px; padding:10px 16px; background:rgba(255,255,255,0.03); border-bottom:1px solid rgba(255,255,255,0.06); text-align:left; font-family:'DM Mono',monospace; }
  td { padding:12px 16px; font-size:13px; color:#8888a8; border-bottom:1px solid rgba(255,255,255,0.04); }
  tr:hover td { background:rgba(255,255,255,0.02); }

  /* ── ATS layout ── */
  .ats-cols { display:flex; gap:20px; align-items:flex-start; width:100%; }
  .ats-cols > div:first-child { width:240px; min-width:240px; max-width:240px; flex-shrink:0; position:sticky; top:calc(62px + 16px); max-height:calc(100vh - 62px - 48px); overflow-y:auto; }
  .ats-cols > div:last-child { flex:1; min-width:0; overflow:hidden; }

  /* ── Hamburger ── */
  .hamburger { background:none; border:none; color:#8888a8; cursor:pointer; font-size:20px; display:none; padding:4px; transition:color .15s; }
  .hamburger:hover { color:#f59e0b; }

  /* ── Responsive ── */
  @media (max-width:768px) {
    .sidebar { transform:translateX(-100%); }
    .sidebar.open { transform:none; box-shadow:8px 0 40px rgba(0,0,0,.7); }
    .sidebar-overlay.open { display:block; }
    .content-area { margin-left:0 !important; }
    .top-bar { padding:0 12px !important; }
    .hamburger { display:flex !important; }
    .page-main { padding:20px 16px !important; }
    .two-col { grid-template-columns:1fr !important; }
    .card-grid { grid-template-columns:1fr !important; }
    .ats-cols { flex-direction:column !important; }
    .ats-cols > div:first-child { width:100% !important; max-width:100% !important; min-width:0 !important; position:static !important; max-height:none !important; }
    .hero-title { font-size:26px !important; }
    .results-h2 { font-size:20px !important; }
  }
  @media (max-width:480px) {
    .page-main { padding:14px 12px !important; }
    .page-title { font-size:22px !important; }
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
  return <div style={{ fontSize:10, fontWeight:700, color:"#444460", textTransform:"uppercase", letterSpacing:"1.2px", fontFamily:"'DM Mono', monospace", marginBottom:10 }}>{children}</div>;
}

export function Tag({ label, color = "var(--teal)", onRemove }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 10px 5px 12px", background:`${color}18`, border:`1px solid ${color}28`, color, borderRadius:20, fontSize:12, fontWeight:600, lineHeight:1 }}>
      {label}
      {onRemove && <button onClick={onRemove} className="tag-remove" style={{ background:"none", border:"none", cursor:"pointer", color:"inherit", fontSize:14, padding:0, lineHeight:1, display:"flex", alignItems:"center", opacity:.5 }}>×</button>}
    </span>
  );
}

export function FilterChip({ label, active, onClick, color = "var(--teal)" }) {
  return (
    <button onClick={onClick} className="chip-btn"
      style={{ padding:"6px 14px", border:`1.5px solid ${active ? color : "rgba(255,255,255,0.08)"}`, borderRadius:20, fontSize:12, fontWeight:active ? 700 : 500, background:active ? `${color}14` : "rgba(255,255,255,0.04)", color:active ? color : "#8888a8", cursor:"pointer", transition:"all .15s" }}>
      {label}
    </button>
  );
}

export function MetaRow({ icon, text }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:7 }}>
      <span style={{ fontSize:12, marginTop:1, flexShrink:0 }}>{icon}</span>
      <span style={{ fontSize:12, color:"#8888a8", lineHeight:1.5 }}>{text}</span>
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
        {note && <span style={{ fontSize:11, color:"#444460" }}>{note}</span>}
      </div>
      {children}
    </div>
  );
}
