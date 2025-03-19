import { test, expect } from '@playwright/test';

test.use({ storageState: 'auth.json' });
let createdSessionId: string | null = null;
let createdTransitionId: string | null = null;

test.describe('Transition Management Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    console.log("🔑 Checking stored authentication state...");
    await page.goto('http://localhost:3000/home', { waitUntil: 'load' });

    const authToken = await page.evaluate(() => localStorage.getItem('token'));
    if (!authToken) {
      throw new Error("❌ No auth token found in localStorage.");
    }

    console.log("✅ Token retrieved from localStorage");

    console.log("🔍 Verifying Authentication via API...");
    const userResponse = await page.evaluate(async (token) => {
      const response = await fetch("http://localhost:3001/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ query: `query { sessions { id, date } }` }),
      });
      return response.json();
    }, authToken);

    if (!userResponse.data || !userResponse.data.sessions) {
      throw new Error("❌ Authentication failed via API.");
    }

    console.log("✅ Authentication confirmed via API.");
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'load' });
  });

  test('User can add a transition to a session', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    console.log("🖱️ Clicking Add Session...");
    const addSessionButton = page.locator('button', { hasText: 'Add Session' }).first();
    await expect(addSessionButton).toBeVisible();
    await expect(addSessionButton).toBeEnabled();
    await addSessionButton.click();

    await page.waitForSelector('input[name="date"]', { timeout: 5000 });
    console.log("✅ Session form is visible.");

    const todayISO = new Date().toISOString().split('T')[0];

    await page.selectOption('select[name="sessionType"]', 'Multi-Sport');
    await page.fill('input[name="date"]', todayISO);

    console.log("📡 Submitting session creation request...");
    await page.click('button[type="submit"]');

    console.log("✅ Form submission triggered.");

    console.log("🖱️ Clicking 'Next' to go to input form...");
    await page.locator('button', { hasText: 'Next' }).click();

    console.log("🔍 Waiting for Activity form...");
    await page.waitForSelector('form.activity-form', { timeout: 5000 });

    console.log("✍️ Filling activity form...");
    await page.fill('input[name="hours"]', '0');
    await page.fill('input[name="minutes"]', '20');
    await page.fill('input[name="seconds"]', '0');
    await page.fill('input[name="distance"]', '5.00');

    console.log("🖱️ Clicking 'Add Activity'...");
    await page.click('button[type="submit"]');

    console.log("⏳ Waiting for activity to be added...");
    await page.waitForTimeout(3000);

    console.log("🖱️ Clicking 'Add Transition' button...");
    const addTransitionButton = page.locator('button', { hasText: 'Add Transition' });
    await expect(addTransitionButton).toBeVisible();
    await expect(addTransitionButton).toBeEnabled();
    await addTransitionButton.click();

    console.log("🔍 Waiting for Transition form...");
    await page.waitForSelector('form.transition-form', { timeout: 5000 });

    console.log("✍️ Filling transition form...");
    await page.selectOption('select[name="previousSport"]', 'Swim');
    await page.selectOption('select[name="nextSport"]', 'Bike');
    await page.fill('input[name="minutes"]', '0');
    await page.fill('input[name="seconds"]', '45');

    console.log("🖱️ Clicking 'Add Transition'...");
    await page.click('button[type="submit"]');

    console.log("⏳ Waiting for transition to be added...");
    await page.waitForTimeout(3000);

    console.log("📡 Fetching session ID from API...");
    let sessionApiResponse;
    let retries = 3;

    while (retries > 0) {
      sessionApiResponse = await page.evaluate(async () => {
        const token = localStorage.getItem('token');
        const response = await fetch("http://localhost:3001/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ query: `query { sessions { id, date, transitions { id } } }` }),
        });

        return response.json();
      });

      if (sessionApiResponse.data && sessionApiResponse.data.sessions.length) {
        break;
      }

      console.log("⚠️ Session not found yet, retrying...");
      await page.waitForTimeout(2000);
      retries--;
    }

    if (!sessionApiResponse.data || !sessionApiResponse.data.sessions.length) {
      throw new Error("❌ Session not found in API response.");
    }

    createdSessionId = sessionApiResponse.data.sessions.find(
      (session: any) => new Date(session.date).toISOString().split('T')[0] === todayISO
    )?.id || null;

    if (!createdSessionId) {
      throw new Error("❌ Newly created session not found in API response.");
    }

    console.log(`✅ Created Session ID: ${createdSessionId}`);

    createdTransitionId = sessionApiResponse.data.sessions.find(
      (session: any) => session.id === createdSessionId
    )?.transitions[0]?.id || null;

    console.log(`✅ Created Transition ID: ${createdTransitionId}`);

    console.log("🔍 Finding the newly created session...");
    const sessionCard = page.locator(`li.session-card[data-session-id="${createdSessionId}"]`);
    await sessionCard.waitFor({ state: 'visible', timeout: 5000 });

    console.log("🖱️ Clicking 'Show Details'...");
    await sessionCard.locator('button', { hasText: 'Show Details' }).click();
    await page.waitForTimeout(1000);

    console.log("🔍 Verifying transition details...");
    await expect(sessionCard).toContainText('Swim → Bike');
    await expect(sessionCard).toContainText('Transition Time: 0h 0m 45s');

    console.log("✅ Transition successfully added and verified!");
  });

  test('User can edit a transition', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    console.log("🔍 Finding session card...");
    const sessionCard = page.locator(`li.session-card[data-session-id="${createdSessionId}"]`);
    await sessionCard.waitFor({ state: 'visible', timeout: 5000 });

    console.log("🖱️ Clicking 'Show Details'...");
    await sessionCard.locator('button', { hasText: 'Show Details' }).click();
    await page.waitForTimeout(1000);

    console.log("🖱️ Clicking 'Edit Transition'...");
    await page.locator('button', { hasText: 'Edit Transition' }).first().click();
    await page.waitForSelector('form.transition-form', { timeout: 5000 });

    console.log("✍️ Updating transition time...");
    await page.fill('input[name="minutes"]', '0');
    await page.fill('input[name="seconds"]', '30');
    await page.click('button[type="submit"]');

    console.log("⏳ Waiting for transition update...");
    await page.waitForTimeout(3000);
    await expect(sessionCard).toContainText('Transition Time: 0h 0m 30s');

    console.log("✅ Transition updated successfully!");
  });

  test('User can delete a transition', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    console.log("🔍 Finding session card...");
    const sessionCard = page.locator(`li.session-card[data-session-id="${createdSessionId}"]`);
    await sessionCard.waitFor({ state: 'visible', timeout: 5000 });

    console.log("🖱️ Clicking 'Show Details'...");
    await sessionCard.locator('button', { hasText: 'Show Details' }).click();
    await page.waitForTimeout(1000);

    console.log("⚠️ Setting up dialog handler for window.confirm()...");
    page.once('dialog', async (dialog) => {
        console.log(`🗨️ Dialog Message: ${dialog.message()}`);
        if (dialog.message().includes("Are you sure you want to delete this transition?")) {
            await dialog.accept();
        } else {
            await dialog.dismiss();
        }
    });

    console.log("🗑️ Clicking 'Delete Transition'...");
    await page.locator('button', { hasText: 'Delete Transition' }).click();

    console.log("⏳ Waiting for transition to be removed...");
    await page.waitForTimeout(3000);
    await expect(sessionCard).not.toContainText('Swim → Bike');

    console.log("✅ Transition deleted successfully!");
  });
});
