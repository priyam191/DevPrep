const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
});

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    chatId: {
        type: String,
        required: true,
        unique: true,
    },
    title:
    {
        type: String,
        required: true,
        default: 'New Chat',
    },
    messages: [MessageSchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


const chatModel = mongoose.model('Chat', chatSchema);

module.exports = chatModel;