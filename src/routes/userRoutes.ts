import { FastifyInstance } from 'fastify';
import { addCoinsToUser, registerUser } from '../controllers/userController';
import { addCoinsSchema, registerUserSchema } from '../schemas/userSchema';

export default function userRoutes(
  fastify: FastifyInstance,
  options: any,
  done: () => void
) {
  fastify.post(
    '/register',
    {
      schema: registerUserSchema,
      onRequest: (request, reply, done) => {
        reply.header('Access-Control-Allow-Origin', '*');
        done();
      },
    },
    registerUser
  );

  fastify.post(
    '/add-coins/:id',
    {
      schema: addCoinsSchema,
      onRequest: (request, reply, done) => {
        reply.header('Access-Control-Allow-Origin', '*');
        done();
      },
    },
    addCoinsToUser
  );
  done();
}
