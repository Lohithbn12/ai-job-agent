/**
 * scrapers/internshala.scraper.js
 * ──────────────────────────────────────────────────────────────────────────
 * Scrapes Internshala job listings using Puppeteer.
 * Fixed: better link extraction, improved card selectors, scroll-to-load.
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
async function collectInternshalaJobs(keywords, experienceLevel = "0-1", location = "") {
  const { min: userMin, max: userMax } = getUserExpRange(experienceLevel);
  const cleanKws = cleanKeywords_(keywords);

  console.log(`[Internshala] Keywords: ${cleanKws} | Exp: ${experienceLevel} | Location: ${location}`);

  const jobs = [];

  await withBrowser(async (browser) => {
    for (const keyword of cleanKws) {
      const kwSlug  = keyword.trim().toLowerCase().replace(/\s+/g, "-");
      const locSlug = location.split(",")[0].trim().toLowerCase().replace(/\s+/g, "-");

      const searchUrl = locSlug
        ? `https://internshala.com/jobs/${kwSlug}-jobs-in-${locSlug}/`
        : `https://internshala.com/jobs/${kwSlug}-jobs/`;

      console.log(`[Internshala] URL: ${searchUrl}`);

      const keywordJobs = await withPage(browser, async (page) => {
        try {
          await page.goto(searchUrl, {
            waitUntil: "domcontentloaded",
            timeout: IS_PRODUCTION ? 60_000 : 30_000,
          });
        } catch (navErr) {
          console.log(`  [Internshala] Navigation error: ${navErr.message} — trying anyway`);
        }

        await sleep(IS_PRODUCTION ? 5000 : 2500, IS_PRODUCTION ? 7000 : 4000);

        // Scroll to trigger lazy loading
        await page.evaluate(() => window.scrollTo(0, 500)).catch(() => {});
        await sleep(800, 1200);
        await page.evaluate(() => window.scrollTo(0, 1000)).catch(() => {});
        await sleep(500, 800);

        console.log(`  Page: ${await page.title().catch(() => "unknown")}`);

        // ── Extract cards ──────────────────────────────────────────────────
        let cards = await page.$$(
          ".internship_meta, .job-internship-card, [data-internship_id], " +
          ".individual_internship, .container-fluid.individual_internship"
        );
        console.log(`  Cards (attempt 1): ${cards.length}`);

        if (cards.length < 2) {
          cards = await page.$$(".individual_internship, #internship_list_container > div, .internship-list-container > div");
          console.log(`  Cards (attempt 2): ${cards.length}`);
        }

        if (cards.length < 2) {
          cards = await page.$$("[class*='internship'], [class*='job'][class*='card'], article");
          console.log(`  Cards (attempt 3): ${cards.length}`);
        }

        if (!cards.length) return [];

        const found = [];

        for (const card of cards.slice(0, 12)) {
          try {
            const data = await card.evaluate((el) => {
              const text = (sel) => el.querySelector(sel)?.textContent?.trim() || "";

              // Title
              let title = "";
              for (const sel of [
                ".job-title-href", ".profile", "h3.job-title",
                "a.job-title", ".heading_4_5", "[class*='title']", "h3", "h4",
              ]) {
                title = text(sel);
                if (title) break;
              }

              // Company
              let company = "";
              for (const sel of [
                ".company-name", ".company_name", "[class*='company']",
                ".heading_6", "p.name",
              ]) {
                company = text(sel);
                if (company) break;
              }

              // Location
              let loc = "";
              for (const sel of [
                ".location_link", ".location", "[class*='location']",
                ".map-icon", ".ic-16-map-pin",
              ]) {
                loc = text(sel);
                if (loc) break;
              }

              // Salary / Stipend
              const salary = text(".stipend, .salary, [class*='salary'], [class*='stipend'], .ic-16-money");

              // Link — prefer direct job detail links
              let link = "";
              const allAnchors = el.querySelectorAll("a[href]");
              for (const a of allAnchors) {
                const href = a.href || "";
                if (href.includes("internshala.com") &&
                   (href.includes("/jobs/detail") || href.includes("/job/") || href.includes("/internship/"))) {
                  link = href.split("?")[0];
                  break;
                }
              }
              // Fallback: any internshala link
              if (!link) {
                for (const a of allAnchors) {
                  if (a.href?.includes("internshala.com")) {
                    link = a.href.split("?")[0];
                    break;
                  }
                }
              }
              // Relative URL fallback
              if (!link) {
                const a = el.querySelector("a[href^='/']");
                if (a) link = `https://internshala.com${a.getAttribute("href").split("?")[0]}`;
              }

              return {
                title, company, loc, salary, link,
                snippet: el.textContent.toLowerCase().slice(0, 500),
              };
            });

            if (!data.title || !data.link) continue;

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
              location:          data.loc,
              salary:            data.salary,
              experience_level:  experienceLevel,
              exp_required:      expReq,
              exp_mismatch:      mismatch,
              exp_hard_mismatch: hardMismatch,
              exp_verified:      expVerified,
              apply_link:        data.link,
              easy_apply:        false,
              source:            "Internshala",
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

  console.log(`[Internshala] Total: ${jobs.length} jobs`);
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

module.exports = { collectInternshalaJobs };
