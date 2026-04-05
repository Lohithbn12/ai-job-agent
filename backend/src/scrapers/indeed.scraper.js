/**
 * scrapers/indeed.scraper.js
 * ──────────────────────────────────────────────────────────────────────────
 * Scrapes Indeed job listings using Puppeteer.
 * Updated for Render/cloud server compatibility.
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

const DEEP_VERIFY_LIMIT = IS_PRODUCTION ? 2 : 3;

const EXPERIENCE_FILTERS = {
  "0-1":  "entry_level",
  "1-3":  "entry_level",
  "3-5":  "mid_level",
  "5-10": "senior_level",
  "10+":  "senior_level",
};

const COUNTRY_DOMAINS = {
  india:                  "in.indeed.com",
  uk:                     "uk.indeed.com",
  "united kingdom":       "uk.indeed.com",
  canada:                 "ca.indeed.com",
  australia:              "au.indeed.com",
  germany:                "de.indeed.com",
  france:                 "fr.indeed.com",
  singapore:              "sg.indeed.com",
  uae:                    "ae.indeed.com",
  "united arab emirates": "ae.indeed.com",
};


// ── Main export ───────────────────────────────────────────────────────────────

async function collectIndeedJobs(keywords, experienceLevel = "0-1", location = "") {
  const { min: userMin, max: userMax } = getUserExpRange(experienceLevel);
  const expFilter = EXPERIENCE_FILTERS[experienceLevel] || "entry_level";
  const cleanKws  = cleanKeywords_(keywords);

  let baseDomain = "www.indeed.com";
  const locLower = location.toLowerCase();
  for (const [key, domain] of Object.entries(COUNTRY_DOMAINS)) {
    if (locLower.includes(key)) { baseDomain = domain; break; }
  }
  const locParam = location.replace(/\s+/g, "+");

  console.log(`[Indeed] Keywords: ${cleanKws} | Exp: ${experienceLevel} | Location: ${location}`);

  const jobs = [];

  await withBrowser(async (browser) => {
    for (const keyword of cleanKws) {
      const searchUrl =
        `https://${baseDomain}/jobs` +
        `?q=${encodeURIComponent(keyword)}` +
        `&explvl=${expFilter}&sort=date` +
        (locParam ? `&l=${locParam}` : "");

      console.log(`[Indeed] URL: ${searchUrl}`);

      const keywordJobs = await withPage(browser, async (page) => {
        try {
          await page.goto(searchUrl, {
            waitUntil: "domcontentloaded",
            timeout: IS_PRODUCTION ? 60_000 : 30_000,
          });
        } catch (navErr) {
          console.log(`  [Indeed] Navigation error: ${navErr.message} — trying anyway`);
        }

        await sleep(IS_PRODUCTION ? 4000 : 2000, IS_PRODUCTION ? 6000 : 3000);

        const title = await page.title().catch(() => "");
        console.log(`  Page: ${title}`);

        if (/blocked|just a moment/i.test(title)) {
          await sleep(IS_PRODUCTION ? 15000 : 10000);
          await page.reload({ waitUntil: "domcontentloaded" }).catch(() => {});
          await sleep(IS_PRODUCTION ? 8000 : 5000);
          const newTitle = await page.title().catch(() => "");
          if (/blocked|just a moment/i.test(newTitle)) {
            console.log("  Blocked — skipping keyword");
            return [];
          }
        }

        // ── Extract cards ──────────────────────────────────────────────────
        const cards = await page.$$(".job_seen_beacon, [data-jk]");
        console.log(`  Cards: ${cards.length}`);
        if (!cards.length) return [];

        const found = [];

        for (const card of cards.slice(0, 10)) {
          try {
            const data = await card.evaluate((el, domain) => {
              const text = (sel) => el.querySelector(sel)?.textContent?.trim() || "";

              const titleEl = el.querySelector("h2.jobTitle span[title], h2.jobTitle span, a.jcs-JobTitle span");
              const title   = titleEl?.getAttribute("title") || titleEl?.textContent?.trim() || "";

              const company = text("[data-testid='company-name'], .companyName");
              const loc     = text("[data-testid='text-location'], .companyLocation");

              let salary = "";
              const salEls = el.querySelectorAll(
                "[data-testid='attribute_snippet_testid'], .salary-snippet-container, " +
                ".salaryOnly, [class*='SalarySnippet'], [class*='salary']"
              );
              for (const s of salEls) {
                const t = s.textContent.trim();
                if (t && /[$₹£€]|year|hour|month|per/i.test(t)) { salary = t; break; }
              }
              if (!salary) {
                for (const m of el.querySelectorAll(".metadata, li")) {
                  const t = m.textContent.trim();
                  if (t && /[$₹£LPA]|lakh|k per/i.test(t)) { salary = t; break; }
                }
              }

              const aEl = el.querySelector("a.jcs-JobTitle, h2.jobTitle a");
              const jk  = aEl?.getAttribute("data-jk") || "";
              const link = jk
                ? `https://${domain}/viewjob?jk=${jk}`
                : (aEl?.href || "").split("?")[0];

              const snippet   = el.textContent.toLowerCase();
              const easyApply = snippet.includes("easily apply");

              return { title, company, loc, salary, link, snippet, easyApply };
            }, baseDomain);

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
              easy_apply:        data.easyApply,
              source:            "Indeed",
            });
          } catch (e) {
            console.log(`  Card error: ${e.message}`);
          }
        }

        // P2 — skip on production server
        if (!IS_PRODUCTION) {
          const unverified = found.filter((j) => !j.exp_verified).slice(0, DEEP_VERIFY_LIMIT);
          if (unverified.length) {
            console.log(`  [P2] Deep-verifying ${unverified.length} jobs...`);
            await deepVerify(unverified, page, userMin, userMax);
          }
        }

        return found;
      });

      jobs.push(...keywordJobs);
      await sleep(1000, 2000);
    }
  });

  console.log(`[Indeed] Total: ${jobs.length} jobs`);
  return jobs;
}


// ── Deep verify (P2) ──────────────────────────────────────────────────────────

async function deepVerify(jobs, page, userMin, userMax) {
  for (const job of jobs) {
    try {
      console.log(`    [P2] ${job.title.slice(0, 50)}`);
      await page.goto(job.apply_link, { waitUntil: "domcontentloaded", timeout: 30_000 });
      await sleep(1500, 2500);

      const bodyText = await page.evaluate(() =>
        document.body?.innerText?.toLowerCase() || ""
      ).catch(() => "");

      const expRange = extractYearsFromText(bodyText);
      if (!expRange) { console.log(`    [P2] No exp info — leaving neutral`); continue; }

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
  const NOISE = new Set(["time","hands","enterprise","team","good","strong","experience","knowledge","skills"]);
  const seen  = new Set();
  const out   = [];
  for (const kw of keywords) {
    const clean = kw.replace(/\n/g, " ").trim();
    const lower = clean.toLowerCase();
    if (seen.has(lower)) continue;
    if (clean.split(" ").length === 1 && NOISE.has(lower)) continue;
    if (!VALID.some((v) => lower.includes(v))) continue;
    seen.add(lower);
    out.push(clean);
  }
  return out.length ? out : ["data analyst"];
}


module.exports = { collectIndeedJobs };
