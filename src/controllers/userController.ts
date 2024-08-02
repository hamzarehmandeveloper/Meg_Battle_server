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
