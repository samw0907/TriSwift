import { test, expect } from '@playwright/test';

test('Landing page should load for logged-out users', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  await page.evaluate(() => localStorage.removeItem('token'));
  await page.reload({ waitUntil: 'networkidle' });

  await page.waitForSelector('h1', { state: 'visible' });
  await expect(page.locator('h1')).toHaveText('TriSwift');

  await expect(page.locator('p').first()).toContainText('Train. Track. Triumph.');
  await expect(page.locator('button', { hasText: 'Login' })).toBeVisible();
  await expect(page.locator('button', { hasText: 'Sign Up' })).toBeVisible();
});
