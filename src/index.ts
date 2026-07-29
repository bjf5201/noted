import { buildApp } from 'noted/app.js';
import { createDatabase } from 'noted/database.js';

const db = createDatabase('data/notes.db');

const app = buildApp(db);

await app.listen({
  port: 3000,
  host: '0.0.0.0',
});
