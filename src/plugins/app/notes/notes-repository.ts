import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { eq } from 'drizzle-orm';
import { notes } from 'noted/database/schema.js';

declare module 'fastify' {
  interface FastifyInstance {
    notesRepository: ReturnType<typeof createNotesRepository>;
  }
}

export function createNotesRepository(fastify: FastifyInstance) {
  const db = fastify.db;

  return {
    findByUserId(userId: number) {
      return db
        .select({
          id: notes.id,
          title: notes.title,
          content: notes.content
        })
        .from(notes)
        .where(eq(notes.userId, userId));
    }
  };
}

const notesRepoPlugin: FastifyPluginAsync = async (fastify) => {
  const repo = createNotesRepository(fastify);
  fastify.decorate('notesRepository', repo);
};

export default fp(notesRepoPlugin, {
  name: 'notes-repository',
  dependencies: ['drizzle']
});
