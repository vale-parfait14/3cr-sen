import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

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

const ArchiveList = () => {
  const [patients, setPatients] = useState([]);

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

  const handleDeletePatient = async (id) => {
    await deleteDoc(doc(db, 'patients', id));
    setPatients(patients.filter(patient => patient.id !== id));
  };

  return (
    <div className="archive-list-container">
      <h2>Liste des Archives</h2>

      {patients.length > 0 ? (
         <ul>
         {patients.map((patient) => (
           <li key={patient.id} className="patient-item">
             <p><strong>Pathologie:</strong> {patient.pathologie}</p>
             <p><strong>Numero de Dossier  :</strong> {patient.dossierNumber}</p>
             <p><strong>Service :</strong> {patient.service}</p>
             <p><strong>Annee de dossier :</strong> {patient.anneeDossier}</p>
             <p><strong>Nom :</strong> {patient.nom}</p>
               <p><strong>Date de naissance :</strong> {patient.dateNaissance}</p>
               <p><strong>Taille :</strong> {patient.taille}</p>
               <p><strong>Poids :</strong> {patient.poids}</p>
               <p><strong>Sexe :</strong> {patient.sexe}</p>
               <p><strong>Adresse :</strong> {patient.adresse}</p>
               <p><strong>Téléphone :</strong> {patient.numeroDeTelephone}</p>
               <p><strong>Email :</strong> {patient.addressEmail}</p>
               <p><strong>Domicile :</strong> {patient.addressDomicile}</p>
               <p><strong>Salle:</strong> {patient.salle}</p>
               <p><strong>Lit :</strong> {patient.lit}</p>
               <p><strong>Correspondant :</strong> {patient.correspondant}</p>
               <p><strong>Date d'entrée :</strong> {patient.dateEntree}</p>
               <p><strong>Date de sortie :</strong> {patient.dateSortie}</p>
               <p><strong>Diagnostic :</strong> {patient.diagnostic}</p>
               <p><strong>Statut :</strong> {patient.statut}</p>
               <p><strong>Dossier enregistré par :</strong> {patient.auteurEnregistrement}</p>
               <p><strong>Commentaire :</strong> {patient.commentaire}</p>
               <p><strong>Dernière modification :</strong> {new Date(patient.lastModified).toLocaleString()}</p>
               {patient.files.length > 0 && (
                 <div className="patient-files">
                   <strong>Fichiers associés :</strong>
                   <ul>
                     {patient.files.map((file, fileIndex) => (
                       <li key={fileIndex}>
                         <a href={file.link} target="_blank" rel="noopener noreferrer">
                           {file.name}
                         </a>
                         <small> (Ajouté le : {new Date(file.timestamp).toLocaleString()})</small>
                         
                       </li>
                     ))}
                   </ul>
                 </div>
               )}


             <p><small>Dernière modification : {new Date(patient.lastModified).toLocaleString()}</small></p>
             {patient.files.length > 0 && (
               <div className="patient-files">
                 <strong>Fichiers associés :</strong>
                 <ul>
                   {patient.files.map((file, fileIndex) => (
                     <li key={fileIndex}>
                       <a href={file.link} target="_blank" rel="noopener noreferrer">
                         {file.name}
                       </a>
                       <small> (Ajouté le : {new Date(file.timestamp).toLocaleString()})</small>
                       <p><strong>Commentaire :</strong> {file.comment || 'Aucun commentaire'}</p>
                     </li>
                   ))}
                 </ul>
               </div>
             )}
            
           </li>
         ))}
       </ul>
      ) : (
        <p>Aucune archive disponible.</p>
      )}
    </div>
  );
};

export default ArchiveList;
