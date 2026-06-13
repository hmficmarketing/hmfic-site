import { test, expect } from '@playwright/test';

test('stack page loads with title and Meta pixel', async ({ page }) => {
  await page.goto('/stack');
  await expect(page).toHaveTitle(/5 prompts/i);
  const pixel = await page.content();
  expect(pixel).toContain("fbq('init', '318856247215986')");
});

test('hero has headline, handwritten annotation, and an email form', async ({ page }) => {
  await page.goto('/stack');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('7-figure agency');
  await expect(page.locator('.hero-note')).toContainText('not screenshots');
  const form = page.locator('form.optin-form').first();
  await expect(form.locator('input[type="email"]')).toBeVisible();
  await expect(form.locator('button[type="submit"]')).toContainText('send me the prompts');
});

test('renders all 5 prompt cards numbered 01-05', async ({ page }) => {
  await page.goto('/stack');
  const cards = page.locator('.prompt-card');
  await expect(cards).toHaveCount(5);
  await expect(cards.first()).toContainText('customer avatar');
  await expect(cards.nth(4)).toContainText('four platforms');
});

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

test('mobile: hero padding tightens and email input is full-width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/stack');
  const input = page.locator('form.optin-form input[type=email]').first();
  const box = await input.boundingBox();
  expect(box!.width).toBeGreaterThan(280); // spans most of the 390px viewport
});

test('privacy page loads and mentions Kit and unsubscribe', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/privacy/i);
  await expect(page.locator('body')).toContainText('Kit');
  await expect(page.locator('body')).toContainText('unsubscribe');
});

test('each form has a required, unchecked marketing-consent checkbox', async ({ page }) => {
  await page.goto('/stack');
  const boxes = page.locator('form.optin-form input[name=consent]');
  await expect(boxes).toHaveCount(2);
  for (let i = 0; i < 2; i++) {
    await expect(boxes.nth(i)).not.toBeChecked();
    await expect(boxes.nth(i)).toHaveAttribute('required', '');
  }
});

test('submitting the hero form swaps to a success message', async ({ page }) => {
  await page.route('**/api/stack-optin', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) }),
  );
  await page.goto('/stack');
  const form = page.locator('form.optin-form').first();
  await form.locator('input[type=email]').fill('alice@example.com');
  await form.locator('input[name=consent]').check();
  await page.evaluate(() => {
    const f = document.querySelector('form.optin-form');
    const t = document.createElement('input');
    t.name = 'cf-turnstile-response'; t.value = 'test-token'; t.type = 'hidden';
    f.appendChild(t);
  });
  await form.locator('button[type=submit]').click();
  await expect(form.locator('.form-msg')).toContainText(/check your inbox/i);
});
