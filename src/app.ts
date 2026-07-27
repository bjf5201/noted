import type Database from 'better-sqlite3';
import Fastify from 'fastify';

export function buildApp(db: Database.Database) {
  const app = Fastify({
    logger: true,
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
