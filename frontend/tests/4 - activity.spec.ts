import { test, expect } from '@playwright/test';

test.use({ storageState: 'auth.json' });
let createdSessionId: string | null = null;

test.describe('Activity Management Tests', () => {

test.beforeEach(async ({ page }) => {
  console.log("🔑 Checking stored authentication state...");
  await page.goto('https://triswift-frontend.fly.dev/home', { waitUntil: 'load' });

  const authToken = await page.evaluate(() => localStorage.getItem('token'));
  if (!authToken) {
    throw new Error("❌ No auth token found in localStorage.");
  }

  console.log("✅ Token retrieved from localStorage");

  console.log("🔍 Verifying Authentication via API...");
  const userResponse = await page.evaluate(async (token) => {
    const response = await fetch("https://triswift-backend.fly.dev/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ 
        query: `query { sessions { id, date } }`
      }),
    });
    return response.json();
  }, authToken);

  if (!userResponse.data || !userResponse.data.sessions) {
    throw new Error("❌ Authentication failed via API.");
  }

  console.log("✅ Authentication confirmed via API.");

  console.log("🚀 Navigating to the dashboard...");
  await page.goto('https://triswift-frontend.fly.dev/dashboard', { waitUntil: 'load' });
});

test('User can add an activity to a session', async ({ page }) => {
  await page.goto('https://triswift-frontend.fly.dev/dashboard');

  console.log("🖱️ Clicking Add Session...");
  const addSessionButton = page.locator('button', { hasText: 'Add Session' });
  await expect(addSessionButton).toBeVisible();
  await addSessionButton.click();

  await page.waitForSelector('input[name="date"]', { timeout: 5000 });
  console.log("✅ Session form is visible.");

  const todayISO = new Date().toISOString().split('T')[0];

  await page.selectOption('select[name="sessionType"]', 'Bike');
  await page.fill('input[name="date"]', todayISO);

  console.log("📡 Submitting session creation request...");
  await page.click('button[type="submit"]');

  console.log("✅ Form submission triggered.");

  // Click Next to proceed to activity form
  console.log("🔍 Waiting for Activity form...");
  await page.waitForSelector('form.activity-form', { timeout: 5000 });

  console.log("✍️ Filling activity form...");
  await page.fill('input[name="hours"]', '0');
  await page.fill('input[name="minutes"]', '12');
  await page.fill('input[name="seconds"]', '12');
  await page.fill('input[name="distance"]', '12.00');

  console.log("🖱️ Clicking 'Submit Activity'...");
  await page.click('button[type="submit"]');

  console.log("⏳ Waiting for form to close...");
  await page.waitForSelector('form.activity-form', { state: 'hidden', timeout: 5000 });

  console.log("📡 Fetching session ID from API...");
  let sessionApiResponse;
  let retries = 3;

  while (retries > 0) {
    sessionApiResponse = await page.evaluate(async () => {
      const token = localStorage.getItem('token');
      const response = await fetch("https://triswift-backend.fly.dev/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ query: `query { sessions { id, date } }` }),
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

  // Find the newly created session
  console.log("🔍 Finding the newly created session...");
  const sessionCard = page.locator(`li.session-card[data-session-id="${createdSessionId}"]`);
  await sessionCard.waitFor({ state: 'visible', timeout: 5000 });

  console.log("🖱️ Clicking 'Show Details'...");
  await sessionCard.locator('button', { hasText: 'Show Details' }).click();
  await page.waitForTimeout(1000);

  console.log("🔍 Verifying activity details...");
  await expect(sessionCard).toContainText('Bike');
  await expect(sessionCard).toContainText('Distance: 12.00 km');
  await expect(sessionCard).toContainText('Duration: 0h 12m 12s');

  console.log("✅ Activity successfully added and verified!");
});

  test('User can edit an activity', async ({ page }) => {
    await page.goto('https://triswift-frontend.fly.dev/dashboard');

    console.log("🔍 Finding session card...");
    const sessionCard = page.locator(`li.session-card[data-session-id="${createdSessionId}"]`);
    await sessionCard.waitFor({ state: 'visible', timeout: 5000 });

    console.log("🖱️ Clicking 'Show Details'...");
    await sessionCard.locator('button', { hasText: 'Show Details' }).click();
    await page.waitForTimeout(1000);

    console.log("🖱️ Clicking 'Edit Activity'...");
    await page.locator('button', { hasText: 'Edit Activity' }).first().click();
    await page.waitForSelector('form.edit-activity-form', { timeout: 5000 });

    console.log("✍️ Updating activity distance...");
    await page.fill('input[name="distance"]', '6.00');
    await page.click('button[type="submit"]');

    console.log("⏳ Waiting for activity update...");
    await page.waitForTimeout(3000);
    await expect(sessionCard).toContainText('6.00 km');

    console.log("✅ Activity updated successfully!");
  });

  test('User can delete an activity', async ({ page }) => {
    await page.goto('https://triswift-frontend.fly.dev/dashboard');

    console.log("🔍 Finding session card...");
    const sessionCard = page.locator(`li.session-card[data-session-id="${createdSessionId}"]`);
    await sessionCard.waitFor({ state: 'visible', timeout: 5000 });

    console.log("🖱️ Clicking 'Show Details'...");
    await sessionCard.locator('button', { hasText: 'Show Details' }).click();
    await page.waitForTimeout(1000);

    console.log("⚠️ Setting up dialog handler for window.confirm()...");
    page.once('dialog', async (dialog) => {
        console.log(`🗨️ Dialog Message: ${dialog.message()}`);
        if (dialog.message().includes("Are you sure you want to delete this activity?")) {
            await dialog.accept();
        } else {
            await dialog.dismiss();
        }
    });

    console.log("🗑️ Clicking 'Delete Activity'...");
    const deleteActivityButton = sessionCard.locator('button', { hasText: 'Delete Activity' });
    await deleteActivityButton.click();

    console.log("⏳ Waiting for activity to be removed...");
    await page.waitForTimeout(3000);

    console.log("⏳ Waiting for activity to be removed...");
    await page.waitForTimeout(3000);
    await expect(sessionCard).not.toContainText('6.00 km');

    console.log("✅ Activity deleted successfully!");
  });
});
