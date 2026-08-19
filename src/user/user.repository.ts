import type Database from 'better-sqlite3';

export interface TUsersRepository {
  create: (
    username: string,
    password: string
  ) => {
    id: number;
    username: string;
  };
}

export function createUsersRepository(db: Database.Database): TUsersRepository {
  return {
    create(username, password) {
      const result = db
        .prepare('INSERT INTO users (username, password) VALUES (?, ?)')
        .run(username, password);

      return {
        id: Number(result.lastInsertRowid),
        username,
      };
    },
  };
}
