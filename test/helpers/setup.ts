import type { TestContext } from 'node:test';
import Fastify from 'fastify';
import fp from 'fastify-plugin';
import { webApp } from 'noted/app.js';

export async function buildTest(t?: TestContext) {
  const app = Fastify();

  app.register(fp(webApp), { skipOverride: true });

  await app.ready();

  if (t) {
    t.after(() => app.close());
  }

  return app;
}
