/**
 * services/chromeHelper.js
 * ──────────────────────────────────────────────────────────────────────────
 * Puppeteer browser factory.
 * Production mode: uses default browser context (no incognito) to avoid
 * "Target closed" errors on memory-constrained servers like Render free tier.
 * ──────────────────────────────────────────────────────────────────────────
 */

"use strict";

const IS_PRODUCTION = process.env.NODE_ENV === "production" ||
                      !!process.env.RENDER ||
                      !!process.env.RAILWAY_ENVIRONMENT;

// ── Lazy-load puppeteer ───────────────────────────────────────────────────────
function getPuppeteer() {
  try { return require("puppeteer-core"); } catch { return require("puppeteer"); }
}

function getChromium() {
  try { return require("@sparticuz/chromium"); } catch { return null; }
}

// ── Launch args ───────────────────────────────────────────────────────────────
const BASE_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--no-zygote",
  "--single-process",
  "--disable-extensions",
  "--disable-notifications",
  "--disable-background-networking",
  "--disable-default-apps",
  "--disable-sync",
  "--disable-translate",
  "--hide-scrollbars",
  "--metrics-recording-only",
  "--mute-audio",
  "--no-first-run",
  "--safebrowsing-disable-auto-update",
  "--disable-blink-features=AutomationControlled",
  "--window-size=1280,720",
  "--ignore-certificate-errors",
];

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/124.0.0.0 Safari/537.36";

const VIEWPORT = { width: 1280, height: 720 };


// ── makeBrowser ───────────────────────────────────────────────────────────────
async function makeBrowser() {
  const puppeteer = getPuppeteer();
  const chromium  = getChromium();

  let launchOptions;

  if (IS_PRODUCTION && chromium) {
    console.log("  [Chrome] Using @sparticuz/chromium (server mode)");
    chromium.setHeadlessMode = true;
    chromium.setGraphicsMode  = false;

    launchOptions = {
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-zygote",
        "--single-process",
        "--disable-extensions",
        "--disable-blink-features=AutomationControlled",
        "--window-size=1280,720",
      ],
      defaultViewport: VIEWPORT,
      executablePath:  await chromium.executablePath(),
      headless:        true,
      ignoreHTTPSErrors: true,
      timeout: 60000,
    };
  } else if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions = {
      headless: true,
      args: BASE_ARGS,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      defaultViewport: VIEWPORT,
      ignoreHTTPSErrors: true,
    };
  } else {
    const headless = process.env.PUPPETEER_HEADLESS !== "false";
    launchOptions = {
      headless,
      args: BASE_ARGS,
      defaultViewport: VIEWPORT,
      ignoreHTTPSErrors: true,
    };
  }

  const browser = await puppeteer.launch(launchOptions);
  console.log("  [Chrome] Browser launched ✓");
  return browser;
}


// ── withBrowser ───────────────────────────────────────────────────────────────
async function withBrowser(fn) {
  const browser = await makeBrowser();
  try {
    return await fn(browser);
  } finally {
    await browser.close().catch(() => {});
    console.log("  [Chrome] Browser closed");
  }
}


// ── withPage ──────────────────────────────────────────────────────────────────
// On PRODUCTION: opens a plain new page on the default context (no incognito)
// On LOCAL: opens an incognito context per page (isolated cookies)
async function withPage(browser, fn, options = {}) {
  let page;
  let context = null;

  if (IS_PRODUCTION) {
    // Default context — avoids "Target closed" / createTarget errors
    page = await browser.newPage();
  } else {
    // Incognito context for local dev
    context = await browser.createBrowserContext();
    page    = await context.newPage();
  }

  // Setup page
  await page.setUserAgent(USER_AGENT);
  await page.setViewport(VIEWPORT);
  await page.setExtraHTTPHeaders({
    "Accept-Language":           "en-US,en;q=0.9",
    "Accept":                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Site":            "none",
    "Sec-Fetch-Mode":            "navigate",
    "Sec-Fetch-Dest":            "document",
    "Sec-CH-UA":                 '"Chromium";v="124", "Google Chrome";v="124", "Not:A-Brand";v="99"',
    "Sec-CH-UA-Mobile":          "?0",
    "Sec-CH-UA-Platform":        '"Windows"',
  });

  // Timeouts — more generous on server
  page.setDefaultNavigationTimeout(IS_PRODUCTION ? 60_000 : 30_000);
  page.setDefaultTimeout(IS_PRODUCTION ? 30_000 : 15_000);

  try {
    return await fn(page);
  } finally {
    await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
  }
}


// ── makeContext / makePage (kept for compatibility) ───────────────────────────
async function makeContext(browser) {
  return IS_PRODUCTION ? browser : browser.createBrowserContext();
}

async function makePage(context, options = {}) {
  const page = IS_PRODUCTION
    ? await context.newPage()
    : await context.newPage();
  await page.setUserAgent(USER_AGENT);
  await page.setViewport(VIEWPORT);
  page.setDefaultNavigationTimeout(IS_PRODUCTION ? 60_000 : 30_000);
  page.setDefaultTimeout(IS_PRODUCTION ? 30_000 : 15_000);
  return page;
}


// ── sleep ─────────────────────────────────────────────────────────────────────
function sleep(minMs, maxMs) {
  const scale     = IS_PRODUCTION ? 1.5 : 1;
  const scaledMin = Math.floor(minMs * scale);
  const scaledMax = maxMs ? Math.floor(maxMs * scale) : undefined;
  const ms = scaledMax
    ? Math.floor(scaledMin + Math.random() * (scaledMax - scaledMin))
    : scaledMin;
  return new Promise((resolve) => setTimeout(resolve, ms));
}


module.exports = {
  makeBrowser,
  makeContext,
  makePage,
  withBrowser,
  withPage,
  sleep,
  IS_PRODUCTION,
};
