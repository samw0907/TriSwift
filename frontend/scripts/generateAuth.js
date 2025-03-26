const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const AUTH_JSON_PATH = path.resolve('auth.json');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("🌐 Navigating to login page...");
  await page.goto('https://triswift-frontend.fly.dev/login');

  await page.fill('input[name="email"]', 'seeduser@example.com');
  await page.fill('input[name="password"]', 'password123');

  console.log("🔐 Submitting login form...");
  await page.click('button[type="submit"]');
  await page.waitForURL('**/home', { timeout: 10000 });

  const currentURL = page.url();
  if (!currentURL.includes('/home')) {
    console.error(`❌ Login failed or did not redirect to /home. Current URL: ${currentURL}`);
    await browser.close();
    process.exit(1);
  }

  console.log("✅ Logged in successfully. Saving storage state...");
  await context.storageState({ path: AUTH_JSON_PATH });
  
  await browser.close();

  console.log('✅ Auth state saved to auth.json');
})();
