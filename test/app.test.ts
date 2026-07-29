import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createDatabase } from 'noted/database.js';
import { buildApp } from 'noted/app.js';

describe('GET /', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    const db = createDatabase(':memory:');
    app = buildApp(db);
    await app.ready();
  });

  afterEach(async () => {
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
