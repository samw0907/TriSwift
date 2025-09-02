import { test, expect } from '@playwright/test';

const cardLocator = '.grid-container .session-card, ul.session-list li.session-card';

const formatDDMMYY = (isoDate: string) => {
  const d = new Date(isoDate);
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: '2-digit', year: '2-digit',
  }).format(d);
};

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const distanceRegex = (val: string) => {
  const n = Number.parseFloat(val);
  const rounded = n.toFixed(1);
  const full = n.toFixed(2);
  return new RegExp(`(?:${escapeRegExp(rounded)}|${escapeRegExp(full)})\\s*km`, 'i');
};

async function login(page) {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="email"]', 'seeduser@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:3000/home');
}

async function createBikeSessionWithActivity(page, distance = '12.00', h = '0', m = '12', s = '12') {
  await page.goto('http://localhost:3000/dashboard');

  const addSessionButton = page.getByRole('button', { name: /add session/i });
  await expect(addSessionButton).toBeVisible();
  await addSessionButton.click();

  await page.waitForSelector('input[name="date"]', { timeout: 5000 });

  const todayISO = new Date().toISOString().split('T')[0];
  const todayDisplay = formatDDMMYY(todayISO);

  await page.selectOption('select[name="sessionType"]', 'Bike');
  await page.fill('input[name="date"]', todayISO);

  await page.click('button[type="submit"]');

  await page.waitForSelector('form.activity-form', { timeout: 5000 });

  await page.fill('input[name="hours"]', h);
  await page.fill('input[name="minutes"]', m);
  await page.fill('input[name="seconds"]', s);
  await page.fill('input[name="distance"]', distance);

  await page.click('button[type="submit"]');

  await page.waitForSelector('form.activity-form', { state: 'hidden', timeout: 5000 });

  const sessionCard = page
    .locator(cardLocator)
    .filter({ has: page.locator('.session-top-row h3', { hasText: 'Bike' }) })
    .filter({ has: page.locator('.session-date', { hasText: todayDisplay }) }).first();

  await expect(sessionCard).toBeVisible({ timeout: 10000 });
  return sessionCard;
}

test.describe('Activity Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('User can add an activity to a session', async ({ page }) => {
    const sessionCard = await createBikeSessionWithActivity(page, '12.00', '0', '12', '12');

    await sessionCard.click();
    const expanded = sessionCard.locator('.session-details');
    await expect(expanded).toBeVisible();

    await expect(sessionCard).toContainText(/bike/i);

    await expect(sessionCard).toContainText(distanceRegex('12.00'), { timeout: 5000 });

    await expect(sessionCard).toContainText(/00:12:12/, { timeout: 5000 });
  });

  test('User can edit an activity', async ({ page }) => {
    const sessionCard = await createBikeSessionWithActivity(page, '12.00', '0', '10', '00');

    await sessionCard.click();
    const expanded = sessionCard.locator('.session-details');
    await expect(expanded).toBeVisible();

    const editSessionBtn = expanded.getByTitle(/edit session/i);
    await expect(editSessionBtn).toBeVisible();
    await editSessionBtn.click();

    const editor = page.locator('.edit-session-wrapper');
    await expect(editor).toBeVisible({ timeout: 5000 });

    const activityCard = editor.locator('.activity-card').first();
    const distanceRow = activityCard.locator('.field-row', { hasText: /^Distance/ });
    const distanceInput = distanceRow.locator('input.control');
    await expect(distanceInput).toBeVisible({ timeout: 5000 });

    await distanceInput.fill('6.00');

    const saveBtn = editor.getByRole('button', { name: /^save$/i });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    await expect(sessionCard).toContainText(distanceRegex('6.00'), { timeout: 5000 });
  });

  test('User can delete an activity', async ({ page }) => {
    const sessionCard = await createBikeSessionWithActivity(page, '6.00', '0', '06', '00');

    await sessionCard.click();
    const expanded = sessionCard.locator('.session-details');
    await expect(expanded).toBeVisible();

    const editSessionBtn = expanded.getByTitle(/edit session/i);
    await expect(editSessionBtn).toBeVisible();
    await editSessionBtn.click();

    const editor = page.locator('.edit-session-wrapper');
    await expect(editor).toBeVisible({ timeout: 5000 });

    const activityCard = editor.locator('.activity-card').first();
    const distanceRow = activityCard.locator('.field-row', { hasText: /^Distance/ });
    const distanceInput = distanceRow.locator('input.control');
    await expect(distanceInput).toBeVisible({ timeout: 5000 });

    await distanceInput.fill('0');

    const saveBtn = editor.getByRole('button', { name: /^save$/i });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    await expect(sessionCard).not.toContainText(distanceRegex('6.00'), { timeout: 5000 });
  });
});
