import Database from 'better-sqlite3';

export function createDatabase(filename: string): Database.Database {
  const db = new Database(filename);

  db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL
  );
`);

  return db;
}
