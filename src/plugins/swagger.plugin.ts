import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import Swagger from '@fastify/swagger';
import SwaggerUi from '@fastify/swagger-ui';

async function initSwagger(app: FastifyInstance) {
  await app.register(Swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Noted API',
        version: '0.0.1', //TODO: get this from package.json programmatically
        description: 'The API for Noted markdown notes app',
      },
      tags: [
        {
          name: 'user',
          description: 'User routes',
        },
        {
          name: 'note',
          description: 'Note routes',
        },
        {
          name: 'root',
          description: 'Base routes from root, including "/" and "/health"',
        },
      ],
      servers: [
        {
          url: `http://localhost:${process.env.PORT ?? 3000}`,
          description: 'Development server',
        },
      ],
    },
  });

  await app.register(SwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
    uiHooks: {
      onRequest(_request, _reply, next) {
        next();
      },
      preHandler(_request, _reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

  app.log.debug('Open API Swagger documentation is available at "/docs"');
}

export default fp(initSwagger, {
  name: 'swagger',
});
