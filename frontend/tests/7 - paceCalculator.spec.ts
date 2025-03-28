import { test, expect } from '@playwright/test';

test.describe('Pace Calculator Tests', () => {

  test.beforeEach(async ({ page }) => {
    console.log("🔑 Logging in before each test...");
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'seeduser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/home', { timeout: 10000 });
    console.log("✅ Logged in successfully.");

    console.log("🚀 Navigating to Pace Calculator...");
    await page.goto('http://localhost:3000/paceCalculator', { waitUntil: 'load' });

    console.log("🔍 Checking Pace Calculator loaded...");
    await page.waitForSelector('h2', { timeout: 5000 });
    await expect(page.locator('h2')).toHaveText('Pace Calculator');
  });

  test('User can calculate pace', async ({ page }) => {
    console.log("🔄 Selecting sport type...");
    await page.selectOption('select#sport-select', 'Run');

    console.log("✍️ Selecting a preset distance...");
    await page.selectOption('select#distance-select', '5km');

    console.log("✍️ Entering target time...");
    await page.fill('input#hours-input', '0');
    await page.fill('input#minutes-input', '25');
    await page.fill('input#seconds-input', '0');

    console.log("🖱️ Clicking Calculate...");
    await page.click('.pace-buttons button');

    console.log("⏳ Waiting for pace result...");
    await page.waitForSelector('div.pace-form h3', { timeout: 5000 });

    console.log("🔍 Verifying calculated pace...");
    await expect(page.locator('h3')).toContainText('5:00 min/km');
  });

  test('User can enter a custom distance', async ({ page }) => {
    console.log("🔄 Selecting sport type...");
    await page.selectOption('select#sport-select', 'Bike');

    console.log("✍️ Entering a custom distance...");
    await page.fill('input#custom-distance', '20');

    console.log("✍️ Entering target time...");
    await page.fill('input#hours-input', '0');
    await page.fill('input#minutes-input', '40');
    await page.fill('input#seconds-input', '0');

    console.log("🖱️ Clicking Calculate...");
    await page.click('.pace-buttons button');

    console.log("🔍 Verifying calculated speed...");
    await page.waitForSelector('div.pace-form h3', { timeout: 5000 });
    await expect(page.locator('h3')).toContainText('30.0 km/h');
  });

  test('Handles zero or invalid input gracefully', async ({ page }) => {
    console.log("🔄 Selecting sport type...");
    await page.selectOption('select#sport-select', 'Run');

    console.log("✍️ Entering invalid values...");
    await page.fill('input#custom-distance', '0');
    await page.fill('input#hours-input', '0');
    await page.fill('input#minutes-input', '0');
    await page.fill('input#seconds-input', '0');

    console.log("🖱️ Clicking Calculate...");
    await page.click('.pace-buttons button');

    console.log("✅ Ensuring error message appears...");
    await page.waitForSelector('div.pace-form h3', { timeout: 5000 });
    await expect(page.locator('h3')).toContainText('Invalid input');
  });

});
