// routes/loginHistoryRoutes.js
const express = require('express');
const router = express.Router();
const LoginHistory = require('../models/LoginHistory');

// Ajouter une entrée dans l'historique de connexion
router.post('/login-history', async (req, res) => {
  const { userName, loginTime } = req.body;

  try {
    const history = new LoginHistory({ userName, loginTime });
    await history.save();
    res.status(201).json(history);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la sauvegarde de l\'historique' });
  }
});

// Obtenir l'historique de connexion
router.get('/login-history', async (req, res) => {
  try {
    const history = await LoginHistory.find();
    res.status(200).json(history);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la récupération de l\'historique' });
  }
});

// Supprimer l'historique de connexion
router.delete('/login-history', async (req, res) => {
  try {
    await LoginHistory.deleteMany();
    res.status(200).json({ message: 'Historique supprimé' });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la suppression de l\'historique' });
  }
});

module.exports = router;
