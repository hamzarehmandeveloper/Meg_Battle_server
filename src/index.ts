import fastify from 'fastify';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import { connectDB, getClient } from './database/db';
import cors from '@fastify/cors';
import TelegramBot from 'node-telegram-bot-api';
import { User } from './models/userModel';

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

async function updateChatTitle(chatId: number) {
  try {
    const count = await getSubscriberCount();
    const newTitle = `${count} Users`;
    await bot.setChatTitle(chatId, newTitle);
    console.log(`Chat title updated to: ${newTitle}`);
  } catch (error: any) {
    console.error('Failed to update chat title:', error);
  }
}

bot.onText(/\/subscribers/, async (msg) => {
  try {
    const count = await getSubscriberCount();
    bot.sendMessage(msg.chat.id, `We have ${count} subscribers!`);
  } catch (err) {
    bot.sendMessage(msg.chat.id, 'Error fetching subscriber count');
  }
});

bot.onText(/\/updateTitle/, async (msg) => {
  try {
    const chatId = 7071294131;
    await updateChatTitle(chatId);
    bot.sendMessage(chatId, 'Chat title updated!');
  } catch (err) {
    bot.sendMessage(msg.chat.id, 'Error updating chat title');
  }
});

// const updateInterval = 3600000; // 1 hour in milliseconds

// setInterval(async () => {
//   try {
//     const chatId = YOUR_CHAT_ID;
//     await updateChatTitle(chatId);
//   } catch (error) {
//     console.error('Error updating chat title at interval:', error);
//   }
// }, updateInterval);

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
        'You have received 5000 points for referring a new user!'
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
