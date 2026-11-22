const express = require('express');
const app = express();
app.set('trust proxy', 1);
require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoute');
const chatRoutes = require('./routes/chatRoute');
const resumeRoutes = require('./routes/resumeRoute');

const errorHandler = require('./middleware/errorHandler');

const { apiLimiter } = require('./middleware/rateLimit');

process.on('unhandledRejection', (reason, promise) => {
  console.error('⛔ Unhandled Rejection at:', promise, 'reason:', reason?.message || reason);
});
process.on('uncaughtException', (err) => {
  console.error('⛔ Uncaught Exception:', err?.message || err);
  process.exit(1);
});

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (no Origin header) and any configured origin.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}))
app.use(cookieParser());
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/resumes', resumeRoutes);
app.use(errorHandler);

const port = process.env.PORT || 3001;


app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, status: "ok" });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port,"0.0.0.0", () => {
      console.log(`🚀 Server is running on port ${port}`);
      console.log(`   CORS origin: ${process.env.CLIENT_URL || 'NOT SET (CORS will break!)'}`);
      console.log(`   Health check: http://localhost:${port}/health`);
    });
  } catch (err) {
    console.error('\n💥 Failed to start server. Fix the error above and try again.');
    process.exit(1);
  }
};

startServer();
