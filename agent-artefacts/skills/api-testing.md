# API Testing Best Practices with Playwright

## Use Playwright APIRequestContext

Never use external HTTP libraries (axios, node-fetch). Use Playwright's built-in `APIRequestContext`:

```typescript
import { test, expect, APIRequestContext } from '@playwright/test';

let apiContext: APIRequestContext;

test.beforeAll(async ({ playwright }) => {
  apiContext = await playwright.request.newContext({
    baseURL: process.env.API_BASE_URL ?? 'http://localhost:3000',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  });
});

test.afterAll(async () => {
  await apiContext.dispose();
});
```

## Auth: Obtain Token Once, Reuse Across Tests

```typescript
let authToken: string;

test.beforeAll(async ({ playwright }) => {
  const apiContext = await playwright.request.newContext({
    baseURL: process.env.API_BASE_URL,
  });

  const response = await apiContext.post('/api/auth/login', {
    data: {
      email: process.env.TEST_USER_EMAIL,
      password: process.env.TEST_USER_PASSWORD,
    },
  });
  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  authToken = body.token;

  await apiContext.dispose();
});

// Reuse in tests
test('get user profile', async () => {
  const response = await apiContext.get('/api/users/me', {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  expect(response.ok()).toBeTruthy();
});
```

## Response Validation: Status + Structure + Field Values

Always validate all three layers:

```typescript
test('create a new item', async () => {
  const response = await apiContext.post('/api/items', {
    data: { name: 'Test Item', price: 19.99 },
  });

  // 1. Status code
  expect(response.status()).toBe(201);

  // 2. Body structure
  const body = await response.json();
  expect(body).toHaveProperty('id');
  expect(body).toHaveProperty('name');
  expect(body).toHaveProperty('price');
  expect(body).toHaveProperty('createdAt');

  // 3. Specific field values
  expect(body.name).toBe('Test Item');
  expect(body.price).toBe(19.99);
  expect(typeof body.id).toBe('string');
});
```

## Data-Driven Testing

Use `test.describe` with arrays of test data:

```typescript
const statusEndpoints = [
  { path: '/api/health', expectedStatus: 200 },
  { path: '/api/version', expectedStatus: 200 },
  { path: '/api/nonexistent', expectedStatus: 404 },
];

test.describe('Status endpoints', () => {
  for (const { path, expectedStatus } of statusEndpoints) {
    test(`GET ${path} returns ${expectedStatus}`, async () => {
      const response = await apiContext.get(path);
      expect(response.status()).toBe(expectedStatus);
    });
  }
});
```

## Parameterized Tests with for...of Inside describe

```typescript
const crudTestData = [
  { name: 'Widget A', price: 10.00, category: 'electronics' },
  { name: 'Widget B', price: 25.50, category: 'hardware' },
  { name: 'Widget C', price: 5.99, category: 'accessories' },
];

test.describe('CRUD operations', () => {
  for (const itemData of crudTestData) {
    test(`creates and retrieves ${itemData.name}`, async () => {
      const createResponse = await apiContext.post('/api/items', { data: itemData });
      expect(createResponse.status()).toBe(201);

      const created = await createResponse.json();
      const getResponse = await apiContext.get(`/api/items/${created.id}`);
      expect(getResponse.status()).toBe(200);

      const retrieved = await getResponse.json();
      expect(retrieved.name).toBe(itemData.name);
      expect(retrieved.price).toBe(itemData.price);
    });
  }
});
```

## Cleanup: Track and Delete Created Resources

```typescript
test.describe('Item management', () => {
  const createdIds: string[] = [];

  test.afterAll(async () => {
    for (const id of createdIds) {
      await apiContext.delete(`/api/items/${id}`);
    }
  });

  test('create item', async () => {
    const response = await apiContext.post('/api/items', {
      data: { name: 'Temp Item', price: 1.00 },
    });
    const body = await response.json();
    createdIds.push(body.id);
    expect(response.status()).toBe(201);
  });

  test.afterEach(async ({}, testInfo) => {
    // Optional: clean up on failure to avoid orphan data
    if (testInfo.status === 'failed') {
      for (const id of createdIds) {
        await apiContext.delete(`/api/items/${id}`).catch(() => {});
      }
      createdIds.length = 0;
    }
  });
});
```

## Error Response Validation

Verify error responses have correct format and content:

```typescript
test('rejects invalid payload with 400', async () => {
  const response = await apiContext.post('/api/items', {
    data: { name: '' }, // missing required fields
  });

  expect(response.status()).toBe(400);

  const body = await response.json();
  expect(body).toHaveProperty('error');
  expect(body.error).toHaveProperty('code');
  expect(body.error).toHaveProperty('message');
  expect(body.error.code).toBe('VALIDATION_ERROR');
  expect(body.error.message).toContain('name');
});

test('returns 401 for unauthenticated request', async () => {
  const unauthContext = await apiContext.newContext({ baseURL: process.env.API_BASE_URL });
  const response = await unauthContext.get('/api/users/me');

  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.error.code).toBe('UNAUTHORIZED');
});

test('returns 404 for nonexistent resource', async () => {
  const response = await apiContext.get('/api/items/nonexistent-id-12345');

  expect(response.status()).toBe(404);
  const body = await response.json();
  expect(body.error.code).toBe('NOT_FOUND');
});
```

## Pagination Testing

Verify `limit`, `offset`, and `total_count`:

```typescript
test.describe('Pagination', () => {
  test('respects limit parameter', async () => {
    const response = await apiContext.get('/api/items?limit=5&offset=0');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.data.length).toBeLessThanOrEqual(5);
    expect(body).toHaveProperty('total_count');
    expect(body).toHaveProperty('limit', 5);
    expect(body).toHaveProperty('offset', 0);
  });

  test('respects offset parameter', async () => {
    const allResponse = await apiContext.get('/api/items?limit=100&offset=0');
    const allBody = await allResponse.json();

    const offsetResponse = await apiContext.get('/api/items?limit=5&offset=2');
    const offsetBody = await offsetResponse.json();

    expect(offsetBody.data[0].id).toBe(allBody.data[2].id);
    expect(offsetBody.offset).toBe(2);
  });

  test('returns total_count regardless of limit', async () => {
    const response = await apiContext.get('/api/items?limit=1');
    const body = await response.json();

    expect(body.total_count).toBeGreaterThanOrEqual(body.data.length);
  });

  test('returns empty array when offset exceeds total', async () => {
    const response = await apiContext.get('/api/items?limit=10&offset=999999');
    const body = await response.json();

    expect(body.data).toHaveLength(0);
    expect(body.total_count).toBeGreaterThanOrEqual(0);
  });
});
```

## Schema Validation with ajv

Validate response bodies against JSON Schema:

```typescript
import Ajv, { JSONSchemaType } from 'ajv';

const ajv = new Ajv();

interface Item {
  id: string;
  name: string;
  price: number;
  createdAt: string;
}

const itemSchema: JSONSchemaType<Item> = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string', minLength: 1 },
    price: { type: 'number', minimum: 0 },
    createdAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'name', 'price', 'createdAt'],
  additionalProperties: false,
};

const validateItem = ajv.compile(itemSchema);

test('response matches item schema', async () => {
  const response = await apiContext.get('/api/items/some-id');
  const body = await response.json();

  const valid = validateItem(body);
  if (!valid) {
    console.error('Schema validation errors:', validateItem.errors);
  }
  expect(valid).toBe(true);
});
```

## Test Ordering with test.describe.serial

Use `serial` for dependent operations that must run in order:

```typescript
test.describe.serial('Item lifecycle', () => {
  let itemId: string;

  test('POST creates item', async () => {
    const response = await apiContext.post('/api/items', {
      data: { name: 'Lifecycle Item', price: 10.00 },
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    itemId = body.id;
  });

  test('GET retrieves created item', async () => {
    const response = await apiContext.get(`/api/items/${itemId}`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.name).toBe('Lifecycle Item');
  });

  test('PUT updates item', async () => {
    const response = await apiContext.put(`/api/items/${itemId}`, {
      data: { name: 'Updated Item', price: 15.00 },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.name).toBe('Updated Item');
  });

  test('DELETE removes item', async () => {
    const response = await apiContext.delete(`/api/items/${itemId}`);
    expect(response.status()).toBe(204);
  });

  test('GET returns 404 after deletion', async () => {
    const response = await apiContext.get(`/api/items/${itemId}`);
    expect(response.status()).toBe(404);
  });
});
```

## Environment-Agnostic: Use baseURL from Config

Never hardcode URLs. Use Playwright config:

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: process.env.API_BASE_URL ?? 'http://localhost:3000',
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
  },
});
```

```typescript
// In tests — use relative paths only
test('get items', async ({ request }) => {
  const response = await request.get('/api/items'); // baseURL prepended automatically
  expect(response.ok()).toBeTruthy();
});
```
