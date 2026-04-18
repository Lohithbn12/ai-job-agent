// ─── ActivityPanel.js ─────────────────────────────────────────────────────────
// Search History + Recent Activity panel.
//
// Reads from AppContext (activity slice) — data survives page refreshes because
// AppContext persists that slice to localStorage automatically.
//
// Two tabs:
//   "Recent Activity" — every meaningful action (upload, search, alert created…)
//   "Search History"  — job and course searches with result counts + quick-redo
//
// Props:
//   onRedoJobSearch(entry)    — called when user clicks "Redo" on a job search
//   onRedoCourseSearch(query) — called when user clicks "Redo" on a course search
//   onClose()                 — called to dismiss/hide the panel

import React, { useState } from "react";
import { useAppContext, A, useActivityState } from "../context/AppContext";

// ── Colour tokens ──────────────────────────────────────────────────────────────
const C = {
  ocean:   "#1e6fd4",
  border:  "rgba(30,111,212,0.12)",
  borderMd:"rgba(30,111,212,0.22)",
  bg:      "#f8faff",
};

// ── Relative time formatter ────────────────────────────────────────────────────
function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7)  return `${d}d ago`;
  return new Date(ts).toLocaleDateString("en-IN", { day:"numeric", month:"short" });
}

// ── Type badge colours ─────────────────────────────────────────────────────────
const TYPE_COLORS = {
  jobs:    { bg: "rgba(30,111,212,0.08)",  color: "#1e6fd4",  label: "Jobs"    },
  courses: { bg: "rgba(14,165,233,0.08)",  color: "#0ea5e9",  label: "Courses" },
  resume:  { bg: "rgba(13,148,136,0.08)",  color: "#0d9488",  label: "Resume"  },
  alert:   { bg: "rgba(217,70,239,0.08)",  color: "#d946ef",  label: "Alert"   },
  default: { bg: "rgba(100,116,139,0.08)", color: "#64748b",  label: "Action"  },
};

function TypeBadge({ type }) {
  const cfg = TYPE_COLORS[type] || TYPE_COLORS.default;
  return (
    <span style={{
      padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.color}25`,
      flexShrink: 0,
    }}>
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ActivityPanel({ onRedoJobSearch, onRedoCourseSearch, onClose }) {
  const { dispatch } = useAppContext();
  const { searchHistory, recentActivity } = useActivityState();

  const [tab, setTab] = useState("activity"); // "activity" | "history"

  const clearHistory  = () => { if (window.confirm("Clear all search history?"))  dispatch({ type: A.CLEAR_HISTORY  }); };
  const clearActivity = () => { if (window.confirm("Clear all recent activity?")) dispatch({ type: A.CLEAR_ACTIVITY }); };

  return (
    <div style={{
      background: "white",
      border: `1px solid ${C.border}`,
      borderRadius: 18,
      boxShadow: "0 16px 48px rgba(30,111,212,0.14)",
      width: "100%",
      maxWidth: 480,
      display: "flex",
      flexDirection: "column",
      maxHeight: "80vh",
      overflow: "hidden",
    }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{ padding: "18px 22px 0", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 17, fontWeight: 800, color: "#0f172a" }}>
            Activity &amp; History
          </div>
          {onClose && (
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8", lineHeight: 1 }}>✕</button>
          )}
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4 }}>
          {[["activity","🕐 Recent Activity"], ["history","🔍 Search History"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: "8px 16px",
              borderRadius: "10px 10px 0 0",
              border: "none",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              background: tab === key ? C.ocean : "transparent",
              color:      tab === key ? "white"  : "#64748b",
              transition: "all .15s",
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 22px 22px" }}>

        {/* ── RECENT ACTIVITY TAB ─────────────────────────────────────────── */}
        {tab === "activity" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                {recentActivity.length} events
              </span>
              {recentActivity.length > 0 && (
                <button onClick={clearActivity} style={{ fontSize: 11, color: "#e11d48", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>
                  Clear all
                </button>
              )}
            </div>

            {recentActivity.length === 0 ? (
              <EmptyState icon="🕐" title="No activity yet" sub="Actions like searches, uploads, and alerts will appear here." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {recentActivity.map((item, i) => (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: i === 0 ? "rgba(30,111,212,0.03)" : "transparent",
                    border: `1px solid ${i === 0 ? "rgba(30,111,212,0.10)" : "transparent"}`,
                    transition: "background .15s",
                  }}>
                    {/* Icon */}
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(30,111,212,0.06)", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 3, lineHeight: 1.4 }}>{item.label}</div>
                      {item.meta?.roles?.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>
                          {item.meta.roles.map((r, j) => (
                            <span key={j} style={{ padding: "1px 7px", background: "rgba(30,111,212,0.07)", color: C.ocean, borderRadius: 6, fontSize: 10, fontWeight: 700 }}>{r}</span>
                          ))}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{timeAgo(item.timestamp)}</div>
                    </div>
                    <TypeBadge type={item.type} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── SEARCH HISTORY TAB ──────────────────────────────────────────── */}
        {tab === "history" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                {searchHistory.length} searches
              </span>
              {searchHistory.length > 0 && (
                <button onClick={clearHistory} style={{ fontSize: 11, color: "#e11d48", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>
                  Clear all
                </button>
              )}
            </div>

            {searchHistory.length === 0 ? (
              <EmptyState icon="🔍" title="No searches yet" sub="Your job and course searches will be saved here." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {searchHistory.map((item, i) => (
                  <div key={i} style={{
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: "13px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}>
                    {/* Search icon */}
                    <div style={{ fontSize: 18, flexShrink: 0 }}>
                      {item.type === "jobs" ? "💼" : "🎓"}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.query || "—"}
                      </div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>{timeAgo(item.timestamp)}</span>
                        <span style={{ fontSize: 11, color: item.resultCount > 0 ? "#0d9488" : "#94a3b8", fontWeight: 600 }}>
                          {item.resultCount > 0 ? `${item.resultCount} results` : "0 results"}
                        </span>
                        {item.meta?.exps?.length > 0 && (
                          <span style={{ fontSize: 11, color: "#64748b" }}>{item.meta.exps.join(", ")} yrs</span>
                        )}
                      </div>
                    </div>
                    {/* Type + Redo */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                      <TypeBadge type={item.type} />
                      <button
                        onClick={() => {
                          if (item.type === "jobs" && onRedoJobSearch) onRedoJobSearch(item);
                          if (item.type === "courses" && onRedoCourseSearch) onRedoCourseSearch(item.query);
                        }}
                        style={{
                          fontSize: 10, fontWeight: 700, color: C.ocean,
                          background: "rgba(30,111,212,0.07)",
                          border: `1px solid rgba(30,111,212,0.18)`,
                          borderRadius: 6, padding: "3px 9px", cursor: "pointer",
                        }}
                      >
                        ↻ Redo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Empty state helper ─────────────────────────────────────────────────────────
function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{ fontSize: 42, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 700, color: "#94a3b8", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.6 }}>{sub}</div>
    </div>
  );
}

// ── Compact activity badge (for TopBar notification-style indicator) ────────────
// Shows a small dot + count when there's recent unread activity.
// Usage: <ActivityBadge onClick={() => setShowPanel(true)} />
export function ActivityBadge({ count, onClick }) {
  if (!count) return null;
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "5px 12px", borderRadius: 20,
      background: "rgba(30,111,212,0.08)",
      border: "1px solid rgba(30,111,212,0.18)",
      cursor: "pointer", fontSize: 12, fontWeight: 700, color: C.ocean,
    }}>
      🕐 {count} new
    </button>
  );
}
