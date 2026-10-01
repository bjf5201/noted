import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  buildEnvTest as build,
  createEnvFixture
} from 'noted/#/helpers/env-setup.js';

describe('Env Plugin', () => {
  // Use a minimal `data` object with the schema's required values and
  // disable dotenv for this specific test to keep it focused on
  // whether the plugin properly adds `fastify.config`
  it('decorates Fastify with a `config` object after registration', async (t) => {
    const app = await build(t, {
      data: {
        POSTGRES_DATABASE: 'env-plugin-test',
        COOKIE_SECRET: 'test-cookie-secret'
      },
      dotenv: false
    });

    assert.equal(typeof app.config, 'object');
    assert.ok(app.config);
    assert.equal(app.config.POSTGRES_DATABASE, 'env-plugin-test');
  });

  it('loads configuration values from the specified env file', async (t) => {
    const envFile = await createEnvFixture(
      t,
      'POSTGRES_DATABASE=fixture-database\n'
    );

    const app = await build(t, {
      data: {
        COOKIE_SECRET: 'test-cookie-secret'
      },
      dotenv: { path: envFile }
    });

    assert.equal(app.config.POSTGRES_DATABASE, 'fixture-database');
  });

  it.skip('UPLOAD_DIRNAME should not contain ".."'); // add this test when file-manager is implemented
});
