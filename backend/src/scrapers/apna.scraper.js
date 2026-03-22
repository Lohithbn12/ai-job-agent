/**
 * scrapers/apna.scraper.js
 * ──────────────────────────────────────────────────────────────────────────
 * Scrapes Apna.co job listings using Puppeteer.
 * Mirrors Python apna_scraper.py logic exactly.
 *
 * Apna is app-first and JS-heavy — needs longer waits.
 * Aggressively blocks headless browsers on some runs — gracefully returns
 * empty list in that case.
 *
 * URL pattern:
 *   https://apna.co/jobs?designation={keyword}&city={city}
 * ──────────────────────────────────────────────────────────────────────────
 */

"use strict";

const { withBrowser, withPage, sleep } = require("../services/chromeHelper");
const {
  extractYearsFromText,
  formatExpRequired,
  checkExpMismatch,
  getUserExpRange,
} = require("../utils/expParser");

const DEEP_VERIFY_LIMIT = 3;


// ── Main export ───────────────────────────────────────────────────────────────

async function collectApnaJobs(keywords, experienceLevel = "0-1", location = "") {
  const { min: userMin, max: userMax } = getUserExpRange(experienceLevel);
  const cleanKws = cleanKeywords_(keywords);
  const city     = location.split(",")[0].trim();

  console.log(`[Apna] Keywords: ${cleanKws} | Exp: ${experienceLevel} | City: ${city}`);

  const jobs = [];

  await withBrowser(async (browser) => {
    for (const keyword of cleanKws) {
      const searchUrl = city
        ? `https://apna.co/jobs?designation=${encodeURIComponent(keyword)}&city=${encodeURIComponent(city)}`
        : `https://apna.co/jobs?designation=${encodeURIComponent(keyword)}`;

      console.log(`[Apna] URL: ${searchUrl}`);

      const keywordJobs = await withPage(browser, async (page) => {
        await page.goto(searchUrl, { waitUntil: "domcontentloaded" });
        // Apna is very JS-heavy — needs longer wait than other boards
        await sleep(6000, 9000);

        console.log(`  Page: ${await page.title()}`);

        // Check for login wall
        const bodyText = await page.evaluate(() =>
          document.body?.textContent?.toLowerCase()?.slice(0, 300) || ""
        );
        if (/sign in|log in/.test(bodyText)) {
          console.log("  [Apna] Login wall detected — skipping keyword");
          return [];
        }

        // ── Extract cards ──────────────────────────────────────────────────
        const cards = await page.$$(
          "[class*='JobCard'], [class*='job-card'], [data-job-id], " +
          "[class*='jobItem'], article, [class*='card']"
        );
        console.log(`  Cards: ${cards.length}`);
        if (!cards.length) {
          console.log("  [Apna] No cards — JS may not have rendered or page blocked");
          return [];
        }

        const found = [];

        for (const card of cards.slice(0, 12)) {
          try {
            const data = await card.evaluate((el) => {
              const text = (sel) => el.querySelector(sel)?.textContent?.trim() || "";

              // Title — try multiple selectors
              let title = "";
              for (const sel of ["[class*='jobTitle']","[class*='title']","h2","h3","strong"]) {
                const t = el.querySelector(sel)?.textContent?.trim() || "";
                if (t && t.length > 3) { title = t; break; }
              }

              // Company
              let company = "";
              for (const sel of ["[class*='company']","[class*='employer']","[class*='org']"]) {
                const t = el.querySelector(sel)?.textContent?.trim() || "";
                if (t) { company = t; break; }
              }

              // Location
              let loc = "";
              for (const sel of ["[class*='location']","[class*='city']","[class*='place']"]) {
                const t = el.querySelector(sel)?.textContent?.trim() || "";
                if (t) { loc = t; break; }
              }

              // Salary
              let salary = "";
              for (const sel of ["[class*='salary']","[class*='ctc']","[class*='pay']"]) {
                const t = el.querySelector(sel)?.textContent?.trim() || "";
                if (t) { salary = t; break; }
              }

              // Link
              const a    = el.querySelector("a");
              let link   = a?.href || "";
              if (link.startsWith("/")) link = `https://apna.co${link}`;

              const snippet = el.textContent.toLowerCase();
              return { title, company, loc, salary, link, snippet };
            });

            if (!data.title || !data.link) continue;

            // ── P1 ─────────────────────────────────────────────────────────
            const expRange    = extractYearsFromText(data.snippet);
            const expReq      = formatExpRequired(expRange);
            const expVerified = expRange !== null;
            const { hardDrop, mismatch, hardMismatch } = checkExpMismatch(expRange, userMin, userMax);

            if (hardDrop) {
              console.log(`  [P1] Hard-drop '${data.title}': ${expReq}`);
              continue;
            }

            console.log(`  ${expVerified ? "✅[P1]" : "🔍[P2]"} ${data.title} @ ${data.company} | req: ${expReq || "unknown"}`);

            found.push({
              title:            data.title,
              company:          data.company,
              location:         data.loc || city,
              salary:           data.salary,
              experience_level: experienceLevel,
              exp_required:     expReq,
              exp_mismatch:     mismatch,
              exp_hard_mismatch: hardMismatch,
              exp_verified:     expVerified,
              apply_link:       data.link,
              easy_apply:       false,
              source:           "Apna",
            });
          } catch (e) {
            console.log(`  Card error: ${e.message}`);
          }
        }

        // ── P2 ─────────────────────────────────────────────────────────────
        const unverified = found.filter((j) => !j.exp_verified).slice(0, DEEP_VERIFY_LIMIT);
        if (unverified.length) {
          console.log(`  [P2] Deep-verifying ${unverified.length} jobs...`);
          await deepVerify(unverified, page, userMin, userMax);
        }

        return found;
      });

      jobs.push(...keywordJobs);
      await sleep(1500, 2500);
    }
  });

  console.log(`[Apna] Total: ${jobs.length} jobs`);
  return jobs;
}


// ── Deep verify (P2) ──────────────────────────────────────────────────────────

async function deepVerify(jobs, page, userMin, userMax) {
  for (const job of jobs) {
    try {
      console.log(`    [P2] ${job.title.slice(0, 50)}`);
      await page.goto(job.apply_link, { waitUntil: "domcontentloaded" });
      // Apna needs more time on detail pages too
      await sleep(3000, 5000);

      const bodyText = await page.evaluate(() => document.body.innerText.toLowerCase());
      const expRange = extractYearsFromText(bodyText);
      if (!expRange) continue;

      job.exp_required  = formatExpRequired(expRange);
      job.exp_verified  = true;
      const { hardDrop, mismatch, hardMismatch } = checkExpMismatch(expRange, userMin, userMax);
      job.exp_mismatch      = mismatch || hardDrop;
      job.exp_hard_mismatch = hardMismatch || hardDrop;
      console.log(`    [P2] ${hardDrop ? "MISMATCH" : "OK"}: ${job.exp_required}`);
    } catch (e) {
      console.log(`    [P2] Error: ${e.message}`);
    }
  }
}


// ── Keyword cleaner ───────────────────────────────────────────────────────────

function cleanKeywords_(keywords) {
  const VALID = [
    "analyst","engineer","developer","scientist","manager","designer",
    "architect","consultant","specialist","intern","data","software",
    "machine learning","frontend","backend","fullstack","devops","cloud",
    "python","java","power bi","business","product","project","network",
    "security","ai","ml",
  ];
  const seen = new Set();
  const out  = [];
  for (const kw of keywords) {
    const clean = kw.replace(/\n/g, " ").trim();
    const lower = clean.toLowerCase();
    if (seen.has(lower)) continue;
    if (!VALID.some((v) => lower.includes(v))) continue;
    seen.add(lower);
    out.push(clean);
  }
  return out.length ? out : ["data analyst"];
}


module.exports = { collectApnaJobs };
