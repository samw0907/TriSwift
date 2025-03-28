import { test, expect } from '@playwright/test';

test.describe('Session Management Tests', () => {
  let todayISO: string;

  test.beforeEach(async ({ page }) => {
    todayISO = new Date().toISOString().split('T')[0];

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

    await page.waitForSelector('input[name="date"]');
    await page.selectOption('select[name="sessionType"]', 'Run');
    await page.fill('input[name="date"]', todayISO);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard');

    const sessionCard = page.locator('li.session-card').filter({ hasText: todayISO }).first();
    await expect(sessionCard).toBeVisible();
    console.log(`✅ Session created successfully for ${todayISO}`);
  });

  test('User can edit an existing session', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    const sessionCard = page.locator('li.session-card').filter({ hasText: todayISO }).first();
    await expect(sessionCard).toBeVisible();

    console.log("🖱️ Clicking Edit button...");
    await sessionCard.locator('button', { hasText: 'Edit' }).click();

    const editForm = page.locator('.session-edit-form');
    await expect(editForm).toBeVisible();

    await editForm.locator('input[name="weatherTemp"]').fill('25');
    await editForm.locator('button[type="submit"]').click();

    await sessionCard.locator('button', { hasText: 'Show Details' }).click();
    await expect(sessionCard).toContainText('Temp - 25°C');

    console.log("✅ Session edited successfully.");
  });

  test('User can delete a session', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    const sessionCard = page.locator('li.session-card').filter({ hasText: todayISO }).first();
    await expect(sessionCard).toBeVisible();

    page.once('dialog', dialog => dialog.accept());

    await sessionCard.locator('button.btn-danger').click();

    await expect(sessionCard).not.toBeVisible();

    console.log("✅ Session deleted successfully.");
  });
});
