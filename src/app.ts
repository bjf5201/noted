import type Database from 'better-sqlite3';
import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

import notesRoutes from 'noted/note/note.route.js';
import { createNotesRepository } from './note/note.repository.js';

export function buildApp(db: Database.Database) {
  const app = Fastify().withTypeProvider<TypeBoxTypeProvider>();

  const notesRepository = createNotesRepository(db);

  app.register(notesRoutes(notesRepository), {
    prefix: '/notes',
  });

  app.get('/', async () => {
    const result = db.prepare('SELECT COUNT(*) AS count FROM notes').get() as { count: number };

    return {
      message: 'Database connected!',
      notes: result.count,
    };
  });

  return app;
}
