/*
 * File:  apisguru-nested-json.spec.js
 * API:   APIs.guru - https://apis.guru
 * About: Work with large nested JSON: check an array and reach a value deep inside objects.
 */

// Import "test" and "expect" from Playwright
const { test, expect } = require('@playwright/test');

// Base address of the API
const BASE_URL = 'https://api.apis.guru/v2';

// Group all APIs.guru tests together
test.describe('APIs.guru nested JSON', () => {
  /*
   * TASK 1: Send a GET request for the list of providers.
   * - The status is 200
   * - "data" is a non-empty array
   */
  test('GET providers returns a non-empty list', async ({ request }) => {
    // Send a GET request for the providers list
    const response = await request.get(`${BASE_URL}/providers.json`);

    // Check that the status is 200
    expect(response.status()).toBe(200);
    // Read the JSON body
    const body = await response.json();
    // Check that "data" is an array
    expect(Array.isArray(body.data)).toBeTruthy();
    // Check that the array is not empty
    expect(body.data.length).toBeGreaterThan(0);
  });

  /*
   * TASK 2: Get to the contact email deep inside the JSON and check its format.
   * Path to the value: apis -> "apis.guru" -> info -> contact -> email
   * - The status is 200
   * - The email looks like name@domain.com
   */
  test('nested contact email of the apis.guru API has a valid format', async ({ request }) => {
    // Send a GET request for the apis.guru description
    const response = await request.get(`${BASE_URL}/apis.guru.json`);

    // Check that the status is 200
    expect(response.status()).toBe(200);
    // Read the JSON body
    const body = await response.json();

    // Go step by step into the nested objects.
    // ["apis.guru"] uses brackets because the key has a dot in it
    const email = body.apis['apis.guru'].info.contact.email;
    // Print the value we found
    console.log(`Contact email: ${email}`);
    // Check the format: text, then @, then a domain with a dot
    expect(email).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]+$/i);
  });
});

/*
 * HOW TO RUN
 * This file only:       npx playwright test tests/apisguru-nested-json.spec.js
 * One test by its name: npx playwright test tests/apisguru-nested-json.spec.js -g "nested contact email"
 * All tests:            npx playwright test
 * Open the HTML report: npx playwright show-report
 */
