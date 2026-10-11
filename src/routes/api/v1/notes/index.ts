import type { FastifyPluginAsync } from 'fastify';

const notesRoutes: FastifyPluginAsync = async (fastify) => {
  const { notesRepository } = fastify;

  fastify.get('/', async (request) => {
    return notesRepository.findByUserId(request.session.user.id);
  });
};

export default notesRoutes;
