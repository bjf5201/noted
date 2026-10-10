import { TestContext } from 'node:test';
import {
  buildTest,
  createUser as createTestUser,
  deleteUserByEmail
} from 'noted/#/helpers/setup.js';

interface UserPayload {
  email: string;
  username: string;
  password: string;
}

export async function buildUserTest(t: TestContext) {
  // Register one teardown hooks o cleanup runs before the app is closed.
  // Don't pass `t` to buildTest here: this fixture owns the app lifecycle.
  const app = await buildTest();
  const createdEmails = new Set<string>();

  t.after(async () => {
    try {
      // Delete only users created successfully through this fixture.
      // Using a Set because it avoids attempting duplicate cleanup for the same email.
      await Promise.all(
        [...createdEmails].map((email) => deleteUserByEmail(app, email))
      );
    } finally {
      // Close app even if database cleanup fails.
      await app.close();
    }
  });

  return {
    app,
    trackUserEmail: (email: string) => createdEmails.add(email),
    createUser: async (payload: UserPayload) => {
      const user = await createTestUser(app, payload);
      createdEmails.add(user.email);
      return user;
    }
  };
}
