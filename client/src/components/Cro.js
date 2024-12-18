import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Patients.css';

const Patients = () => {
  const [validatedPatients, setValidatedPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchValidatedPatients();
  }, []);

  const fetchValidatedPatients = async () => {
    try {
      const response = await axios.get('api/patients/validated');
      setValidatedPatients(response.data);
    } catch (error) {
      console.log('Error fetching patients:', error);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  return (
    <div className="patients-container">
      <div className="patient-selection">
        <h3>Sélectionner un patient</h3>
        <select onChange={(e) => handlePatientSelect(validatedPatients[e.target.value])}>
          <option value="">--Choisir un patient--</option>
          {validatedPatients.map((patient, index) => (
            <option key={patient.id} value={index}>
              {patient.nom}
            </option>
          ))}
        </select>
      </div>

      {selectedPatient && (
        <div className="patient-details">
          <h3>Détails du Patient</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Numéro de dossier:</label>
              <span>{selectedPatient.numeroDossier}</span>
            </div>
            <div className="info-item">
              <label>Nom:</label>
              <span>{selectedPatient.nom}</span>
            </div>
            <div className="info-item">
              <label>Date de naissance:</label>
              <span>{selectedPatient.dateNaissance}</span>
            </div>
            <div className="info-item">
              <label>Sexe:</label>
              <span>{selectedPatient.sexe}</span>
            </div>
            <div className="info-item">
              <label>Age:</label>
              <span>{selectedPatient.age}</span>
            </div>
            <div className="info-item">
              <label>Groupe sanguin:</label>
              <span>{selectedPatient.groupeSanguin}</span>
            </div>
            <div className="info-item">
              <label>Adresse:</label>
              <span>{selectedPatient.adresse}</span>
            </div>
            <div className="info-item">
              <label>Téléphone:</label>
              <span>{selectedPatient.telephone}</span>
            </div>
            <div className="info-item">
              <label>Diagnostic:</label>
              <span>{selectedPatient.diagnostic}</span>
            </div>
            <div className="info-item">
              <label>Opérateur:</label>
              <span>{selectedPatient.operateur}</span>
            </div>
          </div>

          <div className="comment-section">
            <h3>Commentaire</h3>
            <textarea
              value={comment}
              onChange={handleCommentChange}
              placeholder="Ajouter un commentaire..."
              rows="4"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
