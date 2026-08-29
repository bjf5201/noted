import { beforeEach, describe, expect, it } from 'vitest';
import { FastifyInstance } from 'fastify';
import { build } from './helpers/setup.js';

describe('GET /notes', () => {
  let ctx: FastifyInstance;

  beforeEach(async () => {
    ctx = await build();
  });

  it('returns empty array when no notes exist', async () => {
    const response = await ctx.inject({
      method: 'GET',
      url: '/notes'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });

  it('returns notes that have been created', async () => {
    await ctx.inject({
      method: 'POST',
      url: '/notes',
      payload: {
        title: 'Test Note 1',
        content: '# Test Note'
      }
    });

    const response = await ctx.inject({
      method: 'GET',
      url: '/notes'
    });

    const notes = response.json();

    expect(notes).toHaveLength(1);
    expect(notes[0]).toEqual({
      noteId: expect.any(Number),
      title: 'Test Note 1',
      content: '# Test Note'
    });
  });

  it('returns newest notes first', async () => {
    await ctx.inject({
      method: 'POST',
      url: '/notes',
      payload: {
        title: 'First note',
        content: 'Created first.'
      }
    });

    await ctx.inject({
      method: 'POST',
      url: '/notes',
      payload: {
        title: 'Second Note',
        content: 'Created second.'
      }
    });

    const response = await ctx.inject({
      method: 'GET',
      url: '/notes'
    });

    const notes = response.json();

    expect(notes).toHaveLength(2);

    expect(notes[0].title).toBe('Second Note');
    expect(notes[1].title).toBe('First note');
  });
});

describe('GET /notes/:noteId', () => {
  let ctx: FastifyInstance;

  beforeEach(async () => {
    ctx = await build();
  });

  it('returns the note requested by id', async () => {
    const notetoFind = await ctx.inject({
      method: 'POST',
      url: '/notes',
      payload: {
        title: 'First note',
        content: '# First Note Content'
      }
    });

    await ctx.inject({
      method: 'POST',
      url: '/notes',
      payload: {
        title: 'Second note',
        content: '# Second \n ## Note Content'
      }
    });

    const created = notetoFind.json();

    const response = await ctx.inject({
      method: 'GET',
      url: `/notes/${created.noteId}`
    });

    expect(response.statusCode).toBe(200);

    expect(response.json()).toEqual({
      noteId: created.noteId,
      title: 'First note',
      content: '# First Note Content'
    });
  });

  it('returns 404 when the note does not exist', async () => {
    const response = await ctx.inject({
      method: 'GET',
      url: '/notes/999'
    });

    expect(response.statusCode).toBe(404);
  });
});

describe('POST /notes', () => {
  let ctx: FastifyInstance;

  beforeEach(async () => {
    ctx = await build();
  });

  it('creates a new note', async () => {
    const response = await ctx.inject({
      method: 'POST',
      url: '/notes',
      payload: {
        title: 'My first note',
        content: 'Hello world'
      }
    });

    expect(response.statusCode).toBe(201);

    expect(response.json()).toEqual({
      noteId: expect.any(Number),
      title: 'My first note',
      content: 'Hello world'
    });
  });
});
