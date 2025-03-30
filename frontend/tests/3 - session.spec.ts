import { test, expect } from '@playwright/test';

test.describe('Session Management Tests', () => {
  let createdSessionId: string | null = null;

  test.beforeEach(async ({ page }) => {
    console.log("🔑 Logging in before each test...");
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'seeduser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/home', { timeout: 10000 });

    const token = await page.evaluate(() => localStorage.getItem('token'));
    if (!token) {
      throw new Error("❌ No token found in localStorage after login.");
    }
    console.log("✅ Logged in successfully with token.");
  });

  test('User can create a new session', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
  
    const addSessionButton = page.locator('button', { hasText: 'Add Session' });
    await expect(addSessionButton).toBeVisible();
  
    console.log("🖱️ Clicking Add Session...");
    await addSessionButton.click();
    await page.waitForSelector('input[name="date"]', { timeout: 5000 });
  
    const todayFormatted = new Date().toISOString().split('T')[0];
    await page.selectOption('select[name="sessionType"]', 'Run');
    await page.fill('input[name="date"]', todayFormatted);
    await page.click('button[type="submit"]');
    console.log("📡 Submitted new session");

    const showFiltersButton = page.locator('button.btn-filter-toggle');
    await showFiltersButton.click();

    const runCheckbox = page.locator('label >> text=Run >> input[type="checkbox"]');
    await expect(runCheckbox).toBeVisible();
    await runCheckbox.click();


    const maxDistanceInput = page.locator('input[name="maxDistance"]');
    await expect(maxDistanceInput).toBeVisible();
    await maxDistanceInput.fill('0');

    await page.click('button[type="submit"]');

    const sessionCard = page.locator('li.session-card').first();
    await sessionCard.waitFor({ state: 'visible', timeout: 5000 });

    createdSessionId = await sessionCard.getAttribute('data-session-id');
    if (!createdSessionId) {
      throw new Error("❌ Could not find created session ID.");
    }
  
    console.log(`✅ Session created successfully: ID = ${createdSessionId}`);
  });

  test('User can edit an existing session', async ({ page }) => {
    if (!createdSessionId) throw new Error("❌ No session ID from creation test.");

    await page.goto('http://localhost:3000/dashboard');

    const sessionCard = page.locator(`li.session-card[data-session-id="${createdSessionId}"]`);
    await expect(sessionCard).toBeVisible();

    console.log("🖱️ Editing session...");
    await sessionCard.locator('button', { hasText: 'Edit' }).click();

    const editForm = page.locator('.session-edit-form');
    await expect(editForm).toBeVisible({ timeout: 5000 });

    await editForm.locator('input[name="weatherTemp"]').fill('25');
    await editForm.locator('button[type="submit"]').click();

    await sessionCard.locator('button', { hasText: 'Show Details' }).click();
    await expect(sessionCard).toContainText('Temp - 25°C');

    console.log("✅ Session updated successfully.");
  });

  test('User can delete a session', async ({ page }) => {
    if (!createdSessionId) throw new Error("❌ No session ID from creation test.");

    await page.goto('http://localhost:3000/dashboard');

    const sessionCard = page.locator(`li.session-card[data-session-id="${createdSessionId}"]`);
    await expect(sessionCard).toBeVisible();

    console.log("🗑️ Deleting session...");
    page.once('dialog', dialog => dialog.accept());

    await sessionCard.locator('button.btn-danger').click();

    await expect(sessionCard).not.toBeVisible({ timeout: 5000 });

    console.log("✅ Session deleted successfully.");
  });
});
