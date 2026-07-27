import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../../src/app.js';
import { createDatabase } from '../../src/database.js';

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
