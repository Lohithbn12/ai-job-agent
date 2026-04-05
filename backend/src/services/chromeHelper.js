/**
 * services/chromeHelper.js
 * ──────────────────────────────────────────────────────────────────────────
 * Puppeteer browser factory.
 * Replaces Python's chrome_helper.py (Selenium + WebDriverManager).
 *
 * Key improvements over the Python version:
 *  - No WinError 5 / file-lock issues (Puppeteer manages its own binary)
 *  - Single shared browser instance per scraper call (faster)
 *  - Each scraper gets its own incognito BrowserContext (isolated cookies)
 *  - Anti-bot patches applied at context level via Page.addScriptToEvaluateOnNewDocument
 *  - Automatic browser cleanup even if scraper throws
 *
 * Exports:
 *   makeBrowser()               → Promise<Browser>
 *   makeContext(browser)        → Promise<BrowserContext>  (incognito)
 *   makePage(context)           → Promise<Page>            (patched)
 *   withBrowser(fn)             → runs fn(browser), always closes browser
 *   withPage(browser, fn)       → runs fn(page),    always closes context
 *
 * Typical scraper usage:
 *   const { withBrowser, withPage } = require('../services/chromeHelper');
 *
 *   await withBrowser(async (browser) => {
 *     await withPage(browser, async (page) => {
 *       await page.goto('https://...');
 *       // scrape
 *     });
 *   });
 * ──────────────────────────────────────────────────────────────────────────
 */

"use strict";

const puppeteer = require("puppeteer");

// ── Launch args (mirrors Python chrome_helper options) ────────────────────────
const LAUNCH_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--disable-extensions",
  "--disable-notifications",
  "--window-size=1920,1080",
  "--disable-blink-features=AutomationControlled",
  "--disable-infobars",
  "--ignore-certificate-errors",
];

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/124.0.0.0 Safari/537.36";

const VIEWPORT = {
  width: 1920,
  height: 1080,
  deviceScaleFactor: 1,
  isMobile: false,
  hasTouch: false,
};

// ── Anti-bot script injected into every new page ──────────────────────────────
const ANTI_BOT_SCRIPT = `
  // Hide webdriver flag only
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

  // Override permissions query safely when available
  const originalQuery = window.navigator.permissions?.query?.bind(window.navigator.permissions);
  if (originalQuery) {
    window.navigator.permissions.query = (parameters) =>
      parameters.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters);
  }
`;


// ── makeBrowser ───────────────────────────────────────────────────────────────

/**
 * Launch a new Puppeteer browser.
 * Reads PUPPETEER_HEADLESS from .env (default: true).
 *
 * @returns {Promise<import('puppeteer').Browser>}
 */
async function makeBrowser() {
  const headless = process.env.PUPPETEER_HEADLESS !== "false";

  const browser = await puppeteer.launch({
    headless,
    args: LAUNCH_ARGS,
    defaultViewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
  });

  console.log(`  [Chrome] Browser launched (headless=${headless})`);
  return browser;
}


// ── makeContext ───────────────────────────────────────────────────────────────

/**
 * Create an isolated incognito BrowserContext.
 * Each scraper keyword gets its own context so cookies never bleed over.
 *
 * @param {import('puppeteer').Browser} browser
 * @returns {Promise<import('puppeteer').BrowserContext>}
 */
async function makeContext(browser) {
  return browser.createBrowserContext();
}


// ── makePage ──────────────────────────────────────────────────────────────────

/**
 * Open a new Page inside a context, with:
 *  - realistic User-Agent
 *  - anti-bot JS injected before any page script runs
 *  - sensible navigation timeout
 *
 * @param {import('puppeteer').BrowserContext} context
 * @returns {Promise<import('puppeteer').Page>}
 */
async function makePage(context, options = {}) {
  const page = await context.newPage();

  // Set realistic User-Agent
  await page.setUserAgent(USER_AGENT);

  // Set viewport and realistic browser headers.
  await page.setViewport(VIEWPORT);
  await page.setExtraHTTPHeaders({
    "Accept-Language":       "en-US,en;q=0.9",
    "Accept":                "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Site":        "none",
    "Sec-Fetch-Mode":        "navigate",
    "Sec-Fetch-Dest":        "document",
    "Sec-CH-UA":             '"Chromium";v="124", "Google Chrome";v="124", "Not:A-Brand";v="99"',
    "Sec-CH-UA-Mobile":      "?0",
    "Sec-CH-UA-Platform":    '"Windows"',
  });

  // Inject anti-bot patches before ANY page JS runs, unless explicitly skipped.
  if (!options.skipAntiBot) {
    await page.evaluateOnNewDocument(ANTI_BOT_SCRIPT);
  }

  // Default navigation timeout: 30s (same feel as Python's implicit waits)
  page.setDefaultNavigationTimeout(30_000);
  page.setDefaultTimeout(15_000);

  return page;
}


// ── withBrowser ───────────────────────────────────────────────────────────────

/**
 * Run an async function with a browser, guaranteed cleanup.
 *
 * @param {(browser: import('puppeteer').Browser) => Promise<T>} fn
 * @returns {Promise<T>}
 *
 * @example
 * const jobs = await withBrowser(async (browser) => {
 *   // use browser
 *   return [...];
 * });
 */
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

/**
 * Run an async function with a page inside a fresh incognito context.
 * Closes the context (and its page) when done.
 *
 * @param {import('puppeteer').Browser} browser
 * @param {(page: import('puppeteer').Page) => Promise<T>} fn
 * @returns {Promise<T>}
 *
 * @example
 * await withBrowser(async (browser) => {
 *   const results = await withPage(browser, async (page) => {
 *     await page.goto('https://naukri.com/...');
 *     return scrapeCards(page);
 *   });
 * });
 */
async function withPage(browser, fn, options = {}) {
  const context = await makeContext(browser);
  const page    = await makePage(context, options);
  try {
    return await fn(page);
  } finally {
    await context.close().catch(() => {});
  }
}


// ── sleep helper (replaces Python's time.sleep + random.uniform) ──────────────

/**
 * Async sleep with optional random jitter.
 *
 * @param {number} minMs   minimum wait in milliseconds
 * @param {number} [maxMs] if provided, waits a random time between min and max
 * @returns {Promise<void>}
 *
 * @example
 * await sleep(2000, 3500);  // wait 2–3.5 seconds
 */
function sleep(minMs, maxMs) {
  const ms = maxMs
    ? Math.floor(minMs + Math.random() * (maxMs - minMs))
    : minMs;
  return new Promise((resolve) => setTimeout(resolve, ms));
}


module.exports = {
  makeBrowser,
  makeContext,
  makePage,
  withBrowser,
  withPage,
  sleep,
};
