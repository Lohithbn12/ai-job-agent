/**
 * routes/jobs.routes.js
 * ──────────────────────────────────────────────────────────────────────────
 * POST /search-jobs/
 * On production (Render): runs scrapers SEQUENTIALLY to avoid spawn ETXTBSY
 * On local dev: runs scrapers in parallel (faster)
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

const IS_PRODUCTION = process.env.NODE_ENV === "production" ||
                      !!process.env.RENDER ||
                      !!process.env.RAILWAY_ENVIRONMENT;

// Per-scraper timeout
const SCRAPER_TIMEOUT_MS = IS_PRODUCTION ? 120_000 : 90_000;

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


// ── Helper: run one scraper with timeout ──────────────────────────────────────
async function runScraper(src, queries, experience_level, location) {
  const fn = SCRAPER_REGISTRY[src];
  try {
    const result = await Promise.race([
      fn(queries, experience_level, location),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Timeout after ${SCRAPER_TIMEOUT_MS / 1000}s`)),
          SCRAPER_TIMEOUT_MS
        )
      ),
    ]);
    console.log(`[${src}] ✓ ${result.length} jobs`);
    return result;
  } catch (err) {
    console.error(`[${src}] ✗ Error: ${err.message}`);
    return [];
  }
}


// ── POST /search-jobs/ ────────────────────────────────────────────────────────

router.post("/search-jobs/", async (req, res) => {
  const {
    roles            = [],
    keywords         = [],
    experience_level = "0-1",
    location         = "",
    sources          = ["indeed", "naukri"],
    weighted_skills  = [],
  } = req.body || {};

  console.log(`[Jobs] sources: ${sources} | exp: ${experience_level} | location: ${location} | mode: ${IS_PRODUCTION ? "sequential" : "parallel"}`);

  // ── Build search queries ───────────────────────────────────────────────────
  const roleKeywords = roles.length
    ? [...roles]
    : keywords.filter((k) => [...ROLE_INDICATORS].some((r) => k.toLowerCase().includes(r)));

  let finalQueries = roleKeywords.length
    ? roleKeywords.slice(0, 3)
    : ["data analyst"];

  finalQueries = [...new Map(finalQueries.map((q) => [q.toLowerCase(), q])).values()].slice(0, 3);

  console.log(`[Jobs] Queries: ${finalQueries}`);

  const validSources = sources.filter((s) => SCRAPER_REGISTRY[s]);
  if (!validSources.length) {
    return res.status(400).json({ detail: "No valid sources provided." });
  }

  // ── Run scrapers ───────────────────────────────────────────────────────────
  const allJobs = [];

  if (IS_PRODUCTION) {
    // SEQUENTIAL — one Chrome process at a time (avoids spawn ETXTBSY on Render)
    console.log(`[Jobs] Running ${validSources.length} scrapers sequentially...`);
    for (const src of validSources) {
      console.log(`[Jobs] → Starting: ${src}`);
      const jobs = await runScraper(src, finalQueries, experience_level, location);
      allJobs.push(...jobs);
      // Give OS 2s to fully release Chrome resources before next launch
      await new Promise((r) => setTimeout(r, 2000));
    }
  } else {
    // PARALLEL — fast for local development
    console.log(`[Jobs] Running ${validSources.length} scrapers in parallel...`);
    const results = await Promise.allSettled(
      validSources.map((src) => runScraper(src, finalQueries, experience_level, location))
    );
    results.forEach((r) => {
      if (r.status === "fulfilled") allJobs.push(...r.value);
    });
  }

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

  // ── Count by source ────────────────────────────────────────────────────────
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
