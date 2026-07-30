import { type FastifyReply, type FastifyRequest } from 'fastify';
import { type TNoteRepository } from 'noted/note/note.repository.js';

export function createNotesController(repo: TNoteRepository) {
  return {
    async createNote(request: FastifyRequest, response: FastifyReply) {
      const body = request.body as unknown as {
        title: string;
        content: string;
      };

      const note = await repo.create(body.title, body.content);

      return response.code(201).send(note);
    },
    async getNote(request: FastifyRequest, response: FastifyReply) {
      const notes = repo.list();

      return response.code(200).send(notes);
    },
  };
}

export type TNoteController = ReturnType<typeof createNotesController>;
