import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  TCreateUserDto,
  TUpdateUserDto,
  TUserParamsDto,
  createUserSchema,
  deleteUserSchema,
  getAllUsersSchema,
  getUserSchema,
  updateUserSchema
} from 'noted/schemas/user.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify: FastifyInstance) => {
  const { usersRepository } = fastify;
  fastify.post<{ Body: TCreateUserDto }>(
    '/create',
    {
      schema: createUserSchema
    },
    async function (request: FastifyRequest, reply: FastifyReply) {
      const body = request.body as {
        username: string;
        password: string;
      };

      const user = await usersRepository.create(body.username, body.password);
      return reply.code(201).send(user);
    }
  );

  fastify.get<{ Params: TUserParamsDto }>(
    '/users/:userId',
    {
      schema: getUserSchema
    },
    async (request: FastifyRequest<{ Params: TUserParamsDto }>, reply: FastifyReply) => {
      const user = await fastify.usersRepository.findById(request.params.userId);
    }
  );
};

export default plugin;
