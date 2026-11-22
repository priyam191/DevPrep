const mongoose = require('mongoose');

const blackListSchema = new mongoose.Schema({
    token: {
    type: String,
    required: true,
    index: true,
  },
    createdAt: {
    type: Date,
    default: Date.now,
    // auto-remove entries once the JWT itself would have expired (24h)
    expires: 60 * 60 * 24,
  },
  }
);

module.exports = mongoose.model('BlackList', blackListSchema);