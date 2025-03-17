import { test, expect } from '@playwright/test';

let createdSessionId: string | null = null;

test.describe('Session Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    console.log("🔑 Logging in before test...");
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'ubolt@gmail.com');
    await page.fill('input[name="password"]', 'fastpassword');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('http://localhost:3000/home', { timeout: 10000 });
    await expect(page).toHaveURL('http://localhost:3000/home');
  });

  test('User can create a new session', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    const addSessionButton = page.locator('button', { hasText: 'Add Session' });
    await expect(addSessionButton).toBeVisible();
    await addSessionButton.click();

    await page.waitForSelector('input[name="date"]');

    await page.selectOption('select[name="sessionType"]', 'Run');
    await page.fill('input[name="date"]', '2025-03-17');
    await page.fill('input[name="weatherTemp"]', '20');
    await page.fill('input[name="weatherHumidity"]', '60');
    await page.fill('input[name="weatherWindSpeed"]', '10');

    console.log("✅ Clicking Next...");
    await page.click('button', { hasText: 'Next' });

    console.log("⏳ Waiting for UI update...");
    await page.waitForTimeout(5000);

    console.log("🔍 Checking if new session appears...");
    const sessionList = page.locator('li.session-card');

    const sessionCountBefore = await sessionList.count();
    console.log(`📊 Session count before wait: ${sessionCountBefore}`);

    await sessionList.waitFor({ state: 'visible', timeout: 7000 }).catch(() => {
      console.log("⚠️ No session card appeared! Checking session list count again...");
    });

    const sessionCountAfter = await sessionList.count();
    console.log(`📊 Session count after wait: ${sessionCountAfter}`);

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
