import { fastifySession } from '@fastify/session';
import { fastifyCookie } from '@fastify/cookie';
import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import type { UserEntity } from 'noted/schemas/user.js';

declare module 'fastify' {
  interface Session {
    user: UserEntity;
  }
}

const sessionPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyCookie, {});

  await new Promise<void>((resolve, reject) => {
    fastifySession(
      fastify,
      {
        secret: fastify.config.COOKIE_SECRET,
        cookieName: fastify.config.COOKIE_NAME,
        cookie: {
          secure: fastify.config.COOKIE_SECURED,
          httpOnly: true,
          maxAge: 1800
        }
      },
      (error) => {
        if (error) reject(error);
        else resolve();
      }
    );
  });
};

/**
 * This plugin enables the use of session.
 *
 * @see {@link https://github.com/fastify/session}
 */

export default fp(sessionPlugin, {
  name: 'session'
});
