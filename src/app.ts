import { join } from 'node:path';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fastifyAutoload, { type AutoloadPluginOptions } from '@fastify/autoload';
import { errorHandler } from './lib/error-handler.js';

export type AppOptions = {
  skipOverride: boolean;
  // Add custom options for app below here
} & Partial<AutoloadPluginOptions>;

export async function webApp(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) {
  delete opts.skipOverride;
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
    autoHooks: true,
    cascadeHooks: true,
    options: {
      prefix: '/api/v1'
    }
  });

  fastify.setErrorHandler(errorHandler);
}
