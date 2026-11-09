import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { eq } from 'drizzle-orm';
import { roles, users, usersRoles } from 'noted/database/schema.js';
import { AuthEntity } from '../../../schemas/auth.js';

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

      return user as (AuthEntity & { password: string }) | undefined;
    },

    async create(
      user: {
        username: string;
        email: string;
        passwordHash: string;
      },
      executor: DatabaseExecutor = db
    ) {
      const [createdUser] = await executor
        .insert(users)
        .values(user)
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt
        });

      return {
        ...createdUser,
        createdAt: createdUser.createdAt.toISOString(),
        updatedAt: createdUser.updatedAt.toISOString()
      };
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
