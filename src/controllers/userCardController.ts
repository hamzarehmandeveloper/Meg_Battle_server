import { FastifyReply, FastifyRequest } from 'fastify';
import UserCard from '../models/userCardModel';
import { User } from '../models/userModel';
import { calculateProfitPerHour } from '../helper';

export const purchaseCard = async (
  req: FastifyRequest<{
    params: { id: string };
    Body: { userId: number; tab: string; cardName: string; cardCost: number };
  }>,
  reply: FastifyReply
) => {
  const { userId, tab, cardName, cardCost } = req.body;

  try {
    const user = await User.findOne({ id: userId });

    if (!user) {
      return reply.status(404).send({ message: 'User not found' });
    }

    let userCard = await UserCard.findOne({
      userId: user.id,
      tab,
      name: cardName,
    });

    if (!userCard) {
      userCard = new UserCard({
        userId: user.id,
        tab,
        name: cardName,
        level: 1,
        cost: cardCost,
        profitPerHour: calculateProfitPerHour(cardCost),
      });
    } else {
      userCard.level += 1;
      userCard.cost = cardCost;
      userCard.profitPerHour = calculateProfitPerHour(cardCost);
    }

    await userCard.save();

    user.coins = (user.coins ?? 0) - cardCost;

    await user.save();

    return reply
      .status(200)
      .send({ message: 'Card purchased successfully', card: userCard });
  } catch (error: any) {
    return reply
      .status(500)
      .send({ message: 'Failed to purchase card', error: error.message });
  }
};

export const getUserCards = async (
  request: FastifyRequest<{
    Querystring: { userId: string };
  }>,
  reply: FastifyReply
) => {
  try {
    const { userId } = request.query;

    if (!userId) {
      return reply.status(400).send({ error: 'userId is required' });
    }

    const userCards = await UserCard.find({ userId }).lean();

    if (!userCards || userCards.length === 0) {
      return reply.status(404).send({ error: 'No cards found for this user' });
    }

    reply.status(200).send(userCards);
  } catch (error) {
    console.error('Error fetching user cards:', error);
    reply.status(500).send({ error: 'Internal Server Error' });
  }
};
