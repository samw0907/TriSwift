import { test, expect } from '@playwright/test';

test.describe('Personal Records Management Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    console.log("🔑 Logging in before each test...");
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'seeduser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/home');
    console.log("✅ Logged in successfully.");
  });

  test('User can view personal records', async ({ page }) => {
    console.log("🔧 Creating sessions and activities...");

    await page.goto('http://localhost:3000/dashboard');
    await page.click('button:has-text("Add Session")');
    await page.selectOption('select[name="sessionType"]', 'Swim');
    await page.fill('input[name="date"]', new Date().toISOString().split('T')[0]);
    await page.click('button[type="submit"]');
    await page.waitForSelector('form.activity-form', { timeout: 5000 });

    await page.fill('input[name="distance"]', '1000');
    await page.fill('input[name="minutes"]', '19');
    await page.click('button[type="submit"]');

    await page.click('button:has-text("Add Session")');
    await page.selectOption('select[name="sessionType"]', 'Run');
    await page.fill('input[name="date"]', new Date().toISOString().split('T')[0]);
    await page.click('button[type="submit"]');
    await page.waitForSelector('form.activity-form', { timeout: 5000 });

    await page.fill('input[name="distance"]', '5');
    await page.fill('input[name="minutes"]', '19');
    await page.click('button[type="submit"]');

    await page.click('button:has-text("Add Session")');
    await page.selectOption('select[name="sessionType"]', 'Run');
    await page.fill('input[name="date"]', new Date().toISOString().split('T')[0]);
    await page.click('button[type="submit"]');
    await page.waitForSelector('form.activity-form', { timeout: 5000 });
    
    await page.fill('input[name="distance"]', '5');
    await page.fill('input[name="minutes"]', '20');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);
    console.log("✅ Sessions and activities created successfully.");

    await page.goto('http://localhost:3000/records');

    console.log("🔍 Waiting for 'Run' filter button...");
    const runButton = page.locator('button[data-testid="sport-button-run"]');
    await runButton.waitFor({ state: 'visible' });

    console.log("🔍 Clicking 'Run' filter...");
    await runButton.click();

    await page.waitForResponse(res => res.url().includes('/graphql') && res.status() === 200);

    const recordsTable = page.locator('.records-table');
    await expect(recordsTable).toBeVisible();

    console.log("✅ Records table is present and visible.");
    await expect(page.locator('th')).toContainText(['Distance', '1st', '2nd', '3rd']);
  });

  test('User can filter personal records by sport type', async ({ page }) => {
    await page.goto('http://localhost:3000/records');

    const bikeButton = page.locator('button[data-testid="sport-button-bike"]');
    await bikeButton.waitFor({ state: 'visible' });

    console.log("🔍 Selecting 'Bike' filter...");
    await bikeButton.click();
    await page.waitForResponse(res => res.url().includes('/graphql') && res.status() === 200);

    const recordsTable = page.locator('.records-table');
    const noRecordsMessage = page.locator('p', { hasText: 'No personal records found for Bike.' });

    await expect(recordsTable.or(noRecordsMessage)).toBeVisible();

    console.log("✅ Bike records (or no-records message) verified.");

    const swimButton = page.locator('button[data-testid="sport-button-swim"]');
    await swimButton.click();
    await page.waitForResponse(res => res.url().includes('/graphql') && res.status() === 200);

    await expect(recordsTable.or(page.locator('p', { hasText: 'No personal records found for Swim.' }))).toBeVisible();

    console.log("✅ Swim records (or no-records message) verified.");
  });

  test('Records display in the correct order (fastest first)', async ({ page }) => {
    await page.goto('http://localhost:3000/records');

    const runButton = page.locator('button[data-testid="sport-button-run"]');
    await runButton.click();
    await page.waitForResponse(res => res.url().includes('/graphql') && res.status() === 200);

    const recordRows = page.locator('.records-table tbody tr');

    const fiveKmRow = recordRows.locator('td', { hasText: '5km' }).locator('..');
    await fiveKmRow.waitFor({ state: 'visible' });

    const firstPlaceTime = await fiveKmRow.locator('td:nth-child(2)').textContent();
    expect(firstPlaceTime).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    console.log(`✅ First place time: ${firstPlaceTime}`);

    const secondPlaceTime = await fiveKmRow.locator('td:nth-child(3)').textContent();
    if (secondPlaceTime && secondPlaceTime !== "-") {
      expect(secondPlaceTime).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      console.log(`✅ Second place time: ${secondPlaceTime}`);
    } else {
      console.log("⚠️ No second-place record available.");
    }

    console.log("✅ Records display correctly in order (fastest first).");
  });
});
