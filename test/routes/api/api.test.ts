import { describe, it } from 'node:test';
import assert from 'node:assert';
import { buildTest } from 'noted/#/helpers/setup.js';

describe('API root', () => {
  it('returns an error message when user is not logged in', async (t) => {
    const app = await buildTest(t);

    const response = await app.inject({
      url: '/api' // TODO: change to /api/v1
    });

    assert.deepStrictEqual(JSON.parse(response.payload), {
      statusCode: 404,
      error: 'Not Found',
      message: 'You must be authenticated to access this route.'
    });
  });

  it.skip('can access the API root when user is properly logged in', async (t) => {
    const app = await buildTest(t);

    const response = await app.injectWithLogin('basic@example.com', {
      url: '/api'
    });

    assert.equal(response.statusCode, 200);
    assert.ok(JSON.parse(response.payload).message.startsWith('Hello basic!'));
  });
});
