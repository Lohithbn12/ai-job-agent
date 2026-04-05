const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-blink-features=AutomationControlled'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  });
  const url = 'https://www.foundit.in/srp/results?query=Data%20Analyst&experienceRanges=0~1&sort=1&limit=15&locationPreferences=Bangalore';
  console.log('url:', url);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((resolve) => setTimeout(resolve, 6000));
  console.log('title:', await page.title());
  console.log('url after:', page.url());
  const counts = await page.evaluate(() => {
    const selectors = [
      '.jobCard',
      '.srpJob',
      '[class*=\'jobCard\']',
      '.cardContainer',
      '[class*=\'card-container\']',
      'article',
      '[data-job-id]',
      'div[class*=\'job\']',
    ];
    return selectors.map((sel) => ({ selector: sel, count: document.querySelectorAll(sel).length }));
  });
  console.log('counts:', JSON.stringify(counts, null, 2));
  const sample = await page.evaluate(() => {
    const card = document.querySelector('.cardContainer');
    if (!card) return null;
    const parent = card.parentElement;
    const linkEl = card.querySelector('a[href*="/job-detail"], a[href*="foundit.in"], a') || parent?.querySelector('a');
    const allA = card.querySelectorAll('a');
    const parentA = parent?.tagName === 'A' ? parent : null;
    const cardAttrs = Array.from(card.attributes).map(attr => ({ name: attr.name, value: attr.value }));
    const parentAttrs = Array.from(parent.attributes).map(attr => ({ name: attr.name, value: attr.value }));
    return {
      title: card.querySelector('.jobTitle')?.textContent.trim() || null,
      company: card.querySelector('.companyName p')?.textContent.trim() || null,
      location: card.querySelector('.details.location')?.textContent.trim() || null,
      experience: card.querySelector('.experienceSalary .details')?.textContent.trim() || null,
      link: linkEl?.href || parentA?.href || null,
      parentTag: parent?.tagName,
      parentClass: parent?.className,
      cardAttrs,
      parentAttrs,
      allLinks: Array.from(allA).map(a => ({ href: a.href, text: a.textContent.trim() })),
      snippet: card.textContent.trim().slice(0, 400),
    };
  });
  console.log('sample card:', JSON.stringify(sample, null, 2));
  console.log('body snippet:', await page.evaluate(() => document.body.innerText.slice(0, 400)));
  await browser.close();
})();
