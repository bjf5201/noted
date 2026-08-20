import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createDatabase } from 'noted/database.js';
import { buildApp } from 'noted/app.js';

describe('POST /users/create', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    const db = createDatabase(':memory:');
    app = buildApp(db);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates a new user', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users/create',
      payload: { username: 'alice', password: 'secret' },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({ userId: expect.any(Number), username: 'alice' });
  });

  it('returns the submitted username', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users/create',
      payload: { username: 'bob', password: 'nottelling' },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      userId: expect.any(Number),
      username: 'bob',
    });
  });

  it('creates a unique id for each user', async () => {
    const firstResponse = await app.inject({
      method: 'POST',
      url: '/users/create',
      payload: {
        username: 'alice',
        password: 'secret',
      },
    });

    const secondResponse = await app.inject({
      method: 'POST',
      url: '/users/create',
      payload: {
        username: 'bob',
        password: 'hush',
      },
    });

    const firstUser = firstResponse.json();
    const secondUser = secondResponse.json();

    expect(firstUser.userId).toEqual(expect.any(Number));
    expect(secondUser.userId).toEqual(expect.any(Number));
    expect(secondUser.userId).not.toBe(firstUser.userId);
  });
});
