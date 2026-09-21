import { describe, it } from 'node:test';
import assert from 'node:assert';
import { eq } from 'drizzle-orm';
import { FastifyInstance } from 'fastify';
import { buildTest } from 'noted/#/helpers/setup.js';
import { scryptHash } from 'noted/plugins/app/password-manager.js';
import { users } from 'noted/database/schema.js';

async function createUser(
  app: FastifyInstance,
  email: string,
  payload: { email: string; username: string; password: string }
) {
  return app.injectWithLogin(email, {
    method: 'POST',
    url: '/api/v1/users',
    payload
  });
}

async function deleteUserByEmail(
  app: Awaited<ReturnType<typeof buildTest>>,
  email: string
) {
  await app.db.delete(users).where(eq(users.email, email));
}

async function updatePassword(
  app: FastifyInstance,
  username: string,
  payload: { currentPassword: string; newPassword: string }
) {
  return app.injectWithLogin(`${username}@example.com`, {
    method: 'PUT',
    url: '/api/v1/users',
    payload
  });
}

describe('Users API', async () => {
  // TODO: there are a lot of strings that could be constants. Create a constants file.
  const hash = await scryptHash('Password123$');
  const AUTH_ENDPOINT = '/api/v1/auth';
  const USERS_ENDPOINT = '/api/v1/users';
  let app: FastifyInstance;

  describe('POST /api/v1/users', () => {
    it('can successfully create a user', async (t) => {
      app = await buildTest(t);
      const email = `create-${Date.now()}@example.com`;

      try {
        const reply = await app.inject({
          method: 'POST',
          url: `${USERS_ENDPOINT}`,
          payload: {
            username: `create-${Date.now()}`,
            email,
            password: 'Password123$'
          }
        });

        const response = JSON.parse(reply.payload);

        assert.strictEqual(reply.statusCode, 201);
        assert.strictEqual(typeof response.id, 'number');
        assert.ok(response.id > 0);

        const [createdUser] = await app.db
          .select()
          .from(users)
          .where(eq(users.email, email));

        assert.ok(createdUser);
        assert.notStrictEqual(createdUser.password, 'Password123$');
      } finally {
        await deleteUserByEmail(app, email);
      }
    });
  });

  describe('Update User API', async () => {
    it('Enforces rate limiting, allowing no more than 3 password update attempts per minute', async (t) => {
      app = await buildTest(t);
      const email = `update01-${Date.now()}@example.com`;

      try {
        await createUser(app, email, {
          username: `update01-${Date.now()}`,
          email,
          password: hash
        });

        const loginReply = await app.injectWithLogin(email, {
          method: 'POST',
          url: `${AUTH_ENDPOINT}/login`,
          payload: {
            email,
            password: 'Password123$'
          }
        });

        app.config = {
          ...app.config,
          COOKIE_SECRET: loginReply.cookies[0].value
        };

        for (let i = 0; i < 3; i++) {
          const replyInner = await app.inject({
            method: 'PUT',
            url: `${USERS_ENDPOINT}`,
            payload: {
              currentPassword: 'wrong_password',
              newPassword: 'Password123$'
            },
            cookies: {
              [app.config.COOKIE_NAME]: loginReply.cookies[0].value
            }
          });

          assert.strictEqual(replyInner.statusCode, 401);
        }

        const reply = await app.inject({
          method: 'PUT',
          url: `${USERS_ENDPOINT}`,
          payload: {
            currentPassword: 'incorrect_password',
            newPassword: 'Password123$'
          },
          cookies: {
            [app.config.COOKIE_NAME]: loginReply.cookies[0].value
          }
        });

        assert.strictEqual(reply.statusCode, 429);
      } finally {
        await deleteUserByEmail(app, email);
      }
    });

    it.skip('should update the password successfully', async (t) => {
      app = await buildTest(t);
      const email = `update02-${Date.now()}@example.com`;

      try {
        await createUser(app, email, {
          username: `update02-${Date.now()}`,
          email,
          password: hash
        });
      } finally {
        await deleteUserByEmail(app, email);
      }
    });
  });
});
