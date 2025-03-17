import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 10000,
  fullyParallel: false,
  workers: 1,
  use: {
    headless: true,
    baseURL: 'http://localhost:3000',
    browserName: 'chromium',
    screenshot: 'off',
    video: 'off',
    trace: 'off'
  },
});
