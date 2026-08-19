import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { type TUsersRepository } from 'noted/user/user.repository.js';

interface TCreateUserBody {
  username: string;
  password: string;
}

export function userRoutes(repo: TUsersRepository): FastifyPluginAsync {
  return async function (app) {
    app.post('/create', async (request: FastifyRequest, reply: FastifyReply) => {
      const { username, password } = request.body as TCreateUserBody;

      const user = repo.create(username, password);

      return reply.code(201).send(user);
    });
  };
}
