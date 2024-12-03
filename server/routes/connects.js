// routes/connects.js

const express = require('express');
const router = express.Router();
const Connect = require('../models/ConnectionHistory');

// Route pour récupérer tout l'historique des connexions
router.get('/', async (req, res) => {
  try {
    const history = await Connect.find(); // Récupérer toutes les connexions
    res.json(history); // Renvoyer l'historique en JSON
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

// Route pour ajouter une nouvelle connexion
router.post('/', async (req, res) => {
  const { userName, date, time } = req.body;

  if (!userName || !date || !time) {
    return res.status(400).send('Les champs userName, date et time sont requis');
  }

  try {
    const newConnect = new Connect({
      userName,
      date,
      time,
    });

    await newConnect.save(); // Sauvegarder la nouvelle connexion dans MongoDB
    res.status(201).send('Connexion ajoutée');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

// Route pour supprimer tout l'historique des connexions
router.delete('/', async (req, res) => {
  try {
    await Connect.deleteMany(); // Supprimer toutes les connexions
    res.send('Historique des connexions supprimé');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;
