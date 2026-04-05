/**
 * scrapers/naukri.scraper.js
 * ──────────────────────────────────────────────────────────────────────────
 * Scrapes Naukri.com job listings using Puppeteer.
 * Mirrors Python naukri_scraper.py logic exactly.
 *
 * URL pattern:
 *   https://www.naukri.com/{keyword}-jobs-in-{city}?experience={min}&to={max}&jobAge=7
 *   https://www.naukri.com/{keyword}-jobs?experience={min}&to={max}&jobAge=7
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

async function collectNaukriJobs(keywords, experienceLevel = "0-1", location = "") {
  const { min: userMin, max: userMax } = getUserExpRange(experienceLevel);
  const cleanKeywords = cleanKeywords_(keywords);

  console.log(`[Naukri] Keywords: ${cleanKeywords} | Exp: ${experienceLevel} | Location: ${location}`);

  const jobs = [];

  await withBrowser(async (browser) => {
    for (const keyword of cleanKeywords) {
      const kwSlug  = keyword.toLowerCase().replace(/\s+/g, "-");
      const locSlug = location.split(",")[0].trim().toLowerCase().replace(/\s+/g, "-");

      const searchUrl = locSlug
        ? `https://www.naukri.com/${kwSlug}-jobs-in-${locSlug}?experience=${userMin}&to=${userMax}&jobAge=7`
        : `https://www.naukri.com/${kwSlug}-jobs?experience=${userMin}&to=${userMax}&jobAge=7`;

      console.log(`[Naukri] URL: ${searchUrl}`);

      const keywordJobs = await withPage(browser, async (page) => {
        const referers = [
          "https://www.google.com/",
          "https://www.bing.com/",
          "https://search.yahoo.com/",
          "https://www.duckduckgo.com/",
        ];
        await page.setExtraHTTPHeaders({
          referer: referers[Math.floor(Math.random() * referers.length)],
          "Sec-CH-UA": '"Chromium";v="124", "Google Chrome";v="124", "Not:A-Brand";v="99"',
          "Sec-CH-UA-Mobile": "?0",
          "Sec-CH-UA-Platform": '"Windows"',
          "Upgrade-Insecure-Requests": "1",
        });
        await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 45000 });
        await page.waitForSelector("[data-job-id], div[class*='job']", { timeout: 15000 }).catch(() => {});
        await sleep(4000, 6000);

        const pageTitle = await page.title();
        const bodyText = await page.evaluate(() => document.body.innerText.toLowerCase());
        if (/access denied|you don't have permission|forbidden|error/.test(bodyText)) {
          console.log(`  [Naukri] Blocked by access denied page: ${pageTitle}`);
          return [];
        }

        console.log(`  Page: ${pageTitle}`);

        // ── Extract cards ──────────────────────────────────────────────────
        // Try multiple selector patterns (Naukri updates their HTML frequently)
        let cards = await page.$$(
          "article[class*='jobCard'], " +
          "div[class*='jobCard'], " +
          "div[class*='job'], " +
          "div.jobTuple, " +
          ".srp-jobtuple-wrapper, " +
          "article.jobTuple, " +
          "[data-job-id], " +
          "li[class*='job']"
        );
        
        console.log(`  Cards (attempt 1): ${cards.length}`);
        if (!cards.length) {
          // Fallback: look for any container with job links
          cards = await page.$$("article, [class*='srp'], [class*='container'], div.jobTuple");
          console.log(`  Cards (attempt 2): ${cards.length}`);
        }
        
        console.log(`  Cards: ${cards.length}`);
        if (!cards.length) return [];

        const found = [];

        for (const card of cards.slice(0, 10)) {
          try {
            const data = await card.evaluate((el) => {
              const text = (sel) => el.querySelector(sel)?.textContent?.trim() || "";
              const attr = (sel, a) => el.querySelector(sel)?.getAttribute(a) || "";

              // Title
              const titleEl = el.querySelector("a.title, .title a, a.jobTitle, [class*='title'] a, a[title]");
              const title   = titleEl?.getAttribute("title") || titleEl?.textContent?.trim() || "";

              // Company
              const company = text("a.comp-name, .comp-name, [class*='company'], .companyInfo a");

              // Location
              const loc = text(".locWdth, [class*='location'], .location, li.location span");

              // Salary
              const salRaw = text(".sal, [class*='salary'], .salary, li.salary span");
              const salary = ["not disclosed", "not Disclosed"].includes(salRaw.toLowerCase()) ? "" : salRaw;

              // Experience field (Naukri advantage: dedicated exp field on card)
              const expText = text(".expwdth, [class*='experience'], li.experience, li.exp span, [class*='exp']");

              // Link
              const linkEl = el.querySelector("a.title, a.jobTitle, [class*='title'] a, a[href*='naukri.com']");
              const link   = linkEl?.href || "";

              return { title, company, loc, salary, expText, link, snippet: el.textContent.toLowerCase() };
            });

            if (!data.title || !data.link) continue;

            // ── P1: exp from card ──────────────────────────────────────────
            const expRange   = extractYearsFromText(data.expText) || extractYearsFromText(data.snippet);
            const expReq     = formatExpRequired(expRange);
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
              source:           "Naukri",
            });
          } catch (e) {
            console.log(`  Card error: ${e.message}`);
          }
        }

        // ── P2: deep verify unverified ─────────────────────────────────────
        const unverified = found.filter((j) => !j.exp_verified).slice(0, DEEP_VERIFY_LIMIT);
        if (unverified.length) {
          console.log(`  [P2] Deep-verifying ${unverified.length} jobs...`);
          await deepVerify(unverified, page, userMin, userMax);
        }

        return found;
      }, { skipAntiBot: true });

      jobs.push(...keywordJobs);
      await sleep(1000, 2000);
    }
  });

  console.log(`[Naukri] Total: ${jobs.length} jobs`);
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

      job.exp_required = formatExpRequired(expRange);
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


module.exports = { collectNaukriJobs };
