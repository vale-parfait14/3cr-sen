import React, { useState, useEffect } from 'react';

const PatientList = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetch('https://threecr-sen-1.onrender.com/api/patients')
      .then(response => response.json())
      .then(data => setPatients(data));
  }, []);

  return (
    <div>
      <h1>Liste des patients</h1>
      <ul>
        {patients.map(patient => (
          <li key={patient.id}>
            {patient.nom} {patient.prenom}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PatientList;
