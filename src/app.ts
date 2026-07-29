import type Database from 'better-sqlite3';
import Fastify from 'fastify';
import notesRoutes from 'noted/note/note.route.js';

export function buildApp(db: Database.Database) {
  const app = Fastify({
    logger: true,
  });

  app.register(notesRoutes(db), {
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
