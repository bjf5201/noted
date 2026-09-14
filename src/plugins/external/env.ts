import env from '@fastify/env';

declare module 'fastify' {
  export interface FastifyInstance {
    config: {
      FASTIFY_PORT: number;
      DB_HOST: string;
      DB_PORT: string;
      DB_USER: string;
      DB_PASSWORD: string;
      DB_DATABASE: string;
      COOKIE_SECRET: string;
      COOKIE_NAME: string;
      COOKIE_SECURED: boolean;
      RATE_LIMIT_MAX: string;
    };
  }
}

const schema = {
  type: 'object',
  required: [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_DATABASE',
    'COOKIE_SECRET',
    'COOKIE_NAME',
    'COOKIE_SECURED'
  ],
  properties: {
    // Database
    MYSQL_HOST: {
      type: 'string',
      default: 'localhost'
    },
    MYSQL_PORT: {
      type: 'number',
      default: 3306
    },
    MYSQL_USER: {
      type: 'string'
    },
    MYSQL_PASSWORD: {
      type: 'string'
    },
    MYSQL_DATABASE: {
      type: 'string'
    },

    // Security
    COOKIE_SECRET: {
      type: 'string'
    },
    COOKIE_NAME: {
      type: 'string'
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

  // Needed to read proper .env file -- TODO: find better way to do this
  dotenv: {
    path: `${import.meta.dirname}/../../../.env.development`,
    debug: true
  },

  // Source for configuration data
  // Optional, default: process.env
  data: process.env
};

/**
 * This plugin helps check environment variables
 *
 * @see {@link https://github.com/fastify/fastify-env}
 */

export default env;
