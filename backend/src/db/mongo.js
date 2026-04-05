/**
 * db/mongo.js
 * ──────────────────────────────────────────────────────────────────────────
 * Mongoose connection helper.
 *
 * Usage (call once at app startup in server.js):
 *   const connectDB = require('./db/mongo');
 *   await connectDB();
 *
 * All models import mongoose directly — this file just opens the connection.
 * ──────────────────────────────────────────────────────────────────────────
 */

"use strict";

const mongoose = require("mongoose");

let _connected = false;

/**
 * Opens a Mongoose connection to MONGO_URI (from .env).
 * Safe to call multiple times — re-uses the existing connection.
 */
async function connectDB() {
  if (_connected) return;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error(
      "[MongoDB] MONGO_URI is not set. " +
      "Add it to your .env file (see .env.example)."
    );
  }

  try {
    const isLocal = uri.includes('localhost') || uri.includes('127.0.0.1');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS:          45000,
      tls:                      !isLocal,
      tlsInsecure:              true,   // fixes Windows OpenSSL TLS issue
    });

    _connected = true;
    console.log(`[MongoDB] Connected → ${_safeUri(uri)}`);

    // Graceful shutdown helpers
    process.on("SIGINT",  () => _close("SIGINT"));
    process.on("SIGTERM", () => _close("SIGTERM"));

  } catch (err) {
    console.error("[MongoDB] Connection failed:", err.message);
    process.exit(1);
  }
}

async function _close(signal) {
  await mongoose.connection.close();
  console.log(`[MongoDB] Connection closed (${signal})`);
  process.exit(0);
}

/** Masks password in the URI for safe console logging. */
function _safeUri(uri) {
  try {
    const u = new URL(uri);
    if (u.password) u.password = "***";
    return u.toString();
  } catch {
    return uri.replace(/:([^@/]+)@/, ":***@");
  }
}

module.exports = connectDB;
