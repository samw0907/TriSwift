import { test, expect } from '@playwright/test';

test.use({ storageState: undefined });

test('Landing page should load for logged-out users', async ({ page }) => {
  await page.goto('https://triswift-frontend.fly.dev');

  await expect(page.locator('h1')).toHaveText('Welcome to TriSwift');

  await expect(page.locator('p').first()).toContainText('Your all-in-one training companion for swimming, cycling, and running.');

  await expect(page.locator('button', { hasText: 'Login' })).toBeVisible();
  await expect(page.locator('button', { hasText: 'Sign Up' })).toBeVisible();
});
