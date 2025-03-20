import { test, expect } from '@playwright/test';

test.use({ storageState: 'auth.json' });

test.describe('Pace Calculator Tests', () => {

  test.beforeEach(async ({ page }) => {
    console.log("🚀 Navigating to the Pace Calculator page...");
    await page.goto('http://localhost:3000/paceCalculator', { waitUntil: 'load' });

    console.log("🔍 Checking if the Pace Calculator is loaded...");
    await page.waitForSelector('h1', { timeout: 5000 });
    await expect(page.locator('h1')).toHaveText('Pace Calculator');
  });

  test('User can calculate pace', async ({ page }) => {
    console.log("✍️ Entering distance and time...");
    await page.fill('input[name="distance"]', '5');
    await page.fill('input[name="hours"]', '0');
    await page.fill('input[name="minutes"]', '25');
    await page.fill('input[name="seconds"]', '0');

    console.log("🖱️ Clicking Calculate...");
    await page.click('button[type="submit"]');

    console.log("🔍 Verifying calculated pace...");
    await expect(page.locator('p.pace-result')).toContainText('5:00 min/km');
  });

  test('User can calculate time', async ({ page }) => {
    console.log("✍️ Entering distance and pace...");
    await page.fill('input[name="distance"]', '5');
    await page.fill('input[name="paceMinutes"]', '5');
    await page.fill('input[name="paceSeconds"]', '0');

    console.log("🖱️ Clicking Calculate...");
    await page.click('button[type="submit"]');

    console.log("🔍 Verifying calculated time...");
    await expect(page.locator('p.time-result')).toContainText('00:25:00');
  });

  test('User can calculate distance', async ({ page }) => {
    console.log("✍️ Entering time and pace...");
    await page.fill('input[name="hours"]', '0');
    await page.fill('input[name="minutes"]', '30');
    await page.fill('input[name="seconds"]', '0');
    await page.fill('input[name="paceMinutes"]', '6');
    await page.fill('input[name="paceSeconds"]', '0');

    console.log("🖱️ Clicking Calculate...");
    await page.click('button[type="submit"]');

    console.log("🔍 Verifying calculated distance...");
    await expect(page.locator('p.distance-result')).toContainText('5.00 km');
  });

  test('User can switch between km and miles', async ({ page }) => {
    console.log("🔍 Checking default unit...");
    const defaultUnit = await page.locator('select[name="unit"]').inputValue();
    expect(defaultUnit).toBe('km');

    console.log("🔄 Switching to miles...");
    await page.selectOption('select[name="unit"]', 'miles');

    console.log("✅ Ensuring conversion happens correctly...");
    await expect(page.locator('p.unit-conversion')).toContainText('3.1 miles');
  });

  test('Handles zero and negative values gracefully', async ({ page }) => {
    console.log("✍️ Entering invalid values...");
    await page.fill('input[name="distance"]', '0');
    await page.fill('input[name="minutes"]', '-5');

    console.log("🖱️ Clicking Calculate...");
    await page.click('button[type="submit"]');

    console.log("✅ Ensuring error message appears...");
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('Invalid input');
  });

});
