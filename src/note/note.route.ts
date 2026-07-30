import type { FastifyPluginAsync } from 'fastify';
import type { TNoteRepository } from 'noted/note/note.repository.js';

export default function notesRoutes(repo: TNoteRepository): FastifyPluginAsync {
  return async function (app) {
    // POST /notes endpoint
    app.post('/', async (request, response) => {
      const body = request.body as {
        title: string;
        content: string;
      };

      const note = repo.create(body.title, body.content);

      return response.code(201).send(note);
    });

    // GET /notes endpoint
    app.get('/', async (request, response) => {
      const notes = repo.list();

      return response.code(200).send(notes);
    });
  };
}
