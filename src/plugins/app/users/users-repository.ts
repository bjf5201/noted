import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { eq } from 'drizzle-orm';
import { roles, userRoles, users } from 'noted/database/schema.js';
import { Auth } from 'noted/schemas/auth.js';

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
          password: users.password
        })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      return user as (Auth & { password: string }) | undefined;
    },

    async create(
      user: { username: string; email: string; password: string },
      executor: DatabaseExecutor = db
    ) {
      const [createdUser] = await executor
        .insert(users)
        .values(user)
        .returning({ id: users.id });

      return {
        id: createdUser.id,
        username: user.username,
        email: user.email
      };
    },

    async updatePassword(
      email: string,
      hashedPassword: string,
      executor: DatabaseExecutor = db
    ) {
      return executor
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.email, email));
    },

    async findUserRolesByEmail(email: string, executor: DatabaseExecutor = db) {
      const result = await executor
        .select({ name: roles.name })
        .from(roles)
        .innerJoin(userRoles, eq(userRoles.roleId, roles.id))
        .innerJoin(users, eq(userRoles.userId, users.id))
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
