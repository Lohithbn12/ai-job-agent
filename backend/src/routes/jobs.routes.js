/**
 * routes/jobs.routes.js
 * ──────────────────────────────────────────────────────────────────────────
 * POST /search-jobs/
 * Runs scrapers in parallel, deduplicates, scores against resume.
 * Replaces Python's /search-jobs/ endpoint in main.py.
 *
 * Mounted in server.js as:
 *   app.use('/', require('./routes/jobs.routes'));
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

// ── Scraper registry (mirrors Python SCRAPER_REGISTRY) ───────────────────────
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

  // ── Build search queries — role names only, no skill enrichment ─────────────
  const roleKeywords = roles.length
    ? [...roles]
    : keywords.filter((k) => [...ROLE_INDICATORS].some((r) => k.toLowerCase().includes(r)));

  // Use role names directly as queries — no skill appending
  let finalQueries = roleKeywords.length
    ? roleKeywords.slice(0, 3)
    : ["data analyst"];

  // Deduplicate + hard cap at 3
  finalQueries = [...new Map(finalQueries.map((q) => [q.toLowerCase(), q])).values()].slice(0, 3);

  // ── Run scrapers in parallel ───────────────────────────────────────────────
  const validSources = sources.filter((s) => SCRAPER_REGISTRY[s]);

  const results = await Promise.allSettled(
    validSources.map((src) =>
      Promise.race([
        SCRAPER_REGISTRY[src](finalQueries, experience_level, location),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Scraper timeout")), 90_000)
        ),
      ])
    )
  );

  const allJobs = [];
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      allJobs.push(...result.value);
    } else {
      console.error(`[${validSources[i]}] Error: ${result.reason?.message}`);
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

  // ── Score against resume (predictor) ──────────────────────────────────────
  const resumeSkills = weighted_skills.map((s) => s.skill);
  if (resumeSkills.length || roles.length) {
    scoreJobsAgainstResume(deduped, resumeSkills, roles, experience_level, weighted_skills);
    console.log(`[Predictor] Scored ${deduped.length} jobs against resume`);
  }

  return res.json({
    jobs:          deduped,
    total:         deduped.length,
    keywords_used: finalQueries,
    by_source:     bySource,
  });
});


module.exports = router;
