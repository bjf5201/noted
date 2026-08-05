import { FastifyInstance } from 'fastify';

interface TCreateUserBody {
  username: string;
  password: string;
}

export async function userRoutes(app: FastifyInstance): Promise<void> {
  app.post('/create', async (request, reply) => {
    const { username } = request.body as TCreateUserBody;

    return reply.code(201).send({
      id: 1,
      username,
    });
  });
}
