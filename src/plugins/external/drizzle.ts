import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from 'noted/database/schema.js';

declare module 'fastify' {
  export interface FastifyInstance {
    db: ReturnType<typeof drizzle>;
  }
}

const drizzlePlugin: FastifyPluginAsync = async (fastify) => {
  const pool = new Pool({
    host: fastify.config.POSTGRES_HOST,
    port: Number(fastify.config.POSTGRES_PORT),
    user: fastify.config.POSTGRES_USER,
    password: fastify.config.POSTGRES_PASSWORD,
    database: fastify.config.POSTGRES_DATABASE
  });

  const db = drizzle(pool, { schema });
  fastify.decorate('db', db);

  fastify.addHook('onClose', async () => {
    await pool.end();
  });
};

export default fp(drizzlePlugin, {
  name: 'drizzle',
  dependencies: ['env']
});
