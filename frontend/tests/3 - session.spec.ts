import { test, expect } from '@playwright/test';

test.describe('Session Management Tests', () => {
  let createdType = 'Run';
  let createdDateISO = '';
  let createdDateDisplay = '';
  const createdDistance = '12.34';
  const createdDuration = { hrs: '0', mins: '10', secs: '30' };

  const formatDDMMYY = (isoDate: string) => {
    const d = new Date(isoDate);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }).format(d);
  };

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'seeduser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page.getByRole('heading', { name: /your training overview/i }))
      .toBeVisible({ timeout: 15000 });
  });

  test('User can create a new session (with activity)', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    const cards = page.locator('.grid-container .session-card');
    const beforeCount = await cards.count();

    await page.getByRole('button', { name: /add session/i }).click();

    createdDateISO = new Date().toISOString().split('T')[0];
    createdDateDisplay = formatDDMMYY(createdDateISO);

    await page.selectOption('select[name="sessionType"]', createdType);
    await page.fill('input[name="date"]', createdDateISO);
    await page.getByRole('button', { name: /next/i }).click();

    await page.getByPlaceholder('Hrs').fill(createdDuration.hrs);
    await page.getByPlaceholder('Mins').fill(createdDuration.mins);
    await page.getByPlaceholder('Secs').fill(createdDuration.secs);
    await page.locator('input#distance, input[name="distance"]').fill(createdDistance);

    await page.getByRole('button', { name: /submit activity|submit & close|add & next/i }).click();

    await expect(cards).toHaveCount(beforeCount + 1, { timeout: 10000 });

    const createdCard = page
      .locator('.session-card')
      .filter({ has: page.locator('.session-top-row h3', { hasText: createdType }) })
      .filter({ has: page.locator('.session-date', { hasText: createdDateDisplay }) }).first();

    await expect(createdCard).toBeVisible();

    const rounded = Number.parseFloat(createdDistance).toFixed(1);
    const distanceEitherRoundedOrFull = new RegExp(
      `(?:${escapeRegExp(rounded)}|${escapeRegExp(createdDistance)})\\s*km`,
      'i'
    );

    const topStats = createdCard.locator('.session-top-row .session-stats');
    await expect(topStats).toContainText(/00:10:30/);
    await expect(topStats).toContainText(distanceEitherRoundedOrFull);
  });

  test('User can edit the created session', async ({ page }) => {
    if (!createdDateISO) throw new Error('No previously created session; run create test first.');

    await page.goto('http://localhost:3000/dashboard');

    const targetCard = page
      .locator('.session-card')
      .filter({ has: page.locator('.session-top-row h3', { hasText: createdType }) })
      .filter({ has: page.locator('.session-date', { hasText: createdDateDisplay }) }).first();

    await expect(targetCard).toBeVisible();

    await targetCard.click();
    const expanded = targetCard.locator('.session-details');
    await expect(expanded).toBeVisible();

    await expanded.getByTitle(/edit session/i).click();

    const editor = page.locator('.edit-session-wrapper');
    await expect(editor).toBeVisible();

    const tempRow = editor.locator('.field-row', { hasText: 'Temp (°C)' }).first();
    await tempRow.locator('input[type="number"]').fill('25');

    await editor.getByRole('button', { name: /^save$/i }).click();

    await expect(expanded.getByText(/weather/i)).toBeVisible();
    await expect(expanded.getByText(/25\s*°c/i)).toBeVisible();
  });

test('User can delete the created session', async ({ page }) => {
  if (!createdDateISO) throw new Error('No previously created session; run create test first.');

  await page.goto('http://localhost:3000/dashboard');

  const targetCard = page
    .locator('.session-card')
    .filter({ has: page.locator('.session-top-row h3', { hasText: createdType }) })
    .filter({ has: page.locator('.session-date', { hasText: createdDateDisplay }) }).first();

  await expect(targetCard).toBeVisible();

  await targetCard.click();
  const expanded = targetCard.locator('.session-details');
  await expect(expanded).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await expanded.getByTitle(/delete session/i).click();

  await expect(targetCard).toHaveCount(0, { timeout: 10000 });
});
});
