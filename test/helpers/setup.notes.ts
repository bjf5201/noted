import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { notes } from 'noted/database/schema.js';

export async function createNote(
  app: FastifyInstance,
  payload: { userId: number; title: string; content: string }
) {
  const [note] = await app.db.insert(notes).values(payload).returning();
  return note;
}

export async function deleteNoteById(app: FastifyInstance, noteId: number) {
  await app.db.delete(notes).where(eq(notes.id, noteId));
}
