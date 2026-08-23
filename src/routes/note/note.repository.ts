import Database from 'better-sqlite3';

export function createNotesRepository(db: Database.Database) {
  return {
    /**
     * @description Returns list of all existing notes with the newest notes at the beginning
     */
    listAll() {
      return db
        .prepare(
          `SELECT noteId, title, content
            FROM notes
            ORDER BY noteId DESC`
        )
        .all();
    },

    /**
     * @description Gets a note by its id
     */
    listById(noteId: number) {
      return db
        .prepare(
          `SELECT noteId, title, content
          FROM notes
          WHERE noteId = ?`
        )
        .get(noteId);
    },

    /**
     * @description Creates a single note
     */
    create(title: string, content: string) {
      const result = db
        .prepare(`INSERT INTO notes (title, content) VALUES (?, ?)`)
        .run(title, content);

      return db
        .prepare(`SELECT noteId, title, content FROM notes WHERE noteId = ?`)
        .get(result.lastInsertRowid);
    },
  };
}

export type TNoteRepository = ReturnType<typeof createNotesRepository>;
