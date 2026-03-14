const mongoose = require('mongoose');

const blackListSchema = new mongoose.Schema({
    token: {
    type: String,
    required: true,
  },
    createdAt: {
    type: Date,
    default: Date.now,
  },
  }
);

module.exports = mongoose.model('BlackList', blackListSchema);