import fastify from 'fastify';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import { connectDB } from './database/db';
import cors from '@fastify/cors';

dotenv.config();

const server = fastify({ logger: true });

connectDB();

server.register(cors, {
  origin: '*',
});

server.get('/', async (request, reply) => {
  return { hello: 'world' };
});

server.register(userRoutes, { prefix: '/api/users' });

const start = async () => {
  try {
    await server.listen({ port: 3001, host: '0.0.0.0' });
    const address = server.server.address();
    server.log.info(`Server is running at http://localhost:${address}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
