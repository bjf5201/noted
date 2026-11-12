import assert from 'node:assert';
import type { TestContext } from 'node:test';
import type {
  FastifyInstance,
  InjectOptions,
  LightMyRequestResponse
} from 'fastify';
import { LOGIN_ENDPOINT } from './endpoints.js';
import { buildTest } from './setup.js';

declare module 'fastify' {
  interface FastifyInstance {
    injectWithLogin: typeof injectWithLogin;
    login: typeof login;
  }
}

async function login(this: FastifyInstance, email: string) {
  const res = await this.inject({
    method: 'POST',
    url: LOGIN_ENDPOINT,
    payload: {
      email,
      password: 'Password123$'
    }
  });

  const cookie = res.cookies.find((c) => c.name === this.config.COOKIE_NAME);

  if (!cookie) {
    throw new Error('Failed to retrieve session cookie.');
  }

  return cookie.value;
}

async function injectWithLogin(
  this: FastifyInstance,
  email: string,
  opts: InjectOptions
) {
  const cookieValue = await this.login(email);

  return this.inject({
    ...opts,
    cookies: {
      ...opts.cookies,
      [this.config.COOKIE_NAME]: cookieValue
    }
  });
}

export async function buildEndpointTest(t?: TestContext) {
  const app = await buildTest(t);
  app.login = login;
  app.injectWithLogin = injectWithLogin;
  return app;
}

export function expectValidationError(
  res: LightMyRequestResponse,
  expectedMessage: string
) {
  assert.strictEqual(res.statusCode, 400);
  const { message } = JSON.parse(res.payload);
  assert.strictEqual(message, expectedMessage);
}
