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
