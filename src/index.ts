import fastify from 'fastify';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import { connectDB } from './database/db';
import cors from '@fastify/cors';
import TelegramBot from 'node-telegram-bot-api';
import { User } from './models/userModel';

dotenv.config();

const token = '7362145024:AAHnXNfEx7DZvIlGUwMr7ZTyFusOA_z2iFU';
const bot = new TelegramBot(token, { polling: true });

const server = fastify({ logger: true });

connectDB();

server.register(cors, {
  origin: '*',
});

server.get('/', async (request, reply) => {
  return { hello: 'world' };
});

server.register(userRoutes, { prefix: '/api/users' });

bot.onText(/\/start (.+)/, async (msg: any, match: any) => {
  const referrerId = match[1];
  const newUserId = msg.from.id;
  const { first_name, last_name, language_code } = msg.from;

  await trackReferral(
    referrerId,
    newUserId,
    first_name,
    last_name,
    language_code
  );

  bot.sendMessage(msg.chat.id, 'Welcome to the game!');
});

async function trackReferral(
  referrerId: string,
  newUserId: string,
  first_name: string,
  last_name: string,
  language_code: string
) {
  const referrer = await User.findOne({ id: referrerId });
  const newUser = await User.findOne({ id: newUserId });

  if (!newUser) {
    const newUserData = new User({
      id: newUserId,
      first_name,
      last_name,
      language_code,
      points: 50,
      referredBy: referrerId,
      referrals: [],
    });
    await newUserData.save();
    bot.sendMessage(
      newUserId,
      'You have received 50 points for joining through a referral!'
    );
  }

  if (referrer) {
    await User.updateOne(
      { id: referrerId },
      { $inc: { points: 100 }, $push: { referrals: newUserId } }
    );
    bot.sendMessage(
      referrerId,
      'You have received 100 points for referring a new user!'
    );
  }
}

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
