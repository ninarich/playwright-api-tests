/*
 * File:  dummyjson-auth.spec.js
 * API:   DummyJSON auth - https://dummyjson.com/docs/auth
 * About: Log in, get a Bearer token, and use it to get the current user.
 *        Also check that a request without a token is rejected.
 */

// Import "test" and "expect" from Playwright
const { test, expect } = require('@playwright/test');
// Import the public demo login and password from the test-data folder
const credentials = require('../test-data/credentials.json');

// Base address of the API
const BASE_URL = 'https://dummyjson.com';

// Group all authentication tests together
test.describe('DummyJSON authentication', () => {
  /*
   * TASK 1: Log in and use the token.
   * - Send POST /auth/login with username and password
   * - Save the accessToken from the response
   * - Send GET /auth/me with the header "Authorization: Bearer <token>"
   * - Check that the server returns the same username
   */
  test('login returns an access token that works for /auth/me', async ({ request }) => {
    // Send a POST request with the login and password in the body
    const loginResponse = await request.post(`${BASE_URL}/auth/login`, {
      data: credentials.dummyJson,
    });
    // Check that the login was successful
    expect(loginResponse.status()).toBe(200);

    // Take the accessToken from the JSON body
    const { accessToken } = await loginResponse.json();
    // Check that the token is not empty
    expect(accessToken).toBeTruthy();

    // Send a GET request to /auth/me and pass the token in the Authorization header
    const meResponse = await request.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    // Check that the token was accepted
    expect(meResponse.status()).toBe(200);

    // Read the user data from the response
    const me = await meResponse.json();
    // Check that it is the same user who logged in
    expect(me.username).toBe(credentials.dummyJson.username);
  });

  /*
   * TASK 2 (negative test): Send GET /auth/me WITHOUT a token.
   * - The request must be rejected with status 401 or 403
   */
  test('/auth/me without a token is rejected', async ({ request }) => {
    // Send a GET request with no Authorization header
    const response = await request.get(`${BASE_URL}/auth/me`);

    // Check that the response is NOT successful
    expect(response.ok()).toBeFalsy();
    // Check that the status is 401 (not logged in) or 403 (no access)
    expect([401, 403]).toContain(response.status());
  });
});

/*
 * HOW TO RUN
 * This file only:       npx playwright test tests/dummyjson-auth.spec.js
 * One test by its name: npx playwright test tests/dummyjson-auth.spec.js -g "without a token"
 * All tests:            npx playwright test
 * Open the HTML report: npx playwright show-report
 */
