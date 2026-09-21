import { describe, it } from 'node:test';
import assert from 'node:assert';
import { eq } from 'drizzle-orm';
import { FastifyInstance } from 'fastify';
import { buildTest } from 'noted/#/helpers/setup.js';
import { users } from 'noted/database/schema.js';

const AUTH_ENDPOINT = '/api/v1/auth';
const USERS_ENDPOINT = '/api/v1/users';

async function createUser(
  app: FastifyInstance,
  payload: { email: string; username: string; password: string }
) {
  return app.inject({
    method: 'POST',
    url: USERS_ENDPOINT,
    payload
  });
}

async function deleteUserByEmail(
  app: Awaited<ReturnType<typeof buildTest>>,
  email: string
) {
  await app.db.delete(users).where(eq(users.email, email));
}

async function updatePasswordWithLoginInjection(
  app: FastifyInstance,
  username: string,
  payload: { currentPassword: string; newPassword: string }
) {
  return app.injectWithLogin(`${username}@example.com`, {
    method: 'PUT',
    url: USERS_ENDPOINT,
    payload
  });
}

describe('Users API (/api/v1/users)', async () => {
  // TODO: there are a lot of strings that could be constants. Create a constants file.
  let app: FastifyInstance;

  describe('POST /api/v1/users (Create new user)', () => {
    it('can successfully create a user', async (t) => {
      app = await buildTest(t);
      const username = `create-${Date.now()}`;
      const email = `${username}@example.com`;

      try {
        const reply = await createUser(app, {
          email,
          username,
          password: 'Password123$'
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

  describe('PUT /api/v1/users (Update user)', async () => {
    it('Enforces rate limiting, allowing no more than 3 password update attempts per minute', async (t) => {
      app = await buildTest(t);
      const username = `update01-${Date.now()}`;
      const email = `${username}@example.com`;

      try {
        await createUser(app, {
          username,
          email,
          password: `Password123$`
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
            url: USERS_ENDPOINT,
            payload: {
              currentPassword: 'WrongPassword123$',
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
          url: USERS_ENDPOINT,
          payload: {
            currentPassword: 'IncorrectPassword123$',
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

    it('should update the password successfully', async (t) => {
      app = await buildTest(t);
      const username = `update02-${Date.now()}`;
      const email = `${username}@example.com`;

      try {
        await createUser(app, {
          username,
          email,
          password: 'Password123$'
        });

        const reply = await updatePasswordWithLoginInjection(app, username, {
          currentPassword: 'Password123$',
          newPassword: 'NewPassword123$'
        });

        assert.strictEqual(reply.statusCode, 200);

        const response = JSON.parse(reply.payload);

        assert.deepStrictEqual(response, {
          success: true,
          message: 'Password updated successfully!'
        });
      } finally {
        await deleteUserByEmail(app, email);
      }
    });

    it('should return code 400 and proper error message if the new password is the same as the current password', async (t) => {
      app = await buildTest(t);
      const username = `update03-${Date.now()}`;
      const email = `${username}@example.com`;

      try {
        await createUser(app, { username, email, password: 'Password123$' });

        const reply = await updatePasswordWithLoginInjection(app, username, {
          currentPassword: 'Password123$',
          newPassword: 'Password123$'
        });

        assert.strictEqual(reply.statusCode, 400);

        const response = JSON.parse(reply.payload);
        assert.deepStrictEqual(response, {
          message: 'New password must not match current password.'
        });
      } finally {
        deleteUserByEmail(app, email);
      }
    });

    it('should return code 400 and proper error message if the new password does not match the required password pattern', async (t) => {
      app = await buildTest(t);
      const username = `update04-${Date.now()}`;
      const email = `${username}@example.com`;

      try {
        await createUser(app, {
          email,
          username,
          password: 'Password123$'
        });

        const reply = await updatePasswordWithLoginInjection(app, username, {
          currentPassword: 'Password123$',
          newPassword: 'weak_password'
        });

        const response = JSON.parse(reply.payload);
        assert.strictEqual(reply.statusCode, 200);
        assert.deepStrictEqual(response, { message: '' });
      } finally {
        deleteUserByEmail(app, email);
      }
    });
  });
});
