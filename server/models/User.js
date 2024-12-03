const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // Unique pour éviter les doublons
  password: { type: String, required: true },

});

// Méthode pour comparer le mot de passe haché avec le mot de passe fourni
UserSchema.methods.comparePassword = async function (password) {
  const bcrypt = require('bcrypt');
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
