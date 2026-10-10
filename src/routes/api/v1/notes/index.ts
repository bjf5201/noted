import type { FastifyPluginAsync } from 'fastify';
import { eq } from 'drizzle-orm';
import { notes } from 'noted/database/schema.ts';

const notesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request) => {
    const userId = request.session.user.id;

    return fastify.db
      .select({
        id: notes.id,
        title: notes.title,
        content: notes.content
      })
      .from(notes)
      .where(eq(notes.userId, userId));
  });
};

export default notesRoutes;
