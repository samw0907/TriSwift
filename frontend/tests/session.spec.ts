import { test, expect } from '@playwright/test';

test.use({ storageState: 'auth.json' });
let createdSessionId: string | null = null;

test.describe('Session Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    console.log("🔑 Checking stored authentication state...");
  
    await page.goto('http://localhost:3000/home', { waitUntil: 'load' });

    const authToken = await page.evaluate(() => localStorage.getItem('token'));
    if (!authToken) {
      throw new Error("❌ No auth token found in localStorage.");
    }

    console.log(`✅ Token retrieved from localStorage`);

    console.log("🔍 Verifying Authentication via API...");
    const userResponse = await page.evaluate(async (token) => {
      const response = await fetch("http://localhost:3001/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ query: "query { sessions { id } }" }),
      });
      return response.json();
    }, authToken);

    if (!userResponse.data || !userResponse.data.sessions) {
      throw new Error("❌ Authentication failed via API.");
    }

    console.log("✅ Authentication confirmed via API.");
  });

  test('User can create a new session', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    page.on('request', request => {
      console.log(`📡 Request Sent: ${request.url()} - Method: ${request.method()}`);
      if (request.postData()) console.log("📡 Request Body:", request.postData());
    });

    page.on('response', response => {
      console.log(`📡 Response Received: ${response.url()} - Status: ${response.status()}`);
      response.text().then(body => console.log("📡 Response Body:", body));
    });

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
    
    await page.locator("form.session-form").evaluate(form => form.submit());

    console.log("✅ Form submission triggered.");

    await page.waitForTimeout(2000);

    console.log("📡 Fetching sessions from API...");

    let sessionApiResponse;
    let retries = 3;

    while (retries > 0) {
      console.log(`🔄 Attempt ${4 - retries} to fetch sessions...`);
      sessionApiResponse = await page.evaluate(async () => {
        const token = localStorage.getItem('token');

        const response = await fetch("http://localhost:3001/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ query: "query { sessions { id } }" }),
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
    test.skip(!createdSessionId, 'Skipping test because session creation failed');
    await page.goto('http://localhost:3000/dashboard');

    const sessionCard = page.locator(`li.session-card[data-session-id="${createdSessionId}"]`);
    await sessionCard.waitFor({ state: 'visible', timeout: 5000 });

    const tempInput = page.locator('input[name="weatherTemp"]');
    await tempInput.fill('25');

    await page.click('button', { hasText: 'Save' });

    await expect(sessionCard).toContainText('Temp - 25°C');
  });

  test('User can delete a session', async ({ page }) => {
    test.skip(!createdSessionId, 'Skipping test because session creation failed');
    await page.goto('http://localhost:3000/dashboard');

    const sessionCard = page.locator(`li.session-card[data-session-id="${createdSessionId}"]`);
    await sessionCard.waitFor({ state: 'visible', timeout: 5000 });

    await page.waitForSelector('.confirm-dialog');
    await page.click('button', { hasText: 'Confirm' });

    await expect(sessionCard).not.toBeVisible();
  });
});
