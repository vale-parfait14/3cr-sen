// models/LoginHistory.js
const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  userName: { type: String, required: true },
  loginTime: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
