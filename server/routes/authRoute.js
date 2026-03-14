const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth').verifyToken;

const registerUser = require("../controller/authController").registerUser;
const loginUser = require("../controller/authController").loginUser;
const logoutUser = require("../controller/authController").logoutUser;
const getUserInfo = require("../controller/authController").getUserInfo;
const getAllUsers = require("../controller/authController").getAllUsers;

router.get('/me', authMiddleware, getUserInfo);
router.get('/', authMiddleware, getAllUsers);

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', authMiddleware, logoutUser);

module.exports = router;
