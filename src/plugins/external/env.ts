import fp from 'fastify-plugin';
import env from '@fastify/env';

declare module 'fastify' {
  export interface FastifyInstance {
    config: {
      FASTIFY_HOST: string;
      FASTIFY_PORT: number;
      POSTGRES_HOST: string;
      POSTGRES_PORT: string;
      POSTGRES_USER: string;
      POSTGRES_PASSWORD: string;
      POSTGRES_DATABASE: string;
      COOKIE_SECRET: string;
      COOKIE_NAME: string;
      COOKIE_SECURED: boolean;
      RATE_LIMIT_MAX: string;
      [key: string]: unknown;
    };
  }
}

const schema = {
  type: 'object',
  required: [
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DATABASE',
    'COOKIE_SECRET',
    'COOKIE_NAME',
    'COOKIE_SECURED'
  ],
  properties: {
    // Database
    POSTGRES_HOST: {
      type: 'string',
      default: 'postgres'
    },
    POSTGRES_PORT: {
      type: 'number',
      default: 3306
    },
    POSTGRES_USER: {
      type: 'string',
      default: 'postgres'
    },
    POSTGRES_PASSWORD: {
      type: 'string',
      default: 'postgres'
    },
    POSTGRES_DATABASE: {
      type: 'string'
    },

    // Security
    COOKIE_SECRET: {
      type: 'string'
    },
    COOKIE_NAME: {
      type: 'string',
      default: 'session_id'
    },
    COOKIE_SECURED: {
      type: 'boolean',
      default: true
    },
    RATE_LIMIT_MAX: {
      type: 'number',
      default: 100 // Put it to 4 in your .env file for tests
    }
  }
};

export const autoConfig = {
  // Decorate Fastify instance with 'config' key
  // Optional, default: 'config'
  confKey: 'config',

  // Schema to validate
  // TODO: Use typebox here? Or just leave it?
  schema,

  // Needed to read .env file in root folder
  dotenv: true,

  // Source for configuration data
  // Optional, default: process.env
  data: process.env
};

/**
 * This plugin helps check environment variables
 *
 * @see {@link https://github.com/fastify/fastify-env}
 */

export default fp(env, {
  name: 'env'
});
