const express = require('express');
const app = express();
app.set('trust proxy', 1);
require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoute');
const chatRoutes = require('./routes/chatRoute');
const { apiLimiter } = require('./middleware/rateLimit');

process.on('unhandledRejection', (reason, promise) => {
  console.error('⛔ Unhandled Rejection at:', promise, 'reason:', reason?.message || reason);
});
process.on('uncaughtException', (err) => {
  console.error('⛔ Uncaught Exception:', err?.message || err);
  process.exit(1);
});

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}))
app.use(cookieParser());
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);

const port = process.env.PORT || 3001;


app.get('/', (req, res) => {
    res.send('Hello, World!');
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
      console.log(`   CORS origin: ${process.env.CLIENT_URL || 'NOT SET (CORS will break!)'}`);
      console.log(`   Health check: http://localhost:${port}/`);
    });
  } catch (err) {
    console.error('\n💥 Failed to start server. Fix the error above and try again.');
    process.exit(1);
  }
};

startServer();
