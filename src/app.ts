import type Database from 'better-sqlite3';
import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

import notesRoutes from './modules/note/note.route.js';
import { createNotesRepository } from './modules/note/note.repository.js';

import usersRoutes from './modules/user/user.route.js';
import { createUsersRepository } from './modules/user/user.repository.js';

export function buildApp(db: Database.Database) {
  const app = Fastify().withTypeProvider<TypeBoxTypeProvider>();

  const notesRepository = createNotesRepository(db);
  const usersRepository = createUsersRepository(db);

  app.register(notesRoutes(notesRepository), {
    prefix: '/notes',
  });

  app.register(usersRoutes(usersRepository), {
    prefix: '/users',
  });

  app.get('/', async () => {
    return { message: 'Notes API reporting for duty!' };
  });

  app.get('/health', async () => {
    const result = db.prepare('SELECT COUNT(*) AS count FROM notes').get() as { count: number };

    return {
      message: 'Database connected, server up!',
      notes: result.count,
    };
  });

  return app;
}
