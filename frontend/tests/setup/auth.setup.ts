import { test } from '@playwright/test';

test('Setup: login and store auth.json', async ({ page }) => {
  await page.goto('https://triswift-frontend.fly.dev/login');
  await page.fill('input[name="email"]', 'seeduser@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('https://triswift-frontend.fly.dev/home', { timeout: 10000 });

  await page.context().storageState({ path: 'auth.json' });
});