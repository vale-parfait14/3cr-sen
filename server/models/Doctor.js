const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    // Ajoutez d'autres champs selon vos besoins
});

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;