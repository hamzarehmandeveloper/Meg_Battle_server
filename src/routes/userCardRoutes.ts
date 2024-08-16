import { FastifyInstance } from 'fastify';
import { purchaseCard } from '../controllers/userCardController';

export default async function userCardRoutes(
  fastify: FastifyInstance,
  options: any,
  done: () => void
) {
  fastify.post('/purchase-card/:id', purchaseCard);
}
