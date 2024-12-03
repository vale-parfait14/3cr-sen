const express = require('express');
const router = express.Router();
const Fichier = require('../models/Fichier');

// Get all fichiers
router.get('/', async (req, res) => {
  try {
    const fichiers = await Fichier.find();
    res.json(fichiers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new Fichier with document
router.post('/', async (req, res) => {
  const fichier = new Fichier({
    ...req.body,
    dropboxLink: req.body.dropboxLink
  });
  
  try {
    const newFichier = await Fichier.save();
    res.status(201).json(newFichier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update Fichier and document
router.put('/:id', async (req, res) => {
  try {
    const updatedFichier = await Fichier.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        dropboxLink: req.body.dropboxLink
      },
      { new: true }
    );
    res.json(updatedFichier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete Fichier and document reference
router.delete('/:id', async (req, res) => {
  try {
    await Fichier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Fichier and document deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
