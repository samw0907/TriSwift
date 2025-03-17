import { test, expect } from '@playwright/test';

test.use({ storageState: 'auth.json' });

let createdSessionId: string | null = null;

test.describe('Session Management Tests', () => {

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

    await page.waitForTimeout(1000);

    const sessionCards = await page.locator('li.session-card').allInnerTexts();
    console.log("=== SESSION CARDS FOUND ===");
    console.log(sessionCards);

    // Find session with correct type & date
    const correctSession = page.locator('li.session-card').filter({
      has: page.locator('div.session-info > h3', { hasText: 'Run' }),
    }).filter({
      has: page.locator('div.session-info > p.session-date', { hasText: '17/03/2025' }),
    });

    // Debug: Log number of matching sessions
    const count = await correctSession.count();
    console.log(`=== MATCHING SESSIONS FOUND: ${count} ===`);

    // Fail here if no matching sessions found
    if (count === 0) {
      throw new Error("❌ No matching session found. Check selectors and session list update.");
    }

    await expect(correctSession).toBeVisible({ timeout: 7000 });

    createdSessionId = await correctSession.getAttribute('data-session-id');
    console.log('✅ Created Session ID:', createdSessionId);

    await page.waitForSelector('input[name="distance"]');
    await expect(page.locator('input[name="distance"]')).toBeVisible();
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
