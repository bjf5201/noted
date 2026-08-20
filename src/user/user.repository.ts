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

      return db
        .prepare(`SELECT userId, username FROM users WHERE userId = ?`)
        .get(result.lastInsertRowid);
    },
  };
}

export type TUsersRepository = ReturnType<typeof createUsersRepository>;
