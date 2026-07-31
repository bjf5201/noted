import { type FastifyReply, type FastifyRequest } from 'fastify';
import { type TNoteRepository } from 'noted/note/note.repository.js';

interface TGetNoteByIdParams {
  noteId: number;
}

export function createNotesController(repo: TNoteRepository) {
  return {
    async create(request: FastifyRequest, response: FastifyReply) {
      const body = request.body as {
        title: string;
        content: string;
      };

      const note = await repo.create(body.title, body.content);

      return response.code(201).send(note);
    },
    async getAll(request: FastifyRequest, response: FastifyReply) {
      const notes = repo.listAll();

      return response.code(200).send(notes);
    },
    async getById(request: FastifyRequest<{ Params: TGetNoteByIdParams }>, response: FastifyReply) {
      const note = repo.listById(request.params.noteId);
      if (note) {
        return response.code(200).send(note);
      } else {
        return response.code(404).send();
      }
    },
  };
}

export type TNoteController = ReturnType<typeof createNotesController>;
