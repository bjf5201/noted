import { describe, it } from 'node:test';
import { buildTest as build } from 'noted/#/helpers/setup.js';
import assert from 'node:assert';

describe('CORS plugin', () => {
  it('should correctly handle CORS preflight requests', async (t) => {
    const app = await build(t);

    const reply = await app.inject({
      method: 'OPTIONS',
      url: '/',
      headers: {
        Origin: 'http://example.com',
        'access-control-request-method': 'GET',
        'access-control-request-headers': 'Content-Type'
      }
    });

    assert.strictEqual(reply.statusCode, 204);
    assert.strictEqual(
      reply.headers['access-control-allow-methods'],
      'GET, POST, PUT, DELETE'
    );
  });
});
