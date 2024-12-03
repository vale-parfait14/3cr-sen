// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/Users');

// Ajouter un utilisateur
router.post('/users', async (req, res) => {
  const { name, password, role, accessLevel, service } = req.body;
  
  try {
    const user = new User({ name, password, role, accessLevel, service });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de l\'ajout de l\'utilisateur' });
  }
});

// Obtenir tous les utilisateurs
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// Modifier un utilisateur
router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, password, role, accessLevel, service } = req.body;

  try {
    const user = await User.findByIdAndUpdate(id, { name, password, role, accessLevel, service }, { new: true });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur' });
  }
});

// Supprimer un utilisateur
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

module.exports = router;
