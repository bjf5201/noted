import { type FastifyPluginAsync } from 'fastify';

import { createUsersController } from 'noted/user/user.controller.js';
import { type TUsersRepository } from 'noted/user/user.repository.js';
import { createUserSchema } from 'noted/user/user.schema.js';

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
