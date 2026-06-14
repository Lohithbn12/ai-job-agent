// ─── InterviewPrep.js ──────────────────────────────────────────────────────────
// Interview Question Predictor
// Flow: Landing → Enter Role → Choose Division → Questions + Answers
// Backend scrapes GeeksforGeeks, InterviewBit, IndiaBix, PrepInsta in real time.

import React, { useState } from "react";
import axios from "axios";
import { API } from "./constants";

const DIV_CONFIG = {
  aptitude:    { label:"Aptitude",    icon:"🧮", color:"#38bdf8", bg:"rgba(56,189,248,0.1)", desc:"Quantitative, logical, probability, estimation" },
  theoretical: { label:"Theoretical", icon:"📖", color:"#a78bfa", bg:"rgba(167,139,250,0.1)", desc:"Concepts, domain knowledge, system design, trade-offs" },
  coding:      { label:"Coding",      icon:"💻", color:"#34d399", bg:"rgba(52,211,153,0.1)", desc:"DSA, SQL, Python — full solutions with complexity" },
};

const DIFF_COLOR = { Easy:"#34d399", Medium:"#f59e0b", Hard:"#fb7185" };
const DIFF_BG    = { Easy:"rgba(52,211,153,0.12)", Medium:"rgba(245,158,11,0.12)", Hard:"rgba(251,63,99,0.12)" };

const POPULAR_ROLES = [
  "Data Analyst","Data Scientist","Software Engineer","Machine Learning Engineer",
  "Product Manager","Business Analyst","Frontend Developer","Backend Developer",
  "Full Stack Developer","DevOps Engineer","Cloud Architect","QA Engineer",
  "Data Engineer","Cybersecurity Analyst","Python Developer","Java Developer",
  "React Developer","SQL Developer","Power BI Developer","UX Designer",
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InterviewPrep() {

  // ── Phase control ─────────────────────────────────────────────────────────
  // "landing"   → enter role
  // "divisions" → choose which division to load
  // "questions" → view loaded Q&A
  const [phase, setPhase]           = useState("landing");
  const [role, setRole]             = useState("");
  const [inputRole, setInputRole]   = useState("");
  const [activeDivision, setActiveDiv] = useState(null); // null = all loaded so far

  // ── Question data per division ────────────────────────────────────────────
  const [loaded, setLoaded]     = useState({});   // { aptitude: [...], theoretical: [...], coding: [...] }
  const [loadingDiv, setLoadingDiv] = useState(null);  // which division is currently fetching
  const [errors, setErrors]     = useState({});
  const [expanded, setExpanded] = useState({});
  const [bookmarked, setBm]     = useState({});
  const [searchQ, setSearchQ]   = useState("");
  const [diffFilter, setDiff]   = useState("All");

  // ── Step 1: confirm role, go to division picker ───────────────────────────
  const confirmRole = (r) => {
    const trimmed = r.trim();
    if (!trimmed) return;
    setRole(trimmed);
    setLoaded({}); setErrors({}); setExpanded({}); setBm({});
    setSearchQ(""); setDiff("All"); setActiveDiv(null);
    setPhase("divisions");
  };

  // ── Step 2: user picks a division → fetch from backend ───────────────────
  const loadDivision = async (divKey) => {
    if (loaded[divKey]) {
      // Already loaded — just switch view
      setActiveDiv(divKey);
      setPhase("questions");
      return;
    }
    setLoadingDiv(divKey);
    setErrors(p => ({ ...p, [divKey]: null }));
    try {
      const res = await axios.post(`${API}/interview-questions/`, {
        role,
        division: divKey,
      });
      const qs = res.data.questions || [];
      setLoaded(p => ({ ...p, [divKey]: qs }));
      if (qs.length === 0) {
        setErrors(p => ({ ...p, [divKey]: "No questions found for this role. Try a different name." }));
      }
    } catch (e) {
      setErrors(p => ({ ...p, [divKey]: `Failed to fetch: ${e.message}` }));
      setLoaded(p => ({ ...p, [divKey]: [] }));
    }
    setLoadingDiv(null);
    setActiveDiv(divKey);
    setPhase("questions");
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const toggle   = k => setExpanded(p => ({ ...p, [k]: !p[k] }));
  const toggleBm = k => setBm(p => ({ ...p, [k]: !p[k] }));

  const filterQs = (qs) => (qs || []).filter(q => {
    const ms = !searchQ ||
      q.q.toLowerCase().includes(searchQ.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQ.toLowerCase());
    const md = diffFilter === "All" || q.difficulty === diffFilter;
    return ms && md;
  });

  const bmCount  = Object.values(bookmarked).filter(Boolean).length;
  const allCount = Object.values(loaded).flat().length;

  // ── PDF export ────────────────────────────────────────────────────────────
  const exportPDF = () => {
    const divsForPDF = activeDivision ? [activeDivision] : Object.keys(loaded);
    const style = `<style>
      body{font-family:'Segoe UI',Arial,sans-serif;color:#0f172a;margin:36px;line-height:1.65;}
      h1{color:#0d9488;font-size:22px;border-bottom:3px solid #0d9488;padding-bottom:10px;}
      .meta{color:#64748b;font-size:12px;margin-bottom:28px;}
      h2{font-size:16px;color:#fff;padding:9px 16px;border-radius:7px;margin:26px 0 12px;}
      .apt{background:#0891b2;} .th{background:#7c3aed;} .cd{background:#059669;}
      .card{margin:12px 0;padding:14px;border:1px solid #e2e8f0;border-radius:8px;page-break-inside:avoid;}
      .qn{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;}
      .qt{font-weight:700;font-size:13.5px;margin-bottom:9px;}
      .ans{background:#f8fafc;padding:12px;border-radius:6px;font-size:12.5px;white-space:pre-wrap;border-left:3px solid #0d9488;font-family:monospace;}
      .badge{display:inline-block;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:700;margin-right:4px;}
      .Easy{background:#d1fae5;color:#065f46;} .Medium{background:#fef3c7;color:#92400e;} .Hard{background:#fee2e2;color:#991b1b;}
      .co{background:#dbeafe;color:#1e40af;} .src{background:#f3e8ff;color:#6b21a8;}
      @page{margin:20mm;}
    </style>`;

    let body = `<h1>🎯 Interview Questions: ${role}</h1>
    <div class="meta">Fetched by JobScan · ${new Date().toLocaleDateString("en-IN")} · ${allCount} questions</div>`;

    for (const dk of divsForPDF) {
      const qs = filterQs(loaded[dk] || []);
      if (!qs.length) continue;
      const cls = dk === "aptitude" ? "apt" : dk === "theoretical" ? "th" : "cd";
      body += `<h2 class="${cls}">${DIV_CONFIG[dk].icon} ${DIV_CONFIG[dk].label} — ${qs.length} questions</h2>`;
      const cards = qs.map((q, i) => {
        const company = q.company || "";
        const source  = q.source  || "";
        return `<div class="card">
          <div class="qn">Q${i+1}</div>
          <div class="qt">${q.q.replace(/</g,"&lt;")}</div>
          <span class="badge ${q.difficulty||""}">${q.difficulty||"?"}</span>
          ${company ? `<span class="badge co">🏢 ${company}</span>` : ""}
          ${source  ? `<span class="badge src">📎 ${source}</span>`  : ""}
          <div style="margin-top:9px;font-size:10px;font-weight:700;color:#0d9488;text-transform:uppercase;">Answer</div>
          <div class="ans">${q.a.replace(/</g,"&lt;")}</div>
        </div>`;
      });
      body += cards.join("");
    }

    const win = window.open("", "_blank");
    if (!win) return alert("Please allow popups to export PDF.");
    win.document.write(`<!DOCTYPE html><html><head><title>Interview Q&A — ${role}</title>${style}</head><body>${body}</body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  // ── Question card ─────────────────────────────────────────────────────────
  const QCard = ({ q, idx, dk }) => {
    const key  = `${dk}-${idx}`;
    const open = !!expanded[key];
    const bm   = !!bookmarked[key];
    const cfg  = DIV_CONFIG[dk];
    return (
      <div style={{ background:"#1c1c28", border:`1.5px solid ${open ? cfg.color+"55" : "rgba(255,255,255,0.06)"}`, borderRadius:13, marginBottom:10, overflow:"hidden", transition:"border .15s", boxShadow:open?`0 4px 20px ${cfg.color}18`:"0 2px 8px rgba(0,0,0,0.4)" }}>

        <div onClick={() => toggle(key)} style={{ padding:"14px 16px", cursor:"pointer", display:"flex", gap:12, alignItems:"flex-start" }}>
          <div style={{ minWidth:30, height:30, borderRadius:9, background:cfg.color+"18", border:`1.5px solid ${cfg.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:cfg.color, flexShrink:0, marginTop:1 }}>
            {idx+1}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:14, fontWeight:600, color:"#f1f1f5", lineHeight:1.6, marginBottom:7 }}>{q.q}</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
              {q.difficulty && <span style={{ padding:"2px 9px", background:DIFF_BG[q.difficulty]||"rgba(255,255,255,0.08)", borderRadius:5, fontSize:11, fontWeight:700, color:DIFF_COLOR[q.difficulty]||"rgba(255,255,255,0.45)" }}>{q.difficulty}</span>}
              {q.company && <span style={{ padding:"2px 9px", background:"rgba(56,189,248,0.1)", borderRadius:5, fontSize:11, fontWeight:600, color:"#38bdf8" }}>🏢 {q.company}</span>}
              {q.source  && <span style={{ padding:"2px 9px", background:"rgba(167,139,250,0.1)", borderRadius:5, fontSize:11, fontWeight:600, color:"#a78bfa" }}>📎 {q.source}</span>}
              {bm && <span style={{ fontSize:11, color:"#d97706", fontWeight:600 }}>⭐ Saved</span>}
            </div>
          </div>
          <div style={{ display:"flex", gap:5, flexShrink:0, alignItems:"center" }}>
            <button onClick={e => { e.stopPropagation(); toggleBm(key); }}
              style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, opacity:bm?1:.3, transition:"opacity .15s" }}>⭐</button>
            <div style={{ width:26, height:26, borderRadius:"50%", background:open?cfg.color:"rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:open?"white":"rgba(255,255,255,0.45)", transition:"all .18s" }}>
              {open?"▲":"▼"}
            </div>
          </div>
        </div>

        {open && (
          <div style={{ borderTop:`1.5px solid ${cfg.color}20`, background:cfg.color+"05", padding:"16px 16px 18px" }}>
            <div style={{ fontSize:11, fontWeight:700, color:cfg.color, textTransform:"uppercase", letterSpacing:".7px", marginBottom:10 }}>✓ Answer</div>
            <pre style={{ margin:0, whiteSpace:"pre-wrap", lineHeight:1.75,
              fontFamily: dk==="coding" ? "'Geist Mono','Courier New',monospace" : "inherit",
              fontSize:   dk==="coding" ? 12.5 : 13.5,
              background: dk==="coding" ? "#0d0d14" : "rgba(255,255,255,0.03)",
              color:      dk==="coding" ? "#c0caf5" : "#f1f1f5",
              padding:    dk==="coding" ? "16px" : "0",
              borderRadius: dk==="coding" ? 9 : 0, overflowX:"auto",
            }}>{q.a}</pre>
            {q.source_url && (
              <a href={q.source_url} target="_blank" rel="noreferrer"
                style={{ display:"inline-flex", alignItems:"center", gap:5, marginTop:10, fontSize:12, color:cfg.color, textDecoration:"none", opacity:.75 }}>
                🔗 {q.source_url.length>70 ? q.source_url.slice(0,70)+"…" : q.source_url}
              </a>
            )}
          </div>
        )}
      </div>
    );
  };

  // ─── PHASE: LANDING ─────────────────────────────────────────────────────
  if (phase === "landing") return (
    <div className="fade-up" style={{ maxWidth:820, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:44 }}>
        <div style={{ width:70, height:70, borderRadius:20, background:"linear-gradient(135deg,#0d9488,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:34, margin:"0 auto 18px", boxShadow:"0 8px 32px rgba(13,148,136,.3)" }}>🎯</div>
        <h1 style={{ fontSize:34, fontWeight:800, color:"rgba(255,255,255,0.92)", letterSpacing:"-.8px", marginBottom:10 }}>Interview Question Predictor</h1>
        <p style={{ fontSize:15, color:"rgba(255,255,255,0.45)", maxWidth:520, margin:"0 auto", lineHeight:1.75 }}>
          Real questions scraped live from <strong>GeeksforGeeks, InterviewBit, IndiaBix, PrepInsta</strong> — for any role you type.
        </p>
      </div>

      {/* 3 Division previews */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:36 }}>
        {Object.entries(DIV_CONFIG).map(([k,cfg]) => (
          <div key={k} style={{ background:"#0a1628", border:`2px solid ${cfg.color}22`, borderRadius:16, padding:"22px 18px", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:10 }}>{cfg.icon}</div>
            <div style={{ fontSize:15, fontWeight:800, color:"rgba(255,255,255,0.92)", marginBottom:6 }}>{cfg.label}</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.38)", lineHeight:1.6 }}>{cfg.desc}</div>
          </div>
        ))}
      </div>

      {/* Role input */}
      <div style={{ background:"#0a1628", border:"1.5px solid rgba(255,255,255,0.08)", borderRadius:18, padding:"28px", boxShadow:"0 4px 24px rgba(0,0,0,.06)", marginBottom:24 }}>
        <div style={{ fontSize:15, fontWeight:700, color:"rgba(255,255,255,0.92)", marginBottom:6 }}>Enter your target job role</div>
        <div style={{ fontSize:13, color:"rgba(255,255,255,0.38)", marginBottom:16 }}>
          You'll choose which section (Aptitude / Theoretical / Coding) to load questions for.
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <input value={inputRole} onChange={e => setInputRole(e.target.value)}
            onKeyDown={e => e.key==="Enter" && confirmRole(inputRole)}
            placeholder="e.g.  Data Analyst,  Software Engineer,  ML Engineer…"
            style={{ flex:1, padding:"13px 16px", background:"#0c1a3d", border:"1.5px solid rgba(255,255,255,0.08)", borderRadius:10, fontSize:14, color:"rgba(255,255,255,0.92)", outline:"none" }}
            onFocus={e=>{e.target.style.borderColor="var(--teal)";e.target.style.boxShadow="0 0 0 3px rgba(13,148,136,.1)";}}
            onBlur={e=>{e.target.style.borderColor="rgba(255,255,255,0.1)";e.target.style.boxShadow="none";}} />
          <button onClick={() => confirmRole(inputRole)}
            style={{ padding:"13px 28px", background:"var(--teal)", border:"none", borderRadius:10, color:"white", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 2px 10px rgba(52,211,153,.25)", flexShrink:0 }}>
            Next →
          </button>
        </div>
      </div>

      {/* Popular roles */}
      <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:12 }}>Quick select</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
        {POPULAR_ROLES.map(r => (
          <button key={r} onClick={() => confirmRole(r)}
            style={{ padding:"8px 16px", background:"#0a1628", border:"1.5px solid rgba(255,255,255,0.08)", borderRadius:22, fontSize:12.5, fontWeight:500, color:"rgba(255,255,255,0.55)", cursor:"pointer", transition:"all .15s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--teal)";e.currentTarget.style.color="var(--teal)";e.currentTarget.style.background="rgba(13,148,136,.05)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";e.currentTarget.style.color="rgba(255,255,255,0.55)";e.currentTarget.style.background="rgba(255,255,255,0.06)";}}>
            {r}
          </button>
        ))}
      </div>
    </div>
  );

  // ─── PHASE: DIVISIONS ────────────────────────────────────────────────────
  if (phase === "divisions") return (
    <div className="fade-up" style={{ maxWidth:700, margin:"0 auto" }}>
      <button onClick={() => setPhase("landing")}
        style={{ background:"none", border:"none", color:"rgba(255,255,255,0.38)", fontSize:13, cursor:"pointer", marginBottom:24, display:"flex", alignItems:"center", gap:5 }}>
        ← Change Role
      </button>

      <div style={{ textAlign:"center", marginBottom:40 }}>
        <div style={{ fontSize:13, color:"rgba(255,255,255,0.38)", marginBottom:6 }}>Generating questions for</div>
        <h2 style={{ fontSize:30, fontWeight:800, color:"rgba(255,255,255,0.92)", letterSpacing:"-.5px", marginBottom:0 }}>{role}</h2>
      </div>

      <div style={{ fontSize:15, fontWeight:700, color:"rgba(255,255,255,0.92)", textAlign:"center", marginBottom:24 }}>
        Choose a section to load questions for:
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {Object.entries(DIV_CONFIG).map(([k, cfg]) => {
          const isLoading = loadingDiv === k;
          const isDone    = !!loaded[k] && loaded[k].length > 0;
          const hasErr    = !!errors[k];

          return (
            <button key={k} onClick={() => loadDivision(k)} disabled={isLoading}
              style={{ display:"flex", alignItems:"center", gap:18, padding:"22px 24px", background:"#0a1628", border:`2px solid ${isDone ? cfg.color : hasErr ? "#fca5a5" : "rgba(0,0,0,.1)"}`, borderRadius:16, cursor:isLoading?"wait":"pointer", textAlign:"left", transition:"all .2s", boxShadow: isDone ? `0 4px 16px ${cfg.color}18` : "0 2px 8px rgba(0,0,0,.04)" }}
              onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.borderColor=cfg.color; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 6px 20px ${cfg.color}22`; }}}
              onMouseLeave={e => { e.currentTarget.style.borderColor= isDone?cfg.color:hasErr?"#fca5a5":"rgba(0,0,0,.1)"; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow= isDone?`0 4px 16px ${cfg.color}18`:"0 2px 8px rgba(0,0,0,.04)"; }}>

              <div style={{ width:56, height:56, borderRadius:16, background: isDone?cfg.color:cfg.color+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>
                {isLoading ? <div style={{ width:24, height:24, border:`3px solid ${cfg.color}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
                  : isDone ? <span style={{ color:"white", fontSize:22 }}>✓</span>
                  : cfg.icon}
              </div>

              <div style={{ flex:1 }}>
                <div style={{ fontSize:17, fontWeight:800, color:"rgba(255,255,255,0.92)", marginBottom:4 }}>{cfg.label}</div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.38)" }}>{cfg.desc}</div>
                {isDone && <div style={{ fontSize:12, color:cfg.color, fontWeight:600, marginTop:4 }}>✓ {loaded[k].length} questions ready — click to view</div>}
                {hasErr && <div style={{ fontSize:12, color:"#dc2626", marginTop:4 }}>⚠ {errors[k]}</div>}
                {isLoading && <div style={{ fontSize:12, color:cfg.color, marginTop:4, fontWeight:600 }}>Fetching from GeeksforGeeks, InterviewBit…</div>}
              </div>

              <div style={{ fontSize:13, fontWeight:600, color: isDone?cfg.color:"rgba(255,255,255,0.3)", flexShrink:0 }}>
                {isDone ? "View →" : isLoading ? "" : "Load →"}
              </div>
            </button>
          );
        })}
      </div>

      {/* CSS for spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // ─── PHASE: QUESTIONS ───────────────────────────────────────────────────
  const displayQs = filterQs(loaded[activeDivision] || []);
  const cfg = DIV_CONFIG[activeDivision] || DIV_CONFIG.theoretical;

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22, flexWrap:"wrap", gap:12 }}>
        <div>
          <button onClick={() => setPhase("divisions")}
            style={{ background:"none", border:"none", color:"rgba(255,255,255,0.38)", fontSize:13, cursor:"pointer", marginBottom:6, display:"flex", alignItems:"center", gap:5 }}>
            ← Back to Sections
          </button>
          <h2 style={{ fontSize:26, fontWeight:800, color:"rgba(255,255,255,0.92)", letterSpacing:"-.4px", marginBottom:4 }}>
            {cfg.icon} {cfg.label} — <span style={{ color:"var(--teal)" }}>{role}</span>
          </h2>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.38)" }}>
            <strong style={{ color:cfg.color }}>{(loaded[activeDivision]||[]).length}</strong> questions fetched
            {bmCount > 0 && <> · <strong style={{ color:"#d97706" }}>{bmCount}</strong> bookmarked</>}
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => { setLoaded(p => ({ ...p, [activeDivision]: undefined })); loadDivision(activeDivision); }}
            style={{ padding:"9px 16px", background:"#0a1628", border:"1.5px solid rgba(255,255,255,0.08)", borderRadius:9, color:"rgba(255,255,255,0.55)", fontSize:13, fontWeight:600, cursor:"pointer" }}>
            🔄 Refresh
          </button>
          <button onClick={exportPDF}
            style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 20px", background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.25)", borderRadius:9, color:"#f59e0b", fontSize:13, fontWeight:700, cursor:"pointer" }}>
            📄 Export PDF
          </button>
        </div>
      </div>

      {/* Other division tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {Object.entries(DIV_CONFIG).map(([k, c]) => {
          const count = (loaded[k]||[]).length;
          const active = activeDivision === k;
          return (
            <button key={k} onClick={() => { if (loaded[k]) { setActiveDiv(k); } else { setPhase("divisions"); loadDivision(k); } }}
              style={{ padding:"8px 16px", border:`2px solid ${active?c.color:"rgba(255,255,255,0.1)"}`, borderRadius:22, fontSize:13, fontWeight:active?700:500, background:active?c.color+"15":"rgba(255,255,255,0.05)", color:active?c.color:"rgba(255,255,255,0.45)", cursor:"pointer", transition:"all .15s", display:"flex", alignItems:"center", gap:6 }}>
              {c.icon} {c.label}
              {count > 0 && <span style={{ background:active?c.color+"25":"rgba(0,0,0,.06)", padding:"1px 7px", borderRadius:10, fontSize:11, color:active?c.color:"rgba(255,255,255,0.38)", fontWeight:700 }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Search + difficulty */}
      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ position:"relative", flex:1, minWidth:220 }}>
          <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:14, color:"rgba(255,255,255,0.3)", pointerEvents:"none" }}>🔍</span>
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search questions and answers…"
            style={{ width:"100%", padding:"9px 12px 9px 34px", background:"#0a1628", border:"1.5px solid rgba(255,255,255,0.08)", borderRadius:10, fontSize:13, color:"rgba(255,255,255,0.92)", outline:"none" }}
            onFocus={e=>{e.target.style.borderColor=cfg.color;}}
            onBlur={e=>{e.target.style.borderColor="rgba(255,255,255,0.1)";}} />
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {["All","Easy","Medium","Hard"].map(d => (
            <button key={d} onClick={() => setDiff(d)}
              style={{ padding:"7px 13px", border:`1.5px solid ${diffFilter===d?(DIFF_COLOR[d]||cfg.color):"rgba(255,255,255,0.08)"}`, borderRadius:8, fontSize:12, fontWeight:diffFilter===d?700:500, background:diffFilter===d?(DIFF_BG[d]||cfg.color+"14"):"rgba(255,255,255,0.05)", color:diffFilter===d?(DIFF_COLOR[d]||cfg.color):"rgba(255,255,255,0.45)", cursor:"pointer" }}>
              {d}
            </button>
          ))}
          {bmCount > 0 && (
            <button onClick={() => setDiff("bookmarks")}
              style={{ padding:"7px 13px", border:`1.5px solid ${diffFilter==="bookmarks"?"#d97706":"rgba(255,255,255,0.08)"}`, borderRadius:8, fontSize:12, fontWeight:diffFilter==="bookmarks"?700:500, background:diffFilter==="bookmarks"?"rgba(217,119,6,.08)":"rgba(255,255,255,0.05)", color:diffFilter==="bookmarks"?"#d97706":"rgba(255,255,255,0.45)", cursor:"pointer" }}>
              ⭐ Saved ({bmCount})
            </button>
          )}
        </div>
      </div>

      {/* Division header band */}
      <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", background:cfg.color+"0a", border:`1.5px solid ${cfg.color}25`, borderRadius:14, marginBottom:18 }}>
        <div style={{ width:42, height:42, borderRadius:12, background:cfg.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{cfg.icon}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:16, fontWeight:800, color:"rgba(255,255,255,0.92)" }}>{cfg.label}</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:2 }}>{cfg.desc}</div>
        </div>
        <div style={{ fontSize:12, fontWeight:700, color:cfg.color, background:cfg.color+"18", padding:"5px 14px", borderRadius:20 }}>
          {displayQs.length} Q
        </div>
      </div>

      {/* Error state */}
      {errors[activeDivision] && (loaded[activeDivision]||[]).length === 0 && (
        <div style={{ padding:"16px 18px", background:"rgba(220,38,38,.05)", border:"1.5px solid rgba(220,38,38,.15)", borderRadius:12, marginBottom:16, display:"flex", gap:12, alignItems:"flex-start" }}>
          <span style={{ fontSize:20 }}>⚠️</span>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:"#dc2626", marginBottom:4 }}>Could not fetch questions</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.38)" }}>{errors[activeDivision]}</div>
          </div>
        </div>
      )}

      {/* Questions */}
      {diffFilter === "bookmarks"
        ? (loaded[activeDivision]||[]).filter((_,i) => bookmarked[`${activeDivision}-${i}`]).map((q,i) => <QCard key={i} q={q} idx={i} dk={activeDivision} />)
        : displayQs.length > 0
          ? displayQs.map((q,i) => <QCard key={i} q={q} idx={i} dk={activeDivision} />)
          : <div style={{ textAlign:"center", padding:"50px", color:"rgba(255,255,255,0.3)" }}>
              <div style={{ fontSize:32, marginBottom:10 }}>🔍</div>
              <div style={{ fontSize:15, fontWeight:600 }}>No questions match your filter</div>
            </div>
      }
    </div>
  );
}
