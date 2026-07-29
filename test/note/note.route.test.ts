import { describe, expect, it } from 'vitest';
import { useTestApp } from 'noted/#/utils/context.js';

describe('GET /notes', () => {
  const app = useTestApp();

  it('returns empty array when no notes exist', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/notes',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });

  it('returns notes that have been created', async () => {
    await app.inject({
      method: 'POST',
      url: '/notes',
      payload: {
        title: 'Test Note 1',
        content: '# Test Note',
      },
    });

    const response = await app.inject({
      method: 'GET',
      url: '/notes',
    });

    const notes = response.json();

    expect(notes).toHaveLength(1);
    expect(notes[0]).toEqual({
      id: expect.any(Number),
      title: 'Test Note 1',
      content: '# Test Note',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });
});

describe('POST /notes', () => {
  const app = useTestApp();

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
