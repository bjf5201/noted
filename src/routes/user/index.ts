import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { CreateUserSchema, UpdateUserSchema } from 'noted/schemas/user.js';
import { ApiResponse } from '../../lib/api-response.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { usersRepository, passwordManager } = fastify;
  fastify.post(
    '/',
    {
      schema: CreateUserSchema
    },
    async function createUser(request, reply) {
      const { username, email, password } = request.body;

      const isExistingUser = await usersRepository.findByEmail(email);

      if (isExistingUser) {
        ApiResponse.conflict(
          request.id,
          'A user with this information already exists.'
        );
      }

      const hashedPassword = await passwordManager.hash(password);

      const user = await usersRepository.create({
        username,
        email,
        passwordHash: hashedPassword
      });

      const response = ApiResponse.created(user, request.id);

      return reply.code(response.statusCode).send(response.body);
    }
  );
  fastify.patch(
    '/',
    {
      config: {
        rateLimit: {
          max: 3,
          timeWindow: '1 minute'
        }
      },
      schema: UpdateUserSchema
    },
    async function updateUser(request, reply) {
      const { newPassword, currentPassword } = request.body;
      const { email } = request.session.user;

      const user = await usersRepository.findByEmail(email);

      if (!user) {
        return reply.code(401).send({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User does not exist.'
          },
          meta: {
            requestId: request.id
          }
        });
      }

      const isPasswordCorrect = await passwordManager.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordCorrect) {
        return reply.code(401).send({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Incorrect current password.'
          },
          meta: {
            requestId: request.id
          }
        });
      }

      if (newPassword === currentPassword) {
        reply.status(400);
        return {
          error: {
            code: 'BAD REQUEST',
            message: 'New password must not match current password.'
          },
          meta: {
            requestId: request.id
          }
        };
      }

      const hashedPassword = await passwordManager.hash(newPassword);
      await usersRepository.updatePassword(email, hashedPassword);

      reply.status(200);
      return {
        data: 'Password updated successfully.' as const,
        meta: {
          requestId: request.id
        }
      };
    }
  );
};

export default plugin;
