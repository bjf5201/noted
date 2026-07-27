import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { createDatabase } from '../src/database.js';

describe('GET /', () => {
  const db = createDatabase(':memory:');
  const app = buildApp(db);

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns database status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/',
    });

    expect(response.statusCode).toBe(200);

    expect(response.json()).toEqual({
      message: 'Database connected!',
      notes: expect.any(Number),
    });
  });
});
