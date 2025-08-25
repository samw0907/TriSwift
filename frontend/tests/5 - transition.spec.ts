import { test, expect } from '@playwright/test';

let todayISO: string;
let transitionTag: string;

const cardLocator = '.grid-container .session-card, ul.session-list li.session-card';

async function openFiltersAndSelectMultiSport(page) {
  await page.locator('button.btn-filter-toggle').click();
  await page.getByRole('checkbox', { name: 'Multi-Sport' }).check();
  const minDistanceInput = page.locator('.filter-options .trio-row .trio-item').nth(0).locator('input');
  const maxDistanceInput = page.locator('.filter-options .trio-row .trio-item').nth(1).locator('input');
  await minDistanceInput.fill('1');
  await maxDistanceInput.fill('1');
}

async function ensureExpanded(page, card) {
  const details = card.locator('.session-details');
  const visible = await details.isVisible().catch(() => false);
  if (!visible) {
    await card.click();
    await details.waitFor({ state: 'visible', timeout: 7000 });
  }
  return details;
}

async function findCardByTransitionTag(page, tag: string) {
  const cards = page.locator(cardLocator);
  const count = await cards.count();
  for (let i = 0; i < count; i++) {
    const c = cards.nth(i);
    const details = await ensureExpanded(page, c);
    const notesRow = details.locator('.metric-row').filter({ has: page.locator('.metric-label', { hasText: /^Notes$/i }) });
    if (await notesRow.filter({ has: page.locator('.metric-value', { hasText: tag }) }).count()) {
      return c;
    }
    await c.click();
  }
  throw new Error('Tagged session not found');
}

test.describe('Transition Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    todayISO = new Date().toISOString().split('T')[0];
    if (!transitionTag) transitionTag = `E2E-${Date.now()}`;
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'seeduser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/home');
  });

  test('User can add a transition to a session', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    const addSessionButton = page.getByRole('button', { name: /add session/i }).first();
    await addSessionButton.click();

    await page.waitForSelector('input[name="date"]', { timeout: 5000 });
    await page.selectOption('select[name="sessionType"]', 'Multi-Sport');
    await page.fill('input[name="date"]', todayISO);
    await page.click('button[type="submit"]');

    await page.waitForSelector('form.activity-form', { timeout: 7000 });
    await page.selectOption('select[name="sportType"]', 'Swim');
    await page.fill('input[name="hours"]', '0');
    await page.fill('input[name="minutes"]', '20');
    await page.fill('input[name="seconds"]', '0');
    await page.fill('input[name="distance"]', '1000');
    await page.click('form.activity-form button[type="submit"]');

    await page.waitForSelector('form.transition-form', { timeout: 7000 });
    await page.selectOption('select[name="previousSport"]', 'Swim');
    await page.selectOption('select[name="nextSport"]', 'Bike');
    await page.fill('form.transition-form input[name="minutes"]', '0');
    await page.fill('form.transition-form input[name="seconds"]', '45');

    const comments = page.locator('form.transition-form textarea[name="comments"], form.transition-form textarea');
    if (await comments.count()) {
      await comments.first().fill(transitionTag);
    }

    const saveCloseBtn = page.getByRole('button', { name: /^save\s*&\s*close$/i });
    await expect(saveCloseBtn).toBeVisible({ timeout: 5000 });
    await saveCloseBtn.click();
    await page.waitForSelector('.edit-session-wrapper', { state: 'detached', timeout: 7000 }).catch(() => {});

    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await openFiltersAndSelectMultiSport(page);

    const sessionCard = await findCardByTransitionTag(page, transitionTag);
    const details = await ensureExpanded(page, sessionCard);
    await expect(details).toBeVisible();

    const transitionBlock = details.locator('.multi-row').filter({ hasText: /Transition:\s*Swim\s*→\s*Bike/i });
    const timeRow = transitionBlock.locator('.metric-row').filter({ has: page.locator('.metric-label', { hasText: /^Time$/i }) });
    const timeValue = timeRow.locator('.metric-value');
    await expect(timeValue).toHaveText(/00:45/);

    const notesRow = transitionBlock.locator('.metric-row').filter({ has: page.locator('.metric-label', { hasText: /^Notes$/i }) });
    const notesValue = notesRow.locator('.metric-value');
    await expect(notesValue).toHaveText(new RegExp(transitionTag));
  });

  test('User can edit a transition', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await openFiltersAndSelectMultiSport(page);

    const sessionCard = await findCardByTransitionTag(page, transitionTag);
    const details = await ensureExpanded(page, sessionCard);
    await expect(details).toBeVisible();

    const editSessionBtn = details.getByTitle(/edit session/i);
    await expect(editSessionBtn).toBeVisible();
    await editSessionBtn.click();

    const editor = page.locator('.edit-session-wrapper');
    await expect(editor).toBeVisible({ timeout: 7000 });

    const tCard = editor.locator('.transition-card').filter({ has: page.locator('label', { hasText: /^Next Sport/i }) }).first();
    const minutesInput = tCard.locator('.field-row', { hasText: /^Minutes/i }).locator('input.control');
    const secondsInput = tCard.locator('.field-row', { hasText: /^Seconds/i }).locator('input.control');

    await minutesInput.click();
    await minutesInput.press('ControlOrMeta+a');
    await minutesInput.type('0');
    await expect(minutesInput).toHaveValue('0');

    await secondsInput.click();
    await secondsInput.press('ControlOrMeta+a');
    await secondsInput.type('30');
    await expect(secondsInput).toHaveValue('30');

    const saveBtn = editor.getByRole('button', { name: /^save$/i });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();
    await editor.waitFor({ state: 'detached', timeout: 7000 }).catch(() => {});

    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await openFiltersAndSelectMultiSport(page);

    const refreshedCard = await findCardByTransitionTag(page, transitionTag);
    const refreshedDetails = await ensureExpanded(page, refreshedCard);
    await expect(refreshedDetails).toBeVisible();

    const transitionBlock2 = refreshedDetails.locator('.multi-row').filter({ hasText: /Transition:\s*Swim\s*→\s*Bike/i });
    const timeRow2 = transitionBlock2.locator('.metric-row').filter({ has: page.locator('.metric-label', { hasText: /^Time$/i }) });
    const timeValue2 = timeRow2.locator('.metric-value');
    await expect(timeValue2).toHaveText(/00:30/, { timeout: 10000 });
  });

  test('User can delete a transition', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await openFiltersAndSelectMultiSport(page);

    const sessionCard = await findCardByTransitionTag(page, transitionTag);
    const details = await ensureExpanded(page, sessionCard);
    await expect(details).toBeVisible();

    const editSessionBtn = details.getByTitle(/edit session/i);
    await expect(editSessionBtn).toBeVisible();
    await editSessionBtn.click();

    const editor = page.locator('.edit-session-wrapper');
    await expect(editor).toBeVisible({ timeout: 7000 });

    const tCard = editor.locator('.transition-card').first();
    const removeBtn = tCard.getByRole('button', { name: /remove transition/i });
    await expect(removeBtn).toBeVisible();
    await removeBtn.click();

    const saveBtn = editor.getByRole('button', { name: /^save$/i });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();
    await editor.waitFor({ state: 'detached', timeout: 7000 }).catch(() => {});

    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await openFiltersAndSelectMultiSport(page);

    const refreshedCard = await findCardByTransitionTag(page, transitionTag).catch(() => null);
    if (refreshedCard) {
      const refreshedDetails = await ensureExpanded(page, refreshedCard);
      const transitionBlockGone = refreshedDetails.locator('.multi-row').filter({ hasText: /Transition:\s*Swim\s*→\s*Bike/i });
      await expect(transitionBlockGone).toHaveCount(0, { timeout: 10000 });
    }
  });
});
