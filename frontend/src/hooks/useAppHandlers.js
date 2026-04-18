// ─── useAppHandlers.js (v2) ───────────────────────────────────────────────────
// All API call logic — now dispatches to AppContext global store instead of
// managing local useState. Also records search history + recent activity
// automatically on every successful operation.
//
// Import and call once at the App root:
//   const h = useAppHandlers();
// Then pass individual handlers down, or consume context directly in leaves.

import { useCallback } from "react";
import axios from "axios";
import { useAppContext, A } from "../context/AppContext";
import { API } from "../constants";

export default function useAppHandlers() {
  const { state, dispatch } = useAppContext();
  const { jobs, courses, alerts } = state;

  // ── Auth header ────────────────────────────────────────────────────────────
  const authHeader = useCallback(
    () => ({ Authorization: `Bearer ${localStorage.getItem("js_token")}` }),
    []
  );

  // ── Activity + search history loggers ──────────────────────────────────────
  const logActivity = useCallback((type, label, icon, meta = {}) => {
    dispatch({ type: A.ADD_ACTIVITY, payload: { type, label, icon, meta } });
  }, [dispatch]);

  const logSearch = useCallback((type, query, resultCount = 0, meta = {}) => {
    dispatch({ type: A.ADD_SEARCH_HISTORY, payload: { type, query, resultCount, meta } });
  }, [dispatch]);

  // ─────────────────────────────────────────────────────────────────────────
  // RESUME UPLOAD
  // ─────────────────────────────────────────────────────────────────────────
  const handleUpload = useCallback(async () => {
    if (!jobs.file) return alert("Please select a PDF resume");
    try {
      dispatch({ type: A.SET_JOB_LOADING, payload: true });
      dispatch({ type: A.SET_JOB_STATUS,  payload: "Parsing resume…" });

      const fd = new FormData();
      fd.append("file", jobs.file);
      const res = await axios.post(`${API}/upload-resume/`, fd);

      const allRoles  = (res.data.roles  || []).filter(r => r.length > 2);
      const allSkills = (res.data.skills || []).filter(s => s.length > 2);
      const weighted  = res.data.weighted_skills || [];
      const NOISE     = new Set(["time","hands","good","strong","knowledge","skills","experience","enterprise","team"]);
      const top       = weighted
        .filter(w => w.weight >= 0.15 && !NOISE.has(w.skill.toLowerCase()))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 8)
        .map(w => w.skill);
      const topFinal  = top.length >= 4 ? top : allSkills.slice(0, 8);

      dispatch({ type: A.SET_ROLES,  payload: allRoles });
      dispatch({ type: A.SET_SKILLS, payload: { skills: allSkills, weightedSkills: weighted, topSkills: topFinal, showAllSkills: false } });
      dispatch({ type: A.SET_JOB_STATUS, payload: allRoles.length ? `Parsed — ${allRoles.length} roles · ${topFinal.length} skills` : "Parsed — add roles below" });
      dispatch({ type: A.SET_JOB_STEP,   payload: 2 });

      logActivity("resume", `Resume parsed · ${allRoles.length} roles, ${topFinal.length} skills`, "📄", { roles: allRoles.slice(0, 3) });
    } catch {
      dispatch({ type: A.SET_JOB_STATUS, payload: "Upload failed" });
    } finally {
      dispatch({ type: A.SET_JOB_LOADING, payload: false });
    }
  }, [jobs.file, dispatch, logActivity]);

  // ─────────────────────────────────────────────────────────────────────────
  // JOB SEARCH
  // ─────────────────────────────────────────────────────────────────────────
  const handleSearch = useCallback(async () => {
    const { roles, skills, selectedExps, locations, sources, weightedSkills } = jobs;
    const keywords = roles.length ? [...roles] : skills.slice(0, 3);
    if (!keywords.length)     return alert("Add at least one job role");
    if (!sources.length)      return alert("Select at least one source");
    if (!selectedExps.length) return alert("Select an experience range");

    const locs    = locations.filter(l => l.city || l.country);
    const locStrs = locs.length ? locs.map(l => [l.city, l.country].filter(Boolean).join(", ")) : [""];

    try {
      dispatch({ type: A.SET_JOB_SEARCHING, payload: true });
      dispatch({ type: A.SET_JOB_RESULTS,   payload: { results: [], bySource: {} } });
      dispatch({ type: A.SET_JOB_FILTER,    payload: "all" });
      dispatch({ type: A.SET_JOB_STATUS,    payload: "Searching across platforms…" });

      const reqs = [];
      for (const exp of selectedExps)
        for (const loc of locStrs)
          reqs.push(
            axios.post(`${API}/search-jobs/`, {
              roles, keywords: roles, experience_level: exp,
              location: loc, sources, weighted_skills: weightedSkills, top_skills: [],
            }).then(r => r.data).catch(() => ({ jobs: [], by_source: {}, keywords_used: [] }))
          );

      const results = await Promise.all(reqs);
      const seen = new Set(), all = []; let lastKws = [];
      for (const r of results) {
        for (const j of r.jobs || []) {
          if (!seen.has(j.apply_link)) { seen.add(j.apply_link); all.push(j); }
        }
        if (r.keywords_used?.length) lastKws = r.keywords_used;
      }
      const bs = {};
      for (const j of all) { const k = j.source?.toLowerCase() || "other"; bs[k] = (bs[k] || 0) + 1; }

      dispatch({ type: A.SET_JOB_RESULTS, payload: { results: all, bySource: bs, keywordsUsed: lastKws } });
      dispatch({ type: A.SET_JOB_STATUS,  payload: `Found ${all.length} positions` });
      dispatch({ type: A.SET_JOB_STEP,    payload: 3 });

      logSearch("jobs", roles.slice(0, 3).join(", "), all.length, { exps: selectedExps, sources, locations: locStrs });
      logActivity("jobs", `Found ${all.length} jobs for "${roles[0] || keywords[0]}"`, "💼", { count: all.length, roles: roles.slice(0, 2) });
    } catch {
      dispatch({ type: A.SET_JOB_STATUS, payload: "Search failed" });
    } finally {
      dispatch({ type: A.SET_JOB_SEARCHING, payload: false });
    }
  }, [jobs, dispatch, logSearch, logActivity]);

  // ─────────────────────────────────────────────────────────────────────────
  // COURSE SEARCH
  // ─────────────────────────────────────────────────────────────────────────
  const handleCourseSearch = useCallback(async () => {
    const kw = courses.keyword.trim();
    if (!kw) return alert("Enter a keyword");
    try {
      dispatch({ type: A.SET_COURSE_LOADING, payload: true });
      dispatch({ type: A.SET_COURSE_RESULTS, payload: { results: [], byPlatform: {} } });
      dispatch({ type: A.SET_COURSE_FILTER,  payload: "all" });
      dispatch({ type: A.SET_COURSE_STATUS,  payload: "Searching…" });

      const res = await axios.post(`${API}/search-courses/`, { keyword: kw });
      dispatch({ type: A.SET_COURSE_RESULTS, payload: { results: res.data.courses || [], byPlatform: res.data.by_platform || {} } });
      dispatch({ type: A.SET_COURSE_STATUS,  payload: `Found ${res.data.total} free courses` });

      logSearch("courses", kw, res.data.total || 0);
      logActivity("courses", `Searched courses for "${kw}"`, "🎓", { total: res.data.total });
    } catch {
      dispatch({ type: A.SET_COURSE_STATUS, payload: "Search failed" });
    } finally {
      dispatch({ type: A.SET_COURSE_LOADING, payload: false });
    }
  }, [courses.keyword, dispatch, logSearch, logActivity]);

  // ─────────────────────────────────────────────────────────────────────────
  // USER STATS
  // ─────────────────────────────────────────────────────────────────────────
  const fetchUserStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/auth/stats/users`, { headers: authHeader() });
      dispatch({ type: A.SET_USER_STATS, payload: res.data });
    } catch {}
  }, [authHeader, dispatch]);

  // ─────────────────────────────────────────────────────────────────────────
  // ALERTS
  // ─────────────────────────────────────────────────────────────────────────
  const fetchMyAlerts = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/job-alert/my-alerts`, { headers: authHeader() });
      dispatch({ type: A.SET_ALERTS, payload: res.data.alerts || [] });
    } catch {}
  }, [authHeader, dispatch]);

  const createJobAlert = useCallback(async () => {
    const { role, location, exp, frequency, sources: alertSrcs } = alerts.form;
    if (!role.trim()) return alert("Please enter a role");
    try {
      dispatch({ type: A.SET_ALERT_LOADING, payload: true });
      await axios.post(`${API}/job-alert/create`,
        { role, location, experience_level: exp, sources: alertSrcs, frequency },
        { headers: authHeader() }
      );
      dispatch({ type: A.SET_ALERT_FORM, payload: { role: "", location: "" } });
      fetchMyAlerts();
      logActivity("alert", `Alert created for "${role}"`, "🔔", { role, location });
      alert("Alert created! We'll notify you when new jobs are found.");
    } catch { alert("Failed to create alert"); }
    finally { dispatch({ type: A.SET_ALERT_LOADING, payload: false }); }
  }, [alerts.form, authHeader, dispatch, fetchMyAlerts, logActivity]);

  const deleteAlert = useCallback(async (id) => {
    try {
      await axios.delete(`${API}/job-alert/${id}`, { headers: authHeader() });
      fetchMyAlerts();
    } catch {}
  }, [authHeader, fetchMyAlerts]);

  const toggleAlert = useCallback(async (id) => {
    try {
      await axios.patch(`${API}/job-alert/${id}/toggle`, {}, { headers: authHeader() });
      fetchMyAlerts();
    } catch {}
  }, [authHeader, fetchMyAlerts]);

  // ─────────────────────────────────────────────────────────────────────────
  // NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────────────────
  const fetchNotificationCount = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/notifications/count`, { headers: authHeader() });
      dispatch({ type: A.SET_NOTIF_COUNT, payload: res.data.count || 0 });
    } catch {}
  }, [authHeader, dispatch]);

  const fetchNotifications = useCallback(async () => {
    try {
      dispatch({ type: A.SET_NOTIF_LOADING, payload: true });
      const res = await axios.get(`${API}/notifications/list`, { headers: authHeader() });
      dispatch({ type: A.SET_NOTIF_LIST, payload: res.data.notifications || [] });
    } catch {}
    finally { dispatch({ type: A.SET_NOTIF_LOADING, payload: false }); }
  }, [authHeader, dispatch]);

  const markAllRead = useCallback(async () => {
    try {
      await axios.patch(`${API}/notifications/clear`, {}, { headers: authHeader() });
      dispatch({ type: A.MARK_ALL_READ });
    } catch {}
  }, [authHeader, dispatch]);

  const markOneRead = useCallback(async (id) => {
    try {
      await axios.patch(`${API}/notifications/read/${id}`, {}, { headers: authHeader() });
      dispatch({ type: A.MARK_NOTIF_READ, payload: id });
    } catch {}
  }, [authHeader, dispatch]);

  const deleteNotification = useCallback(async (id) => {
    try {
      await axios.delete(`${API}/notifications/delete/${id}`, { headers: authHeader() });
      dispatch({ type: A.DELETE_NOTIF, payload: id });
    } catch {}
  }, [authHeader, dispatch]);

  // ─────────────────────────────────────────────────────────────────────────
  // SIMPLE STATE DISPATCH HELPERS
  // ─────────────────────────────────────────────────────────────────────────
  const toggleExp = v => dispatch({
    type: A.SET_EXPS,
    payload: jobs.selectedExps.includes(v)
      ? jobs.selectedExps.filter(e => e !== v)
      : [...jobs.selectedExps, v],
  });

  const toggleSource = s => dispatch({
    type: A.SET_SOURCES,
    payload: jobs.sources.includes(s)
      ? jobs.sources.filter(x => x !== s)
      : [...jobs.sources, s],
  });

  const addLocation    = () => dispatch({ type: A.SET_LOCATIONS, payload: [...jobs.locations, { city: "", country: "" }] });
  const removeLocation = i  => dispatch({ type: A.SET_LOCATIONS, payload: jobs.locations.filter((_, idx) => idx !== i) });
  const updateLocation = (i, f, v) => dispatch({
    type: A.SET_LOCATIONS,
    payload: jobs.locations.map((l, idx) => idx === i ? { ...l, [f]: v } : l),
  });
  const addRole  = () => {
    const r = jobs.newRole.trim();
    if (r && !jobs.roles.includes(r)) dispatch({ type: A.SET_ROLES, payload: [...jobs.roles, r] });
    dispatch({ type: A.SET_NEW_ROLE, payload: "" });
  };
  const removeRole = r => dispatch({ type: A.SET_ROLES, payload: jobs.roles.filter(x => x !== r) });

  // ─────────────────────────────────────────────────────────────────────────
  // WHATSAPP SENDERS
  // ─────────────────────────────────────────────────────────────────────────
  const sendJobToWhatsApp = job => {
    const msg = `💼 *${job.title || "Job Opening"}*\n🏢 ${job.company || "?"}\n${job.location ? `📍 ${job.location}\n` : ""}${job.salary ? `💰 ${job.salary}\n` : ""}🎯 ${job.exp_required || job.experience_level || "?"}\n🔗 ${job.apply_link}\n📌 ${job.source}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const sendAllJobsToWhatsApp = (visibleJobs) => {
    const msg = visibleJobs.slice(0, 20).map((j, i) =>
      `${i + 1}. *${j.title}* @ ${j.company || "?"}\n   📍 ${j.location || "?"} · ${j.exp_required || j.experience_level || "?"}\n   🔗 ${j.apply_link}`
    ).join("\n\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(`🚀 ${visibleJobs.length} Job Matches\n\n${msg}`)}`, "_blank");
  };

  const sendNotifJobsToWhatsApp = (notifJobs) => {
    const msg = notifJobs.slice(0, 15).map((j, i) =>
      `${i + 1}. *${j.title}* @ ${j.company || "?"}\n   📍 ${j.location || "?"}\n   🔗 ${j.apply_link}`
    ).join("\n\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(`🔔 New Job Alert Matches\n\n${msg}`)}`, "_blank");
  };

  // ─────────────────────────────────────────────────────────────────────────
  // DERIVED / FILTERED LISTS (computed from global state)
  // ─────────────────────────────────────────────────────────────────────────
  const visibleJobs = (
    jobs.filterSource === "all"
      ? jobs.results
      : jobs.results.filter(j => j.source?.toLowerCase() === jobs.filterSource)
  ).slice().sort((a, b) => (a.exp_mismatch ? 1 : 0) - (b.exp_mismatch ? 1 : 0));

  const filteredCourses = (
    courses.filterPlatform === "all"
      ? courses.results
      : courses.results.filter(c => c.platform === courses.filterPlatform)
  ).slice().sort((a, b) =>
    courses.sortBy === "rating"
      ? (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0)
      : (a.platform || "").localeCompare(b.platform || "")
  );

  return {
    // Resume / jobs
    handleUpload, handleSearch,
    toggleExp, toggleSource, addLocation, removeLocation, updateLocation,
    addRole, removeRole,
    sendJobToWhatsApp, sendAllJobsToWhatsApp, visibleJobs,
    // Courses
    handleCourseSearch, filteredCourses,
    // Alerts
    fetchMyAlerts, createJobAlert, deleteAlert, toggleAlert,
    // Notifications
    fetchUserStats, fetchNotificationCount,
    fetchNotifications, markAllRead, markOneRead, deleteNotification,
    sendNotifJobsToWhatsApp,
    // Activity helpers (so App can call them directly too)
    logActivity, logSearch,
  };
}
