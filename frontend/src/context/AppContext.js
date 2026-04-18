// ─── AppContext.js ─────────────────────────────────────────────────────────────
// Global state management via React Context API.
//
// Provides one central store for state that needs to be shared across multiple
// components without prop-drilling:
//   • auth        — current user + session status
//   • ui          — active mode (page), sidebar open/close
//   • jobs        — all job search results + filters
//   • courses     — course results + filters
//   • alerts      — user's saved job alerts
//   • notifications — inbox items + unread count
//   • activity    — search history + recent activity (persisted to localStorage)
//   • userStats   — platform-wide stats shown on home dashboard
//
// Usage in any component:
//   import { useAppContext } from "../context/AppContext";
//   const { state, dispatch } = useAppContext();

import React, { createContext, useContext, useReducer, useEffect } from "react";

// ─── localStorage helpers ─────────────────────────────────────────────────────
const LS_KEY = "js_app_state";

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function persistState(state) {
  try {
    // Only persist the slices we want to survive a refresh
    localStorage.setItem(LS_KEY, JSON.stringify({
      searchHistory:  state.activity.searchHistory,
      recentActivity: state.activity.recentActivity,
    }));
  } catch {}
}

// ─── Initial state ────────────────────────────────────────────────────────────
const persisted = loadPersistedState();

const INITIAL_STATE = {
  // Auth
  auth: {
    user: null,
    sessionChecked: false,
  },

  // UI
  ui: {
    mode: "home",
    sidebarOpen: false,
  },

  // Job search
  jobs: {
    file: null,
    roles: [],
    skills: [],
    weightedSkills: [],
    topSkills: [],
    keywordsUsed: [],
    selectedExps: ["0-1"],
    locations: [{ city: "", country: "" }],
    sources: ["indeed","naukri","internshala","foundit","apna","linkedin"],
    results: [],
    bySource: {},
    loading: false,      // resume parsing
    searching: false,    // job search in progress
    status: "",
    step: 1,
    filterSource: "all",
    newRole: "",
    showAllSkills: false,
  },

  // Courses
  courses: {
    keyword: "",
    results: [],
    byPlatform: {},
    loading: false,
    status: "",
    filterPlatform: "all",
    sortBy: "platform",
  },

  // Alerts
  alerts: {
    list: [],
    loading: false,
    form: {
      role: "",
      location: "",
      exp: "0-1",
      frequency: "daily",
      sources: ["linkedin","naukri"],
    },
  },

  // Notifications
  notifications: {
    list: [],
    count: 0,
    loading: false,
    expandedId: null,
  },

  // Activity — persisted to localStorage
  activity: {
    searchHistory:  persisted?.searchHistory  || [],   // [{ type, query, timestamp, resultCount }]
    recentActivity: persisted?.recentActivity || [],   // [{ type, label, icon, timestamp, meta }]
  },

  // Platform stats
  userStats: {
    total_users: 0,
    online_count: 0,
  },
};

// ─── Action types ─────────────────────────────────────────────────────────────
export const A = {
  // Auth
  SET_USER:            "SET_USER",
  SESSION_CHECKED:     "SESSION_CHECKED",

  // UI
  SET_MODE:            "SET_MODE",
  SET_SIDEBAR:         "SET_SIDEBAR",

  // Jobs
  SET_JOB_FILE:        "SET_JOB_FILE",
  SET_ROLES:           "SET_ROLES",
  SET_SKILLS:          "SET_SKILLS",
  SET_JOB_LOADING:     "SET_JOB_LOADING",
  SET_JOB_SEARCHING:   "SET_JOB_SEARCHING",
  SET_JOB_RESULTS:     "SET_JOB_RESULTS",
  SET_JOB_STATUS:      "SET_JOB_STATUS",
  SET_JOB_STEP:        "SET_JOB_STEP",
  SET_JOB_FILTER:      "SET_JOB_FILTER",
  SET_NEW_ROLE:        "SET_NEW_ROLE",
  SET_EXPS:            "SET_EXPS",
  SET_LOCATIONS:       "SET_LOCATIONS",
  SET_SOURCES:         "SET_SOURCES",

  // Courses
  SET_COURSE_KEYWORD:  "SET_COURSE_KEYWORD",
  SET_COURSE_LOADING:  "SET_COURSE_LOADING",
  SET_COURSE_RESULTS:  "SET_COURSE_RESULTS",
  SET_COURSE_STATUS:   "SET_COURSE_STATUS",
  SET_COURSE_FILTER:   "SET_COURSE_FILTER",
  SET_COURSE_SORT:     "SET_COURSE_SORT",

  // Alerts
  SET_ALERTS:          "SET_ALERTS",
  SET_ALERT_LOADING:   "SET_ALERT_LOADING",
  SET_ALERT_FORM:      "SET_ALERT_FORM",

  // Notifications
  SET_NOTIF_LIST:      "SET_NOTIF_LIST",
  SET_NOTIF_COUNT:     "SET_NOTIF_COUNT",
  SET_NOTIF_LOADING:   "SET_NOTIF_LOADING",
  SET_NOTIF_EXPANDED:  "SET_NOTIF_EXPANDED",
  MARK_NOTIF_READ:     "MARK_NOTIF_READ",
  MARK_ALL_READ:       "MARK_ALL_READ",
  DELETE_NOTIF:        "DELETE_NOTIF",

  // Activity
  ADD_SEARCH_HISTORY:  "ADD_SEARCH_HISTORY",
  ADD_ACTIVITY:        "ADD_ACTIVITY",
  CLEAR_HISTORY:       "CLEAR_HISTORY",
  CLEAR_ACTIVITY:      "CLEAR_ACTIVITY",

  // Stats
  SET_USER_STATS:      "SET_USER_STATS",
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, { type, payload }) {
  switch (type) {

    // ── Auth ──────────────────────────────────────────────────────────────────
    case A.SET_USER:
      return { ...state, auth: { ...state.auth, user: payload } };
    case A.SESSION_CHECKED:
      return { ...state, auth: { ...state.auth, sessionChecked: true } };

    // ── UI ────────────────────────────────────────────────────────────────────
    case A.SET_MODE:
      return { ...state, ui: { ...state.ui, mode: payload } };
    case A.SET_SIDEBAR:
      return { ...state, ui: { ...state.ui, sidebarOpen: payload } };

    // ── Jobs ──────────────────────────────────────────────────────────────────
    case A.SET_JOB_FILE:
      return { ...state, jobs: { ...state.jobs, file: payload } };
    case A.SET_ROLES:
      return { ...state, jobs: { ...state.jobs, roles: payload } };
    case A.SET_SKILLS:
      return { ...state, jobs: { ...state.jobs, ...payload } };
    case A.SET_JOB_LOADING:
      return { ...state, jobs: { ...state.jobs, loading: payload } };
    case A.SET_JOB_SEARCHING:
      return { ...state, jobs: { ...state.jobs, searching: payload } };
    case A.SET_JOB_RESULTS:
      return { ...state, jobs: { ...state.jobs, ...payload } };
    case A.SET_JOB_STATUS:
      return { ...state, jobs: { ...state.jobs, status: payload } };
    case A.SET_JOB_STEP:
      return { ...state, jobs: { ...state.jobs, step: payload } };
    case A.SET_JOB_FILTER:
      return { ...state, jobs: { ...state.jobs, filterSource: payload } };
    case A.SET_NEW_ROLE:
      return { ...state, jobs: { ...state.jobs, newRole: payload } };
    case A.SET_EXPS:
      return { ...state, jobs: { ...state.jobs, selectedExps: payload } };
    case A.SET_LOCATIONS:
      return { ...state, jobs: { ...state.jobs, locations: payload } };
    case A.SET_SOURCES:
      return { ...state, jobs: { ...state.jobs, sources: payload } };

    // ── Courses ───────────────────────────────────────────────────────────────
    case A.SET_COURSE_KEYWORD:
      return { ...state, courses: { ...state.courses, keyword: payload } };
    case A.SET_COURSE_LOADING:
      return { ...state, courses: { ...state.courses, loading: payload } };
    case A.SET_COURSE_RESULTS:
      return { ...state, courses: { ...state.courses, ...payload } };
    case A.SET_COURSE_STATUS:
      return { ...state, courses: { ...state.courses, status: payload } };
    case A.SET_COURSE_FILTER:
      return { ...state, courses: { ...state.courses, filterPlatform: payload } };
    case A.SET_COURSE_SORT:
      return { ...state, courses: { ...state.courses, sortBy: payload } };

    // ── Alerts ────────────────────────────────────────────────────────────────
    case A.SET_ALERTS:
      return { ...state, alerts: { ...state.alerts, list: payload } };
    case A.SET_ALERT_LOADING:
      return { ...state, alerts: { ...state.alerts, loading: payload } };
    case A.SET_ALERT_FORM:
      return { ...state, alerts: { ...state.alerts, form: { ...state.alerts.form, ...payload } } };

    // ── Notifications ─────────────────────────────────────────────────────────
    case A.SET_NOTIF_LIST:
      return { ...state, notifications: { ...state.notifications, list: payload } };
    case A.SET_NOTIF_COUNT:
      return { ...state, notifications: { ...state.notifications, count: payload } };
    case A.SET_NOTIF_LOADING:
      return { ...state, notifications: { ...state.notifications, loading: payload } };
    case A.SET_NOTIF_EXPANDED:
      return { ...state, notifications: { ...state.notifications, expandedId: payload } };
    case A.MARK_NOTIF_READ:
      return {
        ...state,
        notifications: {
          ...state.notifications,
          list: state.notifications.list.map(n => n._id === payload ? { ...n, is_read: true } : n),
          count: Math.max(0, state.notifications.count - 1),
        },
      };
    case A.MARK_ALL_READ:
      return {
        ...state,
        notifications: {
          ...state.notifications,
          list: state.notifications.list.map(n => ({ ...n, is_read: true })),
          count: 0,
        },
      };
    case A.DELETE_NOTIF:
      return {
        ...state,
        notifications: {
          ...state.notifications,
          list: state.notifications.list.filter(n => n._id !== payload),
        },
      };

    // ── Activity (persisted) ──────────────────────────────────────────────────
    case A.ADD_SEARCH_HISTORY: {
      const entry = { ...payload, timestamp: Date.now() };
      const next = [entry, ...state.activity.searchHistory].slice(0, 50);
      return { ...state, activity: { ...state.activity, searchHistory: next } };
    }
    case A.ADD_ACTIVITY: {
      const entry = { ...payload, timestamp: Date.now() };
      const next = [entry, ...state.activity.recentActivity].slice(0, 30);
      return { ...state, activity: { ...state.activity, recentActivity: next } };
    }
    case A.CLEAR_HISTORY:
      return { ...state, activity: { ...state.activity, searchHistory: [] } };
    case A.CLEAR_ACTIVITY:
      return { ...state, activity: { ...state.activity, recentActivity: [] } };

    // ── Stats ─────────────────────────────────────────────────────────────────
    case A.SET_USER_STATS:
      return { ...state, userStats: payload };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Persist activity slice on every change
  useEffect(() => {
    persistState(state);
  }, [state.activity]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside <AppProvider>");
  return ctx;
}

// ─── Selector hooks (convenience) ─────────────────────────────────────────────
export const useAuth          = () => useAppContext().state.auth;
export const useUI            = () => useAppContext().state.ui;
export const useJobsState     = () => useAppContext().state.jobs;
export const useCoursesState  = () => useAppContext().state.courses;
export const useAlertsState   = () => useAppContext().state.alerts;
export const useNotifState    = () => useAppContext().state.notifications;
export const useActivityState = () => useAppContext().state.activity;
export const useUserStats     = () => useAppContext().state.userStats;
