import { test, expect } from '@playwright/test';

let createdSessionId: string | null = null;

test.describe('Activity Management Tests', () => {

  test.beforeEach(async ({ page }) => {
    console.log("🔑 Logging in before each test...");
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'seeduser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/home', { timeout: 10000 });
    console.log("✅ Logged in successfully.");
  });

  test('User can add an activity to a session', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    console.log("🖱️ Clicking Add Session...");
    const addSessionButton = page.locator('button', { hasText: 'Add Session' });
    await expect(addSessionButton).toBeVisible();
    await addSessionButton.click();

    await page.waitForSelector('input[name="date"]', { timeout: 5000 });
    console.log("✅ Session form is visible.");

    const todayISO = new Date().toISOString().split('T')[0];

    await page.selectOption('select[name="sessionType"]', 'Bike');
    await page.fill('input[name="date"]', todayISO);
    console.log("📡 Submitting session creation request...");
    await page.click('button[type="submit"]');

    await page.waitForSelector('form.activity-form', { timeout: 5000 });
    console.log("✍️ Filling activity form...");
    await page.fill('input[name="hours"]', '0');
    await page.fill('input[name="minutes"]', '12');
    await page.fill('input[name="seconds"]', '12');
    await page.fill('input[name="distance"]', '12.00');

    console.log("🖱️ Clicking 'Submit Activity'...");
    await page.click('button[type="submit"]');
    await page.waitForSelector('form.activity-form', { state: 'hidden', timeout: 5000 });

    await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle" });

    const sessionCard = page.locator('li.session-card').filter({ hasText: todayISO }).first();
    await sessionCard.waitFor({ state: 'visible', timeout: 5000 });

    createdSessionId = await sessionCard.getAttribute('data-session-id');

    if (!createdSessionId) {
      throw new Error("❌ Newly created session not found on dashboard.");
    }

    console.log(`✅ Created Session ID: ${createdSessionId}`);

    console.log("🖱️ Clicking 'Show Details'...");
    await sessionCard.locator('button', { hasText: 'Show Details' }).click();
    await page.waitForTimeout(1000);

    console.log("🔍 Verifying activity details...");
    await expect(sessionCard).toContainText('Bike');
    await expect(sessionCard).toContainText('Distance: 12.00 km');
    await expect(sessionCard).toContainText('Duration: 0h 12m 12s');

    console.log("✅ Activity successfully added and verified!");
  });

  test('User can edit an activity', async ({ page }) => {
    if (!createdSessionId) {
      throw new Error("❌ No session ID available from previous test.");
    }

    await page.goto('http://localhost:3000/dashboard');

    const sessionCard = page.locator(`li.session-card[data-session-id="${createdSessionId}"]`);
    await sessionCard.waitFor({ state: 'visible', timeout: 5000 });

    console.log("🖱️ Clicking 'Show Details'...");
    await sessionCard.locator('button', { hasText: 'Show Details' }).click();
    await page.waitForTimeout(1000);

    console.log("🖱️ Clicking 'Edit Activity'...");
    await page.locator('button', { hasText: 'Edit Activity' }).first().click();
    await page.waitForSelector('form.edit-activity-form', { timeout: 5000 });

    console.log("✍️ Updating activity distance...");
    await page.fill('input[name="distance"]', '6.00');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);
    await expect(sessionCard).toContainText('6.00 km');

    console.log("✅ Activity updated successfully!");
  });

  test('User can delete an activity', async ({ page }) => {
    if (!createdSessionId) {
      throw new Error("❌ No session ID available from previous tests.");
    }

    await page.goto('http://localhost:3000/dashboard');

    const sessionCard = page.locator(`li.session-card[data-session-id="${createdSessionId}"]`);
    await sessionCard.waitFor({ state: 'visible', timeout: 5000 });

    console.log("🖱️ Clicking 'Show Details'...");
    await sessionCard.locator('button', { hasText: 'Show Details' }).click();
    await page.waitForTimeout(1000);

    page.once('dialog', async (dialog) => {
      console.log(`🗨️ Dialog Message: ${dialog.message()}`);
      await dialog.accept();
    });

    console.log("🗑️ Clicking 'Delete Activity'...");
    const deleteActivityButton = sessionCard.locator('button', { hasText: 'Delete Activity' });
    await deleteActivityButton.click();

    await page.waitForTimeout(2000);
    await expect(sessionCard).not.toContainText('6.00 km');

    console.log("✅ Activity deleted successfully!");
  });
});
