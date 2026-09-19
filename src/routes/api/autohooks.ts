import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request, reply) => {
    if (request.url.startsWith('/api/v1/auth/login')) {
      return;
    }

    if (!request.session.user) {
      reply.notFound('You must be authenticated to access this route.');
    }
  });
}
