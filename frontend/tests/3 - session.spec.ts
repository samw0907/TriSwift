import { test, expect } from '@playwright/test';

test.use({ storageState: 'auth.json' });
let createdSessionId: string | null = null;

test.describe('Session Management Tests', () => {
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
  });

  test('User can create a new session', async ({ page }) => {
    await page.goto('https://triswift-frontend.fly.dev/dashboard');

    const addSessionButton = page.locator('button', { hasText: 'Add Session' });
    await expect(addSessionButton).toBeVisible();

    console.log("🖱️ Clicking Add Session...");
    await addSessionButton.click();

    await page.waitForSelector('input[name="date"]', { timeout: 5000 });

    console.log("✅ Session form is visible.");

    const todayISO = new Date().toISOString().split('T')[0];

    await page.selectOption('select[name="sessionType"]', 'Run');
    await page.fill('input[name="date"]', todayISO);

    console.log("📡 Submitting session creation request...");
    
    await page.click('button[type="submit"]');

    console.log("✅ Form submission triggered.");

    console.log("⏳ Waiting for UI to update...");
    await page.waitForTimeout(3000);

    console.log("🔄 Refreshing the dashboard...");
    await page.goto("https://triswift-frontend.fly.dev/dashboard", { waitUntil: "networkidle" });

    console.log("📡 Fetching sessions from API...");

    let sessionApiResponse;
    let retries = 3;

    while (retries > 0) {
      console.log(`🔄 Attempt ${4 - retries} to fetch sessions...`);
      sessionApiResponse = await page.evaluate(async () => {
        const token = localStorage.getItem('token');

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
      (session: any) => {
        const sessionDate = new Date(session.date).toISOString().split('T')[0];
        return sessionDate === todayISO;
      }
    )?.id || null;

    if (!createdSessionId) {
      throw new Error("❌ Newly created session not found in API response.");
    }

    console.log(`✅ Created Session ID: ${createdSessionId}`);
  });

  test('User can edit an existing session', async ({ page }) => {
    await page.goto('https://triswift-frontend.fly.dev/dashboard');

    console.log("🔍 Locating session card...");
    const sessionCard = page.locator(`li.session-card[data-session-id="${createdSessionId}"]`);
    await sessionCard.waitFor({ state: 'visible', timeout: 5000 });

    console.log("🖱️ Clicking Edit button...");
    await sessionCard.locator('button', { hasText: 'Edit' }).click();

    console.log("⏳ Waiting for edit form...");
    const editForm = page.locator('.session-edit-form');
    await editForm.waitFor({ state: 'visible', timeout: 5000 });

    console.log("✍️ Editing session...");
    const tempInput = page.locator('input[name="weatherTemp"]');
    await tempInput.fill('25');

    console.log("✅ Clicking Save button...");
    await editForm.locator('button[type="submit"]').click();

    console.log("🖱️ Clicking 'Show Details' to verify the update...");
    await sessionCard.locator('button', { hasText: 'Show Details' }).click();

    console.log("🔍 Checking updated text...");
    await expect(sessionCard).toContainText('Temp - 25°C');
  });

  test('User can delete a session', async ({ page }) => {
    await page.goto('https://triswift-frontend.fly.dev/dashboard');

    console.log("🔍 Finding session card...");
    const sessionCard = page.locator(`li.session-card[data-session-id="${createdSessionId}"]`);
    await sessionCard.waitFor({ state: 'visible', timeout: 5000 });

    console.log("⚠️ Setting up dialog handler for window.confirm()...");
    page.once('dialog', async (dialog) => {
        console.log(`🗨️ Dialog Message: ${dialog.message()}`);
        if (dialog.message().includes("Are you sure you want to delete this session?")) {
            await dialog.accept();
        } else {
            await dialog.dismiss();
        }
    });

    console.log("🗑️ Clicking Delete button...");
    await sessionCard.locator('button.btn-danger').click();

    console.log("⏳ Waiting for session to be removed from DOM...");
    await page.waitForFunction(
        (id) => !document.querySelector(`li.session-card[data-session-id="${id}"]`),
        createdSessionId
    );

    console.log("✅ Confirming session is removed from list...");
    await expect(page.locator(`li.session-card[data-session-id="${createdSessionId}"]`)).not.toBeVisible();
  });
});
