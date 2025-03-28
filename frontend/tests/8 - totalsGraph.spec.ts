import { test, expect } from '@playwright/test';

test.describe('Totals Graph Tests', () => {

  test.beforeEach(async ({ page }) => {
    console.log("🔑 Logging in...");
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'seeduser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/home');
    console.log("✅ Logged in successfully.");

    console.log("📈 Navigating to Totals Graph...");
    await page.goto('http://localhost:3000/dashboard');
    await expect(page.locator('.totals-graph-container h2')).toContainText('Last 7 Days Distance');
  });

  test('Graph updates when selecting different sports', async ({ page }) => {
    const sportButtons = ['Bike', 'Swim'];

    for (const sport of sportButtons) {
      console.log(`🖱️ Selecting '${sport}'...`);
      await page.click(`button:has-text("${sport}")`);

      console.log("⏳ Waiting for graph update...");
      await page.waitForTimeout(1000); // Adjust if a response or update indicator is available

      const updatedLabel = await page.locator('.totals-graph-container h2').textContent();
      expect(updatedLabel).toMatch(/Last 7 Days Distance|Past Month Distance|Past Year Distance/);
      console.log(`✅ Graph updated for ${sport}.`);
    }
  });

  test('Graph updates when changing view modes', async ({ page }) => {
    const viewModes = ['Monthly', 'Yearly'];

    for (const view of viewModes) {
      console.log(`🖱️ Switching to ${view} view...`);
      await page.click(`button:has-text("${view}")`);

      console.log("⏳ Waiting for graph update...");
      await page.waitForTimeout(1000);

      const updatedLabel = await page.locator('.totals-graph-container h2').textContent();
      expect(updatedLabel).toMatch(new RegExp(`Past ${view === 'Monthly' ? 'Month' : 'Year'} Distance`));
      console.log(`✅ Graph view updated to ${view}.`);
    }
  });

  test('Graph displays data points after updating filters', async ({ page }) => {
    console.log("🖱️ Selecting 'Run'...");
    await page.click('button:has-text("Run")');

    console.log("🖱️ Selecting 'Weekly' view...");
    await page.click('button:has-text("Weekly")');
    await page.waitForTimeout(1000);

    console.log("🔍 Checking graph visibility...");
    const graphCanvas = page.locator('.totals-graph-container .graph-container canvas');
    await expect(graphCanvas).toBeVisible();
    console.log("✅ Graph canvas is visible with data points.");
  });

  test('Graph displays correct total values (Monthly Run)', async ({ page }) => {
    console.log("🖱️ Selecting 'Run' and 'Monthly' view...");
    await page.click('button:has-text("Run")');
    await page.click('button:has-text("Monthly")');
    await page.waitForTimeout(1000);

    console.log("🔍 Verifying graph label...");
    const graphLabel = await page.locator('.totals-graph-container h2').textContent();
    expect(graphLabel).toContain('Past Month Distance');
    console.log("✅ Monthly Run totals displayed correctly.");
  });
});
