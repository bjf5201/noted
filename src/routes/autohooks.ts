import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request, reply) => {
    const server = `${fastify.config.FASTIFY_HOST}:${fastify.config.FASTIFY_PORT}`;
    const publicRoutes = new Set([
      'GET /api/v1/',
      'GET /api/v1/docs',
      'GET /api/v1/notes/explore',
      'GET /api/v1/users',
      // TODO: Figure out how to get public individual notes endpoint here
      // 'GET /api/v1/notes/',
      'POST /api/v1/auth/register',
      'POST /api/v1/auth/session'
    ]);

    const path = new URL(request.url, server).pathname;

    if (publicRoutes.has(`${request.method} ${path}`)) {
      return;
    }

    if (!request.session.user) {
      reply.unauthorized('You must be authenticated to access this route.');
    }
  });
}
