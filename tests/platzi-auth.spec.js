/*
 * File:  platzi-auth.spec.js
 * API:   Platzi Fake Store - https://fakeapi.platzi.com (api.escuelajs.co)
 * About: Log in, get an access token, and use it to get the user profile.
 */

// Import "test" and "expect" from Playwright
const { test, expect } = require('@playwright/test');
// Import the public demo email and password
const credentials = require('../test-data/credentials.json');

// Base address of the API
const BASE_URL = 'https://api.escuelajs.co/api/v1';

// Group the Platzi authentication test
test.describe('Platzi Fake Store authentication', () => {
  /*
   * TASK: Log in and use the access token.
   * - Send POST /auth/login with email and password
   * - Save the access_token from the response
   * - Send GET /auth/profile with the header "Authorization: Bearer <token>"
   * - Check that the profile has the same email and an avatar link
   */
  test('login returns an access token that works for /auth/profile', async ({ request }) => {
    // Send a POST request with the email and password in the body
    const loginResponse = await request.post(`${BASE_URL}/auth/login`, {
      data: credentials.platzi,
    });
    // Check that the login was successful
    expect(loginResponse.ok()).toBeTruthy();

    // Take "access_token" from the JSON body and save it as accessToken
    const { access_token: accessToken } = await loginResponse.json();
    // Check that the token is not empty
    expect(accessToken).toBeTruthy();

    // Send a GET request to /auth/profile with the token in the Authorization header
    const profileResponse = await request.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    // Check that the token was accepted
    expect(profileResponse.status()).toBe(200);

    // Read the profile data
    const profile = await profileResponse.json();
    // Check that it is the same user who logged in
    expect(profile.email).toBe(credentials.platzi.email);
    // Check that the avatar is a text link
    expect(typeof profile.avatar).toBe('string');
  });
});

/*
 * HOW TO RUN
 * This file only:       npx playwright test tests/platzi-auth.spec.js
 * All tests:            npx playwright test
 * Open the HTML report: npx playwright show-report
 */
