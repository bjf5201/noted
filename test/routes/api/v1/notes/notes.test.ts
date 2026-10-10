import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  buildTest as build
  //  createUser,
  //  expectValidationError
} from 'noted/#/helpers/setup.js';
import { buildNotesTest } from 'noted/#/fixtures/note-fixture.js';
// import { notes } from 'noted/database/schema.js';
import { NOTES_ENDPOINT } from 'noted/#/helpers/endpoints.js';

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

    it('returns the an array of notes when the user has notes', async (t) => {
      const { app, user, createNote } = await buildNotesTest(t);

      const note = await createNote({
        title: 'My first note',
        content: '# Hello\n\nThis is a test note.'
      });

      const reply = await app.injectWithLogin(user.email, {
        method: 'GET',
        url: NOTES_ENDPOINT
      });

      assert.strictEqual(reply.statusCode, 200);

      const payloadContent = JSON.parse(reply.payload);

      assert.ok(Array.isArray(payloadContent));
      assert.strictEqual(payloadContent.length, 1);
      assert.deepStrictEqual(payloadContent, [
        {
          id: note.id,
          title: note.title,
          content: note.content
        }
      ]);
    });

    it('returns an empty array when the user has no notes', async (t) => {
      const { app, user } = await buildNotesTest(t);

      const reply = await app.injectWithLogin(user.email, {
        method: 'GET',
        url: NOTES_ENDPOINT
      });
      assert.strictEqual(reply.statusCode, 200);

      const payloadContent = JSON.parse(reply.payload);
      assert.ok(Array.isArray(payloadContent));
      assert.deepStrictEqual(payloadContent, []);
    });
  });
});
