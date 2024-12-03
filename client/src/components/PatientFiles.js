import React, { useState, useEffect } from 'react';
import { usePatientDoctorContext } from './PatientDoctorContext';
import { useNavigate } from 'react-router-dom';
//import Chow from "./Chow";

const PatientFiles = () => {
  const { patients } = usePatientDoctorContext(); // Pas besoin de removePatient ici
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [patientFiles, setPatientFiles] = useState(() => {
    const savedFiles = localStorage.getItem('patientFiles');
    return savedFiles ? JSON.parse(savedFiles) : {};
  });
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem('patientFiles', JSON.stringify(patientFiles));
  }, [patientFiles]);

  const handleFileUpload = (patientId, event) => {
    const files = event.target.files;
    if (files.length > 0) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
          setError(`Le fichier ${file.name} est un type non autorisé. Seules les images et les PDF sont acceptés.`);
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          const fileData = {
            name: file.name,
            type: file.type,
            data: reader.result,
            timestamp: new Date().toISOString(),
          };

          setPatientFiles(prev => ({
            ...prev,
            [patientId]: [...(prev[patientId] || []), fileData]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  
  const removeFile = (patientId, fileIndex) => {
    setPatientFiles(prev => ({
      ...prev,
      [patientId]: prev[patientId].filter((_, index) => index !== fileIndex)
    }));
  };

  const filteredPatients = patients.filter(patient =>
    patient.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="patient-list-container">
      <button onClick={() => navigate('/doctors')} className="back-button">Retour à l'accueil</button>
      <h2>Liste des Patients Archives</h2>
      <input
        type="text"
        placeholder="Rechercher un patient..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      
      {error && <div className="error-message">{error}</div>}

      <ul className="patient-list">
        {filteredPatients.map((patient) => (
          <li key={patient._id} className="patient-item">
            <div className="patient-header">
              <h3>{patient.nom}</h3>
              <input
                type="file"
                onChange={(e) => handleFileUpload(patient._id, e)}
                className="file-input"
                multiple
              />
              
            </div>
            
            <div className="files-container">
              {patientFiles[patient._id]?.map((file, index) => (
                <div key={index} className="file-preview">
                  <div className="file-info">
                    <span>{file.name}</span>
                    <span className="file-timestamp">{new Date(file.timestamp).toLocaleString()}</span>
                    <button 
                      onClick={() => removeFile(patient._id, index)}
                      className="remove-file-btn"
                    >
                      ×
                    </button>
                  </div>
                  {file.type.startsWith('image/') && (
                    <img 
                      src={file.data} 
                      alt={file.name}
                      className="file-image"
                    />
                  )}
                  {file.type === 'application/pdf' && (
                    <embed 
                      src={file.data} 
                      type="application/pdf" 
                      width="100%" 
                      height="400px" 
                      className="file-pdf"
                    />
                  )}
                  {!file.type.startsWith('image/') && file.type !== 'application/pdf' && (
                    <span>Type de fichier non pris en charge pour l'aperçu.</span>
                  )}
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
     
    </div>
  );
};

export default PatientFiles;
