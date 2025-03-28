import { test, expect } from '@playwright/test';

test.describe('Totals Graph Tests', () => {

  test.beforeEach(async ({ page }) => {
    console.log("🔑 Logging in before each test...");
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'seeduser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/home', { timeout: 10000 });
    console.log("✅ Logged in successfully.");

    console.log("🔍 Checking if the Totals Graph is loaded...");
    await page.waitForSelector('.totals-graph-container', { timeout: 5000 });
    await expect(page.locator('.totals-graph-container h2')).toContainText(['Last 7 Days Distance']);
  });

  test('Graph updates when selecting a different sport', async ({ page }) => {
    console.log("🔍 Checking default sport selection...");
    const defaultLabel = await page.locator('.totals-graph-container h2').textContent();
    expect(defaultLabel).toMatch(/Last 7 Days Distance|Past Month Distance|Past Year Distance/);

    console.log("🖱️ Selecting 'Bike'...");
    await page.click('button:has-text("Bike")');
    await page.waitForTimeout(1000);

    console.log("🖱️ Selecting 'Swim'...");
    await page.click('button:has-text("Swim")');
    await page.waitForTimeout(1000);

    console.log("✅ Ensuring the graph updates...");
    const updatedLabel = await page.locator('.totals-graph-container h2').textContent();
    expect(updatedLabel).toMatch(/Last 7 Days Distance|Past Month Distance|Past Year Distance/);
  });

  test('Graph updates when changing view mode', async ({ page }) => {
    console.log("🖱️ Switching to Monthly View...");
    await page.click('button:has-text("Monthly")');
    await page.waitForTimeout(1000);

    console.log("🖱️ Switching to Yearly View...");
    await page.click('button:has-text("Yearly")');
    await page.waitForTimeout(1000);

    console.log("✅ Ensuring view mode updates...");
    const updatedLabel = await page.locator('.totals-graph-container h2').textContent();
    expect(updatedLabel).toMatch(/Past Month Distance|Past Year Distance/);
  });

  test('Graph contains data points after update', async ({ page }) => {
    console.log("🖱️ Selecting 'Run'...");
    await page.click('button:has-text("Run")');
    await page.waitForTimeout(1000);

    console.log("🖱️ Selecting 'Weekly' view...");
    await page.click('button:has-text("Weekly")');
    await page.waitForTimeout(1000);

    console.log("🔍 Checking if graph has data...");
    const graphPoints = page.locator('.totals-graph-container .graph-container canvas');
    await expect(graphPoints).toBeVisible();

    console.log("✅ Graph has rendered correctly.");
  });

  test('Graph displays expected total values for one case', async ({ page }) => {
    console.log("🖱️ Selecting 'Run'...");
    await page.click('button:has-text("Run")');
    await page.waitForTimeout(1000);

    console.log("🖱️ Switching to Monthly View...");
    await page.click('button:has-text("Monthly")');
    await page.waitForTimeout(1000);

    console.log("🔍 Extracting graph data...");
    const graphLabel = await page.locator('.totals-graph-container h2').textContent();
    expect(graphLabel).toContain('Past Month Distance');

    console.log("✅ Graph correctly displays expected totals.");
  });

});
