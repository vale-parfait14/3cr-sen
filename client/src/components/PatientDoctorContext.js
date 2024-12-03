import React, { createContext, useContext, useState } from 'react';

// Crée le contexte
const PatientDoctorContext = createContext();

// Hook pour utiliser le contexte
export const usePatientDoctorContext = () => useContext(PatientDoctorContext);

// Fournisseur du contexte
export const PatientDoctorProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);

  // Fonction pour mettre à jour la liste des patients
  const updatePatients = (newPatients) => {
    setPatients(newPatients);
  };

  return (
    <PatientDoctorContext.Provider value={{ patients, updatePatients }}>
      {children}
    </PatientDoctorContext.Provider>
  );
};
