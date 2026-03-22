/**
 * utils/expParser.js
 * ──────────────────────────────────────────────────────────────────────────
 * Shared experience-year extraction utilities used by ALL 6 scrapers.
 * Replaces the duplicated _extract_years_from_text / _format_exp_required
 * functions that existed in every Python scraper file.
 *
 * Exports:
 *   extractYearsFromText(text)  → { min, max } | null
 *   formatExpRequired(range)    → "Fresher" | "2-5 yrs" | "5+ yrs" | ""
 *   checkExpMismatch(range, userMin, userMax, buffer)
 *     → { mismatch, hardMismatch, hardDrop }
 *
 * EXP_RANGES  — canonical map of experience_level string → { min, max }
 * ──────────────────────────────────────────────────────────────────────────
 */

"use strict";

// ── Canonical experience level map ───────────────────────────────────────────
const EXP_RANGES = {
  "0-1":  { min: 0,  max: 1  },
  "1-3":  { min: 1,  max: 3  },
  "3-5":  { min: 3,  max: 5  },
  "5-10": { min: 5,  max: 10 },
  "10+":  { min: 10, max: 99 },
};

const EXP_BUFFER = 1;   // years of tolerance on each side (same as Python)


// ── extractYearsFromText ──────────────────────────────────────────────────────

/**
 * Extract a (min, max) experience range from raw text.
 * Handles all patterns seen across Indian + global job boards:
 *   "Fresher / No experience"  → { min: 0, max: 0 }
 *   "5+ years"                 → { min: 5, max: 99 }
 *   "3-5 years"                → { min: 3, max: 5  }
 *   "minimum 2 years"          → { min: 2, max: 99 }
 *   "3 years of experience"    → { min: 3, max: 3  }
 *   "exp: 2-4"  / "exp: 3+"   → range / open-ended
 *
 * @param {string} text  Raw card or page text (case-insensitive)
 * @returns {{ min: number, max: number } | null}
 */
function extractYearsFromText(text) {
  if (!text || typeof text !== "string") return null;

  const t = text.toLowerCase();

  // ── Fresher / no experience ───────────────────────────────────────────────
  if (/\b(fresher|freshers|no experience|0 years?)\b/.test(t)) {
    return { min: 0, max: 0 };
  }

  // ── "5+ years" ────────────────────────────────────────────────────────────
  let m = t.match(/(\d+)\s*\+\s*(?:years?|yrs?)/);
  if (m) return { min: +m[1], max: 99 };

  // ── "2-5 years" or "2 to 5 years" ────────────────────────────────────────
  m = t.match(/(\d+)\s*(?:-|to)\s*(\d+)\s*(?:years?|yrs?)/);
  if (m) return { min: +m[1], max: +m[2] };

  // ── "minimum / at least / over / more than X years" ───────────────────────
  m = t.match(/(?:minimum|at\s+least|over|more\s+than)\s+(\d+)\s*(?:years?|yrs?)/);
  if (m) return { min: +m[1], max: 99 };

  // ── "3 years of experience" / "3 years exp" ──────────────────────────────
  m = t.match(/(\d+)\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp\b)/);
  if (m) return { min: +m[1], max: +m[1] };

  // ── "exp: 2-4" / "experience: 2-4" ───────────────────────────────────────
  m = t.match(/exp(?:erience)?\s*[:\-]\s*(\d+)\s*(?:-|to)\s*(\d+)/);
  if (m) return { min: +m[1], max: +m[2] };

  // ── "exp: 3+" / "experience: 3+" ─────────────────────────────────────────
  m = t.match(/exp(?:erience)?\s*[:\-]\s*(\d+)\s*\+/);
  if (m) return { min: +m[1], max: 99 };

  return null;
}


// ── formatExpRequired ─────────────────────────────────────────────────────────

/**
 * Convert a { min, max } range to a human-readable string.
 *
 * @param {{ min: number, max: number } | null} range
 * @returns {string}  e.g. "Fresher", "2-5 yrs", "5+ yrs", "3 yrs", ""
 */
function formatExpRequired(range) {
  if (!range) return "";
  const { min, max } = range;
  if (min === 0 && max === 0) return "Fresher";
  if (max === 99)             return `${min}+ yrs`;
  if (min === max)            return `${min} yrs`;
  return `${min}-${max} yrs`;
}


// ── checkExpMismatch ──────────────────────────────────────────────────────────

/**
 * Decide whether a job's experience requirement conflicts with the user's level.
 *
 * @param {{ min: number, max: number } | null} jobRange   from extractYearsFromText
 * @param {number} userMin   from EXP_RANGES[experience_level].min
 * @param {number} userMax   from EXP_RANGES[experience_level].max
 * @param {number} [buffer]  tolerance in years (default EXP_BUFFER = 1)
 *
 * @returns {{
 *   hardDrop:      boolean,   // caller should skip this job entirely
 *   mismatch:      boolean,   // show warning but keep job
 *   hardMismatch:  boolean,   // confirmed bad match (set after P2 verify)
 * }}
 */
function checkExpMismatch(jobRange, userMin, userMax, buffer = EXP_BUFFER) {
  if (!jobRange) {
    return { hardDrop: false, mismatch: false, hardMismatch: false };
  }

  const { min: jobMin, max: jobMax } = jobRange;

  // Hard drop — clearly out of range even with buffer
  if (jobMin > userMax + buffer) {
    return { hardDrop: true, mismatch: true, hardMismatch: true };
  }
  if (jobMax !== 99 && jobMax < Math.max(0, userMin - buffer)) {
    return { hardDrop: true, mismatch: true, hardMismatch: true };
  }

  // Soft mismatch — slightly outside but worth showing
  const softMismatch = jobMin > userMax || (jobMax !== 99 && jobMax < userMin);
  return {
    hardDrop:     false,
    mismatch:     softMismatch,
    hardMismatch: false,
  };
}


// ── getUserExpRange ───────────────────────────────────────────────────────────

/**
 * Convenience: get { min, max } for a user's chosen experience_level string.
 * Falls back to { min: 0, max: 99 } if the level is unrecognised.
 *
 * @param {string} experienceLevel  e.g. "0-1", "3-5"
 * @returns {{ min: number, max: number }}
 */
function getUserExpRange(experienceLevel) {
  return EXP_RANGES[experienceLevel] || { min: 0, max: 99 };
}


module.exports = {
  EXP_RANGES,
  EXP_BUFFER,
  extractYearsFromText,
  formatExpRequired,
  checkExpMismatch,
  getUserExpRange,
};
