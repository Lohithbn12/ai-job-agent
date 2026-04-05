// ─── App.js ───────────────────────────────────────────────────────────────────
// Ocean Premium UI — Navy sidebar · White canvas · Sapphire accents
// Outfit (display) · Plus Jakarta Sans (body) · JetBrains Mono

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  EXP_OPTIONS, EXP_LABEL, SOURCE_CONFIG, PLATFORM_CONFIG,
  GLOBAL_CSS, API, SKILLS_PREVIEW,
  Spinner, Label, Tag, FilterChip, MetaRow, AddRow, Section
} from "./constants";
import AuthWrapper from "./Auth";
import ResumeMaker from "./ResumeMaker";
import InterviewPrep from "./InterviewPrep";
import UserManagement from "./UserManagement";
import LinkedinAnalyzer from "./components/LinkedinAnalyzer";
import PortfolioGenerator from "./PortfolioGenerator";
import StockPredictor from "./StockPredictor";

// ── Live Clock ────────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: "0.5px" }}>
    {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
  </span>;
}

// ── Nav config ────────────────────────────────────────────────────────────────
const NAV_ALL = [
  { key: "home",      icon: "🏠", label: "Home",              sub: "Dashboard" },
  { key: "jobs",      icon: "💼", label: "Job Search",         sub: null },
  { key: "courses",   icon: "🎓", label: "Free Courses",       sub: "Learn for free" },
  { key: "ats",       icon: "📄", label: "Resume Maker",       sub: "ATS builder" },
  { key: "interview", icon: "🎯", label: "Interview Prep",     sub: "Q&A · Aptitude · Code" },
  { key: "users",     icon: "👥", label: "User Management",    sub: "Admin only" },
  { key: "linkedin",  icon: "🔗", label: "LinkedIn Analyzer",  sub: "Profile optimizer" },
  { key: "portfolio", icon: "🌐", label: "Portfolio",          sub: "Resume → website" },
  { key: "stocks",    icon: "📈", label: "Stock Predictor",    sub: "AI market insights" },
  { key: "alerts",    icon: "🔔", label: "Job Alerts",         sub: "Auto notifications" },
];

// ── Home card config ──────────────────────────────────────────────────────────
const HOME_CARDS = [
  { icon: "💼", title: "Job Search",        desc: "Parse resume & search 5 job boards simultaneously", key: "jobs",      bg: "rgba(30,111,212,0.08)",  border: "rgba(30,111,212,0.18)" },
  { icon: "📄", title: "Resume Maker",      desc: "ATS-optimized builder with 150 templates",          key: "ats",       bg: "rgba(13,148,136,0.08)",  border: "rgba(13,148,136,0.18)" },
  { icon: "🎓", title: "Free Courses",      desc: "YouTube, Coursera, edX & Google — free only",       key: "courses",   bg: "rgba(14,165,233,0.08)",  border: "rgba(14,165,233,0.18)" },
  { icon: "🎯", title: "Interview Prep",    desc: "Q&A predictor · Aptitude · Coding rounds",          key: "interview", bg: "rgba(139,92,246,0.08)",  border: "rgba(139,92,246,0.18)" },
  { icon: "🔗", title: "LinkedIn Analyzer", desc: "Score & optimize your LinkedIn profile",            key: "linkedin",  bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.18)" },
  { icon: "🌐", title: "Portfolio Builder", desc: "Turn your resume into a live website",              key: "portfolio", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.18)" },
  { icon: "📈", title: "Stock Predictor",   desc: "AI-powered market trend analysis",                 key: "stocks",    bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.18)" },
  { icon: "🔔", title: "Job Alerts",        desc: "Role-based automatic notifications",               key: "alerts",    bg: "rgba(217,70,239,0.08)",  border: "rgba(217,70,239,0.18)" },
];

const MODE_LABELS = {
  home:"Dashboard", jobs:"Job Search", courses:"Free Courses",
  ats:"Resume Maker", interview:"Interview Prep", alerts:"Job Alerts",
  linkedin:"LinkedIn Analyzer", portfolio:"Portfolio", stocks:"Stock Predictor", users:"User Mgmt"
};

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }) {
  return (
    <div
  style={{
    background: "white",
    border: "1px solid rgba(30,111,212,0.08)",
    borderRadius: 18,
    padding: "20px 22px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    boxShadow: "0 6px 18px rgba(30,111,212,0.08)",
    transition: "all 0.25s ease",
    cursor: "pointer"
  }}
>
      <div
  style={{
    width: 52,
    height: 52,
    borderRadius: 14,
    background: `${color}15`,
    border: `1px solid ${color}30`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    flexShrink: 0
  }}
>{icon}</div>
      <div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 3, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

export default function App() {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("js_token");
    if (!token) { setSessionChecked(true); return; }
    axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUser(res.data))
      .catch(() => { localStorage.removeItem("js_token"); localStorage.removeItem("js_user"); })
      .finally(() => setSessionChecked(true));
  }, []); // eslint-disable-line

  // ── App state ────────────────────────────────────────────────────────────
  const [mode, setMode] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* Job state */
  const [file, setFile] = useState(null);
  const [roles, setRoles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [weightedSkills, setWeightedSkills] = useState([]);
  const [topSkills, setTopSkills] = useState([]);
  const [keywordsUsed, setKwUsed] = useState([]);
  const [selectedExps, setExps] = useState(["0-1"]);
  const [locations, setLocations] = useState([{ city: "", country: "" }]);
  const [sources, setSources] = useState(["indeed","naukri","internshala","foundit","apna","linkedin"]);
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

  /* Misc state */
  const [userStats, setUserStats] = useState({ total_users: 0, online_count: 0 });
  const [alertRole, setAlertRole] = useState("");
  const [alertLocation, setAlertLocation] = useState("");
  const [alertExp, setAlertExp] = useState("0-1");
  const [alertFrequency, setAlertFrequency] = useState("daily");
  const [alertSources, setAlertSources] = useState(["linkedin","naukri"]);
  const [myAlerts, setMyAlerts] = useState([]);
  const [alertLoading, setAlertLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  /* Notification state */
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [expandedNotif, setExpandedNotif] = useState(null);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF resume");
    try {
      setLoading(true); setStatus("Parsing resume…");
      const fd = new FormData(); fd.append("file", file);
      const res = await axios.post(`${API}/upload-resume/`, fd);
      const allRoles = (res.data.roles || []).filter(r => r.length > 2);
      const allSkills = (res.data.skills || []).filter(s => s.length > 2);
      const weighted = res.data.weighted_skills || [];
      const NOISE = new Set(["time","hands","good","strong","knowledge","skills","experience","enterprise","team"]);
      const top = weighted.filter(w => w.weight >= 0.15 && !NOISE.has(w.skill.toLowerCase()))
        .sort((a, b) => b.weight - a.weight).slice(0, 8).map(w => w.skill);
      const topFinal = top.length >= 4 ? top : allSkills.slice(0, 8);
      setRoles(allRoles); setSkills(allSkills); setWeightedSkills(weighted);
      setTopSkills(topFinal); setShowAll(false);
      setStatus(allRoles.length ? `Parsed — ${allRoles.length} roles · ${topFinal.length} skills` : "Parsed — add roles below");
      setStep(2);
    } catch { setStatus("Upload failed"); }
    finally { setLoading(false); }
  };

  const handleSearch = async () => {
    const keywords = roles.length ? [...roles] : skills.slice(0, 3);
    if (!keywords.length) return alert("Add at least one job role");
    if (!sources.length) return alert("Select at least one source");
    if (!selectedExps.length) return alert("Select an experience range");
    const locs = locations.filter(l => l.city || l.country);
    const locStrs = locs.length ? locs.map(l => [l.city, l.country].filter(Boolean).join(", ")) : [""];
    try {
      setSearching(true); setJobs([]); setBySource({}); setFilter("all"); setStatus("Searching across platforms…");
      const reqs = [];
      for (const exp of selectedExps)
        for (const loc of locStrs)
          reqs.push(axios.post(`${API}/search-jobs/`, { roles, keywords: roles, experience_level: exp, location: loc, sources, weighted_skills: weightedSkills, top_skills: [] })
            .then(r => r.data).catch(() => ({ jobs: [], by_source: {}, keywords_used: [] })));
      const results = await Promise.all(reqs);
      const seen = new Set(), all = []; let lastKws = [];
      for (const r of results) {
        for (const j of r.jobs || []) { if (!seen.has(j.apply_link)) { seen.add(j.apply_link); all.push(j); } }
        if (r.keywords_used?.length) lastKws = r.keywords_used;
      }
      const bs = {};
      for (const j of all) { const k = j.source?.toLowerCase() || "other"; bs[k] = (bs[k] || 0) + 1; }
      setJobs(all); setBySource(bs); setKwUsed(lastKws);
      setStatus(`Found ${all.length} positions`); setStep(3);
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

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem("js_token");
      const res = await axios.get(`${API}/auth/stats/users`, { headers: { Authorization: `Bearer ${token}` } });
      setUserStats(res.data);
    } catch {}
  };

  const fetchMyAlerts = async () => {
    try {
      const token = localStorage.getItem("js_token");
      const res = await axios.get(`${API}/job-alert/my-alerts`, { headers: { Authorization: `Bearer ${token}` } });
      setMyAlerts(res.data.alerts || []);
    } catch {}
  };

  // ── Notification fetchers ─────────────────────────────────────────────────
  const fetchNotificationCount = async () => {
    try {
      const token = localStorage.getItem("js_token");
      const res = await axios.get(`${API}/notifications/count`, { headers: { Authorization: `Bearer ${token}` } });
      setNotificationCount(res.data.count || 0);
    } catch {}
  };

  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);
      const token = localStorage.getItem("js_token");
      const res = await axios.get(`${API}/notifications/list`, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(res.data.notifications || []);
    } catch {}
    finally { setNotifLoading(false); }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem("js_token");
      await axios.patch(`${API}/notifications/clear`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotificationCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  };

  const markOneRead = async (id) => {
    try {
      const token = localStorage.getItem("js_token");
      await axios.patch(`${API}/notifications/read/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, is_read: true } : n));
      setNotificationCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("js_token");
      await axios.delete(`${API}/notifications/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch {}
  };

  const createJobAlert = async () => {
    if (!alertRole.trim()) return alert("Please enter a role");
    try {
      setAlertLoading(true);
      const token = localStorage.getItem("js_token");
      await axios.post(`${API}/job-alert/create`,
        { role: alertRole, location: alertLocation, experience_level: alertExp, sources: alertSources, frequency: alertFrequency },
        { headers: { Authorization: `Bearer ${token}` } });
      setAlertRole(""); setAlertLocation(""); fetchMyAlerts(); alert("Alert created! We'll notify you when new jobs are found.");
    } catch { alert("Failed to create alert"); }
    finally { setAlertLoading(false); }
  };

  const deleteAlert = async (id) => {
    try {
      const token = localStorage.getItem("js_token");
      await axios.delete(`${API}/job-alert/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchMyAlerts();
    } catch {}
  };

  const toggleAlert = async (id) => {
    try {
      const token = localStorage.getItem("js_token");
      await axios.patch(`${API}/job-alert/${id}/toggle`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchMyAlerts();
    } catch {}
  };

  const toggleExp = v => setExps(p => p.includes(v) ? p.filter(e => e !== v) : [...p, v]);
  const toggleSource = s => setSources(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const addLocation = () => setLocations(p => [...p, { city: "", country: "" }]);
  const removeLocation = i => setLocations(p => p.filter((_, idx) => idx !== i));
  const updateLocation = (i, f, v) => setLocations(p => p.map((l, idx) => idx === i ? { ...l, [f]: v } : l));
  const addRole = () => { const r = newRole.trim(); if (r && !roles.includes(r)) setRoles(p => [...p, r]); setNewRole(""); };

  useEffect(() => {
    if (!user) return;
    fetchUserStats();
    fetchMyAlerts();
    fetchNotificationCount();
    const iv = setInterval(() => {
      fetchUserStats();
      fetchNotificationCount();
    }, 30000);
    return () => clearInterval(iv);
  }, [user]); // eslint-disable-line

  // Fetch notifications when alerts tab is opened
  useEffect(() => {
    if (mode === "alerts" && user) {
      fetchNotifications();
      fetchMyAlerts();
    }
  }, [mode]); // eslint-disable-line

  const visibleJobs = (filterSource === "all" ? jobs : jobs.filter(j => j.source?.toLowerCase() === filterSource))
    .slice().sort((a, b) => (a.exp_mismatch ? 1 : 0) - (b.exp_mismatch ? 1 : 0));

  const sendJobToWhatsApp = job => {
    const msg = `💼 *${job.title || "Job Opening"}*\n🏢 ${job.company || "?"}\n${job.location ? `📍 ${job.location}\n` : ""}${job.salary ? `💰 ${job.salary}\n` : ""}🎯 ${job.exp_required || job.experience_level || "?"}\n🔗 ${job.apply_link}\n📌 ${job.source}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const sendAllJobsToWhatsApp = () => {
    const msg = visibleJobs.slice(0, 20).map((j, i) => `${i + 1}. *${j.title}* @ ${j.company || "?"}\n   📍 ${j.location || "?"} · ${j.exp_required || j.experience_level || "?"}\n   🔗 ${j.apply_link}`).join("\n\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(`🚀 ${visibleJobs.length} Job Matches\n\n${msg}`)}`, "_blank");
  };

  const sendNotifJobsToWhatsApp = (jobs) => {
    const msg = jobs.slice(0, 15).map((j, i) => `${i + 1}. *${j.title}* @ ${j.company || "?"}\n   📍 ${j.location || "?"}\n   🔗 ${j.apply_link}`).join("\n\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(`🔔 New Job Alert Matches\n\n${msg}`)}`, "_blank");
  };

  const filteredCourses = (filterPlatform === "all" ? courses : courses.filter(c => c.platform === filterPlatform))
    .slice().sort((a, b) => sortCourses === "rating" ? (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0) : (a.platform || "").localeCompare(b.platform || ""));

  const navItems = NAV_ALL.filter(item => {
    if (item.key === "users") return user?.level === 0;
    if (user?.level === 0 || user?.level === 1 || user?.level == null) return true;
    return (user?.page_permissions || []).includes(item.key);
  }).map(item => ({
    ...item,
    sub: item.key === "jobs"
      ? (step === 3 ? `${jobs.length} results` : step === 2 ? "Configure search" : "Upload resume")
      : item.key === "courses" ? (courseStatus || "Find free courses")
      : item.sub
  }));

  const logout = () => { localStorage.removeItem("js_user"); localStorage.removeItem("js_token"); setUser(null); };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const greetEmoji = hour < 12 ? "🌅" : hour < 17 ? "☀️" : "🌙";
  const firstName = user?.name?.split(" ")[0] || "there";

  // ── Colours shared ────────────────────────────────────────────────────────
  const C = {
    ocean: "#1e6fd4", sapphire: "#0ea5e9", teal: "#0d9488",
    navy800: "#0a1535", border: "rgba(30,111,212,0.12)", borderMd: "rgba(30,111,212,0.22)",
    glow: "rgba(30,111,212,0.08)"
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!sessionChecked) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"#060d28", flexDirection:"column", gap:20 }}>
        <div style={{ width:48, height:48, borderRadius:14, background:"linear-gradient(135deg,#3b8ef0,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, animation:"floatUp 2s ease-in-out infinite" }}>⚡</div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:"3px", textTransform:"uppercase" }}>Loading…</div>
      </div>
    </>
  );

  if (!user) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <AuthWrapper onLogin={u => setUser(u)} />
    </>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <div className="app-container">

        {/* Overlay */}
        <div className={`overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

        {/* ══ SIDEBAR ══════════════════════════════════════════════════════════ */}
        <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>

          {/* Brand */}
          <div className="sb-brand">
            <div className="sb-logo">⚡</div>
            <div>
              <div className="sb-wordmark">JobSpark</div>
              <div className="sb-tagline">AI Career Suite</div>
            </div>
          </div>

          {/* User card */}
          <div className="sb-user">
            <div className="sb-avatar">{(user?.name || user?.email || "U")[0].toUpperCase()}</div>
            <div style={{ minWidth:0, flex:1 }}>
              <div className="sb-uname">{user?.name || "User"}</div>
              <div className="sb-urole">{user?.level === 0 ? "Administrator" : "Member"}</div>
            </div>
            <div className="sb-online-dot" />
          </div>

          {/* Search */}
          <div className="sb-search">
            <div className="sb-search-wrap">
              <span className="sb-search-icon">🔍</span>
              <input placeholder="Search pages…" />
            </div>
          </div>

          {/* Nav */}
          <nav className="sb-nav">
            <div className="sb-section-lbl">Navigation</div>
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => { setMode(item.key); setSidebarOpen(false); }}
                className={`sb-nav-item${mode === item.key ? " active" : ""}`}
              >
                <div className="sb-nav-icon">{item.icon}</div>
                <div style={{ minWidth:0, flex:1 }}>
                  <div className="sb-nav-label">{item.label}</div>
                  {item.sub && <div className="sb-nav-sub">{item.sub}</div>}
                </div>
                {item.key === "alerts" && notificationCount > 0 && (
                  <div className="sb-badge">{notificationCount}</div>
                )}
              </button>
            ))}

            {/* Job progress steps */}
            {mode === "jobs" && step > 1 && (
              <div className="sb-steps">
                <div style={{ height:1, background:"rgba(255,255,255,0.06)", margin:"6px 0 14px" }} />
                <div className="sb-step-title">Progress</div>
                {["Upload", "Configure", "Results"].map((s, i) => (
                  <div key={i} className="sb-step-row">
                    <div className="sb-step-num" style={{
                      background: step > i+1 ? "#22c55e" : step === i+1 ? C.ocean : "rgba(255,255,255,0.08)",
                      color: step >= i+1 ? "white" : "rgba(255,255,255,0.3)",
                      boxShadow: step === i+1 ? `0 0 0 3px rgba(30,111,212,0.25)` : "none",
                    }}>{step > i+1 ? "✓" : i+1}</div>
                    <span className="sb-step-lbl" style={{ color: step === i+1 ? "rgba(147,210,255,0.9)" : step > i+1 ? "#4ade80" : "rgba(255,255,255,0.3)" }}>{s}</span>
                  </div>
                ))}
              </div>
            )}
          </nav>

          {/* Status */}
          {(status || courseStatus) && (
            <div className="sb-status">
              <div className="sb-status-dot" />
              <span className="sb-status-txt">{mode === "jobs" ? status : courseStatus}</span>
            </div>
          )}

          {/* Logout */}
          <div className="sb-footer">
            <button className="sb-logout" onClick={logout}>
              <span>→</span> Sign Out
            </button>
          </div>
        </aside>

        {/* ══ CONTENT ══════════════════════════════════════════════════════════ */}
        <div className="content-area">

          {/* ── TOP BAR ── */}
          <header className="top-bar">
            <div className="top-bar-left">
              <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
              <button className="home-btn" onClick={() => setMode("home")} title="Go to Home">🏠</button>
              <div className="topbar-divider" />
              <span style={{ fontSize:22 }}>{greetEmoji}</span>
              <div>
                <div className="topbar-greeting">{greeting}, {firstName}</div>
                <div className="topbar-date">{new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })}</div>
              </div>
            </div>

            <div className="top-bar-right">
              <div className="tb-chip tb-chip-clock"><LiveClock /></div>
              <div className="tb-chip tb-chip-notif" onClick={() => { setMode("alerts"); }} style={{ cursor:"pointer", position:"relative" }}>
                🔔 {notificationCount > 0 ? <span style={{ background:"#e11d48", color:"white", borderRadius:"50%", fontSize:10, fontWeight:800, padding:"1px 5px", marginLeft:2 }}>{notificationCount}</span> : 0}
              </div>
              <div className="tb-chip tb-chip-mode">{MODE_LABELS[mode] || mode}</div>
              {mode === "jobs" && step === 3 && (
                <div className="tb-chip tb-chip-count">{jobs.length} positions</div>
              )}
            </div>
          </header>

          {/* ══ MAIN ══ */}
          <main className="page-main">

            {/* ── HOME ──────────────────────────────────────────────────── */}
            {mode === "home" && (
              <div className="fade-up">
                <div className="welcome-banner">
  <div className="welcome-badge">
    <span className="welcome-dot" />
    AI Career Platform
  </div>

  <h1 className="welcome-title">
    Welcome back, {firstName} 👋
  </h1>

  <p className="welcome-subtitle">
    Your complete AI-powered career suite — job search, resume, interview prep and more.
  </p>
</div>

                <div className="stats-grid">
    <StatCard label="Total Users"  value={userStats.total_users || "—"}  icon="👥" color={C.ocean} />
    <StatCard label="Online Now"   value={userStats.online_count || "—"} icon="🟢" color={C.teal} />
    <StatCard label="Jobs Found"   value={jobs.length || "—"}     icon="💼" color="#7c3aed" />
    <StatCard label="Courses"      value={courses.length || "—"}  icon="🎓" color={C.sapphire} />
  </div>

                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:16 }}>
  {HOME_CARDS.map((card, i) => (
    <div
      key={i}
      className="home-dashboard-card"
      onClick={() => setMode(card.key)}
      style={{ animation:`fadeUp 0.4s ${i*0.05}s both cubic-bezier(0.22,1,0.36,1)` }}
    >
      <div
        className="home-card-icon"
        style={{ background:card.bg, border:`1px solid ${card.border}` }}
      >
        {card.icon}
      </div>

      <div className="home-card-title">{card.title}</div>
      <div className="home-card-desc">{card.desc}</div>

      <div className="hero-card-arrow">Open &nbsp;→</div>
    </div>
  ))}
</div>
              </div>
            )}

            {/* ── JOB SEARCH ──────────────────────────────────────────── */}
            {mode === "jobs" && (
              <>
                {step === 1 && (
                  <div className="fade-up" style={{ maxWidth:540, margin:"0 auto" }}>
                    <div className="page-eyebrow" style={{ marginBottom:20 }}>Step 01 · Upload</div>
                    <h1 className="page-title" style={{ marginBottom:12 }}>
                      Find your<br />
                      <span style={{ background:"linear-gradient(135deg,#1e6fd4,#0ea5e9)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>next role.</span>
                    </h1>
                    <p className="page-subtitle" style={{ marginBottom:36 }}>Upload your resume. We extract roles & skills, then search 5 platforms simultaneously with experience verification.</p>

                    <label style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16, padding:"52px 36px", border:`2px dashed ${file ? C.ocean : "rgba(30,111,212,0.25)"}`, borderRadius:16, cursor:"pointer", background: file ? "rgba(30,111,212,0.04)" : "white", transition:"all .2s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor=C.ocean; e.currentTarget.style.background="rgba(30,111,212,0.03)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor=file?C.ocean:"rgba(30,111,212,0.25)"; e.currentTarget.style.background=file?"rgba(30,111,212,0.04)":"white"; }}>
                      <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} style={{ display:"none" }} />
                      <div style={{ width:60, height:60, borderRadius:16, background:"rgba(30,111,212,0.08)", border:`1px solid ${C.borderMd}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>📄</div>
                      <div style={{ textAlign:"center" }}>
                        <div style={{ fontSize:15, fontWeight:600, color:file?"#1e6fd4":"#64748b", marginBottom:4 }}>{file ? file.name : "Click to select your resume"}</div>
                        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10.5, color:"#94a3b8", letterSpacing:"0.5px" }}>PDF only · Max 10 MB</div>
                      </div>
                    </label>

                    <button onClick={handleUpload} disabled={loading || !file} className="btn-primary"
                      style={{ marginTop:14, width:"100%", padding:15, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                      {loading ? <><Spinner />Parsing resume…</> : "Parse Resume →"}
                    </button>

                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:28 }}>
                      {[["🎯","Role-anchored search"],["🛡","2-point exp verification"],["🔀","5 platforms in parallel"],["📍","Multi-location support"]].map(([icon,text],i) => (
                        <div key={i} style={{ padding:"12px 14px", background:"white", border:`1px solid ${C.border}`, borderRadius:10, fontSize:12, color:"#64748b", display:"flex", alignItems:"center", gap:10, boxShadow:"0 1px 3px rgba(30,111,212,0.04)" }}>
                          <span>{icon}</span><span>{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="fade-up">
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, flexWrap:"wrap", gap:12 }}>
                      <div>
                        <div className="page-eyebrow">Step 02 · Configure</div>
                        <h2 className="page-title">Configure Search</h2>
                        <p className="page-subtitle">Edit roles, set locations and experience levels</p>
                      </div>
                      <button className="btn-ghost" onClick={() => setStep(1)}>← Back</button>
                    </div>

                    <div className="two-col" style={{ marginBottom:16 }}>
                      <Section label="Job Roles" note="Search anchors — kept constant">
                        <div style={{ display:"flex", flexWrap:"wrap", gap:6, minHeight:28, marginBottom:4 }}>
                          {roles.length === 0 && <span style={{ fontSize:12, color:"#94a3b8", fontStyle:"italic" }}>No roles detected</span>}
                          {roles.map((r, i) => <Tag key={i} label={r} color={C.ocean} onRemove={() => setRoles(p => p.filter(x => x !== r))} />)}
                        </div>
                        <AddRow value={newRole} onChange={setNewRole} onAdd={addRole} placeholder="e.g. Data Analyst" />
                      </Section>

                      <Section label="Locations" note="Leave blank for all India">
                        {locations.map((loc, i) => (
                          <div key={i} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"center" }}>
                            <input className="dark-input" value={loc.city} onChange={e => updateLocation(i,"city",e.target.value)} placeholder="City" />
                            <input className="dark-input" value={loc.country} onChange={e => updateLocation(i,"country",e.target.value)} placeholder="Country" />
                            {locations.length > 1 && (
                              <button onClick={() => removeLocation(i)} style={{ padding:"0 10px", height:38, background:"rgba(225,29,72,0.06)", border:"1px solid rgba(225,29,72,0.2)", borderRadius:8, color:"#e11d48", cursor:"pointer", fontSize:14, flexShrink:0 }}>✕</button>
                            )}
                          </div>
                        ))}
                        <button onClick={addLocation} style={{ fontSize:12, color:C.ocean, background:"none", border:"none", cursor:"pointer", marginTop:2, fontWeight:600 }}>+ Add location</button>
                      </Section>

                      <Section label="Experience Range" note="Select one or more">
                        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                          {EXP_OPTIONS.map(opt => {
                            const sel = selectedExps.includes(opt.value);
                            return (
                              <button key={opt.value} onClick={() => toggleExp(opt.value)} style={{ padding:"7px 16px", borderRadius:8, border:`1.5px solid ${sel ? C.ocean : "rgba(30,111,212,0.15)"}`, fontSize:13, fontWeight:sel?700:500, background:sel?"rgba(30,111,212,0.08)":"white", color:sel?C.ocean:"#64748b", cursor:"pointer", transition:"all .15s" }}>{opt.label}</button>
                            );
                          })}
                        </div>
                      </Section>
                    </div>

                    <div style={{ background:"white", border:`1px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:20, boxShadow:"0 1px 3px rgba(30,111,212,0.04)" }}>
                      <Label>Job Sources</Label>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:10 }}>
                        {Object.entries(SOURCE_CONFIG).map(([key, cfg]) => {
                          const on = sources.includes(key);
                          return (
                            <button key={key} onClick={() => toggleSource(key)} style={{ padding:"8px 18px", borderRadius:20, border:`1.5px solid ${on ? cfg.dot : "rgba(30,111,212,0.12)"}`, fontSize:13, fontWeight:on?700:500, background:on?`${cfg.dot}18`:"white", color:on?cfg.color:"#64748b", cursor:"pointer", transition:"all .15s", display:"flex", alignItems:"center", gap:7 }}>
                              {on && <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dot, display:"inline-block" }} />}
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button onClick={handleSearch} disabled={searching} className="btn-primary"
                      style={{ width:"100%", padding:15, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                      {searching ? <><Spinner />Searching…</> : "Find Jobs →"}
                    </button>
                  </div>
                )}

                {step === 3 && (
                  <div className="fade-in">
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, flexWrap:"wrap", gap:12 }}>
                      <div>
                        <div className="page-eyebrow">Step 03 · Results</div>
                        <h2 className="page-title">
                          <span style={{ fontFamily:"'JetBrains Mono',monospace", color:C.ocean, fontWeight:500 }}>{jobs.length}</span> Positions Found
                        </h2>
                        {keywordsUsed.length > 0 && (
                          <div style={{ display:"flex", flexWrap:"wrap", gap:6, alignItems:"center", marginTop:8 }}>
                            <span style={{ fontSize:11, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px" }}>Searched:</span>
                            {keywordsUsed.map((kw,i) => (
                              <span key={i} style={{ padding:"2px 9px", background:"rgba(30,111,212,0.08)", color:C.ocean, borderRadius:6, fontSize:11, fontWeight:700, border:`1px solid ${C.borderMd}` }}>{kw}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={sendAllJobsToWhatsApp} style={{ padding:"9px 16px", background:"rgba(37,211,102,0.08)", border:"1px solid rgba(37,211,102,0.25)", borderRadius:9, color:"#16a34a", fontSize:13, fontWeight:700, cursor:"pointer" }}>📲 WhatsApp</button>
                        <button className="btn-ghost" onClick={() => setStep(2)}>← Refine</button>
                      </div>
                    </div>

                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:24 }}>
                      {[["all",`All (${jobs.length})`], ...Object.entries(bySource).filter(([,c])=>c>0).map(([src,count]) => {
                        const cfg = SOURCE_CONFIG[src] || { label:src, dot:C.ocean };
                        return [src, `${cfg.label} (${count})`];
                      })].map(([key,label]) => (
                        <button key={key} onClick={() => setFilter(key)} style={{ padding:"5px 13px", borderRadius:20, fontSize:11.5, fontWeight:700, border:`1.5px solid ${filterSource===key ? C.ocean : "rgba(30,111,212,0.15)"}`, background:filterSource===key?C.ocean:"white", color:filterSource===key?"white":"#64748b", cursor:"pointer", transition:"all .15s" }}>{label}</button>
                      ))}
                    </div>

                    {visibleJobs.length === 0 ? (
                      <div style={{ textAlign:"center", padding:"80px 0" }}>
                        <div style={{ fontSize:52, marginBottom:16 }}>🔍</div>
                        <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:18, fontWeight:700, color:"#94a3b8" }}>No results found</div>
                        <div style={{ fontSize:13, color:"#cbd5e1", marginTop:6 }}>Try a broader range or different keywords</div>
                      </div>
                    ) : (
                      <div className="card-grid">
                        ```jsx
{visibleJobs.map((job, i) => {
  const srcCfg =
    SOURCE_CONFIG[job.source?.toLowerCase()] || {
      label: job.source,
      color: "#64748b",
      dot: C.ocean
    };

  return (
    <div
      key={i}
      className="job-card premium-job-card"
      style={{
        background: "white",
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 6px 18px rgba(30,111,212,0.08)",
        animation: `fadeUp .4s ${Math.min(
          i * 0.03,
          0.35
        )}s both cubic-bezier(.22,1,.36,1)`,
        transition: "all .25s ease"
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14
        }}
      >
        <span
          style={{
            padding: "4px 10px",
            background: `${srcCfg.dot}15`,
            color: srcCfg.color,
            borderRadius: 20,
            fontSize: 10.5,
            fontWeight: 700,
            border: `1px solid ${srcCfg.dot}30`
          }}
        >
          {srcCfg.label || job.source}
        </span>

        {job.posted_date && (
          <span style={{ fontSize: 10.5, color: "#94a3b8" }}>
            {job.posted_date}
          </span>
        )}
      </div>

      {/* Job title */}
      <h3
        style={{
          fontFamily: "'Outfit',sans-serif",
          fontSize: 18,
          fontWeight: 800,
          color: "#0f172a",
          lineHeight: 1.45,
          marginBottom: 14,
          flex: 1,
          letterSpacing: "-0.3px"
        }}
      >
        {job.title || "Untitled Role"}
      </h3>

      {/* Meta */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginBottom: 14
        }}
      >
        <MetaRow icon="🏢" text={job.company || "Company not listed"} />
        {job.location && <MetaRow icon="📍" text={job.location} />}
        {job.salary && <MetaRow icon="💰" text={job.salary} />}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap"
          }}
        >
          <span
            style={{
              padding: "3px 10px",
              background: "rgba(30,111,212,0.07)",
              color: C.ocean,
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              border: `1px solid ${C.borderMd}`
            }}
          >
            {EXP_LABEL[job.experience_level] ||
              job.experience_level}
          </span>

          {job.exp_required && (
            <span style={{ fontSize: 11, color: "#94a3b8" }}>
              req. {job.exp_required}
            </span>
          )}
        </div>
      </div>

      {/* Match block */}
      {job.match && (
        <div
          style={{
            padding: "14px",
            background: `${job.match.bar_color}08`,
            border: `1px solid ${job.match.bar_color}25`,
            borderRadius: 12,
            marginBottom: 14
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8
            }}
          >
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase"
              }}
            >
              Application Match
            </span>

            <span
              style={{
                fontFamily: "'Outfit',sans-serif",
                fontSize: 20,
                fontWeight: 800,
                color: job.match.bar_color
              }}
            >
              {job.match.score}%
            </span>
          </div>

          <div
            style={{
              height: 5,
              background: "rgba(30,111,212,0.08)",
              borderRadius: 4,
              overflow: "hidden"
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${job.match.score}%`,
                background: job.match.bar_color,
                borderRadius: 4
              }}
            />
          </div>
        </div>
      )}

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: "auto"
        }}
      >
        <button
          onClick={() => sendJobToWhatsApp(job)}
          style={{
            padding: "10px 13px",
            background: "rgba(37,211,102,0.07)",
            border: "1px solid rgba(37,211,102,0.2)",
            color: "#16a34a",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          📲
        </button>

        <a
          href={job.apply_link}
          target="_blank"
          rel="noreferrer"
          style={{
            flex: 1,
            display: "block",
            textAlign: "center",
            padding: "12px",
            background:
              "linear-gradient(135deg,#1e6fd4,#1558b0)",
            color: "white",
            borderRadius: 12,
            fontSize: 13.5,
            fontWeight: 700,
            textDecoration: "none",
            boxShadow:
              "0 4px 14px rgba(30,111,212,0.25)"
          }}
        >
          Apply Now →
        </a>
      </div>
    </div>
  );
})}
```

                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ── COURSES ─────────────────────────────────────────────── */}
            {mode === "courses" && (
              <div className="fade-up">
                <div style={{ marginBottom:32 }}>
                  <div className="page-eyebrow">Free Learning</div>
                  <h1 className="page-title">Free Courses</h1>
                  <p className="page-subtitle">YouTube, Coursera, edX, Simplilearn & Google — free resources only.</p>
                </div>

                <div style={{ display:"flex", border:`1.5px solid ${C.borderMd}`, borderRadius:14, overflow:"hidden", marginBottom:32, background:"white", boxShadow:"0 2px 12px rgba(30,111,212,0.07)" }}>
                  <div style={{ display:"flex", alignItems:"center", paddingLeft:18, color:"#94a3b8", fontSize:18 }}>🔍</div>
                  <input value={courseKeyword} onChange={e => setCourseKeyword(e.target.value)} onKeyDown={e => e.key==="Enter" && handleCourseSearch()}
                    placeholder="e.g. Data Analyst, Python, Machine Learning…"
                    style={{ flex:1, padding:"14px 14px", background:"none", border:"none", fontSize:14, color:"#0f172a", fontFamily:"'Plus Jakarta Sans',sans-serif", outline:"none" }} />
                  <button onClick={handleCourseSearch} disabled={courseLoading} className="btn-primary"
                    style={{ borderRadius:0, padding:"14px 28px", fontSize:13.5, display:"flex", alignItems:"center", gap:8, whiteSpace:"nowrap", flexShrink:0 }}>
                    {courseLoading ? <><Spinner />Searching…</> : "Search →"}
                  </button>
                </div>

                {courses.length > 0 && (
                  <>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:10 }}>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                        {[["all",`All (${courses.length})`], ...Object.entries(byPlatform).map(([p,c])=>[p,`${p} (${c})`])].map(([key,label]) => (
                          <button key={key} onClick={() => setFilterPlatform(key)} style={{ padding:"5px 13px", borderRadius:20, fontSize:11.5, fontWeight:700, border:`1.5px solid ${filterPlatform===key?C.ocean:"rgba(30,111,212,0.15)"}`, background:filterPlatform===key?C.ocean:"white", color:filterPlatform===key?"white":"#64748b", cursor:"pointer", transition:"all .15s" }}>{label}</button>
                        ))}
                      </div>
                      <div style={{ display:"flex", gap:6 }}>
                        {[["platform","Platform"],["rating","⭐ Rating"]].map(([k,l]) => (
                          <button key={k} onClick={() => setSortCourses(k)} style={{ padding:"5px 12px", background:sortCourses===k?"rgba(30,111,212,0.08)":"white", border:`1.5px solid ${sortCourses===k?C.ocean:"rgba(30,111,212,0.15)"}`, borderRadius:8, fontSize:11.5, color:sortCourses===k?C.ocean:"#64748b", cursor:"pointer", fontWeight:600 }}>{l}</button>
                        ))}
                      </div>
                    </div>
                    <div className="card-grid">
                      {filteredCourses.map((course, i) => {
                        const pCfg = PLATFORM_CONFIG[course.platform] || { color:"#64748b", icon:"○" };
                        return (
                          <div key={i} className="job-card" style={{ background:"white", border:`1px solid ${C.border}`, borderRadius:14, padding:22, display:"flex", flexDirection:"column", boxShadow:"0 1px 3px rgba(30,111,212,0.06)", animation:`fadeUp .4s ${Math.min(i*0.03,0.35)}s both cubic-bezier(.22,1,.36,1)` }}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                              <span style={{ padding:"3px 10px", background:`${pCfg.color}15`, color:pCfg.color, borderRadius:20, fontSize:10.5, fontWeight:700, border:`1px solid ${pCfg.color}30` }}>{pCfg.icon} {course.platform}</span>
                              {course.free_type && <span style={{ padding:"3px 8px", background:"rgba(13,148,136,0.08)", color:"#0d9488", borderRadius:6, fontSize:10, fontWeight:700, border:"1px solid rgba(13,148,136,0.2)" }}>{course.free_type}</span>}
                            </div>
                            <h3 style={{ fontFamily:"'Outfit',sans-serif", fontSize:15, fontWeight:700, color:"#0f172a", lineHeight:1.45, marginBottom:12, flex:1, letterSpacing:"-0.2px" }}>{course.title || "Untitled Course"}</h3>
                            <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:14 }}>
                              {course.instructor && <MetaRow icon="👤" text={course.instructor} />}
                              {course.duration   && <MetaRow icon="⏱" text={course.duration} />}
                              {course.rating     && <MetaRow icon="⭐" text={course.rating} />}
                              {course.views      && <MetaRow icon="👁" text={course.views} />}
                            </div>
                            <a href={course.url} target="_blank" rel="noreferrer"
                              style={{ display:"block", textAlign:"center", padding:"10px", background:`${pCfg.color}10`, border:`1px solid ${pCfg.color}30`, color:pCfg.color, borderRadius:10, fontSize:13, fontWeight:700, textDecoration:"none", transition:"background .15s" }}
                              onMouseEnter={e => e.currentTarget.style.background=`${pCfg.color}22`}
                              onMouseLeave={e => e.currentTarget.style.background=`${pCfg.color}10`}>
                              Open Course →
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {!courseStatus && (
                  <div style={{ marginTop:8 }}>
                    <p style={{ fontSize:11, color:"#94a3b8", marginBottom:14, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px" }}>Platforms covered</p>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:10 }}>
                      {Object.entries(PLATFORM_CONFIG).map(([name,cfg]) => (
                        <div key={name} style={{ padding:"18px 12px", background:"white", border:`1px solid ${C.border}`, borderRadius:12, textAlign:"center", boxShadow:"0 1px 3px rgba(30,111,212,0.04)" }}>
                          <div style={{ fontSize:22, marginBottom:6 }}>{cfg.icon}</div>
                          <div style={{ fontSize:11, color:cfg.color, fontWeight:700 }}>{name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!courseLoading && courses.length===0 && courseStatus && (
                  <div style={{ textAlign:"center", padding:"70px 0" }}>
                    <div style={{ fontSize:48, marginBottom:14 }}>🎓</div>
                    <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:700, color:"#94a3b8" }}>No courses found</div>
                    <div style={{ fontSize:13, color:"#cbd5e1", marginTop:6 }}>Try a different keyword</div>
                  </div>
                )}
              </div>
            )}

            {/* ── JOB ALERTS ──────────────────────────────────────────── */}
            {mode === "alerts" && (
              <div className="fade-up">
                <div style={{ marginBottom:28 }}>
                  <div className="page-eyebrow">Notifications</div>
                  <h1 className="page-title">Job Alerts</h1>
                  <p className="page-subtitle">Set up alerts — we search job portals automatically and notify you here when new jobs match.</p>
                </div>

                {/* Create Alert */}
                <div style={{ background:"white", border:`1px solid ${C.border}`, padding:26, borderRadius:16, marginBottom:28, boxShadow:"0 1px 3px rgba(30,111,212,0.06)", maxWidth:560 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"1px", marginBottom:16 }}>➕ Create New Alert</div>
                  <input value={alertRole} onChange={e => setAlertRole(e.target.value)} placeholder="Role (e.g. Data Engineer, ML Engineer)" className="dark-input" style={{ marginBottom:10 }} />
                  <input value={alertLocation} onChange={e => setAlertLocation(e.target.value)} placeholder="Location (leave blank for all)" className="dark-input" style={{ marginBottom:10 }} />
                  <select value={alertExp} onChange={e => setAlertExp(e.target.value)} className="dark-input" style={{ marginBottom:16 }}>
                    {EXP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <button onClick={createJobAlert} disabled={alertLoading} className="btn-primary" style={{ width:"100%" }}>
                    {alertLoading ? "Creating…" : "Create Alert →"}
                  </button>
                </div>

                {/* My Alerts */}
                <div style={{ marginBottom:32 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"1px", marginBottom:14 }}>My Alerts ({myAlerts.length})</div>
                  {myAlerts.length === 0 ? (
                    <div style={{ color:"#cbd5e1", fontSize:13, padding:"24px 0", textAlign:"center" }}>No alerts yet — create your first alert above</div>
                  ) : (
                    myAlerts.map((alertItem, i) => (
                      <div key={i} style={{ background:"white", border:`1px solid ${C.border}`, padding:"16px 20px", borderRadius:12, marginBottom:10, boxShadow:"0 1px 3px rgba(30,111,212,0.04)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:700, color:"#0f172a", marginBottom:3 }}>{alertItem.role}</div>
                          <div style={{ fontSize:12, color:"#94a3b8" }}>
                            {alertItem.location || "All locations"} · {alertItem.experience_level}
                            {alertItem.last_checked && <span> · Last checked: {new Date(alertItem.last_checked).toLocaleDateString()}</span>}
                          </div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                          {alertItem.last_notified_count > 0 && (
                            <div style={{ padding:"4px 12px", background:"rgba(13,148,136,0.08)", border:"1px solid rgba(13,148,136,0.2)", borderRadius:20, fontSize:11.5, fontWeight:700, color:"#0d9488" }}>
                              {alertItem.last_notified_count} new
                            </div>
                          )}
                          <button onClick={() => toggleAlert(alertItem._id)} style={{ padding:"5px 12px", background: alertItem.is_active ? "rgba(30,111,212,0.08)" : "rgba(100,116,139,0.08)", border:`1px solid ${alertItem.is_active ? "rgba(30,111,212,0.2)" : "rgba(100,116,139,0.2)"}`, borderRadius:8, fontSize:11.5, fontWeight:700, color: alertItem.is_active ? C.ocean : "#94a3b8", cursor:"pointer" }}>
                            {alertItem.is_active ? "Active" : "Paused"}
                          </button>
                          <button onClick={() => deleteAlert(alertItem._id)} style={{ padding:"5px 10px", background:"rgba(225,29,72,0.06)", border:"1px solid rgba(225,29,72,0.2)", borderRadius:8, fontSize:13, color:"#e11d48", cursor:"pointer" }}>✕</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Notifications Inbox */}
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"1px" }}>
                      🔔 Notifications {notificationCount > 0 && <span style={{ background:"#e11d48", color:"white", borderRadius:"50%", fontSize:10, padding:"1px 6px", marginLeft:6 }}>{notificationCount}</span>}
                    </div>
                    {notificationCount > 0 && (
                      <button onClick={markAllRead} style={{ fontSize:12, color:C.ocean, background:"none", border:"none", cursor:"pointer", fontWeight:700 }}>Mark all read</button>
                    )}
                  </div>

                  {notifLoading ? (
                    <div style={{ textAlign:"center", padding:"32px 0", color:"#94a3b8" }}><Spinner /> Loading…</div>
                  ) : notifications.length === 0 ? (
                    <div style={{ textAlign:"center", padding:"40px 0" }}>
                      <div style={{ fontSize:40, marginBottom:12 }}>🔔</div>
                      <div style={{ fontSize:14, color:"#94a3b8", fontWeight:600 }}>No notifications yet</div>
                      <div style={{ fontSize:12, color:"#cbd5e1", marginTop:4 }}>Create an alert above — we'll notify you when matching jobs are found</div>
                    </div>
                  ) : (
                    notifications.map((notif, i) => (
                      <div key={i} style={{ background: notif.is_read ? "white" : "rgba(30,111,212,0.03)", border:`1px solid ${notif.is_read ? C.border : "rgba(30,111,212,0.25)"}`, borderRadius:12, marginBottom:10, overflow:"hidden", boxShadow:"0 1px 3px rgba(30,111,212,0.06)" }}>
                        {/* Notif header */}
                        <div style={{ padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, cursor:"pointer" }}
                          onClick={() => { setExpandedNotif(expandedNotif === notif._id ? null : notif._id); if (!notif.is_read) markOneRead(notif._id); }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10, flex:1, minWidth:0 }}>
                            {!notif.is_read && <div style={{ width:8, height:8, borderRadius:"50%", background:C.ocean, flexShrink:0 }} />}
                            <div style={{ minWidth:0 }}>
                              <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:14, fontWeight:700, color:"#0f172a" }}>{notif.title}</div>
                              <div style={{ fontSize:11.5, color:"#94a3b8", marginTop:2 }}>
                                {new Date(notif.created_at).toLocaleString()} · {notif.jobs?.length || 0} jobs
                              </div>
                            </div>
                          </div>
                          <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                            {notif.jobs?.length > 0 && (
                              <button onClick={e => { e.stopPropagation(); sendNotifJobsToWhatsApp(notif.jobs); }} style={{ padding:"5px 10px", background:"rgba(37,211,102,0.08)", border:"1px solid rgba(37,211,102,0.25)", borderRadius:8, fontSize:12, color:"#16a34a", fontWeight:700, cursor:"pointer" }}>📲</button>
                            )}
                            <button onClick={e => { e.stopPropagation(); deleteNotification(notif._id); }} style={{ padding:"5px 8px", background:"rgba(225,29,72,0.06)", border:"1px solid rgba(225,29,72,0.15)", borderRadius:8, fontSize:12, color:"#e11d48", cursor:"pointer" }}>✕</button>
                            <span style={{ fontSize:12, color:"#94a3b8" }}>{expandedNotif === notif._id ? "▲" : "▼"}</span>
                          </div>
                        </div>

                        {/* Expanded jobs list */}
                        {expandedNotif === notif._id && notif.jobs?.length > 0 && (
                          <div style={{ borderTop:`1px solid ${C.border}`, padding:"12px 18px 16px" }}>
                            {notif.jobs.map((job, j) => (
                              <div key={j} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom: j < notif.jobs.length - 1 ? `1px solid ${C.border}` : "none", gap:12 }}>
                                <div style={{ minWidth:0, flex:1 }}>
                                  <div style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>{job.title}</div>
                                  <div style={{ fontSize:11.5, color:"#64748b", marginTop:2 }}>🏢 {job.company || "?"} · 📍 {job.location || "?"}</div>
                                  {job.salary && <div style={{ fontSize:11, color:"#0d9488", marginTop:1 }}>💰 {job.salary}</div>}
                                </div>
                                <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                                  <span style={{ padding:"3px 8px", background:"rgba(30,111,212,0.08)", color:C.ocean, borderRadius:6, fontSize:10, fontWeight:700 }}>{job.source}</span>
                                  <a href={job.apply_link} target="_blank" rel="noreferrer"
                                    style={{ padding:"6px 14px", background:"linear-gradient(135deg,#1e6fd4,#1a5cb8)", color:"white", borderRadius:8, fontSize:12, fontWeight:700, textDecoration:"none" }}>
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

            {/* ── Sub-pages ──────────────────────────────────────────── */}
            {mode === "ats"       && <ResumeMaker />}
            {mode === "interview" && <InterviewPrep />}
            {mode === "users"     && user?.level === 0 && <UserManagement currentUser={user} />}
            {mode === "linkedin"  && <LinkedinAnalyzer />}
            {mode === "portfolio" && <PortfolioGenerator />}
            {mode === "stocks"    && <StockPredictor />}

          </main>
        </div>
      </div>
    </>
  );
}
