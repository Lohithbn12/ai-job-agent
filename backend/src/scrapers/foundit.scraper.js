/**
 * scrapers/foundit.scraper.js
 * ──────────────────────────────────────────────────────────────────────────
 * Scrapes Foundit.in (formerly Monster India) using Puppeteer.
 * Fixed:
 *   - Access Denied detection before card parsing (was silently returning 0)
 *   - Link extraction was broken (was using el.id — now uses anchor href)
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
        try {
          await page.goto(searchUrl, {
            waitUntil: "domcontentloaded",
            timeout: IS_PRODUCTION ? 60_000 : 30_000,
          });
        } catch (navErr) {
          console.log(`  [Foundit] Navigation error: ${navErr.message} — trying anyway`);
        }

        // Foundit is React-based — needs time to render
        await sleep(IS_PRODUCTION ? 6000 : 3000, IS_PRODUCTION ? 9000 : 5000);

        // Scroll to trigger lazy-load
        await page.evaluate(() => window.scrollTo(0, 600)).catch(() => {});
        await sleep(1000, 1500);

        const pageTitle = await page.title().catch(() => "");
        console.log(`  Page: ${pageTitle}`);

        // FIX #2: Detect access denial BEFORE attempting to parse cards.
        // Previously, "Access Denied" was logged but parsing continued, wasting
        // time and producing confusing "0 cards" logs.
        if (/access denied|403|forbidden|blocked|robot/i.test(pageTitle)) {
          console.log("  [Foundit] Access Denied by server — skipping keyword");
          return [];
        }

        // Also check body text for soft blocks (e.g. Cloudflare challenge pages)
        const bodyText = await page.evaluate(() =>
          (document.body?.innerText || "").toLowerCase().slice(0, 500)
        ).catch(() => "");

        if (
          /access denied|enable javascript|checking your browser|just a moment/i.test(bodyText) &&
          !/job|vacancy|opening|result/i.test(bodyText)
        ) {
          console.log("  [Foundit] Soft block detected — skipping keyword");
          return [];
        }

        // ── Extract cards ──────────────────────────────────────────────────
        let cards = await page.$$(
          ".jobCard, .srpJob, [class*='jobCard'], .cardContainer, " +
          "[class*='card-container'], [data-job-id], [class*='JobCard']"
        );
        console.log(`  Cards (attempt 1): ${cards.length}`);

        if (cards.length < 2) {
          cards = await page.$$("article, [class*='job'][class*='card'], [class*='srp']");
          console.log(`  Cards (attempt 2): ${cards.length}`);
        }

        if (!cards.length) return [];

        const found = [];

        for (const card of cards.slice(0, 12)) {
          try {
            const data = await card.evaluate((el) => {
              const text = (sel) => el.querySelector(sel)?.textContent?.trim() || "";

              const title   = text(".jobTitle, [class*='jobTitle'], h2, h3");
              const company = text(".companyName p, .companyName, [class*='company']");
              const loc     = text(".details.location, [class*='location'], .location");
              const salRaw  = text(".salary, [class*='salary'], [class*='ctc']");
              const salary  = /not disclosed/i.test(salRaw) ? "" : salRaw;
              const expText = text(".experienceSalary .details, [class*='experience']");

              // Extract href from anchor — NOT el.id
              let link = "";
              const anchors = el.querySelectorAll("a[href]");
              for (const a of anchors) {
                const href = a.href || "";
                if (href.includes("foundit.in") && (href.includes("/job") || href.includes("/detail"))) {
                  link = href.split("?")[0];
                  break;
                }
              }
              // Fallback: use data-job-id to construct URL
              if (!link) {
                const jobId = el.getAttribute("data-job-id") ||
                              el.querySelector("[data-job-id]")?.getAttribute("data-job-id");
                if (jobId) link = `https://www.foundit.in/job-detail/${jobId}`;
              }
              // Last fallback: first anchor
              if (!link) {
                const a = el.querySelector("a[href]");
                if (a?.href) link = a.href.split("?")[0];
              }

              return {
                title, company, loc, salary, expText, link,
                snippet: el.textContent.toLowerCase().slice(0, 500),
              };
            });

            if (!data.title || !data.link) continue;

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
              title:             data.title,
              company:           data.company,
              location:          data.loc,
              salary:            data.salary,
              experience_level:  experienceLevel,
              exp_required:      expReq,
              exp_mismatch:      mismatch,
              exp_hard_mismatch: hardMismatch,
              exp_verified:      expVerified,
              apply_link:        data.link,
              easy_apply:        false,
              source:            "Foundit",
            });
          } catch (e) {
            console.log(`  Card error: ${e.message}`);
          }
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
