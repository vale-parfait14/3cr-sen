// models/ConnectionHistory.js
const mongoose = require('mongoose');

const connectionHistorySchema = new mongoose.Schema({
  userName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('ConnectionHistory', connectionHistorySchema);
