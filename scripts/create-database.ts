import { Client } from 'pg';

if (Number(process.env.CAN_CREATE_DATABASE) !== 1) {
  throw new Error(
    "You can't create the database. Set `CAN_CREATE_DATABASE=1` environment variable to allow this operation."
  );
}

async function createDatabase() {
  // Connect to default postgres database
  const connection = new Client({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: 'postgres' // Connect to postgres system database
  });

  try {
    await connection.connect();
    await createDB(connection);
    console.log(`Database ${process.env.POSTGRES_DATABASE} has been created successfully.`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error('An unexpected error occurred:', error);
    }
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

async function createDB(connection: Client) {
  const result = await connection.query('SELECT 1 FROM pg_database WHERE datname = $1', [
    process.env.POSTGRES_DATABASE
  ]);

  if (result.rowCount !== 0) {
    throw new Error(`Database "${process.env.POSTGRES_DATABASE}" already exists.`);
  }

  await connection.query(`CREATE DATABASE "${process.env.POSTGRES_DATABASE}"`);

  console.log(`Database ${process.env.POSTGRES_DATABASE} created or already exists.`);
}

createDatabase();
