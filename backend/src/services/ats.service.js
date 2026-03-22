/**
 * services/ats.service.js
 * ──────────────────────────────────────────────────────────────────────────
 * NLP-powered ATS (Applicant Tracking System) resume scorer.
 * Replaces Python's ats_engine.py + ats_scorer.py.
 *
 * Two entry points (mirroring Python):
 *   analyseResumeFile(filePath, jobDescription?)
 *     → Parses PDF + scores in one call (used by /ats/import-resume/)
 *
 *   analyseResumeDict(resumeDict, jobDescription?)
 *     → Scores a pre-parsed resume dict (used by /ats/score/)
 *
 * Score breakdown (100 pts):
 * ┌──────────────────────┬─────┐
 * │ Section              │ Max │
 * ├──────────────────────┼─────┤
 * │ Contact info         │  10 │
 * │ Summary / Objective  │  10 │
 * │ Skills (count+depth) │  25 │
 * │ Experience           │  25 │
 * │ Education            │  15 │
 * │ Certifications       │   5 │
 * │ Projects             │   5 │
 * │ JD similarity        │   5 │  (only if job_description provided)
 * └──────────────────────┴─────┘
 * ──────────────────────────────────────────────────────────────────────────
 */

"use strict";

const { extractTextFromPDF }    = require("../resume/parser");
const { extractSkillsWeighted } = require("../resume/skillExtractor");
const { extractRoles }          = require("../resume/roleExtractor");

// ── Section keywords for NLP-light parsing ────────────────────────────────────
const CONTACT_FIELDS   = ["email", "phone", "linkedin", "github", "portfolio", "location"];
const SUMMARY_MARKERS  = ["summary", "objective", "profile", "about", "overview"];
const EXP_MARKERS      = ["experience", "employment", "work history", "career"];
const EDU_MARKERS      = ["education", "academic", "qualification", "degree", "university", "college"];
const SKILL_MARKERS    = ["skills", "technologies", "tech stack", "competencies", "tools"];
const CERT_MARKERS     = ["certification", "certificate", "certified", "credential", "licence"];
const PROJECT_MARKERS  = ["project", "portfolio", "built", "developed", "created"];

// ── Regex helpers ─────────────────────────────────────────────────────────────
const EMAIL_RE    = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE    = /(\+?\d[\d\s\-().]{7,}\d)/;
const LINKEDIN_RE = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/i;
const GITHUB_RE   = /github\.com\/[a-zA-Z0-9_-]+/i;
const URL_RE      = /https?:\/\/[^\s]+/i;
const DATE_RE     = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})\b/i;
const DEGREE_RE   = /\b(b\.?e|b\.?tech|m\.?tech|b\.?sc|m\.?sc|mba|phd|bachelor|master|doctor|diploma)\b/i;


// ── analyseResumeFile ─────────────────────────────────────────────────────────

/**
 * Parse a PDF file and score it.
 *
 * @param {string} filePath
 * @param {string} [jobDescription]
 * @returns {Promise<object>}  Full ATS result (see _buildResult)
 */
async function analyseResumeFile(filePath, jobDescription = "") {
  let rawText;
  try {
    rawText = await extractTextFromPDF(filePath);
  } catch (err) {
    return { error: `Failed to read PDF: ${err.message}` };
  }

  const parsed = _parseResumeText(rawText);
  return _buildResult(parsed, rawText, jobDescription);
}


// ── analyseResumeDict ─────────────────────────────────────────────────────────

/**
 * Score a structured resume dict (already built / edited in the frontend).
 *
 * @param {object} resumeDict   Frontend resume shape
 * @param {string} [jobDescription]
 * @returns {object}
 */
function analyseResumeDict(resumeDict, jobDescription = "") {
  const parsed = _dictToParsed(resumeDict);
  const rawText = _parsedToText(parsed);
  return _buildResult(parsed, rawText, jobDescription);
}


// ── _buildResult ──────────────────────────────────────────────────────────────

function _buildResult(parsed, rawText, jobDescription) {
  const issues      = [];
  const suggestions = [];
  let   total       = 0;

  // ── 1. Contact info (10 pts) ───────────────────────────────────────────────
  let contactScore = 0;
  const contact    = parsed.contact || {};
  if (contact.email)    contactScore += 3;
  if (contact.phone)    contactScore += 2;
  if (contact.linkedin) contactScore += 2;
  if (contact.location) contactScore += 2;
  if (contact.github || contact.portfolio) contactScore += 1;

  if (!contact.email)    { issues.push("Missing email address.");    suggestions.push("Add your email to the contact section."); }
  if (!contact.phone)    { issues.push("Missing phone number.");     suggestions.push("Add a contact phone number."); }
  if (!contact.linkedin) suggestions.push("Add your LinkedIn profile URL.");

  total += contactScore;

  // ── 2. Summary / Objective (10 pts) ───────────────────────────────────────
  let summaryScore = 0;
  const summary    = (parsed.summary || "").trim();
  if (summary.length >  50) summaryScore  = 5;
  if (summary.length > 150) summaryScore  = 8;
  if (summary.length > 300) summaryScore  = 10;
  if (!summary)             { issues.push("No summary/objective found."); suggestions.push("Add a 2–4 sentence professional summary."); }

  total += summaryScore;

  // ── 3. Skills (25 pts) ────────────────────────────────────────────────────
  let skillScore  = 0;
  const allSkills = [
    ...(parsed.skills?.technical || []),
    ...(parsed.skills?.tools     || []),
    ...(parsed.skills?.soft      || []),
  ];
  const skillCount = allSkills.length;

  if (skillCount >= 3)  skillScore = 10;
  if (skillCount >= 8)  skillScore = 16;
  if (skillCount >= 15) skillScore = 20;
  if (skillCount >= 20) skillScore = 25;

  // Depth: bonus for high-weight skills
  const weighted     = extractSkillsWeighted(rawText);
  const highWeight   = weighted.filter((s) => s.weight >= 0.75).length;
  if (highWeight >= 3)  skillScore = Math.min(25, skillScore + 2);
  if (highWeight >= 6)  skillScore = Math.min(25, skillScore + 3);

  if (skillCount < 5)   { issues.push("Too few skills listed."); suggestions.push("List at least 8–10 technical skills."); }

  total += skillScore;

  // ── 4. Experience (25 pts) ────────────────────────────────────────────────
  let expScore  = 0;
  const expList = parsed.experience || [];

  if (expList.length >= 1) expScore = 10;
  if (expList.length >= 2) expScore = 16;
  if (expList.length >= 3) expScore = 20;

  // Bonus: entries with bullet points / descriptions
  const withBullets = expList.filter((e) =>
    (e.bullets || []).some((b) => b && b.trim().length > 10)
  ).length;
  if (withBullets >= 1) expScore = Math.min(25, expScore + 3);
  if (withBullets >= 2) expScore = Math.min(25, expScore + 2);

  if (!expList.length)  { issues.push("No work experience found."); suggestions.push("Add at least one work experience entry."); }

  total += expScore;

  // ── 5. Education (15 pts) ─────────────────────────────────────────────────
  let eduScore = 0;
  const eduList = parsed.education || [];

  if (eduList.length >= 1) eduScore = 8;
  if (eduList.length >= 2) eduScore = 12;

  // Bonus: has degree name
  const hasDegree = eduList.some((e) => (e.degree || "").length > 2);
  if (hasDegree) eduScore = Math.min(15, eduScore + 3);

  if (!eduList.length) { issues.push("No education entries found."); suggestions.push("Add your highest qualification."); }

  total += eduScore;

  // ── 6. Certifications (5 pts) ─────────────────────────────────────────────
  let certScore = 0;
  const certs   = parsed.certifications || [];
  if (certs.length >= 1) certScore = 3;
  if (certs.length >= 2) certScore = 5;
  if (!certs.length) suggestions.push("Add relevant certifications to stand out.");

  total += certScore;

  // ── 7. Projects (5 pts) ───────────────────────────────────────────────────
  let projectScore = 0;
  const projects   = parsed.projects || [];
  if (projects.length >= 1) projectScore = 3;
  if (projects.length >= 2) projectScore = 5;
  if (!projects.length) suggestions.push("Add 1–2 personal or academic projects.");

  total += projectScore;

  // ── 8. JD similarity (5 pts, only if JD provided) ─────────────────────────
  let jdScore = 0;
  if (jobDescription && jobDescription.trim().length > 50) {
    const jdSkills      = extractSkillsWeighted(jobDescription).map((s) => s.skill);
    const resumeSkills  = weighted.map((s) => s.skill);
    const intersection  = jdSkills.filter((s) => resumeSkills.includes(s));
    const ratio         = intersection.length / Math.max(jdSkills.length, 1);
    jdScore             = Math.min(5, Math.round(ratio * 5));
    if (jdScore < 3) suggestions.push("Tailor your resume to better match the job description keywords.");
  }

  total += jdScore;

  // ── Final score ───────────────────────────────────────────────────────────
  const score = Math.min(Math.round(total), 100);

  let grade, color;
  if      (score >= 80) { grade = "Excellent"; color = "#059669"; }
  else if (score >= 60) { grade = "Good";      color = "#0d9488"; }
  else if (score >= 40) { grade = "Fair";      color = "#d97706"; }
  else                  { grade = "Poor";      color = "#dc2626"; }

  const roles = extractRoles(rawText);

  return {
    score,
    grade,
    color,
    spacy_used:   false,   // kept for frontend compatibility
    parsed,
    detected_roles:   roles,
    weighted_skills:  weighted,
    breakdown: {
      contact:          { score: contactScore,  max: 10 },
      summary:          { score: summaryScore,  max: 10 },
      skills:           { score: skillScore,    max: 25 },
      experience:       { score: expScore,      max: 25 },
      education:        { score: eduScore,      max: 15 },
      certifications:   { score: certScore,     max:  5 },
      projects:         { score: projectScore,  max:  5 },
      jd_similarity:    { score: jdScore,       max:  5 },
    },
    issues,
    suggestions,
  };
}


// ── _parseResumeText ──────────────────────────────────────────────────────────

/**
 * Extract structured fields from raw resume text.
 * Returns the same shape as Python's analyse_resume_file "parsed" key.
 */
function _parseResumeText(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const contact = {
    name:      _extractName(lines),
    email:     (text.match(EMAIL_RE)    || [])[0] || "",
    phone:     (text.match(PHONE_RE)    || [])[1] || "",
    linkedin:  (text.match(LINKEDIN_RE) || [])[0] || "",
    github:    (text.match(GITHUB_RE)   || [])[0] || "",
    location:  _extractLocation(lines),
  };

  const summary        = _extractSection(text, SUMMARY_MARKERS);
  const experienceText = _extractSection(text, EXP_MARKERS);
  const educationText  = _extractSection(text, EDU_MARKERS);

  const weighted = extractSkillsWeighted(text);
  const skills = {
    technical: weighted.filter((s) => ["language","framework","ml","cloud"].includes(s.category)).map((s) => s.skill),
    tools:     weighted.filter((s) => ["tool","database","viz"].includes(s.category)).map((s) => s.skill),
    soft:      weighted.filter((s) => s.category === "soft").map((s) => s.skill),
  };

  const experience     = _parseExperience(experienceText);
  const education      = _parseEducation(educationText);
  const certifications = _extractCertifications(text);
  const projects       = _extractProjects(text);

  return { contact, summary, skills, experience, education, certifications, projects };
}


// ── Section extractors ────────────────────────────────────────────────────────

function _extractSection(text, markers) {
  const lower = text.toLowerCase();
  for (const marker of markers) {
    const idx = lower.indexOf(marker);
    if (idx === -1) continue;
    const start = idx;
    // End at the next section header (ALL CAPS line or next marker)
    const rest  = text.slice(start + marker.length);
    const end   = rest.search(/\n[A-Z][A-Z\s]{3,}[\n:]/);
    return end === -1 ? rest.slice(0, 1000).trim() : rest.slice(0, end).trim();
  }
  return "";
}

function _extractName(lines) {
  // First non-empty line that looks like a name (2-4 words, no digits, not a marker)
  const ALL_MARKERS = [...SUMMARY_MARKERS, ...EXP_MARKERS, ...EDU_MARKERS, ...SKILL_MARKERS];
  for (const line of lines.slice(0, 6)) {
    const words = line.split(/\s+/);
    if (words.length < 2 || words.length > 5) continue;
    if (/\d|@|\.com/.test(line)) continue;
    if (ALL_MARKERS.some((m) => line.toLowerCase().includes(m))) continue;
    return line;
  }
  return "";
}

function _extractLocation(lines) {
  for (const line of lines.slice(0, 10)) {
    if (/\b(bangalore|bengaluru|mumbai|delhi|hyderabad|pune|chennai|kolkata|india|new york|london|singapore)\b/i.test(line)) {
      return line.replace(EMAIL_RE, "").replace(PHONE_RE, "").trim();
    }
  }
  return "";
}

function _parseExperience(text) {
  if (!text) return [];
  const entries = [];
  // Split by date patterns that typically start a new role
  const chunks = text.split(/\n(?=.*\d{4})/);
  for (const chunk of chunks.slice(0, 6)) {
    const lines   = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    const title   = lines[0] || "";
    const company = lines[1] || "";
    const dateMatch = chunk.match(/(\w+\s*\d{4})\s*[-–to]+\s*(\w+\s*\d{4}|present|current)/i);
    entries.push({
      title,
      company,
      date_range: dateMatch ? `${dateMatch[1]} - ${dateMatch[2]}` : "",
      bullets:    lines.slice(2, 6).filter((l) => l.startsWith("-") || l.startsWith("•") || l.length > 20),
    });
  }
  return entries.filter((e) => e.title.length > 2);
}

function _parseEducation(text) {
  if (!text) return [];
  const entries  = [];
  const chunks   = text.split(/\n(?=[A-Z])/);
  for (const chunk of chunks.slice(0, 4)) {
    const lines  = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    const degree = lines.find((l) => DEGREE_RE.test(l)) || lines[0] || "";
    const year   = (chunk.match(/\b\d{4}\b/) || [])[0] || "";
    const school = lines.find((l) => /university|college|institute|school/i.test(l)) || lines[1] || "";
    if (degree) entries.push({ degree, field: "", school, year, gpa: "" });
  }
  return entries;
}

function _extractCertifications(text) {
  const certs = [];
  const lower = text.toLowerCase();
  for (const marker of CERT_MARKERS) {
    const idx = lower.indexOf(marker);
    if (idx === -1) continue;
    const section = text.slice(idx, idx + 500);
    const lines   = section.split("\n").slice(1, 6).map((l) => l.trim()).filter((l) => l.length > 5);
    certs.push(...lines);
    break;
  }
  return [...new Set(certs)].slice(0, 8);
}

function _extractProjects(text) {
  const projects = [];
  const lower    = text.toLowerCase();
  for (const marker of PROJECT_MARKERS) {
    const idx = lower.indexOf(marker);
    if (idx === -1) continue;
    const section = text.slice(idx, idx + 600);
    const lines   = section.split("\n").slice(1, 6).map((l) => l.trim()).filter((l) => l.length > 10);
    projects.push(...lines.map((l) => ({ name: l, description: "" })));
    break;
  }
  return projects.slice(0, 5);
}


// ── Dict → parsed (for analyseResumeDict) ────────────────────────────────────

function _dictToParsed(d) {
  const personal = d.personal || {};
  return {
    contact: {
      name:     personal.name     || "",
      email:    personal.email    || "",
      phone:    personal.phone    || "",
      linkedin: personal.linkedin || "",
      github:   personal.portfolio || "",
      location: personal.location || "",
    },
    summary:        d.summary || "",
    skills:         d.skills  || { technical: [], tools: [], soft: [] },
    experience:     (d.experience || []).map((e) => ({
      title:      e.title   || "",
      company:    e.company || "",
      date_range: `${e.start || ""} - ${e.end || ""}`,
      bullets:    e.bullets || [],
    })),
    education:      d.education      || [],
    certifications: d.certifications || [],
    projects:       (d.projects || []).map((p) =>
      typeof p === "string" ? { name: p, description: "" } : p
    ),
  };
}

function _parsedToText(parsed) {
  const parts = [
    parsed.contact?.name    || "",
    parsed.contact?.email   || "",
    parsed.summary          || "",
    ...(parsed.skills?.technical || []),
    ...(parsed.skills?.tools     || []),
    ...(parsed.experience || []).map((e) => `${e.title} ${e.company} ${(e.bullets || []).join(" ")}`),
    ...(parsed.education  || []).map((e) => `${e.degree} ${e.school}`),
    ...(parsed.certifications || []),
    ...(parsed.projects || []).map((p) => p.name || ""),
  ];
  return parts.join("\n");
}


module.exports = { analyseResumeFile, analyseResumeDict };
