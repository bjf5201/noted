import { describe, it } from 'node:test';
import assert from 'node:assert';
import { API_BASE_URL } from 'noted/#/helpers/endpoints.js';
import { buildEndpointTest } from 'noted/#/helpers/setup.endpoints.js';

describe.skip('API root (GET /api/v1)', () => {
  it('returns an error message when user is not logged in', async (t) => {
    const app = await buildEndpointTest(t);

    const response = await app.inject({
      url: API_BASE_URL
    });

    assert.deepStrictEqual(JSON.parse(response.payload), {
      statusCode: 404,
      error: 'Not Found',
      message: 'You must be authenticated to access this route.'
    });
  });

  it('can access the API root when user is properly logged in', async (t) => {
    const app = await buildEndpointTest(t);

    const response = await app.injectWithLogin('basic@example.com', {
      url: API_BASE_URL
    });

    assert.equal(response.statusCode, 200);
    assert.ok(JSON.parse(response.payload).message.startsWith('Hello basic!'));
  });
});
