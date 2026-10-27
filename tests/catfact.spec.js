/*
 * File:  catfact.spec.js
 * API:   Cat Facts - https://catfact.ninja
 * About: GET a random fact and check the body and headers; check the "limit" query parameter.
 */

// Import "test" and "expect" from Playwright
const { test, expect } = require('@playwright/test');

// Base address of the API
const BASE_URL = 'https://catfact.ninja';

// Group all Cat Facts tests together
test.describe('Cat Facts API', () => {
  /*
   * TASK 1: Send a GET request for one random fact.
   * - The status is 200 and the response is JSON
   * - "fact" is a non-empty string
   * - The "length" field is equal to the real length of the fact
   */
  test('GET fact returns a fact and its length', async ({ request }) => {
    // Send a GET request for a random fact
    const response = await request.get(`${BASE_URL}/fact`);

    // Check that the status is 200
    expect(response.status()).toBe(200);
    // Check that the server says the body is JSON
    expect(response.headers()['content-type']).toContain('application/json');

    // Read the JSON body
    const body = await response.json();
    // Check that the fact is text
    expect(typeof body.fact).toBe('string');
    // Check that the fact is not empty
    expect(body.fact.length).toBeGreaterThan(0);
    // Check that the "length" field matches the real number of characters
    expect(body.length).toBe(body.fact.length);
  });

  /*
   * TASK 2: Send a GET request for facts with the query parameter limit=3.
   * - The status is 200
   * - "data" is an array with no more than 3 items
   */
  test('GET facts with a limit returns no more items than requested', async ({ request }) => {
    // How many facts we ask for
    const limit = 3;
    // Send a GET request with the query parameter ?limit=3
    const response = await request.get(`${BASE_URL}/facts?limit=${limit}`);

    // Check that the status is 200
    expect(response.status()).toBe(200);
    // Read the JSON body
    const body = await response.json();
    // Check that "data" is an array
    expect(Array.isArray(body.data)).toBeTruthy();
    // Check that we got no more facts than we asked for
    expect(body.data.length).toBeLessThanOrEqual(limit);
  });
});

/*
 * HOW TO RUN
 * This file only:       npx playwright test tests/catfact.spec.js
 * One test by its name: npx playwright test tests/catfact.spec.js -g "limit"
 * All tests:            npx playwright test
 * Open the HTML report: npx playwright show-report
 */
