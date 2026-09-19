import { describe, it } from 'node:test';
import assert from 'node:assert';
import { buildTest, expectValidationError } from 'noted/#/helpers/setup.js';

const ENDPOINT = '/api/v1/auth/login';

describe('Auth API', () => {
  describe('POST /api/v1/auth/login', () => {
    it('Unwinds and partial work if password checking fails for reason other than incorrect password', async (t) => {
      const app = await buildTest(t);

      const { mock: mockCompare } = t.mock.method(
        app.passwordManager,
        'compare'
      );
      mockCompare.mockImplementationOnce((_value: string, _hash: string) => {
        throw new Error('I blew up.');
      });

      const { mock: mockLogError } = t.mock.method(app.log, 'error');

      const res = await app.inject({
        method: 'POST',
        url: `${ENDPOINT}`,
        payload: {
          email: 'basic@example.com',
          password: 'Password123$'
        }
      });

      assert.strictEqual(mockCompare.callCount(), 1);

      const arg = mockLogError.calls[0].arguments[0] as unknown as {
        err: Error;
      };

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(arg.err.message, 'I blew up.');
    });

    it('returns validation error if credentials are invalid', async (t) => {
      const app = await buildTest(t);

      const invalidCredentials = {
        email: '',
        password: 'Password123$'
      };

      const res = await app.injectWithLogin('basic@example.com', {
        method: 'POST',
        url: `${ENDPOINT}`,
        payload: invalidCredentials
      });

      expectValidationError(
        res,
        'body/email must NOT have fewer than 1 characters'
      );
    });
  });
});
