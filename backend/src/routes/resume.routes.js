/**
 * routes/resume.routes.js
 * ──────────────────────────────────────────────────────────────────────────
 * POST /upload-resume/
 * Accepts a PDF, extracts skills, roles, courses, search keywords.
 * Replaces Python's /upload-resume/ endpoint in main.py.
 *
 * Mounted in server.js as:
 *   app.use('/', require('./routes/resume.routes'));
 * ──────────────────────────────────────────────────────────────────────────
 */

"use strict";

const express  = require("express");
const multer   = require("multer");
const path     = require("path");
const fs       = require("fs");

const { extractTextFromPDF }                    = require("../resume/parser");
const { extractSkillsWeighted, getSearchKeywords } = require("../resume/skillExtractor");
const { extractRoles }                          = require("../resume/roleExtractor");
const { extractCourses }                        = require("../resume/courseExtractor");

const router = express.Router();

// ── Multer — save to uploads/ folder ─────────────────────────────────────────
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") return cb(null, true);
    cb(new Error("Only PDF files are accepted."));
  },
});


// ── POST /upload-resume/ ──────────────────────────────────────────────────────

router.post("/upload-resume/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const filePath = req.file.path;

  // Extract text
  const text = await extractTextFromPDF(filePath);

  // Extract all resume intelligence
  const weightedSkills   = extractSkillsWeighted(text);
  const skillsFlat       = weightedSkills.map((s) => s.skill);
  const roles            = extractRoles(text);
  const courses          = extractCourses(text);
  const searchKeywords   = getSearchKeywords(text, 8, 0.20);

  return res.json({
    filename:        req.file.originalname,
    skills:          skillsFlat,
    weighted_skills: weightedSkills,
    search_keywords: searchKeywords,
    roles,
    courses,
  });
});


module.exports = router;
