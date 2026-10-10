import assert from 'node:assert';
import { TestContext } from 'node:test';
import Fastify, {
  FastifyInstance,
  InjectOptions,
  LightMyRequestResponse
} from 'fastify';
import fp from 'fastify-plugin';
import { eq } from 'drizzle-orm';
import { LOGIN_ENDPOINT, USERS_ENDPOINT } from './endpoints.js';
import { notes, users } from 'noted/database/schema.js';
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

// Create a user for testing
export async function createUser(
  app: FastifyInstance,
  payload: { email: string; username: string; password: string }
) {
  const password = await app.passwordManager.hash(payload.password);
  const [user] = await app.db
    .insert(users)
    .values({ ...payload, password })
    .returning();
  return user;
}

// Delete a user (used at end of tests which have created test users)
export async function deleteUserByEmail(app: FastifyInstance, email: string) {
  await app.db.delete(users).where(eq(users.email, email));
}

// Create a note
export async function createNote(
  app: FastifyInstance,
  payload: { userId: number; title: string; content: string }
) {
  const [note] = await app.db.insert(notes).values(payload).returning();
  return note;
}

// Expect for there to be a validation error
export function expectValidationError(
  res: LightMyRequestResponse,
  expectedMessage: string
) {
  assert.strictEqual(res.statusCode, 400);
  const { message } = JSON.parse(res.payload);
  assert.strictEqual(message, expectedMessage);
}

// Login with specific email for testing
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

  opts.cookies = {
    ...opts.cookies,
    [this.config.COOKIE_NAME]: cookieValue
  };

  return this.inject({
    ...opts
  });
}

export async function updatePasswordWithLoginInjection(
  app: FastifyInstance,
  username: string,
  payload: { currentPassword: string; newPassword: string }
) {
  return app.injectWithLogin(`${username}@example.com`, {
    method: 'PATCH',
    url: USERS_ENDPOINT,
    payload
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
