const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth').verifyToken;
const { chatMessageLimiter } = require('../middleware/rateLimit');

const createChat = require('../controller/chatController').createChat;
const getAllChats = require('../controller/chatController').getAllChats;
const sendMessage = require('../controller/chatController').sendMessage;
const getChatById = require('../controller/chatController').getChatById;
const updateChat = require('../controller/chatController').updateChat;
const deleteChat = require('../controller/chatController').deleteChat;

router.post('/', authMiddleware,createChat);
router.get('/', authMiddleware, getAllChats);
router.post('/:chatId/messages', authMiddleware, chatMessageLimiter, sendMessage);
router.get('/:chatId', authMiddleware, getChatById);
router.patch('/:chatId', authMiddleware, updateChat);
router.delete('/:chatId', authMiddleware, deleteChat);  

module.exports = router;
