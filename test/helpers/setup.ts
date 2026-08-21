import type { FastifyInstance } from 'fastify';

import { createDatabase } from 'noted/database.js';
import { buildApp } from 'noted/app.js';
/**
 *   let app: FastifyInstance;

  beforeEach(async () => {
    const db = createDatabase(':memory:');
    app = buildApp(db);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });
 */
/**
 * Spins up an in-memory MongoDB and builds the app pointing at it.
 * Env vars must be set BEFORE the app is imported so the app picks them up.
 */
const setupTestApp = async (): Promise<{ app: FastifyInstance; stop: () => Promise<void> }> => {
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'silent';
  process.env.JWT_SECRET = 'test-secret';
  process.env.SALT = '4';
  process.env.SQLITE_DATABASE = 'test';

  const db = createDatabase(':memory:');
  const app = buildApp(db);
  await app.ready();

  return {
    app,
    stop: async () => {
      await app.close();
    },
  };
};

export default setupTestApp;
