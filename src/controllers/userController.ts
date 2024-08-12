import { FastifyReply, FastifyRequest } from 'fastify';
import { User } from '../models/userModel';

export async function registerUser(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id, first_name, last_name, language_code } = request.body as {
      id: number;
      first_name: string;
      last_name: string | null;
      language_code: string;
    };

    const existingUser = await User.findOne({ $or: [{ id }] });
    if (existingUser) {
      return reply
        .code(201)
        .send({ message: 'User Found', User: existingUser });
    }

    const newUser = new User({
      id,
      first_name,
      last_name,
      language_code,
    });

    await newUser.save();

    return reply
      .code(201)
      .send({ message: 'User registered successfully', User: newUser });
  } catch (error) {
    reply.code(500).send({ message: 'Error registering user', error });
  }
}

export async function addCoinsToUser(
  request: FastifyRequest<{ Params: { id: number }; Body: { coins: number } }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const { coins } = request.body;

    console.log(id);
    console.log(coins);

    const user = await User.findOne({ $or: [{ id }] });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    user.coins = (user.coins ?? 0) + coins;
    await user.save();

    reply.status(200).send({ message: 'Coins added successfully', user });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ error: 'Internal server error' });
  }
}

export const getUserReferrals = async (
  request: FastifyRequest<{ Params: { userId: number } }>,
  reply: FastifyReply
) => {
  try {
    const { userId } = request.params;
    const user = await User.findOne({ id: userId });
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    console.log(user.referrals);

    const referralIds = user.referrals.map((referralId: string) => {
      return { id: referralId };
    });

    const referrals = await User.find({
      id: { $in: referralIds.map((referral) => referral.id) },
    });

    reply.send(referrals);
  } catch (err) {
    reply.status(500).send({ error: 'Failed to fetch referrals' });
  }
};

export async function deductCoinsFromUser(
  request: FastifyRequest<{ Params: { id: number }; Body: { amount: number } }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const { amount } = request.body;

    if (amount <= 0) {
      return reply
        .status(400)
        .send({ error: 'Amount to deduct must be greater than zero' });
    }

    const user = await User.findOne({ $or: [{ id }] });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    if (!user.coins) {
      return reply.status(400).send({ error: 'User has no coins' });
    }

    if (user?.coins < amount) {
      return reply.status(400).send({ error: 'Insufficient coins' });
    }

    user.coins = (user.coins ?? 0) - amount;
    await user.save();

    reply.status(200).send({ message: 'Coins deducted successfully', user });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ error: 'Internal server error' });
  }
}
