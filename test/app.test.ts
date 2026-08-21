import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { FastifyInstance } from 'fastify';
import setupTestApp from 'noted/#/helpers/setup.js';

let ctx: { app: FastifyInstance; stop: () => Promise<void> };

beforeAll(async () => {
  ctx = await setupTestApp();
});

afterAll(async () => {
  await ctx.stop();
});

describe('App', () => {
  it('GET / returns API welcome message', async () => {
    const response = await ctx.app.inject({
      method: 'GET',
      url: '/', //TODO: Change to `url: '/api/v1'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ message: 'Notes API reporting for duty!' });
  });

  it('GET /healh returns notes count and message', async () => {
    const response = await ctx.app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      message: 'Database connected, server up!',
      notes: expect.any(Number),
    });
  });
});
