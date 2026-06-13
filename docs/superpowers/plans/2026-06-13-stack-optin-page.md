# /stack Opt-in Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `hmficmarketing.com/stack`, the Notebook Hybrid opt-in page that captures emails into Kit and delivers the "5 Prompts" PDF, plus a minimal `/privacy` page.

**Architecture:** A self-contained Astro page (`src/pages/stack.astro`) with scoped styles and progressive-enhancement client JS, posting to a new Vercel serverless function (`api/stack-optin.js`, CommonJS) that verifies Cloudflare Turnstile, upserts + tags the subscriber in Kit (v4 API), and sends the delivery email via Resend. Delivery never blocks on the Kit write (fail-open). The page is mobile-first because traffic arrives from mobile carousels.

**Tech Stack:** Astro 4 (static output, `@astrojs/vercel/static`), Vercel serverless functions (CommonJS), Resend (already a dep), Cloudflare Turnstile (already in use, site key `0x4AAAAAAC1dOB7XQ5M40uE6`), Kit v4 REST API (`https://api.kit.com/v4`, header `X-Kit-Api-Key`), Playwright for page E2E, Node built-in `node:test` for endpoint logic. Meta Pixel `318856247215986`.

**Reference files (read before starting):**
- Spec: `docs/superpowers/specs/2026-06-13-stack-optin-page-design.md`
- Approved visual mockup (copy exact inline style values from here): `.superpowers/brainstorm/86763-1781296500/content/full-page.html`
- Locked copy source of truth: `/Users/hmfic/Code/Vault/HMFIC Marketing/List Build/Opt-in Page Copy v1.md`
- Existing endpoint pattern to mirror: `api/submit.js`
- Existing Turnstile usage: `src/pages/index.astro:33,442`

**Voice rules (apply to any copy you touch):** no em dashes, contractions OK, no AI buzzwords. Do not rewrite the locked copy.

---

## File Structure

- **Create** `src/pages/stack.astro` — the page (head, 7 sections, scoped `<style>`, client `<script>` for submit + success swap + Lead event)
- **Create** `api/stack-optin.js` — opt-in serverless function (CommonJS, exports handler + pure `validateOptin`)
- **Create** `src/pages/privacy.astro` — minimal privacy page
- **Create** `playwright.config.ts` — Playwright config (none exists yet)
- **Create** `tests/stack.spec.ts` — page E2E tests
- **Create** `tests/stack-optin.test.mjs` — endpoint logic tests (node:test)
- **Create** `public/downloads/5-prompts-pack-PLACEHOLDER.pdf` — placeholder so delivery link resolves in testing (real PDF swapped in at launch)

---

## Task 1: Playwright config + page shell

**Files:**
- Create: `playwright.config.ts`
- Create: `src/pages/stack.astro`
- Create: `tests/stack.spec.ts`

- [ ] **Step 1: Write Playwright config**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: { baseURL: 'http://localhost:4321' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
});
```

- [ ] **Step 2: Write the failing test**

Create `tests/stack.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('stack page loads with title and Meta pixel', async ({ page }) => {
  await page.goto('/stack');
  await expect(page).toHaveTitle(/5 prompts/i);
  const pixel = await page.content();
  expect(pixel).toContain("fbq('init', '318856247215986')");
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx playwright test tests/stack.spec.ts --project=desktop`
Expected: FAIL — page `/stack` 404s (file does not exist yet).

- [ ] **Step 4: Create the page shell**

Create `src/pages/stack.astro`:

```astro
---
// src/pages/stack.astro — "5 Prompts" lead magnet opt-in. Notebook Hybrid design.
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>5 prompts to build a brand voice and write copy like a 7-figure agency | HMFIC</title>
  <meta name="description" content="The 5 fine-tuned operating prompts I run inside my agency. Brand voice, ad copy, hooks, and email in under 30 minutes." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Caveat:wght@600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <!-- Meta Pixel -->
  <script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '318856247215986');
  fbq('track', 'PageView');
  </script>
  <noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=318856247215986&ev=PageView&noscript=1" /></noscript>
  <!-- Cloudflare Turnstile -->
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
</head>
<body>
  <main class="stack">
    <!-- sections added in later tasks -->
  </main>

  <style>
    :root {
      --paper: #fdfdfb;
      --paper-alt: #f7f6f2;
      --ink: #111;
      --ink-soft: #555;
      --red: #e13728;
      --line: #e5e3da;
    }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; color: var(--ink); background: var(--paper-alt); }
    .stack { max-width: 760px; margin: 0 auto; background: var(--paper); }
  </style>
</body>
</html>
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx playwright test tests/stack.spec.ts --project=desktop`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts src/pages/stack.astro tests/stack.spec.ts
git commit -m "feat(stack): scaffold opt-in page shell + playwright config"
```

---

## Task 2: Hero section

**Files:**
- Modify: `src/pages/stack.astro` (replace the `<!-- sections added in later tasks -->` comment)
- Modify: `tests/stack.spec.ts`

- [ ] **Step 1: Add the failing test**

Append to `tests/stack.spec.ts`:

```ts
test('hero has headline, handwritten annotation, and an email form', async ({ page }) => {
  await page.goto('/stack');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('7-figure agency');
  await expect(page.locator('.hero-note')).toContainText('not screenshots');
  const form = page.locator('form.optin-form').first();
  await expect(form.locator('input[type="email"]')).toBeVisible();
  await expect(form.locator('button[type="submit"]')).toContainText('send me the prompts');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/stack.spec.ts -g "hero has headline" --project=desktop`
Expected: FAIL — no `h1`/`.hero-note`/`form.optin-form` yet.

- [ ] **Step 3: Implement the hero**

Replace `<!-- sections added in later tasks -->` in `src/pages/stack.astro` with the hero. Copy exact style values from the mockup HERO block in `.superpowers/brainstorm/86763-1781296500/content/full-page.html`. Use the reusable form partial markup below (it gets reused verbatim in the final CTA, Task 5):

```html
<section class="hero">
  <div class="hero-margin"></div>
  <div class="eyebrow">HMFIC Marketing</div>
  <h1>5 prompts to build a brand voice and write copy like a <span class="hl">7-figure agency</span>.</h1>
  <p class="hero-sub">Skip the cookie-cutter prompts everyone else is shipping. These are the fine-tuned operating prompts from inside my agency. Brand voice, ad copy, hooks, and email in under 30 minutes.</p>
  <p class="hero-note">the actual prompts, not screenshots &#8600;</p>
  <form class="optin-form" data-source="hero">
    <input type="hidden" name="source" value="stack-hero" />
    <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true" />
    <input type="email" name="email" required placeholder="you@yourbusiness.com" aria-label="Email address" />
    <button type="submit">Yes, send me the prompts.</button>
    <div class="cf-turnstile" data-sitekey="0x4AAAAAAC1dOB7XQ5M40uE6" data-theme="light"></div>
    <p class="form-msg" role="status" aria-live="polite"></p>
  </form>
</section>
```

Add to the `<style>` block (exact numeric values from mockup; key rules shown):

```css
.hero { position: relative; padding: 72px 64px 64px; background: var(--paper);
  background-image: repeating-linear-gradient(transparent, transparent 31px, #eceae2 32px); }
.hero-margin { position: absolute; top: 0; bottom: 0; left: 44px; width: 1px; background: rgba(225,55,40,0.18); }
.eyebrow { font-size: 12px; letter-spacing: 0.14em; color: #999; text-transform: uppercase; font-weight: 600; }
.hero h1 { font-size: 40px; font-weight: 800; line-height: 1.15; letter-spacing: -0.02em; margin: 30px 0 0; }
.hl { background: linear-gradient(104deg, rgba(0,0,0,0) 0.9%, rgba(225,55,40,0.22) 2.4%, rgba(225,55,40,0.28) 70%, rgba(0,0,0,0) 98%); padding: 0 3px; }
.hero-sub { font-size: 17px; color: var(--ink-soft); line-height: 1.6; margin-top: 18px; max-width: 560px; }
.hero-note { font-family: Caveat, cursive; font-size: 24px; color: var(--red); transform: rotate(-2deg); margin-top: 18px; }
.optin-form { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; max-width: 540px; }
.optin-form .hp { position: absolute; left: -9999px; }
.optin-form input[type=email] { flex: 1; min-width: 220px; border: 1.5px solid #ccc; border-radius: 8px; padding: 14px 18px; font-size: 15px; }
.optin-form button { background: var(--red); color: #fff; border: none; border-radius: 8px; padding: 14px 22px; font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 14px -4px rgba(225,55,40,0.5); }
.optin-form .cf-turnstile { flex-basis: 100%; }
.form-msg { flex-basis: 100%; margin: 4px 0 0; font-size: 14px; color: var(--ink-soft); min-height: 18px; }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/stack.spec.ts -g "hero has headline" --project=desktop`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/stack.astro tests/stack.spec.ts
git commit -m "feat(stack): hero section with opt-in form"
```

---

## Task 3: Prompt cards section

**Files:**
- Modify: `src/pages/stack.astro`
- Modify: `tests/stack.spec.ts`

- [ ] **Step 1: Add the failing test**

Append to `tests/stack.spec.ts`:

```ts
test('renders all 5 prompt cards numbered 01-05', async ({ page }) => {
  await page.goto('/stack');
  const cards = page.locator('.prompt-card');
  await expect(cards).toHaveCount(5);
  await expect(cards.first()).toContainText('customer avatar');
  await expect(cards.nth(4)).toContainText('four platforms');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/stack.spec.ts -g "5 prompt cards" --project=desktop`
Expected: FAIL — 0 `.prompt-card` elements.

- [ ] **Step 3: Implement the section**

Add after the hero `</section>`. Use the copy verbatim from `Opt-in Page Copy v1.md` Section 2. Each card:

```html
<section class="section section-alt">
  <h2>What you'll have in 30 minutes</h2>
  <p class="section-sub">Five prompts. Each one paste-and-go. Each one tested on a real DTC brand before this pack shipped.</p>
  <div class="prompt-list">
    <div class="prompt-card">
      <span class="num">01</span>
      <div class="card-body">
        <h3>Your customer avatar</h3>
        <p>Paste 5 short answers about your business. Walk away with a one-page profile of your buyer: their pains, their desires, their objections, and the exact words they use about their problem. The headline-ready language alone is worth the email.</p>
      </div>
      <span class="time">5 min</span>
    </div>
    <!-- Cards 02-05: titles + copy from Opt-in Page Copy v1.md Section 2:
         02 "Ten scroll-stopping hooks" (3 min)
         03 "Three ad copy variations" (5 min)
         04 "Welcome, broadcast, sales emails" (5 min)
         05 "Repurpose any content for four platforms" (10 min)
         Copy each description verbatim from the copy doc. -->
  </div>
</section>
```

Add styles (values from mockup; `.prompt-card` rotations: nth cards ±0.3deg):

```css
.section { padding: 64px; border-top: 1px solid #e8e6de; background: var(--paper); }
.section-alt { background: var(--paper-alt); }
.section h2 { font-size: 26px; font-weight: 800; letter-spacing: -0.01em; margin: 0; }
.section-sub { font-size: 15px; color: #666; margin-top: 10px; }
.prompt-list { display: flex; flex-direction: column; gap: 18px; margin-top: 32px; }
.prompt-card { background: #fff; border: 1px solid var(--line); border-radius: 10px; padding: 24px 28px; display: flex; gap: 22px; align-items: flex-start; box-shadow: 0 6px 18px -12px rgba(40,30,10,0.18); }
.prompt-card:nth-child(odd) { transform: rotate(-0.3deg); }
.prompt-card:nth-child(even) { transform: rotate(0.25deg); }
.prompt-card .num { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--red); font-weight: 500; padding-top: 3px; }
.prompt-card h3 { font-size: 17px; font-weight: 700; margin: 0; }
.prompt-card .card-body p { font-size: 14px; color: var(--ink-soft); line-height: 1.55; margin: 6px 0 0; }
.prompt-card .time { font-family: Caveat, cursive; font-size: 19px; color: #888; white-space: nowrap; transform: rotate(-3deg); }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/stack.spec.ts -g "5 prompt cards" --project=desktop`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/stack.astro tests/stack.spec.ts
git commit -m "feat(stack): 5 prompt cards section"
```

---

## Task 4: Who-it's-for, bio, FAQ accordion, final CTA, footer

**Files:**
- Modify: `src/pages/stack.astro`
- Modify: `tests/stack.spec.ts`

- [ ] **Step 1: Add the failing test**

Append to `tests/stack.spec.ts`:

```ts
test('faq accordion is collapsed by default and opens on click', async ({ page }) => {
  await page.goto('/stack');
  const first = page.locator('.faq details').first();
  await expect(first).not.toHaveAttribute('open', '');
  await first.locator('summary').click();
  await expect(first).toHaveAttribute('open', '');
});

test('has a second opt-in form and footer privacy link', async ({ page }) => {
  await page.goto('/stack');
  await expect(page.locator('form.optin-form')).toHaveCount(2);
  await expect(page.locator('footer a[href="/privacy"]')).toBeVisible();
});

test('bio uses the real Matt photo', async ({ page }) => {
  await page.goto('/stack');
  await expect(page.locator('.bio img')).toHaveAttribute('src', '/assets/matt-holmes.jpg');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/stack.spec.ts -g "faq accordion|second opt-in|real Matt photo" --project=desktop`
Expected: FAIL — sections not present.

- [ ] **Step 3: Implement the sections**

Add the remaining sections. Copy verbatim from `Opt-in Page Copy v1.md` Sections 3-7.

Who-it's-for (3 checkmark bullets), bio (uses existing photo with the same `onerror` placeholder fallback pattern as `index.astro:76`):

```html
<section class="section">
  <h2>Who this is built for</h2>
  <ul class="checks">
    <li><span class="check">&#10003;</span> You're tired of AI slop that sounds like everybody else and isn't unique to your voice.</li>
    <li><span class="check">&#10003;</span> You want frameworks built by the people who actually wrote the playbook, fine-tuned inside the prompts. Not recycled Twitter scraps.</li>
    <li><span class="check">&#10003;</span> You'd rather have 5 prompts you can start using today than 50 cool ideas you'll never use.</li>
  </ul>
</section>

<section class="section section-alt bio">
  <h2>Who put this together</h2>
  <div class="bio-inner">
    <img src="/assets/matt-holmes.jpg" alt="Matt Holmes, HMFIC Marketing"
      onerror="this.parentElement.innerHTML='<div class=&quot;bio-ph&quot;>Matt Holmes</div>'" />
    <div class="bio-text">
      <p>I'm Matt Holmes. I run HMFIC Marketing, managing seven figures in paid ad spend across e-commerce, info-product, and service clients. These are the prompts I run every week inside the agency. Not theory. Not a course. The actual operating instructions.</p>
      <p>I built this pack because I needed it. Most "AI prompts for marketers" content online is screenshots and hype. These are the prompts themselves, formatted for paste-and-go, with worked examples so you know what good output looks like before you run them.</p>
    </div>
  </div>
</section>

<section class="section faq">
  <h2>Quick questions</h2>
  <details><summary>Free or paid Claude/ChatGPT?</summary><p>Free works. Every prompt produces real results on the free tier. Paid versions give you longer single-run outputs, but you don't need them.</p></details>
  <details><summary>How fast does the pack arrive?</summary><p>Instant. The PDF lands in your inbox the moment you submit. Check spam if you don't see it in 60 seconds.</p></details>
  <details><summary>Are these actually the prompts you use, or just freebie content?</summary><p>The actual prompts. I run them inside HMFIC every week. We tested all 5 on a real DTC brand before publishing.</p></details>
  <details><summary>What happens after I download?</summary><p>One pack now. One email a week after, with one specific prompt or operating insight I'm using. No funnel cascade, no upsell pressure. Unsubscribe in two clicks.</p></details>
  <details><summary>I'm not an agency. Does this work for me?</summary><p>Yes. The prompts work for any operator who runs their own marketing: solo founders, info-product creators, content businesses, e-commerce owners. The avatar prompt alone is worth the email if you sell anything to anyone.</p></details>
</section>

<section class="section final-cta">
  <h2>Download the pack now</h2>
  <form class="optin-form" data-source="footer">
    <input type="hidden" name="source" value="stack-footer" />
    <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true" />
    <input type="email" name="email" required placeholder="you@yourbusiness.com" aria-label="Email address" />
    <button type="submit">Yes, send me the prompts.</button>
    <div class="cf-turnstile" data-sitekey="0x4AAAAAAC1dOB7XQ5M40uE6" data-theme="light"></div>
    <p class="form-msg" role="status" aria-live="polite"></p>
  </form>
</section>

<footer>
  <p class="foot-legal">HMFIC Marketing 2026. Your email goes into Kit, our email tool. We don't sell or share it. Unsubscribe any time.</p>
  <p class="foot-links"><a href="/privacy">Privacy</a> <a href="https://hmficmarketing.com">hmficmarketing.com</a></p>
</footer>
```

Add styles (FAQ uses native `<details>`; final CTA reuses ruled-paper + centered; footer dark `#171614`). Pull exact values from the mockup's corresponding blocks.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/stack.spec.ts -g "faq accordion|second opt-in|real Matt photo" --project=desktop`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/stack.astro tests/stack.spec.ts
git commit -m "feat(stack): who-it's-for, bio, FAQ, final CTA, footer"
```

---

## Task 5: Mobile responsiveness

**Files:**
- Modify: `src/pages/stack.astro` (`<style>`)
- Modify: `tests/stack.spec.ts`

- [ ] **Step 1: Add the failing test**

Append to `tests/stack.spec.ts`:

```ts
test('mobile: hero padding tightens and email input is full-width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/stack');
  const input = page.locator('form.optin-form input[type=email]').first();
  const box = await input.boundingBox();
  expect(box!.width).toBeGreaterThan(280); // spans most of the 390px viewport
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/stack.spec.ts -g "mobile" --project=mobile`
Expected: likely FAIL — at 64px side padding the input is narrow / button wraps awkwardly.

- [ ] **Step 3: Add the media query**

Append to the `<style>` block:

```css
@media (max-width: 600px) {
  .hero { padding: 48px 22px 40px; background-image: repeating-linear-gradient(transparent, transparent 27px, #eceae2 28px); }
  .hero-margin { left: 16px; }
  .hero h1 { font-size: 30px; }
  .hero-sub { font-size: 16px; }
  .section { padding: 44px 22px; }
  .optin-form { flex-direction: column; }
  .optin-form input[type=email], .optin-form button { width: 100%; min-width: 0; }
  .prompt-card { flex-wrap: wrap; gap: 12px; padding: 20px; }
  .prompt-card .time { width: 100%; }
  .bio-inner { flex-direction: column; }
}
```

(Add `.bio-inner { display:flex; gap:28px; }` to the base styles if not already present.)

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/stack.spec.ts -g "mobile" --project=mobile`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/stack.astro tests/stack.spec.ts
git commit -m "feat(stack): mobile-first responsive styles"
```

---

## Task 6: Privacy page

**Files:**
- Create: `src/pages/privacy.astro`
- Modify: `tests/stack.spec.ts`

- [ ] **Step 1: Add the failing test**

Append to `tests/stack.spec.ts`:

```ts
test('privacy page loads and mentions Kit and unsubscribe', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/privacy/i);
  await expect(page.locator('body')).toContainText('Kit');
  await expect(page.locator('body')).toContainText('unsubscribe');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/stack.spec.ts -g "privacy page" --project=desktop`
Expected: FAIL — `/privacy` 404s.

- [ ] **Step 3: Create the page**

Create `src/pages/privacy.astro` (plain, honest, voice rules apply):

```astro
---
// src/pages/privacy.astro — minimal real privacy policy
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Privacy | HMFIC Marketing</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet" />
</head>
<body style="font-family:Inter,sans-serif;color:#111;max-width:680px;margin:0 auto;padding:64px 24px;line-height:1.6;">
  <h1 style="font-size:32px;font-weight:800;">Privacy</h1>
  <p>When you give us your email, we add it to Kit, our email tool. That's it.</p>
  <h2 style="font-size:20px;margin-top:32px;">What we collect</h2>
  <p>Your email address, and nothing else, when you opt in for a download.</p>
  <h2 style="font-size:20px;margin-top:32px;">What we do with it</h2>
  <p>We send you the thing you asked for, plus about one email a week with a prompt or operating insight we're using. We don't sell or share your email with anyone.</p>
  <h2 style="font-size:20px;margin-top:32px;">Unsubscribe</h2>
  <p>Every email has an unsubscribe link. Click it and you're out in two clicks. You can also email matt@hmficmarketing.com and we'll remove you.</p>
  <p style="margin-top:40px;"><a href="https://hmficmarketing.com" style="color:#e13728;">Back to hmficmarketing.com</a></p>
</body>
</html>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/stack.spec.ts -g "privacy page" --project=desktop`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/privacy.astro tests/stack.spec.ts
git commit -m "feat(privacy): minimal privacy policy page"
```

---

## Task 7: Opt-in endpoint — validation logic (TDD)

**Files:**
- Create: `api/stack-optin.js`
- Create: `tests/stack-optin.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `tests/stack-optin.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateOptin } from '../api/stack-optin.js';

test('rejects missing email', () => {
  assert.deepEqual(validateOptin({}), { ok: false, error: 'Missing email' });
});

test('rejects malformed email', () => {
  assert.deepEqual(validateOptin({ email: 'not-an-email' }), { ok: false, error: 'Invalid email' });
});

test('accepts a valid email and normalizes case + whitespace', () => {
  assert.deepEqual(validateOptin({ email: '  Alice@Example.COM ' }), { ok: true, email: 'alice@example.com' });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/stack-optin.test.mjs`
Expected: FAIL — cannot find `validateOptin` export.

- [ ] **Step 3: Write the validation function + handler skeleton**

Create `api/stack-optin.js`:

```js
const { Resend } = require('resend');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateOptin(body) {
  const raw = (body.email || '').trim().toLowerCase();
  if (!raw) return { ok: false, error: 'Missing email' };
  if (!EMAIL_RE.test(raw)) return { ok: false, error: 'Invalid email' };
  return { ok: true, email: raw };
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://hmficmarketing.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};

  // Honeypot — silent accept
  if (body._gotcha) return res.status(200).json({ ok: true });

  // Turnstile
  const token = body['cf-turnstile-response'];
  if (!token) return res.status(422).json({ error: 'Spam check failed. Please refresh and try again.' });
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (secret) {
    const tr = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });
    const td = await tr.json();
    if (!td.success) {
      console.error('Turnstile rejection:', td);
      return res.status(422).json({ error: 'Spam check failed. Please refresh and try again.' });
    }
  }

  const v = validateOptin(body);
  if (!v.ok) return res.status(422).json({ error: v.error });

  // Kit + Resend fan-out added in Task 8.
  return res.status(200).json({ ok: true });
};

module.exports.validateOptin = validateOptin;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/stack-optin.test.mjs`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add api/stack-optin.js tests/stack-optin.test.mjs
git commit -m "feat(stack-optin): endpoint skeleton + email validation"
```

---

## Task 8: Endpoint — Kit upsert + tag, Resend delivery, fail-open

**Files:**
- Modify: `api/stack-optin.js`
- Modify: `tests/stack-optin.test.mjs`

- [ ] **Step 1: Write the failing test for fail-open orchestration**

The orchestration must return success when Kit fails but delivery succeeds. Extract it into a pure, injectable `deliverOptin` function so it is testable without real network calls.

Append to `tests/stack-optin.test.mjs`:

```js
import { deliverOptin } from '../api/stack-optin.js';

test('deliverOptin returns ok when Kit rejects but delivery resolves', async () => {
  const calls = [];
  const result = await deliverOptin('alice@example.com', {
    addToKit: async () => { calls.push('kit'); throw new Error('Kit down'); },
    sendDelivery: async () => { calls.push('delivery'); return { id: 'em_1' }; },
    notifyMatt: async () => { calls.push('notify'); return { id: 'em_2' }; },
  });
  assert.equal(result.ok, true);
  assert.ok(calls.includes('delivery'));
});

test('deliverOptin returns ok:false when delivery itself fails', async () => {
  const result = await deliverOptin('alice@example.com', {
    addToKit: async () => ({}),
    sendDelivery: async () => { throw new Error('Resend down'); },
    notifyMatt: async () => ({}),
  });
  assert.equal(result.ok, false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/stack-optin.test.mjs`
Expected: FAIL — no `deliverOptin` export.

- [ ] **Step 3: Implement Kit/Resend functions + deliverOptin + wire into handler**

In `api/stack-optin.js`, add the I/O functions and orchestrator, and replace the Task-7 placeholder return. Insert before `module.exports = async function handler`:

```js
const KIT_BASE = 'https://api.kit.com/v4';
const PDF_URL = 'https://hmficmarketing.com/downloads/5-prompts-pack.pdf';

async function addToKit(email) {
  const apiKey = process.env.KIT_API_KEY;
  const tagId = process.env.KIT_STACK_TAG_ID;
  if (!apiKey || !tagId) throw new Error('Kit not configured');
  // 1. Upsert subscriber
  const sub = await fetch(`${KIT_BASE}/subscribers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Kit-Api-Key': apiKey },
    body: JSON.stringify({ email_address: email }),
  });
  if (!sub.ok) throw new Error(`Kit subscriber upsert failed: ${sub.status}`);
  // 2. Apply the stack-pack tag
  const tag = await fetch(`${KIT_BASE}/tags/${tagId}/subscribers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Kit-Api-Key': apiKey },
    body: JSON.stringify({ email_address: email }),
  });
  if (!tag.ok) throw new Error(`Kit tag failed: ${tag.status}`);
  return true;
}

async function sendDelivery(email) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Resend not configured');
  const resend = new Resend(apiKey);
  return resend.emails.send({
    from: 'Matt Holmes <matt@hmficmarketing.com>',
    to: email,
    subject: 'Your 5 prompts are here',
    html: buildDeliveryHtml(),
  });
}

async function notifyMatt(email) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Resend not configured');
  const resend = new Resend(apiKey);
  return resend.emails.send({
    from: 'HMFIC Site <matt@hmficmarketing.com>',
    to: 'matt@hmficmarketing.com',
    subject: `New /stack opt-in: ${email}`,
    html: `<p>${email} just opted in for the 5 Prompts pack.</p>`,
  });
}

function buildDeliveryHtml() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;"><tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;max-width:600px;">
      <tr><td style="background:#0a0a0a;padding:32px 40px;text-align:center;"><span style="font-size:28px;font-weight:800;color:#fff;letter-spacing:2px;">HMFIC</span></td></tr>
      <tr><td style="background:#e13728;height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="padding:40px;">
        <h1 style="margin:0 0 16px;font-size:22px;color:#0a0a0a;">Here are your 5 prompts.</h1>
        <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#333;">These are the actual operating prompts I run inside the agency every week. Paste-and-go, with worked examples so you know what good output looks like.</p>
        <p style="margin:0 0 24px;"><a href="${PDF_URL}" style="background:#e13728;color:#fff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:700;font-size:16px;display:inline-block;">Download the pack</a></p>
        <p style="margin:0;font-size:16px;line-height:1.6;color:#333;">Talk soon,<br><strong>Matt Holmes</strong><br><span style="color:#888;font-size:14px;">HMFIC Marketing</span></p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

async function deliverOptin(email, deps) {
  const { addToKit, sendDelivery, notifyMatt } = deps;
  const [kitRes, deliveryRes, notifyRes] = await Promise.allSettled([
    addToKit(email), sendDelivery(email), notifyMatt(email),
  ]);
  if (kitRes.status === 'rejected') console.error('Kit error (subscriber still gets pack):', kitRes.reason);
  if (notifyRes.status === 'rejected') console.error('Notify error:', notifyRes.reason);
  if (deliveryRes.status === 'rejected') {
    console.error('Delivery FAILED:', deliveryRes.reason);
    return { ok: false };
  }
  return { ok: true };
}
```

Replace the Task-7 placeholder `return res.status(200).json({ ok: true });` (the one after validation) with:

```js
  const result = await deliverOptin(v.email, { addToKit, sendDelivery, notifyMatt });
  if (!result.ok) return res.status(502).json({ error: 'Could not send the pack. Please try again.' });
  return res.status(200).json({ ok: true });
```

Add to the bottom exports:

```js
module.exports.deliverOptin = deliverOptin;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/stack-optin.test.mjs`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add api/stack-optin.js tests/stack-optin.test.mjs
git commit -m "feat(stack-optin): Kit upsert+tag, Resend delivery, fail-open"
```

---

## Task 9: Wire forms to endpoint + success swap + Lead event

**Files:**
- Modify: `src/pages/stack.astro` (add a `<script>` before `</body>`)
- Modify: `tests/stack.spec.ts`

- [ ] **Step 1: Add the failing test (mock the API route)**

Append to `tests/stack.spec.ts`:

```ts
test('submitting the hero form swaps to a success message', async ({ page }) => {
  await page.route('**/api/stack-optin', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) }),
  );
  await page.goto('/stack');
  const form = page.locator('form.optin-form').first();
  await form.locator('input[type=email]').fill('alice@example.com');
  // Turnstile token is injected by the widget in prod; the test stubs it.
  await page.evaluate(() => {
    const f = document.querySelector('form.optin-form');
    const t = document.createElement('input');
    t.name = 'cf-turnstile-response'; t.value = 'test-token'; t.type = 'hidden';
    f.appendChild(t);
  });
  await form.locator('button[type=submit]').click();
  await expect(form.locator('.form-msg')).toContainText(/check your inbox/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/stack.spec.ts -g "swaps to a success" --project=desktop`
Expected: FAIL — no submit handler; default form POST navigates away.

- [ ] **Step 3: Add the client script**

Add before `</body>` in `src/pages/stack.astro`:

```html
<script>
  document.querySelectorAll('form.optin-form').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = form.querySelector('.form-msg');
      const btn = form.querySelector('button[type=submit]');
      const data = Object.fromEntries(new FormData(form).entries());
      if (!data['cf-turnstile-response']) {
        msg.textContent = 'Please complete the spam check and try again.';
        return;
      }
      btn.disabled = true;
      msg.textContent = 'Sending...';
      try {
        const r = await fetch('/api/stack-optin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!r.ok) throw new Error('bad status');
        if (window.fbq) fbq('track', 'Lead', { content_name: '5 Prompts Pack', source: data.source });
        form.querySelectorAll('input, button, .cf-turnstile').forEach((el) => (el.style.display = 'none'));
        msg.textContent = 'Check your inbox. The pack is on its way.';
      } catch (err) {
        btn.disabled = false;
        msg.textContent = 'Something went wrong. Please try again.';
      }
    });
  });
</script>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/stack.spec.ts -g "swaps to a success" --project=desktop`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/stack.astro tests/stack.spec.ts
git commit -m "feat(stack): wire forms to endpoint, success swap, Lead event"
```

---

## Task 10: Placeholder PDF, full test pass, build, launch-gate doc

**Files:**
- Create: `public/downloads/5-prompts-pack.pdf` (placeholder)
- Create: `docs/superpowers/plans/stack-launch-checklist.md`

- [ ] **Step 1: Add a placeholder PDF so the delivery link resolves**

```bash
mkdir -p public/downloads
printf '%%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%%%EOF\n' > public/downloads/5-prompts-pack.pdf
```

(The real PDF replaces this file at launch — same path, no code change.)

- [ ] **Step 2: Run the full endpoint + page test suites**

Run: `node --test tests/stack-optin.test.mjs && npx playwright test`
Expected: all endpoint tests PASS; all Playwright tests PASS on desktop and mobile projects.

- [ ] **Step 3: Production build check**

Run: `npm run build`
Expected: build succeeds, `/stack` and `/privacy` appear in the build output, no errors.

- [ ] **Step 4: Write the launch-gate checklist**

Create `docs/superpowers/plans/stack-launch-checklist.md`:

```markdown
# /stack Launch Checklist (do before publishing)

Code is done and tested. These are the human/config gates that remain:

- [ ] **Produce the real PDF** and replace `public/downloads/5-prompts-pack.pdf` (same filename). Prompts drafted in `Vault/HMFIC Marketing/List Build/Prompt-1..5`. Needs handwritten cover + worked examples + Meta AI bonus + compile.
- [ ] **Kit env vars in Vercel:** `KIT_API_KEY` (from Kit account settings) and `KIT_STACK_TAG_ID` (numeric ID of a tag named `stack-pack` — create the tag in Kit first, then read its ID).
- [ ] **Kit form set to single opt-in** so the "instant, lands in your inbox in 60 seconds" copy is true.
- [ ] **Confirm `RESEND_API_KEY` and `TURNSTILE_SECRET_KEY`** are already in the Vercel project (they power `api/submit.js`, so they should be).
- [ ] **Smoke test on the Vercel preview deploy:** submit a real email, confirm (a) the pack email arrives, (b) the subscriber appears in Kit with the `stack-pack` tag, (c) the Meta pixel logs a Lead event in Events Manager for pixel `318856247215986`.
- [ ] **Optional:** add `/stack` to any nav or link it from the carousel bio.

## Deferred to v2 (not in this build)
- Social-proof line ("X operators downloaded this") once real download numbers exist.
- A/B test of headline/subhead alternates (in `Opt-in Page Copy v1.md` Section 1).
```

- [ ] **Step 5: Commit**

```bash
git add public/downloads/5-prompts-pack.pdf docs/superpowers/plans/stack-launch-checklist.md
git commit -m "chore(stack): placeholder PDF + launch-gate checklist"
```

---

## Self-Review Notes

- **Spec coverage:** page design (Tasks 1-5), copy verbatim (Tasks 2-4), separate endpoint (Tasks 7-8), Kit upsert+tag single-opt-in (Task 8 + checklist), fail-open delivery (Task 8), privacy page (Task 6), pixel `318856247215986` PageView + Lead (Tasks 1, 9), mobile-first (Task 5), launch gates incl. PDF/Kit/photo (Task 10). Social-proof + A/B explicitly deferred (Task 10 checklist).
- **Photo:** spec said placeholder; build uses the real existing `/assets/matt-holmes.jpg` with the repo's standard `onerror` fallback — better than a placeholder, noted here as an intentional improvement over the spec.
- **Type/name consistency:** `validateOptin` and `deliverOptin` signatures match across Tasks 7-8; form field names (`email`, `_gotcha`, `source`, `cf-turnstile-response`) consistent across page (Tasks 2,4) and endpoint (Tasks 7-8) and client script (Task 9).
- **PDF URL:** endpoint links to `/downloads/5-prompts-pack.pdf`; placeholder created at that exact path in Task 10; real file swaps in at launch with no code change.
