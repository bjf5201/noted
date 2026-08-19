import type Database from 'better-sqlite3';

export function createUsersRepository(db: Database.Database) {
  return {
    /**
     * @description Creates single user
     */
    create(username: string, password: string) {
      const result = db
        .prepare(`INSERT INTO users (username, password) VALUES (?, ?)`)
        .run(username, password);

      return db.prepare(`SELECT id, username FROM users WHERE id = ?`).get(result.lastInsertRowid);
    },
  };
}

export type TUsersRepository = ReturnType<typeof createUsersRepository>;
