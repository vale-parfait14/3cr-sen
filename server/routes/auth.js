const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Route pour l'inscription (sans email)
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Vérifie si le nom d'utilisateur existe déjà
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ message: 'Nom d\'utilisateur déjà pris' });
  }

  // Hachage du mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword });

  try {
    await newUser.save();
    res.status(201).json({ message: 'Utilisateur enregistré' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route pour la connexion
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Vérifie si l'utilisateur existe
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe invalide' });
    }

    // Vérifie le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe invalide' });
    }

    // Génération du token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Erreur du serveur' });
  }
});

// Route pour réinitialiser le mot de passe
router.post('/reset-password', async (req, res) => {
  const { username, newPassword } = req.body;

  try {
    // Vérifie si l'utilisateur existe
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Hachage du nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();
    res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur du serveur' });
  }
});




module.exports = router;
