import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { eq } from 'drizzle-orm';
import { roles, userRoles, users } from 'noted/database/schema.js';
import { Auth } from 'noted/schemas/auth.js';

declare module 'fastify' {
  interface FastifyInstance {
    usersRepository: ReturnType<typeof createUsersRepository>;
  }
}

export function createUsersRepository(fastify: FastifyInstance) {
  const db = fastify.db;

  return {
    async findByEmail(email: string) {
      const user = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          password: users.password
        })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      return user[0] as (Auth & { password: string }) | undefined;
    },

    async updatePassword(email: string, hashedPassword: string) {
      return db.update(users).set({ password: hashedPassword }).where(eq(users.email, email));
    },

    async findUserRolesByEmail(email: string) {
      const result = await db
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
