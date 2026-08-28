import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/', async () => {
    return { message: 'Notes API reporting for duty!' };
  });
};

export default plugin;
