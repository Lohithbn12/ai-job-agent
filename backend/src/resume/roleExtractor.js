/**
 * resume/roleExtractor.js
 * ──────────────────────────────────────────────────────────────────────────
 * Extracts job roles / titles from resume text.
 * Replaces Python's role_extractor.py.
 *
 * Strategy (same as Python version):
 *  1. Match against ROLES_DB (curated list of known job titles)
 *  2. Dynamic extraction from summary/objective and experience sections
 *  3. Merge + deduplicate
 *
 * Exports:
 *   extractRoles(resumeText) → string[]
 * ──────────────────────────────────────────────────────────────────────────
 */

"use strict";

// ── Curated roles database ────────────────────────────────────────────────────
// Mirrors Python's utils/roles.py ROLES_DB
const ROLES_DB = [
  // Data & Analytics
  "data analyst", "senior data analyst", "junior data analyst",
  "data scientist", "senior data scientist", "lead data scientist",
  "data engineer", "senior data engineer", "data engineering lead",
  "business analyst", "business intelligence analyst", "bi analyst",
  "analytics engineer", "marketing analyst", "product analyst",
  "financial analyst", "operations analyst", "research analyst",

  // Software Engineering
  "software engineer", "senior software engineer", "junior software engineer",
  "software developer", "senior software developer", "full stack developer",
  "fullstack developer", "frontend developer", "backend developer",
  "full stack engineer", "frontend engineer", "backend engineer",
  "web developer", "mobile developer", "ios developer", "android developer",

  // ML / AI
  "machine learning engineer", "ml engineer", "ai engineer",
  "deep learning engineer", "nlp engineer", "computer vision engineer",
  "research scientist", "applied scientist", "ai researcher",
  "mlops engineer", "data modeler",

  // DevOps / Cloud / Infra
  "devops engineer", "site reliability engineer", "sre",
  "cloud engineer", "cloud architect", "infrastructure engineer",
  "platform engineer", "systems engineer", "network engineer",
  "security engineer", "cybersecurity analyst",

  // Management
  "engineering manager", "product manager", "project manager",
  "program manager", "technical lead", "tech lead", "team lead",
  "it manager", "delivery manager", "scrum master",

  // Design
  "ui designer", "ux designer", "ui/ux designer", "product designer",
  "graphic designer", "interaction designer",

  // Other tech
  "database administrator", "dba", "solutions architect",
  "enterprise architect", "technical architect", "qa engineer",
  "test engineer", "automation engineer", "embedded engineer",
  "hardware engineer", "systems analyst",

  // Entry level / intern
  "software intern", "data intern", "engineering intern",
  "graduate engineer trainee", "associate software engineer",
  "associate data analyst", "trainee engineer",
];

// Role indicator words — a phrase must contain one to be considered a role
const ROLE_INDICATORS = new Set([
  "analyst", "engineer", "developer", "scientist", "manager",
  "designer", "architect", "consultant", "specialist", "administrator",
  "director", "lead", "intern", "associate", "coordinator",
  "programmer", "devops", "fullstack", "frontend", "backend",
  "researcher", "modeler", "strategist", "executive", "officer",
  "trainee", "graduate", "apprentice",
]);

// Noise phrases to skip even if they contain an indicator word
const NOISE_PHRASES = new Set([
  "team lead", "leads", "leading", "responsible for",
  "working with", "experience with", "knowledge of",
]);


// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Extract job roles from resume text.
 *
 * @param {string} resumeText  Full text of the resume
 * @returns {string[]}  Sorted, deduplicated list of role strings
 */
function extractRoles(resumeText) {
  if (!resumeText) return [];

  const lower = resumeText.toLowerCase();

  // 1. DB match — most reliable
  const dbRoles = ROLES_DB.filter((role) => lower.includes(role.toLowerCase()));

  // 2. Dynamic extraction
  const dynamicRoles = _extractFromSections(resumeText);

  // 3. Merge + deduplicate + clean
  const all = [...new Set([...dbRoles, ...dynamicRoles])]
    .map((r) => r.trim())
    .filter((r) => r.length > 2);

  return all.sort();
}


// ── Dynamic extraction helpers ────────────────────────────────────────────────

function _extractFromSections(text) {
  const roles = [];

  // Objective/Summary sentence patterns
  const TITLE_PATTERNS = [
    /(?:worked as|working as|role as|position as|currently a)\s+(?:a\s+)?([A-Za-z\s]{3,40}?)(?:\s+at|\s+in|\.|,|$)/gi,
    /(?:seeking|looking for|applying for)\s+(?:a\s+)?([A-Za-z\s]{3,40}?)\s+(?:role|position|job|opportunity)/gi,
    /(?:i am a|i'm a|as an?|experienced as)\s+([A-Za-z\s]{3,40}?)\s+(?:with|who|having|at)/gi,
  ];

  for (const pattern of TITLE_PATTERNS) {
    let m;
    while ((m = pattern.exec(text)) !== null) {
      const match = m[1].trim().toLowerCase();
      if (_isValidRole(match)) roles.push(match);
    }
  }

  // Experience section titles
  roles.push(..._extractExperienceTitles(text));

  return [...new Set(roles)];
}

function _extractExperienceTitles(text) {
  const titles = [];

  const expMatch = text.match(
    /(?:experience|work history|employment)[:\s\n]+([\s\S]*?)(?=\n[A-Z][A-Z\s]{3,}:|\Z)/i
  );
  if (!expMatch) return titles;

  const lines = expMatch[1].split("\n");
  for (const line of lines) {
    const clean = line.trim();
    if (!clean) continue;
    if (/\d{4}/.test(clean)) continue;          // skip date lines
    if (clean === clean.toUpperCase()) continue; // skip ALL CAPS (companies)
    if (clean.split(" ").length > 6) continue;   // skip long description lines
    if (clean.length < 4) continue;

    if (_isValidRole(clean.toLowerCase())) titles.push(clean.toLowerCase());
  }

  return titles;
}

function _isValidRole(text) {
  if (!text || text.length < 4) return false;
  if (text.split(" ").length > 6) return false;
  if (NOISE_PHRASES.has(text)) return false;

  // Must contain at least one role indicator word
  return [...ROLE_INDICATORS].some((ind) => text.includes(ind));
}


module.exports = { extractRoles, ROLES_DB, ROLE_INDICATORS };
