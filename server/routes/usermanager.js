const express = require('express');
const router = express.Router();
const UserManager = require('../models/UserManager');

// Route pour récupérer tous les utilisateurs
router.get('/users', (req, res) => {
  const users = UserManager.getAllUsers();
  res.json(users);
});

// Route pour ajouter un utilisateur
router.post('/users', (req, res) => {
  const { name, password, role, accessLevel,service } = req.body;
  if (!name || !password || !role || !accessLevel || !service) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  const user = {
    id: Date.now().toString(), // Génération d'un ID unique basé sur l'horodatage
    name,
    password, // En production, pensez à crypter le mot de passe (bcrypt)
    role,
    accessLevel,
    service
  };

  UserManager.addUser(user);
  res.status(201).json(user);
});

// Route pour mettre à jour un utilisateur
router.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, password, role, accessLevel,service } = req.body;

  const updatedUser = UserManager.updateUser(id, { name, password, role, accessLevel,service });
  if (updatedUser) {
    res.json(updatedUser);
  } else {
    res.status(404).json({ error: 'Utilisateur non trouvé' });
  }
});

// Route pour supprimer un utilisateur
router.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  const deletedUser = UserManager.deleteUser(id);
  if (deletedUser) {
    res.json(deletedUser);
  } else {
    res.status(404).json({ error: 'Utilisateur non trouvé' });
  }
});

// Route pour récupérer un utilisateur par ID
router.get('/users/:id', (req, res) => {
  const { id } = req.params;
  const user = UserManager.getUserById(id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'Utilisateur non trouvé' });
  }
});

module.exports = router;
