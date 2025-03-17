import { test, expect } from '@playwright/test';

test.describe('Session Management Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    await page.fill('input[name="email"]', 'ubolt@gmail.com');
    await page.fill('input[name="password"]', 'fastpassword');
    await page.click('button[type="submit"]');

    await page.waitForURL('http://localhost:3000/home', { timeout: 10000 });
  });

  test('User can create a new session', async ({ page }) => {
    await page.goto('http://localhost:3000/sessions');

    await page.click('button', { hasText: 'Add Session' });

    await page.fill('input[name="date"]', '2025-03-20');
    await page.selectOption('select[name="sessionType"]', 'Run');
    await page.fill('input[name="weatherTemp"]', '20');
    await page.fill('input[name="weatherHumidity"]', '60');
    await page.fill('input[name="weatherWindSpeed"]', '10');

    await page.click('button', { hasText: 'Next' });

    await page.waitForSelector('.session-list');
    await expect(page.locator('.session-card', { hasText: 'Run' })).toBeVisible();
  });

  test('User can edit an existing session', async ({ page }) => {
    await page.goto('http://localhost:3000/sessions');

    const sessionCard = page.locator('.session-card', { hasText: 'Run' });
    await sessionCard.getByRole('button', { name: 'Edit' }).click();

    const tempInput = page.locator('input[name="weatherTemp"]');
    await tempInput.fill('25');

    await page.click('button', { hasText: 'Save' });

    await expect(sessionCard).toContainText('Temp - 25°C');
  });

  test('User can delete a session', async ({ page }) => {
    await page.goto('http://localhost:3000/sessions');

    const sessionCard = page.locator('.session-card', { hasText: 'Run' });
    await sessionCard.getByRole('button', { name: 'Delete' }).click();

    await page.waitForSelector('.confirm-dialog');
    await page.click('button', { hasText: 'Confirm' });

    await expect(sessionCard).not.toBeVisible();
  });

});
