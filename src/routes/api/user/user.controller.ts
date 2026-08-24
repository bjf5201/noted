import { type FastifyReply, type FastifyRequest } from 'fastify';
import { type TUsersRepository } from './user.repository.js';

export function createUsersController(repo: TUsersRepository) {
  return {
    async create(request: FastifyRequest, response: FastifyReply) {
      const body = request.body as {
        username: string;
        password: string;
      };

      const user = repo.create(body.username, body.password);

      return response.code(201).send(user);
    },
  };
}

export type TUsersController = ReturnType<typeof createUsersController>;
