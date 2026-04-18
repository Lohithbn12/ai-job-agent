/**
 * scrapers/naukri.scraper.js
 * ──────────────────────────────────────────────────────────────────────────
 * Scrapes Naukri.com job listings using Puppeteer.
 * Fixed:
 *   - Strategy threshold logic: use the FIRST strategy that returns ANY
 *     cards — previously "< N threshold" meant a valid 2-4 card result
 *     was thrown away in favour of a noisier broader selector.
 *   - Keyword typo correction (e.g. "anlyst" → "analyst")
 *   - Deduplication by apply_link
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

// ── Typo corrections ──────────────────────────────────────────────────────────
const KEYWORD_CORRECTIONS = {
  anlyst:    "analyst",
  analst:    "analyst",
  anlayst:   "analyst",
  develper:  "developer",
  devloper:  "developer",
  enginer:   "engineer",
  enginear:  "engineer",
  manger:    "manager",
  managr:    "manager",
  sceintist: "scientist",
  sientist:  "scientist",
  desginer:  "designer",
};

function correctTypos(str) {
  let out = str;
  for (const [typo, fix] of Object.entries(KEYWORD_CORRECTIONS)) {
    out = out.replace(new RegExp(`\\b${typo}\\b`, "gi"), fix);
  }
  return out;
}

// ── Main export ───────────────────────────────────────────────────────────────
async function collectNaukriJobs(keywords, experienceLevel = "0-1", location = "") {
  const { min: userMin, max: userMax } = getUserExpRange(experienceLevel);
  const cleanKws = cleanKeywords_(keywords);

  console.log(`[Naukri] Keywords: ${cleanKws} | Exp: ${experienceLevel} | Location: ${location}`);

  const jobs = [];

  await withBrowser(async (browser) => {
    for (const keyword of cleanKws) {
      const corrected = correctTypos(keyword);
      const kwSlug    = corrected.toLowerCase().replace(/\s+/g, "-");
      const locSlug   = location.split(",")[0].trim().toLowerCase().replace(/\s+/g, "-");

      const searchUrl = locSlug
        ? `https://www.naukri.com/${kwSlug}-jobs-in-${locSlug}?experience=${userMin}&to=${userMax}&jobAge=7`
        : `https://www.naukri.com/${kwSlug}-jobs?experience=${userMin}&to=${userMax}&jobAge=7`;

      console.log(`[Naukri] URL: ${searchUrl}`);

      const keywordJobs = await withPage(browser, async (page) => {
        await page.setExtraHTTPHeaders({
          "Referer":            "https://www.google.com/",
          "Sec-CH-UA":          '"Chromium";v="124", "Google Chrome";v="124", "Not:A-Brand";v="99"',
          "Sec-CH-UA-Mobile":   "?0",
          "Sec-CH-UA-Platform": '"Windows"',
        });

        await page.evaluateOnNewDocument(() => {
          Object.defineProperty(navigator, "webdriver", { get: () => false });
        });

        try {
          await page.goto(searchUrl, {
            waitUntil: "domcontentloaded",
            timeout: IS_PRODUCTION ? 60_000 : 45_000,
          });
        } catch (navErr) {
          console.log(`  [Naukri] Nav error: ${navErr.message} — trying anyway`);
        }

        await sleep(IS_PRODUCTION ? 6000 : 3000, IS_PRODUCTION ? 9000 : 5000);
        await page.evaluate(() => window.scrollTo(0, 400)).catch(() => {});
        await sleep(1500, 2500);
        await page.evaluate(() => window.scrollTo(0, 800)).catch(() => {});
        await sleep(1000, 1500);

        const pageTitle = await page.title().catch(() => "");
        console.log(`  Page: ${pageTitle}`);

        const bodyText = await page.evaluate(() =>
          (document.body?.innerText || "").toLowerCase()
        ).catch(() => "");

        if (/access denied|you don't have permission|forbidden|captcha/.test(bodyText)) {
          console.log("  [Naukri] Blocked — skipping");
          return [];
        }

        // ── Selector strategies ───────────────────────────────────────────
        // FIXED: stop at the FIRST strategy that returns any cards at all.
        // The old "< N" threshold caused valid small result sets (e.g. 2 cards
        // from strategy 2) to be discarded for noisier broader selectors.
        let cards = [];
        let strategyUsed = 0;

        const strategies = [
          { label: "article",       sel: "article.jobTuple, article[class*='job']" },
          { label: "data-job-id",   sel: "[data-job-id]" },
          { label: "srp-wrapper",   sel: ".srp-jobtuple-wrapper, .jobTuple, .job-tuple" },
          { label: "class contains",sel: "div[class*='jobCard'], div[class*='JobCard'], div[class*='job-card'], div[class*='srp']" },
          { label: "main article",  sel: "main article, main li[class*='job'], .list article" },
        ];

        for (let i = 0; i < strategies.length; i++) {
          const { label, sel } = strategies[i];
          const found = await page.$$(sel);
          console.log(`  Strategy ${i + 1} (${label}): ${found.length}`);
          if (found.length) {
            cards = found;
            strategyUsed = i + 1;
            break;  // ← stop here; don't try broader selectors
          }
        }

        if (!cards.length) {
          const domSummary = await page.evaluate(() => {
            return `articles: ${document.querySelectorAll("article").length}, ` +
                   `data-job-id: ${document.querySelectorAll("[data-job-id]").length}, ` +
                   `job-class: ${document.querySelectorAll("[class*='job']").length}`;
          }).catch(() => "unknown");
          console.log(`  DOM: ${domSummary}`);
          return [];
        }

        console.log(`  Using strategy ${strategyUsed} — ${cards.length} cards`);

        const found = [];

        for (const card of cards.slice(0, 12)) {
          try {
            const data = await card.evaluate((el) => {
              const text = (sel) => el.querySelector(sel)?.textContent?.trim() || "";

              let title = "";
              for (const sel of [
                "a.title", ".title a", "a.jobTitle", ".jobTitle a",
                "[class*='title'] a", "a[title]", "h2 a", "h3 a", "a[class*='job']",
              ]) {
                const el2 = el.querySelector(sel);
                if (el2) {
                  title = el2.getAttribute("title") || el2.textContent.trim();
                  if (title) break;
                }
              }

              let company = "";
              for (const sel of [
                "a.comp-name", ".comp-name", ".companyInfo a",
                "[class*='company']", "[class*='compName']",
              ]) {
                company = text(sel);
                if (company) break;
              }

              let loc = "";
              for (const sel of [
                ".locWdth", "[class*='location']", ".location",
                "li.location span", "[class*='loc']",
              ]) {
                loc = text(sel);
                if (loc) break;
              }

              const salRaw = text(".sal, [class*='salary'], li.salary span");
              const salary = /not disclosed/i.test(salRaw) ? "" : salRaw;

              let expText = "";
              for (const sel of [
                ".expwdth", "[class*='experience']", "li.experience",
                "li.exp span", "[class*='exp']",
              ]) {
                expText = text(sel);
                if (expText) break;
              }

              let link = "";
              for (const sel of [
                "a.title", "a.jobTitle", "[class*='title'] a",
                "a[href*='naukri.com/']",
              ]) {
                const a = el.querySelector(sel);
                if (a?.href) { link = a.href; break; }
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
              source:            "Naukri",
            });
          } catch (e) {
            console.log(`  Card error: ${e.message}`);
          }
        }

        // Deduplicate by apply_link
        const seenLinks = new Set();
        const deduped = found.filter((j) => {
          if (!j.apply_link || seenLinks.has(j.apply_link)) return false;
          seenLinks.add(j.apply_link);
          return true;
        });
        if (deduped.length !== found.length) {
          console.log(`  [Naukri] Deduped ${found.length} → ${deduped.length} jobs`);
        }

        return deduped;
      }, { skipAntiBot: true });

      jobs.push(...keywordJobs);
      await sleep(1500, 2500);
    }
  });

  console.log(`[Naukri] Total: ${jobs.length} jobs`);
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
    const clean = correctTypos(kw.replace(/\n/g, " ").trim());
    const lower = clean.toLowerCase();
    if (seen.has(lower)) continue;
    if (!VALID.some((v) => lower.includes(v))) continue;
    seen.add(lower);
    out.push(clean);
  }
  return out.length ? out : ["data analyst"];
}

module.exports = { collectNaukriJobs };
