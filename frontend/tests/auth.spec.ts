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

    await page.waitForSelector('.notification', { timeout: 5000 });
    await expect(page.locator('.notification')).toHaveText(/Invalid email or password\. Please try again\./i);
  });

  const randomEmail = `user${Date.now()}@example.com`;

  test('User can successfully sign up and is redirected to login', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');

    await page.fill('input[name="name"]', 'New User');
    await page.fill('input[name="email"]', randomEmail);
    await page.fill('input[name="password"]', 'newpassword123');

    const signupButton = page.locator('button', { hasText: 'Signup' });
    await expect(signupButton).not.toBeDisabled();

    await signupButton.click();

    await page.waitForFunction(() => window.location.pathname === '/login', null, { timeout: 10000 });

    console.log('Final URL:', await page.url());
    await expect(page).toHaveURL(/\/login$/);
  });

  test('Signup fails if email already exists', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');

    await page.fill('input[name="name"]', 'Usain Bolt');
    await page.fill('input[name="email"]', 'ubolt@gmail.com');
    await page.fill('input[name="password"]', 'fastpassword');

    await page.click('button[type="submit"]');

    console.log(await page.content());

    await page.waitForSelector('.notification', { timeout: 5000 });

    await expect(page.locator('.notification')).toHaveText(/This email is already registered. Try logging in./i);
  });
});
