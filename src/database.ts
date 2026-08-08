import Database from 'better-sqlite3';

export function createDatabase(filename: string): Database.Database {
  const db = new Database(filename);

  db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    noteId INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    userId INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL
  );
`);

  return db;
}
