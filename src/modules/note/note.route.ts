import { type FastifyPluginAsync } from 'fastify';

import { createNotesController } from './note.controller.js';
import { type TNoteRepository } from './note.repository.js';
import {
  createNoteRouteSchema,
  listNoteByIdRouteSchema,
  listNotesRouteSchema,
} from './note.schema.js';

export default function notesRoutes(repo: TNoteRepository): FastifyPluginAsync {
  const controller = createNotesController(repo);

  return async function (app) {
    // POST /notes endpoint
    app.post(
      '/',
      {
        schema: createNoteRouteSchema,
      },
      controller.create
    );

    // GET /notes endpoint
    app.get(
      '/',
      {
        schema: listNotesRouteSchema,
      },
      controller.getAll
    );

    // GET /notes/:noteId endpoint
    app.get(
      '/:noteId',
      {
        schema: listNoteByIdRouteSchema,
      },
      controller.getById
    );
  };
}
