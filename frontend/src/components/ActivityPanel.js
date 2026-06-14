// ─── ActivityPanel.js ─────────────────────────────────────────────────────────
// Obsidian Night activity panel — dark luxury editorial

import React, { useState } from "react";
import { useAppContext, A, useActivityState } from "../context/AppContext";

const C = {
  amber:  "#f59e0b",
  panel:  "#16161f",
  surface:"#1c1c28",
  raise:  "#222230",
  line:   "rgba(255,255,255,0.06)",
  lineMd: "rgba(255,255,255,0.10)",
  muted:  "#8888a8",
  text:   "#f1f1f5",
};

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7)  return `${d}d ago`;
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const TYPE_CFG = {
  jobs:    { bg: "rgba(245,158,11,0.1)",  color: "#f59e0b", label: "Jobs"    },
  courses: { bg: "rgba(56,189,248,0.1)",  color: "#38bdf8", label: "Courses" },
  resume:  { bg: "rgba(52,211,153,0.1)",  color: "#34d399", label: "Resume"  },
  alert:   { bg: "rgba(251,63,99,0.1)",   color: "#fb7185", label: "Alert"   },
  default: { bg: "rgba(136,136,168,0.1)", color: "#8888a8", label: "Action"  },
};

function TypeBadge({ type }) {
  const cfg = TYPE_CFG[type] || TYPE_CFG.default;
  return (
    <span style={{
      padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.color}30`,
      flexShrink: 0,
      fontFamily: "'DM Mono', monospace",
      textTransform: "uppercase",
      letterSpacing: "0.4px",
    }}>
      {cfg.label}
    </span>
  );
}

export default function ActivityPanel({ onRedoJobSearch, onRedoCourseSearch, onClose }) {
  const { dispatch } = useAppContext();
  const { searchHistory, recentActivity } = useActivityState();
  const [tab, setTab] = useState("activity");

  const clearHistory  = () => { if (window.confirm("Clear all search history?"))  dispatch({ type: A.CLEAR_HISTORY  }); };
  const clearActivity = () => { if (window.confirm("Clear all recent activity?")) dispatch({ type: A.CLEAR_ACTIVITY }); };

  return (
    <div style={{
      background: C.panel,
      border: `1px solid ${C.line}`,
      borderRadius: 18,
      boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
      width: "100%",
      maxWidth: 480,
      display: "flex",
      flexDirection: "column",
      maxHeight: "80vh",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "18px 22px 0", borderBottom: `1px solid ${C.line}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 800, color: C.text }}>
            Activity &amp; History
          </div>
          {onClose && (
            <button onClick={onClose} style={{
              background: "none", border: "none", fontSize: 18, cursor: "pointer",
              color: C.muted, lineHeight: 1, transition: "color 0.15s",
            }}
            onMouseEnter={e => e.target.style.color = C.text}
            onMouseLeave={e => e.target.style.color = C.muted}
            >✕</button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4 }}>
          {[["activity", "🕐 Recent"], ["history", "🔍 Searches"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: "7px 14px",
              borderRadius: "8px 8px 0 0",
              border: "none",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "'Syne', sans-serif",
              cursor: "pointer",
              background: tab === key ? C.amber : "transparent",
              color: tab === key ? "#0a0a0f" : C.muted,
              transition: "all .15s",
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 22px 22px" }}>

        {/* RECENT ACTIVITY */}
        {tab === "activity" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 11, color: C.muted, fontWeight: 600, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                {recentActivity.length} events
              </span>
              {recentActivity.length > 0 && (
                <button onClick={clearActivity} style={{ fontSize: 11, color: "#fb7185", background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>
                  Clear all
                </button>
              )}
            </div>

            {recentActivity.length === 0 ? (
              <EmptyState icon="🕐" title="No activity yet" sub="Searches, uploads, and alerts will appear here." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {recentActivity.map((item, i) => (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: i === 0 ? "rgba(245,158,11,0.04)" : "transparent",
                    border: `1px solid ${i === 0 ? "rgba(245,158,11,0.12)" : "transparent"}`,
                    transition: "background .15s",
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 9,
                      background: C.surface,
                      border: `1px solid ${C.line}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 15, flexShrink: 0,
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 3, lineHeight: 1.4 }}>{item.label}</div>
                      {item.meta?.roles?.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>
                          {item.meta.roles.map((r, j) => (
                            <span key={j} style={{
                              padding: "1px 7px", background: "rgba(245,158,11,0.08)",
                              color: C.amber, borderRadius: 5, fontSize: 10, fontWeight: 700,
                              fontFamily: "'DM Mono', monospace",
                            }}>{r}</span>
                          ))}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Mono', monospace" }}>{timeAgo(item.timestamp)}</div>
                    </div>
                    <TypeBadge type={item.type} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* SEARCH HISTORY */}
        {tab === "history" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 11, color: C.muted, fontWeight: 600, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                {searchHistory.length} searches
              </span>
              {searchHistory.length > 0 && (
                <button onClick={clearHistory} style={{ fontSize: 11, color: "#fb7185", background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>
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
                    background: C.surface,
                    border: `1px solid ${C.line}`,
                    borderRadius: 12,
                    padding: "13px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    transition: "border-color 0.15s",
                  }}>
                    <div style={{ fontSize: 18, flexShrink: 0 }}>{item.type === "jobs" ? "💼" : "🎓"}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'Syne', sans-serif" }}>
                        {item.query || "—"}
                      </div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Mono', monospace" }}>{timeAgo(item.timestamp)}</span>
                        <span style={{ fontSize: 11, color: item.resultCount > 0 ? "#34d399" : C.muted, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>
                          {item.resultCount > 0 ? `${item.resultCount} results` : "0 results"}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                      <TypeBadge type={item.type} />
                      <button
                        onClick={() => {
                          if (item.type === "jobs" && onRedoJobSearch) onRedoJobSearch(item);
                          if (item.type === "courses" && onRedoCourseSearch) onRedoCourseSearch(item.query);
                        }}
                        style={{
                          fontSize: 10, fontWeight: 700, color: C.amber,
                          background: "rgba(245,158,11,0.08)",
                          border: "1px solid rgba(245,158,11,0.2)",
                          borderRadius: 6, padding: "3px 9px", cursor: "pointer",
                          fontFamily: "'DM Mono', monospace",
                          transition: "all 0.15s",
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

function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#8888a8", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: "#444460", lineHeight: 1.6 }}>{sub}</div>
    </div>
  );
}

export function ActivityBadge({ count, onClick }) {
  if (!count) return null;
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "5px 12px", borderRadius: 20,
      background: "rgba(245,158,11,0.1)",
      border: "1px solid rgba(245,158,11,0.2)",
      cursor: "pointer", fontSize: 12, fontWeight: 700,
      color: "#f59e0b", fontFamily: "'Syne', sans-serif",
    }}>
      🕐 {count} new
    </button>
  );
}
