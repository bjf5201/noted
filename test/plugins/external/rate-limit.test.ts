import { describe, it } from 'node:test';
import { buildTest as build } from 'noted/#/helpers/setup.js';
import assert from 'node:assert';

describe('Rate-limit plugin', () => {
  it('should be rate limited', async (t) => {
    const app = await build(t);

    for (let i = 0; i < 4; i++) {
      const reply = await app.inject({
        method: 'GET',
        url: '/'
      });

      assert.strictEqual(reply.statusCode, 200);
    }

    const reply = await app.inject({
      method: 'GET',
      url: '/'
    });

    assert.strictEqual(reply.statusCode, 429);
  });
});
