import { test, expect } from '@playwright/test';
import fs from 'fs';

// ✅ Load authentication token from file
let authToken: string | null = null;
if (fs.existsSync('auth_token.json')) {
  authToken = JSON.parse(fs.readFileSync('auth_token.json', 'utf8')).token;
  console.log("🔑 Loaded auth token for session tests:", authToken);
} else {
  console.log("❌ No auth token found. Ensure login test runs first.");
}

// ✅ Use the authentication state
test.use({ storageState: 'auth.json' });

test.describe('Session Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    if (!authToken) {
      test.skip("❌ Skipping session tests due to missing authentication token.");
    }
  });

  test('User can create a new session', async ({ page }) => {
    if (!authToken) throw new Error("❌ Missing auth token!");

    await page.goto('http://localhost:3000/dashboard');

    const addSessionButton = page.locator('button', { hasText: 'Add Session' });
    await expect(addSessionButton).toBeVisible();
    await addSessionButton.click();

    await page.waitForSelector('input[name="date"]');
    await page.fill('input[name="date"]', '2025-03-17');
    await page.selectOption('select[name="sessionType"]', 'Run');
    await page.fill('input[name="weatherTemp"]', '20');
    await page.fill('input[name="weatherHumidity"]', '60');
    await page.fill('input[name="weatherWindSpeed"]', '10');

    console.log("✅ Clicking Next...");
    await page.click('button', { hasText: 'Next' });

    console.log("⏳ Waiting for GraphQL response...");
    await page.waitForResponse(response =>
      response.url().includes('/graphql') && response.status() === 200
    );

    console.log("✅ GraphQL response received!");

    await page.waitForTimeout(3000);

    console.log("🔍 Checking for session card...");
    const sessionList = page.locator('li.session-card');
    await sessionList.waitFor({ state: 'visible', timeout: 7000 });

    createdSessionId = await sessionList.first().getAttribute('data-session-id');
    console.log("✅ Created Session ID:", createdSessionId);

    if (!createdSessionId) {
      throw new Error("❌ Failed to retrieve session ID. Ensure session cards have the correct attribute.");
    }
  });

  test('User can edit an existing session', async ({ page }) => {
    test.skip(!createdSessionId, 'Skipping test because session creation failed');
    await page.goto('http://localhost:3000/dashboard');

    const sessionCard = page.locator(`li.session-card[data-session-id="${createdSessionId}"]`);
    await sessionCard.waitFor({ state: 'visible', timeout: 5000 });

    const tempInput = page.locator('input[name="weatherTemp"]');
    await tempInput.fill('25');

    await page.click('button', { hasText: 'Save' });

    await expect(sessionCard).toContainText('Temp - 25°C');
  });

  test('User can delete a session', async ({ page }) => {
    test.skip(!createdSessionId, 'Skipping test because session creation failed');
    await page.goto('http://localhost:3000/dashboard');

    const sessionCard = page.locator(`li.session-card[data-session-id="${createdSessionId}"]`);
    await sessionCard.waitFor({ state: 'visible', timeout: 5000 });

    await page.waitForSelector('.confirm-dialog');
    await page.click('button', { hasText: 'Confirm' });

    await expect(sessionCard).not.toBeVisible();
  });

});
