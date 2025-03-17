import { test, expect } from '@playwright/test';

test.use({ storageState: 'auth.json' });

let createdSessionId: string | null = null;

test.describe('Session Management Tests', () => {

  test('User can create a new session', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    // Debugging: Capture console logs
    page.on('console', (msg) => console.log(`🖥️ Console Log: ${msg.text()}`));

    // Debugging: Capture network requests
    page.on('request', (request) => {
      console.log(`📡 REQUEST: ${request.method()} ${request.url()}`);
    });

    page.on('response', async (response) => {
      if (response.url().includes('/graphql')) {
        console.log(`📡 GraphQL Response (${response.status()}): ${await response.text()}`);
      }
    });

    // Click "Add Session" button
    const addSessionButton = page.locator('button', { hasText: 'Add Session' });
    await expect(addSessionButton).toBeVisible();
    await addSessionButton.click();

    // Fill session details
    await page.waitForSelector('input[name="date"]');
    await page.fill('input[name="date"]', '2025-03-17');
    await page.selectOption('select[name="sessionType"]', 'Run');
    await page.fill('input[name="weatherTemp"]', '20');
    await page.fill('input[name="weatherHumidity"]', '60');
    await page.fill('input[name="weatherWindSpeed"]', '10');

    // Submit session
    await page.click('button', { hasText: 'Next' });

    console.log("⏳ Waiting for session list update...");
    await page.waitForTimeout(5000); // Give GraphQL more time
    await page.reload(); // Force UI refresh

    // Print full page content for debugging
    console.log("🛑 FULL PAGE CONTENT:");
    console.log(await page.content());

    // Ensure the session list appears
    const sessionList = page.locator('.session-list-container');
    await expect(sessionList).toBeVisible({ timeout: 15000 });

    // Count session cards
    const sessionCards = page.locator('.session-card');
    const sessionCount = await sessionCards.count();
    console.log(`=== TOTAL SESSION CARDS FOUND: ${sessionCount} ===`);

    if (sessionCount === 0) {
      throw new Error("❌ No session cards found. Possible UI update issue.");
    }

    // Validate the new session appears
    const correctSession = sessionCards.filter({
      has: page.locator('.session-info h3', { hasText: 'Run' }),
    });

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
