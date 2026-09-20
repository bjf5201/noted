import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request, reply) => {
    const publicRoutes = new Set([
      'POST /api/v1/users',
      'POST /api/v1/auth/login'
    ]);

    if (publicRoutes.has(`${request.method} ${request.url}`)) {
      return;
    }

    if (!request.session.user) {
      reply.notFound('You must be authenticated to access this route.');
    }
  });
}
