/**
 * scrapers/indeed.scraper.js
 * ──────────────────────────────────────────────────────────────────────────
 * Fetches Indeed job listings via their public search — no puppeteer.
 * Uses the RSS/JSON endpoint to avoid Render IP blocks.
 * ──────────────────────────────────────────────────────────────────────────
 */

"use strict";

const https = require("https");
const http  = require("http");
const {
  extractYearsFromText,
  formatExpRequired,
  checkExpMismatch,
  getUserExpRange,
} = require("../utils/expParser");

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
  singapore:              "sg.indeed.com",
  uae:                    "ae.indeed.com",
  "united arab emirates": "ae.indeed.com",
};

// ── HTTP GET with redirect following ─────────────────────────────────────────
function fetchUrl(url, headers = {}, redirects = 3) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate",
        ...headers,
      },
      timeout: 20000,
    }, (res) => {
      // Follow redirects
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redirects > 0) {
        const next = res.headers.location.startsWith("http")
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        resolve(fetchUrl(next, headers, redirects - 1));
        return;
      }

      // Handle gzip
      let stream = res;
      if (res.headers["content-encoding"] === "gzip") {
        const zlib = require("zlib");
        stream = res.pipe(zlib.createGunzip());
      }

      let data = "";
      stream.on("data", (c) => (data += c));
      stream.on("end", () => resolve({ status: res.statusCode, body: data }));
      stream.on("error", reject);
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Request timeout")); });
  });
}

function stripHtml(str = "") {
  return str.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

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

  for (const keyword of cleanKws) {
    try {
      // Use Indeed's RSS feed — much less likely to be blocked than the main page
      const rssUrl =
        `https://${baseDomain}/rss` +
        `?q=${encodeURIComponent(keyword)}` +
        `&explvl=${expFilter}` +
        `&sort=date` +
        (locParam ? `&l=${locParam}` : "");

      console.log(`[Indeed] RSS: ${rssUrl}`);

      const { status, body } = await fetchUrl(rssUrl, {
        "Referer": `https://${baseDomain}/`,
      });

      if (status !== 200 || !body.includes("<item>")) {
        console.log(`[indeed] RSS returned ${status} or no items — trying HTML fallback`);

        // HTML fallback
        const htmlUrl =
          `https://${baseDomain}/jobs` +
          `?q=${encodeURIComponent(keyword)}` +
          `&explvl=${expFilter}&sort=date` +
          (locParam ? `&l=${locParam}` : "");

        const fallback = await fetchUrl(htmlUrl).catch(() => ({ status: 0, body: "" }));
        if (!fallback.body || fallback.status !== 200) {
          console.log(`[indeed] ✗ HTML fallback also failed`);
          continue;
        }

        // Parse HTML job cards
        const htmlJobs = parseIndeedHTML(fallback.body, baseDomain, userMin, userMax, experienceLevel);
        jobs.push(...htmlJobs);
        console.log(`[Indeed] HTML fallback: ${htmlJobs.length} jobs`);
        continue;
      }

      // Parse RSS
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      const found = [];

      while ((match = itemRegex.exec(body)) !== null && found.length < 10) {
        const item = match[1];

        const title   = stripHtml(item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "");
        const company = stripHtml(item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || "");
        const link    = (item.match(/<link>([\s\S]*?)<\/link>/) || item.match(/<guid[^>]*>([\s\S]*?)<\/guid>/))?.[1]?.trim() || "";
        const desc    = stripHtml(item.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "").toLowerCase();
        const locRaw  = stripHtml(item.match(/<[^>]*location[^>]*>([\s\S]*?)<\/[^>]+>/i)?.[1] || location);

        if (!title || !link) continue;

        const expRange    = extractYearsFromText(desc);
        const expReq      = formatExpRequired(expRange);
        const expVerified = expRange !== null;
        const { hardDrop, mismatch, hardMismatch } = checkExpMismatch(expRange, userMin, userMax);

        if (hardDrop) {
          console.log(`  [P1] Hard-drop '${title}': ${expReq}`);
          continue;
        }

        console.log(`  ${expVerified ? "✅[P1]" : "🔍[P2]"} ${title} @ ${company} | req: ${expReq || "unknown"}`);

        found.push({
          title,
          company,
          location:          locRaw || location,
          salary:            "",
          experience_level:  experienceLevel,
          exp_required:      expReq,
          exp_mismatch:      mismatch,
          exp_hard_mismatch: hardMismatch,
          exp_verified:      expVerified,
          apply_link:        link,
          easy_apply:        false,
          source:            "Indeed",
        });
      }

      console.log(`[Indeed] ${found.length} jobs from RSS`);
      jobs.push(...found);

    } catch (err) {
      console.log(`[indeed] ✗ Error: ${err.message}`);
    }

    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));
  }

  console.log(`[Indeed] Total: ${jobs.length} jobs`);
  return jobs;
}

// ── HTML parser fallback ──────────────────────────────────────────────────────
function parseIndeedHTML(html, domain, userMin, userMax, experienceLevel) {
  const found = [];
  const cardRegex = /data-jk="([^"]+)"[\s\S]*?<h2[^>]*jobTitle[^>]*>([\s\S]*?)<\/h2>[\s\S]*?class="[^"]*companyName[^"]*"[^>]*>([\s\S]*?)<\/(?:span|a)>/g;
  let match;
  while ((match = cardRegex.exec(html)) !== null && found.length < 10) {
    const jk      = match[1];
    const title   = stripHtml(match[2]);
    const company = stripHtml(match[3]);
    const link    = `https://${domain}/viewjob?jk=${jk}`;

    if (!title) continue;

    found.push({
      title,
      company,
      location:          "",
      salary:            "",
      experience_level:  experienceLevel,
      exp_required:      null,
      exp_mismatch:      false,
      exp_hard_mismatch: false,
      exp_verified:      false,
      apply_link:        link,
      easy_apply:        false,
      source:            "Indeed",
    });
  }
  return found;
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
