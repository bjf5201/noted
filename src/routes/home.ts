import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/', async () => {
    return { message: 'Noted API reporting for duty!' };
  });
};

export default plugin;
