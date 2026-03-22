/**
 * scrapers/linkedin.scraper.js
 * ──────────────────────────────────────────────────────────────────────────
 * Scrapes LinkedIn public job listings using Puppeteer.
 * No login required for public search results.
 * Mirrors Python linkedin_scraper.py logic exactly.
 *
 * URL pattern:
 *   https://www.linkedin.com/jobs/search/?keywords={q}&location={loc}
 *     &f_E={exp_codes}&sortBy=DD&f_JT=F,P,C
 *
 * Experience codes:
 *   2 = Entry level   3 = Associate
 *   4 = Mid-Senior    5 = Director   6 = Executive
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

const EXP_CODE_MAP = {
  "0-1":  "2",
  "1-3":  "2,3",
  "3-5":  "3,4",
  "5-10": "4",
  "10+":  "5,6",
};


// ── Main export ───────────────────────────────────────────────────────────────

async function collectLinkedinJobs(keywords, experienceLevel = "0-1", location = "") {
  const { min: userMin, max: userMax } = getUserExpRange(experienceLevel);
  const expCodes  = EXP_CODE_MAP[experienceLevel] || "2";
  const cleanKws  = cleanKeywords_(keywords);
  const locParam  = location.split(",")[0].trim();

  console.log(`[LinkedIn] Keywords: ${cleanKws} | Exp: ${experienceLevel} | Location: ${location}`);

  const jobs = [];

  await withBrowser(async (browser) => {
    for (const keyword of cleanKws) {
      const searchUrl =
        `https://www.linkedin.com/jobs/search/` +
        `?keywords=${encodeURIComponent(keyword)}` +
        `&f_E=${encodeURIComponent(expCodes)}` +
        `&sortBy=DD&f_JT=F%2CP%2CC` +
        (locParam ? `&location=${encodeURIComponent(locParam)}` : "");

      console.log(`[LinkedIn] URL: ${searchUrl}`);

      const keywordJobs = await withPage(browser, async (page) => {
        await page.goto(searchUrl, { waitUntil: "domcontentloaded" });
        await sleep(2000, 3000);

        // Dismiss login modal if present
        await dismissModal(page);

        // Scroll to trigger lazy loading
        for (let i = 0; i < 3; i++) {
          await page.evaluate(() => window.scrollBy(0, 600));
          await sleep(400, 800);
        }

        // ── Extract cards ──────────────────────────────────────────────────
        const cards = await page.$$(
          ".jobs-search__results-list li, [data-occludable-job-id], .base-card, ul.jobs-search__results-list > li"
        );
        console.log(`  Cards: ${cards.length}`);
        if (!cards.length) {
          console.log("  [LinkedIn] No cards — may be blocked or layout changed");
          return [];
        }

        const found = [];

        for (const card of cards.slice(0, 15)) {
          try {
            const data = await card.evaluate((el) => {
              const text = (sel) => el.querySelector(sel)?.textContent?.trim() || "";

              // Title
              const title = text(
                ".base-search-card__title, h3.base-search-card__title, " +
                ".job-search-card__title, h3"
              );

              // Company
              const company = text(
                ".base-search-card__subtitle a, h4.base-search-card__subtitle, " +
                ".job-search-card__company-name, .base-search-card__subtitle"
              );

              // Location
              const loc = text(
                ".job-search-card__location, .base-search-card__metadata span, " +
                ".base-search-card__metadata"
              );

              // Link
              const linkEl = el.querySelector(
                "a.base-card__full-link, a.base-search-card__full-link, " +
                "a[href*='linkedin.com/jobs/view'], a[href*='/jobs/']"
              );
              const link = linkEl?.href?.split("?")[0] || "";

              const snippet   = el.textContent.toLowerCase();
              const easyApply = snippet.includes("easy apply") ||
                !!el.querySelector(".job-search-card__easy-apply-label, [aria-label*='Easy Apply']");

              return { title, company, loc, link, snippet, easyApply };
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

            console.log(
              `  ${expVerified ? "✅[P1]" : "🔍[P2]"} ${data.title} @ ${data.company}` +
              ` | ${data.loc} | req: ${expReq || "unknown"} | EasyApply:${data.easyApply}`
            );

            found.push({
              title:            data.title,
              company:          data.company,
              location:         data.loc,
              salary:           "",   // LinkedIn rarely shows salary on card
              experience_level: experienceLevel,
              exp_required:     expReq,
              exp_mismatch:     mismatch,
              exp_hard_mismatch: hardMismatch,
              exp_verified:     expVerified,
              apply_link:       data.link,
              easy_apply:       data.easyApply,
              source:           "LinkedIn",
            });
          } catch (e) {
            console.log(`  Card error: ${e.message}`);
          }
        }

        // NOTE: P2 skipped for LinkedIn — full pages require login
        return found;
      });

      jobs.push(...keywordJobs);
      await sleep(1500, 2500);
    }
  });

  console.log(`[LinkedIn] Total: ${jobs.length} jobs`);
  return jobs;
}


// ── Dismiss login modal ───────────────────────────────────────────────────────

async function dismissModal(page) {
  try {
    await page.evaluate(() => {
      const btns = document.querySelectorAll(
        "button.modal__dismiss, [aria-label='Dismiss'], " +
        ".contextual-sign-in-modal__modal-dismiss-icon"
      );
      btns.forEach((b) => b.click());
    });
    await page.keyboard.press("Escape");
  } catch { /* silent */ }
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


module.exports = { collectLinkedinJobs };
