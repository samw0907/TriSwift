import { test, expect } from '@playwright/test';

let createdSessionId: string | null = null;
let todayISO: string;

test.describe('Transition Management Tests', () => {

  test.beforeEach(async ({ page }) => {
    todayISO = new Date().toISOString().split('T')[0];

    console.log("🔑 Logging in before each test...");
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'seeduser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/home');
    console.log("✅ Logged in successfully.");
  });

  test('User can add a transition to a session', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    console.log("🖱️ Clicking Add Session...");
    const addSessionButton = page.locator('button:has-text("Add Session")').first();
    await addSessionButton.click();

    await page.waitForSelector('input[name="date"]', { timeout: 5000 });
    console.log("✅ Session form is visible.");

    await page.selectOption('select[name="sessionType"]', 'Multi-Sport');
    await page.fill('input[name="date"]', todayISO);
    await page.click('button[type="submit"]');

    console.log("🔍 Waiting for Activity form...");
    await page.waitForSelector('form.activity-form', { timeout: 5000 });

    console.log("✍️ Filling activity form...");
    await page.selectOption('select[name="sportType"]', 'Swim');
    await page.fill('input[name="hours"]', '0');
    await page.fill('input[name="minutes"]', '20');
    await page.fill('input[name="seconds"]', '0');
    await page.fill('input[name="distance"]', '1000');
    await page.click('button[type="submit"]');
    
    console.log("🔍 Waiting for Transition form...");
    await page.waitForSelector('form.transition-form', { timeout: 7000 });

    console.log("✅ Transition form is now visible!");

    console.log("✍️ Filling transition form...");
    await page.selectOption('select[name="previousSport"]', 'Swim');
    await page.selectOption('select[name="nextSport"]', 'Bike');
    await page.fill('input[name="minutes"]', '0');
    await page.fill('input[name="seconds"]', '45');
    await page.click('button[type="submit"]');

    console.log("🖱️ Clicking 'Save & Close'...");
    await page.click('button[type="submit"]');

    await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle" });

    const showFiltersButton = page.locator('button.btn-filter-toggle');
    await showFiltersButton.click();

    const multiSportCheckbox = page.locator('label >> text=Multi-Sport >> input[type="checkbox"]');
    await expect(multiSportCheckbox).toBeVisible();
    await multiSportCheckbox.click();

    const minDistanceInput = page.locator('input[name="minDistance"]');
    await expect(minDistanceInput).toBeVisible();
    await minDistanceInput.fill('1');

    const maxDistanceInput = page.locator('input[name="maxDistance"]');
    await expect(maxDistanceInput).toBeVisible();
    await maxDistanceInput.fill('1');

    const sessionCard = page.locator('li.session-card').first();
    await sessionCard.waitFor({ state: 'visible', timeout: 5000 });

    createdSessionId = await sessionCard.getAttribute('data-session-id');

    if (!createdSessionId) {
      throw new Error("❌ Newly created session not found on dashboard.");
    }

    console.log(`✅ Created Session ID: ${createdSessionId}`);

    console.log("🖱️ Clicking 'Show Details'...");
    await sessionCard.locator('button', { hasText: 'Show Details' }).click();
    await page.waitForTimeout(1000);

    console.log("🔍 Verifying transition details...");
    await expect(sessionCard).toContainText('Swim → Bike');
    await expect(sessionCard).toContainText('Transition Time: 0h 0m 45s');

    console.log("✅ Transition successfully added and verified!");
  });

  test('User can edit a transition', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    const showFiltersButton = page.locator('button.btn-filter-toggle');
    await showFiltersButton.click();

    const multiSportCheckbox = page.locator('label >> text=Multi-Sport >> input[type="checkbox"]');
    await expect(multiSportCheckbox).toBeVisible();
    await multiSportCheckbox.click();

    const minDistanceInput = page.locator('input[name="minDistance"]');
    await expect(minDistanceInput).toBeVisible();
    await minDistanceInput.fill('1');

    const maxDistanceInput = page.locator('input[name="maxDistance"]');
    await expect(maxDistanceInput).toBeVisible();
    await maxDistanceInput.fill('1');

    const sessionCard = page.locator('li.session-card').first();
    await sessionCard.waitFor({ state: 'visible', timeout: 5000 });

    console.log("🖱️ Clicking 'Show Details'...");
    await sessionCard.locator('button', { hasText: 'Show Details' }).click();
    await page.waitForTimeout(1000);

    console.log("🖱️ Clicking 'Edit Transition'...");
    await page.locator('button', { hasText: 'Edit Transition' }).first().click();

    console.log("✅ Transition form is now visible!");

    console.log("✍️ Updating transition time...");
    await page.fill('input[name="minutes"]', '0');
    await page.fill('input[name="seconds"]', '30');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);
    await expect(sessionCard).toContainText('Transition Time: 0h 0m 30s');

    console.log("✅ Transition updated successfully!");
  });

  test('User can delete a transition', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    const showFiltersButton = page.locator('button.btn-filter-toggle');
    await showFiltersButton.click();

    const multiSportCheckbox = page.locator('label >> text=Multi-Sport >> input[type="checkbox"]');
    await expect(multiSportCheckbox).toBeVisible();
    await multiSportCheckbox.click();

    const minDistanceInput = page.locator('input[name="minDistance"]');
    await expect(minDistanceInput).toBeVisible();
    await minDistanceInput.fill('1');

    const maxDistanceInput = page.locator('input[name="maxDistance"]');
    await expect(maxDistanceInput).toBeVisible();
    await maxDistanceInput.fill('1');

    const sessionCard = page.locator('li.session-card').first();
    await sessionCard.waitFor({ state: 'visible', timeout: 5000 });


    console.log("🖱️ Clicking 'Show Details'...");
    await sessionCard.locator('button', { hasText: 'Show Details' }).click();
    await page.waitForTimeout(1000);

    page.once('dialog', async (dialog) => {
      console.log(`🗨️ Dialog Message: ${dialog.message()}`);
      await dialog.accept();
    });

    console.log("🗑️ Clicking 'Delete Transition'...");
    await page.locator('button', { hasText: 'Delete Transition' }).click();

    await page.waitForTimeout(2000);
    await expect(sessionCard).not.toContainText('Swim → Bike');

    console.log("✅ Transition deleted successfully!");
  });
});
