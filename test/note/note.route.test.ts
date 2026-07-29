import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from 'noted/app.js';
import { createDatabase } from 'noted/database.js';

describe('GET /notes', () => {
  const db = createDatabase(':memory:');
  const app = buildApp(db);

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns empty array when no notes exist', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/notes',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });
});

describe('POST /notes', () => {
  const db = createDatabase(':memory:');
  const app = buildApp(db);

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a new note', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/notes',
      payload: {
        title: 'My first note',
        content: 'Hello world',
      },
    });

    expect(response.statusCode).toBe(201);

    expect(response.json()).toEqual({
      id: expect.any(Number),
      title: 'My first note',
      content: 'Hello world',
    });
  });
});
