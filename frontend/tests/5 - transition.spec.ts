import { test, expect } from '@playwright/test';

test.describe('Transition Management Tests', () => {
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

  async function createSessionWithTransition(page) {
    await page.goto('http://localhost:3000/dashboard');
    await page.click('button:has-text("Add Session")');
    await page.waitForSelector('input[name="date"]');

    await page.selectOption('select[name="sessionType"]', 'Multi-Sport');
    await page.fill('input[name="date"]', todayISO);
    await page.click('button[type="submit"]');

    await page.waitForSelector('form.activity-form');
    await page.selectOption('select[name="sportType"]', 'Swim');
    await page.fill('input[name="hours"]', '0');
    await page.fill('input[name="minutes"]', '20');
    await page.fill('input[name="seconds"]', '0');
    await page.fill('input[name="distance"]', '5.00');
    await page.click('button[type="submit"]');

    await page.waitForSelector('form.transition-form');
    await page.selectOption('select[name="previousSport"]', 'Swim');
    await page.selectOption('select[name="nextSport"]', 'Bike');
    await page.fill('input[name="minutes"]', '0');
    await page.fill('input[name="seconds"]', '45');
    await page.click('button[type="submit"]');

    await page.click('button:has-text("Save & Close")');

    await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle" });

    const sessionCard = page.locator('li.session-card').filter({ hasText: todayISO }).first();
    await sessionCard.waitFor({ state: 'visible' });

    return sessionCard;
  }

  test('User can add a transition to a session', async ({ page }) => {
    const sessionCard = await createSessionWithTransition(page);

    await sessionCard.locator('button:has-text("Show Details")').click();
    await expect(sessionCard).toContainText('Swim → Bike');
    await expect(sessionCard).toContainText('Transition Time: 0h 0m 45s');

    console.log("✅ Transition successfully added and verified!");
  });

  test('User can edit a transition', async ({ page }) => {
    const sessionCard = await createSessionWithTransition(page);

    await sessionCard.locator('button:has-text("Show Details")').click();
    await sessionCard.locator('button:has-text("Edit Transition")').first().click();
    await page.waitForSelector('form.transition-form');

    await page.fill('input[name="minutes"]', '0');
    await page.fill('input[name="seconds"]', '30');
    await page.click('button[type="submit"]');

    await expect(sessionCard).toContainText('Transition Time: 0h 0m 30s');

    console.log("✅ Transition updated successfully!");
  });

  test('User can delete a transition', async ({ page }) => {
    const sessionCard = await createSessionWithTransition(page);

    await sessionCard.locator('button:has-text("Show Details")').click();

    page.once('dialog', dialog => dialog.accept());

    await sessionCard.locator('button:has-text("Delete Transition")').click();
    await expect(sessionCard).not.toContainText('Swim → Bike');

    console.log("✅ Transition deleted successfully!");
  });
});
