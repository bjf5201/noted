import { Client } from 'pg';

if (Number(process.env.CAN_DROP_DATABASE) !== 1) {
  throw new Error(
    "You can't drop the database. Set `CAN_DROP_DATABASE=1` environment variable to allow this operation."
  );
}

async function dropDatabase() {
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
    await dropDB(connection);
    console.log(`Database ${process.env.POSTGRES_DATABASE} has been dropped successfully.`);
  } catch (error) {
    console.error('Error dropping database:', error);
  } finally {
    await connection.end();
  }
}

async function dropDB(connection: Client) {
  await connection.query(`DROP DATABASE IF EXISTS "${process.env.POSTGRES_DATABASE}"`);
  console.log(`Database ${process.env.POSTGRES_DATABASE} dropped.`);
}

dropDatabase();
