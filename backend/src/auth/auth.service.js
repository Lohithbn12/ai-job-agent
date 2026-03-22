/**
 * auth/auth.service.js
 * ──────────────────────────────────────────────────────────────────────────
 * Handles password hashing and JWT creation / verification.
 * Replaces Python's passlib + python-jose in auth.py.
 * ──────────────────────────────────────────────────────────────────────────
 */

"use strict";

const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");

const SALT_ROUNDS = 12;   // same security level as bcrypt default in Python

// ── Password helpers ──────────────────────────────────────────────────────────

/**
 * Hash a plain-text password.
 * @param {string} plain
 * @returns {Promise<string>} bcrypt hash
 */
async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * Compare plain-text password against a stored hash.
 * @param {string} plain
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// ── JWT helpers ───────────────────────────────────────────────────────────────

/**
 * Create a signed JWT for a user.
 * @param {string} userId  - MongoDB ObjectId as string
 * @param {string} email
 * @returns {string} signed JWT
 */
function createToken(userId, email) {
  const secret  = process.env.JWT_SECRET;
  const expires = process.env.JWT_EXPIRE || "720h";

  if (!secret || secret === "CHANGE_ME_use_a_long_random_secret_at_least_32_chars") {
    throw new Error(
      "[Auth] JWT_SECRET is not set or is still the default. " +
      "Set a real secret in your .env file."
    );
  }

  return jwt.sign(
    { sub: userId, email },
    secret,
    { expiresIn: expires }
  );
}

/**
 * Verify and decode a JWT.
 * Throws an error if the token is invalid or expired.
 * @param {string} token
 * @returns {{ sub: string, email: string, iat: number, exp: number }}
 */
function decodeToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const error = new Error("Invalid or expired token");
    error.status = 401;
    throw error;
  }
}

module.exports = { hashPassword, verifyPassword, createToken, decodeToken };
