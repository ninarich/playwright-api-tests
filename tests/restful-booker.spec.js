/*
 * File:  restful-booker.spec.js
 * API:   Restful Booker - https://restful-booker.herokuapp.com/apidoc
 * About: Full CRUD flow for a hotel booking:
 *        Create (POST) -> Read (GET) -> Update (PUT) -> Delete (DELETE).
 *        PUT and DELETE need a token. The token is sent in a Cookie header.
 */

// Import "test" and "expect" from Playwright
const { test, expect } = require('@playwright/test');
// Import the booking data we send to the server
const booking = require('../test-data/booking.json');
// Import the public demo login and password
const credentials = require('../test-data/credentials.json');

// Base address of the API
const BASE_URL = 'https://restful-booker.herokuapp.com';

// Helper function: log in and return a token (used by several tests)
async function getToken(request) {
  // Send a POST request to /auth with the username and password
  const response = await request.post(`${BASE_URL}/auth`, { data: credentials.restfulBooker });
  // Check that the login was successful
  expect(response.status()).toBe(200);
  // Take the token from the JSON body
  const { token } = await response.json();
  // Check that the token is not empty
  expect(token).toBeTruthy();
  // Return the token to the test that called this function
  return token;
}

// Helper function: create a new booking and return its id
async function createBooking(request) {
  // Send a POST request with the booking data in the body
  const response = await request.post(`${BASE_URL}/booking`, { data: booking });
  // Check that the booking was created
  expect(response.status()).toBe(200);
  // Take the new booking id from the JSON body
  const { bookingid } = await response.json();
  // Return the id
  return bookingid;
}

// Group all booking tests together
test.describe('Restful Booker bookings API', () => {
  /*
   * TASK 1 (Create): Send a POST request to create a booking.
   * - The status is 200
   * - The response has a booking id greater than 0
   * - The saved booking is exactly the same as the data we sent
   *   (names, price, deposit, dates, and additional needs)
   */
  test('POST creates a booking with the sent data', async ({ request }) => {
    // Send a POST request with the booking data
    const response = await request.post(`${BASE_URL}/booking`, { data: booking });

    // Check that the status is 200
    expect(response.status()).toBe(200);
    // Read the JSON body
    const body = await response.json();
    // Check that the server created an id for the booking
    expect(body.bookingid).toBeGreaterThan(0);
    // Compare the WHOLE saved object with what we sent, including the nested "bookingdates"
    // toEqual checks every field and every nested value
    expect(body.booking).toEqual(booking);
  });

  /*
   * TASK 2 (Read): Create a booking, then read it with GET.
   * - The status is 200
   * - The data from GET is exactly the same as the data we created
   */
  test('GET returns the booking that was created', async ({ request }) => {
    // Create a new booking and get its id
    const bookingId = await createBooking(request);

    // Send a GET request for this booking
    const response = await request.get(`${BASE_URL}/booking/${bookingId}`);

    // Check that the status is 200
    expect(response.status()).toBe(200);
    // Read the JSON body
    const saved = await response.json();
    // Compare the whole saved booking with the data we created
    expect(saved).toEqual(booking);
  });

  /*
   * TASK 3 (Update): Create a booking, get a token, update the booking with PUT.
   * - PUT with the token returns status 200
   * - The PUT response contains the full updated booking
   * - GET after PUT returns exactly the updated booking
   */
  test('PUT with a token updates the booking, and GET returns the new data', async ({ request }) => {
    // Create a new booking and get its id
    const bookingId = await createBooking(request);
    // Log in and get a token
    const token = await getToken(request);
    // Copy the booking data and change two fields
    const updatedBooking = { ...booking, firstname: 'Julia', additionalneeds: 'Porridge' };

    // Send a PUT request with the token in the Cookie header and the new data in the body
    const putResponse = await request.put(`${BASE_URL}/booking/${bookingId}`, {
      headers: { Cookie: `token=${token}` },
      data: updatedBooking,
    });
    // Check that the update was successful
    expect(putResponse.status()).toBe(200);
    // Check that the PUT response contains the full updated booking
    expect(await putResponse.json()).toEqual(updatedBooking);

    // Send a GET request to read the booking again
    const getResponse = await request.get(`${BASE_URL}/booking/${bookingId}`);
    // Check that the status is 200
    expect(getResponse.status()).toBe(200);
    // Compare the whole saved booking with the updated data
    expect(await getResponse.json()).toEqual(updatedBooking);
  });

  /*
   * TASK 4 (negative test): Try to update a booking WITHOUT a token.
   * - The server must reject the request with status 403 (Forbidden)
   */
  test('PUT without a token is rejected', async ({ request }) => {
    // Create a new booking and get its id
    const bookingId = await createBooking(request);

    // Send a PUT request with no token
    const putResponse = await request.put(`${BASE_URL}/booking/${bookingId}`, {
      data: { ...booking, firstname: 'NoToken' },
    });
    // Check that access is forbidden
    expect(putResponse.status()).toBe(403);
  });

  /*
   * TASK 5 (Delete): Create a booking, delete it with a token, then try to read it.
   * - DELETE with the token returns status 201 (this API returns 201 for a successful delete)
   * - GET after DELETE returns status 404 (Not Found)
   */
  test('DELETE with a token removes the booking', async ({ request }) => {
    // Create a new booking and get its id
    const bookingId = await createBooking(request);
    // Log in and get a token
    const token = await getToken(request);

    // Send a DELETE request with the token in the Cookie header
    const deleteResponse = await request.delete(`${BASE_URL}/booking/${bookingId}`, {
      headers: { Cookie: `token=${token}` },
    });
    // Check that the delete was successful (this API uses 201)
    expect(deleteResponse.status()).toBe(201);

    // Try to read the deleted booking
    const getResponse = await request.get(`${BASE_URL}/booking/${bookingId}`);
    // Check that the booking no longer exists
    expect(getResponse.status()).toBe(404);
  });
});

/*
 * HOW TO RUN
 * This file only:       npx playwright test tests/restful-booker.spec.js
 * One test by its name: npx playwright test tests/restful-booker.spec.js -g "DELETE"
 * All tests:            npx playwright test
 * Open the HTML report: npx playwright show-report
 */
