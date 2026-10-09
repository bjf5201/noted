import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import assert from 'node:assert';
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

const envPluginPath = fileURLToPath(
  new URL('../../src/plugins/external/env.ts', import.meta.url)
);
const projectRoot = fileURLToPath(new URL('../..', import.meta.url));

export function loadPluginConfig(
  envFiles: string[],
  environment: Record<string, string> = {}
) {
  const child = spawnSync(
    process.execPath,
    [
      ...envFiles.map((path) => `--env-file=${path}`),
      '--import=tsx',
      '--input-type=module',
      '--eval',
      `import Fastify from 'fastify';
       import env, { autoConfig } from ${JSON.stringify(envPluginPath)};
       const app = Fastify();
       await app.register(env, autoConfig);
       await app.ready();
       console.log(JSON.stringify(app.config));
       await app.close();`
    ],
    {
      cwd: projectRoot,
      encoding: 'utf8',
      env: {
        PATH: process.env.PATH ?? '',
        ...environment
      }
    }
  );

  assert.equal(
    child.status,
    0,
    child.error?.message ?? child.stderr ?? 'Child process failed'
  );
  return JSON.parse(child.stdout) as Record<string, unknown>;
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
