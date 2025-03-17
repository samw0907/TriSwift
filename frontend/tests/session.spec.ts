import { test, expect } from '@playwright/test';

test.use({ storageState: 'auth.json' });

let createdSessionId: string | null = null;

test.describe('Session Management Tests', () => {

  test('Ensure at least one session card exists', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    const sessionCards = page.locator('li.session-card');
    const sessionCount = await sessionCards.count();

    console.log(`=== SESSION CARDS FOUND INITIALLY: ${sessionCount} ===`);

    if (sessionCount === 0) {
      throw new Error("❌ No session cards found on load. Check if sessions are rendering correctly.");
    }

    await expect(sessionCards).toBeVisible();
  });

  test('User can create a new session', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    const addSessionButton = page.locator('button', { hasText: 'Add Session' });
    await expect(addSessionButton).toBeVisible();
    await addSessionButton.click();

    await page.waitForSelector('input[name="date"]');

    await page.fill('input[name="date"]', '2025-03-17');
    await page.selectOption('select[name="sessionType"]', 'Run');
    await page.fill('input[name="weatherTemp"]', '20');
    await page.fill('input[name="weatherHumidity"]', '60');
    await page.fill('input[name="weatherWindSpeed"]', '10');

    await page.click('button', { hasText: 'Next' });

    await page.waitForResponse(response => response.url().includes('/graphql') && response.status() === 200);

    await page.waitForTimeout(2000);

    const sessionCards = page.locator('li.session-card');
    const countAfter = await sessionCards.count();
    console.log(`=== SESSION CARDS AFTER CREATION: ${countAfter} ===`);
  
    if (countAfter === 0) {
      throw new Error("❌ Session not found after creation. API might be slow.");
    }
  
    await expect(sessionCards).toBeVisible();
  });

  test('User can edit an existing session', async ({ page }) => {
    test.skip(!createdSessionId, 'Skipping test because session creation failed');
    await page.goto('http://localhost:3000/dashboard');

    const sessionCard = page.locator('.session-card', { hasText: 'Run' });
    await sessionCard.getByRole('button', { name: 'Edit' }).click();

    const tempInput = page.locator('input[name="weatherTemp"]');
    await tempInput.fill('25');

    await page.click('button', { hasText: 'Save' });

    await expect(sessionCard).toContainText('Temp - 25°C');
  });

  test('User can delete a session', async ({ page }) => {
    test.skip(!createdSessionId, 'Skipping test because session creation failed');
    await page.goto('http://localhost:3000/dashboard');

    const sessionCard = page.locator('.session-card', { hasText: 'Run' });
    await sessionCard.getByRole('button', { name: 'Delete' }).click();

    await page.waitForSelector('.confirm-dialog');
    await page.click('button', { hasText: 'Confirm' });

    await expect(sessionCard).not.toBeVisible();
  });

});
