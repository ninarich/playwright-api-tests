/*
 * File:  platzi-categories.spec.js
 * API:   Platzi Fake Store - https://fakeapi.platzi.com (api.escuelajs.co)
 * About: GET all categories; create our own category, update it with PUT, and delete it.
 */

// Import "test" and "expect" from Playwright
const { test, expect } = require('@playwright/test');

// Base address of the API
const BASE_URL = 'https://api.escuelajs.co/api/v1';

// Group all category tests together
test.describe('Platzi Fake Store categories API', () => {
  /*
   * TASK 1: Send a GET request for all categories.
   * - The status is 200
   * - The response is a non-empty array
   * - Every category has an id, a name (string), and an image (string)
   */
  test('GET categories returns a list with id, name, and image', async ({ request }) => {
    // Send a GET request for the category list
    const response = await request.get(`${BASE_URL}/categories`);

    // Check that the status is 200
    expect(response.status()).toBe(200);
    // Read the JSON body (here the body itself is an array)
    const categories = await response.json();
    // Check that it is an array
    expect(Array.isArray(categories)).toBeTruthy();
    // Check that the array is not empty
    expect(categories.length).toBeGreaterThan(0);

    // Go through every category
    for (const category of categories) {
      // Check that the category has an id
      expect(category).toHaveProperty('id');
      // Check that the name is text
      expect(typeof category.name).toBe('string');
      // Check that the image is text
      expect(typeof category.image).toBe('string');
    }
  });

  /*
   * TASK 2: Create our OWN category, update it with PUT, check it, and delete it.
   * We do not change existing categories, because other people use this public API too.
   * - POST creates a category (status 201) with the name and image we sent
   * - PUT changes its name (status 200)
   * - GET returns the new name
   * - At the end, DELETE removes the category (cleanup), even if a check failed
   */
  test('PUT updates the name of a category we created', async ({ request }) => {
    // Unique names: Date.now() adds the current time, so every run uses new names
    const newCategory = { name: `QA Category ${Date.now()}`, image: 'https://placehold.co/600x400' };
    const updatedName = `QA Category Updated ${Date.now()}`;

    // Send a POST request to create our own category
    const createResponse = await request.post(`${BASE_URL}/categories`, { data: newCategory });
    // Read the JSON body of the new category (it has the id we need for cleanup)
    const created = await createResponse.json();

    // "try ... finally" makes sure the cleanup step always runs,
    // even if any check below fails
    try {
      // Check that the category was created
      expect(createResponse.status()).toBe(201);
      // Check that the server saved the name and image we sent
      expect(created.name).toBe(newCategory.name);
      expect(created.image).toBe(newCategory.image);

      // Send a PUT request to change the name of OUR category
      const putResponse = await request.put(`${BASE_URL}/categories/${created.id}`, {
        data: { name: updatedName },
      });
      // Check that the update was successful
      expect(putResponse.status()).toBe(200);
      // Check that the PUT response has the same id and the new name
      const updated = await putResponse.json();
      expect(updated.id).toBe(created.id);
      expect(updated.name).toBe(updatedName);

      // Send a GET request to read the category again
      const getResponse = await request.get(`${BASE_URL}/categories/${created.id}`);
      // Check that the status is 200
      expect(getResponse.status()).toBe(200);
      // Check that the server really saved the new name
      expect((await getResponse.json()).name).toBe(updatedName);
    } finally {
      // Cleanup: delete our category so we do not leave test data behind.
      // Only if the server really created it and returned an id
      if (created && created.id) {
        const deleteResponse = await request.delete(`${BASE_URL}/categories/${created.id}`);
        // Check that the delete was successful
        expect(deleteResponse.ok()).toBeTruthy();
      }
    }
  });
});

/*
 * HOW TO RUN
 * This file only:       npx playwright test tests/platzi-categories.spec.js
 * One test by its name: npx playwright test tests/platzi-categories.spec.js -g "PUT updates"
 * All tests:            npx playwright test
 * Open the HTML report: npx playwright show-report
 */
