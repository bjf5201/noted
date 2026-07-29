import { buildApp } from 'noted/app.js';
import { createDatabase } from 'noted/database.js';

export async function createTestContext() {
  const db = createDatabase(':memory:');
  const app = buildApp(db);

  await app.ready();

  return { app };
}
