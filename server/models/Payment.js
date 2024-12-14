const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  nom: String,
  diagnostic: String,
  age: String,
  numeroDeTelephone: String,
  ordre: String,
  modePaiement: String,
  Donnateur: String,
  montant: Number,
  datePaiement: Date,
  statut: {
    type: String,
    default: 'Payé'
  },
  service: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
