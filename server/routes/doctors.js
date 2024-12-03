const express = require('express');
const Doctor = require('../models/Doctor'); // Ajustez le chemin selon votre structure
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Exemple de route pour récupérer tous les docteurs
router.get('/', authenticate, async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.json(doctors);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Vous pouvez ajouter d'autres routes pour gérer les docteurs ici

module.exports = router;