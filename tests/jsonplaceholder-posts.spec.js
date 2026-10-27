/*
 * File:  jsonplaceholder-posts.spec.js
 * API:   JSONPlaceholder - https://jsonplaceholder.typicode.com
 * About: POST a new post, and a data-driven PUT for several posts from a JSON file.
 *        Every test also measures the response time.
 */

// Import "test" and "expect" from Playwright
const { test, expect } = require('@playwright/test');
// Import the array of posts we use for the data-driven test
const posts = require('../test-data/posts.json');

// Base address of the API
const BASE_URL = 'https://jsonplaceholder.typicode.com';
// Maximum allowed response time in milliseconds (1000 ms = 1 second)
const MAX_RESPONSE_TIME_MS = 2000;

// Group all post tests together
test.describe('JSONPlaceholder posts API', () => {
  /*
   * TASK 1: Send a POST request to create a new post.
   * - The status is 201 (Created)
   * - The response time is less than MAX_RESPONSE_TIME_MS
   * - The userId is 111, the title is not empty, the body contains the word "Body"
   * - The new post gets an id greater than 0
   */
  test('POST creates a post and responds in time', async ({ request }) => {
    // Data for the new post
    const newPost = { userId: 111, title: 'Test Title', body: 'Test Body' };

    // Save the time BEFORE the request
    const start = Date.now();
    // Send a POST request with the new post in the body
    const response = await request.post(`${BASE_URL}/posts`, { data: newPost });
    // Response time = time AFTER the request minus time BEFORE
    const responseTime = Date.now() - start;

    // Check that the post was created
    expect(response.status()).toBe(201);
    // Check that the server answered fast enough
    expect(responseTime).toBeLessThan(MAX_RESPONSE_TIME_MS);

    // Read the JSON body
    const body = await response.json();
    // Check that the userId is the one we sent
    expect(body.userId).toBe(newPost.userId);
    // Check that the title is not empty
    expect(body.title.length).toBeGreaterThan(0);
    // Check that the body text contains the word "Body"
    expect(body.body).toContain('Body');
    // Check that the server created an id
    expect(body.id).toBeGreaterThan(0);
  });

  /*
   * TASK 2 (data-driven): Send a PUT request for every post in test-data/posts.json.
   * Playwright creates one separate test for each post in the array.
   * - The status is 200
   * - The response time is less than MAX_RESPONSE_TIME_MS
   * - The response has the same id, title, and body that we sent
   */
  // Loop over the array: each "post" becomes its own test
  for (const post of posts) {
    test(`PUT updates post ${post.id} ("${post.title}")`, async ({ request }) => {
      // Save the time BEFORE the request
      const start = Date.now();
      // Send a PUT request for this post id with the post data in the body
      const response = await request.put(`${BASE_URL}/posts/${post.id}`, { data: post });
      // Calculate the response time
      const responseTime = Date.now() - start;

      // Check that the update was successful
      expect(response.status()).toBe(200);
      // Check that the server answered fast enough
      expect(responseTime).toBeLessThan(MAX_RESPONSE_TIME_MS);

      // Read the JSON body
      const body = await response.json();
      // Check that the server returned the same id
      expect(body.id).toBe(post.id);
      // Check that the title was updated
      expect(body.title).toBe(post.title);
      // Check that the body text was updated
      expect(body.body).toBe(post.body);
    });
  }
});

/*
 * HOW TO RUN
 * This file only:       npx playwright test tests/jsonplaceholder-posts.spec.js
 * One test by its name: npx playwright test tests/jsonplaceholder-posts.spec.js -g "PUT updates post 2"
 * All tests:            npx playwright test
 * Open the HTML report: npx playwright show-report
 */
