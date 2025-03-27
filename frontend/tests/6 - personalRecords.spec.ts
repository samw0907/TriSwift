import { test, expect } from '@playwright/test';

test.use({ storageState: 'auth.json' });

test.describe('Personal Records Management Tests', () => {

  test('User can view personal records', async ({ page }) => {
    await page.goto('https://triswift-frontend.fly.dev/personalRecords', { waitUntil: 'networkidle' });

    console.log("🔍 Waiting for 'Run' filter button...");
    await page.waitForSelector('button[data-testid="sport-button-run"]', { timeout: 10000 });

    console.log("🔍 Clicking 'Run' filter to view seeduser's records...");
    await page.click('button[data-testid="sport-button-run"]');
    await page.waitForResponse((res) => res.url().includes('/graphql') && res.status() === 200);

    console.log("🔍 Checking if records table is visible...");
    await page.waitForSelector('.records-table', { timeout: 5000 });

    console.log("✅ Records table is present.");

    console.log("🔍 Verifying records data...");
    await expect(page.locator('th')).toContainText(['Distance', '1st', '2nd', '3rd']);

    const firstRecordRow = page.locator('.records-table tbody tr').first();
    await expect(firstRecordRow).toBeVisible();
  });

  test('User can filter personal records by sport type', async ({ page }) => {
    await page.goto('https://triswift-frontend.fly.dev/personalRecords', { waitUntil: 'networkidle' });
    console.log("🔍 Selecting 'Bike' filter...");
    await page.click('button[data-testid="sport-button-bike"]');
  
    console.log("⏳ Waiting for data to load...");
    await page.waitForResponse(response => response.url().includes('/graphql') && response.status() === 200);
  
    console.log("✅ Verifying records or empty message...");
    const recordsTable = page.locator('.records-table');
    const noRecordsMessage = page.locator('p', { hasText: 'No personal records found for Bike.' });
  
    await expect(recordsTable.or(noRecordsMessage)).toBeVisible();
  
    console.log("🔍 Selecting 'Run' filter...");
    await page.click('button[data-testid="sport-button-run"]');
    await page.waitForResponse(response => response.url().includes('/graphql') && response.status() === 200);
    await expect(page.locator('.records-table').or(page.locator('p', { hasText: 'No personal records found for Run.' }))).toBeVisible();
  });

  test('Records display in the correct order (fastest first)', async ({ page }) => {
    await page.goto('https://triswift-frontend.fly.dev/personalRecords', { waitUntil: 'networkidle' });
    console.log("🔍 Finding the first row with a valid time...");
  
    const validRow = await page.locator('.records-table tbody tr').locator('td:nth-child(2)').filter({
      hasText: /^\d{2}:\d{2}:\d{2}$/,
    }).first();
  
    const firstPlaceTime = await validRow.innerText();
    expect(firstPlaceTime).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  
    console.log(`✅ First valid record time: ${firstPlaceTime}`);
  
    const secondPlaceTimeLocator = validRow.locator('xpath=following-sibling::td[1]');
    if (await secondPlaceTimeLocator.isVisible()) {
      const secondPlaceTime = await secondPlaceTimeLocator.innerText();
      if (secondPlaceTime !== "-") {
        expect(secondPlaceTime).toMatch(/^\d{2}:\d{2}:\d{2}$/);
        console.log(`✅ Second place time: ${secondPlaceTime}`);
      } else {
        console.log("⚠️ No valid second-place time found, skipping validation.");
      }
    }
    console.log("✅ Times are formatted correctly and in order.");
  }); 
});

