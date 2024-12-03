const User = require('../models/User');
const Patient = require('../models/Patient');


exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().populate('patients'); // Utilisation de "populate" pour les patients
    res.json(users); // Retourner les utilisateurs et leurs patients
  } catch (error) {
    res.status(500).json({ message: "Erreur du serveur lors de la récupération des utilisateurs" });
  }
};

exports.transferPatient = async (req, res) => {
  const { patientId, sourceUserId, targetUserId } = req.body;
  
  const patient = await Patient.findById(patientId);
  const sourceUser = await User.findById(sourceUserId);
  const targetUser = await User.findById(targetUserId);
  
  sourceUser.patients = sourceUser.patients.filter(p => p.toString() !== patientId);
  targetUser.patients.push(patientId);
  
  patient.assignedTo = targetUserId;
  
  await Promise.all([
    sourceUser.save(),
    targetUser.save(),
    patient.save()
  ]);
  
  res.json({ message: 'Patient transferred successfully' });
};
