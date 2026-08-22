import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import swaggerJsdoc from 'swagger-jsdoc';
import type { SwaggerDefinition } from 'swagger-jsdoc';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Swagger definition
// see: https://github.com/surnet/swagger-jsdoc
const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    // API info (required)
    title: 'Noted API', // (required)
    version: '0.0.1', // (required) TODO: create version programmatically by reading from package.json
    description: 'A simple markdown notes API',
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT ?? 3000}`,
      description: 'Dev server',
    },
  ],
};

const apiDirectory = join(__dirname, 'src');

const options: swaggerJsdoc.Options = {
  swaggerDefinition,
  apis: [`${apiDirectory}/**/*.ts`],
};

export async function initSwagger(app: FastifyInstance) {
  const swaggerSpec = swaggerJsdoc(options);

  // Write to generated swagger file on dev
  if (process.env.NODE_ENV !== 'production') {
    writeFileSync(
      join(__dirname, 'generated', 'swagger.json'),
      JSON.stringify(swaggerSpec, null, 2)
    );
  }

  await app.register(fastifySwagger, {
    mode: 'dynamic',
    swagger: swaggerSpec,
  });

  await app.register(fastifySwaggerUi, {
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
}
