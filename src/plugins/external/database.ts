import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import Database from 'better-sqlite3';

// Add fastify.db typing for decorator
declare module 'fastify' {
  interface FastifyInstance {
    db: Database.Database;
  }
}

const databasePlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const dbFile = process.env.NODE_ENV === 'development' ? ':memory:' : 'data/notes.db';
  // TODO: ensure the URL to the dbFilename is correct using 'node:path' utils
  const dbFilename = process.env.DATBASE_FILE ?? dbFile;
  const db = new Database(dbFilename);

  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      noteId INTEGER PRIMARY KEY AUTOINCREMENT
      title TEXT NOT NULL
      content TEXT NOT NULL
    )

    CREATE TABLE IF NOT EXISTS users (
      userId INTEGER PRIMARY KEY AUTOINCREMENT
      username TEXT NOT NULL
      password TEXT NOT NULL
    )
  `);

  fastify.decorate('db', db);

  fastify.addHook('onClose', async () => {
    db.close();
  });
};

export default fp(databasePlugin, {
  name: 'database'
});
