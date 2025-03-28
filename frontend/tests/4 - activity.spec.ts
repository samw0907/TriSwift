import { test, expect } from '@playwright/test';

test.describe('Activity Management Tests', () => {
  let todayISO: string;

  test.beforeEach(async ({ page }) => {
    todayISO = new Date().toISOString().split('T')[0];

    console.log("🔑 Logging in before each test...");
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'seeduser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/home');
    console.log("✅ Logged in successfully.");
  });

  async function createSessionWithActivity(page) {
    await page.goto('http://localhost:3000/dashboard');
    await page.click('button:has-text("Add Session")');
    await page.waitForSelector('input[name="date"]');
    await page.selectOption('select[name="sessionType"]', 'Bike');
    await page.fill('input[name="date"]', todayISO);
    await page.click('button[type="submit"]');
    await page.waitForSelector('form.activity-form');

    await page.fill('input[name="hours"]', '0');
    await page.fill('input[name="minutes"]', '12');
    await page.fill('input[name="seconds"]', '12');
    await page.fill('input[name="distance"]', '12.00');
    await page.click('button[type="submit"]');

    await page.waitForSelector('form.activity-form', { state: 'hidden' });
    await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle" });

    const sessionCard = page.locator('li.session-card').filter({ hasText: todayISO }).first();
    await sessionCard.waitFor({ state: 'visible' });

    return sessionCard;
  }

  test('User can add an activity to a session', async ({ page }) => {
    const sessionCard = await createSessionWithActivity(page);

    await sessionCard.locator('button:has-text("Show Details")').click();
    await expect(sessionCard).toContainText('Bike');
    await expect(sessionCard).toContainText('Distance: 12.00 km');
    await expect(sessionCard).toContainText('Duration: 0h 12m 12s');

    console.log("✅ Activity successfully added and verified!");
  });

  test('User can edit an activity', async ({ page }) => {
    const sessionCard = await createSessionWithActivity(page);

    await sessionCard.locator('button:has-text("Show Details")').click();
    await sessionCard.locator('button:has-text("Edit Activity")').first().click();
    await page.waitForSelector('form.edit-activity-form');

    await page.fill('input[name="distance"]', '6.00');
    await page.click('button[type="submit"]');
    
    await expect(sessionCard).toContainText('6.00 km');

    console.log("✅ Activity updated successfully!");
  });

  test('User can delete an activity', async ({ page }) => {
    const sessionCard = await createSessionWithActivity(page);

    await sessionCard.locator('button:has-text("Show Details")').click();

    page.once('dialog', dialog => dialog.accept());

    await sessionCard.locator('button:has-text("Delete Activity")').click();
    await expect(sessionCard).not.toContainText('12.00 km');

    console.log("✅ Activity deleted successfully!");
  });
});
