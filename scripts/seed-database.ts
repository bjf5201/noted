import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import { roles, userRoles, users } from 'noted/database/schema.js';
import { scryptHash } from 'noted/plugins/app/password-manager.js';

if (Number(process.env.CAN_SEED_DATABASE) !== 1) {
  throw new Error(
    "You can't seed the database. Set `CAN_SEED_DATABASE=1` environment variable to allow this operation."
  );
}

async function seed() {
  const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE
  });

  try {
    const db = drizzle(pool);
    await truncateTables(db);
    await seedUsers(db);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function truncateTables(db: ReturnType<typeof drizzle>) {
  try {
    // disable foreign key checks
    await db.execute(sql`SET session_replication_role = 'replica'`);

    // Truncate all tables
    await db.execute(sql`TRUNCATE TABLE ${sql.identifier('user_roles')} CASCADE`);
    await db.execute(sql`TRUNCATE TABLE ${sql.identifier('users')} CASCADE`);
    await db.execute(sql`TRUNCATE TABLE ${sql.identifier('roles')} CASCADE`);

    // Re-enable foreign key checks
    await db.execute(sql`SET session_replication_role = 'origin'`);

    console.log('All tables have been truncated successfully.');
  } catch (error) {
    console.error('Error truncating tables:', error);
    throw error;
  }
}

async function seedUsers(db: ReturnType<typeof drizzle>) {
  const seedUsers = [
    { username: 'basic', email: 'basic@example.com' },
    { username: 'moderator', email: 'moderator@example.com' },
    { username: 'admin', email: 'admin@example.com' }
  ];

  const hash = await scryptHash('Password123$');

  // The goal here is to create a role hierarchy
  // E.g. an admin should have all the roles, etc
  const rolesAccumulator: number[] = [];

  for (const seedUser of seedUsers) {
    // Insert user
    const [insertedUser] = await db
      .insert(users)
      .values({
        username: seedUser.username,
        email: seedUser.email,
        password: hash
      })
      .returning({ id: users.id });

    const userId = insertedUser.id;

    // Insert role
    const [insertedRole] = await db
      .insert(roles)
      .values({ name: seedUser.username })
      .returning({ id: roles.id });

    const newRoleId = insertedRole.id;
    rolesAccumulator.push(newRoleId);

    // Associate user with all accumulated roles
    for (const roleId of rolesAccumulator) {
      await db.insert(userRoles).values({
        userId,
        roleId
      });
    }
  }

  console.log('Users have been seeded successfully.');
}

seed();
