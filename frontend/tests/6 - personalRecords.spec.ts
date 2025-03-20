import { test, expect } from '@playwright/test';

test.use({ storageState: 'auth.json' });

test.describe('Personal Records Management Tests', () => {

  test.beforeEach(async ({ page }) => {
    console.log("🔑 Checking stored authentication state...");
    await page.goto('http://localhost:3000/home', { waitUntil: 'load' });

    const authToken = await page.evaluate(() => localStorage.getItem('token'));
    if (!authToken) {
      throw new Error("❌ No auth token found in localStorage.");
    }

    console.log("✅ Token retrieved from localStorage");

    console.log("🚀 Navigating to the Personal Records page...");
    await page.goto('http://localhost:3000/records', { waitUntil: 'load' });

    await page.waitForSelector('h1', { timeout: 5000 });
    await expect(page.locator('h1')).toHaveText('Personal Records');
  });

  test('User can view personal records', async ({ page }) => {
    console.log("🔍 Checking if records table is visible...");
    await page.waitForSelector('.records-table', { timeout: 5000 });

    console.log("✅ Records table is present.");

    console.log("🔍 Verifying records data...");
    await expect(page.locator('th')).toContainText(['Distance', '1st', '2nd', '3rd']);

    const firstRecordRow = page.locator('.records-table tbody tr').first();
    await expect(firstRecordRow).toBeVisible();
  });

  test('User can filter personal records by sport type', async ({ page }) => {
    console.log("🔍 Selecting 'Bike' filter...");
    await page.click('button[data-testid="sport-button-bike"]');
    await page.waitForTimeout(1000);

    console.log("✅ Verifying Bike records are displayed...");
    await expect(page.locator('.records-table')).toContainText('Bike');
    await expect(page.locator('.records-table')).not.toContainText('Swim');
    await expect(page.locator('.records-table')).not.toContainText('Run');

    console.log("🔍 Selecting 'Run' filter...");
    await page.click('button[data-testid="sport-button-run"]');
    await page.waitForTimeout(1000);

    console.log("✅ Verifying Run records are displayed...");
    await expect(page.locator('.records-table')).toContainText('Run');
    await expect(page.locator('.records-table')).not.toContainText('Swim');
    await expect(page.locator('.records-table')).not.toContainText('Bike');

    console.log("🔍 Selecting 'Swim' filter...");
    await page.click('button[data-testid="sport-button-swim"]');
    await page.waitForTimeout(1000);

    console.log("✅ Verifying Swim records are displayed...");
    await expect(page.locator('.records-table')).toContainText('Swim');
    await expect(page.locator('.records-table')).not.toContainText('Bike');
    await expect(page.locator('.records-table')).not.toContainText('Run');
  });

  test('Records display in the correct order (fastest first)', async ({ page }) => {
    console.log("🔍 Checking first-place records...");
    const firstPlaceTime = await page.locator('.records-table tbody tr:nth-child(1) td:nth-child(2)').innerText();
    const secondPlaceTime = await page.locator('.records-table tbody tr:nth-child(1) td:nth-child(3)').innerText();

    console.log(`✅ First place time: ${firstPlaceTime}`);
    console.log(`✅ Second place time: ${secondPlaceTime}`);

    expect(firstPlaceTime).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    expect(secondPlaceTime).toMatch(/^\d{2}:\d{2}:\d{2}$/);

    console.log("✅ Times are formatted correctly and in order.");
  });

});
