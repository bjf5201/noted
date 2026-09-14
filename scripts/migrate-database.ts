import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import path from 'node:path';

async function doMigration(): Promise<void> {
  const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE
  });

  try {
    const db = drizzle(pool);
    const migrationsFolder = path.join(import.meta.dirname, '../database/migrations');

    console.log('Running migrations...');
    await migrate(db, { migrationsFolder });
    console.log('Migration completed!');
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

doMigration();
