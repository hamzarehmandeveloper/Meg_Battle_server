import fastify from 'fastify';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import { connectDB, getClient } from './database/db';
import cors from '@fastify/cors';
import TelegramBot from 'node-telegram-bot-api';
import { User } from './models/userModel';
import userCardRoutes from './routes/userCardRoutes';

dotenv.config();

const mongooseClient = getClient();

const token = '7405864910:AAFyrcKkly8Jt8IlUgQO-L6-FyubNnZ9eCQ';
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
server.register(userCardRoutes, { prefix: '/api/user-cards' });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `Hi, ${msg.chat.first_name} 👋. Welcome to the MegBattle bot! 🐒 To start the game, simply click play button below. 👇🏼`
  );
});

async function getSubscriberCount() {
  try {
    const count = await User.countDocuments({});
    return count;
  } catch (error: any) {
    throw new Error('Error counting documents: ' + error.message);
  }
}

// async function isUserAdmin(chatId: number, userId: number) {
//   try {
//     const member = await bot.getChatMember(chatId, userId);
//     return member.status === 'creator' || member.status === 'administrator';
//   } catch (error) {
//     console.error('Error fetching chat member:', error);
//     return false;
//   }
// }

bot.onText(/\/check/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg?.from?.id;

  if (!userId) {
    return;
  }

  bot.getChatMember(chatId, userId).then((member) => {
    if (member.status === 'creator' || member.status === 'administrator') {
      bot.sendMessage(chatId, 'You are an admin!');
    } else {
      bot.sendMessage(chatId, 'You are not an admin.');
    }
  });
});

bot.onText(/\/subscribers/, async (msg) => {
  try {
    const count = await getSubscriberCount();
    const chatId = msg.chat.id;
    const userId = msg?.from?.id;

    if (
      userId !== 1637005489 &&
      userId !== 1040739270 &&
      userId !== 7071294131
    ) {
      return;
    }

    const message = `
      @@MEGBattlebot

      Bot Status:
      Total Users: ${count}👤
    `.trim();

    bot.sendMessage(chatId, message);
  } catch (err) {
    console.error(err);
    bot.sendMessage(msg.chat.id, 'Error fetching subscriber count');
  }
});

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
  const newUser: any = await User.findOne({ id: newUserId });

  if (!newUser) {
    const newUserData = new User({
      id: newUserId,
      first_name,
      last_name,
      language_code,
      coins: 5000,
      referredBy: referrerId,
      referrals: [],
    });
    await newUserData.save();
    bot.sendMessage(
      newUserId,
      'You have received 5000 points for joining through a referral!'
    );
  } else {
    bot.sendMessage(
      referrerId,
      'The user you referred is already a participant.'
    );
    return;
  }

  if (referrer) {
    if (!referrer.referrals.includes(newUserId)) {
      await User.updateOne(
        { id: referrerId },
        { $inc: { coins: 5000 }, $push: { referrals: newUserId } }
      );
      bot.sendMessage(
        referrerId,
        `Good news! Your Telegram friend ${newUser?.first_name} just signed up. You earned 5000 extra tokens for this. Keep doing good job!`
      );
    } else {
      bot.sendMessage(referrerId, 'You have already referred this user.');
    }
  }
}

const start = async () => {
  try {
    await server.listen({ port: 3001, host: '0.0.0.0' });
    const address = server.server.address();
    server.log.info(
      `Server is running at http://localhost:${address?.toString()}`
    );
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
