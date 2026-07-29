import type Database from 'better-sqlite3';
import type { FastifyPluginAsync } from 'fastify';

export default function notesRoutes(db: Database.Database): FastifyPluginAsync {
  return async function (app) {
    app.post('/', async (request, reply) => {
      const body = request.body as {
        title: string;
        content: string;
      };

      const result = db
        .prepare(`INSERT INTO notes (title, content) VALUES (?, ?)`)
        .run(body.title, body.content);

      const note = db
        .prepare(`SELECT id, title, content FROM notes WHERE id = ?`)
        .get(result.lastInsertRowid);

      return reply.code(201).send(note);
    });

    app.get('/', async (request, reply) => {
      return reply.code(200).send([]);
    });
  };
}
