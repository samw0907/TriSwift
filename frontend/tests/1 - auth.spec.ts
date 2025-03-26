import { test, expect } from '@playwright/test';

test.use({ storageState: undefined });

test.describe('Authentication Tests', () => {
  
  test('User can successfully log in', async ({ page }) => {
    await page.goto('https://triswift-frontend.fly.dev/login');

    await page.waitForSelector('input[name="email"]', { timeout: 5000 });

    await page.fill('input[name="Email"]', 'ubolt@gmail.com');
    await page.fill('input[name="Password"]', 'fastpassword');

    await page.click('button[type="submit"]');

    await page.waitForURL('https://triswift-frontend.fly.dev/home', { timeout: 10000 });
    await expect(page).toHaveURL('https://triswift-frontend.fly.dev/home');
    
  });

  test('Login fails with incorrect credentials', async ({ page }) => {
    await page.goto('https://triswift-frontend.fly.dev/login');

    await page.fill('input[name="Email"]', 'wronguser@example.com');
    await page.fill('input[name="Password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    await page.waitForSelector('.notification', { timeout: 5000 });
    await expect(page.locator('.notification')).toHaveText(/Invalid email or password\. Please try again\./i);
  });

  const randomEmail = `user${Date.now()}@example.com`;

  test('User can successfully sign up and is redirected to login', async ({ page }) => {
    await page.goto('https://triswift-frontend.fly.dev/signup');

    await page.fill('input[name="Name"]', 'New User');
    await page.fill('input[name="Email"]', randomEmail);
    await page.fill('input[name="Password"]', 'newpassword123');

    const signupButton = page.locator('button', { hasText: 'Signup' });
    await expect(signupButton).not.toBeDisabled();

    await signupButton.click();

    await page.waitForFunction(() => window.location.pathname === '/login', null, { timeout: 10000 });

    await expect(page).toHaveURL(/\/login$/);
  });

  test('Signup fails if email already exists', async ({ page }) => {
    await page.goto('https://triswift-frontend.fly.dev/signup');

    await page.fill('input[name="Name"]', 'Usain Bolt');
    await page.fill('input[name="Email"]', 'ubolt@gmail.com');
    await page.fill('input[name="Password"]', 'fastpassword');

    await page.click('button[type="submit"]');

    await page.waitForSelector('.notification', { timeout: 5000 });

    await expect(page.locator('.notification')).toHaveText(/This email is already registered. Try logging in./i);
  });
});
