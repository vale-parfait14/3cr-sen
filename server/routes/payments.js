const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');

// Get all payments
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find().populate('patientId'); // Populer les informations du patient
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des paiements", error: err.message });
  }
});

// Add new payment
router.post('/', async (req, res) => {
  const { patientId, nom, diagnostic, age, numeroDeTelephone, ordre, datePaiement, statut } = req.body;

  // Validation des champs requis
  if (!patientId || !nom || !diagnostic || !datePaiement || !ordre) {
    return res.status(400).json({ message: "Tous les champs requis doivent être remplis." });
  }

  const payment = new Payment({
    patientId,
    nom,
    diagnostic,
    age,
    numeroDeTelephone,
    ordre,
    datePaiement,
    statut: statut || 'Payé' // Le statut par défaut est 'Payé'
  });

  try {
    const newPayment = await payment.save();
    res.status(201).json(newPayment);
  } catch (err) {
    res.status(400).json({ message: "Erreur lors de l'enregistrement du paiement", error: err.message });
  }
});

// Update payment
router.put('/:id', async (req, res) => {
  try {
    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ message: "Paiement non trouvé" });
    }

    res.json(updatedPayment);
  } catch (err) {
    res.status(400).json({ message: "Erreur lors de la mise à jour du paiement", error: err.message });
  }
});

// Delete payment
router.delete('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Paiement non trouvé" });
    }

    res.json({ message: 'Paiement supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression du paiement", error: err.message });
  }
});

module.exports = router;
