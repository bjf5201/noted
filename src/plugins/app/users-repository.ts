import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    usersRepository: ReturnType<typeof createUsersRepository>;
  }
}

export function createUsersRepository(fastify: FastifyInstance) {
  const db = fastify.db;

  return {
    /**
     * @description Creates single user
     */
    create(username: string, password: string) {
      const result = db
        .prepare(`INSERT INTO users (username, password) VALUES (?, ?)`)
        .run(username, password);

      return db
        .prepare(`SELECT userId, username FROM users WHERE userId = ?`)
        .get(result.lastInsertRowid);
    },

    /**
     * @description Gets a user by id
     */
    findById(userId: number) {
      return db.prepare(`SELECT userId, username FROM users where userId = ?`).get(userId);
    }
  };
}

export default fp(
  async function (fastify: FastifyInstance) {
    const repo = createUsersRepository(fastify);
    fastify.decorate('usersRepository', repo);
  },
  {
    name: 'users-repository',
    dependencies: ['database']
  }
);
