import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { eq } from 'drizzle-orm';
import { roles, users, usersRoles } from 'noted/database/schema.js';
import { UserEntity } from './users.schema.js';

type Database = FastifyInstance['db'];
type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];
type DatabaseExecutor = Database | Transaction;

declare module 'fastify' {
  interface FastifyInstance {
    usersRepository: ReturnType<typeof createUsersRepository>;
  }
}

export function createUsersRepository(fastify: FastifyInstance) {
  const db = fastify.db;

  return {
    async findByUsername(username: string, executor: DatabaseExecutor = db) {
      const [user] = await executor
        .select({
          id: users.id,
          username: users.username,
          password: users.passwordHash
        })
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      return user as (UserEntity & { password: string }) | undefined;
    },
    async findByEmail(email: string, executor: DatabaseExecutor = db) {
      const [user] = await executor
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          password: users.passwordHash
        })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      return user as (UserEntity & { password: string }) | undefined;
    },

    async create(user: {
      username: string;
      email: string;
      passwordHash: string;
    }) {
      return db.transaction(async (tx) => {
        const [createdUser] = await tx.insert(users).values(user).returning({
          id: users.id,
          username: users.username,
          email: users.email,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt
        });

        if (!createdUser) {
          throw new Error('Failed to create user.');
        }

        // Create the shared default role if it doesn't already exist
        await tx.insert(roles).values({ name: 'basic' }).onConflictDoNothing();

        const [basicRole] = await tx
          .select({ id: roles.id })
          .from(roles)
          .where(eq(roles.name, 'basic'))
          .limit(1);

        if (!basicRole) {
          throw new Error('Failed to find the basic role.');
        }

        await tx.insert(usersRoles).values({
          userId: createdUser.id,
          roleId: basicRole.id
        });

        const assignedRoles = await tx
          .select({ name: roles.name })
          .from(roles)
          .innerJoin(usersRoles, eq(usersRoles.roleId, roles.id))
          .where(eq(usersRoles.userId, createdUser.id));

        return {
          ...createdUser,
          roles: assignedRoles.map(({ name }) => name),
          createdAt: createdUser.createdAt.toISOString(),
          updatedAt: createdUser.updatedAt.toISOString()
        };
      });
    },

    async updatePassword(
      email: string,
      hashedPassword: string,
      executor: DatabaseExecutor = db
    ) {
      return executor
        .update(users)
        .set({ passwordHash: hashedPassword })
        .where(eq(users.email, email));
    },

    async findUserRolesByEmail(email: string, executor: DatabaseExecutor = db) {
      const result = await executor
        .select({ name: roles.name })
        .from(roles)
        .innerJoin(usersRoles, eq(usersRoles.roleId, roles.id))
        .innerJoin(users, eq(usersRoles.userId, users.id))
        .where(eq(users.email, email));

      return result;
    }
  };
}

const usersRepoPlugin: FastifyPluginAsync = async (fastify) => {
  const repo = createUsersRepository(fastify);
  fastify.decorate('usersRepository', repo);
};

export default fp(usersRepoPlugin, {
  name: 'users-repository',
  dependencies: ['drizzle']
});
