import { describe, it } from 'node:test';
import assert from 'node:assert';
import { buildTest } from 'noted/#/helpers/setup.js';

describe('Plugin: password-manager', async () => {
  const app = await buildTest();
  const { passwordManager } = app;
  const password = 'testPassword123$';

  it('generates a valid hash', async () => {
    const hash = await passwordManager.hash(password);
    assert.ok(typeof hash === 'string');
    assert.notEqual(hash, passwordManager.hash('notTestPassword123$'));
  });

  it('compares hashes to passwords successfully', async () => {
    const hash = await passwordManager.hash(password);

    const isValid = await passwordManager.compare(password, hash);
    assert.ok(isValid, 'compare should return "true" for correct password');

    const isInvalid = await passwordManager.compare('incorrectPass123$', hash);
    assert.ok(
      !isInvalid,
      'compare should return "false" for incorrect password'
    );
  });

  it('compare function throws an error for malformed hashes', async () => {
    await assert.rejects(() =>
      passwordManager.compare(password, 'malformed_hash')
    );
  });
});
