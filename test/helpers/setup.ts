import assert from 'node:assert';
import { TestContext } from 'node:test';
import Fastify, { FastifyInstance, InjectOptions, LightMyRequestResponse } from 'fastify';
import fp from 'fastify-plugin';
import { webApp } from 'noted/app.js';

//type TestFastifyInstance = FastifyInstance & {
//  config: {
//    COOKIE_NAME: string;
//    [key: string]: unknown;
//  };
//  login: typeof login;
//};

declare module 'fastify' {
  interface FastifyInstance {
    injectWithLogin: typeof injectWithLogin;
    login: typeof login;
  }
}

// Fill in this config with all config
// needed for testing
export function config() {
  return {
    skipOverride: true // Register application with fastify-plugin
  };
}

export function expectValidationError(res: LightMyRequestResponse, expectedMessage: string) {
  assert.strictEqual(res.statusCode, 400);
  const { message } = JSON.parse(res.payload);
  assert.strictEqual(message, expectedMessage);
}

async function login(this: FastifyInstance, email: string) {
  const res = await this.inject({
    method: 'POST',
    url: '/api/auth/login',
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

async function injectWithLogin(this: FastifyInstance, email: string, opts: InjectOptions) {
  const cookieValue = await this.login(email);

  opts.cookies = {
    ...opts.cookies,
    [this.config.COOKIE_NAME]: cookieValue
  };

  return this.inject({
    ...opts
  });
}

// automatically build and tear down test instance
export async function buildTest(t?: TestContext) {
  const app = Fastify();

  app.register(fp(webApp), config());

  await app.ready();

  // Since this is after the app has started,
  // cannot decorate instance with '.decorate'
  app.login = login;
  app.injectWithLogin = injectWithLogin;

  if (t) {
    t.after(() => app.close());
  }

  return app;
}
