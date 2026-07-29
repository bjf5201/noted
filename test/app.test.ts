import { describe, expect, it } from 'vitest';
import { useTestApp } from 'noted/#/utils/context.js';

describe('GET /', () => {
  const app = useTestApp();

  it('returns database status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/',
    });

    expect(response.statusCode).toBe(200);

    expect(response.json()).toEqual({
      message: 'Database connected!',
      notes: expect.any(Number),
    });
  });
});
