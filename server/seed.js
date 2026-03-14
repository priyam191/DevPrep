// simple seeder for users and chats
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Chat = require('./models/chat');
require('dotenv').config();

/**
 * Run this script with `node seed.js` from the server/ folder.
 * Make sure MONGO_URI is set in your environment (e.g. via .env or
 * `set MONGO_URI=...` on Windows).
 *
 * It will create a test user (if one doesn't exist) and insert two
 * example chat documents for that user.  After running you can use
 * Postman to authenticate as the user and hit the /chat endpoints to
 * inspect the seeded data.
 */

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not defined. please set it before running the seeder.');
    process.exit(1);
  }
  await connectDB();

  // create/find a user that we can attach chats to
  let user = await User.findOne({ email: 'test@example.com' });
  if (!user) {
    // create a user with a hashed password so the /login endpoint works
    const { hashPassword } = require('./middleware/auth');
    const hashed = await hashPassword('password123');
    user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashed,
    });
    console.log('Created test user:', user.email);
  }

  const userId = user._id;
  const now = new Date();

  const sampleChats = [
    {
      userId,
      // ObjectId must be constructed with "new" to avoid TypeError
      chatId: new mongoose.Types.ObjectId().toString(),
      title: 'Welcome Conversation',
      messages: [
        { role: 'user', content: 'Hi, how are you?' },
        { role: 'assistant', content: "I'm fine, thanks!" },
      ],
      createdAt: now,
    },
    {
      userId,
      chatId: new mongoose.Types.ObjectId().toString(),
      title: 'Project ideas',
      messages: [
        { role: 'user', content: 'Give me project ideas.' },
        { role: 'assistant', content: 'How about a todo app?' },
      ],
      createdAt: now,
    },
  ];

  // avoid duplicates by deleting existing test chats for this user first
  await Chat.deleteMany({ userId, title: { $in: ['Welcome Conversation', 'Project ideas'] } });
  await Chat.insertMany(sampleChats);
  console.log('Inserted sample chats for', user.email);

  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
