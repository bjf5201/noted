import { describe, it } from 'node:test';
import assert from 'node:assert';
import { eq } from 'drizzle-orm';
import { AUTH_ENDPOINT, USERS_ENDPOINT } from 'noted/#/helpers/endpoints.js';
import { users } from 'noted/database/schema.js';
import {
  deleteUserByEmail,
  updatePasswordWithLoginInjection
} from 'noted/#/helpers/setup.js';
import { buildUserTest } from 'noted/#/fixtures/user-fixture.ts';

describe('Users API (/api/v1/users)', async () => {
  describe('POST /api/v1/users (Create new user)', () => {
    it('can successfully create a user', async (t) => {
      const { app, createUser } = await buildUserTest(t);
      const username = `create-${Date.now()}`;
      const email = `${username}@example.com`;

      const reply = await createUser({
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
    });
  });

  describe('PATCH /api/v1/users (Update user)', async () => {
    it('Enforces rate limiting, allowing no more than 3 password update attempts per minute', async (t) => {
      const { app, createUser } = await buildUserTest(t);
      const username = `update01-${Date.now()}`;
      const email = `${username}@example.com`;

      await createUser({
        email,
        username,
        password: 'Password123$'
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
          method: 'PATCH',
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
        method: 'PATCH',
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
    });

    it('updates the password successfully', async (t) => {
      const { app, createUser } = await buildUserTest(t);
      const username = `update02-${Date.now()}`;
      const email = `${username}@example.com`;

      const createReply = await createUser({
        username,
        email,
        password: 'Password123$'
      });
      assert.strictEqual(createReply.statusCode, 201);

      const reply = await updatePasswordWithLoginInjection(app, username, {
        currentPassword: 'Password123$',
        newPassword: 'NewPassword123$'
      });

      assert.strictEqual(reply.statusCode, 200);
      assert.deepStrictEqual(JSON.parse(reply.payload), {
        success: true,
        message: 'Password updated successfully!'
      });
    });

    it('should return code 400 and proper error message if the new password is the same as the current password', async (t) => {
      const { app, createUser } = await buildUserTest(t);
      const username = `update03-${Date.now()}`;
      const email = `${username}@example.com`;

      const createReply = await createUser({
        username,
        email,
        password: 'Password123$'
      });
      assert.strictEqual(createReply.statusCode, 201);

      const reply = await updatePasswordWithLoginInjection(app, username, {
        currentPassword: 'Password123$',
        newPassword: 'Password123$'
      });

      assert.strictEqual(reply.statusCode, 400);

      const message = JSON.parse(reply.payload);
      assert.deepStrictEqual(message, {
        message: 'New password must not match current password.'
      });
    });

    it('should return code 400 and proper error message if the new password does not match the required password pattern', async (t) => {
      const { app, createUser } = await buildUserTest(t);
      const username = `update04-${Date.now()}`;
      const email = `${username}@example.com`;

      const createReply = await createUser({
        email,
        username,
        password: 'Password123$'
      });
      assert.strictEqual(createReply.statusCode, 201);

      const reply = await updatePasswordWithLoginInjection(app, username, {
        currentPassword: 'Password123$',
        newPassword: 'weak_password'
      });

      const message = JSON.parse(reply.payload);
      assert.strictEqual(reply.statusCode, 400);
      assert.deepStrictEqual(message, {
        message:
          'body/newPassword must match pattern "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).*$"',
        statusCode: 400,
        error: 'Bad Request'
      });
    });

    it("should return code 401 and proper error message if the currentPassword entered does not match the current user's password", async (t) => {
      const { app, createUser } = await buildUserTest(t);
      const username = `update05-${Date.now()}`;
      const email = `${username}@example.com`;

      const createReply = await createUser({
        username,
        email,
        password: 'Password123$'
      });
      assert.strictEqual(createReply.statusCode, 201);

      const reply = await updatePasswordWithLoginInjection(app, username, {
        currentPassword: 'WrongPassword123$',
        newPassword: 'Password1234$'
      });

      const message = JSON.parse(reply.payload);
      assert.strictEqual(reply.statusCode, 401);
      assert.deepStrictEqual(message, {
        message: 'Incorrect current password.'
      });
    });

    it('should return code 401 and proper error message if the user does not exist', async (t) => {
      const { app, createUser } = await buildUserTest(t);
      const username = `update06-${Date.now()}`;
      const email = `${username}@example.com`;

      // Create a valid user and log them in so the app has a real, authenticated session
      const createReply = await createUser({
        username,
        email,
        password: 'Password123$'
      });
      assert.strictEqual(createReply.statusCode, 201);

      const loginReply = await app.injectWithLogin(email, {
        method: 'POST',
        url: `${AUTH_ENDPOINT}/login`,
        payload: {
          email,
          password: 'Password123$'
        }
      });

      // Retrieve session cookie
      const sessionCookie = loginReply.cookies.find(
        (cookie) => cookie.name === app.config.COOKIE_NAME
      );

      // Confirm login successed and session cookie was created
      assert.strictEqual(loginReply.statusCode, 200);
      assert.ok(sessionCookie);

      // Simulate a stale user session by deleting the user record fromdatabase
      await deleteUserByEmail(app, email);

      // Send a password update request using the same (stale) session cookie
      // so the app verifies the session (but refuses request when userdoesn't exist)
      const updateResponse = await app.inject({
        method: 'PATCH',
        url: USERS_ENDPOINT,
        payload: {
          currentPassword: 'Password123$',
          newPassword: 'NewPassword123$'
        },
        cookies: {
          [app.config.COOKIE_NAME]: sessionCookie.value
        }
      });

      const message = JSON.parse(updateResponse.payload);
      assert.strictEqual(updateResponse.statusCode, 401);
      assert.deepStrictEqual(message, { message: 'User does not exist.' });
    });

    it('should handle errors gracefully by returning 500 Internal Server Error with unexpected errors', async (t) => {
      const { app, createUser } = await buildUserTest(t);
      const username = `update07-${Date.now()}`;
      const email = `${username}@example.com`;

      const createReply = await createUser({
        username,
        email,
        password: 'Password123$'
      });
      assert.strictEqual(createReply.statusCode, 201);

      const { mock: mockHash } = t.mock.method(app.passwordManager, 'hash');

      mockHash.mockImplementation(() => {
        throw new Error('Unexpected hashing error');
      });

      const reply = await updatePasswordWithLoginInjection(app, username, {
        currentPassword: 'Password123$',
        newPassword: 'NewPassword123$'
      });

      assert.strictEqual(reply.statusCode, 500);
      assert.deepStrictEqual(JSON.parse(reply.payload), {
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Unexpected hashing error'
      });
    });
  });
});
