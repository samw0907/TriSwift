import { test, expect } from '@playwright/test';

test.describe('Pace Calculator Tests', () => {

  test.beforeEach(async ({ page }) => {
    console.log("Logging in...");
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'seeduser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/home');
    console.log("Logged in successfully.");

    console.log("Navigating to Pace Calculator...");
    await page.goto('http://localhost:3000/paceCalculator');
    await expect(page.locator('h2')).toHaveText('Pace Calculator');
  });

  test('User can calculate pace for preset distance', async ({ page }) => {
    console.log("Selecting 'Run' as sport type...");
    await page.selectOption('#sport-select', 'Run');

    console.log("Selecting preset distance: 5km...");
    await page.selectOption('#distance-select', '5km');

    console.log("Entering target time (25 mins)...");
    await page.fill('#hours-input', '0');
    await page.fill('#minutes-input', '25');
    await page.fill('#seconds-input', '0');

    console.log("Clicking Calculate...");
    await page.click('.pace-buttons button');

    console.log("Verifying pace...");
    await expect(page.locator('h3')).toHaveText(/5:00 min\/km/);
    console.log("Pace calculation successful.");
  });

  test('User can calculate speed for custom distance', async ({ page }) => {
    console.log("Selecting 'Bike' as sport type...");
    await page.selectOption('#sport-select', 'Bike');

    console.log("Entering custom distance (20km)...");
    await page.fill('#custom-distance', '20');

    console.log("Entering target time (40 mins)...");
    await page.fill('#hours-input', '0');
    await page.fill('#minutes-input', '40');
    await page.fill('#seconds-input', '0');

    console.log("Clicking Calculate...");
    await page.click('.pace-buttons button');

    console.log("Verifying speed...");
    await expect(page.locator('h3')).toHaveText(/30\.0 km\/h/);
    console.log("Speed calculation successful.");
  });

  test('Gracefully handles invalid input', async ({ page }) => {
    console.log("Selecting 'Run' as sport type...");
    await page.selectOption('#sport-select', 'Run');

    console.log("Entering zero values for distance and time...");
    await page.fill('#custom-distance', '0');
    await page.fill('#hours-input', '0');
    await page.fill('#minutes-input', '0');
    await page.fill('#seconds-input', '0');

    console.log("Clicking Calculate...");
    await page.click('.pace-buttons button');

    console.log("Checking for error message...");
    await expect(page.locator('h3')).toHaveText(/Invalid input/i);
    console.log("Error handling confirmed.");
  });
});
