import Database from 'better-sqlite3';

export function createNotesRepository(db: Database.Database) {
  return {
    /**
     * @description Returns list of all existing notes with the newest notes at the beginning
     */
    listAll() {
      return db
        .prepare(
          `SELECT id, title, content
            FROM notes
            ORDER BY id DESC`
        )
        .all();
    },

    /**
     * @description Gets a note by its id
     */
    listById(id: number) {
      return db
        .prepare(
          `SELECT id, title, content
          FROM notes
          WHERE id = ?`
        )
        .get(id);
    },

    /**
     * @description Creates a single note
     */
    create(title: string, content: string) {
      const result = db
        .prepare(`INSERT INTO notes (title, content) VALUES (?, ?)`)
        .run(title, content);

      return db
        .prepare(`SELECT id, title, content FROM notes WHERE id = ?`)
        .get(result.lastInsertRowid);
    },
  };
}

export type TNoteRepository = ReturnType<typeof createNotesRepository>;
