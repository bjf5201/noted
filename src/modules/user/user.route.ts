import { type FastifyPluginAsync } from 'fastify';

import { createUsersController } from './user.controller.js';
import { type TUsersRepository } from './user.repository.js';
import { createUserSchema } from './user.schema.js';

export default function usersRoutes(repo: TUsersRepository): FastifyPluginAsync {
  const controller = createUsersController(repo);

  return async function (app) {
    app.post(
      '/create',
      {
        schema: createUserSchema,
      },
      controller.create
    );
  };
}
