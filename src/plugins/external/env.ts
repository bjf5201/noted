import fp from 'fastify-plugin';
import envSchema from 'env-schema';
import { Static, Type } from 'typebox';
import { FastifyInstance } from 'fastify';

export const EnvSchema = Type.Object({
  NODE_ENV: Type.Union(
    [Type.Literal('production'), Type.Literal('development'), Type.Literal('test')],
    { default: 'production', description: 'Node environment' }
  ),

  // Database
  DB_HOST: Type.String({ default: '0.0.0.0' }),
  DB_PORT: Type.Number({ default: 5432 }),
  DB_USER: Type.String({ default: 'postgres' }),
  DB_PASSWORD: Type.String(),
  DB_DATABASE: Type.String({ default: 'noted_backend' }),
  DB_POOL_MAX: Type.Number({ default: 10 }),

  // Server
  FASTIFY_HOST: Type.String({ default: '0.0.0.0' }),
  FASTIFY_PORT: Type.Number({ default: 3000 }),
  FASTIFY_CLOSE_GRACE_DELAY: Type.Number({ default: 500 }),
  LOG_LEVEL: Type.Union(
    [
      Type.Literal('fatal'),
      Type.Literal('error'),
      Type.Literal('warn'),
      Type.Literal('info'),
      Type.Literal('debug'),
      Type.Literal('trace'),
      Type.Literal('silent')
    ],
    { default: 'info', description: 'Fastify log level' }
  ),

  // Security
  COOKIE_SECRET: Type.String(),
  COOKIE_NAME: Type.String({ default: 'session_id' }),
  RATE_LIMIT_MAX: Type.Number({
    default: 100,
    description: 'Maximum rate limit; put it to 4 in .env.development file for tests'
  })
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
