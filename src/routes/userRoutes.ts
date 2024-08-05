import { FastifyInstance } from 'fastify';
import {
  addCoinsToUser,
  getUserReferrals,
  registerUser,
} from '../controllers/userController';
import {
  addCoinsSchema,
  getUserReferralsSchema,
  registerUserSchema,
} from '../schemas/userSchema';

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

  fastify.get(
    '/referrals/:userId',
    {
      schema: getUserReferralsSchema,
      onRequest: (request, reply, done) => {
        reply.header('Access-Control-Allow-Origin', '*');
        done();
      },
    },
    getUserReferrals
  );

  done();
}
