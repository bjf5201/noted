import Database from 'better-sqlite3';
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

interface TCreateUserBody {
  username: string;
  password: string;
}

export function userRoutes(db: Database.Database): FastifyPluginAsync {
  return async function (app) {
    app.post('/create', async (request: FastifyRequest, reply: FastifyReply) => {
      const { username, password } = request.body as TCreateUserBody;

      const result = db
        .prepare('INSERT INTO users (username, password) VALUES (?, ?)')
        .run(username, password);

      return reply.code(201).send({
        id: Number(result.lastInsertRowid),
        username,
      });
    });
  };
}
