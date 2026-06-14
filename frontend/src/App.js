// ─── App.js ───────────────────────────────────────────────────────────────────
// Root component — wraps everything in AppProvider, reads from global context,
// and renders layout + page views.
//
// What lives where:
//   AppContext.js      — all state (Context API + useReducer) + localStorage persistence
//   useAppHandlers.js  — all API calls; dispatches to context
//   Skeleton.js        — shimmer placeholders (replaces every raw Spinner)
//   ActivityPanel.js   — search history + recent activity dropdown

import React, { useEffect } from "react";
import axios from "axios";

// ── Global state ───────────────────────────────────────────────────────────────
import {
  AppProvider, useAppContext, A,
  useAuth, useUI, useJobsState, useCoursesState,
  useAlertsState, useNotifState, useUserStats,
} from "./context/AppContext";

// ── Constants & shared UI primitives ──────────────────────────────────────────
import {
  EXP_OPTIONS, SOURCE_CONFIG, PLATFORM_CONFIG,
  GLOBAL_CSS, API, Label, Tag, MetaRow, AddRow, Section,
} from "./constants";

// ── Config ─────────────────────────────────────────────────────────────────────
import { NAV_ALL, HOME_CARDS } from "./navConfig";

// ── Shared UI components ───────────────────────────────────────────────────────
import StatCard from "./components/StatCard";
import Sidebar  from "./components/Sidebar";
import TopBar   from "./components/TopBar";

// ── Skeleton loaders (replaces all raw Spinner usages) ────────────────────────
import {
  StatCardSkeleton,
  JobGridSkeleton,
  CourseGridSkeleton,
  AlertItemSkeleton,
  NotifItemSkeleton,
  ResumeUploadSkeleton,
} from "./components/Skeleton";

// ── Business logic hook ────────────────────────────────────────────────────────
import useAppHandlers from "./hooks/useAppHandlers";

// ── Sub-pages ──────────────────────────────────────────────────────────────────
import AuthWrapper        from "./Auth";
import ResumeMaker        from "./ResumeMaker";
import InterviewPrep      from "./InterviewPrep";
import UserManagement     from "./UserManagement";
import LinkedinAnalyzer   from "./components/LinkedinAnalyzer";
import PortfolioGenerator from "./PortfolioGenerator";
import StockPredictor     from "./StockPredictor";

// ── Colour tokens ──────────────────────────────────────────────────────────────
const C = {
  ocean:    "#f59e0b",
  sapphire: "#38bdf8",
  teal:     "#34d399",
  border:   "rgba(255,255,255,0.06)",
  borderMd: "rgba(255,255,255,0.10)",
};

// ─────────────────────────────────────────────────────────────────────────────
// Root export — wraps inner app in the context provider
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <AppInner />
    </AppProvider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AppInner — reads from context, no local state except auth session check
// ─────────────────────────────────────────────────────────────────────────────
function AppInner() {
  const { state, dispatch } = useAppContext();
  const { user, sessionChecked } = useAuth();
  const { mode, sidebarOpen }    = useUI();
  const jobs      = useJobsState();
  const courses   = useCoursesState();
  const alerts    = useAlertsState();
  const notifs    = useNotifState();
  const userStats = useUserStats();

  const h = useAppHandlers();

  // ── Session restore on mount ──────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("js_token");
    if (!token) { dispatch({ type: A.SESSION_CHECKED }); return; }
    axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => dispatch({ type: A.SET_USER, payload: res.data }))
      .catch(() => { localStorage.removeItem("js_token"); localStorage.removeItem("js_user"); })
      .finally(() => dispatch({ type: A.SESSION_CHECKED }));
  }, []); // eslint-disable-line

  // ── Polling: stats + notif count every 30s ────────────────────────────────
  useEffect(() => {
    if (!user) return;
    h.fetchUserStats();
    h.fetchMyAlerts();
    h.fetchNotificationCount();
    const iv = setInterval(() => {
      h.fetchUserStats();
      h.fetchNotificationCount();
    }, 30000);
    return () => clearInterval(iv);
  }, [user]); // eslint-disable-line

  // ── Fetch notifications when alerts tab opens ─────────────────────────────
  useEffect(() => {
    if (mode === "alerts" && user) {
      h.fetchNotifications();
      h.fetchMyAlerts();
    }
  }, [mode]); // eslint-disable-line

  // ── Helpers ───────────────────────────────────────────────────────────────
  const setMode    = (m) => dispatch({ type: A.SET_MODE,    payload: m });
  const setSidebar = (v) => dispatch({ type: A.SET_SIDEBAR, payload: v });
  const logout = () => {
    localStorage.removeItem("js_user");
    localStorage.removeItem("js_token");
    dispatch({ type: A.SET_USER, payload: null });
    dispatch({ type: A.SESSION_CHECKED });
  };

  // ── Nav items filtered by user role ───────────────────────────────────────
  const navItems = NAV_ALL.filter(item => {
    if (item.key === "users") return user?.level === 0;
    if (user?.level === 0 || user?.level === 1 || user?.level == null) return true;
    return (user?.page_permissions || []).includes(item.key);
  }).map(item => ({
    ...item,
    sub: item.key === "jobs"
      ? (jobs.step === 3 ? `${jobs.results.length} results` : jobs.step === 2 ? "Configure search" : "Upload resume")
      : item.key === "courses" ? (courses.status || "Find free courses")
      : item.sub,
  }));

  // ── Greeting ──────────────────────────────────────────────────────────────
  const hour       = new Date().getHours();
  const greeting   = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const greetEmoji = hour < 12 ? "🌅" : hour < 17 ? "☀️" : "🌙";
  const firstName  = user?.name?.split(" ")[0] || "there";

  // ── Loading splash ────────────────────────────────────────────────────────
  if (!sessionChecked) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"#0a0a0f", flexDirection:"column", gap:20 }}>
      <div style={{ width:48, height:48, borderRadius:14, background:"linear-gradient(135deg,#f59e0b,#d97706)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, animation:"floatUp 2s ease-in-out infinite" }}>⚡</div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"rgba(245,158,11,0.5)", letterSpacing:"3px", textTransform:"uppercase" }}>Loading…</div>
    </div>
  );

  // ── Auth gate ─────────────────────────────────────────────────────────────
  if (!user) return <AuthWrapper onLogin={u => dispatch({ type: A.SET_USER, payload: u })} />;

  // ── App shell ─────────────────────────────────────────────────────────────
  return (
    <div className="app-container">
      <div className={`overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebar(false)} />

      <Sidebar
        user={user}
        mode={mode}
        setMode={setMode}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebar}
        step={jobs.step}
        status={jobs.status}
        courseStatus={courses.status}
        notificationCount={notifs.count}
        navItems={navItems}
        logout={logout}
      />

      <div className="content-area">
        <TopBar
          mode={mode}
          setMode={setMode}
          setSidebarOpen={setSidebar}
          greeting={greeting}
          greetEmoji={greetEmoji}
          firstName={firstName}
          notificationCount={notifs.count}
          jobs={jobs.results}
          step={jobs.step}
        />

        <main className="page-main">

          {/* ── HOME ──────────────────────────────────────────────────────── */}
          {mode === "home" && (
            <div className="fade-up">
              <div className="welcome-banner">
                <div className="welcome-badge"><span className="welcome-dot" />AI Career Platform</div>
                <h1 className="welcome-title">Welcome back, {firstName} 👋</h1>
                <p className="welcome-subtitle">Your complete AI-powered career suite — job search, resume, interview prep and more.</p>
              </div>

              {/* Stat cards — skeleton while stats are 0/loading */}
              <div className="stats-grid">
                {userStats.total_users === 0 && userStats.online_count === 0 ? (
                  [0,1,2,3].map(i => <StatCardSkeleton key={i} />)
                ) : (
                  <>
                    <StatCard label="Total Users" value={userStats.total_users || "—"} icon="👥" color={C.ocean} />
                    <StatCard label="Online Now"  value={userStats.online_count || "—"} icon="🟢" color={C.teal} />
                    <StatCard label="Jobs Found"  value={jobs.results.length || "—"} icon="💼" color="#7c3aed" />
                    <StatCard label="Courses"     value={courses.results.length || "—"} icon="🎓" color={C.sapphire} />
                  </>
                )}
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:16 }}>
                {HOME_CARDS.map((card, i) => (
                  <div key={i} className="home-dashboard-card" onClick={() => setMode(card.key)}
                    style={{ animation:`fadeUp 0.4s ${i*0.05}s both cubic-bezier(0.22,1,0.36,1)` }}>
                    <div className="home-card-icon" style={{ background:card.bg, border:`1px solid ${card.border}` }}>{card.icon}</div>
                    <div className="home-card-title">{card.title}</div>
                    <div className="home-card-desc">{card.desc}</div>
                    <div className="hero-card-arrow">Open &nbsp;→</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── JOB SEARCH ────────────────────────────────────────────────── */}
          {mode === "jobs" && (
            <>
              {/* Step 1 — Upload */}
              {jobs.step === 1 && (
                <div className="fade-up" style={{ maxWidth:540, margin:"0 auto" }}>
                  {jobs.loading ? (
                    // ── Skeleton while resume is being parsed ──────────────
                    <ResumeUploadSkeleton />
                  ) : (
                    <>
                      <div className="page-eyebrow" style={{ marginBottom:20 }}>Step 01 · Upload</div>
                      <h1 className="page-title" style={{ marginBottom:12 }}>
                        Find your<br />
                        <span style={{ background:"linear-gradient(135deg,#f59e0b,#fbbf24)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>next role.</span>
                      </h1>
                      <p className="page-subtitle" style={{ marginBottom:36 }}>Upload your resume. We extract roles &amp; skills, then search 5 platforms simultaneously.</p>

                      <label style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16, padding:"52px 36px", border:`2px dashed ${jobs.file ? "#f59e0b" : "rgba(245,158,11,0.2)"}`, borderRadius:16, cursor:"pointer", background:jobs.file?"rgba(245,158,11,0.06)":"rgba(255,255,255,0.02)", transition:"all .2s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor="#f59e0b"; e.currentTarget.style.background="rgba(245,158,11,0.04)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor=jobs.file?"#f59e0b":"rgba(245,158,11,0.2)"; e.currentTarget.style.background=jobs.file?"rgba(245,158,11,0.06)":"rgba(255,255,255,0.02)"; }}>
                        <input type="file" accept=".pdf" onChange={e => dispatch({ type: A.SET_JOB_FILE, payload: e.target.files[0] })} style={{ display:"none" }} />
                        <div style={{ width:60, height:60, borderRadius:16, background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.18)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>📄</div>
                        <div style={{ textAlign:"center" }}>
                          <div style={{ fontSize:15, fontWeight:600, color:jobs.file?"#f59e0b":"#64748b", marginBottom:4 }}>{jobs.file ? jobs.file.name : "Click to select your resume"}</div>
                          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10.5, color:"#444460", letterSpacing:"0.5px" }}>PDF only · Max 10 MB</div>
                        </div>
                      </label>

                      <button onClick={h.handleUpload} disabled={!jobs.file} className="btn-primary"
                        style={{ marginTop:14, width:"100%", padding:15, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                        Parse Resume →
                      </button>

                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:28 }}>
                        {[["🎯","Role-anchored search"],["🛡","2-point exp verification"],["🔀","5 platforms in parallel"],["📍","Multi-location support"]].map(([icon,text],i) => (
                          <div key={i} style={{ padding:"12px 14px", background:"#1c1c28", border:`1px solid ${C.border}`, borderRadius:10, fontSize:12, color:"#8888a8", display:"flex", alignItems:"center", gap:10, boxShadow:"0 1px 3px rgba(245,158,11,0.04)" }}>
                            <span>{icon}</span><span>{text}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 2 — Configure */}
              {jobs.step === 2 && (
                <div className="fade-up">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, flexWrap:"wrap", gap:12 }}>
                    <div>
                      <div className="page-eyebrow">Step 02 · Configure</div>
                      <h2 className="page-title">Configure Search</h2>
                      <p className="page-subtitle">Edit roles, set locations and experience levels</p>
                    </div>
                    <button className="btn-ghost" onClick={() => dispatch({ type: A.SET_JOB_STEP, payload: 1 })}>← Back</button>
                  </div>

                  <div className="two-col" style={{ marginBottom:16 }}>
                    <Section label="Job Roles" note="Search anchors — kept constant">
                      <div style={{ display:"flex", flexWrap:"wrap", gap:6, minHeight:28, marginBottom:4 }}>
                        {jobs.roles.length === 0 && <span style={{ fontSize:12, color:"#444460", fontStyle:"italic" }}>No roles detected</span>}
                        {jobs.roles.map((r, i) => <Tag key={i} label={r} color={C.ocean} onRemove={() => h.removeRole(r)} />)}
                      </div>
                      <AddRow value={jobs.newRole} onChange={v => dispatch({ type: A.SET_NEW_ROLE, payload: v })} onAdd={h.addRole} placeholder="e.g. Data Analyst" />
                    </Section>

                    <Section label="Locations" note="Leave blank for all India">
                      {jobs.locations.map((loc, i) => (
                        <div key={i} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"center" }}>
                          <input className="dark-input" value={loc.city} onChange={e => h.updateLocation(i,"city",e.target.value)} placeholder="City" />
                          <input className="dark-input" value={loc.country} onChange={e => h.updateLocation(i,"country",e.target.value)} placeholder="Country" />
                          {jobs.locations.length > 1 && (
                            <button onClick={() => h.removeLocation(i)} style={{ padding:"0 10px", height:38, background:"rgba(225,29,72,0.06)", border:"1px solid rgba(225,29,72,0.2)", borderRadius:8, color:"#e11d48", cursor:"pointer", fontSize:14, flexShrink:0 }}>✕</button>
                          )}
                        </div>
                      ))}
                      <button onClick={h.addLocation} style={{ fontSize:12, color:"#f59e0b", background:"none", border:"none", cursor:"pointer", marginTop:2, fontWeight:600 }}>+ Add location</button>
                    </Section>

                    <Section label="Experience Range" note="Select one or more">
                      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                        {EXP_OPTIONS.map(opt => {
                          const sel = jobs.selectedExps.includes(opt.value);
                          return (
                            <button key={opt.value} onClick={() => h.toggleExp(opt.value)}
                              style={{ padding:"7px 16px", borderRadius:8, border:`1px solid ${sel?"#f59e0b":"rgba(255,255,255,0.08)"}`, fontSize:13, fontWeight:sel?700:500, background:sel?"rgba(245,158,11,0.1)":"rgba(255,255,255,0.04)", color:sel?"#f59e0b":"#8888a8", cursor:"pointer", transition:"all .15s" }}>
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </Section>
                  </div>

                  <div style={{ background:"#1c1c28", border:`1px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:20, boxShadow:"0 1px 3px rgba(245,158,11,0.04)" }}>
                    <Label>Job Sources</Label>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:10 }}>
                      {Object.entries(SOURCE_CONFIG).map(([key, cfg]) => {
                        const on = jobs.sources.includes(key);
                        return (
                          <button key={key} onClick={() => h.toggleSource(key)}
                            style={{ padding:"8px 18px", borderRadius:20, border:`1px solid ${on?cfg.dot:"rgba(255,255,255,0.08)"}`, fontSize:13, fontWeight:on?700:500, background:on?`${cfg.dot}18`:"rgba(255,255,255,0.04)", color:on?cfg.color:"#8888a8", cursor:"pointer", transition:"all .15s", display:"flex", alignItems:"center", gap:7 }}>
                            {on && <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dot, display:"inline-block" }} />}
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button onClick={h.handleSearch} disabled={jobs.searching} className="btn-primary"
                    style={{ width:"100%", padding:15, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                    {jobs.searching ? "Searching…" : "Find Jobs →"}
                  </button>
                </div>
              )}

              {/* Step 3 — Results */}
              {jobs.step === 3 && (
                <div className="fade-in">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, flexWrap:"wrap", gap:12 }}>
                    <div>
                      <div className="page-eyebrow">Step 03 · Results</div>
                      <h2 className="page-title">
                        <span style={{ fontFamily:"'JetBrains Mono',monospace", color:"#f59e0b", fontWeight:500 }}>{jobs.results.length}</span> Positions Found
                      </h2>
                      {jobs.keywordsUsed?.length > 0 && (
                        <div style={{ display:"flex", flexWrap:"wrap", gap:6, alignItems:"center", marginTop:8 }}>
                          <span style={{ fontSize:11, color:"#444460", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px" }}>Searched:</span>
                          {jobs.keywordsUsed.map((kw,i) => (
                            <span key={i} style={{ padding:"2px 9px", background:"rgba(245,158,11,0.1)", color:"#f59e0b", borderRadius:6, fontSize:11, fontWeight:700, border:"1px solid rgba(245,158,11,0.2)" }}>{kw}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={() => h.sendAllJobsToWhatsApp(h.visibleJobs)} style={{ padding:"9px 16px", background:"rgba(37,211,102,0.08)", border:"1px solid rgba(37,211,102,0.25)", borderRadius:9, color:"#16a34a", fontSize:13, fontWeight:700, cursor:"pointer" }}>📲 WhatsApp</button>
                      <button className="btn-ghost" onClick={() => dispatch({ type: A.SET_JOB_STEP, payload: 2 })}>← Refine</button>
                    </div>
                  </div>

                  {/* Source filter pills */}
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:24 }}>
                    {[["all",`All (${jobs.results.length})`], ...Object.entries(jobs.bySource).filter(([,c])=>c>0).map(([src,count]) => {
                      const cfg = SOURCE_CONFIG[src] || { label:src, dot:C.ocean };
                      return [src, `${cfg.label} (${count})`];
                    })].map(([key,label]) => (
                      <button key={key} onClick={() => dispatch({ type: A.SET_JOB_FILTER, payload: key })}
                        style={{ padding:"5px 13px", borderRadius:20, fontSize:11.5, fontWeight:700, border:`1px solid ${jobs.filterSource===key?"#f59e0b":"rgba(255,255,255,0.08)"}`, background:jobs.filterSource===key?"#f59e0b":"rgba(255,255,255,0.04)", color:jobs.filterSource===key?"#0a0a0f":"#8888a8", cursor:"pointer", transition:"all .15s" }}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* ── Skeleton while searching, cards when done ── */}
                  {jobs.searching ? (
                    <JobGridSkeleton count={6} />
                  ) : h.visibleJobs.length === 0 ? (
                    <div style={{ textAlign:"center", padding:"80px 0" }}>
                      <div style={{ fontSize:52, marginBottom:16 }}>🔍</div>
                      <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:18, fontWeight:700, color:"#444460" }}>No results found</div>
                      <div style={{ fontSize:13, color:"#444460", marginTop:6 }}>Try a broader range or different keywords</div>
                    </div>
                  ) : (
                    <div className="card-grid">
                      {h.visibleJobs.map((job, i) => {
                        const srcCfg = SOURCE_CONFIG[job.source?.toLowerCase()] || { label:job.source, color:"#8888a8", dot:C.ocean };
                        return (
                          <div key={i} className="job-card premium-job-card"
                            style={{ background:"#1c1c28", border:`1px solid ${C.border}`, borderRadius:18, padding:24, display:"flex", flexDirection:"column", boxShadow:"0 6px 18px rgba(0,0,0,0.4)", animation:`fadeUp .4s ${Math.min(i*0.03,0.35)}s both cubic-bezier(.22,1,.36,1)`, transition:"all .25s ease" }}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                              <span style={{ padding:"4px 10px", background:`${srcCfg.dot}15`, color:srcCfg.color, borderRadius:20, fontSize:10.5, fontWeight:700, border:`1px solid ${srcCfg.dot}30` }}>{srcCfg.label || job.source}</span>
                              {job.posted_date && <span style={{ fontSize:10.5, color:"#444460" }}>{job.posted_date}</span>}
                            </div>
                            <h3 style={{ fontFamily:"'Outfit',sans-serif", fontSize:18, fontWeight:800, color:"#f1f1f5", lineHeight:1.45, marginBottom:14, flex:1, letterSpacing:"-0.3px" }}>{job.title || "Untitled Role"}</h3>
                            <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:14 }}>
                              <MetaRow icon="🏢" text={job.company || "Company not listed"} />
                              {job.location && <MetaRow icon="📍" text={job.location} />}
                              {job.salary   && <MetaRow icon="💰" text={job.salary} />}
                            </div>
                            {job.match && (
                              <div style={{ padding:14, background:`${job.match.bar_color}08`, border:`1px solid ${job.match.bar_color}25`, borderRadius:12, marginBottom:14 }}>
                                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                                  <span style={{ fontSize:10.5, fontWeight:700, color:"#444460", textTransform:"uppercase" }}>Match</span>
                                  <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:20, fontWeight:800, color:job.match.bar_color }}>{job.match.score}%</span>
                                </div>
                                <div style={{ height:5, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden" }}>
                                  <div style={{ height:"100%", width:`${job.match.score}%`, background:job.match.bar_color, borderRadius:4 }} />
                                </div>
                              </div>
                            )}
                            <div style={{ display:"flex", gap:8, marginTop:"auto" }}>
                              <button onClick={() => h.sendJobToWhatsApp(job)} style={{ padding:"10px 13px", background:"rgba(37,211,102,0.07)", border:"1px solid rgba(37,211,102,0.2)", color:"#16a34a", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer" }}>📲</button>
                              <a href={job.apply_link} target="_blank" rel="noreferrer"
                                style={{ flex:1, display:"block", textAlign:"center", padding:12, background:"linear-gradient(135deg,#f59e0b,#d97706)", color:"#0a0a0f", borderRadius:12, fontSize:13.5, fontWeight:700, textDecoration:"none", boxShadow:"0 4px 14px rgba(245,158,11,0.3)" }}>
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

          {/* ── FREE COURSES ──────────────────────────────────────────────── */}
          {mode === "courses" && (
            <div className="fade-up">
              <div style={{ marginBottom:32 }}>
                <div className="page-eyebrow">Free Learning</div>
                <h1 className="page-title">Free Courses</h1>
                <p className="page-subtitle">YouTube, Coursera, edX, Simplilearn &amp; Google — free resources only.</p>
              </div>

              <div style={{ display:"flex", border:`1.5px solid ${C.borderMd}`, borderRadius:14, overflow:"hidden", marginBottom:32, background:"#1c1c28", boxShadow:"0 2px 12px rgba(245,158,11,0.07)" }}>
                <div style={{ display:"flex", alignItems:"center", paddingLeft:18, color:"#444460", fontSize:18 }}>🔍</div>
                <input value={courses.keyword} onChange={e => dispatch({ type: A.SET_COURSE_KEYWORD, payload: e.target.value })}
                  onKeyDown={e => e.key==="Enter" && h.handleCourseSearch()}
                  placeholder="e.g. Data Analyst, Python, Machine Learning…"
                  style={{ flex:1, padding:"14px 14px", background:"none", border:"none", fontSize:14, color:"#f1f1f5", fontFamily:"'Plus Jakarta Sans',sans-serif", outline:"none" }} />
                <button onClick={h.handleCourseSearch} disabled={courses.loading} className="btn-primary"
                  style={{ borderRadius:0, padding:"14px 28px", fontSize:13.5, display:"flex", alignItems:"center", gap:8, whiteSpace:"nowrap", flexShrink:0 }}>
                  {courses.loading ? "Searching…" : "Search →"}
                </button>
              </div>

              {/* ── Skeleton while loading, cards when done ── */}
              {courses.loading ? (
                <CourseGridSkeleton count={6} />
              ) : courses.results.length > 0 ? (
                <>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:10 }}>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {[["all",`All (${courses.results.length})`], ...Object.entries(courses.byPlatform).map(([p,c])=>[p,`${p} (${c})`])].map(([key,label]) => (
                        <button key={key} onClick={() => dispatch({ type: A.SET_COURSE_FILTER, payload: key })}
                          style={{ padding:"5px 13px", borderRadius:20, fontSize:11.5, fontWeight:700, border:`1px solid ${courses.filterPlatform===key?"#f59e0b":"rgba(255,255,255,0.08)"}`, background:courses.filterPlatform===key?"#f59e0b":"rgba(255,255,255,0.04)", color:courses.filterPlatform===key?"#0a0a0f":"#8888a8", cursor:"pointer", transition:"all .15s" }}>
                          {label}
                        </button>
                      ))}
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      {[["platform","Platform"],["rating","⭐ Rating"]].map(([k,l]) => (
                        <button key={k} onClick={() => dispatch({ type: A.SET_COURSE_SORT, payload: k })}
                          style={{ padding:"5px 12px", background:courses.sortBy===k?"rgba(245,158,11,0.1)":"rgba(255,255,255,0.04)", border:`1px solid ${courses.sortBy===k?"#f59e0b":"rgba(255,255,255,0.08)"}`, borderRadius:8, fontSize:11.5, color:courses.sortBy===k?"#f59e0b":"#8888a8", cursor:"pointer", fontWeight:600 }}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="card-grid">
                    {h.filteredCourses.map((course, i) => {
                      const pCfg = PLATFORM_CONFIG[course.platform] || { color:"#8888a8", icon:"○" };
                      return (
                        <div key={i} className="job-card" style={{ background:"#1c1c28", border:`1px solid ${C.border}`, borderRadius:14, padding:22, display:"flex", flexDirection:"column", boxShadow:"0 1px 3px rgba(245,158,11,0.06)", animation:`fadeUp .4s ${Math.min(i*0.03,0.35)}s both cubic-bezier(.22,1,.36,1)` }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                            <span style={{ padding:"3px 10px", background:`${pCfg.color}15`, color:pCfg.color, borderRadius:20, fontSize:10.5, fontWeight:700, border:`1px solid ${pCfg.color}30` }}>{pCfg.icon} {course.platform}</span>
                            {course.free_type && <span style={{ padding:"3px 8px", background:"rgba(13,148,136,0.08)", color:"#0d9488", borderRadius:6, fontSize:10, fontWeight:700, border:"1px solid rgba(13,148,136,0.2)" }}>{course.free_type}</span>}
                          </div>
                          <h3 style={{ fontFamily:"'Outfit',sans-serif", fontSize:15, fontWeight:700, color:"#f1f1f5", lineHeight:1.45, marginBottom:12, flex:1, letterSpacing:"-0.2px" }}>{course.title || "Untitled Course"}</h3>
                          <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:14 }}>
                            {course.instructor && <MetaRow icon="👤" text={course.instructor} />}
                            {course.duration   && <MetaRow icon="⏱" text={course.duration} />}
                            {course.rating     && <MetaRow icon="⭐" text={course.rating} />}
                            {course.views      && <MetaRow icon="👁" text={course.views} />}
                          </div>
                          <a href={course.url} target="_blank" rel="noreferrer"
                            style={{ display:"block", textAlign:"center", padding:10, background:`${pCfg.color}10`, border:`1px solid ${pCfg.color}30`, color:pCfg.color, borderRadius:10, fontSize:13, fontWeight:700, textDecoration:"none", transition:"background .15s" }}
                            onMouseEnter={e => e.currentTarget.style.background=`${pCfg.color}22`}
                            onMouseLeave={e => e.currentTarget.style.background=`${pCfg.color}10`}>
                            Open Course →
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : !courses.status ? (
                <div style={{ marginTop:8 }}>
                  <p style={{ fontSize:11, color:"#444460", marginBottom:14, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px" }}>Platforms covered</p>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:10 }}>
                    {Object.entries(PLATFORM_CONFIG).map(([name,cfg]) => (
                      <div key={name} style={{ padding:"18px 12px", background:"#1c1c28", border:`1px solid ${C.border}`, borderRadius:12, textAlign:"center", boxShadow:"0 1px 3px rgba(245,158,11,0.04)" }}>
                        <div style={{ fontSize:22, marginBottom:6 }}>{cfg.icon}</div>
                        <div style={{ fontSize:11, color:cfg.color, fontWeight:700 }}>{name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign:"center", padding:"70px 0" }}>
                  <div style={{ fontSize:48, marginBottom:14 }}>🎓</div>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:700, color:"#444460" }}>No courses found</div>
                  <div style={{ fontSize:13, color:"#444460", marginTop:6 }}>Try a different keyword</div>
                </div>
              )}
            </div>
          )}

          {/* ── JOB ALERTS ────────────────────────────────────────────────── */}
          {mode === "alerts" && (
            <div className="fade-up">
              <div style={{ marginBottom:28 }}>
                <div className="page-eyebrow">Notifications</div>
                <h1 className="page-title">Job Alerts</h1>
                <p className="page-subtitle">Set up alerts — we search job portals automatically and notify you here.</p>
              </div>

              {/* Create Alert */}
              <div style={{ background:"#1c1c28", border:`1px solid ${C.border}`, padding:26, borderRadius:16, marginBottom:28, maxWidth:560 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#444460", textTransform:"uppercase", letterSpacing:"1px", marginBottom:16 }}>➕ Create New Alert</div>
                <input value={alerts.form.role} onChange={e => dispatch({ type: A.SET_ALERT_FORM, payload: { role: e.target.value } })} placeholder="Role (e.g. Data Engineer, ML Engineer)" className="dark-input" style={{ marginBottom:10 }} />
                <input value={alerts.form.location} onChange={e => dispatch({ type: A.SET_ALERT_FORM, payload: { location: e.target.value } })} placeholder="Location (leave blank for all)" className="dark-input" style={{ marginBottom:10 }} />
                <select value={alerts.form.exp} onChange={e => dispatch({ type: A.SET_ALERT_FORM, payload: { exp: e.target.value } })} className="dark-input" style={{ marginBottom:16 }}>
                  {EXP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <button onClick={h.createJobAlert} disabled={alerts.loading} className="btn-primary" style={{ width:"100%" }}>
                  {alerts.loading ? "Creating…" : "Create Alert →"}
                </button>
              </div>

              {/* My Alerts — skeleton while loading */}
              <div style={{ marginBottom:32 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#444460", textTransform:"uppercase", letterSpacing:"1px", marginBottom:14 }}>My Alerts ({alerts.list.length})</div>
                {alerts.loading && alerts.list.length === 0 ? (
                  [0,1,2].map(i => <AlertItemSkeleton key={i} />)
                ) : alerts.list.length === 0 ? (
                  <div style={{ color:"#444460", fontSize:13, padding:"24px 0", textAlign:"center" }}>No alerts yet — create your first alert above</div>
                ) : (
                  alerts.list.map((alertItem, i) => (
                    <div key={i} style={{ background:"#1c1c28", border:`1px solid ${C.border}`, padding:"16px 20px", borderRadius:12, marginBottom:10, boxShadow:"0 1px 3px rgba(245,158,11,0.04)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:700, color:"#f1f1f5", marginBottom:3 }}>{alertItem.role}</div>
                        <div style={{ fontSize:12, color:"#444460" }}>
                          {alertItem.location || "All locations"} · {alertItem.experience_level}
                          {alertItem.last_checked && <span> · Last checked: {new Date(alertItem.last_checked).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                        {alertItem.last_notified_count > 0 && (
                          <div style={{ padding:"4px 12px", background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.2)", borderRadius:20, fontSize:11.5, fontWeight:700, color:"#34d399" }}>{alertItem.last_notified_count} new</div>
                        )}
                        <button onClick={() => h.toggleAlert(alertItem._id)} style={{ padding:"5px 12px", background:alertItem.is_active?"rgba(245,158,11,0.1)":"rgba(255,255,255,0.04)", border:`1px solid ${alertItem.is_active?"rgba(245,158,11,0.2)":"rgba(255,255,255,0.08)"}`, borderRadius:8, fontSize:11.5, fontWeight:700, color:alertItem.is_active?"#f59e0b":"#444460", cursor:"pointer" }}>
                          {alertItem.is_active ? "Active" : "Paused"}
                        </button>
                        <button onClick={() => h.deleteAlert(alertItem._id)} style={{ padding:"5px 10px", background:"rgba(225,29,72,0.06)", border:"1px solid rgba(225,29,72,0.2)", borderRadius:8, fontSize:13, color:"#e11d48", cursor:"pointer" }}>✕</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Notifications inbox — skeleton while loading */}
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#444460", textTransform:"uppercase", letterSpacing:"1px" }}>
                    🔔 Notifications {notifs.count > 0 && <span style={{ background:"#fb7185", color:"#0a0a0f", borderRadius:"50%", fontSize:10, padding:"1px 6px", marginLeft:6 }}>{notifs.count}</span>}
                  </div>
                  {notifs.count > 0 && (
                    <button onClick={h.markAllRead} style={{ fontSize:12, color:"#f59e0b", background:"none", border:"none", cursor:"pointer", fontWeight:700 }}>Mark all read</button>
                  )}
                </div>

                {notifs.loading ? (
                  [0,1,2,3].map(i => <NotifItemSkeleton key={i} />)
                ) : notifs.list.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"40px 0" }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>🔔</div>
                    <div style={{ fontSize:14, color:"#444460", fontWeight:600 }}>No notifications yet</div>
                    <div style={{ fontSize:12, color:"#444460", marginTop:4 }}>Create an alert above — we'll notify you when matching jobs are found</div>
                  </div>
                ) : (
                  notifs.list.map((notif, i) => (
                    <div key={i} style={{ background:notif.is_read?"#1c1c28":"rgba(245,158,11,0.04)", border:`1px solid ${notif.is_read?"rgba(255,255,255,0.06)":"rgba(245,158,11,0.18)"}`, borderRadius:12, marginBottom:10, overflow:"hidden", boxShadow:"0 1px 3px rgba(245,158,11,0.06)" }}>
                      <div style={{ padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, cursor:"pointer" }}
                        onClick={() => { dispatch({ type: A.SET_NOTIF_EXPANDED, payload: notifs.expandedId === notif._id ? null : notif._id }); if (!notif.is_read) h.markOneRead(notif._id); }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10, flex:1, minWidth:0 }}>
                          {!notif.is_read && <div style={{ width:8, height:8, borderRadius:"50%", background:"#f59e0b", flexShrink:0 }} />}
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:14, fontWeight:700, color:"#f1f1f5" }}>{notif.title}</div>
                            <div style={{ fontSize:11.5, color:"#444460", marginTop:2 }}>{new Date(notif.created_at).toLocaleString()} · {notif.jobs?.length || 0} jobs</div>
                          </div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                          {notif.jobs?.length > 0 && (
                            <button onClick={e => { e.stopPropagation(); h.sendNotifJobsToWhatsApp(notif.jobs); }} style={{ padding:"5px 10px", background:"rgba(37,211,102,0.08)", border:"1px solid rgba(37,211,102,0.25)", borderRadius:8, fontSize:12, color:"#16a34a", fontWeight:700, cursor:"pointer" }}>📲</button>
                          )}
                          <button onClick={e => { e.stopPropagation(); h.deleteNotification(notif._id); }} style={{ padding:"5px 8px", background:"rgba(225,29,72,0.06)", border:"1px solid rgba(225,29,72,0.15)", borderRadius:8, fontSize:12, color:"#e11d48", cursor:"pointer" }}>✕</button>
                          <span style={{ fontSize:12, color:"#444460" }}>{notifs.expandedId === notif._id ? "▲" : "▼"}</span>
                        </div>
                      </div>
                      {notifs.expandedId === notif._id && notif.jobs?.length > 0 && (
                        <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"12px 18px 16px" }}>
                          {notif.jobs.map((job, j) => (
                            <div key={j} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:j < notif.jobs.length-1?"1px solid rgba(255,255,255,0.06)":"none", gap:12 }}>
                              <div style={{ minWidth:0, flex:1 }}>
                                <div style={{ fontSize:13, fontWeight:700, color:"#f1f1f5" }}>{job.title}</div>
                                <div style={{ fontSize:11.5, color:"#8888a8", marginTop:2 }}>🏢 {job.company||"?"} · 📍 {job.location||"?"}</div>
                                {job.salary && <div style={{ fontSize:11, color:"#0d9488", marginTop:1 }}>💰 {job.salary}</div>}
                              </div>
                              <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                                <span style={{ padding:"3px 8px", background:"rgba(245,158,11,0.1)", color:"#f59e0b", borderRadius:6, fontSize:10, fontWeight:700 }}>{job.source}</span>
                                <a href={job.apply_link} target="_blank" rel="noreferrer"
                                  style={{ padding:"6px 14px", background:"linear-gradient(135deg,#f59e0b,#d97706)", color:"#0a0a0f", borderRadius:8, fontSize:12, fontWeight:700, textDecoration:"none" }}>
                                  Apply →
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── SUB-PAGES ─────────────────────────────────────────────────── */}
          {mode === "ats"       && <ResumeMaker />}
          {mode === "interview" && <InterviewPrep />}
          {mode === "users"     && user?.level === 0 && <UserManagement currentUser={user} />}
          {mode === "linkedin"  && <LinkedinAnalyzer />}
          {mode === "portfolio" && <PortfolioGenerator />}
          {mode === "stocks"    && <StockPredictor />}

        </main>
      </div>
    </div>
  );
}
