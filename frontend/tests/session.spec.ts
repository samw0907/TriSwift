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

    console.log("⏳ Waiting for session list to update...");
    await page.waitForTimeout(5000);  // Give GraphQL more time
    await page.reload();  // Force UI refresh

    // 🚀 Print full page content to debug
    const pageContent = await page.content();
    console.log("🛑 FULL PAGE CONTENT BEFORE FAILURE:");
    console.log(pageContent);

    // 🚀 Print all elements on the page
    const allElements = await page.evaluate(() => [...document.body.querySelectorAll('*')].map(el => el.className));
    console.log("🛑 ALL ELEMENTS ON PAGE:", allElements);

    // 🔥 Check if session list exists
    await page.waitForSelector('.session-list-container', { timeout: 10000 });

    // Check if any session cards are found
    const sessionCount = await page.locator('li.session-card').count();
    console.log(`=== TOTAL SESSION CARDS FOUND: ${sessionCount} ===`);

    if (sessionCount === 0) {
      throw new Error("❌ No session cards found. Possible issue with session list update.");
    }

    // Extract actual date format from session list
    const firstSessionDate = await page.locator('p.session-date').first().textContent();
    console.log("🚀 FORMATTED DATE FROM PAGE:", firstSessionDate);

    // Find the correct session based on session type & correct date format
    const correctSession = page.locator('li.session-card').filter({
      has: page.locator('div.session-info h3', { hasText: 'Run' }),
      has: page.locator('p.session-date', { hasText: firstSessionDate }),
    });

    const correctCount = await correctSession.count();
    console.log(`=== MATCHING SESSIONS FOUND: ${correctCount} ===`);

    if (correctCount === 0) {
      throw new Error("❌ No matching session found. Check selectors and session list update.");
    }

    await expect(correctSession).toBeVisible({ timeout: 7000 });

    createdSessionId = await correctSession.getAttribute('data-session-id');
    console.log('✅ Created Session ID:', createdSessionId);
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
