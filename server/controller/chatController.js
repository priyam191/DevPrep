const mongoose = require('mongoose');
const chatModel = require('../models/chat');
const generateResponse = require('../services/openAi').generateResponse;

//creating chat

const createChat = async(req, res) => {
    try {

        //find user
        const userId = req.user?.userId || req.user?._id;
        if(!userId){
            return res.status(401).json({message: 'User not authenticated'});
        }

        const {title} = req.body;
        const chatId = new mongoose.Types.ObjectId().toString();

        const chat = await chatModel.create({
            userId, chatId, messages: [],
            title: title || 'New Chat'
        });

        res.status(201).json({
            chat,
            message: 'Chat created successfully'
        });

    } catch (err) {
        console.error('createChat error:', err);
        res.status(500).json({ message: 'Server error while creating chat' });
    }
}


const getAllChats = async(req, res) =>{
    try{
        const userId = req.user?.userId || req.user?._id;
        if(!userId){
            return res.status(401).json({message: 'User not authenticated'});
        }

        const chats = await chatModel.find({userId}).select('-__v');
        res.status(200).json(chats);

    }catch(err){
        console.error('getAllChats error:', err);
        res.status(500).json({ message: 'Server error while fetching chats' });
    }
}

const getChatById = async(req, res) => {
    try{
        const userId = req.user?.userId || req.user?._id;
        const {chatId} = req.params;

        if(!userId){
            return res.status(401).json({message: 'User not authenticated'});
        }

        const query = {
            userId,
            $or: [
                { chatId },
                ...(mongoose.Types.ObjectId.isValid(chatId) ? [{ _id: chatId }] : [])
            ]
        };
        const chat = await chatModel.findOne(query);
        if(!chat){
            return res.status(404).json({message: 'Chat not found'});
        }

        res.json(chat);

    }catch(err){
        console.error('getChatById error:', err);  
        res.status(500).json({ message: 'Server error while fetching chat' });
    }
}

const sendMessage = async(req, res) => {
    try{
        const userId = req.user?.userId || req.user?._id;
        const {chatId} = req.params;
        const {message} = req.body;

        if(!userId){
            return res.status(401).json({message: 'User not authenticated'});
        }

        if(!chatId){
            return res.status(400).json({message: 'Chat ID is required'});
        }
        if(!message || typeof message !== 'string' || !message.trim()){
            return res.status(400).json({message: 'Message is required'});
        }

        const chat = await chatModel.findOne({chatId, userId});
        if(!chat){
            return res.status(404).json({message: 'Chat not found'});
        }

        chat.messages.push({role: 'user', content: message.trim()});
        
        const response = await generateResponse(message.trim());
        if(!response){
            return res.status(500).json({message: 'Failed to generate response'});
        }
        chat.messages.push({role: 'assistant', content: response});
        await chat.save();  

        res.status(200).json({message: 'Message sent successfully', chat});

    }catch(err){
        console.error('sendMessage error:', err);
        if (err?.response?.status === 429) {
            return res.status(429).json({ message: 'Rate limited. Please try again shortly.' });
        }
        res.status(500).json({ message: 'Server error while sending message' });
    }
}

// update chat metadata (currently only title)
const updateChat = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?._id;
        const { chatId } = req.params;
        const { title } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        if (!chatId) {
            return res.status(400).json({ message: 'chatId is required' });
        }
        if (title !== undefined && typeof title !== 'string') {
            return res.status(400).json({ message: 'title must be a string' });
        }

        const query = {
            userId,
            $or: [
                { chatId },
                ...(mongoose.Types.ObjectId.isValid(chatId) ? [{ _id: chatId }] : [])
            ]
        };
        const chat = await chatModel.findOne(query);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        if (title !== undefined) {
            chat.title = title;
        }

        await chat.save();
        res.status(200).json({ message: 'Chat updated', chat });
    } catch (err) {
        console.error('updateChat error:', err);
        res.status(500).json({ message: 'Server error while updating chat' });
    }
};

const deleteChat = async(req, res) =>{
    try{
        const userId = req.user?.userId || req.user?._id;
        const {chatId} = req.params;

        if(!userId){
            return res.status(401).json({message: 'User not authenticated'});
        }

        if(!chatId){
            return res.status(400).json({message: 'chat not found'});
        }

        const query = {
            userId,
            $or: [
                { chatId },
                ...(mongoose.Types.ObjectId.isValid(chatId) ? [{ _id: chatId }] : [])
            ]
        };
        const result = await chatModel.findOneAndDelete(query);
        if(!result){
            return res.status(404).json({message: 'Chat not found'});
        }

        res.status(200).json({message: 'Chat deleted successfully'});

    }catch(err){
        console.error('deleteChat error:', err);
        res.status(500).json({ message: 'Server error while deleting chat' });
    }
}


module.exports = {
    createChat,
    getAllChats,
    sendMessage,
    getChatById,
    updateChat,
    deleteChat
};
