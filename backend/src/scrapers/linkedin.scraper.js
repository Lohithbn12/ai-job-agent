/**
 * scrapers/linkedin.scraper.js
 * ──────────────────────────────────────────────────────────────────────────
 * Fetches LinkedIn public job listings via their guest JSON API.
 * No puppeteer needed — avoids Render IP blocks and 120s timeouts.
 *
 * Fixed:
 *   - Location fallback: if a strict city search returns 0 results (LinkedIn
 *     guest API is increasingly picky about location strings), retry with
 *     just the country ("India") before giving up.
 *   - Geo-ID map for common Indian cities: LinkedIn's guest API responds
 *     better to numeric geoId params than raw location strings.
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

// LinkedIn geoIds for common Indian metros — using these gives more reliable
// results from the guest API than raw text location strings.
const GEO_ID_MAP = {
  "bangalore":  "105214831",
  "bengaluru":  "105214831",
  "mumbai":     "102713980",
  "delhi":      "102713980",
  "hyderabad":  "106187506",
  "chennai":    "102713980",
  "pune":       "102713980",
  "kolkata":    "102713980",
  "india":      "102713980",
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
      timeout: 15000,
    };
    const req = https.get(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Request timeout")); });
  });
}

// ── Strip HTML tags ───────────────────────────────────────────────────────────
function stripHtml(str = "") {
  return str.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// ── Build LinkedIn guest API URL ──────────────────────────────────────────────
function buildUrl(keyword, expCodes, locationStr) {
  const locLower = locationStr.toLowerCase().trim();
  const geoId    = GEO_ID_MAP[locLower];

  const base =
    `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search` +
    `?keywords=${encodeURIComponent(keyword)}` +
    `&f_E=${encodeURIComponent(expCodes)}` +
    `&sortBy=DD` +
    `&f_JT=F%2CP%2CC` +
    `&start=0`;

  // Prefer geoId when available — more reliable than text location
  if (geoId) return `${base}&geoId=${geoId}`;
  if (locationStr) return `${base}&location=${encodeURIComponent(locationStr)}`;
  return base;
}

// ── Parse job cards from LinkedIn HTML response ───────────────────────────────
function parseCards(body, userMin, userMax, experienceLevel) {
  const cardRegex = /<li[^>]*>([\s\S]*?)<\/li>/g;
  let match;
  const found = [];

  while ((match = cardRegex.exec(body)) !== null && found.length < 15) {
    const html = match[1];

    const titleMatch   = html.match(/class="[^"]*base-search-card__title[^"]*"[^>]*>([\s\S]*?)<\/h3>/);
    const companyMatch = html.match(/class="[^"]*base-search-card__subtitle[^"]*"[^>]*>([\s\S]*?)<\/(?:h4|a|div)>/);
    const locMatch     = html.match(/class="[^"]*job-search-card__location[^"]*"[^>]*>([\s\S]*?)<\/span>/);
    const linkMatch    = html.match(/href="(https:\/\/www\.linkedin\.com\/jobs\/view\/[^"?]+)/);
    const timeMatch    = html.match(/datetime="([^"]+)"/);

    const title    = stripHtml(titleMatch?.[1]   || "");
    const company  = stripHtml(companyMatch?.[1] || "");
    const loc      = stripHtml(locMatch?.[1]     || "");
    const link     = linkMatch?.[1]              || "";
    const postedAt = timeMatch?.[1]              || "";
    const easyApply = /easy.apply/i.test(html);

    if (!title || !link) continue;

    const snippet     = stripHtml(html).toLowerCase();
    const expRange    = extractYearsFromText(snippet);
    const expReq      = formatExpRequired(expRange);
    const expVerified = expRange !== null;
    const { hardDrop, mismatch, hardMismatch } = checkExpMismatch(expRange, userMin, userMax);

    if (hardDrop) {
      console.log(`  [P1] Hard-drop '${title}': ${expReq}`);
      continue;
    }

    const ago = postedAt || "unknown";
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

  return found;
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
      // Primary attempt — use city/location param (or geoId if known)
      const primaryUrl = buildUrl(keyword, expCodes, locParam);
      console.log(`[LinkedIn] URL: ${primaryUrl}`);

      const { status, body } = await httpsGet(primaryUrl, {
        "Referer":          "https://www.linkedin.com/jobs/search/",
        "X-Requested-With": "XMLHttpRequest",
      });

      let found = [];

      if (status === 200 && body.trim()) {
        found = parseCards(body, userMin, userMax, experienceLevel);
      } else {
        console.log(`[linkedin] ✗ HTTP ${status} on primary — skipping`);
      }

      // FIXED: if primary returned 0 results and we had a specific city,
      // retry with just "India" as the fallback location. LinkedIn's guest
      // API frequently returns 0 for city-level queries even when jobs exist.
      if (!found.length && locParam && locParam.toLowerCase() !== "india") {
        console.log(`[LinkedIn] 0 results for "${locParam}" — retrying with India fallback`);
        const fallbackUrl = buildUrl(keyword, expCodes, "India");
        console.log(`[LinkedIn] Fallback URL: ${fallbackUrl}`);

        try {
          const fallback = await httpsGet(fallbackUrl, {
            "Referer":          "https://www.linkedin.com/jobs/search/",
            "X-Requested-With": "XMLHttpRequest",
          });
          if (fallback.status === 200 && fallback.body.trim()) {
            found = parseCards(fallback.body, userMin, userMax, experienceLevel);
            console.log(`[LinkedIn] Fallback found ${found.length} jobs`);
          }
        } catch (fallbackErr) {
          console.log(`[linkedin] Fallback error: ${fallbackErr.message}`);
        }
      }

      console.log(`[LinkedIn] Total: ${found.length} jobs`);
      jobs.push(...found);

    } catch (err) {
      console.log(`[linkedin] ✗ Error: ${err.message}`);
    }

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
