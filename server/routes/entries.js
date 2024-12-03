// routes/entries.js
const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');

// Ajouter une nouvelle entrée
router.post('/', async (req, res) => {
    const { userId, name, pathology, files } = req.body;
    try {
        const newEntry = new Entry({ userId, name, pathology, files });
        await newEntry.save();
        res.status(201).json(newEntry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtenir toutes les entrées d'un utilisateur
router.get('/:userId', async (req, res) => {
    try {
        const entries = await Entry.find({ userId: req.params.userId });
        res.json(entries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mettre à jour une entrée
router.put('/:id', async (req, res) => {
    try {
        const updatedEntry = await Entry.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedEntry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Supprimer une entrée
router.delete('/:id', async (req, res) => {
    try {
        await Entry.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
