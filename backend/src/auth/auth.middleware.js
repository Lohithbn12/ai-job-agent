/**
 * auth/auth.middleware.js
 * ──────────────────────────────────────────────────────────────────────────
 * Express middleware that protects routes.
 * Replaces FastAPI's  Depends(get_current_user)  from auth.py.
 *
 * Usage on any protected route:
 *   const { requireAuth } = require('../auth/auth.middleware');
 *   router.get('/protected', requireAuth, (req, res) => {
 *     res.json(req.user);   // ← populated by this middleware
 *   });
 * ──────────────────────────────────────────────────────────────────────────
 */

"use strict";

const { decodeToken } = require("./auth.service");
const User            = require("../db/models/User");

/**
 * requireAuth
 * Reads Bearer token from Authorization header, verifies it,
 * loads the user from MongoDB and attaches it to req.user.
 */
async function requireAuth(req, res, next) {
  try {
    // 1. Extract token from "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ detail: "Authentication required" });
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      return res.status(401).json({ detail: "Authentication required" });
    }

    // 2. Verify JWT
    const payload = decodeToken(token);   // throws if invalid/expired

    // 3. Load user from DB (exclude password_hash)
    const user = await User.findById(payload.sub).select("-password_hash");
    if (!user) {
      return res.status(401).json({ detail: "User not found" });
    }

    // 4. Attach safe user object to request
    req.user = {
      id:         user._id.toString(),
      name:       user.name,
      email:      user.email,
      created_at: user.created_at,
    };

    next();

  } catch (err) {
    const status = err.status || 401;
    return res.status(status).json({ detail: err.message || "Unauthorized" });
  }
}

/**
 * optionalAuth
 * Same as requireAuth but does NOT block the request if no token is present.
 * Useful for routes that behave differently for logged-in vs guest users.
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) return next();

    const token = authHeader.slice(7).trim();
    if (!token) return next();

    const payload = decodeToken(token);
    const user    = await User.findById(payload.sub).select("-password_hash");
    if (user) {
      req.user = {
        id:         user._id.toString(),
        name:       user.name,
        email:      user.email,
        created_at: user.created_at,
      };
    }
  } catch {
    // silently ignore bad token for optional auth
  }
  next();
}

module.exports = { requireAuth, optionalAuth };
