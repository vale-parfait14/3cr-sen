// models/User.js
const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  accessLevel: { type: String, required: true },
  service: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Users', usersSchema);
