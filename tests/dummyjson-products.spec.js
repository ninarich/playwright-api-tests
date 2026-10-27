/*
 * File:  dummyjson-products.spec.js
 * API:   DummyJSON - https://dummyjson.com
 * About: GET products and validate the data of every product in the list.
 */

// Import "test" and "expect" from Playwright
const { test, expect } = require('@playwright/test');

// Base address of the API
const BASE_URL = 'https://dummyjson.com';

// Group all product tests together
test.describe('DummyJSON products API', () => {
  /*
   * TASK 1: Send a GET request for products and check the response structure.
   * - The status is 200
   * - The body has the keys "products" and "total"
   * - "products" is a non-empty array
   */
  test('GET products returns products and total', async ({ request }) => {
    // Send a GET request for the product list
    const response = await request.get(`${BASE_URL}/products`);

    // Check that the status is 200
    expect(response.status()).toBe(200);
    // Read the JSON body
    const body = await response.json();
    // Check that the body has the key "products"
    expect(body).toHaveProperty('products');
    // Check that the body has the key "total"
    expect(body).toHaveProperty('total');
    // Check that "products" is an array
    expect(Array.isArray(body.products)).toBeTruthy();
    // Check that the array is not empty
    expect(body.products.length).toBeGreaterThan(0);
  });

  /*
   * TASK 2: Check every product.
   * - The status is 200 and the list is not empty (so the loop really checks something)
   * - The title is a string
   * - The price is a number greater than 0
   * - Add up all prices and print the total with two decimals
   */
  test('every product has a title and a price greater than zero', async ({ request }) => {
    // Send a GET request for the product list
    const response = await request.get(`${BASE_URL}/products`);
    // Check that the status is 200
    expect(response.status()).toBe(200);
    // Read the JSON body and take only the "products" array
    const { products } = await response.json();
    // Check that "products" is a non-empty array; otherwise the loop below would check nothing
    expect(Array.isArray(products)).toBeTruthy();
    expect(products.length).toBeGreaterThan(0);

    // Start the price sum at zero
    let totalPrice = 0;
    // Go through every product in the array
    for (const product of products) {
      // Check that the title is text
      expect(typeof product.title).toBe('string');
      // Check that the price is a number
      expect(typeof product.price).toBe('number');
      // Check that the price is greater than zero
      expect(product.price).toBeGreaterThan(0);
      // Add the price to the sum
      totalPrice += product.price;
    }
    // Print the sum with two digits after the decimal point
    console.log(`Total price of ${products.length} products: ${totalPrice.toFixed(2)}`);
  });

  /*
   * TASK 3: Check that the rating of every product is between 0 and 5.
   * - The status is 200 and the list is not empty (so the loop really checks something)
   * - The rating is a number from 0 to 5
   */
  test('every product rating is between 0 and 5', async ({ request }) => {
    // Send a GET request for the product list
    const response = await request.get(`${BASE_URL}/products`);
    // Check that the status is 200
    expect(response.status()).toBe(200);
    // Take the "products" array from the JSON body
    const { products } = await response.json();
    // Check that "products" is a non-empty array; otherwise the loop below would check nothing
    expect(Array.isArray(products)).toBeTruthy();
    expect(products.length).toBeGreaterThan(0);

    // Go through every product
    for (const product of products) {
      // Check that the rating is a number
      expect(typeof product.rating).toBe('number');
      // Check that the rating is not less than 0
      expect(product.rating).toBeGreaterThanOrEqual(0);
      // Check that the rating is not more than 5
      expect(product.rating).toBeLessThanOrEqual(5);
    }
  });
});

/*
 * HOW TO RUN
 * This file only:       npx playwright test tests/dummyjson-products.spec.js
 * One test by its name: npx playwright test tests/dummyjson-products.spec.js -g "rating"
 * All tests:            npx playwright test
 * Open the HTML report: npx playwright show-report
 */
