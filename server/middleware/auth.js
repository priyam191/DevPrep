const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const BlackList = require('../models/blackList.model');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};


const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};


const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};


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

// Middleware to check if user is authenticated (for protected routes)
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }
  next();
};

//authenticate to check valid user to upload or download file from s3

const authenticate = async(req,res, next) =>{
  try{
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

     const token = authHeader.split(' ')[1];
    const blacklisted = await BlackList.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ message: 'Token is invalidated. Please log in again.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  }catch(err){
    console.error('Error in authentication middleware:', err);
  }
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  requireAuth,
  authenticate
};
