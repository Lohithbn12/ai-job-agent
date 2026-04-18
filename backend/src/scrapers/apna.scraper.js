/**
 * scrapers/apna.scraper.js
 * ──────────────────────────────────────────────────────────────────────────
 * Scrapes Apna.co job listings using Puppeteer.
 * Fixed:
 *   - Relevance filter: skips jobs whose title doesn't match the keyword
 *     (Apna sometimes ignores query params and returns generic homepage jobs)
 *   - Longer waits for JS-heavy rendering, better card selectors,
 *     improved login-wall detection
 * ──────────────────────────────────────────────────────────────────────────
 */

"use strict";

const { withBrowser, withPage, sleep, IS_PRODUCTION } = require("../services/chromeHelper");
const {
  extractYearsFromText,
  formatExpRequired,
  checkExpMismatch,
  getUserExpRange,
} = require("../utils/expParser");

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
        // Apna checks for automation — mask webdriver
        await page.evaluateOnNewDocument(() => {
          Object.defineProperty(navigator, "webdriver", { get: () => false });
          Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3] });
        });

        try {
          await page.goto(searchUrl, {
            waitUntil: "domcontentloaded",
            timeout: IS_PRODUCTION ? 60_000 : 30_000,
          });
        } catch (navErr) {
          console.log(`  [Apna] Navigation error: ${navErr.message} — trying anyway`);
        }

        // Apna is very JS-heavy — wait longer + scroll
        await sleep(IS_PRODUCTION ? 10000 : 6000, IS_PRODUCTION ? 14000 : 9000);

        // Scroll to trigger content load
        for (let i = 0; i < 3; i++) {
          await page.evaluate(() => window.scrollBy(0, 400)).catch(() => {});
          await sleep(600, 1000);
        }

        const title = await page.title().catch(() => "unknown");
        console.log(`  Page: ${title}`);

        const bodyText = await page.evaluate(() =>
          (document.body?.textContent || "").toLowerCase().slice(0, 1000)
        ).catch(() => "");

        // Login wall check
        if (/sign in|log in|create account|verify your/.test(bodyText) && !/job|vacancy|opening/.test(bodyText)) {
          console.log("  [Apna] Login wall detected — skipping");
          return [];
        }

        // ── Try multiple card selectors ────────────────────────────────────
        let cards = [];

        // Strategy 1: Apna's specific job card classes
        cards = await page.$$("[class*='JobCard'], [class*='job-card'], [class*='jobCard']");
        console.log(`  Strategy 1 (JobCard): ${cards.length}`);

        if (cards.length < 2) {
          // Strategy 2: data attributes
          cards = await page.$$("[data-job-id], [data-jobid], [data-id]");
          console.log(`  Strategy 2 (data-attr): ${cards.length}`);
        }

        if (cards.length < 2) {
          // Strategy 3: list items / articles with job-like content
          cards = await page.$$("li[class*='job'], li[class*='item'], article");
          console.log(`  Strategy 3 (li/article): ${cards.length}`);
        }

        if (cards.length < 2) {
          // Strategy 4: any card-like container
          cards = await page.$$(
            "[class*='card'][class*='job'], [class*='listing'], " +
            "[class*='vacancy'], [class*='opening']"
          );
          console.log(`  Strategy 4 (listing): ${cards.length}`);
        }

        if (!cards.length) {
          const domInfo = await page.evaluate(() => {
            return `body children: ${document.body?.children?.length}, ` +
                   `articles: ${document.querySelectorAll("article").length}, ` +
                   `li: ${document.querySelectorAll("li").length}`;
          }).catch(() => "unknown");
          console.log(`  [Apna] No cards found. DOM: ${domInfo}`);
          return [];
        }

        // FIX #4: pre-compute keyword words for relevance checking
        // Split keyword into meaningful tokens (skip short words like "in", "at")
        const kwTokens = keyword.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

        const found = [];

        for (const card of cards.slice(0, 12)) {
          try {
            const data = await card.evaluate((el) => {
              // Title
              let title = "";
              for (const sel of [
                "[class*='jobTitle']", "[class*='job-title']", "[class*='JobTitle']",
                "[class*='title']", "h2", "h3", "h4", "strong",
              ]) {
                const t = el.querySelector(sel)?.textContent?.trim() || "";
                if (t && t.length > 3 && t.length < 100) { title = t; break; }
              }

              // Company
              let company = "";
              for (const sel of [
                "[class*='company']", "[class*='Company']", "[class*='employer']",
                "[class*='org']", "[class*='brand']",
              ]) {
                const t = el.querySelector(sel)?.textContent?.trim() || "";
                if (t && t.length > 1) { company = t; break; }
              }

              // Location
              let loc = "";
              for (const sel of [
                "[class*='location']", "[class*='Location']", "[class*='city']",
                "[class*='place']", "[class*='area']",
              ]) {
                const t = el.querySelector(sel)?.textContent?.trim() || "";
                if (t && t.length > 1) { loc = t; break; }
              }

              // Salary
              let salary = "";
              for (const sel of [
                "[class*='salary']", "[class*='Salary']", "[class*='ctc']",
                "[class*='pay']", "[class*='lpa']",
              ]) {
                const t = el.querySelector(sel)?.textContent?.trim() || "";
                if (t && t.length > 1) { salary = t; break; }
              }

              // Link
              let link = "";
              const anchors = el.querySelectorAll("a[href]");
              for (const a of anchors) {
                const href = a.href || "";
                if (href.includes("apna.co") && href.length > 20) {
                  link = href;
                  break;
                }
              }
              if (!link) {
                const a = el.closest("a") || el.querySelector("a");
                if (a?.href) {
                  link = a.href.startsWith("/")
                    ? `https://apna.co${a.href}`
                    : a.href;
                }
              }

              return {
                title, company, loc, salary, link,
                snippet: el.textContent.toLowerCase().slice(0, 500),
              };
            });

            if (!data.title || !data.link) continue;

            // FIX #4: Relevance check — ensure at least one keyword token
            // appears in the job title. This filters out unrelated jobs that
            // appear when Apna ignores the designation query param and falls
            // back to its generic job listing page.
            const titleLower = data.title.toLowerCase();
            const isRelevant = kwTokens.some((token) => titleLower.includes(token));
            if (!isRelevant) {
              console.log(`  [Apna] Irrelevant job skipped: "${data.title}" (keyword: "${keyword}")`);
              continue;
            }

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
              title:             data.title,
              company:           data.company,
              location:          data.loc || city,
              salary:            data.salary,
              experience_level:  experienceLevel,
              exp_required:      expReq,
              exp_mismatch:      mismatch,
              exp_hard_mismatch: hardMismatch,
              exp_verified:      expVerified,
              apply_link:        data.link,
              easy_apply:        false,
              source:            "Apna",
            });
          } catch (e) {
            console.log(`  Card error: ${e.message}`);
          }
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
