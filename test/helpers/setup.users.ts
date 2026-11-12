import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { users } from 'noted/database/schema.js';
import { USERS_ENDPOINT } from './endpoints.js';
import './setup.endpoints.js';

export async function createUser(
  app: FastifyInstance,
  payload: { email: string; username: string; password: string }
) {
  const passwordHash = await app.passwordManager.hash(payload.password);
  const [user] = await app.db
    .insert(users)
    .values({ ...payload, passwordHash })
    .returning();
  return user;
}

export async function deleteUserByEmail(app: FastifyInstance, email: string) {
  await app.db.delete(users).where(eq(users.email, email));
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
