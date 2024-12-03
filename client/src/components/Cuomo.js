import React, { useState } from 'react';
import { usePatientDoctorContext } from './PatientDoctorContext';

const Cuomo = () => {
  const { patients, updatePatients } = usePatientDoctorContext();
  const [cuomoPatients, setCuomoPatients] = useState([]);

  const handleReturnPatient = (patient) => {
    // Add patient back to main list
    updatePatients([...patients, patient]);
    // Remove from Cuomo list
    setCuomoPatients(cuomoPatients.filter(p => p._id !== patient._id));
  };

  return (
    <div className="cuomo-container">
      <h2>Patients Cuomo</h2>
      <ul className="patient-list">
        {cuomoPatients.map((patient) => (
          <li key={patient._id} className="patient-item">
            <span>{patient.nom} - {patient.statut}</span>
            <button 
              className="btn3"
              onClick={() => handleReturnPatient(patient)}
            >
              Retourner
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Cuomo;
