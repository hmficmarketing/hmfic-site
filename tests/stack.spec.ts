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
