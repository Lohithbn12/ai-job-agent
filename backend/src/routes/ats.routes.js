/**
 * routes/ats.routes.js
 * ──────────────────────────────────────────────────────────────────────────
 * ATS (Applicant Tracking System) endpoints.
 * Replaces Python's /ats/score/ and /ats/import-resume/ from main.py.
 *
 *   POST /ats/score/          → score a structured resume dict
 *   POST /ats/import-resume/  → upload PDF → parse + score in one call
 *
 * Mounted in server.js as:
 *   app.use('/ats', require('./routes/ats.routes'));
 * ──────────────────────────────────────────────────────────────────────────
 */

"use strict";

const express  = require("express");
const multer   = require("multer");
const path     = require("path");
const fs       = require("fs");
const re       = require("module"); // unused but kept for parity

const { analyseResumeFile, analyseResumeDict } = require("../services/ats.service");
const { extractTextFromPDF }                   = require("../resume/parser");
const { extractRoles }                         = require("../resume/roleExtractor");

const router = express.Router();

// ── Multer ────────────────────────────────────────────────────────────────────
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


// ── POST /ats/score/ ──────────────────────────────────────────────────────────

router.post("/score/", async (req, res) => {
  const resumeDict = { ...(req.body || {}) };

  // Pull out optional job_description before passing to analyser
  const jobDescription = resumeDict.job_description || "";
  delete resumeDict.job_description;

  const name = resumeDict?.personal?.name || "Unknown";
  console.log(`[ATS/score] ${name}`);

  const result = analyseResumeDict(resumeDict, jobDescription);

  console.log(
    `[ATS/score] ${result.score}/100  ${result.grade}  ` +
    `engine=${result.spacy_used ? "spaCy" : "regex"}`
  );

  return res.json(result);
});


// ── POST /ats/import-resume/ ──────────────────────────────────────────────────

router.post("/import-resume/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded.", resume: null, ats_result: null });
  }

  const filePath = req.file.path;
  console.log(`[ATS/import] ${req.file.originalname}`);

  const result = await analyseResumeFile(filePath);

  if (result.error) {
    return res.status(422).json({ error: result.error, resume: null, ats_result: null });
  }

  const parsed  = result.parsed  || {};
  const contact = parsed.contact || {};
  const skills  = parsed.skills  || { technical: [], tools: [], soft: [] };

  // Build resume dict in frontend builder shape (same as Python _convert_exp / _convert_edu)
  const resumeDict = {
    personal: {
      name:      contact.name      || "",
      email:     contact.email     || "",
      phone:     contact.phone     || "",
      location:  contact.location  || "",
      linkedin:  contact.linkedin  || "",
      portfolio: contact.github    || "",
    },
    summary:        parsed.summary || "",
    experience:     _convertExp(parsed.experience || []),
    education:      _convertEdu(parsed.education  || []),
    skills,
    certifications: parsed.certifications || [],
    projects:       parsed.projects       || [],
    languages:      [],
  };

  // Get roles from raw text for search
  let roles = result.detected_roles || [];
  if (!roles.length) {
    try {
      const text = await extractTextFromPDF(filePath);
      roles = extractRoles(text);
    } catch { /* non-fatal */ }
  }

  const allSkills = [...skills.technical, ...skills.tools, ...skills.soft];
  const engine    = result.spacy_used ? "spaCy NLP" : "regex";

  console.log(
    `[ATS/import] skills=${allSkills.length} score=${result.score} engine=${engine}`
  );

  return res.json({
    resume:     resumeDict,
    ats_result: result,
    raw_skills: allSkills,
    roles,
    parse_note: (
      `Extracted using ${engine}. ` +
      `Found ${allSkills.length} skills, ` +
      `${resumeDict.experience.length} experience entries, ` +
      `${resumeDict.education.length} education entries. ` +
      "Review and complete any missing sections."
    ),
  });
});


// ── Conversion helpers (mirrors Python _convert_exp / _convert_edu) ───────────

function _convertExp(entries) {
  return entries.map((e) => {
    const parts = (e.date_range || "").split(/\s*[-–—]\s*/);
    const start = parts[0]?.trim() || "";
    const end   = parts[1]?.trim() || "Present";
    const bullets = (e.bullets || []).slice(0, 4);
    while (bullets.length < 4) bullets.push("");
    return {
      title:    e.title   || "",
      company:  e.company || "",
      location: "",
      start,
      end,
      bullets,
    };
  });
}

function _convertEdu(entries) {
  return entries.map((e) => ({
    degree: e.degree || "",
    field:  e.field  || "",
    school: e.school || "",
    year:   e.year   || "",
    gpa:    e.gpa    || "",
  }));
}


module.exports = router;
