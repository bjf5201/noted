import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { CreateUserSchema, UpdateUserSchema } from 'noted/schemas/user.js';

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
        return reply.code(409).send({
          success: false,
          statusCode: reply.statusCode,
          error: 'A user with this email already exists.'
        });
      }

      const hashedPassword = await passwordManager.hash(password);

      const user = await usersRepository.create({
        username,
        email,
        password: hashedPassword
      });

      return reply.code(201).send(user);
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
          success: false,
          statusCode: 401,
          error: 'User does not exist.'
        });
      }

      const isPasswordCorrect = await passwordManager.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordCorrect) {
        return reply.code(401).send({
          success: false,
          statusCode: 401,
          error: 'Incorrect current password.'
        });
      }

      if (newPassword === currentPassword) {
        reply.status(400);
        return {
          success: false,
          statusCode: 400,
          error: 'New password must not match current password.'
        };
      }

      const hashedPassword = await passwordManager.hash(newPassword);
      await usersRepository.updatePassword(email, hashedPassword);

      reply.status(200);
      return {
        success: true,
        statusCode: 200,
        message: 'Password updated successfully!'
      };
    }
  );
};

export default plugin;
