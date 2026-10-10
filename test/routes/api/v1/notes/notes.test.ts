import { describe, it } from 'node:test';
import assert from 'node:assert';
//import { FastifyInstance } from 'fastify';
import {
  buildTest as build
  //  createUser,
  //  expectValidationError
} from 'noted/#/helpers/setup.js';
// import { notes } from 'noted/database/schema.js';
import { NOTES_ENDPOINT } from '../../../../helpers/endpoints.js';

describe('Noted API', () => {
  describe('GET /api/v1/notes', () => {
    it('returns 404 when user is not logged in', async (t) => {
      const app = await build(t);

      const reply = await app.inject({
        method: 'GET',
        url: `${NOTES_ENDPOINT}`
      });

      assert.strictEqual(reply.statusCode, 404);
      assert.deepStrictEqual(JSON.parse(reply.payload), {
        statusCode: 404,
        error: 'Not Found',
        message: 'You must be authenticated to access this route.'
      });
    });
  });
});
