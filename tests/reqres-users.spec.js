/*
 * File:  reqres-users.spec.js
 * API:   ReqRes - https://reqres.in
 * About: GET a list of users, GET one user, and PUT (update) a user.
 * Note:  ReqRes needs a free API key. It is read from the REQRES_API_KEY variable in the .env file.
 */

// Import "test" (to create tests) and "expect" (to check results) from Playwright
const { test, expect } = require('@playwright/test');

// Base address of the API, so we don't repeat it in every request
const BASE_URL = 'https://reqres.in/api';

// Read the API key from the environment (.env file)
const API_KEY = process.env.REQRES_API_KEY;

// Group all ReqRes tests together
test.describe('ReqRes users API', () => {
  // If there is no API key, skip these tests instead of failing them
  test.skip(!API_KEY, 'Set REQRES_API_KEY in .env to run ReqRes tests');

  // Header with the API key that every ReqRes request must send
  const headers = { 'x-api-key': API_KEY };

  /*
   * TASK 1: Send a GET request for users on page 2 and check the response.
   * - The status is 200 and the response is OK
   * - The response is JSON
   * - "data" is a non-empty array
   * - The first user has id, email, first_name, last_name, avatar
   * - The id is greater than 0 and the email ends with @reqres.in
   */
  test('GET users list returns 200 and a valid structure', async ({ request }) => {
    // Send a GET request with a query parameter page=2 and the API key header
    const response = await request.get(`${BASE_URL}/users?page=2`, { headers });

    // Check that the status is in the 200-299 range
    expect(response.ok()).toBeTruthy();
    // Check that the status is exactly 200
    expect(response.status()).toBe(200);
    // Check that the server says the body is JSON
    expect(response.headers()['content-type']).toContain('application/json');

    // Convert the response body from JSON text to a JavaScript object
    const body = await response.json();
    // Check that "data" is an array
    expect(Array.isArray(body.data)).toBeTruthy();
    // Check that the array is not empty
    expect(body.data.length).toBeGreaterThan(0);

    // Take the first user from the array
    const firstUser = body.data[0];
    // Loop over the field names and check that the user has each field
    for (const field of ['id', 'email', 'first_name', 'last_name', 'avatar']) {
      expect(firstUser).toHaveProperty(field);
    }
    // Check that the id is a positive number
    expect(firstUser.id).toBeGreaterThan(0);
    // Check that the email ends with @reqres.in (regular expression, $ means "end")
    expect(firstUser.email).toMatch(/@reqres\.in$/);
  });

  /*
   * TASK 2: Check the avatar of EVERY user on page 2.
   * - The status is 200 and the list is not empty (so the loop really checks something)
   * - The avatar is a string
   * - The avatar link ends with .jpg
   */
  test('every user has an avatar URL that is a string ending in .jpg', async ({ request }) => {
    // Send the same GET request for page 2
    const response = await request.get(`${BASE_URL}/users?page=2`, { headers });
    // Check that the status is 200
    expect(response.status()).toBe(200);
    // Read the JSON body
    const body = await response.json();
    // Check that "data" is a non-empty array; otherwise the loop below would check nothing
    expect(Array.isArray(body.data)).toBeTruthy();
    expect(body.data.length).toBeGreaterThan(0);

    // Go through every user in the "data" array
    for (const user of body.data) {
      // Check that the avatar is text (a string)
      expect(typeof user.avatar).toBe('string');
      // Check that the avatar link ends with .jpg
      expect(user.avatar).toMatch(/\.jpg$/);
    }
  });

  /*
   * TASK 3: Send a GET request for one user (id = 2).
   * - The status is 200
   * - The user id in the response is 2
   * - The support text is longer than 50 characters
   */
  test('GET single user returns user data and a support message', async ({ request }) => {
    // Send a GET request for the user with id 2
    const response = await request.get(`${BASE_URL}/users/2`, { headers });

    // Check that the status is 200
    expect(response.status()).toBe(200);
    // Read the JSON body
    const body = await response.json();
    // Check that we got the user we asked for
    expect(body.data.id).toBe(2);
    // Check that the support text exists and is long enough
    expect(body.support.text.length).toBeGreaterThan(50);
  });

  /*
   * TASK 4: Send a PUT request to update user 2.
   * - The status is 200
   * - The response returns the new first_name
   * - The response has "updatedAt"
   * - The year in "updatedAt" is the current year
   */
  test('PUT updates a user and returns the current year in updatedAt', async ({ request }) => {
    // New data we want to save for the user
    const updatedUser = { first_name: 'John', email: 'softwareengineer@gmail.com' };

    // Send a PUT request with the API key header and the new data in the body
    const response = await request.put(`${BASE_URL}/users/2`, { headers, data: updatedUser });

    // Check that the status is 200
    expect(response.status()).toBe(200);
    // Read the JSON body
    const body = await response.json();
    // Check that the server returned the new first_name
    expect(body.first_name).toBe(updatedUser.first_name);
    // Check that the response has the "updatedAt" field
    expect(body).toHaveProperty('updatedAt');

    // Convert the "updatedAt" text to a date and take the year
    const updatedYear = new Date(body.updatedAt).getUTCFullYear();
    // Check that it is the same as the current year
    expect(updatedYear).toBe(new Date().getUTCFullYear());
  });
});

/*
 * HOW TO RUN
 * This file only:       npx playwright test tests/reqres-users.spec.js
 * One test by its name: npx playwright test tests/reqres-users.spec.js -g "PUT updates a user"
 * All tests:            npx playwright test
 * Open the HTML report: npx playwright show-report
 */
