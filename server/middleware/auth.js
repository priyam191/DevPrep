const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const BlackList = require('../models/blackList.model');

// Secret key for JWT (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password with hash
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  const bearerToken = req.header('Authorization')?.replace('Bearer ', '');
  const token = bearerToken || req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const blacklisted = await BlackList.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ message: 'Token is invalidated. Please log in again.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// Optional: Middleware to check if user is authenticated (for protected routes)
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }
  next();
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  requireAuth
};
