import { FastifyInstance } from 'fastify';
import { getUserCards, purchaseCard } from '../controllers/userCardController';

export default async function userCardRoutes(
  fastify: FastifyInstance,
  options: any,
  done: () => void
) {
  fastify.post('/purchase-card/:id', purchaseCard);
  fastify.get('/cards', getUserCards);
}
