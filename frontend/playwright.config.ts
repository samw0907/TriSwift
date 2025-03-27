import { defineConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const storageStatePath = path.resolve(__dirname, 'auth.json');

if (!fs.existsSync(storageStatePath)) {
  console.error(`❌ auth.json not found at ${storageStatePath}`);
} else {
  console.log(`✅ auth.json found at ${storageStatePath}`);
}

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
    trace: 'off',
    storageState: undefined,
  },
  webServer: {
    command: 'npm start',
    port: 3000,
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
