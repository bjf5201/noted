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
    /**
     * @swagger
     * /notes:
     *   post:
     *     description: Create a new note
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *               content:
     *                 type: string
     */
    app.post(
      '/',
      {
        schema: createNoteRouteSchema,
      },
      controller.create
    );

    /**
     * @swagger
     * /notes:
     *   get:
     *     description: List all notes
     *     responses:
     *       200:
     *         description: Array of notes
     */
    app.get(
      '/',
      {
        schema: listNotesRouteSchema,
      },
      controller.getAll
    );

    /**
     * @swagger
     * /notes/{noteId}:
     *   get:
     *     description: Get a single note by ID
     *     parameters:
     *       - in: path
     *         name: noteId
     *         schema:
     *           type: integer
     */
    app.get(
      '/:noteId',
      {
        schema: listNoteByIdRouteSchema,
      },
      controller.getById
    );
  };
}
