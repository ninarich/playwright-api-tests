# Playwright API Tests

[![API Tests](https://github.com/ninarich/playwright-api-tests/actions/workflows/api-tests.yml/badge.svg)](https://github.com/ninarich/playwright-api-tests/actions/workflows/api-tests.yml)

API test automation framework built with **Playwright** and **JavaScript**.
It covers **26 tests across 7 public REST APIs**: full CRUD operations, token-based authentication, negative scenarios, data-driven tests, and response time checks. The suite runs automatically in **GitHub Actions** on every push and pull request.

This project grew out of exercises from mentor-led API testing lessons, which I then refactored into a structured, documented test suite.

## Tech stack

| Tool | Purpose |
|---|---|
| Playwright Test (`request` fixture) | Sending HTTP requests and making assertions, with no browser |
| JavaScript (Node.js) | Test code |
| dotenv | Loading the API key from a local `.env` file |
| GitHub Actions | Continuous integration and HTML test reports |

## Test coverage

| Area | What is covered |
|---|---|
| **CRUD** | POST create → GET read → PUT update → DELETE, with a check that the deleted record returns 404 |
| **Authentication** | Cookie token (Restful Booker) and `Authorization: Bearer` token (DummyJSON, Platzi) |
| **Negative tests** | Requests without a token are rejected (401 / 403) |
| **Data-driven tests** | One PUT test is generated for each record in `test-data/posts.json` |
| **Response validation** | Status codes, headers, JSON structure, field types and values, nested objects; full-object comparison with `toEqual` |
| **Collections** | Every item in an array is checked (prices, ratings, avatars, categories) |
| **Query parameters** | Pagination (`?page=2`) and limits (`?limit=3`) |
| **Response time** | POST and PUT requests to JSONPlaceholder must respond within a set time limit |

## Test suites

| File | API | Tests | What it checks |
|---|---|---|---|
| `restful-booker.spec.js` | [Restful Booker](https://restful-booker.herokuapp.com/apidoc) | 5 | Full CRUD flow with a cookie token; PUT without a token returns 403; GET after DELETE returns 404 |
| `reqres-users.spec.js` | [ReqRes](https://reqres.in) | 4 | User list and single user: status, headers, structure, field formats; PUT returns the current year in `updatedAt` |
| `jsonplaceholder-posts.spec.js` | [JSONPlaceholder](https://jsonplaceholder.typicode.com) | 5 | POST returns 201; data-driven PUT for 4 posts; response time checks |
| `dummyjson-products.spec.js` | [DummyJSON](https://dummyjson.com) | 3 | Response structure; every price is a number > 0; every rating is between 0 and 5 |
| `dummyjson-auth.spec.js` | [DummyJSON](https://dummyjson.com/docs/auth) | 2 | Login → Bearer token → `/auth/me`; request without a token is rejected |
| `platzi-auth.spec.js` | [Platzi Fake Store](https://fakeapi.platzi.com) | 1 | Login → access token → `/auth/profile` |
| `platzi-categories.spec.js` | [Platzi Fake Store](https://fakeapi.platzi.com) | 2 | Every category has id, name, and image; create our own category → PUT → GET → DELETE (cleanup) |
| `apisguru-nested-json.spec.js` | [APIs.guru](https://apis.guru) | 2 | Large nested JSON: reach a value deep inside objects and validate its format |
| `catfact.spec.js` | [Cat Facts](https://catfact.ninja) | 2 | Body and header checks; the `limit` query parameter is respected |

## Project structure

```
playwright-api-tests/
├── .github/workflows/api-tests.yml   # CI: runs all tests on push and pull request
├── test-data/
│   ├── booking.json                  # Request body for Restful Booker
│   ├── credentials.json              # Public demo logins published by each API
│   └── posts.json                    # Data set for the data-driven PUT tests
├── tests/                            # One spec file per API
├── .env.example                      # Template for the local API key
├── playwright.config.js
└── package.json
```

## Design decisions

- **Independent tests.** On APIs that save data (Restful Booker, Platzi), each test creates its own records and does not change shared data. ReqRes and JSONPlaceholder are mock APIs that do not save changes, so their PUT tests are safe to run against existing ids. Tests can run in parallel and in any order.
- **Strong assertions.** When the test controls the data, it compares the whole object with `toEqual` (every field and nested value). When the data comes from the API, tests check rules (types, ranges, formats, structure), because public demo data can change.
- **No silent passes.** Before a loop checks every item, the test confirms that the array is not empty, so an empty response cannot pass by mistake.
- **Cleanup.** The Platzi category test deletes its created category inside `try ... finally`.
- **Reusable helpers.** Common steps, such as getting a token or creating a booking, live in small helper functions.
- **Secrets out of the code.** The ReqRes API key is read from `.env` locally and from GitHub Secrets in CI. If the key is missing, those tests are skipped instead of failing.
- **Readable tests.** Each test starts with a short task description and expected results. Each file ends with the commands to run it.

## Getting started

**Requirements:** Node.js 18 or later.

```bash
# 1. Install dependencies
npm install

# 2. Add your free ReqRes API key (https://reqres.in)
cp .env.example .env

# 3. Run the tests
npx playwright test                                   # all tests
npx playwright test tests/restful-booker.spec.js      # one file
npx playwright test -g "DELETE"                       # tests whose name matches

# 4. Open the HTML report
npx playwright show-report
```

## Continuous integration

GitHub Actions runs the full suite on every push and pull request to `main`. The HTML report is saved as a build artifact for 30 days. To run the ReqRes tests in CI, add `REQRES_API_KEY` under **Settings → Secrets and variables → Actions**.

## Related project

UI test automation with Playwright and the Page Object Model: [orangehrm-playwright-tests](https://github.com/ninarich/orangehrm-playwright-tests)

## Author

**Nina Richman**, QA Engineer
[LinkedIn](https://www.linkedin.com/in/nina-richman-qa-engineer) · [GitHub](https://github.com/ninarich)
