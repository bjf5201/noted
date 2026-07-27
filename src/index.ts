import Fastify from 'fastify';
import db from './database.js';

const app = Fastify({
  logger: true,
});

app.get('/', async () => {
  const result = db.prepare('SELECT COUNT(*) AS count FROM notes').get() as { count: number };

  return {
    message: 'Database connected!',
    notes: result.count,
  };
});

await app.listen({ port: 3000, host: '0.0.0.0' });
