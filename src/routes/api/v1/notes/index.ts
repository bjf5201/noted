import type { FastifyPluginAsync } from 'fastify';
import { createNotesRepository } from 'noted/plugins/app/notes/notes-repository.js';

const notesRoutes: FastifyPluginAsync = async (fastify) => {
  const notesRepository = createNotesRepository(fastify);

  fastify.get('/', async (request) => {
    return notesRepository.findByUserId(request.session.user.id);
  });
};

export default notesRoutes;
