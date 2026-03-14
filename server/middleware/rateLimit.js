const rateLimit = require('express-rate-limit');

const parseIntWithDefault = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const apiLimiter = rateLimit({
  windowMs: parseIntWithDefault(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  max: parseIntWithDefault(process.env.RATE_LIMIT_MAX, 100),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' }
});

const chatMessageLimiter = rateLimit({
  windowMs: parseIntWithDefault(process.env.CHAT_RATE_LIMIT_WINDOW_MS, 60 * 1000),
  max: parseIntWithDefault(process.env.CHAT_RATE_LIMIT_MAX, 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many chat messages. Please slow down.' }
});

module.exports = { apiLimiter, chatMessageLimiter };
