/**
 * src/server.js
 * ──────────────────────────────────────────────────────────────────────────
 * JobScan API — Express entry point.
 * Replaces Python's main.py (FastAPI).
 *
 * Start dev server:  npm run dev
 * Start prod server: npm start
 * ──────────────────────────────────────────────────────────────────────────
 */

"use strict";

// ── Load .env first — before any other imports ────────────────────────────────
require("dotenv").config();

// ── Catch async errors in routes without try/catch everywhere ─────────────────
require("express-async-errors");

const express = require("express");
const cors    = require("cors");
const path    = require("path");
const fs      = require("fs");

// ── DB ────────────────────────────────────────────────────────────────────────
const connectDB = require("./db/mongo");

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes      = require("./auth/auth.routes");
const resumeRoutes    = require("./routes/resume.routes");
const jobsRoutes      = require("./routes/jobs.routes");
const coursesRoutes   = require("./routes/courses.routes");
const interviewRoutes = require("./routes/interview.routes");
const atsRoutes       = require("./routes/ats.routes");

// ── App ───────────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 8000;

// ── Ensure uploads folder exists ──────────────────────────────────────────────
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
fs.mkdirSync(UPLOAD_DIR, { recursive: true });


// ════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ════════════════════════════════════════════════════════════════════════════

// CORS — allow all origins (same as Python allow_origins=["*"])
app.use(cors({
  origin:      "*",
  methods:     ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
}));

// Parse JSON bodies (replaces FastAPI's automatic body parsing)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logger (lightweight — no morgan dependency needed)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});


// ════════════════════════════════════════════════════════════════════════════
// ROUTES
// ════════════════════════════════════════════════════════════════════════════

// Health check — useful for deployment checks
app.get("/", (_req, res) => {
  res.json({
    name:    "JobScan API",
    version: "2.1.0",
    status:  "running",
    stack:   "Node.js / Express",
  });
});

// Auth   → /auth/register  /auth/login  /auth/me  /auth/logout
app.use("/auth", authRoutes);

// Resume → /upload-resume/
app.use("/", resumeRoutes);

// Jobs   → /search-jobs/
app.use("/", jobsRoutes);

// Courses → /search-courses/
app.use("/", coursesRoutes);

// Interview → /interview-questions/
app.use("/", interviewRoutes);

// ATS    → /ats/score/  /ats/import-resume/
app.use("/ats", atsRoutes);


// ════════════════════════════════════════════════════════════════════════════
// ERROR HANDLER
// ════════════════════════════════════════════════════════════════════════════

// Must be defined AFTER all routes — Express identifies error handlers by
// their 4-argument signature (err, req, res, next).
// express-async-errors forwards any thrown error to this handler automatically.

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  // Multer file errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      detail: `File too large. Max size is ${process.env.MAX_FILE_SIZE_MB || 10}MB.`,
    });
  }
  if (err.message?.includes("Only PDF")) {
    return res.status(400).json({ detail: err.message });
  }

  // Auth errors forwarded from middleware
  if (err.status === 401) {
    return res.status(401).json({ detail: err.message });
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ detail: messages.join(" ") });
  }

  // Mongoose duplicate key (unique index violation)
  if (err.code === 11000) {
    return res.status(400).json({
      detail: "An account with this email already exists.",
    });
  }

  // Generic server error
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);
  return res.status(err.status || 500).json({
    detail: err.message || "Internal server error",
  });
});


// ════════════════════════════════════════════════════════════════════════════
// START
// ════════════════════════════════════════════════════════════════════════════

async function start() {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Start HTTP server
  app.listen(PORT, () => {
    console.log("─────────────────────────────────────────────");
    console.log(`  JobScan API  v2.1.0  (Node.js / Express)`);
    console.log(`  http://localhost:${PORT}`);
    console.log("─────────────────────────────────────────────");
    console.log("  Endpoints:");
    console.log(`  GET  /                        health check`);
    console.log(`  POST /auth/register`);
    console.log(`  POST /auth/login`);
    console.log(`  GET  /auth/me`);
    console.log(`  POST /upload-resume/`);
    console.log(`  POST /search-jobs/`);
    console.log(`  POST /search-courses/`);
    console.log(`  POST /interview-questions/`);
    console.log(`  POST /ats/score/`);
    console.log(`  POST /ats/import-resume/`);
    console.log("─────────────────────────────────────────────");
  });
}

start().catch((err) => {
  console.error("[Fatal] Could not start server:", err.message);
  process.exit(1);
});

module.exports = app;   // exported for testing
