import fp from 'fastify-plugin';
import envSchema from 'env-schema';
import { Static, Type } from 'typebox';
import { FastifyInstance } from 'fastify';

export const EnvSchema = Type.Object({
  NODE_ENV: Type.Union(
    [Type.Literal('production'), Type.Literal('development'), Type.Literal('test')],
    { default: 'production', description: 'Node environment' }
  ),
  LOG_LEVEL: Type.Union(
    [
      Type.Literal('fatal'),
      Type.Literal('error'),
      Type.Literal('warn'),
      Type.Literal('info'),
      Type.Literal('debug'),
      Type.Literal('trace')
    ],
    { default: 'info', description: 'Fastify log level' }
  ),

  // Security

  SECRET_KEY_JWT: Type.String({ description: 'Secret key for JSON Web Token' }),
  RATE_LIMIT_MAX: Type.Number({
    default: 4,
    description: 'Maximum rate limit; increase if necessary'
  }),

  // Database
  DB_HOST: Type.String({ default: '0.0.0.0' }),
  DB_PORT: Type.Number({ default: 5432 }),
  DB_USER: Type.String({ default: 'postgres' }),
  DB_PASSWORD: Type.String(),
  DB_NAME: Type.String({ default: 'noted_backend' }),
  DB_POOL_MAX: Type.Number({ default: 10 }),

  // Database - Test
  DB_TEST_HOST: Type.Optional(
    Type.String({ default: '0.0.0.0', description: 'Test database host' })
  ),
  DB_TEST_PORT: Type.Optional(Type.Number({ default: 5432, description: 'Test database port' })),
  DB_TEST_USER: Type.Optional(Type.String()),
  DB_TEST_PASSWORD: Type.Optional(Type.String()),
  DB_TEST_NAME: Type.Optional(Type.String()),
  DB_TEST_POOL_MAX: Type.Optional(Type.Number()),

  // Fastify
  FASTIFY_HOST: Type.String({ default: '0.0.0.0' }),
  FASTIFY_PORT: Type.Number({ default: 3000 }),
  FASTIFY_CLOSE_GRACE_DELAY: Type.Number({ default: 500 })
});

export type TEnvConfig = Static<typeof EnvSchema>;

async function configPlugin(fastify: FastifyInstance) {
  const config = envSchema<TEnvConfig>({
    schema: EnvSchema,
    dotenv: true // will read .env in root folder
  });

  fastify.decorate('config', config);
}

export default fp(configPlugin, {
  name: 'config'
});
