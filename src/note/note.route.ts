import { type FastifyPluginAsync } from 'fastify';

import { createNotesController } from 'noted/note/note.controller.js';
import { type TNoteRepository } from 'noted/note/note.repository.js';

export default function notesRoutes(repo: TNoteRepository): FastifyPluginAsync {
  const controller = createNotesController(repo);

  return async function (app) {
    // POST /notes endpoint
    app.post('/', controller.createNote);

    // GET /notes endpoint
    app.get('/', controller.getNote);
  };
}
