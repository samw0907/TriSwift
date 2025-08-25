import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  const validEmail = 'seeduser@example.com';
  const validPassword = 'password123';
  const randomEmail = `user${Date.now()}@example.com`;

  test('User can successfully log in', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });

    await page.getByRole('textbox', { name: /email/i }).fill(validEmail);
    await page.getByRole('textbox', { name: /password/i }).fill(validPassword);
    await page.getByRole('button', { name: /log ?in|sign ?in/i }).click();

    await expect(
      page.getByRole('heading', { name: /your training overview/i })
    ).toBeVisible({ timeout: 15000 });
  });

  test('Login fails with incorrect credentials', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });

    await page.getByRole('textbox', { name: /email/i }).fill('wronguser@example.com');
    await page.getByRole('textbox', { name: /password/i }).fill('wrongpassword');
    await page.getByRole('button', { name: /log ?in|sign ?in/i }).click();

    await expect(page.locator('.notification')).toBeVisible();
    await expect(page.locator('.notification')).toHaveText(/invalid email or password/i);
  });

  test('User can successfully sign up and is redirected to login', async ({ page }) => {
    await page.goto('/signup', { waitUntil: 'networkidle' });

    await page.getByRole('textbox', { name: /name/i }).fill('New User');
    await page.getByRole('textbox', { name: /email/i }).fill(randomEmail);
    await page.getByRole('textbox', { name: /password/i }).fill('newpassword123');

    const signupButton = page.getByRole('button', { name: /sign ?up|create account/i });
    await expect(signupButton).toBeVisible();
    await expect(signupButton).not.toBeDisabled();
    await signupButton.click();

    await expect(page.getByRole('button', { name: /log ?in|sign ?in/i })).toBeVisible({ timeout: 15000 });
  });

  test('Signup fails if email already exists', async ({ page }) => {
    await page.goto('/signup', { waitUntil: 'networkidle' });

    await page.getByRole('textbox', { name: /name/i }).fill('Seed User');
    await page.getByRole('textbox', { name: /email/i }).fill(validEmail);
    await page.getByRole('textbox', { name: /password/i }).fill(validPassword);
    await page.getByRole('button', { name: /sign ?up|create account/i }).click();

    await expect(page.locator('.notification')).toBeVisible();
    await expect(page.locator('.notification')).toHaveText(/already registered|already exists/i);
  });
});
