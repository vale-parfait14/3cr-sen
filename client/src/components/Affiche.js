import React from 'react';
import { usePatientDoctorContext } from './PatientDoctorContext';

const Affiche = () => {
  const { patients } = usePatientDoctorContext();
  const [patientFiles, setPatientFiles] = React.useState(() => {
    const savedFiles = localStorage.getItem('patientFiles');
    return savedFiles ? JSON.parse(savedFiles) : {};
  });

  return (
    <div className="patient-list-container">
      <h2>Liste des Patients et Fichiers Associés</h2>
      
      <ul className="patient-list">
        {patients.map((patient) => (
          <li key={patient._id} className="patient-item">
            <h3>{patient.nom}</h3>
            <div className="files-container">
              {patientFiles[patient._id]?.length > 0 ? (
                patientFiles[patient._id].map((file, index) => (
                  <div key={index} className="file-preview">
                    <span>{file.name}</span>
                    <span className="file-timestamp">{new Date(file.timestamp).toLocaleString()}</span>
                    
                    {/* Affichage des images */}
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
                ))
              ) : (
                <span>Aucun fichier associé.</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Rendu du composant Chow */}
    </div>
  );
};

export default Affiche;
