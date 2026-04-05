/**
 * routes/jobs.routes.js
 * ──────────────────────────────────────────────────────────────────────────
 * POST /search-jobs/
 * Runs scrapers in parallel, deduplicates, scores against resume.
 * Updated for Render/cloud server compatibility.
 * ──────────────────────────────────────────────────────────────────────────
 */

"use strict";

const express = require("express");

const { collectNaukriJobs }      = require("../scrapers/naukri.scraper");
const { collectIndeedJobs }      = require("../scrapers/indeed.scraper");
const { collectLinkedinJobs }    = require("../scrapers/linkedin.scraper");
const { collectInternshalaJobs } = require("../scrapers/internshala.scraper");
const { collectFounditJobs }     = require("../scrapers/foundit.scraper");
const { collectApnaJobs }        = require("../scrapers/apna.scraper");
const { scoreJobsAgainstResume } = require("../services/predictor.service");

const router = express.Router();

// Longer timeout on production (Render is slower than localhost)
const IS_PRODUCTION = process.env.NODE_ENV === "production" ||
                      !!process.env.RENDER ||
                      !!process.env.RAILWAY_ENVIRONMENT;

const SCRAPER_TIMEOUT_MS = IS_PRODUCTION ? 150_000 : 90_000;

// ── Scraper registry ──────────────────────────────────────────────────────────
const SCRAPER_REGISTRY = {
  naukri:      collectNaukriJobs,
  indeed:      collectIndeedJobs,
  linkedin:    collectLinkedinJobs,
  internshala: collectInternshalaJobs,
  foundit:     collectFounditJobs,
  apna:        collectApnaJobs,
};

const ROLE_INDICATORS = new Set([
  "analyst","engineer","developer","scientist","manager","designer",
  "architect","consultant","specialist","administrator","director","lead",
  "intern","associate","coordinator","programmer","devops","fullstack",
  "frontend","backend","researcher","executive","officer","trainee",
]);


// ── POST /search-jobs/ ────────────────────────────────────────────────────────

router.post("/search-jobs/", async (req, res) => {
  const {
    roles            = [],
    keywords         = [],
    experience_level = "0-1",
    location         = "",
    sources          = ["indeed", "naukri"],
    weighted_skills  = [],
    top_skills       = [],
  } = req.body || {};

  console.log(`[Jobs] Request — sources: ${sources} | exp: ${experience_level} | location: ${location}`);

  // ── Build search queries ───────────────────────────────────────────────────
  const roleKeywords = roles.length
    ? [...roles]
    : keywords.filter((k) => [...ROLE_INDICATORS].some((r) => k.toLowerCase().includes(r)));

  let finalQueries = roleKeywords.length
    ? roleKeywords.slice(0, 3)
    : ["data analyst"];

  finalQueries = [...new Map(finalQueries.map((q) => [q.toLowerCase(), q])).values()].slice(0, 3);

  console.log(`[Jobs] Queries: ${finalQueries} | timeout: ${SCRAPER_TIMEOUT_MS}ms`);

  // ── Run scrapers in parallel ───────────────────────────────────────────────
  const validSources = sources.filter((s) => SCRAPER_REGISTRY[s]);

  if (!validSources.length) {
    return res.status(400).json({ detail: "No valid sources provided." });
  }

  const results = await Promise.allSettled(
    validSources.map((src) =>
      Promise.race([
        SCRAPER_REGISTRY[src](finalQueries, experience_level, location),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(`Scraper timeout after ${SCRAPER_TIMEOUT_MS / 1000}s`)),
            SCRAPER_TIMEOUT_MS
          )
        ),
      ])
    )
  );

  const allJobs = [];
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      console.log(`[${validSources[i]}] ✓ ${result.value.length} jobs`);
      allJobs.push(...result.value);
    } else {
      console.error(`[${validSources[i]}] ✗ Error: ${result.reason?.message}`);
    }
  });

  // ── Deduplicate by apply_link ──────────────────────────────────────────────
  const seenLinks = new Set();
  const deduped   = [];
  for (const job of allJobs) {
    const link = job.apply_link || "";
    if (!link || !seenLinks.has(link)) {
      seenLinks.add(link);
      deduped.push(job);
    }
  }

  // ── Count by source ───────────────────────────────────────────────────────
  const bySource = {};
  for (const job of deduped) {
    const k = (job.source || "").toLowerCase().trim();
    bySource[k] = (bySource[k] || 0) + 1;
  }

  // ── Score against resume ───────────────────────────────────────────────────
  const resumeSkills = weighted_skills.map((s) => s.skill);
  if (resumeSkills.length || roles.length) {
    scoreJobsAgainstResume(deduped, resumeSkills, roles, experience_level, weighted_skills);
    console.log(`[Predictor] Scored ${deduped.length} jobs`);
  }

  console.log(`[Jobs] Returning ${deduped.length} jobs | by_source: ${JSON.stringify(bySource)}`);

  return res.json({
    jobs:          deduped,
    total:         deduped.length,
    keywords_used: finalQueries,
    by_source:     bySource,
  });
});


module.exports = router;
