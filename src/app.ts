import { join } from 'node:path';
import { FastifyError, FastifyInstance, FastifyPluginOptions } from 'fastify';
import fastifyAutoload from '@fastify/autoload';

export async function webApp(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  // Register external plugins first, since they need to be available to application-specific plugins
  await fastify.register(fastifyAutoload, {
    dir: join(import.meta.dirname, 'plugins/external'),
    options: {}
  });

  // Register application-specific plugins before routes
  await fastify.register(fastifyAutoload, {
    dir: join(import.meta.dirname, 'plugins/app'),
    options: { ...opts }
  });

  // Loads routes (defined as plugins in 'src/routes')
  await fastify.register(fastifyAutoload, {
    dir: join(import.meta.dirname, 'routes'),
    options: { ...opts }
  });

  fastify.setErrorHandler((err: FastifyError, request, reply) => {
    fastify.log.error(
      {
        err,
        request: {
          method: request.method,
          url: request.url,
          query: request.query,
          params: request.params
        }
      },
      'Unhandled error occurred with within Fastify app'
    );

    reply.code(err.statusCode ?? 500);

    let message = 'Internal Server Error';
    if (err.statusCode && err.statusCode < 500) {
      message = err.message;
    }

    return { message };
  });
}
