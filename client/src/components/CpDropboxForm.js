import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {useNavigate} from 'react-router-dom';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDSQ0cQa7TISpd_vZWVa9dWMzbUUl-yf38",
  authDomain: "basecenterdb.firebaseapp.com",
  projectId: "basecenterdb",
  storageBucket: "basecenterdb.firebasestorage.app",
  messagingSenderId: "919766148380",
  appId: "1:919766148380:web:30db9986fa2cd8bb7106d9"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CpDropboxForm = () => {
  const [fieldValue, setFieldValue] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [patients, setPatients] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPatient, setExpandedPatient] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      const querySnapshot = await getDocs(collection(db, 'patients'));
      const patientsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPatients(patientsData);
    };
    fetchPatients();
  }, []);

  const handleFieldChange = (e) => {
    setFieldValue(e.target.value);
  };

  const handleCommentChange = (index, comment) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles[index].comment = comment;
    setSelectedFiles(updatedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newPatient = {
      name: fieldValue,
      files: selectedFiles,
      lastModified: new Date().toISOString()
    };

    if (editingIndex !== null) {
      const patientDoc = doc(db, 'patients', editingIndex);
      await updateDoc(patientDoc, newPatient);
      setEditingIndex(null);
    } else {
      await addDoc(collection(db, 'patients'), newPatient);
    }

    setFieldValue('');
    setSelectedFiles([]);
    const querySnapshot = await getDocs(collection(db, 'patients'));
    const patientsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setPatients(patientsData);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePatientFiles = (patientId) => {
    setExpandedPatient(expandedPatient === patientId ? null : patientId);
  };
  useEffect(() => {
    // Intercepter la tentative de retour arrière
    const handlePopState = (e) => {
      // Empêcher la navigation en arrière
      window.history.pushState(null, '', window.location.href);
    };

    // Ajouter un événement 'popstate' pour empêcher l'utilisateur de revenir en arrière
    window.history.pushState(null, '', window.location.href); // Empêche de revenir en arrière
    window.addEventListener('popstate', handlePopState);

    // Nettoyer l'écouteur d'événements lors du démontage du composant
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); // L'effet se déclenche une seule fois, lors du montage du composant

  return (
    <div style={{ paddingTop: '2px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between',backgroundColor:"rgb(28, 211, 211)",borderRadius:"10px"}}>
         <div>
           <button style={{margin:"20px"}}  className='btn3'onClick={() => navigate('/patients')}>
              <svg xmlns="http://www.w3.org/2000/svg" 
                  width="30" 
                  height="30"
                  fill="currentColor" 
                  class="bi bi-house-door-fill" 
                  viewBox="0 0 16 16">
                  <path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5"/>
              </svg>
           </button>
           </div>
           <div>
           <h2 style={{color:"white", margin:"20px"}}>Recherche des Archives</h2>

            </div>
      </div>
      

     

     <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
     <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Rechercher par nom"
        style={{

          margin: '10px 0',
          padding: '10px',
          width: '100%',
          maxWidth: '700px',
          borderRadius: '5px',
          border: '1px solid #ddd'
        }}
      />
     {filteredPatients.length > 0 ? (
        <div style={{ marginTop: '20px' }}>
          <h3>Liste des Patients :</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {filteredPatients.map((patient) => (
              <li
                key={patient.id}
                style={{
                  marginBottom: '20px',
                  backgroundColor: '#f9f9f9',
                  padding: '15px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                <h3 style={{ margin: 0 }}>{patient.name}</h3>
                <p style={{ margin: '5px 0', color: '#555' }}>
                  <small>Dernière modification : {new Date(patient.lastModified).toLocaleString()}</small>
                </p>

                <button
                  onClick={() => togglePatientFiles(patient.id)}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {expandedPatient === patient.id ? 'Masquer les fichiers' : 'Afficher les fichiers'}
                </button>

                {expandedPatient === patient.id && patient.files.length > 0 && (
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                    <strong>Fichiers associés :</strong>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                      {patient.files.map((file, fileIndex) => (
                        <li key={fileIndex} style={{ marginBottom: '8px' }}>
                          <a href={file.link} target="_blank" rel="noopener noreferrer">
                            {file.name}
                          </a>
                          <small style={{ display: 'block', color: '#777' }}>
                            Ajouté le : {new Date(file.timestamp).toLocaleString()}
                          </small>
                          <p><strong>Commentaire :</strong> {file.comment || 'Aucun commentaire'}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Aucun patient trouvé.</p>
      )}
     </div>
    </div>
  );
};

export default CpDropboxForm;
