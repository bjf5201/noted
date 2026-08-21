import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { FastifyInstance } from 'fastify';
import setupTestApp from 'noted/#/helpers/setup.js';

type TPayload = Record<string, unknown>;

let ctx: { app: FastifyInstance; stop: () => Promise<void> };

beforeAll(async () => {
  ctx = await setupTestApp();
});

afterAll(async () => {
  await ctx.stop();
});

const register = (payload: TPayload) =>
  ctx.app.inject({ method: 'POST', url: '/users/create', payload: payload });
//const auth = (payload: TPayload) =>
//  ctx.app.inject({ method: 'POST', url: '/api/v1/users/auth', payload });

const user = {
  // TODO: add 'name: Alice Wonderland' property functionality
  // TODO: change below to 'email'
  username: 'Alice@example.com',
  password: 'Silly1-Sea2-Monster4',
};

describe('Users API', () => {
  it('registers a user successfully', async () => {
    const response = await register(user);
    const body = response.json();

    expect(response.statusCode).toBe(201);
    expect(body.username).toBe('Alice@example.com'); // TODO: test for "normalized" (all lowercase) email
  });
});
