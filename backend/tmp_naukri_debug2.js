const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-blink-features=AutomationControlled'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Referer': 'https://www.google.com/',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Dest': 'document',
    'Sec-CH-UA': '"Chromium";v="124", "Google Chrome";v="124", "Not:A-Brand";v="99"',
    'Sec-CH-UA-Mobile': '?0',
    'Sec-CH-UA-Platform': '"Windows"',
  });
  const ANTI_BOT_SCRIPT = `
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'plugins', { get: () => [1,2,3,4,5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US','en'] });
    Object.defineProperty(navigator, 'vendor', { get: () => 'Google Inc.' });
    Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 4 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
    Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 0 });
    Object.defineProperty(navigator, 'userAgentData', { get: () => ({ brands: [{ brand: 'Chromium', version: '124' }, { brand: 'Google Chrome', version: '124' }], mobile: false, platform: 'Windows' }) });
    window.chrome = { runtime: {}, loadTimes: () => ({}) };
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) =>
      parameters.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters);
  `;
  await page.evaluateOnNewDocument(ANTI_BOT_SCRIPT);
  await page.goto('https://www.naukri.com/data-analyst-jobs-in-bangalore?experience=0&to=1&jobAge=7', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((resolve) => setTimeout(resolve, 5000));
  console.log('title:', await page.title());
  console.log('url:', page.url());
  console.log('content length:', (await page.content()).length);
  const countResults = await page.evaluate(() => {
    const selectors = [
      "article[class*='job']",
      "div[class*='job']",
      "[data-job-id]",
      "[class*='jobCard']",
      "[class*='jobTuple']",
    ];
    return selectors.map((sel) => ({ selector: sel, count: document.querySelectorAll(sel).length }));
  });
  console.log('counts:', JSON.stringify(countResults, null, 2));
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 400));
  console.log('bodyText:', bodyText);
  await browser.close();
})();
