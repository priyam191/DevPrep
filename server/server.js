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
    // A request from an unlisted origin is served without CORS headers (the
    // browser blocks it) instead of throwing — same-origin requests, which the
    // single Vercel domain uses, are not affected either way.
    const isAllowed = !origin || allowedOrigins.includes(origin);
    return callback(null, isAllowed);
  },
  credentials: true,
}))
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
        console.log(`   CORS origin: ${process.env.CLIENT_URL || 'NOT SET (CORS will break!)'}`);
        console.log(`   Health check: http://localhost:${port}/health`);
      });
    })
    .catch(() => {
      console.error('\n💥 Failed to start server. Fix the error above and try again.');
      process.exit(1);
    });
}
