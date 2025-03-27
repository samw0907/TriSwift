import { test, expect } from '@playwright/test';

test.use({ storageState: undefined });

test('Landing page should load for logged-out users', async ({ page }) => {
  await page.evaluate(() => localStorage.clear());

  await page.goto('https://triswift-frontend.fly.dev', { waitUntil: 'networkidle' });

  await page.evaluate(() => localStorage.clear());
  const token = await page.evaluate(() => localStorage.getItem('token'));
  console.log("📦 Token in localStorage:", token);

  await page.waitForSelector('h1', { state: 'visible', timeout: 10000 });
  await expect(page.locator('h1')).toHaveText('Welcome to TriSwift');

  await expect(page.locator('p').first()).toContainText('The ultimate fitness tracking app for triathletes.');
  await expect(page.locator('button', { hasText: 'Login' })).toBeVisible();
  await expect(page.locator('button', { hasText: 'Sign Up' })).toBeVisible();
});

