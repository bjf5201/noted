import assert from 'node:assert';
import { describe, it } from 'node:test';
import { buildTest } from 'noted/#/helpers/setup.js';

describe('Helmet plugin', () => {
  it('adds security headers to API responses', async (t) => {
    const app = await buildTest(t);
    const response = await app.inject({
      url: '/'
    });

    assert.strictEqual(response.headers['x-content-type-options'], 'nosniff');
    assert.strictEqual(response.headers['x-frame-options'], 'SAMEORIGIN');
    assert.ok(response.headers['content-security-policy']);
  });
});
