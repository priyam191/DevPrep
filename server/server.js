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

const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, '');
const allowedOrigins = [
  'http://localhost:3000',
  'https://dev-prep-gamma.vercel.app',
  ...(process.env.CLIENT_URL || '').split(','),
  ...(process.env.CORS_ORIGINS || '').split(','),
]
  .map(normalizeOrigin)
  .filter(Boolean);

// Vercel preview deployments for this project use the team-qualified hostname.
// Explicit custom domains should be listed in CLIENT_URL or CORS_ORIGINS.
const vercelProjectOrigin = /^https:\/\/dev-prep-[a-z0-9-]+-priyams-projects-52af067f\.vercel\.app$/;

app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(normalizeOrigin(origin)) || vercelProjectOrigin.test(origin)) {
      return callback(null, true);
    }

    console.warn(`Blocked CORS request from origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
}));
app.use(cookieParser());
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/resumes', resumeRoutes);
app.use(errorHandler);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, status: "ok" });
});

// Export the Express app so Vercel can run it as a single Function.
module.exports = app;

// Long-lived server for local dev / self-hosting. This block is skipped when the
// module is imported (e.g. by Vercel), so it only runs with `node server.js`.
if (require.main === module) {
  const port = process.env.PORT || 3001;
  connectDB()
    .then(() => {
      app.listen(port, "0.0.0.0", () => {
        console.log(`🚀 Server is running on port ${port}`);
        console.log(`   CORS origins: ${allowedOrigins.join(', ')}`);
        console.log(`   Health check: http://localhost:${port}/health`);
      });
    })
    .catch(() => {
      console.error('\n💥 Failed to start server. Fix the error above and try again.');
      process.exit(1);
    });
}
