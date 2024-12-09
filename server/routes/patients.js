const express = require('express');
const Patient = require('../models/Patient');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Create patient
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      pathologie, dossierNumber, service, anneeDossier, anneeIntervention,
      nom, age, genre, ta, fc, spo2, temperature, taille, poids, groupeSanguin, dateNaissance,
      nationalite, profession, numeroDeTelephone, addressEmail,
      addressDomicile, salle, lit, correspondant, dateEntree, dateSortie,
      departementTransfert, dateDeces, dateDesortie, diagnostic, statut, vpa,
      validation, services, consultationReason, traitementEntree,
      traitementSortie, simpleSuites, complications, geste, operateur,
      histoire, antecedents, traitement, ecrt, ecg, ett, tt,
      coronarographie, autresExamens, biologie, cro, rxthoraxPost,
      ecgPost, echoscopiePost, biologiePost, gazo, ecp, dsr, suite, suivi, manageur
    } = req.body;

    if (!nom) {
      return res.status(400).send({ error: 'Name field is required' });
    }

    const patient = new Patient({
      pathologie, dossierNumber, service, anneeDossier, anneeIntervention,
      nom, age, genre, ta, fc, spo2, temperature, taille, poids, groupeSanguin, dateNaissance,
      nationalite, profession, numeroDeTelephone, addressEmail,
      addressDomicile, salle, lit, correspondant, dateEntree, dateSortie,
      diagnostic, statut, vpa, validation, services,
      departementTransfert, dateDeces, dateDesortie, consultationReason,
      traitementEntree, traitementSortie, simpleSuites, complications,
      geste,
      operateur: Array.isArray(operateur) ? operateur : [operateur],
      histoire, antecedents, traitement, ecrt, ecg,
      ett, tt, coronarographie, autresExamens, biologie, cro,
      rxthoraxPost, ecgPost, echoscopiePost, biologiePost, gazo, ecp,
      dsr, suite, suivi,
      userId: req.userId,
      manageur
    });

    await patient.save();
    res.status(201).send(patient);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all patients
router.get('/', authenticate, async (req, res) => {
  try {
    const patients = await Patient.find({ userId: req.userId });
    res.send(patients);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update patient
router.put('/:id', authenticate, async (req, res) => {
  try {
    const updates = {
      ...req.body,
      operateur: Array.isArray(req.body.operateur) ? req.body.operateur : [req.body.operateur],
      dropboxFiles: req.body.dropboxFiles || []
    };

    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    
    if (!updatedPatient) {
      return res.status(404).send({ error: 'Patient not found' });
    }
    res.json(updatedPatient);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete patient
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
