import { buildApp } from 'noted/app.js';
import { createDatabase } from 'noted/database.js';
import { initSwagger } from 'noted/swagger.js';

const db = createDatabase('data/notes.db');

const app = buildApp(db);

// Initialize Swagger
await initSwagger(app);

await app.listen({
  port: 3000,
  host: '0.0.0.0',
});
