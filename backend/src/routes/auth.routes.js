/**
 * auth/auth.routes.js
 * ──────────────────────────────────────────────────────────────────────────
 * Express router for authentication.
 * Mirrors all four endpoints from Python auth.py:
 *   POST /auth/register
 *   POST /auth/login
 *   GET  /auth/me
 *   POST /auth/logout
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


// ── Validation helpers ────────────────────────────────────────────────────────

function validateRegister({ name, email, password }) {
  const errors = [];

  if (!name || name.trim().length < 2)
    errors.push("Name must be at least 2 characters.");
  if (name && name.trim().length > 80)
    errors.push("Name is too long.");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    errors.push("Invalid email format.");

  if (!password || password.length < 8)
    errors.push("Password must be at least 8 characters.");

  return errors;
}


// ── POST /auth/register ───────────────────────────────────────────────────────

router.post("/register", async (req, res) => {
  const { name, email, password, level, department, page_permissions } = req.body || {};

  // 1. Validate input
  const errors = validateRegister({ name, email, password });
  if (errors.length) {
    return res.status(400).json({ detail: errors.join(" ") });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName  = name.trim();

  // 2. Check for existing account
  const existing = await User.findOne({ email: cleanEmail });
  if (existing) {
    return res.status(400).json({
      detail: "An account with this email already exists. Please sign in.",
    });
  }

  // 3. Create user
  const password_hash = await hashPassword(password);
  const user = await User.create({
    name:             cleanName,
    email:            cleanEmail,
    password_hash,
    level:            level !== undefined ? Number(level) : 1,
    department:       department       || "member",
    page_permissions: page_permissions || ["jobs","courses","ats","interview"],
  });

  // 4. Issue token
  const token = createToken(user._id.toString(), cleanEmail);

  console.log(`[Auth] Registered: ${cleanEmail}`);

  return res.status(201).json({
    user:  user.toSafeObject(),
    token,
  });
});


// ── POST /auth/login ──────────────────────────────────────────────────────────

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ detail: "Email and password are required." });
  }

  const cleanEmail = email.trim().toLowerCase();

  // 1. Find user — explicitly select password_hash (it's hidden by default)
  const user = await User.findOne({ email: cleanEmail }).select("+password_hash");
  if (!user) {
    return res.status(401).json({ detail: "Invalid email or password." });
  }

  // 2. Verify password
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ detail: "Invalid email or password." });
  }

  // 3. Update last_login
  user.last_login = new Date();
  await user.save();

  // 4. Issue token
  const token = createToken(user._id.toString(), cleanEmail);

  console.log(`[Auth] Login: ${cleanEmail}`);

  return res.json({
    user:  user.toSafeObject(),
    token,
  });
});


// ── GET /auth/me ──────────────────────────────────────────────────────────────

router.get("/me", requireAuth, (req, res) => {
  // req.user is already populated by requireAuth middleware
  return res.json(req.user);
});


// ── POST /auth/logout ─────────────────────────────────────────────────────────

router.post("/logout", (_req, res) => {
  // Stateless JWT — client just deletes the token locally.
  // Endpoint kept for API completeness / future token blacklisting.
  return res.json({ message: "Logged out successfully" });
});




// ── GET /auth/users ───────────────────────────────────────────────────────────

router.get("/users", requireAuth, async (req, res) => {
  const users = await User.find({}).select("-password_hash").sort({ created_at: -1 });
  return res.json({
    users: users.map(u => ({
      id:         u._id.toString(),
      name:       u.name,
      email:      u.email,
      created_at: u.created_at,
      last_login: u.last_login,
    })),
    total: users.length,
  });
});


// ── DELETE /auth/users/:id ────────────────────────────────────────────────────

router.delete("/users/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) {
    return res.status(400).json({ detail: "You cannot delete your own account." });
  }
  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) {
    return res.status(404).json({ detail: "User not found." });
  }
  console.log(`[Auth] Deleted: ${deleted.email} by ${req.user.email}`);
  return res.json({ message: `User "${deleted.name}" deleted successfully.` });
});



// ── PUT /auth/users/:id ───────────────────────────────────────────────────────
// Update user level, department, page_permissions

router.put("/users/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { level, department, page_permissions, name } = req.body;

  // Only level 0 (admin) can update roles
  if (req.user.level !== 0) {
    return res.status(403).json({ detail: "Only admins can update user roles." });
  }

  const allowed = {};
  if (name        !== undefined) allowed.name             = name;
  if (level       !== undefined) allowed.level            = Number(level);
  if (department  !== undefined) allowed.department       = department;
  if (page_permissions !== undefined) allowed.page_permissions = page_permissions;

  const updated = await User.findByIdAndUpdate(id, allowed, { new: true });
  if (!updated) return res.status(404).json({ detail: "User not found." });

  console.log(`[Auth] Updated user ${updated.email} → level=${updated.level} dept=${updated.department}`);
  return res.json({ message: "User updated.", user: updated.toSafeObject() });
});

module.exports = router;
