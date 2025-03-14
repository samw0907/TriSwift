import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  
  test('User can successfully log in', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    await page.waitForSelector('input[name="email"]', { timeout: 5000 });

    await page.fill('input[name="email"]', 'ubolt@gmail.com');
    await page.fill('input[name="password"]', 'fastpassword');

    await page.click('button[type="submit"]');

    await page.waitForURL('http://localhost:3000/home', { timeout: 10000 });
    await expect(page).toHaveURL('http://localhost:3000/home');
  });

  test('Login fails with incorrect credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    await page.fill('input[name="email"]', 'wronguser@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    console.log(await page.content());

    await page.waitForSelector('.error-message, .alert, .notification-error', { timeout: 5000 });
    await expect(page.locator('.error-message, .alert, .notification-error'))
      .toHaveText(/Invalid email or password/i);
  });

  test('User can successfully sign up and is redirected to login', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');

    await page.fill('input[name="name"]', 'New User');
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'newpassword123');

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).not.toBeDisabled();

    await submitButton.click();

    await page.waitForURL('http://localhost:3000/login', { timeout: 10000 });
    await expect(page).toHaveURL('http://localhost:3000/login');
  });

  test('Signup fails if email already exists', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');

    await page.fill('input[name="name"]', 'Existing User');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'password123');

    await page.click('button[type="submit"]');

    console.log(await page.content());

    await page.waitForSelector('.error-message, .alert, .notification-warning', { timeout: 5000 });
    await expect(page.locator('.error-message, .alert, .notification-warning'))
      .toHaveText(/User already exists/i);
  });

});
