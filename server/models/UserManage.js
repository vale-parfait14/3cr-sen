// models/UserManage.js
const mongoose = require('mongoose');

const userManageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  accessLevel: { type: String, required: true },
  service: { type: String, required: true },
});

const UserManage = mongoose.model('UserManage', userManageSchema);

module.exports = UserManage;
