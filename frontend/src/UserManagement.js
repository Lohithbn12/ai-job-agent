// ─── UserManagement.js ────────────────────────────────────────────────────────
// User Management + Role Management
// Level 0 = Admin  → full access, can create users, manage roles
// Level 1 = Member → standard access, cannot create users
// Level 2 = User   → restricted, only pages in page_permissions
// Departments: admin | member | user

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API } from "./constants";

// ─── Constants ────────────────────────────────────────────────────────────────
const ALL_PAGES = [
  { key: "jobs", label: "Job Search", icon: "💼" },
  { key: "courses", label: "Free Courses", icon: "🎓" },
  { key: "ats", label: "Resume Maker", icon: "📄" },
  { key: "interview", label: "Interview Prep", icon: "🎯" },
  { key: "users", label: "User Management", icon: "👥" },
  { key: "linkedin", label: "LinkedIn Analyzer", icon: "🔗" },
  { key: "portfolio", label: "Portfolio Generator", icon: "🌐" },
  { key: "stocks", label: "Stock Predictor", icon: "📈" },
];

const LEVELS = [
  { value: 0, label: "Level 0 — Admin", color: "#f43f5e", bg: "rgba(244,63,94,0.1)", border: "rgba(244,63,94,0.25)", desc: "Full access. Can create users, manage roles." },
  { value: 1, label: "Level 1 — Member", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.25)", desc: "Standard access. Cannot create or manage users." },
  { value: 2, label: "Level 2 — User", color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.25)", desc: "Restricted. Only sees pages assigned by admin." },
];

const DEPARTMENTS = ["admin", "member", "user"];

const DEPT_CONFIG = {
  admin:  { color: "#f43f5e", bg: "rgba(244,63,94,0.1)",  border: "rgba(244,63,94,0.2)"  },
  member: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)" },
  user:   { color: "#a78bfa", bg: "rgba(167,139,250,0.1)",border: "rgba(167,139,250,0.2)"},
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function authHeader() {
  const token = localStorage.getItem("js_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function timeAgo(iso) {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function Avatar({ name, size = 36 }) {
  const initials = (name || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#06b6d4", "#10b981"];
  const color = colors[(name || "U").charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${color}, ${color}aa)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700, color: "white",
      flexShrink: 0, border: "2px solid rgba(255,255,255,.08)"
    }}>
      {initials}
    </div>
  );
}
function LevelBadge({ level }) {
  const cfg = LEVELS.find(l => l.value === level) || LEVELS[1];
  return (
    <span style={{
      padding: "3px 9px", background: cfg.bg,
      border: `1px solid ${cfg.border}`, borderRadius: 20,
      fontSize: 11, fontWeight: 600, color: cfg.color, whiteSpace: "nowrap"
    }}>
      L{cfg.value}
    </span>
  );
}
function DeptBadge({ dept }) {
  const cfg = DEPT_CONFIG[dept] || DEPT_CONFIG.member;
  return (
    <span style={{
      padding: "3px 9px", background: cfg.bg,
      border: `1px solid ${cfg.border}`, borderRadius: 20,
      fontSize: 11, fontWeight: 600, color: cfg.color,
      textTransform: "capitalize", whiteSpace: "nowrap"
    }}>
      {dept}
    </span>
  );
}

/** Green pulsing dot for online status */
function OnlineDot({ online }) {
  return (
    <span style={{
      display: "inline-block",
      width: 8, height: 8, borderRadius: "50%",
      background: online ? "#4ade80" : "rgba(255,255,255,.15)",
      boxShadow: online ? "0 0 0 2px rgba(74,222,128,.25)" : "none",
      flexShrink: 0,
    }} />
  );
}


// ─── Main Component ───────────────────────────────────────────────────────────
export default function UserManagement({ currentUser }) {
  const [tab, setTab] = useState("users");   // "users" | "online" | "roles" | "create"
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);  // from /auth/users/stats
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const isAdmin = currentUser?.level === 0;

  // ── All hooks must come before any early return (Rules of Hooks) ─────────────
  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;   // skip for non-admins
    try {
      setLoading(true); setError("");
      const res = await axios.get(`${API}/auth/users`, { headers: authHeader() });
      setUsers(res.data.users || []);
    } catch (err) {
      if (err.response?.status === 404) {
        setUsers([{
          id: "1", name: currentUser?.name || "Admin",
          email: currentUser?.email || "",
          level: 0, department: "admin",
          page_permissions: ["jobs","courses","ats","interview","linkedin","portfolio","stocks"],
          created_at: new Date().toISOString(),
          is_online: true,
        }]);
      } else {
        setError(err.response?.data?.detail || "Failed to load users.");
      }
    } finally { setLoading(false); }
  }, [currentUser, isAdmin]);

  const fetchStats = useCallback(async () => {
    if (!isAdmin) return;   // skip for non-admins
    try {
      const res = await axios.get(`${API}/auth/users/stats`, { headers: authHeader() });
      setStats(res.data);
    } catch {
      // stats are supplemental — fail silently
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [fetchUsers, fetchStats]);

  // Auto-refresh stats every 60 s so online count stays fresh
  useEffect(() => {
    const id = setInterval(fetchStats, 60000);
    return () => clearInterval(id);
  }, [fetchStats]);

  // ── Access guard (after all hooks) ───────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div style={{
        maxWidth: 480, margin: "80px auto", textAlign: "center",
        background: "#0a1628", border: "1px solid rgba(244,63,94,.2)",
        borderRadius: 18, padding: "48px 36px",
        boxShadow: "0 4px 32px rgba(0,0,0,.4)"
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>
          Access Denied
        </h2>
        <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>
          User Management is only accessible to <strong style={{ color: "#f43f5e" }}>Level 0 Admins</strong>.
          <br />Please contact your administrator if you believe this is a mistake.
        </p>
      </div>
    );
  }

  const tabs = [
    { key: "users",  label: "All Users",      icon: "👥" },
    { key: "online", label: "Online Now",      icon: "🟢" },
    { key: "roles",  label: "Role Management", icon: "🔑" },
    ...(isAdmin ? [{ key: "create", label: "Create User", icon: "➕" }] : []),
  ];

  return (
    <div className="fade-up" style={{ maxWidth: 960, margin: "0 auto" }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 26, fontWeight: 800, color: "var(--text)",
          letterSpacing: "-.5px", marginBottom: 4
        }}>👥 User Management</h1>
        <p style={{ fontSize: 13, color: "var(--text2)" }}>
          Manage users, assign roles, set access levels and page permissions.
        </p>
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display: "flex", gap: 6, marginBottom: 24,
        borderBottom: "1px solid rgba(255,255,255,.06)", paddingBottom: 0
      }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              padding: "10px 18px", background: "none",
              border: "none", borderBottom: `2px solid ${tab === t.key ? "var(--teal)" : "transparent"}`,
              cursor: "pointer", fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
              color: tab === t.key ? "var(--teal)" : "var(--text2)",
              display: "flex", alignItems: "center", gap: 7, transition: "all .15s",
              marginBottom: "-1px",
            }}>
            <span>{t.icon}</span>{t.label}
            {t.key === "online" && stats?.online_count > 0 && (
              <span style={{
                padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 800,
                background: "rgba(74,222,128,.15)", color: "#4ade80",
                border: "1px solid rgba(74,222,128,.25)"
              }}>{stats.online_count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {tab === "users" && (
        <UserList users={users} stats={stats} loading={loading} error={error}
          search={search} setSearch={setSearch}
          currentUser={currentUser} onRefresh={() => { fetchUsers(); fetchStats(); }}
          isAdmin={isAdmin} />
      )}
      {tab === "online" && (
        <OnlinePanel stats={stats} onRefresh={() => { fetchUsers(); fetchStats(); }} />
      )}
      {tab === "roles" && (
        <RoleManagement users={users} currentUser={currentUser}
          onRefresh={() => { fetchUsers(); fetchStats(); }} isAdmin={isAdmin} />
      )}
      {tab === "create" && isAdmin && (
        <CreateUser onSuccess={() => { setTab("users"); fetchUsers(); fetchStats(); }} />
      )}
    </div>
  );
}


// ─── Online Panel ──────────────────────────────────────────────────────────────
function OnlinePanel({ stats, onRefresh }) {
  if (!stats) {
    return (
      <div style={{ padding: "48px", textAlign: "center", color: "var(--text2)" }}>
        <span className="spinner" style={{ marginRight: 8 }} />Loading…
      </div>
    );
  }

  const { online_users = [], online_count = 0, total_users = 0, by_level = [] } = stats;

  return (
    <div>
      {/* Level breakdown cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {/* Total */}
        <StatCard icon="👥" label="Total Users" value={total_users} color="#3b82f6" />
        {/* Online */}
        <StatCard icon="🟢" label="Online Now" value={online_count} color="#4ade80"
          sub={`of ${total_users} users`} pulse />
        {/* Per level */}
        {by_level.map(l => {
          const cfg = LEVELS.find(x => x.value === l.level) || LEVELS[1];
          return (
            <div key={l.level} style={{
              background: "#0a1628", border: `1px solid ${cfg.border}`,
              borderRadius: 14, padding: "16px 18px"
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: cfg.color, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px" }}>
                L{l.level} — {cfg.label.split("—")[1]?.trim()}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>{l.count}</div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>
                {l.online > 0
                  ? <><span style={{ color: "#4ade80", fontWeight: 700 }}>{l.online} online</span> · {l.count - l.online} offline</>
                  : `${l.count} offline`
                }
              </div>
            </div>
          );
        })}
      </div>

      {/* Online users list */}
      <div style={{
        background: "#0a1628", border: "1px solid rgba(255,255,255,.07)",
        borderRadius: 16, overflow: "hidden"
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,.05)"
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              display: "inline-block", width: 8, height: 8, borderRadius: "50%",
              background: "#4ade80", boxShadow: "0 0 0 3px rgba(74,222,128,.2)"
            }} />
            Active in the last 5 minutes
          </div>
          <button onClick={onRefresh}
            style={{
              padding: "5px 13px", background: "rgba(59,130,246,.1)",
              border: "1px solid rgba(59,130,246,.2)", borderRadius: 7,
              color: "#60a5fa", fontSize: 11, fontWeight: 600, cursor: "pointer"
            }}>
            ↻ Refresh
          </button>
        </div>

        {online_users.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text2)" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>😴</div>
            <div style={{ fontWeight: 600 }}>No users currently online</div>
            <div style={{ fontSize: 12, marginTop: 4, color: "var(--text3)" }}>
              Users show here within 5 minutes of activity
            </div>
          </div>
        ) : (
          <div>
            {/* Table header */}
            <div style={{
              display: "grid", gridTemplateColumns: "2.5fr 2fr 1fr 1fr 1.5fr 1.5fr",
              padding: "9px 20px", background: "rgba(255,255,255,.02)",
              borderBottom: "1px solid rgba(255,255,255,.04)",
              fontSize: 10, fontWeight: 700, color: "var(--text3)",
              textTransform: "uppercase", letterSpacing: ".7px"
            }}>
              <div>User</div><div>Email</div><div>Level</div><div>Dept</div><div>Last Active</div><div>Last Login</div>
            </div>
            {online_users.map((u, i) => (
              <div key={u.id}
                style={{
                  display: "grid", gridTemplateColumns: "2.5fr 2fr 1fr 1fr 1.5fr 1.5fr",
                  padding: "12px 20px", alignItems: "center",
                  borderBottom: i < online_users.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none",
                  transition: "background .12s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(74,222,128,.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ position: "relative" }}>
                    <Avatar name={u.name} size={32} />
                    <span style={{
                      position: "absolute", bottom: -1, right: -1,
                      width: 9, height: 9, borderRadius: "50%",
                      background: "#4ade80", border: "2px solid #0a1628"
                    }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{u.name}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {u.email}
                </div>
                <div><LevelBadge level={u.level} /></div>
                <div><DeptBadge dept={u.department} /></div>
                <div style={{ fontSize: 12, color: "#4ade80", fontWeight: 600 }}>{timeAgo(u.last_active)}</div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>{timeAgo(u.last_login)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// ─── Stat Card helper ─────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, sub, pulse }) {
  return (
    <div style={{
      background: "#0a1628", border: `1px solid ${color}22`,
      borderRadius: 14, padding: "16px 20px",
      display: "flex", alignItems: "center", gap: 14
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 11,
        background: `${color}18`, border: `1px solid ${color}30`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        flexShrink: 0,
        ...(pulse ? { animation: "statPulse 2s ease-in-out infinite" } : {})
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>{value}</div>
        <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 1 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}


// ─── User List Tab ─────────────────────────────────────────────────────────────
function UserList({ users, stats, loading, error, search, setSearch, currentUser, onRefresh, isAdmin }) {
  const [deleting, setDeleting] = useState(null);

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (user) => {
    if (user.id === currentUser?.id) return alert("You cannot delete your own account.");
    if (!window.confirm(`Delete "${user.name}"? This cannot be undone.`)) return;
    try {
      setDeleting(user.id);
      await axios.delete(`${API}/auth/users/${user.id}`, { headers: authHeader() });
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete.");
    } finally { setDeleting(null); }
  };

  // Build stats from live data (fallback if /stats endpoint not available)
  const totalUsers  = users.length;
  const onlineCount = stats?.online_count ?? users.filter(u => u.is_online).length;
  const l0Count     = users.filter(u => u.level === 0).length;
  const l1Count     = users.filter(u => u.level === 1 || u.level == null).length;
  const l2Count     = users.filter(u => u.level === 2).length;

  return (
    <div>
      {/* ── Stats bar ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 22 }}>
        <StatCard icon="👥" label="Total Users"    value={totalUsers}  color="#3b82f6" />
        <StatCard icon="🟢" label="Online Now"     value={onlineCount} color="#4ade80" pulse />
        <StatCard icon="🔑" label="Admins (L0)"    value={l0Count}     color="#f43f5e" />
        <StatCard icon="👤" label="Members (L1)"   value={l1Count}     color="#3b82f6" />
        <StatCard icon="👁" label="Users (L2)"     value={l2Count}     color="#a78bfa" />
      </div>

      {/* ── Search ── */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <span style={{
          position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          fontSize: 14, color: "var(--text3)", pointerEvents: "none"
        }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          style={{
            width: "100%", padding: "10px 13px 10px 36px",
            background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 10, fontSize: 13, color: "var(--text)", outline: "none"
          }}
          onFocus={e => { e.target.style.borderColor = "rgba(59,130,246,.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,.12)"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,.08)"; e.target.style.boxShadow = "none"; }} />
      </div>

      {error && (
        <div style={{
          padding: "10px 14px", background: "rgba(248,113,113,.08)",
          border: "1px solid rgba(248,113,113,.15)", borderRadius: 9,
          fontSize: 13, color: "#fca5a5", marginBottom: 14
        }}>⚠ {error}</div>
      )}

      {/* ── Table ── */}
      <div style={{ background: "#0a1628", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 80px 1.2fr 80px",
          padding: "11px 20px", background: "rgba(255,255,255,.03)",
          borderBottom: "1px solid rgba(255,255,255,.05)",
          fontSize: 11, fontWeight: 700, color: "var(--text3)",
          textTransform: "uppercase", letterSpacing: ".6px"
        }}>
          <div>User</div><div>Email</div><div>Level</div><div>Department</div>
          <div>Online</div><div>Last Login</div><div>Action</div>
        </div>

        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text2)" }}>
            <span className="spinner" style={{ marginRight: 8 }} />Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text2)" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>👤</div>
            <div style={{ fontWeight: 600 }}>{search ? "No users match your search" : "No users yet"}</div>
          </div>
        ) : filtered.map((user, i) => (
          <div key={user.id}
            style={{
              display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 80px 1.2fr 80px",
              padding: "13px 20px",
              borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none",
              alignItems: "center", transition: "background .12s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.02)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

            {/* Name + avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative" }}>
                <Avatar name={user.name} />
                {user.is_online && (
                  <span style={{
                    position: "absolute", bottom: 0, right: 0,
                    width: 10, height: 10, borderRadius: "50%",
                    background: "#4ade80", border: "2px solid #0a1628"
                  }} />
                )}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                  {user.name}
                  {user.id === currentUser?.id && (
                    <span style={{
                      marginLeft: 6, padding: "1px 7px",
                      background: "rgba(59,130,246,.12)", color: "#60a5fa",
                      borderRadius: 20, fontSize: 10, fontWeight: 700
                    }}>You</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ fontSize: 12, color: "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.email}
            </div>

            <div><LevelBadge level={user.level} /></div>

            <div><DeptBadge dept={user.department || "member"} /></div>

            {/* Online status */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <OnlineDot online={user.is_online} />
              <span style={{ fontSize: 11, color: user.is_online ? "#4ade80" : "var(--text3)", fontWeight: user.is_online ? 600 : 400 }}>
                {user.is_online ? "Online" : "Offline"}
              </span>
            </div>

            {/* Last login */}
            <div style={{ fontSize: 12, color: "var(--text3)" }}>
              {user.last_login ? timeAgo(user.last_login) : formatDate(user.created_at)}
            </div>

            <div>
              {isAdmin && user.id !== currentUser?.id && (
                <button onClick={() => handleDelete(user)}
                  disabled={deleting === user.id}
                  style={{
                    padding: "5px 11px",
                    background: "rgba(248,113,113,.08)",
                    border: "1px solid rgba(248,113,113,.15)",
                    borderRadius: 7, color: "#f87171", fontSize: 11, fontWeight: 600,
                    cursor: deleting === user.id ? "not-allowed" : "pointer",
                    opacity: deleting === user.id ? .5 : 1
                  }}>
                  {deleting === user.id ? "…" : "Remove"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: "var(--text3)", textAlign: "right" }}>
        {filtered.length} user{filtered.length !== 1 ? "s" : ""}
        {onlineCount > 0 && (
          <span style={{ marginLeft: 10, color: "#4ade80", fontWeight: 600 }}>
            · {onlineCount} online
          </span>
        )}
      </div>
    </div>
  );
}


// ─── Role Management Tab ───────────────────────────────────────────────────────
function RoleManagement({ users, currentUser, onRefresh, isAdmin }) {
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(null);
  const [draft, setDraft] = useState({});
  const [success, setSuccess] = useState("");

  const defaultPerms = ["jobs","courses","ats","interview","linkedin","portfolio","stocks"];

  const startEdit = (user) => {
    setEditing(user.id);
    setSuccess("");
    setDraft({
      level: user.level ?? 1,
      department: user.department || "member",
      page_permissions: user.page_permissions || defaultPerms,
    });
  };

  const cancelEdit = () => { setEditing(null); setDraft({}); };

  const togglePage = (key) => {
    setDraft(d => {
      const has = d.page_permissions.includes(key);
      return { ...d, page_permissions: has ? d.page_permissions.filter(p => p !== key) : [...d.page_permissions, key] };
    });
  };

  const saveEdit = async (userId) => {
    try {
      setSaving(userId);
      await axios.put(`${API}/auth/users/${userId}`, draft, { headers: authHeader() });
      setSuccess("Role updated successfully.");
      setEditing(null); setDraft({});
      onRefresh();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update role.");
    } finally { setSaving(null); }
  };

  return (
    <div>
      {/* Level legend */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        {LEVELS.map(l => (
          <div key={l.value} style={{
            background: "#0a1628",
            border: `1px solid ${l.border}`, borderRadius: 14, padding: "16px 18px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: l.bg, border: `1px solid ${l.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 800, color: l.color
              }}>{l.value}</div>
              <span style={{ fontSize: 13, fontWeight: 700, color: l.color }}>{l.label}</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.55 }}>{l.desc}</p>
            <div style={{ marginTop: 10, fontSize: 11, color: "var(--text3)" }}>
              {users.filter(u => (u.level ?? 1) === l.value).length} user(s) at this level
            </div>
          </div>
        ))}
      </div>

      {success && (
        <div style={{
          padding: "11px 14px", background: "rgba(34,197,94,.08)",
          border: "1px solid rgba(34,197,94,.2)", borderRadius: 10,
          fontSize: 13, color: "#4ade80", marginBottom: 16, display: "flex", gap: 8, alignItems: "center"
        }}>✅ {success}</div>
      )}

      {!isAdmin && (
        <div style={{
          padding: "14px 18px", background: "rgba(251,191,36,.07)",
          border: "1px solid rgba(251,191,36,.15)", borderRadius: 12,
          fontSize: 13, color: "#fbbf24", marginBottom: 20
        }}>
          ⚠ Only Level 0 admins can modify roles. You can view role assignments here.
        </div>
      )}

      {/* User role cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {users.map(user => {
          const isEditingThis = editing === user.id;
          const levelCfg = LEVELS.find(l => l.value === (isEditingThis ? draft.level : user.level ?? 1)) || LEVELS[1];

          return (
            <div key={user.id} style={{
              background: "#0a1628",
              border: isEditingThis
                ? `1px solid rgba(59,130,246,.4)`
                : "1px solid rgba(255,255,255,.07)",
              borderRadius: 14, overflow: "hidden",
              boxShadow: isEditingThis ? "0 0 0 3px rgba(59,130,246,.1)" : "none",
              transition: "all .2s",
            }}>
              {/* User row */}
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", padding: "14px 20px",
                borderBottom: isEditingThis ? "1px solid rgba(255,255,255,.05)" : "none"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ position: "relative" }}>
                    <Avatar name={user.name} size={38} />
                    {user.is_online && (
                      <span style={{
                        position: "absolute", bottom: 0, right: 0,
                        width: 10, height: 10, borderRadius: "50%",
                        background: "#4ade80", border: "2px solid #0a1628"
                      }} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                      {user.name}
                      {user.id === currentUser?.id && (
                        <span style={{
                          marginLeft: 6, padding: "1px 7px",
                          background: "rgba(59,130,246,.12)", color: "#60a5fa",
                          borderRadius: 20, fontSize: 10, fontWeight: 700
                        }}>You</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{user.email}</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <OnlineDot online={user.is_online} />
                  <LevelBadge level={user.level ?? 1} />
                  <DeptBadge dept={user.department || "member"} />
                  {isAdmin && !isEditingThis && (
                    <button onClick={() => startEdit(user)}
                      style={{
                        padding: "6px 14px",
                        background: "rgba(59,130,246,.1)",
                        border: "1px solid rgba(59,130,246,.2)",
                        borderRadius: 8, color: "#60a5fa",
                        fontSize: 12, fontWeight: 600, cursor: "pointer"
                      }}>Edit Role</button>
                  )}
                  {isEditingThis && (
                    <div style={{ display: "flex", gap: 7 }}>
                      <button onClick={() => saveEdit(user.id)} disabled={saving === user.id}
                        style={{
                          padding: "6px 14px",
                          background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
                          border: "none", borderRadius: 8, color: "white",
                          fontSize: 12, fontWeight: 700, cursor: "pointer",
                          opacity: saving === user.id ? .6 : 1
                        }}>
                        {saving === user.id ? "Saving…" : "Save"}
                      </button>
                      <button onClick={cancelEdit}
                        style={{
                          padding: "6px 14px",
                          background: "rgba(255,255,255,.05)",
                          border: "1px solid rgba(255,255,255,.08)",
                          borderRadius: 8, color: "var(--text2)",
                          fontSize: 12, fontWeight: 600, cursor: "pointer"
                        }}>Cancel</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Edit panel */}
              {isEditingThis && (
                <div style={{ padding: "20px", background: "rgba(59,130,246,.03)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

                    {/* Level selector */}
                    <div>
                      <div style={{
                        fontSize: 11, fontWeight: 700, color: "var(--text3)",
                        textTransform: "uppercase", letterSpacing: ".7px", marginBottom: 10
                      }}>Access Level</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {LEVELS.map(l => (
                          <label key={l.value}
                            onClick={() => setDraft(d => ({ ...d, level: l.value }))}
                            style={{
                              display: "flex", alignItems: "flex-start", gap: 10,
                              padding: "10px 13px",
                              background: draft.level === l.value ? l.bg : "rgba(255,255,255,.02)",
                              border: `1px solid ${draft.level === l.value ? l.border : "rgba(255,255,255,.06)"}`,
                              borderRadius: 10, cursor: "pointer", transition: "all .15s"
                            }}>
                            <div style={{
                              width: 18, height: 18, borderRadius: 5, marginTop: 1, flexShrink: 0,
                              border: `2px solid ${draft.level === l.value ? l.color : "rgba(255,255,255,.15)"}`,
                              background: draft.level === l.value ? l.bg : "transparent",
                              display: "flex", alignItems: "center", justifyContent: "center"
                            }}>
                              {draft.level === l.value && (
                                <span style={{ color: l.color, fontSize: 10, fontWeight: 800 }}>✓</span>
                              )}
                            </div>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: l.color }}>{l.label}</div>
                              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1, lineHeight: 1.4 }}>{l.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Department + Page permissions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                      <div>
                        <div style={{
                          fontSize: 11, fontWeight: 700, color: "var(--text3)",
                          textTransform: "uppercase", letterSpacing: ".7px", marginBottom: 10
                        }}>Department</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {DEPARTMENTS.map(d => {
                            const cfg = DEPT_CONFIG[d];
                            const active = draft.department === d;
                            return (
                              <button key={d} onClick={() => setDraft(dr => ({ ...dr, department: d }))}
                                style={{
                                  padding: "7px 16px",
                                  background: active ? cfg.bg : "rgba(255,255,255,.03)",
                                  border: `1px solid ${active ? cfg.border : "rgba(255,255,255,.07)"}`,
                                  borderRadius: 20, fontSize: 12, fontWeight: 600,
                                  color: active ? cfg.color : "var(--text2)",
                                  cursor: "pointer", transition: "all .15s", textTransform: "capitalize"
                                }}>
                                {d}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <div style={{
                          fontSize: 11, fontWeight: 700, color: "var(--text3)",
                          textTransform: "uppercase", letterSpacing: ".7px", marginBottom: 6
                        }}>
                          Page Permissions
                          {draft.level < 2 && (
                            <span style={{
                              marginLeft: 8, fontSize: 10, color: "#fbbf24",
                              fontWeight: 500, textTransform: "none", letterSpacing: 0
                            }}>(Level 0 & 1 see all)</span>
                          )}
                        </div>
                        <div style={{
                          display: "flex", flexDirection: "column", gap: 5,
                          opacity: draft.level < 2 ? 0.4 : 1,
                          pointerEvents: draft.level < 2 ? "none" : "auto"
                        }}>
                          {ALL_PAGES.map(pg => {
                            const checked = draft.page_permissions.includes(pg.key);
                            return (
                              <label key={pg.key} onClick={() => togglePage(pg.key)}
                                style={{
                                  display: "flex", alignItems: "center", gap: 8,
                                  cursor: "pointer", userSelect: "none",
                                  padding: "6px 10px",
                                  background: checked ? "rgba(59,130,246,.07)" : "rgba(255,255,255,.02)",
                                  border: `1px solid ${checked ? "rgba(59,130,246,.2)" : "rgba(255,255,255,.05)"}`,
                                  borderRadius: 7, transition: "all .12s"
                                }}>
                                <div style={{
                                  width: 15, height: 15, borderRadius: 4, flexShrink: 0,
                                  border: `1.5px solid ${checked ? "rgba(59,130,246,.7)" : "rgba(255,255,255,.18)"}`,
                                  background: checked ? "rgba(59,130,246,.2)" : "transparent",
                                  display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                  {checked && <span style={{ color: "#60a5fa", fontSize: 9, fontWeight: 800 }}>✓</span>}
                                </div>
                                <span style={{ fontSize: 12 }}>{pg.icon}</span>
                                <span style={{ fontSize: 12, fontWeight: 500, color: checked ? "var(--text)" : "var(--text2)" }}>
                                  {pg.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ─── Create User Tab ───────────────────────────────────────────────────────────
function CreateUser({ onSuccess }) {
  const defaultPerms = ["jobs","courses","ats","interview","linkedin","portfolio","stocks"];
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm: "",
    level: 1, department: "member", page_permissions: defaultPerms
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const strength = (() => {
    const p = form.password; if (!p) return 0;
    return [p.length >= 8, /[A-Z]/.test(p), /[0-9]/.test(p), /[^a-zA-Z0-9]/.test(p)].filter(Boolean).length;
  })();
  const strLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strColor = ["", "#f87171", "#fbbf24", "#60a5fa", "#4ade80"][strength];

  const togglePage = (key) => {
    set("page_permissions", form.page_permissions.includes(key)
      ? form.page_permissions.filter(p => p !== key)
      : [...form.page_permissions, key]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return setError("All fields are required.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    try {
      setLoading(true); setError(""); setSuccess("");
      await axios.post(
        `${API}/auth/register`,
        {
          name: form.name.trim(), email: form.email.toLowerCase().trim(),
          password: form.password, level: form.level,
          department: form.department, page_permissions: form.page_permissions
        },
        { headers: authHeader() }
      );
      setSuccess(`✅ User "${form.name.trim()}" created successfully.`);
      setForm({ name: "", email: "", password: "", confirm: "", level: 1, department: "member", page_permissions: defaultPerms });
      setTimeout(() => onSuccess(), 1200);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create user.");
    } finally { setLoading(false); }
  };

  const iStyle = {
    width: "100%", padding: "11px 13px 11px 40px",
    background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 10, fontSize: 14, color: "var(--text)", outline: "none",
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{
        background: "#0a1628", border: "1px solid rgba(255,255,255,.07)",
        borderRadius: 18, padding: "32px", boxShadow: "0 4px 24px rgba(0,0,0,.3)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 13,
            background: "rgba(59,130,246,.12)", border: "1px solid rgba(59,130,246,.2)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
          }}>👤</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>Create New User</div>
            <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 2 }}>
              User can log in immediately after creation.
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Name + Email */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".7px", display: "block", marginBottom: 7 }}>Full Name *</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none", opacity: .4 }}>👤</span>
                <input value={form.name} onChange={e => set("name", e.target.value)}
                  placeholder="Rahul Sharma" style={iStyle}
                  onFocus={e => { e.target.style.borderColor = "rgba(59,130,246,.5)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,.08)"; }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".7px", display: "block", marginBottom: 7 }}>Email Address *</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none", opacity: .4 }}>✉</span>
                <input value={form.email} onChange={e => set("email", e.target.value)}
                  type="email" placeholder="rahul@example.com" style={iStyle}
                  onFocus={e => { e.target.style.borderColor = "rgba(59,130,246,.5)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,.08)"; }} />
              </div>
            </div>
          </div>

          {/* Password */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".7px", display: "block", marginBottom: 7 }}>Password *</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none", opacity: .4 }}>🔒</span>
                <input value={form.password} onChange={e => set("password", e.target.value)}
                  type={showPwd ? "text" : "password"} placeholder="Min 8 characters"
                  style={{ ...iStyle, paddingRight: 50 }}
                  onFocus={e => { e.target.style.borderColor = "rgba(59,130,246,.5)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,.08)"; }} />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  style={{
                    position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: 600, color: "var(--text3)"
                  }}>
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,.07)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${strength * 25}%`, background: strColor, borderRadius: 3, transition: "all .3s" }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: strColor }}>{strLabel}</span>
                </div>
              )}
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".7px", display: "block", marginBottom: 7 }}>Confirm Password *</label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none",
                  color: form.confirm && form.confirm === form.password ? "#4ade80" : "rgba(255,255,255,.3)"
                }}>✓</span>
                <input value={form.confirm} onChange={e => set("confirm", e.target.value)}
                  type="password" placeholder="Re-enter password"
                  style={{ ...iStyle, borderColor: form.confirm && form.confirm !== form.password ? "rgba(248,113,113,.4)" : "rgba(255,255,255,.08)" }}
                  onFocus={e => { e.target.style.borderColor = "rgba(59,130,246,.5)"; }}
                  onBlur={e => { e.target.style.borderColor = form.confirm && form.confirm !== form.password ? "rgba(248,113,113,.4)" : "rgba(255,255,255,.08)"; }} />
              </div>
            </div>
          </div>

          {/* Level + Department */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".7px", display: "block", marginBottom: 10 }}>Access Level</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {LEVELS.map(l => (
                  <label key={l.value} onClick={() => set("level", l.value)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 12px",
                      background: form.level === l.value ? l.bg : "rgba(255,255,255,.02)",
                      border: `1px solid ${form.level === l.value ? l.border : "rgba(255,255,255,.05)"}`,
                      borderRadius: 9, cursor: "pointer", transition: "all .15s"
                    }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                      border: `1.5px solid ${form.level === l.value ? l.color : "rgba(255,255,255,.18)"}`,
                      background: form.level === l.value ? l.bg : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {form.level === l.value && <span style={{ color: l.color, fontSize: 9, fontWeight: 800 }}>✓</span>}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: l.color }}>{l.label}</div>
                      <div style={{ fontSize: 10, color: "var(--text3)", lineHeight: 1.3 }}>{l.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".7px", display: "block", marginBottom: 10 }}>Department</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {DEPARTMENTS.map(d => {
                    const cfg = DEPT_CONFIG[d];
                    const active = form.department === d;
                    return (
                      <button key={d} type="button" onClick={() => set("department", d)}
                        style={{
                          padding: "7px 16px",
                          background: active ? cfg.bg : "rgba(255,255,255,.03)",
                          border: `1px solid ${active ? cfg.border : "rgba(255,255,255,.07)"}`,
                          borderRadius: 20, fontSize: 12, fontWeight: 600,
                          color: active ? cfg.color : "var(--text2)",
                          cursor: "pointer", transition: "all .15s", textTransform: "capitalize"
                        }}>
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".7px", display: "block", marginBottom: 10 }}>
                  Page Permissions
                  {form.level < 2 && (
                    <span style={{ marginLeft: 8, fontSize: 10, color: "#fbbf24", fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>(Level 0 & 1 see all)</span>
                  )}
                </label>
                <div style={{
                  display: "flex", flexDirection: "column", gap: 5,
                  opacity: form.level < 2 ? 0.4 : 1,
                  pointerEvents: form.level < 2 ? "none" : "auto"
                }}>
                  {ALL_PAGES.map(pg => {
                    const checked = form.page_permissions.includes(pg.key);
                    return (
                      <label key={pg.key} onClick={() => togglePage(pg.key)}
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          cursor: "pointer", userSelect: "none", padding: "6px 10px",
                          background: checked ? "rgba(59,130,246,.07)" : "rgba(255,255,255,.02)",
                          border: `1px solid ${checked ? "rgba(59,130,246,.2)" : "rgba(255,255,255,.05)"}`,
                          borderRadius: 7, transition: "all .12s"
                        }}>
                        <div style={{
                          width: 15, height: 15, borderRadius: 4, flexShrink: 0,
                          border: `1.5px solid ${checked ? "rgba(59,130,246,.7)" : "rgba(255,255,255,.18)"}`,
                          background: checked ? "rgba(59,130,246,.2)" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                          {checked && <span style={{ color: "#60a5fa", fontSize: 9, fontWeight: 800 }}>✓</span>}
                        </div>
                        <span style={{ fontSize: 12 }}>{pg.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 500, color: checked ? "var(--text)" : "var(--text2)" }}>{pg.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {error  && <div style={{ padding: "10px 14px", background: "rgba(248,113,113,.08)", border: "1px solid rgba(248,113,113,.15)", borderRadius: 9, fontSize: 13, color: "#fca5a5", display: "flex", gap: 8, alignItems: "center" }}>⚠ {error}</div>}
          {success && <div style={{ padding: "10px 14px", background: "rgba(34,197,94,.08)", border: "1px solid rgba(34,197,94,.2)", borderRadius: 9, fontSize: 13, color: "#4ade80" }}>{success}</div>}

          <button type="submit" disabled={loading}
            style={{
              padding: "13px",
              background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
              border: "none", borderRadius: 11, fontSize: 14, fontWeight: 700,
              color: "white", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .75 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
              boxShadow: "0 6px 20px rgba(59,130,246,.35)", transition: "all .2s"
            }}
            onMouseEnter={e => !loading && (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "none")}>
            {loading ? <><span className="spinner" />Creating…</> : "Create User →"}
          </button>
        </form>
      </div>
    </div>
  );
}
