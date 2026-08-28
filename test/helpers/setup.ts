import Fastify, { FastifyInstance, LightMyRequestResponse } from 'fastify';
import fp from 'fastify-plugin';
import { afterEach, expect } from 'vitest';
import { webApp } from 'noted/app.js';

declare module 'fastify' {
  interface FastifyInstance {
    login: typeof login;
  }
}

export function config() {
  return {
    skipOverride: true
  };
}

export function expectValidationError(res: LightMyRequestResponse, expectedMessage: string) {
  expect(res.statusCode).toBe(400);
  const { message } = JSON.parse(res.payload);
  expect(message).toBe(expectedMessage);
}

async function login(this: FastifyInstance, username: string) {
  const res = await this.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: {
      username,
      password: 'Password123$'
    }
  });

  return res; //TODO: change to return a JWT cookie?
}

export async function build() {
  const app = Fastify();

  app.register(fp(webApp), config());

  await app.ready();

  app.login = login;

  afterEach(() => app.close());

  return app;
}
