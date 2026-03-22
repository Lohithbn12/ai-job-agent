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
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Geist+Mono:wght@400;500&display=swap');

  :root {
    /* ── Deep Ocean Theme ── */

    /* Sidebar */
    --sb-bg:    #020b1a;
    --sb-bg2:   #0c1a3d;
    --sb-text:  #e2e8f0;
    --sb-text2: #94a3b8;
    --sb-border:rgba(255,255,255,.05);
    --sb-hover: rgba(59,130,246,.08);
    --sb-active:rgba(59,130,246,.15);
    --sb-width: 268px;

    /* Content — dark ocean tones */
    --bg:    #020617;
    --bg1:   #0a1628;
    --bg2:   #0c1a3d;
    --border:rgba(255,255,255,.06);
    --border2:rgba(255,255,255,.1);

    /* Brand accent — blue */
    --teal:      #3b82f6;
    --teal-dim:  #1d4ed8;
    --teal-glow: rgba(59,130,246,.15);
    --teal-soft: rgba(59,130,246,.08);
    --blue:      #3b82f6;
    --blue-dim:  #1d4ed8;

    /* Text */
    --text:  rgba(255,255,255,0.88);
    --text2: rgba(255,255,255,0.45);
    --text3: rgba(255,255,255,0.28);

    /* Status */
    --green: #22c55e;
    --red:   #f87171;
    --yellow:#fbbf24;
    --orange:#fb923c;
    --purple:#a78bfa;

    /* Shadows */
    --shadow:    0 1px 3px rgba(0,0,0,.3), 0 4px 12px rgba(0,0,0,.2);
    --shadow-md: 0 4px 16px rgba(0,0,0,.35);
    --shadow-lg: 0 8px 32px rgba(0,0,0,.45);

    --r:  14px;
    --r2: 8px;
    --topbar: 64px;
  }

  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; }
  body {
    background: #020617;
    color: var(--text);
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:6px; }
  input, button, textarea, select { font-family:inherit; }
  input:focus, textarea:focus, select:focus { outline:none; }
  a { text-decoration:none; color:inherit; }

  /* ── Animations ── */
  @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes slideIn { from{transform:translateX(-6px);opacity:0} to{transform:none;opacity:1} }

  .fade-up  { animation: fadeUp  .4s cubic-bezier(.22,1,.36,1) both; }
  .fade-in  { animation: fadeIn  .25s ease both; }
  .slide-in { animation: slideIn .3s cubic-bezier(.22,1,.36,1) both; }

  /* ── Sidebar ── */
  .sidebar {
    width: var(--sb-width);
    background: #020b1a;
    position: fixed; top:0; left:0; height:100vh; z-index:50;
    display: flex; flex-direction:column;
    transition: transform .3s cubic-bezier(.22,1,.36,1);
    box-shadow: 4px 0 32px rgba(0,0,0,.5);
    border-right: 1px solid rgba(59,130,246,.08);
  }
  .sidebar-overlay {
    display:none; position:fixed; inset:0;
    background:rgba(0,0,0,.5); backdrop-filter:blur(4px); z-index:45;
  }

  /* ── Nav items ── */
  .nav-item {
    display:flex; align-items:center; gap:12px;
    padding:10px 16px; border-radius:10px;
    font-size:13.5px; font-weight:500;
    color: var(--sb-text2);
    background: transparent;
    transition: all .15s; position:relative;
    width:100%; text-align:left; border:none; cursor:pointer;
    margin: 1px 0;
  }
  .nav-item:hover  { background:var(--sb-hover); color:var(--sb-text); }
  .nav-item.active {
    background: rgba(59,130,246,.12);
    color: #60a5fa;
    font-weight: 600;
  }
  .nav-item.active::before {
    content:''; position:absolute; left:0; top:50%;
    transform:translateY(-50%);
    width:3px; height:60%; background:#3b82f6;
    border-radius:0 3px 3px 0;
  }

  /* ── Content cards ── */
  .card {
    background: #0a1628;
    border: 1px solid rgba(255,255,255,.07);
    border-radius: var(--r);
    box-shadow: 0 2px 12px rgba(0,0,0,.3);
    transition: box-shadow .2s ease, transform .2s ease;
  }
  .card:hover { box-shadow: 0 4px 24px rgba(59,130,246,.12); transform: translateY(-1px); border-color: rgba(59,130,246,.2); }

  /* ── Inputs ── */
  .inp {
    width:100%; padding:10px 13px 10px 40px;
    background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);
    border-radius:var(--r2); font-size:13.5px; color:var(--text);
    transition:all .15s;
  }
  .inp::placeholder { color:rgba(255,255,255,.2); }
  .inp:focus { border-color:rgba(59,130,246,.6); box-shadow:0 0 0 3px rgba(59,130,246,.12); }

  .inp-plain {
    width:100%; padding:10px 13px;
    background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);
    border-radius:var(--r2); font-size:13.5px; color:var(--text);
    transition:all .15s;
  }
  .inp-plain::placeholder { color:rgba(255,255,255,.2); }
  .inp-plain:focus { border-color:rgba(59,130,246,.6); box-shadow:0 0 0 3px rgba(59,130,246,.12); }

  .textarea-plain {
    width:100%; padding:10px 13px;
    background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);
    border-radius:var(--r2); font-size:13.5px; color:var(--text);
    resize:vertical; line-height:1.65; transition:all .15s;
  }
  .textarea-plain::placeholder { color:rgba(255,255,255,.2); }
  .textarea-plain:focus { border-color:rgba(59,130,246,.6); box-shadow:0 0 0 3px rgba(59,130,246,.12); }

  /* old classes kept for compat */
  .dark-input  { width:100%; padding:10px 13px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:var(--r2); font-size:13px; color:var(--text); min-width:0; transition:all .15s; }
  .dark-input:focus  { border-color:rgba(59,130,246,.6); box-shadow:0 0 0 3px rgba(59,130,246,.12); }
  .dark-textarea { width:100%; padding:10px 13px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:var(--r2); font-size:13px; color:var(--text); resize:vertical; line-height:1.65; transition:all .15s; }
  .dark-textarea:focus { border-color:rgba(59,130,246,.6); box-shadow:0 0 0 3px rgba(59,130,246,.12); }
  .section-card { background:#0a1628; border:1px solid rgba(255,255,255,.07); border-radius:var(--r); padding:22px; box-shadow:0 2px 12px rgba(0,0,0,.3); }

  /* ── Buttons ── */
  .btn-primary {
    padding:10px 22px;
    background: linear-gradient(135deg,#3b82f6,#1d4ed8); color:white;
    border:none; border-radius:var(--r2);
    font-size:13.5px; font-weight:600;
    cursor:pointer; transition:all .15s;
    box-shadow: 0 4px 16px rgba(59,130,246,.35);
  }
  .btn-primary:hover { box-shadow:0 6px 24px rgba(59,130,246,.5); transform:translateY(-1px); }
  .btn-primary:active { transform:scale(.98); }

  .btn-secondary {
    padding:10px 22px;
    background: var(--blue); color:white;
    border:none; border-radius:var(--r2);
    font-size:13.5px; font-weight:600;
    cursor:pointer; transition:all .15s;
    box-shadow: 0 2px 8px rgba(13,148,136,.25);
  }
  .btn-secondary:hover { background:var(--blue-dim); }

  .btn-ghost {
    padding:9px 18px;
    background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);
    color:var(--text2); border-radius:var(--r2);
    font-size:13px; font-weight:500; cursor:pointer; transition:all .15s;
  }
  .btn-ghost:hover { border-color:rgba(59,130,246,.5); color:#60a5fa; background:rgba(59,130,246,.08); }

  .btn-danger {
    padding:5px 11px;
    background:rgba(220,38,38,.08); border:1px solid rgba(220,38,38,.18);
    color:var(--red); border-radius:6px; font-size:11.5px;
    cursor:pointer; transition:all .15s;
  }
  .btn-danger:hover { background:rgba(220,38,38,.14); }

  .btn-add {
    padding:9px 14px;
    background:var(--teal-soft); border:1px solid rgba(13,148,136,.2);
    color:var(--teal); border-radius:var(--r2);
    font-size:13px; font-weight:600; white-space:nowrap; cursor:pointer; transition:all .15s;
  }
  .btn-add:hover { background:var(--teal-glow); }

  .btn-dashed {
    width:100%; padding:12px;
    background:var(--bg2); border:1.5px dashed rgba(13,148,136,.3);
    color:var(--teal); border-radius:var(--r2);
    font-size:13px; font-weight:600; cursor:pointer; transition:all .15s;
  }
  .btn-dashed:hover { background:var(--teal-soft); }

  /* ── Tags & Chips ── */
  .chip {
    padding:5px 13px; border-radius:20px; font-size:12.5px;
    border:1.5px solid rgba(0,0,0,.1); background:var(--bg2);
    color:var(--text2); transition:all .15s; cursor:pointer;
  }
  .chip:hover { border-color:var(--teal); color:var(--teal); }
  .chip.on { font-weight:600; background:var(--teal-soft); border-color:rgba(13,148,136,.3); color:var(--teal); }

  /* ── Spinner ── */
  .spinner {
    display:inline-block; width:15px; height:15px;
    border:2px solid rgba(255,255,255,.3); border-top-color:white;
    border-radius:50%; animation:spin .65s linear infinite;
  }
  .spinner-dark {
    display:inline-block; width:14px; height:14px;
    border:2px solid rgba(13,148,136,.2); border-top-color:var(--teal);
    border-radius:50%; animation:spin .65s linear infinite;
  }

  /* ── Label ── */
  .lbl {
    font-size:10.5px; font-weight:700; letter-spacing:1px;
    text-transform:uppercase; color:var(--text3);
    font-family:'Geist Mono', monospace;
    margin-bottom:10px; display:block;
  }

  /* ── Stat card icon box ── */
  .stat-icon {
    width:46px; height:46px; border-radius:12px;
    display:flex; align-items:center; justify-content:center;
    font-size:22px; flex-shrink:0;
  }

  /* ── Progress bars ── */
  .pbar-track { height:4px; background:rgba(0,0,0,.06); border-radius:4px; overflow:hidden; }
  .pbar-fill  { height:100%; border-radius:4px; transition:width .6s ease; }

  /* ── Score ring ── */
  .score-track { fill:none; stroke:rgba(0,0,0,.06); stroke-width:8; }
  .score-fill  { fill:none; stroke-width:8; stroke-linecap:round;
    transform:rotate(-90deg); transform-origin:50% 50%;
    transition: stroke-dashoffset 1s cubic-bezier(.22,1,.36,1), stroke .3s; }

  /* ── Tip box ── */
  .tip { padding:10px 13px; border-radius:var(--r2); font-size:12px; line-height:1.6; margin-top:12px;
    background:rgba(13,148,136,.06); border:1px solid rgba(13,148,136,.15); color:var(--teal-dim); }

  /* ── Job/course card ── */
  .job-card { transition:transform .18s ease, box-shadow .18s ease; }
  .job-card:hover { transform:translateY(-2px); box-shadow:var(--shadow-md) !important; }

  /* ── Misc ── */
  .apply-btn { transition:opacity .15s; }
  .apply-btn:hover { opacity:.85; }
  .tag-remove:hover { color:var(--red) !important; }
  .add-btn:hover { background:var(--teal-glow) !important; }
  .nav-btn { transition:all .15s; cursor:pointer; }
  .nav-btn:hover { background:var(--bg2) !important; }
  .chip-btn { transition:all .15s; }
  .chip-btn:hover { opacity:.85; }
  .overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:45; backdrop-filter:blur(4px); }
  .overlay.open { display:block; }
  .nav-active::before { content:''; position:absolute; left:0; top:50%; transform:translateY(-50%); width:3px; height:60%; border-radius:0 3px 3px 0; background:var(--teal); }
  .score-ring { animation:ringFill 1.2s cubic-bezier(.22,1,.36,1) forwards; }
  @keyframes ringFill { from{stroke-dashoffset:283} to{stroke-dashoffset:var(--target)} }
  .resume-preview { background:white; color:#111; }

  @media (max-width:768px) {
    .sidebar { transform:translateX(-100%); }
    .sidebar.open { transform:none; }
    .sidebar-overlay.open { display:block; }
    .content-area { margin-left:0 !important; }
    .top-bar { padding:0 16px !important; }
    .hamburger { display:flex !important; }
    .page-main { padding:20px 14px !important; }
    .two-col { grid-template-columns:1fr !important; }
    .card-grid { grid-template-columns:1fr !important; }
    .ats-cols { flex-direction:column !important; }
    .hero-title { font-size:30px !important; }
    .results-h2 { font-size:22px !important; }
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
