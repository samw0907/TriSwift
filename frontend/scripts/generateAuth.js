const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { chromium } = require('playwright');

const AUTH_JSON_PATH = path.resolve('auth.json');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:3000/login');

  await page.fill('input[name="email"]', 'seeduser@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await page.waitForTimeout(2000);

  await context.storageState({ path: AUTH_JSON_PATH });
  await browser.close();

  console.log('✅ Auth state saved to auth.json');
})();
