import cors, { FastifyCorsOptions } from '@fastify/cors';

export const autoConfig: FastifyCorsOptions = {
  methods: ['GET', 'POST', 'PUT', 'DELETE']
};

/**
 * This plugin enables use of CORS.
 *
 * @see {@link https://github.com/fastify/fastify-cors}
 */
export default cors;
