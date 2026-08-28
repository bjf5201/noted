import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';

const swaggerPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  /**
   * Fastify plugin for serving Swagger (OpenAPI v2 or OpenAPI v3) schemas
   *
   * @see {@link https://github.com/fastify/fastify-swagger}
   */
  await fastify.register(fastifySwagger, {
    hideUntagged: true,
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Noted API',
        version: '0.0.1', //TODO: get this from package.json programmatically
        description: 'The API for Noted markdown notes app'
      },
      tags: [
        {
          name: 'auth',
          description: 'Authorization routes'
        },
        {
          name: 'user',
          description: 'User routes'
        },
        {
          name: 'note',
          description: 'Note routes'
        },
        {
          name: 'root',
          description: 'Base routes from root, including "/" and "/health"'
        }
      ],
      servers: [
        {
          url: `http://localhost:${process.env.PORT ?? 3000}`,
          description: 'Development server'
        }
      ]
    }
  });

  /**
   * Fastify plugin for serving Swagger UI
   *
   * @see {@link https://github.com/fastify/fastify-swagger-ui}
   */

  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/api/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    uiHooks: {
      onRequest(_request, _reply, next) {
        next();
      },
      preHandler(_request, _reply, next) {
        next();
      }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header
  });

  fastify.log.debug('Open API Swagger documentation is available at "/docs"');
};

export default fp(swaggerPlugin, {
  name: 'swagger'
});
