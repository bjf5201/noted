import { TestContext } from 'node:test';
import {
  buildTest,
  createNote as createNoteRecord,
  createUser,
  deleteNoteById,
  deleteUserByEmail
} from 'noted/#/helpers/setup.js';

export async function buildNotesTest(t: TestContext) {
  const app = await buildTest();
  const username = `notes-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const email = `${username}@example.com`;
  const createNoteIds = new Set<number>();

  try {
    const user = await createUser(app, {
      email,
      username,
      password: 'Password123$'
    });

    t.after(async () => {
      try {
        await Promise.all(
          [...createNoteIds].map((noteId) => deleteNoteById(app, noteId))
        );
        await deleteUserByEmail(app, email);
      } finally {
        await app.close();
      }
    });

    return {
      app,
      user,
      createNote: async (payload: { title: string; content: string }) => {
        const note = await createNoteRecord(app, {
          ...payload,
          userId: user.id
        });

        createNoteIds.add(note.id);
        return note;
      }
    };
  } catch (error) {
    await app.close();
    throw error;
  }
}
