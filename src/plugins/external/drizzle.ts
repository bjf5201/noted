import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { relations } from 'noted/database/relations.js';

declare module 'fastify' {
  export interface FastifyInstance {
    db: ReturnType<typeof drizzle>;
  }
}

const drizzlePlugin: FastifyPluginAsync = async (fastify) => {
  const client = new Pool({
    host: fastify.config.POSTGRES_HOST,
    port: Number(fastify.config.POSTGRES_PORT),
    user: fastify.config.POSTGRES_USER,
    password: fastify.config.POSTGRES_PASSWORD,
    database: fastify.config.POSTGRES_DATABASE
  });

  const db = drizzle({
    client,
    relations
  });
  fastify.decorate('db', db);

  fastify.addHook('onClose', async () => {
    await client.end();
  });
};

export default fp(drizzlePlugin, {
  name: 'drizzle',
  dependencies: ['env']
});
