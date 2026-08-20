import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createDatabase } from 'noted/database.js';
import { buildApp } from 'noted/app.js';

const USERNAME_ALICE = 'aliceiscool19';
const PW_ALICE = 'secretPassword8*';
const USERNAME_BOB = 'bob1samaz1ng1960';
const PW_BOB = 'NotTelling28';

describe('POST /users/create -- creates User successfully', () => {
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
      payload: { username: USERNAME_ALICE, password: PW_ALICE },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({ userId: expect.any(Number), username: USERNAME_ALICE });
  });

  it('returns the submitted username and userId', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users/create',
      payload: { username: USERNAME_BOB, password: PW_BOB },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      userId: expect.any(Number),
      username: USERNAME_BOB,
    });
  });

  it('creates a unique id for each user', async () => {
    const firstResponse = await app.inject({
      method: 'POST',
      url: '/users/create',
      payload: {
        username: USERNAME_ALICE,
        password: PW_ALICE,
      },
    });

    const secondResponse = await app.inject({
      method: 'POST',
      url: '/users/create',
      payload: {
        username: USERNAME_BOB,
        password: PW_BOB,
      },
    });

    const firstUser = firstResponse.json();
    const secondUser = secondResponse.json();

    expect(firstUser.userId).toEqual(expect.any(Number));
    expect(secondUser.userId).toEqual(expect.any(Number));
    expect(secondUser.userId).not.toBe(firstUser.userId);
  });

  it('does not return the user password', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users/create',
      payload: { username: USERNAME_ALICE, password: PW_ALICE },
    });

    expect(response.json()).not.toContain({
      password: PW_ALICE,
    });
  });
});

describe('POST /users/create -- Rejects bad requests', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    const db = createDatabase(':memory:');
    app = buildApp(db);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('rejects a request with a missing username', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users/create',
      payload: { password: PW_ALICE },
    });

    expect(response.statusCode).toBe(400);
  });

  it('rejects a request with a missing password', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users/create',
      payload: { username: USERNAME_ALICE },
    });

    expect(response.statusCode).toBe(400);
  });
});
