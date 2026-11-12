import fp from 'fastify-plugin';
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

declare module 'fastify' {
  export interface FastifyRequest {
    verifyAccess: typeof verifyAccess;
    isModerator: typeof isModerator;
    isAdmin: typeof isAdmin;
  }
}

function verifyAccess(this: FastifyRequest, reply: FastifyReply, role: string) {
  if (!this.session.user.roles.includes(role)) {
    reply.status(403).send('You are not authorized to access this resource.');
  }
}

async function isModerator(this: FastifyRequest, reply: FastifyReply) {
  this.verifyAccess(reply, 'moderator');
}

async function isAdmin(this: FastifyRequest, reply: FastifyReply) {
  this.verifyAccess(reply, 'admin');
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest('verifyAccess', verifyAccess);
  fastify.decorateRequest('isModerator', isModerator);
  fastify.decorateRequest('isAdmin', isAdmin);
};

/**
 * This plugin allows for the authorization of specific roles
 *
 */
export default fp(authPlugin, {
  name: 'authorization'
});
