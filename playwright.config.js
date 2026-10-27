// Playwright configuration for API tests.
// API tests use the `request` fixture, so no browsers are needed.
// Load REQRES_API_KEY from .env if the dotenv package is installed.
try {
  require('dotenv').config();
} catch {
  // dotenv is optional: environment variables can also be set directly.
}
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
  },
});
