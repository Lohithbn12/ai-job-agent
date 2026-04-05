const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--disable-gpu',
    ],
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Referer': 'https://www.google.com/',
  });
  await page.goto('https://www.naukri.com/data-analyst-jobs-in-bangalore?experience=0&to=1&jobAge=7', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((resolve) => setTimeout(resolve, 5000));
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
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 500));
  console.log('bodyText:', bodyText);
  await browser.close();
})();
