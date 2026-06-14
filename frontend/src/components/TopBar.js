// ─── TopBar.js ────────────────────────────────────────────────────────────────
// Obsidian Night top bar — dark luxury editorial

import React, { useState } from "react";
import LiveClock from "./LiveClock";
import { MODE_LABELS } from "../navConfig";
import ActivityPanel from "./ActivityPanel";
import { useActivityState, useAppContext, A } from "../context/AppContext";

export default function TopBar({
  mode, setMode, setSidebarOpen,
  greeting, greetEmoji, firstName,
  notificationCount, jobs, step,
}) {
  const [showActivity, setShowActivity] = useState(false);
  const { recentActivity } = useActivityState();
  const { dispatch } = useAppContext();
  const activityCount = recentActivity.length;

  const handleRedoJobSearch = (entry) => {
    setShowActivity(false);
    setMode("jobs");
    if (entry.meta?.roles?.length) dispatch({ type: A.SET_ROLES, payload: entry.meta.roles });
    dispatch({ type: A.SET_JOB_STEP, payload: 2 });
  };

  const handleRedoCourseSearch = (query) => {
    setShowActivity(false);
    setMode("courses");
    dispatch({ type: A.SET_COURSE_KEYWORD, payload: query });
  };

  return (
    <header className="top-bar" style={{ position: "relative" }}>
      <div className="top-bar-left">
        <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
        <button className="home-btn" onClick={() => setMode("home")} title="Go to Home">🏠</button>
        <div className="topbar-divider" />
        <span style={{ fontSize: 20 }}>{greetEmoji}</span>
        <div>
          <div className="topbar-greeting">{greeting}, {firstName}</div>
          <div className="topbar-date">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </div>
      </div>

      <div className="top-bar-right">
        {/* Clock */}
        <div className="tb-chip tb-chip-clock"><LiveClock /></div>

        {/* Activity */}
        <div
          className="tb-chip"
          onClick={() => setShowActivity(v => !v)}
          title="Activity & History"
          style={{
            cursor: "pointer",
            background: showActivity ? "rgba(245,158,11,0.1)" : undefined,
            border: showActivity ? "1px solid rgba(245,158,11,0.25)" : undefined,
            position: "relative",
          }}
        >
          🕐
          {activityCount > 0 && (
            <span style={{
              position: "absolute", top: -5, right: -5,
              background: "#f59e0b", color: "#0a0a0f",
              borderRadius: "50%", fontSize: 9, fontWeight: 800,
              padding: "1px 5px", lineHeight: 1.4,
            }}>
              {Math.min(activityCount, 99)}
            </span>
          )}
        </div>

        {/* Notifications */}
        <div
          className="tb-chip tb-chip-notif"
          onClick={() => setMode("alerts")}
          style={{ cursor: "pointer", position: "relative" }}
        >
          🔔
          {notificationCount > 0
            ? <span style={{
                background: "#fb7185", color: "white",
                borderRadius: "50%", fontSize: 10, fontWeight: 800,
                padding: "1px 5px", marginLeft: 2,
              }}>{notificationCount}</span>
            : <span style={{ color: "var(--subtle)", marginLeft: 2 }}>0</span>}
        </div>

        {/* Mode label */}
        <div className="tb-chip tb-chip-mode">{MODE_LABELS[mode] || mode}</div>

        {/* Job count */}
        {mode === "jobs" && step === 3 && (
          <div className="tb-chip tb-chip-count">{jobs.length} positions</div>
        )}
      </div>

      {/* Activity panel */}
      {showActivity && (
        <>
          <div onClick={() => setShowActivity(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
          <div style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 16,
            zIndex: 100,
            width: "min(480px, calc(100vw - 32px))",
          }}>
            <ActivityPanel
              onRedoJobSearch={handleRedoJobSearch}
              onRedoCourseSearch={handleRedoCourseSearch}
              onClose={() => setShowActivity(false)}
            />
          </div>
        </>
      )}
    </header>
  );
}
