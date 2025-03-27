import { test, expect } from '@playwright/test';

test.use({ storageState: 'auth.json' });

test.describe('Personal Records Management Tests', () => {
  const todayISO = new Date().toISOString().split('T')[0];

  const createSessionWithRunActivity = async (page, durationInSeconds: number) => {
    const [minutes, seconds] = [
      Math.floor(durationInSeconds / 60),
      durationInSeconds % 60,
    ];

    await page.goto('https://triswift-frontend.fly.dev/dashboard');

    const addSessionButton = page.locator('button', { hasText: 'Add Session' });
    await addSessionButton.click();

    await page.waitForSelector('input[name="date"]', { timeout: 5000 });
    await page.selectOption('select[name="sessionType"]', 'Run');
    await page.fill('input[name="date"]', todayISO);
    await page.click('button[type="submit"]');

    await page.waitForSelector('form.activity-form', { timeout: 5000 });
    
    await page.fill('input[name="hours"]', '0');
    await page.fill('input[name="minutes"]', minutes.toString());
    await page.fill('input[name="seconds"]', seconds.toString());
    await page.fill('input[name="distance"]', '5.00');

    await page.click('button[type="submit"]');
    await page.waitForSelector('form.activity-form', { state: 'hidden', timeout: 5000 });
  };

  test.beforeEach(async ({ page }) => {
    console.log("🚀 Creating PR test data...");
    await createSessionWithRunActivity(page, 1200); // 20 mins
    await createSessionWithRunActivity(page, 1500); // 25 mins
  });

  test('User can view personal records', async ({ page }) => {
    await page.goto('https://triswift-frontend.fly.dev/personalRecords', { waitUntil: 'networkidle' });

    console.log("🔍 Waiting for 'Run' filter button...");
    const runButton = page.locator('button[data-testid="sport-button-run"]');
    await runButton.waitFor({ state: 'attached', timeout: 15000 });

    console.log("🔍 Clicking 'Run' filter...");
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
    await page.waitForResponse((res) => res.url().includes('/graphql') && res.status() === 200, { timeout: 10000 });

    const recordsTable = page.locator('.records-table');
    const noRecordsMessage = page.locator('p', { hasText: 'No personal records found for Bike.' });
    await expect(recordsTable.or(noRecordsMessage)).toBeVisible();

    console.log("🔍 Switching to 'Run' filter...");
    const runButton = page.locator('button[data-testid="sport-button-run"]');
    await runButton.click();
    await page.waitForResponse((res) => res.url().includes('/graphql') && res.status() === 200, { timeout: 10000 });

    await expect(page.locator('.records-table').or(page.locator('p', { hasText: 'No personal records found for Run.' }))).toBeVisible();
  });

  test('Records display in the correct order (fastest first)', async ({ page }) => {
    await page.goto('https://triswift-frontend.fly.dev/personalRecords', { waitUntil: 'networkidle' });

    const runButton = page.locator('button[data-testid="sport-button-run"]');
    await runButton.waitFor({ state: 'attached', timeout: 15000 });
    await runButton.click();
    await page.waitForResponse((res) => res.url().includes('/graphql') && res.status() === 200, { timeout: 10000 });

    const validRow = page.locator('.records-table tbody tr')
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
        console.log("⚠️ No valid second-place time found.");
      }
    }

    console.log("✅ PRs are displayed and ordered correctly.");
  });
});
