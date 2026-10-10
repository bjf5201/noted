import type { FastifyPluginAsync } from 'fastify';

const notesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async () => {
    return { message: 'Notes endpoint' };
  });
};

export default notesRoutes;
