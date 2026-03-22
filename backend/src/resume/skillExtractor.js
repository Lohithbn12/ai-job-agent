/**
 * resume/skillExtractor.js
 * ──────────────────────────────────────────────────────────────────────────
 * Extracts weighted skills from resume text using a curated skill bank
 * plus compromise.js for basic NLP noun-phrase detection.
 * Replaces Python's skill_extractor.py (spaCy-based).
 *
 * Exports:
 *   extractSkillsWeighted(text)            → WeightedSkill[]
 *   getSearchKeywords(text, topN, minWeight) → string[]
 *
 * WeightedSkill: { skill, weight, category }
 * ──────────────────────────────────────────────────────────────────────────
 */

"use strict";

const nlp = require("compromise");

// ── Skill bank (mirrors Python SKILL_WEIGHTS + categories) ───────────────────

const SKILL_BANK = {
  // ── Languages ──────────────────────────────────────────────────────────────
  language: {
    python: 0.95, sql: 0.90, javascript: 0.85, typescript: 0.82,
    java: 0.80, "c++": 0.78, "c#": 0.75, r: 0.72, go: 0.70,
    scala: 0.68, kotlin: 0.65, swift: 0.62, ruby: 0.60, php: 0.58,
    bash: 0.55, matlab: 0.52, rust: 0.50,
  },

  // ── Frameworks & libraries ─────────────────────────────────────────────────
  framework: {
    react: 0.88, "node.js": 0.85, angular: 0.80, vue: 0.78,
    django: 0.82, flask: 0.80, fastapi: 0.78, spring: 0.75,
    express: 0.72, "next.js": 0.70, tensorflow: 0.88, pytorch: 0.88,
    keras: 0.82, "scikit-learn": 0.85, pandas: 0.80, numpy: 0.75,
    "hugging face": 0.85, langchain: 0.82, "xgboost": 0.80,
    "lightgbm": 0.78, opencv: 0.72,
  },

  // ── Tools & platforms ──────────────────────────────────────────────────────
  tool: {
    git: 0.75, docker: 0.85, kubernetes: 0.88, jenkins: 0.72,
    jira: 0.65, figma: 0.70, postman: 0.65, linux: 0.70,
    tableau: 0.85, "power bi": 0.85, looker: 0.78, excel: 0.72,
    airflow: 0.82, dbt: 0.80, spark: 0.88, kafka: 0.82,
    hadoop: 0.75, terraform: 0.82, ansible: 0.75, grafana: 0.70,
  },

  // ── Cloud ──────────────────────────────────────────────────────────────────
  cloud: {
    aws: 0.92, gcp: 0.88, azure: 0.88, "google cloud": 0.85,
    "aws lambda": 0.82, "aws s3": 0.78, ec2: 0.75,
    "azure devops": 0.80, "google bigquery": 0.82,
  },

  // ── Databases ─────────────────────────────────────────────────────────────
  database: {
    postgresql: 0.82, mysql: 0.78, mongodb: 0.80, redis: 0.75,
    elasticsearch: 0.78, snowflake: 0.85, databricks: 0.85,
    oracle: 0.70, sqlite: 0.60, cassandra: 0.72, dynamodb: 0.75,
  },

  // ── ML / AI domains ────────────────────────────────────────────────────────
  ml: {
    "machine learning": 0.92, "deep learning": 0.90, nlp: 0.88,
    "computer vision": 0.88, "data science": 0.90,
    "data engineering": 0.88, "feature engineering": 0.82,
    mlops: 0.85, llm: 0.88, transformers: 0.85,
    "reinforcement learning": 0.80, "time series": 0.78,
    "natural language processing": 0.88,
  },

  // ── Visualisation ─────────────────────────────────────────────────────────
  viz: {
    tableau: 0.85, "power bi": 0.85, looker: 0.78, matplotlib: 0.70,
    seaborn: 0.68, plotly: 0.70, "d3.js": 0.72,
  },

  // ── Methodologies ─────────────────────────────────────────────────────────
  methodology: {
    agile: 0.65, scrum: 0.62, "ci/cd": 0.75, devops: 0.80,
    "rest api": 0.72, graphql: 0.70, microservices: 0.75,
    "test driven development": 0.65, tdd: 0.62,
  },

  // ── Soft skills (lower weights) ────────────────────────────────────────────
  soft: {
    "problem solving": 0.40, communication: 0.38, leadership: 0.42,
    teamwork: 0.35, "project management": 0.55, "time management": 0.35,
    "critical thinking": 0.40, collaboration: 0.38,
  },
};

// Flat map: skill → { weight, category }
const SKILL_MAP = new Map();
for (const [category, skills] of Object.entries(SKILL_BANK)) {
  for (const [skill, weight] of Object.entries(skills)) {
    // Keep highest weight if duplicated across categories
    if (!SKILL_MAP.has(skill) || SKILL_MAP.get(skill).weight < weight) {
      SKILL_MAP.set(skill, { weight, category });
    }
  }
}

// Sort by length descending so multi-word skills match before sub-words
const SORTED_SKILLS = [...SKILL_MAP.keys()].sort((a, b) => b.length - a.length);


// ── extractSkillsWeighted ─────────────────────────────────────────────────────

/**
 * Extract skills from resume text with weights and categories.
 *
 * Strategy:
 *  1. Exact / phrase match against SKILL_BANK (primary, most reliable)
 *  2. compromise.js noun-phrase extraction for skills not in the bank
 *     (catches newer tools/frameworks not yet in our list)
 *
 * @param {string} text  Raw resume text
 * @returns {Array<{ skill: string, weight: number, category: string }>}
 *          Sorted by weight descending
 */
function extractSkillsWeighted(text) {
  if (!text) return [];

  const lower   = text.toLowerCase();
  const found   = new Map();   // skill → { weight, category }

  // ── Step 1: Bank match ────────────────────────────────────────────────────
  for (const skill of SORTED_SKILLS) {
    // Use word-boundary-aware regex for short skills, simple includes for long
    const pattern = skill.length <= 4
      ? new RegExp(`\\b${escapeRegex(skill)}\\b`, "i")
      : new RegExp(escapeRegex(skill), "i");

    if (pattern.test(lower)) {
      found.set(skill, SKILL_MAP.get(skill));
    }
  }

  // ── Step 2: NLP noun-phrase extraction ───────────────────────────────────
  // Pick up any tech noun phrases that aren't in our bank
  try {
    const doc       = nlp(text);
    const phrases   = doc.nouns().out("array");
    const techTerms = phrases
      .map((p) => p.toLowerCase().trim())
      .filter((p) => p.length > 2 && p.length < 40 && !found.has(p))
      .filter((p) => _looksLikeTech(p));

    for (const term of techTerms) {
      found.set(term, { weight: 0.30, category: "other" });
    }
  } catch {
    // compromise is optional enrichment — never block on it
  }

  // ── Sort by weight descending ─────────────────────────────────────────────
  return [...found.entries()]
    .map(([skill, { weight, category }]) => ({ skill, weight, category }))
    .sort((a, b) => b.weight - a.weight);
}


// ── getSearchKeywords ─────────────────────────────────────────────────────────

/**
 * Get the top N skills suitable for job search queries.
 * Filters to actionable skill categories only (not soft skills).
 *
 * @param {string} text       Resume text
 * @param {number} topN       Max skills to return (default 8)
 * @param {number} minWeight  Minimum weight threshold (default 0.20)
 * @returns {string[]}
 */
function getSearchKeywords(text, topN = 8, minWeight = 0.20) {
  const SEARCH_CATEGORIES = new Set([
    "language", "framework", "tool", "cloud", "database", "ml", "viz",
  ]);

  return extractSkillsWeighted(text)
    .filter((s) => s.weight >= minWeight && SEARCH_CATEGORIES.has(s.category))
    .slice(0, topN)
    .map((s) => s.skill);
}


// ── Helpers ───────────────────────────────────────────────────────────────────

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Very lightweight heuristic: does a noun phrase look like a tech term? */
function _looksLikeTech(phrase) {
  const TECH_SIGNALS = [
    /\bapi\b/, /\bsdk\b/, /\borm\b/, /\bcli\b/, /\bui\b/, /\bci\b/,
    /\.js$/, /\.py$/, /\bjs\b/, /\bts\b/,
    /database/, /framework/, /library/, /platform/, /service/,
  ];
  return TECH_SIGNALS.some((re) => re.test(phrase));
}


module.exports = { extractSkillsWeighted, getSearchKeywords };
