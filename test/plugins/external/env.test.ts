import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  buildEnvTest as build,
  createEnvFixture,
  loadPluginConfig
} from 'noted/#/fixtures/env-fixture.ts';

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

  it('loads configuration from a Node env file before plugin registration', async (t) => {
    const envFile = await createEnvFixture(
      t,
      'POSTGRES_DATABASE=fixture-database\nCOOKIE_SECRET=fixture-cookie-secret\n'
    );

    const config = loadPluginConfig([envFile]);

    assert.equal(config.POSTGRES_DATABASE, 'fixture-database');
  });

  it('prefers later Node env files over earlier files', async (t) => {
    const earlierFile = await createEnvFixture(
      t,
      'POSTGRES_DATABASE=earlier-database\nCOOKIE_SECRET=fixture-cookie-secret\n'
    );
    const laterFile = await createEnvFixture(
      t,
      'POSTGRES_DATABASE=later-database\n'
    );

    const config = loadPluginConfig([earlierFile, laterFile]);

    assert.equal(config.POSTGRES_DATABASE, 'later-database');
  });

  it('prefers pre-existing environment values over Node env files', async (t) => {
    const envFile = await createEnvFixture(
      t,
      'POSTGRES_DATABASE=file-database\nCOOKIE_SECRET=fixture-cookie-secret\n'
    );

    const config = loadPluginConfig([envFile], {
      POSTGRES_DATABASE: 'process-database'
    });

    assert.equal(config.POSTGRES_DATABASE, 'process-database');
  });

  it.skip('UPLOAD_DIRNAME should not contain ".."'); // add this test when file-manager is implemented
});
