// RoadMap.jsx
// Job Role Roadmap component — shows skill tree for any searched job role
// Uses Claude API to generate dynamic roadmaps

import { useState, useEffect, useRef } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

// ── Static popular roles for quick search suggestions ────────────────────────
const POPULAR_ROLES = [
  "Data Analyst", "Data Scientist", "Machine Learning Engineer",
  "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "DevOps Engineer", "Cloud Architect", "Product Manager",
  "UI/UX Designer", "Cybersecurity Analyst", "Blockchain Developer",
];

// ── Phase colors ─────────────────────────────────────────────────────────────
const PHASE_COLORS = [
  { bg: "#1c1c28", border: "#38bdf8", badge: "#38bdf8", label: "Foundation" },
  { bg: "#1c1c28", border: "#a78bfa", badge: "#a78bfa", label: "Core Skills" },
  { bg: "#1c1c28", border: "#34d399", badge: "#34d399", label: "Advanced"   },
  { bg: "#1c1c28", border: "#f59e0b", badge: "#f59e0b", label: "Expert"     },
];

export default function RoadMap() {
  const [query, setQuery]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [roadmap, setRoadmap]     = useState(null);
  const [error, setError]         = useState("");
  const [activePhase, setActive]  = useState(null);
  const inputRef                  = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // ── Search handler ──────────────────────────────────────────────────────────
  async function handleSearch(role) {
    const q = (role || query).trim();
    if (!q) return;
    setQuery(q);
    setLoading(true);
    setError("");
    setRoadmap(null);
    setActive(null);

    try {
      const res  = await fetch(`${API_BASE}/roadmap/generate`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ role: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to generate roadmap");
      setRoadmap(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Skill pill ──────────────────────────────────────────────────────────────
  function SkillPill({ skill, color, delay }) {
    return (
      <span
        className="skill-pill"
        style={{
          "--delay":  `${delay}ms`,
          "--color":  color,
          borderColor: color + "55",
          background:  color + "15",
          color:       color,
        }}
      >
        {skill.icon && <span className="pill-icon">{skill.icon}</span>}
        {skill.name}
        {skill.priority === "must" && <span className="must-tag">must</span>}
      </span>
    );
  }

  // ── Phase card ──────────────────────────────────────────────────────────────
  function PhaseCard({ phase, index, color }) {
    const isActive = activePhase === index;
    return (
      <div
        className={`phase-card ${isActive ? "active" : ""}`}
        style={{ "--border-color": color.border, "--delay": `${index * 120}ms` }}
        onClick={() => setActive(isActive ? null : index)}
      >
        <div className="phase-header">
          <div className="phase-number" style={{ background: color.badge }}>
            {String(index + 1).padStart(2, "0")}
          </div>
          <div className="phase-meta">
            <span className="phase-label" style={{ color: color.badge }}>
              {color.label}
            </span>
            <h3 className="phase-title">{phase.phase}</h3>
          </div>
          <div className="phase-duration" style={{ color: color.badge }}>
            {phase.duration}
          </div>
          <div className="phase-arrow" style={{ color: color.badge }}>
            {isActive ? "▲" : "▼"}
          </div>
        </div>

        {isActive && (
          <div className="phase-body">
            {phase.categories?.map((cat, ci) => (
              <div key={ci} className="category-block">
                <div className="category-title">{cat.name}</div>
                <div className="skills-grid">
                  {cat.skills?.map((skill, si) => (
                    <SkillPill
                      key={si}
                      skill={typeof skill === "string" ? { name: skill } : skill}
                      color={color.border}
                      delay={si * 40}
                    />
                  ))}
                </div>
              </div>
            ))}
            {phase.resources?.length > 0 && (
              <div className="resources-block">
                <div className="resources-title">📚 Recommended Resources</div>
                <ul className="resources-list">
                  {phase.resources.map((r, ri) => (
                    <li key={ri}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="roadmap-root">
      <style>{CSS}</style>

      {/* Header */}
      <div className="rm-header">
        <div className="rm-title-row">
          <span className="rm-icon">🗺️</span>
          <h1 className="rm-title">Career Roadmap</h1>
        </div>
        <p className="rm-subtitle">
          Search any job role to get a personalized skill roadmap
        </p>
      </div>

      {/* Search bar */}
      <div className="search-wrap">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            className="search-input"
            placeholder="e.g. Data Scientist, DevOps Engineer, UX Designer…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            className="search-btn"
            onClick={() => handleSearch()}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : "Generate"}
          </button>
        </div>

        {/* Popular roles */}
        <div className="popular-wrap">
          <span className="popular-label">Popular:</span>
          {POPULAR_ROLES.map((r) => (
            <button
              key={r}
              className="popular-chip"
              onClick={() => handleSearch(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="error-box">⚠️ {error}</div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="skeleton-wrap">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-card" style={{ "--i": i }} />
          ))}
          <p className="loading-text">Building your roadmap for <strong>{query}</strong>…</p>
        </div>
      )}

      {/* Roadmap result */}
      {roadmap && !loading && (
        <div className="roadmap-result">
          {/* Meta row */}
          <div className="result-meta">
            <div className="result-role">{roadmap.role}</div>
            <div className="result-stats">
              <span>⏱ {roadmap.total_duration}</span>
              <span>📋 {roadmap.phases?.length} phases</span>
              <span>🎯 {roadmap.total_skills} skills</span>
            </div>
          </div>

          {/* Overview */}
          {roadmap.overview && (
            <div className="overview-box">{roadmap.overview}</div>
          )}

          {/* Phases */}
          <div className="phases-wrap">
            {roadmap.phases?.map((phase, i) => (
              <PhaseCard
                key={i}
                phase={phase}
                index={i}
                color={PHASE_COLORS[i % PHASE_COLORS.length]}
              />
            ))}
          </div>

          {/* Key tools */}
          {roadmap.key_tools?.length > 0 && (
            <div className="tools-section">
              <h3 className="tools-title">🛠 Key Tools & Technologies</h3>
              <div className="tools-grid">
                {roadmap.key_tools.map((tool, i) => (
                  <div key={i} className="tool-card">
                    <span className="tool-icon">{tool.icon || "⚙️"}</span>
                    <span className="tool-name">{tool.name}</span>
                    <span className="tool-type">{tool.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Salary range */}
          {roadmap.salary_range && (
            <div className="salary-box">
              <span className="salary-label">💰 Expected Salary Range</span>
              <span className="salary-value">{roadmap.salary_range}</span>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!roadmap && !loading && !error && (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <p>Search a job role above to generate your learning roadmap</p>
        </div>
      )}
    </div>
  );
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .roadmap-root {
    min-height: 100vh;
    background: #0d0d14;
    color: #f1f1f5;
    font-family: 'DM Sans', sans-serif;
    padding: 2rem 1.5rem 4rem;
    max-width: 900px;
    margin: 0 auto;
  }

  /* Header */
  .rm-header { text-align: center; margin-bottom: 2.5rem; }
  .rm-title-row { display: flex; align-items: center; justify-content: center; gap: .75rem; margin-bottom: .5rem; }
  .rm-icon { font-size: 2rem; }
  .rm-title {
    font-family: 'Space Mono', monospace;
    font-size: 2.2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #f59e0b, #fbbf24, #34d399);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
  }
  .rm-subtitle { color: #8888a8; font-size: .95rem; margin: 0; }

  /* Search */
  .search-wrap { margin-bottom: 2rem; }
  .search-box {
    display: flex;
    align-items: center;
    background: #16161f;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    padding: .5rem .5rem .5rem 1rem;
    gap: .75rem;
    transition: border-color .2s;
  }
  .search-box:focus-within { border-color: rgba(245,158,11,0.5); box-shadow: 0 0 0 3px rgba(245,158,11,0.08); }
  .search-icon { font-size: 1.1rem; color: #8888a8; }
  .search-input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: #f1f1f5;
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem;
  }
  .search-input::placeholder { color: #444460; }
  .search-btn {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: #0a0a0f;
    border: none;
    border-radius: 10px;
    padding: .6rem 1.4rem;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: .9rem;
    cursor: pointer;
    transition: opacity .2s, transform .1s;
    display: flex;
    align-items: center;
    gap: .5rem;
    min-width: 100px;
    justify-content: center;
  }
  .search-btn:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
  .search-btn:disabled { opacity: .5; cursor: not-allowed; }

  /* Spinner */
  .spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Popular chips */
  .popular-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: .5rem;
    margin-top: .85rem;
    align-items: center;
  }
  .popular-label { color: #8888a8; font-size: .8rem; white-space: nowrap; }
  .popular-chip {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: #8888a8;
    border-radius: 20px;
    padding: .25rem .75rem;
    font-size: .78rem;
    cursor: pointer;
    transition: all .15s;
    font-family: 'DM Sans', sans-serif;
  }
  .popular-chip:hover { border-color: rgba(245,158,11,0.4); color: #f59e0b; background: rgba(245,158,11,0.08); }

  /* Error */
  .error-box {
    background: #450a0a; border: 1px solid #dc2626;
    color: #fca5a5; border-radius: 10px;
    padding: 1rem 1.25rem; margin-bottom: 1.5rem; font-size: .9rem;
  }

  /* Skeleton */
  .skeleton-wrap { margin-top: 1rem; }
  .skeleton-card {
    background: linear-gradient(90deg, #1c1c28 25%, #222230 50%, #1c1c28 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    animation-delay: calc(var(--i) * 0.1s);
    border-radius: 12px;
    height: 72px;
    margin-bottom: .75rem;
  }
  @keyframes shimmer { to { background-position: -200% 0; } }
  .loading-text { text-align: center; color: #8888a8; font-size: .9rem; margin-top: 1.5rem; }

  /* Result meta */
  .result-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }
  .result-role {
    font-family: 'Space Mono', monospace;
    font-size: 1.4rem;
    font-weight: 700;
    color: #f1f1f5;
  }
  .result-stats { display: flex; gap: 1rem; flex-wrap: wrap; }
  .result-stats span {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px; padding: .25rem .85rem;
    font-size: .8rem; color: #8888a8;
  }

  /* Overview */
  .overview-box {
    background: rgba(56,189,248,0.06); border-left: 3px solid #38bdf8;
    border-radius: 0 10px 10px 0;
    padding: 1rem 1.25rem; margin-bottom: 1.5rem;
    color: #8888a8; font-size: .9rem; line-height: 1.7;
  }

  /* Phase cards */
  .phases-wrap { display: flex; flex-direction: column; gap: .75rem; margin-bottom: 2rem; }
  .phase-card {
    background: #16161f;
    border: 1px solid var(--border-color, #1e293b);
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    animation: fadeUp .4s ease both;
    animation-delay: var(--delay, 0ms);
    transition: border-color .2s, box-shadow .2s;
  }
  .phase-card:hover { box-shadow: 0 0 0 1px var(--border-color); }
  .phase-card.active { box-shadow: 0 0 20px var(--border-color)33; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .phase-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
  }
  .phase-number {
    font-family: 'Space Mono', monospace;
    font-size: .75rem;
    font-weight: 700;
    color: #fff;
    border-radius: 8px;
    padding: .3rem .5rem;
    min-width: 36px;
    text-align: center;
    flex-shrink: 0;
  }
  .phase-meta { flex: 1; }
  .phase-label { font-size: .72rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
  .phase-title { font-size: 1rem; font-weight: 600; color: #f1f1f5; margin: .15rem 0 0; }
  .phase-duration { font-size: .8rem; color: #8888a8; white-space: nowrap; }
  .phase-arrow { font-size: .7rem; color: #8888a8; }

  /* Phase body */
  .phase-body { padding: 0 1.25rem 1.25rem; border-top: 1px solid rgba(255,255,255,0.06); }
  .category-block { margin-top: 1rem; }
  .category-title {
    font-size: .75rem; font-weight: 600; letter-spacing: .1em;
    text-transform: uppercase; color: #8888a8; margin-bottom: .6rem;
  }
  .skills-grid { display: flex; flex-wrap: wrap; gap: .45rem; }

  /* Skill pills */
  .skill-pill {
    display: inline-flex; align-items: center; gap: .35rem;
    border: 1px solid var(--color, #3b82f6);
    background: var(--color, #3b82f6);
    color: var(--color, #3b82f6);
    border-radius: 20px;
    padding: .3rem .75rem;
    font-size: .8rem;
    animation: popIn .3s ease both;
    animation-delay: var(--delay, 0ms);
  }
  @keyframes popIn {
    from { opacity: 0; transform: scale(.8); }
    to   { opacity: 1; transform: scale(1); }
  }
  .pill-icon { font-size: .85rem; }
  .must-tag {
    background: rgba(251,63,99,0.15); color: #fb7185;
    border-radius: 4px; padding: .05rem .3rem;
    font-size: .65rem; font-weight: 700; letter-spacing: .05em;
  }

  /* Resources */
  .resources-block { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.06); }
  .resources-title { font-size: .8rem; font-weight: 600; color: #8888a8; margin-bottom: .5rem; }
  .resources-list { margin: 0; padding-left: 1.25rem; color: #8888a8; font-size: .85rem; line-height: 1.8; }

  /* Tools section */
  .tools-section { margin-bottom: 1.5rem; }
  .tools-title { font-size: 1rem; font-weight: 600; color: #f1f1f5; margin-bottom: 1rem; }
  .tools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: .6rem; }
  .tool-card {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px; padding: .75rem;
    display: flex; flex-direction: column; align-items: center;
    gap: .3rem; text-align: center;
    transition: border-color .15s;
  }
  .tool-card:hover { border-color: rgba(245,158,11,0.4); }
  .tool-icon { font-size: 1.4rem; }
  .tool-name { font-size: .82rem; font-weight: 600; color: #f1f1f5; }
  .tool-type { font-size: .7rem; color: #8888a8; }

  /* Salary */
  .salary-box {
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(52,211,153,0.06); border: 1px solid rgba(52,211,153,0.2);
    border-radius: 12px; padding: 1rem 1.25rem;
  }
  .salary-label { font-size: .85rem; color: #8888a8; }
  .salary-value { font-family: 'DM Mono', monospace; font-size: 1rem; font-weight: 700; color: #34d399; }

  /* Empty state */
  .empty-state { text-align: center; padding: 4rem 2rem; color: #8888a8; }
  .empty-icon { font-size: 3rem; margin-bottom: 1rem; }

  /* Responsive */
  @media (max-width: 600px) {
    .rm-title { font-size: 1.6rem; }
    .result-meta { flex-direction: column; }
    .phase-header { gap: .6rem; }
    .phase-duration { display: none; }
  }
`;
