import { test, expect } from '@playwright/test';

let createdSessionId: string | null = null;

test.describe('Session Management Tests', () => {

  test.beforeEach(async ({ page }) => {
    console.log("🔑 Logging in before each test...");
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'seeduser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/home', { timeout: 10000 });
    console.log("✅ Logged in successfully.");
  });

  test('User can create a new session', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    const addSessionButton = page.locator('button', { hasText: 'Add Session' });
    await expect(addSessionButton).toBeVisible();

    console.log("🖱️ Clicking Add Session...");
    await addSessionButton.click();

    await page.waitForSelector('input[name="date"]', { timeout: 5000 });
    console.log("✅ Session form is visible.");

    const todayISO = new Date().toISOString().split('T')[0];

    await page.selectOption('select[name="sessionType"]', 'Run');
    await page.fill('input[name="date"]', todayISO);
    console.log("📡 Submitting session creation request...");

    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle" });

    const sessionCard = page.locator('li.session-card').filter({ hasText: todayISO }).first();
    await sessionCard.waitFor({ state: 'visible', timeout: 5000 });

    createdSessionId = await sessionCard.getAttribute('data-session-id');

    if (!createdSessionId) {
      throw new Error("❌ Newly created session not found on dashboard.");
    }

    console.log(`✅ Created Session ID: ${createdSessionId}`);
  });

  test('User can edit an existing session', async ({ page }) => {
    if (!createdSessionId) {
      throw new Error("❌ No session ID available from previous test.");
    }

    await page.goto('http://localhost:3000/dashboard');

    const sessionCard = page.locator(`li.session-card[data-session-id="${createdSessionId}"]`);
    await sessionCard.waitFor({ state: 'visible', timeout: 5000 });

    console.log("🖱️ Clicking Edit button...");
    await sessionCard.locator('button', { hasText: 'Edit' }).click();

    console.log("⏳ Waiting for edit form...");
    const editForm = page.locator('.session-edit-form');
    await editForm.waitFor({ state: 'visible', timeout: 5000 });

    console.log("✍️ Editing session...");
    const tempInput = page.locator('input[name="weatherTemp"]');
    await tempInput.fill('25');

    console.log("✅ Clicking Save button...");
    await editForm.locator('button[type="submit"]').click();

    await sessionCard.locator('button', { hasText: 'Show Details' }).click();

    console.log("🔍 Checking updated text...");
    await expect(sessionCard).toContainText('Temp - 25°C');
  });

  test('User can delete a session', async ({ page }) => {
    if (!createdSessionId) {
      throw new Error("❌ No session ID available from previous tests.");
    }

    await page.goto('http://localhost:3000/dashboard');

    const sessionCard = page.locator(`li.session-card[data-session-id="${createdSessionId}"]`);
    await sessionCard.waitFor({ state: 'visible', timeout: 5000 });

    page.once('dialog', async (dialog) => {
      console.log(`🗨️ Dialog Message: ${dialog.message()}`);
      await dialog.accept();
    });

    console.log("🗑️ Clicking Delete button...");
    await sessionCard.locator('button.btn-danger').click();

    await page.waitForFunction(
      (id) => !document.querySelector(`li.session-card[data-session-id="${id}"]`),
      createdSessionId
    );

    await expect(page.locator(`li.session-card[data-session-id="${createdSessionId}"]`)).not.toBeVisible();
    console.log("✅ Session deleted successfully.");
  });
});
