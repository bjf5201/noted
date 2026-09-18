import { describe, it } from 'node:test';
import assert from 'node:assert';
import { buildTest } from 'noted/#/helpers/setup.js';

describe('App', () => {
  it('GET / returns API welcome message', async (t) => {
    const app = await buildTest(t);
    const response = await app.inject({
      url: '/' //TODO: Change to `url: '/api/v1'
    });

    assert.deepStrictEqual(JSON.parse(response.payload), {
      message: 'Noted API reporting for duty!'
    });

    assert.strictEqual(response.statusCode, 200);
  });
});
