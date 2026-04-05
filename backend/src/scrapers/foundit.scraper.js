/**
 * scrapers/foundit.scraper.js
 * ──────────────────────────────────────────────────────────────────────────
 * Scrapes Foundit.in (formerly Monster India) using Puppeteer.
 * Mirrors Python foundit_scraper.py logic exactly.
 *
 * URL pattern:
 *   https://www.foundit.in/srp/results?query={keyword}
 *     &experienceRanges={min}~{max}&sort=1&limit=15
 *     &locationPreferences={city}
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

async function collectFounditJobs(keywords, experienceLevel = "0-1", location = "") {
  const { min: userMin, max: userMax } = getUserExpRange(experienceLevel);
  const expRangeParam = `${userMin}~${userMax}`;
  const cleanKws  = cleanKeywords_(keywords);
  const locParam  = location.split(",")[0].trim();

  console.log(`[Foundit] Keywords: ${cleanKws} | Exp: ${experienceLevel} | Location: ${location}`);

  const jobs = [];

  await withBrowser(async (browser) => {
    for (const keyword of cleanKws) {
      const searchUrl =
        `https://www.foundit.in/srp/results` +
        `?query=${encodeURIComponent(keyword)}` +
        `&experienceRanges=${expRangeParam}` +
        `&sort=1&limit=15` +
        (locParam ? `&locationPreferences=${encodeURIComponent(locParam)}` : "");

      console.log(`[Foundit] URL: ${searchUrl}`);

      const keywordJobs = await withPage(browser, async (page) => {
        await page.goto(searchUrl, { waitUntil: "domcontentloaded" });
        await sleep(2000, 3000);

        console.log(`  Page: ${await page.title()}`);

        // ── Extract cards ──────────────────────────────────────────────────
        const cards = await page.$$(
          ".jobCard, .srpJob, [class*='jobCard'], .cardContainer, " +
          "[class*='card-container'], article, [data-job-id]"
        );
        console.log(`  Cards: ${cards.length}`);
        if (!cards.length) return [];

        const found = [];

        for (const card of cards.slice(0, 10)) {
          try {
            const data = await card.evaluate((el) => {
              const text = (sel) => el.querySelector(sel)?.textContent?.trim() || "";

              // Title
              const title = text(".jobTitle");

              // Company
              const company = text(".companyName p");

              // Location
              const loc = text(".details.location");

              // Salary
              const salary = text(".salary, [class*='salary'], [class*='ctc']");

              // Experience text on card
              const expText = text(".experienceSalary .details");

              // Link - construct from card id
              const link = el.id ? `https://www.foundit.in/job-detail/${el.id}` : "";

              const snippet = el.textContent.toLowerCase();
              return { title, company, loc, salary, expText, link, snippet };
            });

            if (!data.title || !data.link) continue;

            // ── P1 ─────────────────────────────────────────────────────────
            const expRange    = extractYearsFromText(data.expText) || extractYearsFromText(data.snippet);
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
              location:         data.loc,
              salary:           data.salary,
              experience_level: experienceLevel,
              exp_required:     expReq,
              exp_mismatch:     mismatch,
              exp_hard_mismatch: hardMismatch,
              exp_verified:     expVerified,
              apply_link:       data.link,
              easy_apply:       false,
              source:           "Foundit",
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
      await sleep(1000, 2000);
    }
  });

  console.log(`[Foundit] Total: ${jobs.length} jobs`);
  return jobs;
}


// ── Deep verify (P2) ──────────────────────────────────────────────────────────

async function deepVerify(jobs, page, userMin, userMax) {
  for (const job of jobs) {
    try {
      console.log(`    [P2] ${job.title.slice(0, 50)}`);
      await page.goto(job.apply_link, { waitUntil: "domcontentloaded" });
      await sleep(1500, 2500);

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


module.exports = { collectFounditJobs };
