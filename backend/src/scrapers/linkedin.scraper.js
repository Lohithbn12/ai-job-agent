/**
 * scrapers/linkedin.scraper.js
 * ──────────────────────────────────────────────────────────────────────────
 * Fetches LinkedIn public job listings via their guest JSON API.
 * No puppeteer needed — avoids Render IP blocks and 120s timeouts.
 * ──────────────────────────────────────────────────────────────────────────
 */

"use strict";

const https = require("https");
const {
  extractYearsFromText,
  formatExpRequired,
  checkExpMismatch,
  getUserExpRange,
} = require("../utils/expParser");

const EXP_CODE_MAP = {
  "0-1":  "2",
  "1-3":  "2,3",
  "3-5":  "3,4",
  "5-10": "4",
  "10+":  "5,6",
};

// ── Simple HTTPS GET helper ───────────────────────────────────────────────────
function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        ...headers,
      },
    };
    https.get(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    }).on("error", reject);
  });
}

// ── Strip HTML tags ───────────────────────────────────────────────────────────
function stripHtml(str = "") {
  return str.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// ── Main export ───────────────────────────────────────────────────────────────
async function collectLinkedinJobs(keywords, experienceLevel = "0-1", location = "") {
  const { min: userMin, max: userMax } = getUserExpRange(experienceLevel);
  const expCodes = EXP_CODE_MAP[experienceLevel] || "2";
  const cleanKws = cleanKeywords_(keywords);
  const locParam = location.split(",")[0].trim();

  console.log(`[LinkedIn] Keywords: ${cleanKws} | Exp: ${experienceLevel} | Location: ${location}`);

  const jobs = [];

  for (const keyword of cleanKws) {
    try {
      // LinkedIn's public guest search API — no login required
      const url =
        `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search` +
        `?keywords=${encodeURIComponent(keyword)}` +
        `&f_E=${encodeURIComponent(expCodes)}` +
        `&sortBy=DD` +
        `&f_JT=F%2CP%2CC` +
        (locParam ? `&location=${encodeURIComponent(locParam)}` : "") +
        `&start=0`;

      console.log(`[LinkedIn] URL: ${url}`);

      const { status, body } = await httpsGet(url, {
        "Referer": "https://www.linkedin.com/jobs/search/",
        "X-Requested-With": "XMLHttpRequest",
      });

      if (status !== 200 || !body.trim()) {
        console.log(`[linkedin] ✗ HTTP ${status} — skipping`);
        continue;
      }

      // Response is HTML fragments of job cards
      const cardRegex = /<li[^>]*>([\s\S]*?)<\/li>/g;
      let match;
      const found = [];

      while ((match = cardRegex.exec(body)) !== null && found.length < 15) {
        const html = match[1];

        // Title
        const titleMatch = html.match(/class="[^"]*base-search-card__title[^"]*"[^>]*>([\s\S]*?)<\/h3>/);
        const title = stripHtml(titleMatch?.[1] || "");

        // Company
        const companyMatch = html.match(/class="[^"]*base-search-card__subtitle[^"]*"[^>]*>([\s\S]*?)<\/(?:h4|a|div)>/);
        const company = stripHtml(companyMatch?.[1] || "");

        // Location
        const locMatch = html.match(/class="[^"]*job-search-card__location[^"]*"[^>]*>([\s\S]*?)<\/span>/);
        const loc = stripHtml(locMatch?.[1] || "");

        // Link
        const linkMatch = html.match(/href="(https:\/\/www\.linkedin\.com\/jobs\/view\/[^"?]+)/);
        const link = linkMatch?.[1] || "";

        // Posted time
        const timeMatch = html.match(/datetime="([^"]+)"/);
        const postedAt = timeMatch?.[1] || "";

        // Easy Apply
        const easyApply = /easy.apply/i.test(html);

        if (!title || !link) continue;

        const snippet = stripHtml(html).toLowerCase();
        const expRange    = extractYearsFromText(snippet);
        const expReq      = formatExpRequired(expRange);
        const expVerified = expRange !== null;
        const { hardDrop, mismatch, hardMismatch } = checkExpMismatch(expRange, userMin, userMax);

        if (hardDrop) {
          console.log(`  [P1] Hard-drop '${title}': ${expReq}`);
          continue;
        }

        const ago = postedAt ? `${postedAt}` : "unknown";
        console.log(
          `  ${expVerified ? "✅[P1]" : "🔍[P2]"} ${title} @ ${company}` +
          ` | ${loc} | ${ago} | req: ${expReq || "unknown"} | EasyApply:${easyApply}`
        );

        found.push({
          title,
          company,
          location:          loc,
          salary:            "",
          experience_level:  experienceLevel,
          exp_required:      expReq,
          exp_mismatch:      mismatch,
          exp_hard_mismatch: hardMismatch,
          exp_verified:      expVerified,
          apply_link:        link,
          easy_apply:        easyApply,
          source:            "LinkedIn",
        });
      }

      console.log(`[LinkedIn] Total: ${found.length} jobs`);
      jobs.push(...found);

    } catch (err) {
      console.log(`[linkedin] ✗ Error: ${err.message}`);
    }

    // Polite delay between keywords
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));
  }

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

module.exports = { collectLinkedinJobs };
