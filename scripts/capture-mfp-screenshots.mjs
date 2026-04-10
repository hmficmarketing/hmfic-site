import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const outDir = resolve('public/case-studies/mfp');
await mkdir(outDir, { recursive: true });

const BASE = 'https://missionfirstpickleball.com';
const pages = [
  { slug: 'homepage',      url: `${BASE}/`,                 skipHeader: false },
  { slug: 'product-ethos', url: `${BASE}/pages/ethos`,      skipHeader: true  },
  { slug: 'collection',    url: `${BASE}/collections/all`,  skipHeader: true  },
  { slug: 'about',         url: `${BASE}/pages/about`,      skipHeader: true  },
  { slug: 'contact',       url: `${BASE}/pages/contact`,    skipHeader: true  },
  { slug: 'blog',          url: `${BASE}/blogs/news`,       skipHeader: true  },
];

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});

const results = [];
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const step = 400;
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        total += step;
        if (total >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
}

for (const p of pages) {
  const page = await context.newPage();
  try {
    const response = await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30_000 });
    const status = response?.status() ?? 0;
    if (status >= 400) {
      results.push({ ...p, status, captured: false });
      await page.close();
      continue;
    }
    // trigger lazy-loaded sections (footer, testimonials, etc.)
    await autoScroll(page);
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});

    // Click any visible "close" buttons (Klaviyo, cookie banners) before hiding
    await page.evaluate(() => {
      const selectors = [
        '[aria-label*="close" i]',
        '[class*="close-button"]',
        '[class*="closeButton"]',
        '.klaviyo-close-form',
      ];
      for (const sel of selectors) {
        document.querySelectorAll(sel).forEach((b) => {
          try { b.click(); } catch {}
        });
      }
    });
    await page.waitForTimeout(300);

    // Targeted hiding: only known popup containers, NOT generic fixed/overlay
    // selectors that would catch the page header.
    await page.addStyleTag({
      content: `
        div[class*="kl-private"],
        div[class*="klaviyo"],
        iframe[id*="klaviyo"],
        .klaviyo-form,
        .needsclick.kl-private-reset-css-Xuajs1,
        [data-testid="POPUP-CONTAINER"],
        div[id^="cookie"],
        div[class^="cookie-banner"],
        #shopify-chat,
        iframe[title*="chat" i],
        iframe[title*="messaging" i] {
          display: none !important;
        }
      `,
    });
    await page.waitForTimeout(300);

    const path = resolve(outDir, `${p.slug}.jpg`);
    await page.screenshot({
      path,
      type: 'jpeg',
      quality: 82,
      fullPage: true,
    });
    results.push({ ...p, status, captured: true, path });
  } catch (e) {
    results.push({ ...p, error: e.message, captured: false });
  }
  await page.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
