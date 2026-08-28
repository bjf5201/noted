/**
 * Runs server as standalone executable
 * */

import Fastify from 'fastify';
import fp from 'fastify-plugin';
import closeWithGrace from 'close-with-grace';
import { webApp } from 'noted/app.js';

function getLoggerOpts() {
  // Only if running in interactive terminal
  if (process.stdout.isTTY) {
    return {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname'
        }
      }
    };
  }

  return { level: process.env.LOG_LEVEL ?? 'silent' };
}

const app = Fastify({
  logger: getLoggerOpts(),
  connectionTimeout: 120_000,
  requestTimeout: 60_000,
  keepAliveTimeout: 10_000,
  http: {
    headersTimeout: 15_000
  },
  ajv: {
    customOptions: {
      coerceTypes: 'array',
      removeAdditional: 'all'
    }
  }
});

async function init() {
  app.register(fp(webApp));

  closeWithGrace({ delay: 500 }, async ({ err }) => {
    if (err != null) {
      app.log.error(err);
    }

    await app.close();
  });

  await app.ready();

  try {
    await app.listen({ host: '0.0.0.0', port: 3000 });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

init();
