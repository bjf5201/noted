import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { LoginSchema } from 'noted/schemas/auth.js';
import { ApiResponse } from 'noted/lib/api-response.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { usersRepository, passwordManager } = fastify;
  fastify.post(
    '/auth/session',
    {
      schema: LoginSchema
    },
    async function (request, reply) {
      const { username, password } = request.body;

      const response = await fastify.db.transaction(async (trx) => {
        const user = await usersRepository.findByUsername(username, trx);

        if (!user) {
          return ApiResponse.unauthorized(
            request.id,
            'Invalid email or password.'
          );
        }

        const isPasswordValid = await passwordManager.compare(
          password,
          user.password
        );

        if (!isPasswordValid) {
          return ApiResponse.unauthorized(
            request.id,
            'Invalid email or password.'
          );
        }

        const roles = await usersRepository.findUserRolesByEmail(
          user.email,
          trx
        );

        const userRoles = roles.map((role) => role.name);

        request.session.user = {
          id: user.id,
          email: user.email,
          username: user.username,
          roles: userRoles,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };

        await request.session.save();

        return ApiResponse.ok(
          {
            user: {
              id: user.id,
              email: user.email,
              username: user.username,
              roles: userRoles,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt
            }
          },
          request.id
        );
      });

      return reply.status(response.statusCode).send(response.body);
    }
  );
};

export default plugin;
