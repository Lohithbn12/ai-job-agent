/**
 * auth/auth.routes.js
 * ──────────────────────────────────────────────────────────────────────────
 * Express router for authentication + user management.
 *
 *   POST   /auth/register
 *   POST   /auth/login
 *   GET    /auth/me
 *   POST   /auth/logout
 *
 *   GET    /auth/users           ← list all users (admin only)
 *   GET    /auth/users/stats     ← counts by level + online users (admin only)
 *   PUT    /auth/users/:id       ← update level / dept / permissions (admin only)
 *   DELETE /auth/users/:id       ← remove a user (admin only)
 *
 * Mounted in server.js as:
 *   app.use('/auth', require('./auth/auth.routes'));
 * ──────────────────────────────────────────────────────────────────────────
 */

"use strict";

const express             = require("express");
const User                = require("../db/models/User");
const { hashPassword,
        verifyPassword,
        createToken }     = require("./auth.service");
const { requireAuth }     = require("./auth.middleware");

const router = express.Router();

// A user is considered "online" if last_active within this window (ms)
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes


// ── Validation helpers ────────────────────────────────────────────────────────

function validateRegister({ name, email, password }) {
  const errors = [];
  if (!name || name.trim().length < 2)  errors.push("Name must be at least 2 characters.");
  if (name && name.trim().length > 80)  errors.push("Name is too long.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    errors.push("Invalid email format.");
  if (!password || password.length < 8) errors.push("Password must be at least 8 characters.");
  return errors;
}

/** Middleware: block non-admins (level 0 only) */
function requireAdmin(req, res, next) {
  if (req.user?.level !== 0)
    return res.status(403).json({ detail: "Admin access required." });
  next();
}

/** Return true if the user's last_active is within ONLINE_THRESHOLD_MS */
function isOnline(user) {
  if (!user.last_active) return false;
  return (Date.now() - new Date(user.last_active).getTime()) < ONLINE_THRESHOLD_MS;
}


// ── POST /auth/register ───────────────────────────────────────────────────────

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body || {};

  const errors = validateRegister({ name, email, password });
  if (errors.length) return res.status(400).json({ detail: errors.join(" ") });

  const cleanEmail = email.trim().toLowerCase();
  const cleanName  = name.trim();

  const existing = await User.findOne({ email: cleanEmail });
  if (existing) {
    return res.status(400).json({
      detail: "An account with this email already exists. Please sign in.",
    });
  }

  const password_hash = await hashPassword(password);
  const user = await User.create({ name: cleanName, email: cleanEmail, password_hash });

  const token = createToken(user._id.toString(), cleanEmail);
  console.log(`[Auth] Registered: ${cleanEmail}`);

  return res.status(201).json({ user: user.toSafeObject(), token });
});


// ── POST /auth/login ──────────────────────────────────────────────────────────

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ detail: "Email and password are required." });

  const cleanEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: cleanEmail }).select("+password_hash");
  if (!user) return res.status(401).json({ detail: "Invalid email or password." });

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return res.status(401).json({ detail: "Invalid email or password." });

  user.last_login  = new Date();
  user.last_active = new Date();
  user.is_online   = true;
  await user.save();

  const token = createToken(user._id.toString(), cleanEmail);
  console.log(`[Auth] Login: ${cleanEmail}`);

  return res.json({ user: user.toSafeObject(), token });
});


// ── GET /auth/me ──────────────────────────────────────────────────────────────

router.get("/me", requireAuth, (req, res) => res.json(req.user));


// ── POST /auth/logout ─────────────────────────────────────────────────────────

router.post("/logout", requireAuth, async (req, res) => {
  // Mark user offline in DB
  await User.findByIdAndUpdate(req.user.id, { is_online: false });
  return res.json({ message: "Logged out successfully" });
});


// ═══════════════════════════════════════════════════════════════════════════════
//  USER MANAGEMENT  (admin-only)
// ═══════════════════════════════════════════════════════════════════════════════

// ── GET /auth/users/stats ─────────────────────────────────────────────────────
// Returns:
//   total_users, online_count, by_level: [{level, count, online}], online_users: [...]

router.get("/users/stats", requireAuth, requireAdmin, async (_req, res) => {
  const allUsers = await User.find({}).lean();

  const onlineWindow = new Date(Date.now() - ONLINE_THRESHOLD_MS);

  // Per-level breakdown
  const levelMap = {};
  for (const u of allUsers) {
    const lvl = u.level ?? 1;
    if (!levelMap[lvl]) levelMap[lvl] = { level: lvl, count: 0, online: 0 };
    levelMap[lvl].count++;
    if (u.last_active && new Date(u.last_active) >= onlineWindow) {
      levelMap[lvl].online++;
    }
  }

  const onlineUsers = allUsers
    .filter(u => u.last_active && new Date(u.last_active) >= onlineWindow)
    .sort((a, b) => new Date(b.last_active) - new Date(a.last_active))
    .map(u => ({
      id:          u._id.toString(),
      name:        u.name,
      email:       u.email,
      level:       u.level ?? 1,
      department:  u.department || "member",
      last_active: u.last_active,
      last_login:  u.last_login,
    }));

  return res.json({
    total_users:  allUsers.length,
    online_count: onlineUsers.length,
    by_level:     Object.values(levelMap).sort((a, b) => a.level - b.level),
    online_users: onlineUsers,
  });
});


// ── GET /auth/users ───────────────────────────────────────────────────────────

router.get("/users", requireAuth, requireAdmin, async (_req, res) => {
  const users = await User.find({})
    .sort({ created_at: -1 })
    .lean();

  const onlineWindow = new Date(Date.now() - ONLINE_THRESHOLD_MS);

  return res.json({
    users: users.map(u => ({
      id:               u._id.toString(),
      name:             u.name,
      email:            u.email,
      level:            u.level ?? 1,
      department:       u.department || "member",
      page_permissions: u.page_permissions || [],
      is_online:        !!(u.last_active && new Date(u.last_active) >= onlineWindow),
      last_login:       u.last_login   || null,
      last_active:      u.last_active  || null,
      created_at:       u.created_at,
    })),
  });
});


// ── PUT /auth/users/:id ───────────────────────────────────────────────────────

router.put("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;

  if (id === req.user.id)
    return res.status(400).json({ detail: "You cannot edit your own role." });

  const { level, department, page_permissions } = req.body || {};
  const update = {};

  if (level !== undefined)            update.level            = Number(level);
  if (department !== undefined)       update.department       = department;
  if (page_permissions !== undefined) update.page_permissions = page_permissions;

  const updated = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!updated) return res.status(404).json({ detail: "User not found." });

  console.log(`[Auth] Role updated for ${updated.email} by admin ${req.user.email}`);
  return res.json({ user: updated.toSafeObject() });
});


// ── DELETE /auth/users/:id ────────────────────────────────────────────────────

router.delete("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;

  if (id === req.user.id)
    return res.status(400).json({ detail: "You cannot delete your own account." });

  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ detail: "User not found." });

  console.log(`[Auth] Deleted user ${deleted.email} by admin ${req.user.email}`);
  return res.json({ message: "User deleted successfully." });
});


// ── GET /auth/stats/users ─────────────────────────────────────────────────────
// Alias for /auth/users/stats — frontend calls this path
router.get("/stats/users", requireAuth, requireAdmin, async (_req, res) => {
  const allUsers = await User.find({}).lean();
  const onlineWindow = new Date(Date.now() - ONLINE_THRESHOLD_MS);

  const levelMap = {};
  for (const u of allUsers) {
    const lvl = u.level ?? 1;
    if (!levelMap[lvl]) levelMap[lvl] = { level: lvl, count: 0, online: 0 };
    levelMap[lvl].count++;
    if (u.last_active && new Date(u.last_active) >= onlineWindow) {
      levelMap[lvl].online++;
    }
  }

  const onlineUsers = allUsers
    .filter(u => u.last_active && new Date(u.last_active) >= onlineWindow)
    .sort((a, b) => new Date(b.last_active) - new Date(a.last_active))
    .map(u => ({
      id:          u._id.toString(),
      name:        u.name,
      email:       u.email,
      level:       u.level ?? 1,
      department:  u.department || "member",
      last_active: u.last_active,
      last_login:  u.last_login,
    }));

  return res.json({
    total_users:  allUsers.length,
    online_count: onlineUsers.length,
    by_level:     Object.values(levelMap).sort((a, b) => a.level - b.level),
    online_users: onlineUsers,
  });
});

module.exports = router;
