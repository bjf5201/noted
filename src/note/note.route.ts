import type Database from 'better-sqlite3';
import type { FastifyPluginAsync } from 'fastify';

export default function notesRoutes(db: Database.Database): FastifyPluginAsync {
  return async function (app) {
    // POST /notes endpoint
    app.post('/', async (request, response) => {
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

      return response.code(201).send(note);
    });

    // GET /notes endpoint
    app.get('/', async (request, response) => {
      const result = db.prepare(`SELECT id, title, content FROM notes ORDER BY id DESC`).all();

      return response.code(200).send(result);
    });
  };
}
