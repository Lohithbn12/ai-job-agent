// ─── App.js ───────────────────────────────────────────────────────────────────
// Main application shell: sidebar, topbar, job search, courses, routing.
// Split from monolithic App.js into:
//   App.js         ← this file (shell + job search + courses)
//   ResumeMaker.js ← ATS score checker + 150-template builder
//   Auth.js        ← Login / Register
//   templates.js   ← 150 resume templates data
//   constants.js   ← config, CSS, shared helpers

import React, { useState, useEffect } from "react";
import axios from "axios";
import { EXP_OPTIONS, EXP_LABEL, SOURCE_CONFIG, PLATFORM_CONFIG,
         GLOBAL_CSS, API, SKILLS_PREVIEW,
         Spinner, Label, Tag, FilterChip, MetaRow, AddRow, Section } from "./constants";
import AuthWrapper from "./Auth";
import ResumeMaker from "./ResumeMaker";
import InterviewPrep from "./InterviewPrep";
import UserManagement from "./UserManagement";
import LinkedinAnalyzer from "./components/LinkedinAnalyzer";
import PortfolioGenerator from "./PortfolioGenerator";

// ── Live Clock component ──────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ fontSize:14, fontWeight:700, color:"var(--teal)", fontFamily:"'Geist Mono', 'Courier New', monospace", letterSpacing:".5px" }}>
      {time.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:true})}
    </div>
  );
}


export default function App() {
  // ── Auth state (must come before ALL other hooks) ────────────────────────
  const [authPage, setAuthPage]   = useState("login");
  const [user, setUser]           = useState(() => {
    try { return JSON.parse(localStorage.getItem("js_user")) || null; } catch { return null; }
  });

  // ── App state (always declared, regardless of auth) ───────────────────────
  const [mode, setMode]           = useState("jobs");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* Job state */
  const [file, setFile] = useState(null);
  const [roles, setRoles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [weightedSkills, setWeightedSkills] = useState([]);
  const [topSkills, setTopSkills] = useState([]);       // ← top 6-10 for search
  const [newTopSkill, setNewTopSkill] = useState("");   // ← manual add input
  const [keywordsUsed, setKwUsed] = useState([]);
  const [selectedExps, setExps] = useState(["0-1"]);
  const [locations, setLocations] = useState([{ city: "", country: "" }]);
  const [sources, setSources] = useState(["indeed", "naukri", "internshala", "foundit", "apna", "linkedin"]);
  const [jobs, setJobs] = useState([]);
  const [bySource, setBySource] = useState({});
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [status, setStatus] = useState("");
  const [newRole, setNewRole] = useState("");
  const [step, setStep] = useState(1);
  const [filterSource, setFilter] = useState("all");
  const [showAllSkills, setShowAll] = useState(false);

  /* Course state */
  const [courseKeyword, setCourseKeyword] = useState("");
  const [courses, setCourses] = useState([]);
  const [byPlatform, setByPlatform] = useState({});
  const [courseLoading, setCourseLoading] = useState(false);
  const [courseStatus, setCourseStatus] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [sortCourses, setSortCourses] = useState("platform");

  /* Handlers */
  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF resume");
    try {
      setLoading(true); setStatus("Parsing…");
      const fd = new FormData(); fd.append("file", file);
      const res = await axios.post(`${API}/upload-resume/`, fd);

      const allRoles   = (res.data.roles || []).filter((r) => r.length > 2);
      const allSkills  = (res.data.skills || []).filter((s) => s.length > 2);
      const weighted   = res.data.weighted_skills || [];

      // ── Extract top 6-10 skills by weight for search ──────────────────────
      // Sort by weight descending, pick top 8, filter noise words
      const NOISE = new Set(["time","hands","good","strong","knowledge","skills","experience","enterprise","team"]);
      const top = weighted
        .filter(w => w.weight >= 0.15 && !NOISE.has(w.skill.toLowerCase()))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 8)
        .map(w => w.skill);

      // Fallback: if weighted gives < 6, fill from flat skills list
      const topFinal = top.length >= 4 ? top : allSkills.slice(0, 8);

      setRoles(allRoles);
      setSkills(allSkills);
      setWeightedSkills(weighted);
      setTopSkills(topFinal);        // ← set top skills
      setShowAll(false);
      setStatus(allRoles.length ? `Parsed — ${allRoles.length} roles, ${topFinal.length} top skills` : "Parsed — add roles below");
      setStep(2);
    } catch { setStatus("Upload failed"); }
    finally { setLoading(false); }
  };

  const handleSearch = async () => {
    const keywords = roles.length ? [...roles] : skills.slice(0, 3);
    if (!keywords.length) return alert("Add at least one job role");
    if (!sources.length) return alert("Select at least one source");
    if (!selectedExps.length) return alert("Select an experience range");
    const locs = locations.filter((l) => l.city || l.country);
    const locStrs = locs.length ? locs.map((l) => [l.city, l.country].filter(Boolean).join(", ")) : [""];
    try {
      setSearching(true); setJobs([]); setBySource({}); setFilter("all"); setStatus("Searching…");
      const reqs = [];
      for (const exp of selectedExps)
        for (const loc of locStrs)
          // Only pass roles — no skill enrichment in query
          reqs.push(axios.post(`${API}/search-jobs/`, {
            roles, keywords: roles, experience_level: exp, location: loc, sources,
            weighted_skills: weightedSkills,
            top_skills: [],   // ← disabled: search by role name only
          }).then((r) => r.data).catch(() => ({ jobs: [], by_source: {}, keywords_used: [] })));
      const results = await Promise.all(reqs);
      const seen = new Set(), all = [];
      let lastKws = [];
      for (const r of results) {
        for (const j of r.jobs || []) { if (!seen.has(j.apply_link)) { seen.add(j.apply_link); all.push(j); } }
        if (r.keywords_used?.length) lastKws = r.keywords_used;
      }
      const bs = {};
      for (const j of all) { const k = j.source?.toLowerCase() || "other"; bs[k] = (bs[k] || 0) + 1; }
      setJobs(all); setBySource(bs); setKwUsed(lastKws);
      setStatus(`Found ${all.length} jobs`);
      setStep(3);
    } catch { setStatus("Search failed"); }
    finally { setSearching(false); }
  };

  const handleCourseSearch = async () => {
    if (!courseKeyword.trim()) return alert("Enter a keyword");
    try {
      setCourseLoading(true); setCourses([]); setByPlatform({}); setFilterPlatform("all"); setCourseStatus("Searching…");
      const res = await axios.post(`${API}/search-courses/`, { keyword: courseKeyword.trim() });
      setCourses(res.data.courses || []); setByPlatform(res.data.by_platform || {});
      setCourseStatus(`Found ${res.data.total} free courses`);
    } catch { setCourseStatus("Search failed"); }
    finally { setCourseLoading(false); }
  };

  const toggleExp = (v) => setExps((p) => p.includes(v) ? p.filter((e) => e !== v) : [...p, v]);
  const toggleSource = (s) => setSources((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);
  const addLocation = () => setLocations((p) => [...p, { city: "", country: "" }]);
  const removeLocation = (i) => setLocations((p) => p.filter((_, idx) => idx !== i));
  const updateLocation = (i, f, v) => setLocations((p) => p.map((l, idx) => idx === i ? { ...l, [f]: v } : l));
  const addRole     = () => { const r = newRole.trim(); if (r && !roles.includes(r)) setRoles((p) => [...p, r]); setNewRole(""); };
  const addTopSkill = () => { const s = newTopSkill.trim(); if (s && !topSkills.includes(s)) setTopSkills((p) => [...p, s]); setNewTopSkill(""); };

  const visibleJobs = (filterSource === "all" ? jobs : jobs.filter((j) => j.source?.toLowerCase() === filterSource))
    .slice().sort((a, b) => (a.exp_mismatch ? 1 : 0) - (b.exp_mismatch ? 1 : 0));

  // ── WhatsApp helpers ────────────────────────────────────────────────────────
  const sendJobToWhatsApp = (job) => {
    const msg =
      `💼 *${job.title || "Job Opening"}*\n` +
      `🏢 ${job.company || "Company not listed"}\n` +
      (job.location ? `📍 ${job.location}\n` : "") +
      (job.salary   ? `💰 ${job.salary}\n`   : "") +
      `🎯 Experience: ${job.exp_required || job.experience_level || "Not specified"}\n` +
      `🔗 Apply: ${job.apply_link}\n` +
      `📌 Source: ${job.source}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const sendAllJobsToWhatsApp = () => {
    const top10 = visibleJobs.slice(0, 10);
    const msg =
      `🚀 *Job Opportunities (${top10.length})*\n\n` +
      top10.map((j, i) =>
        `*${i + 1}. ${j.title}*\n` +
        `🏢 ${j.company || "—"}  📍 ${j.location || "—"}\n` +
        `🔗 ${j.apply_link}`
      ).join("\n\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };
  const filteredCourses = (filterPlatform === "all" ? courses : courses.filter((c) => c.platform === filterPlatform))
    .slice().sort((a, b) => sortCourses === "rating" ? (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0) : (a.platform || "").localeCompare(b.platform || ""));

  // All possible nav items
  const ALL_NAV = [
    { key: "jobs",      icon: "💼", label: "Job Search",      sub: step === 3 ? `${jobs.length} results` : step === 2 ? "Configure search" : "Upload resume" },
    { key: "courses",   icon: "🎓", label: "Free Courses",    sub: courseStatus || "Find learning resources" },
    { key: "ats",       icon: "📄", label: "Resume Maker",    sub: "ATS-optimized builder" },
    { key: "interview", icon: "🎯", label: "Interview Prep",  sub: "Q&A predictor · Aptitude · Coding" },
    { key: "users",     icon: "👥", label: "User Management", sub: "Roles · Permissions · Departments" },
    { key: "linkedin",  icon: "🔗", label: "LinkedIn Analyzer",sub: "Optimize your profile",},
    { key: "portfolio", icon: "🌐", label: "Portfolio Generator", sub: "Turn resume → website" },
  ];

  // Filter nav based on user level + page_permissions
  const navItems = ALL_NAV.filter(item => {
    // User Management: only level 0 admins
    if (item.key === "users") return user?.level === 0;
    // Level 0 and Level 1: see all other pages
    if (user?.level === 0 || user?.level === 1 || user?.level == null) return true;
    // Level 2: only pages in page_permissions
    return (user?.page_permissions || []).includes(item.key);
  });


  // ── Auth helpers & guard (placed after ALL hooks) ─────────────────────────
  const logout = () => {
    localStorage.removeItem("js_user");
    localStorage.removeItem("js_token");
    setUser(null);
  };

  if (!user) {
    return (
      <>
        <style dangerouslySetInnerHTML={{__html: GLOBAL_CSS}} />
        <AuthWrapper onLogin={u => setUser(u)} />
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <div style={{ display: "flex", minHeight: "100vh", background: "#020617" }}>

        {/* Overlay */}
        <div className={`overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

                {/* ══ SIDEBAR ══ */}
        <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
          {/* User Profile Card */}
          <div style={{ padding:"18px 16px 14px", background:"linear-gradient(135deg,#0c1a3d 0%,#0f2854 100%)", flexShrink:0, borderBottom:"1px solid rgba(59,130,246,.1)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:"rgba(255,255,255,.2)", border:"2px solid rgba(255,255,255,.35)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800, color:"white", flexShrink:0 }}>
                {(user?.name||user?.email||"U")[0].toUpperCase()}
              </div>
              <div style={{ minWidth:0, flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700, color:"white", lineHeight:1.2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user?.name||"User"}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,.65)", marginTop:3, textTransform:"uppercase", letterSpacing:"1px", fontWeight:600 }}>Member</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,.45)", marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user?.email}</div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div style={{ padding:"10px 14px", borderBottom:"1px solid var(--sb-border)", flexShrink:0 }}>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:13, color:"var(--sb-text2)", pointerEvents:"none" }}>🔍</span>
              <input placeholder="Search navigation..." style={{ width:"100%", padding:"8px 10px 8px 30px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.06)", borderRadius:8, fontSize:12.5, color:"var(--sb-text)", outline:"none" }}
                onFocus={e=>{e.target.style.borderColor="rgba(13,148,136,.5)";e.target.style.background="rgba(0,0,0,.06)";}}
                onBlur={e=>{e.target.style.borderColor="rgba(255,255,255,.08)";e.target.style.background="rgba(0,0,0,.07)";}} />
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex:1, padding:"12px 10px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 700, letterSpacing: "1.4px", padding: "4px 10px 10px", textTransform: "uppercase" }}>Navigation</div>
            {navItems.map((item) => (
              <button key={item.key} onClick={() => { setMode(item.key); setSidebarOpen(false); }} className="nav-btn"
                style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 14px", borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left", position: "relative", background: mode === item.key ? "rgba(13,148,136,.2)" : "transparent" }}>
                {mode === item.key && <div style={{ position: "absolute", left: 0, top: "20%", height: "60%", width: 3, background: "var(--teal)", borderRadius: "0 3px 3px 0" }} />}
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "Plus Jakarta Sans, system-ui, sans-serif", color: mode === item.key ? "#5eead4" : "var(--sb-text2)", lineHeight: 1.2 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.sub}</div>
                </div>
              </button>
            ))}

            {/* Job steps */}
            {mode === "jobs" && step > 1 && (
              <div style={{ marginTop: 10, padding: "0 8px" }}>
                <div style={{ width: "100%", height: "1px", background: "#0c1a3d", marginBottom: 14 }} />
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 700, letterSpacing: "1px", marginBottom: 10, textTransform: "uppercase" }}>Progress</div>
                {["Upload", "Configure", "Results"].map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, background: step > i + 1 ? "#22c55e" : step === i + 1 ? "var(--teal)" : "rgba(255,255,255,0.08)", color: step >= i + 1 ? "white" : "rgba(255,255,255,0.35)", boxShadow: step === i + 1 ? "0 0 0 3px rgba(13,148,136,.2)" : "none" }}>{step > i + 1 ? "✓" : i + 1}</div>
                    <span style={{ fontSize: 12, color: step === i + 1 ? "var(--teal)" : step > i + 1 ? "#22c55e" : "rgba(255,255,255,0.35)", fontWeight: step === i + 1 ? 600 : 400 }}>{s}</span>
                  </div>
                ))}
              </div>
            )}
          </nav>

          {/* Status */}
          {(status || courseStatus) && (
            <div style={{ margin: "0 10px 14px", padding: "10px 14px", background: "rgba(13,148,136,.08)", borderRadius: 10, border: "1px solid rgba(13,148,136,.2)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal)", flexShrink: 0, marginTop: 5, animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,.7)", lineHeight: 1.5 }}>{mode === "jobs" ? status : courseStatus}</span>
              </div>
            </div>
          )}
          {/* Sign Out */}
          <div style={{ padding:"12px 14px", borderTop:"1px solid var(--sb-border)", flexShrink:0 }}>
            <button onClick={logout} style={{ width:"100%", padding:"11px", background:"rgba(248,113,113,.1)", border:"1px solid rgba(248,113,113,.15)", borderRadius:10, color:"#fca5a5", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all .15s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(220,38,38,.25)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(220,38,38,.15)";}}>
              → Sign Out
            </button>
          </div>
        </aside>

        {/* ══ CONTENT ══ */}
        <div className="content-area" style={{ marginLeft: "var(--sb-width)", flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "#020617" }}>

                    {/* Topbar — dashboard greeting style */}
          <header className="top-bar" style={{ height:64, borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", padding:"0 28px", justifyContent:"space-between", background:"#020b1a", position:"sticky", top:0, zIndex:30, boxShadow:"0 1px 0 rgba(59,130,246,.08), 0 2px 16px rgba(0,0,0,.4)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <button className="hamburger" onClick={()=>setSidebarOpen(true)} style={{ display:"none", background:"none", border:"none", color:"rgba(255,255,255,0.45)", fontSize:18, cursor:"pointer", padding:4, alignItems:"center" }}>☰</button>
              {/* Greeting with emoji + time of day */}
              <span style={{ fontSize:24 }}>{new Date().getHours()<12?"🌅":new Date().getHours()<17?"☀️":"🌙"}</span>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:"rgba(255,255,255,0.92)", lineHeight:1.2 }}>
                  Good {new Date().getHours()<12?"Morning":new Date().getHours()<17?"Afternoon":"Evening"}, {user?.name?.split(" ")[0]||"there"}!
                </div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:2 }}>
                  {new Date().toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})}
                </div>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              {/* Live clock */}
              <div style={{ fontSize:15, fontWeight:700, color:"#60a5fa", fontFamily:"'Geist Mono', 'Courier New', monospace", letterSpacing:".5px", padding:"6px 14px", background:"rgba(59,130,246,.08)", borderRadius:20, border:"1px solid rgba(59,130,246,.15)" }}>
                <LiveClock />
              </div>
              {/* Current section badge */}
              <div style={{ padding:"6px 14px", background:"rgba(59,130,246,.08)", border:"1px solid rgba(59,130,246,.15)", borderRadius:20, fontSize:12, fontWeight:600, color:"#60a5fa" }}>
                {mode==="jobs"?"💼 Job Search":mode==="courses"?"🎓 Free Courses":mode==="interview"?"🎯 Interview Prep":"📄 Resume Maker"}
              </div>
              {mode==="jobs"&&step===3&&<span style={{ fontSize:12, color:"rgba(255,255,255,0.45)", fontWeight:500, padding:"6px 12px", background:"#0c1a3d", borderRadius:20 }}>{jobs.length} positions</span>}
            </div>
          </header>

          <main className="page-main" style={{ flex: 1, padding: "28px 32px", maxWidth: 1280, width: "100%", alignSelf: "center", background: "#020617" }}>

            {/* ══ JOB SEARCH ══ */}
            {mode === "jobs" && (
              <>
                {/* Step 1 */}
                {step === 1 && (
                  <div className="fade-up" style={{ maxWidth: 540, margin: "0 auto" }}>
                    <div style={{ marginBottom: 44 }}>
                      <h1 className="hero" style={{ fontFamily: "Plus Jakarta Sans, system-ui, sans-serif", fontSize: 42, fontWeight: 800, color: "rgba(255,255,255,0.92)", lineHeight: 1.08, marginBottom: 14, letterSpacing: "-1.2px" }}>
                        Find your<br />
                        <span style={{ background: "var(--teal)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>next role.</span>
                      </h1>
                      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, lineHeight: 1.75 }}>Upload your resume. We extract roles and skills, then search across 5 platforms simultaneously with experience verification.</p>
                    </div>

                    <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "48px 32px", border: "1px dashed var(--border2)", borderRadius: 20, cursor: "pointer", background: "rgba(99,102,241,.02)", transition: "all .25s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,.55)"; e.currentTarget.style.background = "rgba(99,102,241,.06)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(13,148,136,.3)"; e.currentTarget.style.background = "rgba(99,102,241,.02)"; }}>
                      <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} style={{ display: "none" }} />
                      <div style={{ width: 62, height: 62, borderRadius: 16, background: "rgba(13,148,136,.1)", border: "1px solid rgba(99,102,241,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>📄</div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: file ? "var(--teal)" : "var(--text2)", marginBottom: 5 }}>{file ? file.name : "Click to select your resume"}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>PDF files only · max 10MB</div>
                      </div>
                      {file && <div style={{ position: "absolute", top: 14, right: 14, width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />}
                    </label>

                    <button onClick={handleUpload} disabled={loading || !file}
                      style={{ marginTop: 14, width: "100%", padding: "15px", background: "var(--teal)", border: "none", borderRadius: 13, fontSize: 15, fontWeight: 700, color: "white", cursor: loading || !file ? "not-allowed" : "pointer", opacity: loading || !file ? .5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "Plus Jakarta Sans, system-ui, sans-serif", letterSpacing: "-.2px", boxShadow: "0 4px 24px rgba(13,148,136,.25)" }}>
                      {loading ? <><Spinner />Parsing resume…</> : "Parse Resume →"}
                    </button>

                    <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 28 }}>
                      {[["🎯", "Role-anchored search"], ["🛡", "2-point exp verification"], ["🔀", "5 platforms in parallel"], ["📍", "Multi-location support"]].map(([icon, text], i) => (
                        <div key={i} style={{ padding: "13px 16px", background: "#0c1a3d", border: "1.5px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12, color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 16 }}>{icon}</span><span>{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <div className="fade-up">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <h2 style={{ fontFamily: "Plus Jakarta Sans, system-ui, sans-serif", fontSize: 26, fontWeight: 800, color: "rgba(255,255,255,0.92)", letterSpacing: "-.5px", marginBottom: 5 }}>Configure Search</h2>
                        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>Edit roles and skills, set locations and experience</p>
                      </div>
                      <button onClick={() => setStep(1)} style={{ padding: "8px 18px", background: "#0c1a3d", border: "1.5px solid rgba(255,255,255,0.08)", borderRadius: 9, color: "rgba(255,255,255,0.45)", fontSize: 13, cursor: "pointer" }}>← Back</button>
                    </div>

                    <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                      <Section label="Job Roles" note="Search anchors — kept constant">
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, minHeight: 28, marginBottom: 4 }}>
                          {roles.length === 0 && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontStyle: "italic" }}>No roles detected</span>}
                          {roles.map((r, i) => <Tag key={i} label={r} color="var(--teal)" onRemove={() => setRoles((p) => p.filter((x) => x !== r))} />)}
                        </div>
                        <AddRow value={newRole} onChange={setNewRole} onAdd={addRole} placeholder="e.g. Data Analyst" />
                      </Section>

                      <Section label="Locations" note="Leave blank for all">
                        {locations.map((loc, i) => (
                          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                            <input className="dark-input" value={loc.city} onChange={e => updateLocation(i, "city", e.target.value)} placeholder="City" />
                            <input className="dark-input" value={loc.country} onChange={e => updateLocation(i, "country", e.target.value)} placeholder="Country" />
                            {locations.length > 1 && <button onClick={() => removeLocation(i)} style={{ padding: "0 10px", height: 36, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 8, color: "#f87171", cursor: "pointer", fontSize: 14, flexShrink: 0 }}>✕</button>}
                          </div>
                        ))}
                        <button onClick={addLocation} style={{ fontSize: 12, color: "var(--teal)", background: "none", border: "none", cursor: "pointer", marginTop: 2 }}>+ Add location</button>
                      </Section>

                      <Section label="Experience Range" note="Select one or more">
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {EXP_OPTIONS.map((opt) => {
                            const sel = selectedExps.includes(opt.value);
                            return (
                              <button key={opt.value} onClick={() => toggleExp(opt.value)} style={{ padding: "7px 16px", border: `1px solid ${sel ? "var(--teal)" : "rgba(255,255,255,0.07)"}`, borderRadius: 8, fontSize: 13, fontWeight: sel ? 600 : 400, background: sel ? "var(--teal-glow)" : "var(--bg2)", color: sel ? "var(--teal)" : "rgba(255,255,255,0.45)", cursor: "pointer", transition: "all .15s" }}>{sel ? "✓ " : ""}{opt.label}</button>
                            );
                          })}
                        </div>
                      </Section>
                    </div>

                    <div style={{ background: "#0a1628", border: "1.5px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
                      <Label>Job Sources</Label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {Object.entries(SOURCE_CONFIG).map(([key, cfg]) => {
                          const on = sources.includes(key);
                          return (
                            <button key={key} onClick={() => toggleSource(key)} style={{ padding: "8px 18px", border: `1px solid ${on ? cfg.dot : "rgba(255,255,255,0.08)"}`, borderRadius: 22, fontSize: 13, fontWeight: on ? 600 : 400, background: on ? `${cfg.dot}18` : "var(--bg2)", color: on ? cfg.color : "rgba(255,255,255,0.45)", cursor: "pointer", transition: "all .15s", display: "flex", alignItems: "center", gap: 7 }}>
                              {on && <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block", flexShrink: 0 }} />}
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button onClick={handleSearch} disabled={searching}
                      style={{ width: "100%", padding: "15px", background: "var(--teal)", border: "none", borderRadius: 13, fontSize: 15, fontWeight: 700, color: "white", cursor: searching ? "not-allowed" : "pointer", opacity: searching ? .6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "Plus Jakarta Sans, system-ui, sans-serif", letterSpacing: "-.2px", boxShadow: "0 4px 24px rgba(13,148,136,.25)" }}>
                      {searching ? <><Spinner />Searching…</> : "Find Jobs →"}
                    </button>
                  </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <div className="fade-in">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <h2 className="results-h2" style={{ fontFamily: "Plus Jakarta Sans, system-ui, sans-serif", fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,0.92)", letterSpacing: "-.6px", marginBottom: 8 }}>
                          <span style={{ color: "var(--teal)" }}>{jobs.length}</span> Positions Found
                        </h2>
                        {keywordsUsed.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Searched:</span>
                            {keywordsUsed.map((kw, i) => <span key={i} style={{ padding: "2px 9px", background: "var(--teal-soft)", color: "var(--teal)", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{kw}</span>)}
                          </div>
                        )}
                      </div>
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={sendAllJobsToWhatsApp} style={{ padding: "8px 16px", background: "rgba(37,211,102,.12)", border: "1.5px solid rgba(37,211,102,.3)", borderRadius: 9, color: "#25d366", fontSize: 13, fontWeight: 700, cursor: "pointer", display:"flex", alignItems:"center", gap:6 }}>
                          <span>📲</span> Send to WhatsApp
                        </button>
                        <button onClick={() => setStep(2)} style={{ padding: "8px 18px", background: "#0c1a3d", border: "1.5px solid rgba(255,255,255,0.08)", borderRadius: 9, color: "rgba(255,255,255,0.45)", fontSize: 13, cursor: "pointer" }}>← Refine</button>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
                      <FilterChip label={`All (${jobs.length})`} active={filterSource === "all"} onClick={() => setFilter("all")} color="var(--teal)" />
                      {Object.entries(bySource).filter(([, c]) => c > 0).map(([src, count]) => {
                        const cfg = SOURCE_CONFIG[src] || { label: src, color: "rgba(255,255,255,0.45)", dot: "var(--text2)" };
                        return <FilterChip key={src} label={`${cfg.label} (${count})`} active={filterSource === src} onClick={() => setFilter(src)} color={cfg.dot} />;
                      })}
                    </div>

                    {visibleJobs.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "80px 0" }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.45)", marginBottom: 6, fontFamily: "Plus Jakarta Sans, system-ui, sans-serif" }}>No results</div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Try a broader experience range or different keywords</div>
                      </div>
                    ) : (
                      <div className="card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))", gap: 14 }}>
                        {visibleJobs.map((job, i) => {
                          const sk = job.source?.toLowerCase();
                          const sc = SOURCE_CONFIG[sk] || { label: job.source, color: "rgba(255,255,255,0.45)", dot: "var(--text2)" };
                          return (
                            <div key={i} className="job-card" style={{ background: "#0a1628", border: `1px solid ${job.exp_hard_mismatch ? "rgba(220,38,38,.2)" : "rgba(255,255,255,0.07)"}`, borderRadius: 16, padding: 22, display: "flex", flexDirection: "column", animation: `fadeUp .45s ${Math.min(i * .035, .4)}s both cubic-bezier(.22,1,.36,1)` }}>
                              <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                                <span style={{ padding: "3px 10px", background: `${sc.dot}1a`, color: sc.color, borderRadius: 20, fontSize: 11, fontWeight: 700, border: `1px solid ${sc.dot}33` }}>{sc.label}</span>
                                {job.easy_apply && <span style={{ padding: "3px 10px", background: "rgba(251,191,36,.1)", color: "#fbbf24", borderRadius: 20, fontSize: 11, fontWeight: 600, border: "1px solid rgba(251,191,36,.2)" }}>⚡ Easy Apply</span>}
                              </div>
                              <h3 style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.92)", lineHeight: 1.45, marginBottom: 12, fontFamily: "Plus Jakarta Sans, system-ui, sans-serif", flex: 1 }}>{job.title || "Untitled Role"}</h3>
                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <MetaRow icon="🏢" text={job.company || "Company not listed"} />
                                {job.location && <MetaRow icon="📍" text={job.location} />}
                                {job.salary && <MetaRow icon="💰" text={job.salary} />}
                                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                  <span style={{ fontSize: 12 }}>🎯</span>
                                  <span style={{ padding: "2px 8px", background: "var(--teal-soft)", color: "var(--teal)", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{EXP_LABEL[job.experience_level] || job.experience_level}</span>
                                  {job.exp_required && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>· requires <strong style={{ color: "rgba(255,255,255,0.45)" }}>{job.exp_required}</strong></span>}
                                </div>
                              </div>
                              {job.exp_hard_mismatch && <div style={{ marginTop: 10, padding: "7px 11px", background: "rgba(220,38,38,.06)", border: "1px solid rgba(239,68,68,.18)", borderRadius: 8, fontSize: 11, color: "#fca5a5", fontWeight: 600 }}>⛔ Confirmed — requires {job.exp_required}</div>}
                              {!job.exp_hard_mismatch && job.exp_mismatch && <div style={{ marginTop: 10, padding: "7px 11px", background: "rgba(217,119,6,.06)", border: "1px solid rgba(245,158,11,.18)", borderRadius: 8, fontSize: 11, color: "#fcd34d" }}>⚠ May not match your range</div>}
                                                            {/* ── Application Success Predictor ── */}
                              {job.match && (
                                <div style={{ marginTop:12, padding:"11px 13px", background:`${job.match.bar_color}0d`, border:`1px solid ${job.match.bar_color}30`, borderRadius:10 }}>
                                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
                                    <span style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.45)" }}>🎯 Application Match</span>
                                    <span style={{ fontSize:13, fontWeight:800, color:job.match.bar_color }}>{job.match.score}%</span>
                                  </div>
                                  <div style={{ height:5, background:"rgba(0,0,0,.07)", borderRadius:4, overflow:"hidden", marginBottom:7 }}>
                                    <div style={{ height:"100%", width:`${job.match.score}%`, background:job.match.bar_color, borderRadius:4, transition:"width .8s ease" }} />
                                  </div>
                                  <div style={{ fontSize:11, fontWeight:600, color:job.match.bar_color, marginBottom:6 }}>{job.match.grade} Match</div>
                                  {job.match.matched_skills?.length > 0 && (
                                    <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:5 }}>
                                      {job.match.matched_skills.slice(0,4).map((s,i)=>(
                                        <span key={i} style={{ padding:"2px 7px", background:"rgba(5,150,105,.1)", border:"1px solid rgba(5,150,105,.2)", borderRadius:4, fontSize:10, color:"#059669", fontWeight:600 }}>✓ {s}</span>
                                      ))}
                                    </div>
                                  )}
                                  {job.match.missing_skills?.length > 0 && (
                                    <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:5 }}>
                                      {job.match.missing_skills.slice(0,3).map((s,i)=>(
                                        <span key={i} style={{ padding:"2px 7px", background:"rgba(220,38,38,.06)", border:"1px solid rgba(220,38,38,.15)", borderRadius:4, fontSize:10, color:"#dc2626", fontWeight:600 }}>✗ {s}</span>
                                      ))}
                                    </div>
                                  )}
                                  {job.match.tip && <div style={{ fontSize:10.5, color:"rgba(255,255,255,0.38)", lineHeight:1.5 }}>{job.match.tip}</div>}
                                </div>
                              )}

                              <div style={{ display:"flex", gap:8, marginTop:16 }}>
                                <button onClick={() => sendJobToWhatsApp(job)}
                                  style={{ flex:"0 0 auto", padding:"10px 14px", background:"rgba(37,211,102,.1)", border:"1px solid rgba(37,211,102,.25)", color:"#25d366", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap" }}>
                                  📲 WhatsApp
                                </button>
                                <a href={job.apply_link} target="_blank" rel="noreferrer" className="apply-btn"
                                  style={{ flex:1, display:"block", textAlign:"center", padding:"10px", background:"var(--teal)", color:"white", borderRadius:10, fontSize:13, fontWeight:700, fontFamily:"Plus Jakarta Sans, system-ui, sans-serif" }}>
                                  Apply Now →
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ══ COURSES ══ */}
            {mode === "courses" && (
              <div className="fade-up">
                <div style={{ marginBottom: 36 }}>
                  <h1 className="hero" style={{ fontFamily: "Plus Jakarta Sans, system-ui, sans-serif", fontSize: 36, fontWeight: 800, color: "rgba(255,255,255,0.92)", lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 10 }}>
                    Free <span style={{ background: "var(--teal)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Courses</span>
                  </h1>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.7 }}>Search YouTube, Coursera, edX, Simplilearn and Google — only free resources.</p>
                </div>

                <div style={{ display: "flex", gap: 0, background: "#0c1a3d", border: "1.5px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden", marginBottom: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", paddingLeft: 16, color: "rgba(255,255,255,0.45)", fontSize: 16 }}>🔍</div>
                  <input value={courseKeyword} onChange={e => setCourseKeyword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCourseSearch()} placeholder="e.g. Data Analyst, Python, Machine Learning…" style={{ flex: 1, padding: "14px 14px", background: "none", border: "none", fontSize: 14, color: "rgba(255,255,255,0.92)" }} />
                  <button onClick={handleCourseSearch} disabled={courseLoading} style={{ padding: "14px 28px", background: "var(--teal)", border: "none", fontSize: 14, fontWeight: 700, color: "white", cursor: courseLoading ? "not-allowed" : "pointer", opacity: courseLoading ? .6 : 1, display: "flex", alignItems: "center", gap: 8, fontFamily: "Plus Jakarta Sans, system-ui, sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {courseLoading ? <><Spinner />Searching…</> : "Search →"}
                  </button>
                </div>

                {courses.length > 0 && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        <FilterChip label={`All (${courses.length})`} active={filterPlatform === "all"} onClick={() => setFilterPlatform("all")} color="#22d3ee" />
                        {Object.entries(byPlatform).map(([p, c]) => {
                          const cfg = PLATFORM_CONFIG[p] || { color: "rgba(255,255,255,0.3)" };
                          return <FilterChip key={p} label={`${p} (${c})`} active={filterPlatform === p} onClick={() => setFilterPlatform(p)} color={cfg.color} />;
                        })}
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {[["platform", "Platform"], ["rating", "⭐ Rating"]].map(([k, l]) => (
                          <button key={k} onClick={() => setSortCourses(k)} style={{ padding: "6px 12px", background: sortCourses === k ? "rgba(34,211,238,.12)" : "var(--bg2)", border: `1px solid ${sortCourses === k ? "rgba(34,211,238,.35)" : "rgba(255,255,255,0.07)"}`, borderRadius: 8, fontSize: 12, color: sortCourses === k ? "#22d3ee" : "rgba(255,255,255,0.45)", cursor: "pointer" }}>{l}</button>
                        ))}
                      </div>
                    </div>

                    <div className="card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
                      {filteredCourses.map((course, i) => {
                        const pCfg = PLATFORM_CONFIG[course.platform] || { color: "rgba(255,255,255,0.45)", icon: "○" };
                        return (
                          <div key={i} className="job-card" style={{ background: "#0a1628", border: "1.5px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 22, display: "flex", flexDirection: "column", animation: `fadeUp .45s ${Math.min(i * .035, .4)}s both cubic-bezier(.22,1,.36,1)` }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                              <span style={{ padding: "3px 10px", background: `${pCfg.color}1a`, color: pCfg.color, borderRadius: 20, fontSize: 11, fontWeight: 700, border: `1px solid ${pCfg.color}33` }}>{pCfg.icon} {course.platform}</span>
                              {course.free_type && <span style={{ padding: "3px 8px", background: "rgba(34,197,94,.1)", color: "#4ade80", borderRadius: 6, fontSize: 10, fontWeight: 700, border: "1px solid rgba(74,222,128,.18)", whiteSpace: "nowrap" }}>{course.free_type}</span>}
                            </div>
                            <h3 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.92)", lineHeight: 1.5, marginBottom: 12, fontFamily: "Plus Jakarta Sans, system-ui, sans-serif", flex: 1 }}>{course.title || "Untitled Course"}</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                              {course.instructor && <MetaRow icon="👤" text={course.instructor} />}
                              {course.duration && <MetaRow icon="⏱" text={course.duration} />}
                              {course.rating && <MetaRow icon="⭐" text={course.rating} />}
                              {course.views && <MetaRow icon="👁" text={course.views} />}
                            </div>
                            <a href={course.url} target="_blank" rel="noreferrer"
                              style={{ marginTop: 16, display: "block", textAlign: "center", padding: "10px", background: `${pCfg.color}18`, border: `1px solid ${pCfg.color}40`, color: pCfg.color, borderRadius: 10, fontSize: 13, fontWeight: 700, fontFamily: "Plus Jakarta Sans, system-ui, sans-serif", transition: "background .15s" }}
                              onMouseEnter={e => e.currentTarget.style.background = `${pCfg.color}32`}
                              onMouseLeave={e => e.currentTarget.style.background = `${pCfg.color}18`}>
                              Open Course →
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {!courseStatus && (
                  <div>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Platforms covered</p>
                    <div className="card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 10 }}>
                      {Object.entries(PLATFORM_CONFIG).map(([name, cfg]) => (
                        <div key={name} style={{ padding: "20px 12px", background: "#0c1a3d", border: "1.5px solid rgba(255,255,255,0.08)", borderRadius: 12, textAlign: "center" }}>
                          <div style={{ fontSize: 22, marginBottom: 6 }}>{cfg.icon}</div>
                          <div style={{ fontSize: 11, color: cfg.color, fontWeight: 600, lineHeight: 1.3 }}>{name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!courseLoading && courses.length === 0 && courseStatus && (
                  <div style={{ textAlign: "center", padding: "70px 0" }}>
                    <div style={{ fontSize: 44, marginBottom: 14 }}>🎓</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.45)", fontFamily: "Plus Jakarta Sans, system-ui, sans-serif" }}>No courses found</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 6 }}>Try a different keyword</div>
                  </div>
                )}
              </div>
            )}

            {/* ══ ATS RESUME MAKER ══ */}
            {mode === "ats" && <ResumeMaker />}
                {mode === "interview" && <InterviewPrep />}
            {mode === "users" && <UserManagement currentUser={user} />}
            {mode === "linkedin" && <LinkedinAnalyzer />}
            {mode === "portfolio" && <PortfolioGenerator />}

          </main>
        </div>
      </div>
    </>
  );
}