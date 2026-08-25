import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createDatabase } from 'noted/database.js';
import { buildApp } from 'noted/app.js';

async function loginAndGetCookie(app: FastifyInstance, username: string, password: string) {
  const res = await app.inject({
    method: 'POST',
    url: '/users/login',
    payload: { username, password }
  });

  expect(res.statusCode).toBe(200);

  const setCookie = res.headers['set-cookie'];
  if (!setCookie) return undefined;
  const cookie = Array.isArray(setCookie) ? setCookie[0].split(';')[0] : setCookie.split(';')[0];
  return cookie;
}

describe('User routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    const db = createDatabase(':memory:');
    app = buildApp(db);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it.todo('allows a user to login and receive a session cookie', async () => {
    // create user
    await app.inject({
      method: 'POST',
      url: '/users/create',
      payload: { username: 'bob', password: 'hunter2' }
    });

    // login
    const res = await app.inject({
      method: 'POST',
      url: '/users/login',
      payload: { username: 'bob', password: 'hunter2' }
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it.todo("returns only the logged-in user's notes", async () => {
    // create users
    await app.inject({
      method: 'POST',
      url: '/users/create',
      payload: { username: 'userA', password: 'pwA' }
    });
    await app.inject({
      method: 'POST',
      url: '/users/create',
      payload: { username: 'userB', password: 'pwB' }
    });

    // login as userA and create a note
    const cookieA = await loginAndGetCookie(app, 'userA', 'pwA');
    await app.inject({
      method: 'POST',
      url: '/notes',
      payload: { title: 'A note', content: 'belongs to A' },
      headers: { cookie: cookieA || '' }
    });

    // login as userB and create a note
    const cookieB = await loginAndGetCookie(app, 'userB', 'pwB');
    await app.inject({
      method: 'POST',
      url: '/notes',
      payload: { title: 'B note', content: 'belongs to B' },
      headers: { cookie: cookieB || '' }
    });

    // when fetching notes as userA, only A's note is returned
    const resA = await app.inject({
      method: 'GET',
      url: '/notes',
      headers: { cookie: cookieA || '' }
    });
    expect(resA.statusCode).toBe(200);
    const notesA = resA.json();
    expect(notesA).toHaveLength(1);
    expect(notesA[0].title).toBe('A note');

    // when fetching notes as userB, only B's note is returned
    const resB = await app.inject({
      method: 'GET',
      url: '/notes',
      headers: { cookie: cookieB || '' }
    });
    expect(resB.statusCode).toBe(200);
    const notesB = resB.json();
    expect(notesB).toHaveLength(1);
    expect(notesB[0].title).toBe('B note');
  });
});
