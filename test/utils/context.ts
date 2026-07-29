import { afterAll, beforeEach } from 'vitest';
import { buildApp } from 'noted/app.js';
import { createDatabase } from 'noted/database.js';

export function useTestApp() {
  const db = createDatabase(':memory:');
  const app = buildApp(db);

  beforeEach(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  return app;
}
