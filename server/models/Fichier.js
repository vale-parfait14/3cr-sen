const mongoose = require('mongoose');

const fichierSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  ordre: {
    type: String,
    required: true
  },
  modePaiement: {
    type: String,
    required: true
  },
  Donnateur: String,
  montant: {
    type: Number,
    required: true
  },
  datePaiement: {
    type: Date,
    required: true
  },
  statut: {
    type: String,
    default: 'Payé'
  },
  service: {
    type: String,
    required: true
  },
  dropboxLink: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Fichier', fichierSchema);
