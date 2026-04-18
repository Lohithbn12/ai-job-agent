// ─── navConfig.js ─────────────────────────────────────────────────────────────
// Navigation items, home dashboard cards, and mode labels for the sidebar/topbar.

export const NAV_ALL = [
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

export const HOME_CARDS = [
  { icon: "💼", title: "Job Search",        desc: "Parse resume & search 5 job boards simultaneously", key: "jobs",      bg: "rgba(30,111,212,0.08)",  border: "rgba(30,111,212,0.18)" },
  { icon: "📄", title: "Resume Maker",      desc: "ATS-optimized builder with 150 templates",          key: "ats",       bg: "rgba(13,148,136,0.08)",  border: "rgba(13,148,136,0.18)" },
  { icon: "🎓", title: "Free Courses",      desc: "YouTube, Coursera, edX & Google — free only",       key: "courses",   bg: "rgba(14,165,233,0.08)",  border: "rgba(14,165,233,0.18)" },
  { icon: "🎯", title: "Interview Prep",    desc: "Q&A predictor · Aptitude · Coding rounds",          key: "interview", bg: "rgba(139,92,246,0.08)",  border: "rgba(139,92,246,0.18)" },
  { icon: "🔗", title: "LinkedIn Analyzer", desc: "Score & optimize your LinkedIn profile",            key: "linkedin",  bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.18)" },
  { icon: "🌐", title: "Portfolio Builder", desc: "Turn your resume into a live website",              key: "portfolio", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.18)" },
  { icon: "📈", title: "Stock Predictor",   desc: "AI-powered market trend analysis",                 key: "stocks",    bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.18)" },
  { icon: "🔔", title: "Job Alerts",        desc: "Role-based automatic notifications",               key: "alerts",    bg: "rgba(217,70,239,0.08)",  border: "rgba(217,70,239,0.18)" },
];

export const MODE_LABELS = {
  home:      "Dashboard",
  jobs:      "Job Search",
  courses:   "Free Courses",
  ats:       "Resume Maker",
  interview: "Interview Prep",
  alerts:    "Job Alerts",
  linkedin:  "LinkedIn Analyzer",
  portfolio: "Portfolio",
  stocks:    "Stock Predictor",
  users:     "User Mgmt",
};
