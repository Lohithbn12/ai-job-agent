/**
 * services/predictor.service.js
 * ──────────────────────────────────────────────────────────────────────────
 * Application Success Predictor.
 * Scores how well a parsed resume matches a job posting.
 * Replaces Python's predictor.py — identical algorithm, identical output shape.
 *
 * Algorithm (100 pts total):
 * ┌──────────────────────┬─────┬─────────────────────────────┐
 * │ Dimension            │ Max │ Method                      │
 * ├──────────────────────┼─────┼─────────────────────────────┤
 * │ Title / Role match   │  25 │ Fuzzy title overlap         │
 * │ Skills match         │  35 │ Keyword intersection        │
 * │ Experience match     │  20 │ Years range compatibility   │
 * │ Location match       │  10 │ City/country string match   │
 * │ Seniority signal     │  10 │ Level keyword match         │
 * └──────────────────────┴─────┴─────────────────────────────┘
 *
 * Returns:
 *   score          number   0–100
 *   grade          string   "Excellent" | "Good" | "Fair" | "Low"
 *   bar_color      string   hex colour
 *   breakdown      object   per-dimension scores
 *   matched_skills string[] skills in both resume and job
 *   missing_skills string[] job skills not in resume
 *   tip            string   one-line actionable advice
 * ──────────────────────────────────────────────────────────────────────────
 */

"use strict";

const { extractYearsFromText, getUserExpRange } = require("../utils/expParser");

// ── Tech skill bank (same as predictor.py TECH_SKILLS) ───────────────────────
const TECH_SKILLS = new Set([
  "python","sql","java","javascript","typescript","r","c++","c#","go","scala",
  "bash","html","css","react","angular","vue","node.js","django","flask","fastapi",
  "spring","express","tensorflow","pytorch","keras","scikit-learn","pandas","numpy",
  "spark","hadoop","kafka","airflow","dbt","tableau","power bi","looker","excel",
  "aws","gcp","azure","docker","kubernetes","terraform","ansible","git","jenkins",
  "postgresql","mysql","mongodb","redis","elasticsearch","snowflake","databricks",
  "machine learning","deep learning","nlp","computer vision","data science",
  "data engineering","etl","data pipeline","data warehouse","business intelligence",
  "rest api","graphql","microservices","ci/cd","agile","scrum","jira","figma",
  "xgboost","lightgbm","mlops","llm","transformers","feature engineering",
]);

// ── Seniority keyword → expected years range ──────────────────────────────────
const SENIORITY_WORDS = {
  junior:    [0, 2],
  entry:     [0, 2],
  fresher:   [0, 1],
  mid:       [2, 5],
  senior:    [4, 15],
  lead:      [5, 20],
  principal: [7, 20],
  staff:     [5, 20],
  manager:   [3, 20],
  director:  [8, 20],
  head:      [6, 20],
  vp:        [10, 30],
};


// ── Helpers ───────────────────────────────────────────────────────────────────

/** Word tokens from text */
function _tokens(text) {
  return new Set((text.toLowerCase().match(/[a-z][a-z0-9+#.]*/g) || []));
}

/** Extract skill phrases that appear in TECH_SKILLS */
function _skillTokens(text) {
  const lower = text.toLowerCase();
  const found = new Set();
  for (const skill of TECH_SKILLS) {
    const re = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
    if (re.test(lower)) found.add(skill);
  }
  return found;
}


// ── Core scorer ───────────────────────────────────────────────────────────────

/**
 * Predict match between one job and the candidate's resume.
 *
 * @param {object}   job               Job dict from any scraper
 * @param {string[]} resumeSkills      Flat skill list from /upload-resume/
 * @param {string[]} resumeRoles       Roles from /upload-resume/
 * @param {string}   experienceLevel   User's selected level e.g. "0-1"
 * @param {object[]} [weightedSkills]  Optional weighted skills list
 * @returns {object}  { score, grade, bar_color, breakdown, matched_skills, missing_skills, tip }
 */
function predictMatch(job, resumeSkills, resumeRoles, experienceLevel = "0-1", weightedSkills = []) {
  const breakdown = {};

  const jobText = [
    job.title        || "",
    job.company      || "",
    job.location     || "",
    job.exp_required || "",
    job.description  || "",
  ].join(" ");

  // ── 1. Title / Role match (25 pts) ────────────────────────────────────────
  let titleScore       = 0;
  const jobTitleTokens = _tokens(job.title || "");
  const resumeRoleTokens = new Set();
  for (const role of (resumeRoles || [])) {
    for (const t of _tokens(role)) resumeRoleTokens.add(t);
  }

  if (resumeRoleTokens.size && jobTitleTokens.size) {
    const overlap = [...resumeRoleTokens].filter((t) => jobTitleTokens.has(t)).length;
    titleScore = Math.min(Math.floor((overlap / Math.max(jobTitleTokens.size, 1)) * 35), 25);
  } else if (resumeRoleTokens.size) {
    for (const word of resumeRoleTokens) {
      if (word.length > 3 && (job.title || "").toLowerCase().includes(word)) {
        titleScore = Math.max(titleScore, 15);
      }
    }
  }

  breakdown.title_match = { score: titleScore, max: 25, label: "Role Match" };

  // ── 2. Skills match (35 pts) ──────────────────────────────────────────────
  let skillsScore      = 0;
  const resumeSkillSet = _skillTokens((resumeSkills || []).join(" "));
  const jobSkillSet    = _skillTokens(jobText);

  let matchedSkills = [];
  let missingSkills = [];

  if (jobSkillSet.size) {
    matchedSkills = [...resumeSkillSet].filter((s) => jobSkillSet.has(s)).sort();
    missingSkills = [...jobSkillSet].filter((s) => !resumeSkillSet.has(s)).sort();
    const ratio   = matchedSkills.length / Math.max(jobSkillSet.size, 1);
    skillsScore   = Math.min(Math.floor(ratio * 45), 35);
  } else if (resumeSkillSet.size) {
    skillsScore = 18;   // no skills extractable from job → partial credit
  }

  breakdown.skills_match = { score: skillsScore, max: 35, label: "Skills Match" };

  // ── 3. Experience match (20 pts) ──────────────────────────────────────────
  let expScore = 0;
  const { min: candidateMin, max: candidateMax } = getUserExpRange(experienceLevel);

  const jobExpRange = extractYearsFromText(
    (job.exp_required || "") + " " + jobText
  );

  if (!jobExpRange) {
    expScore = 10;   // no exp info → neutral
  } else {
    let { min: jobMin, max: jobMax } = jobExpRange;
    if (jobMax === 99) jobMax = jobMin + 8;   // normalise "5+ yrs" → "5-13 yrs"

    const overlapMin = Math.max(candidateMin, jobMin);
    const overlapMax = Math.min(candidateMax, jobMax);

    if (overlapMin <= overlapMax) {
      const overlapSize = overlapMax - overlapMin;
      const jobRange    = Math.max(jobMax - jobMin, 1);
      expScore = Math.min(20, 10 + Math.floor((overlapSize / jobRange) * 10));
    } else {
      const gap = overlapMin - overlapMax;
      expScore = gap <= 1 ? 8 : gap <= 2 ? 4 : 0;
    }
  }

  breakdown.experience_match = { score: expScore, max: 20, label: "Experience Match" };

  // ── 4. Location match (10 pts) ────────────────────────────────────────────
  let locScore  = 5;
  const jobLoc  = (job.location || "").toLowerCase();
  if (jobLoc) {
    if (/remote|anywhere|work from home|wfh/.test(jobLoc)) locScore = 10;
    else if (!experienceLevel) locScore = 7;
  }

  breakdown.location_match = { score: locScore, max: 10, label: "Location" };

  // ── 5. Seniority signal (10 pts) ──────────────────────────────────────────
  let seniorityScore   = 5;
  const jobTitleLower  = (job.title || "").toLowerCase();

  for (const [word, [reqMin, reqMax]] of Object.entries(SENIORITY_WORDS)) {
    if (jobTitleLower.includes(word)) {
      if (reqMin <= candidateMax && candidateMin <= reqMax)      seniorityScore = 10;
      else if (Math.abs(candidateMin - reqMin) <= 2)             seniorityScore = 6;
      else                                                        seniorityScore = 2;
      break;
    }
  }

  breakdown.seniority = { score: seniorityScore, max: 10, label: "Seniority" };

  // ── Total ─────────────────────────────────────────────────────────────────
  const score = Math.min(
    Math.round(titleScore + skillsScore + expScore + locScore + seniorityScore),
    100
  );

  let grade, barColor;
  if      (score >= 75) { grade = "Excellent"; barColor = "#059669"; }
  else if (score >= 55) { grade = "Good";      barColor = "#0d9488"; }
  else if (score >= 35) { grade = "Fair";      barColor = "#d97706"; }
  else                  { grade = "Low";       barColor = "#dc2626"; }

  // ── Tip ───────────────────────────────────────────────────────────────────
  let tip = "";
  if (missingSkills.length) {
    tip = `Add ${missingSkills.slice(0, 3).join(", ")} to your resume to improve match.`;
  } else if (titleScore < 10) {
    tip = "Your current role titles don't closely match this job title.";
  } else if (expScore < 8) {
    tip = "Your experience level may not meet this job's requirements.";
  } else {
    tip = "Strong match — tailor your summary to mention this exact role.";
  }

  return {
    score,
    grade,
    bar_color:      barColor,
    breakdown,
    matched_skills: matchedSkills.slice(0, 8),
    missing_skills: missingSkills.slice(0, 6),
    tip,
  };
}


// ── Batch scorer ──────────────────────────────────────────────────────────────

/**
 * Add a `match` field to every job in the list.
 * Safe to call with empty skills — returns neutral scores.
 *
 * @param {object[]} jobs
 * @param {string[]} resumeSkills
 * @param {string[]} resumeRoles
 * @param {string}   experienceLevel
 * @param {object[]} weightedSkills
 * @returns {object[]}  Same array with `match` added to each job
 */
function scoreJobsAgainstResume(jobs, resumeSkills, resumeRoles, experienceLevel = "0-1", weightedSkills = []) {
  for (const job of jobs) {
    try {
      job.match = predictMatch(job, resumeSkills, resumeRoles, experienceLevel, weightedSkills);
    } catch {
      job.match = {
        score: 0, grade: "N/A", bar_color: "#94a3b8",
        breakdown: {}, matched_skills: [], missing_skills: [], tip: "",
      };
    }
  }
  return jobs;
}


module.exports = { predictMatch, scoreJobsAgainstResume };
