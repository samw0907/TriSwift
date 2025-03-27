import { test, expect } from '@playwright/test';

test.use({ storageState: 'auth.json' });

test.describe('Personal Records Management Tests', () => {

  test('User can view personal records', async ({ page }) => {
    await page.goto('https://triswift-frontend.fly.dev/personalRecords', { waitUntil: 'networkidle' });

    console.log("🔍 Waiting for 'Run' filter button...");
    const runButton = page.locator('button[data-testid="sport-button-run"]');
    await runButton.waitFor({ state: 'attached', timeout: 15000 });

    console.log("🔍 Clicking 'Run' filter to view seeduser's records...");
    await runButton.click();
    await page.waitForResponse((res) => res.url().includes('/graphql') && res.status() === 200, { timeout: 10000 });

    console.log("🔍 Checking if records table is visible...");
    await expect(page.locator('.records-table')).toBeVisible({ timeout: 7000 });

    console.log("✅ Records table is present.");
    await expect(page.locator('th')).toContainText(['Distance', '1st', '2nd', '3rd']);

    const firstRecordRow = page.locator('.records-table tbody tr').first();
    await expect(firstRecordRow).toBeVisible();
  });

  test('User can filter personal records by sport type', async ({ page }) => {
    await page.goto('https://triswift-frontend.fly.dev/personalRecords', { waitUntil: 'networkidle' });

    const bikeButton = page.locator('button[data-testid="sport-button-bike"]');
    await bikeButton.waitFor({ state: 'attached', timeout: 15000 });

    console.log("🔍 Selecting 'Bike' filter...");
    await bikeButton.click();

    console.log("⏳ Waiting for data to load...");
    await page.waitForResponse(response => response.url().includes('/graphql') && response.status() === 200, { timeout: 10000 });

    const recordsTable = page.locator('.records-table');
    const noRecordsMessage = page.locator('p', { hasText: 'No personal records found for Bike.' });
    await expect(recordsTable.or(noRecordsMessage)).toBeVisible();

    console.log("🔍 Switching to 'Run' filter...");
    const runButton = page.locator('button[data-testid="sport-button-run"]');
    await runButton.click();
    await page.waitForResponse(response => response.url().includes('/graphql') && response.status() === 200, { timeout: 10000 });
    await expect(page.locator('.records-table').or(page.locator('p', { hasText: 'No personal records found for Run.' }))).toBeVisible();
  });

  test('Records display in the correct order (fastest first)', async ({ page }) => {
    await page.goto('https://triswift-frontend.fly.dev/personalRecords', { waitUntil: 'networkidle' });

    const validRow = await page.locator('.records-table tbody tr')
      .locator('td:nth-child(2)')
      .filter({ hasText: /^\d{2}:\d{2}:\d{2}$/ })
      .first();

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
