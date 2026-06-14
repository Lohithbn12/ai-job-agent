// ─── Sidebar.js ──────────────────────────────────────────────────────────────
// Obsidian Night sidebar — dark luxury editorial aesthetic

import React from "react";

function Brand() {
  return (
    <div className="sb-brand">
      <div className="sb-logo">⚡</div>
      <div>
        <div className="sb-wordmark">JobSpark</div>
        <div className="sb-tagline">AI Career Suite</div>
      </div>
    </div>
  );
}

function UserCard({ user }) {
  const displayName = user?.name || "User";
  const avatarText  = (user?.name || user?.email || "U")[0].toUpperCase();
  return (
    <div className="sb-user">
      <div className="sb-avatar">{avatarText}</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="sb-uname">{displayName}</div>
        <div className="sb-urole">{user?.level === 0 ? "Administrator" : "Member"}</div>
      </div>
      <div className="sb-online-dot" />
    </div>
  );
}

function SearchBox() {
  return (
    <div className="sb-search">
      <div className="sb-search-wrap">
        <span className="sb-search-icon">🔍</span>
        <input type="text" placeholder="Search pages..." className="sb-search-input" />
        <span className="sb-shortcut">⌘K</span>
      </div>
    </div>
  );
}

function NavItem({ item, mode, setMode, setSidebarOpen, notificationCount }) {
  const isActive = mode === item.key;
  return (
    <button
      onClick={() => { setMode(item.key); setSidebarOpen(false); }}
      className={`sb-nav-item ${isActive ? "active" : ""}`}
    >
      <div className="sb-active-bar" />
      <div className="sb-nav-icon">{item.icon}</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="sb-nav-label">{item.label}</div>
        {item.sub && <div className="sb-nav-sub">{item.sub}</div>}
      </div>
      {item.key === "alerts" && notificationCount > 0 && (
        <div className="sb-badge">{notificationCount}</div>
      )}
    </button>
  );
}

function ProgressTracker({ mode, step }) {
  if (mode !== "jobs" || step <= 1) return null;
  const steps = ["Upload", "Configure", "Results"];
  return (
    <div className="sb-steps">
      <div className="sb-divider" />
      <div className="sb-step-title">Progress</div>
      {steps.map((label, index) => {
        const currentStep = index + 1;
        const completed   = step > currentStep;
        const active      = step === currentStep;
        return (
          <div key={index} className="sb-step-row">
            <div className="sb-step-num" style={{
              background: completed ? "#34d399" : active ? "#f59e0b" : "rgba(255,255,255,0.06)",
              color: step >= currentStep ? "#0a0a0f" : "#444460",
              boxShadow: active ? "0 0 0 3px rgba(245,158,11,0.2)" : "none",
            }}>
              {completed ? "✓" : currentStep}
            </div>
            <span className="sb-step-lbl" style={{
              color: active ? "#f59e0b" : completed ? "#34d399" : "#444460",
            }}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StatusBar({ mode, status, courseStatus }) {
  if (!status && !courseStatus) return null;
  return (
    <div className="sb-status">
      <div className="sb-status-dot" />
      <span className="sb-status-txt">{mode === "jobs" ? status : courseStatus}</span>
    </div>
  );
}

function Footer({ logout }) {
  return (
    <div className="sb-footer">
      <button className="sb-logout" onClick={logout}>
        <span>→</span> Sign Out
      </button>
    </div>
  );
}

export default function Sidebar({
  user, mode, setMode, sidebarOpen, setSidebarOpen,
  step, status, courseStatus, notificationCount, navItems, logout,
}) {
  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <Brand />
      <UserCard user={user} />
      <SearchBox />
      <nav className="sb-nav">
        <div className="sb-section-lbl">Navigation</div>
        {navItems.map((item) => (
          <NavItem
            key={item.key}
            item={item}
            mode={mode}
            setMode={setMode}
            setSidebarOpen={setSidebarOpen}
            notificationCount={notificationCount}
          />
        ))}
        <ProgressTracker mode={mode} step={step} />
      </nav>
      <StatusBar mode={mode} status={status} courseStatus={courseStatus} />
      <Footer logout={logout} />
    </aside>
  );
}
