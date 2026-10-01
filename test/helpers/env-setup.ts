import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { TestContext } from 'node:test';
import Fastify from 'fastify';
import env, { autoConfig } from 'noted/plugins/external/env.js';

interface EnvTestOptions {
  confKey?: string;
  data: Record<string, string>;
  dotenv: false | { path: string };
}

export async function buildEnvTest(t: TestContext, options: EnvTestOptions) {
  const app = Fastify();
  t.after(() => app.close());

  await app.register(env, {
    ...autoConfig,
    ...options
  });

  await app.ready();
  return app;
}

export async function createEnvFixture(
  t: TestContext,
  contents: string
): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'noted-env-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));

  const filePath = join(directory, '.env.test');
  await writeFile(filePath, contents);

  return filePath;
}
