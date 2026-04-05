/**
 * services/chromeHelper.js
 * ──────────────────────────────────────────────────────────────────────────
 * Puppeteer browser factory — works locally AND on Render/cloud servers.
 *
 * Uses @sparticuz/chromium for server environments (Render, Railway, Lambda)
 * Falls back to regular puppeteer for local development.
 *
 * Install dependencies:
 *   npm install puppeteer-core @sparticuz/chromium
 *   npm uninstall puppeteer   (if switching fully)
 *
 * Or keep both and control via env:
 *   PUPPETEER_USE_SYSTEM_CHROME=true  → uses local Chrome (dev)
 *   (default)                         → uses @sparticuz/chromium (server)
 * ──────────────────────────────────────────────────────────────────────────
 */

"use strict";

const IS_PRODUCTION = process.env.NODE_ENV === "production" ||
                      !!process.env.RENDER ||
                      !!process.env.RAILWAY_ENVIRONMENT;

// ── Lazy-load the right puppeteer + chromium ──────────────────────────────────
let _puppeteer;
let _chromium;

function getPuppeteer() {
  if (!_puppeteer) {
    try {
      // Try puppeteer-core first (recommended for servers)
      _puppeteer = require("puppeteer-core");
    } catch {
      // Fall back to full puppeteer (local dev)
      _puppeteer = require("puppeteer");
    }
  }
  return _puppeteer;
}

function getChromium() {
  if (!_chromium) {
    try {
      _chromium = require("@sparticuz/chromium");
    } catch {
      _chromium = null;
    }
  }
  return _chromium;
}

// ── Launch args for server environments ───────────────────────────────────────
const SERVER_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--no-zygote",
  "--single-process",
  "--disable-extensions",
  "--disable-notifications",
  "--window-size=1920,1080",
  "--disable-blink-features=AutomationControlled",
  "--disable-infobars",
  "--ignore-certificate-errors",
  "--disable-web-security",
  "--allow-running-insecure-content",
];

// ── Launch args for local development ─────────────────────────────────────────
const LOCAL_ARGS = [
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

// ── Anti-bot script ───────────────────────────────────────────────────────────
const ANTI_BOT_SCRIPT = `
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

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
 * Launch a Puppeteer browser.
 * Auto-detects environment and uses appropriate Chrome binary.
 *
 * @returns {Promise<import('puppeteer-core').Browser>}
 */
async function makeBrowser() {
  const puppeteer = getPuppeteer();
  const chromium  = getChromium();

  let launchOptions;

  if (IS_PRODUCTION && chromium) {
    // ── Server / Render / Railway ─────────────────────────────────────────
    console.log("  [Chrome] Using @sparticuz/chromium (server mode)");

    // @sparticuz/chromium v120+ supports this
    chromium.setHeadlessMode = true;
    chromium.setGraphicsMode  = false;

    launchOptions = {
      args:            [...chromium.args, ...SERVER_ARGS],
      defaultViewport: chromium.defaultViewport || VIEWPORT,
      executablePath:  await chromium.executablePath(),
      headless:        chromium.headless ?? true,
      ignoreHTTPSErrors: true,
    };
  } else if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    // ── Explicit path set in env (e.g. /usr/bin/chromium-browser) ────────
    console.log(`  [Chrome] Using executable: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
    launchOptions = {
      headless:          true,
      args:              SERVER_ARGS,
      executablePath:    process.env.PUPPETEER_EXECUTABLE_PATH,
      defaultViewport:   VIEWPORT,
      ignoreHTTPSErrors: true,
    };
  } else {
    // ── Local development — bundled Chromium ──────────────────────────────
    const headless = process.env.PUPPETEER_HEADLESS !== "false";
    console.log(`  [Chrome] Using bundled Chromium (headless=${headless})`);
    launchOptions = {
      headless,
      args:              LOCAL_ARGS,
      defaultViewport:   VIEWPORT,
      ignoreHTTPSErrors: true,
    };
  }

  const browser = await puppeteer.launch(launchOptions);
  console.log("  [Chrome] Browser launched ✓");
  return browser;
}


// ── makeContext ───────────────────────────────────────────────────────────────

/**
 * Create an isolated incognito BrowserContext.
 *
 * @param {import('puppeteer-core').Browser} browser
 * @returns {Promise<import('puppeteer-core').BrowserContext>}
 */
async function makeContext(browser) {
  return browser.createBrowserContext();
}


// ── makePage ──────────────────────────────────────────────────────────────────

/**
 * Open a new Page with realistic headers and optional anti-bot patches.
 *
 * @param {import('puppeteer-core').BrowserContext} context
 * @param {object} options
 * @param {boolean} [options.skipAntiBot=false]
 * @returns {Promise<import('puppeteer-core').Page>}
 */
async function makePage(context, options = {}) {
  const page = await context.newPage();

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

  // Skip anti-bot on server (evaluateOnNewDocument can be unstable on some builds)
  const skipAntiBot = options.skipAntiBot ?? IS_PRODUCTION;
  if (!skipAntiBot) {
    await page.evaluateOnNewDocument(ANTI_BOT_SCRIPT);
  }

  // Increased timeouts for slow server environments
  page.setDefaultNavigationTimeout(IS_PRODUCTION ? 60_000 : 30_000);
  page.setDefaultTimeout(IS_PRODUCTION ? 30_000 : 15_000);

  return page;
}


// ── withBrowser ───────────────────────────────────────────────────────────────

/**
 * Run an async function with a browser, guaranteed cleanup.
 *
 * @param {(browser: import('puppeteer-core').Browser) => Promise<T>} fn
 * @returns {Promise<T>}
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
 *
 * @param {import('puppeteer-core').Browser} browser
 * @param {(page: import('puppeteer-core').Page) => Promise<T>} fn
 * @param {object} [options]
 * @returns {Promise<T>}
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


// ── sleep ─────────────────────────────────────────────────────────────────────

/**
 * Async sleep with optional random jitter.
 * Automatically scales up on production for slower server environments.
 *
 * @param {number} minMs
 * @param {number} [maxMs]
 * @returns {Promise<void>}
 */
function sleep(minMs, maxMs) {
  // Add 50% extra wait time on production servers
  const scale = IS_PRODUCTION ? 1.5 : 1;
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
