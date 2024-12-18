import React, { useState, useEffect } from 'react';
import DropboxChooser from 'react-dropbox-chooser';
import 'bootstrap/dist/css/bootstrap.min.css';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
const storage = getStorage(app);

const GestionDossierPatient = () => {
  // Récupération des informations depuis le localStorage
  const userService = localStorage.getItem('userService');
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));
  const [userAccessLevel, setUserAccessLevel] = useState(localStorage.getItem("userAccessLevel"));

  const [patients, setPatients] = useState([]);
  const [patientSelectionne, setPatientSelectionne] = useState(null);
  const [commentaire, setCommentaire] = useState('');
  const [commentairePersonnalise, setCommentairePersonnalise] = useState('');
  const [fichiersSelectionnes, setFichiersSelectionnes] = useState([]);
  const [afficherFichiers, setAfficherFichiers] = useState(false);
  const [formData, setFormData] = useState({
    anesthesiste: '',
    responsableCec: '',
    instrumentiste: '',
    indicationOperatoire: ''
  });
  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState({ type: '', texte: '' });

  useEffect(() => {
    if (userService) {
      recupererPatients();
    }
  }, [userService]); // Récupérer à nouveau les patients si le service change

  const recupererPatients = async () => {
    setChargement(true);
    try {
      const patientsRef = collection(db, 'patients');
      const q = query(patientsRef, where('service', '==', userService)); // Filtrer par service
      const querySnapshot = await getDocs(q);
      const patientsListe = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPatients(patientsListe);
    } catch (error) {
      setMessage({ type: 'danger', texte: 'Erreur lors du chargement des patients' });
    }
    setChargement(false);
  };

  const handlePatientSelect = (patient) => {
    setPatientSelectionne(patient);
  };

  const handleCommentaireChange = (e) => {
    if (e.target.value === 'autre') {
      setCommentaire('autre');
    } else {
      setCommentaire(e.target.value);
      setCommentairePersonnalise('');
    }
  };

  const handleFileSuccess = (fichiers) => {
    setFichiersSelectionnes(prev => [...prev, ...fichiers]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChargement(true);
    try {
      const urlsFichiers = await Promise.all(
        fichiersSelectionnes.map(async (fichier) => {
          const storageRef = ref(storage, `files/${Date.now()}_${fichier.name}`);
          const response = await fetch(fichier.link);
          const blob = await response.blob();
          await uploadBytes(storageRef, blob);
          return await getDownloadURL(storageRef);
        })
      );

      const donneesPatient = {
        patient: patientSelectionne,
        commentaire: commentaire === 'autre' ? commentairePersonnalise : commentaire,
        fichiers: urlsFichiers,
        ...formData,
        timestamp: new Date()
      };

      await addDoc(collection(db, 'patientRecords'), donneesPatient);
      setMessage({ type: 'success', texte: 'Dossier enregistré avec succès' });
      resetForm();
    } catch (error) {
      setMessage({ type: 'danger', texte: 'Erreur lors de l\'enregistrement' });
    }
    setChargement(false);
  };

  const handleUpdate = async (recordId) => {
    setChargement(true);
    try {
      const docRef = doc(db, 'patientRecords', recordId);
      const updateData = {
        commentaire: commentaire === 'autre' ? commentairePersonnalise : commentaire,
        ...formData,
        updatedAt: new Date()
      };
      await updateDoc(docRef, updateData);
      setMessage({ type: 'success', texte: 'Dossier mis à jour avec succès' });
    } catch (error) {
      setMessage({ type: 'danger', texte: 'Erreur lors de la mise à jour' });
    }
    setChargement(false);
  };

  const handleDelete = async (recordId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) {
      setChargement(true);
      try {
        await deleteDoc(doc(db, 'patientRecords', recordId));
        setMessage({ type: 'success', texte: 'Dossier supprimé avec succès' });
        resetForm();
      } catch (error) {
        setMessage({ type: 'danger', texte: 'Erreur lors de la suppression' });
      }
      setChargement(false);
    }
  };

  const resetForm = () => {
    setPatientSelectionne(null);
    setCommentaire('');
    setCommentairePersonnalise('');
    setFichiersSelectionnes([]);
    setFormData({
      anesthesiste: '',
      responsableCec: '',
      instrumentiste: '',
      indicationOperatoire: ''
    });
  };

  return (
    <div className="container py-4">
      {message.texte && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.texte}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', texte: '' })}></button>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Gestion des Dossiers Patients</h2>

          <div className="row">
            <div className="col-md-12 mb-3">
              <select 
                className="form-select"
                onChange={(e) => handlePatientSelect(JSON.parse(e.target.value))}
              >
                <option value="">Sélectionner un patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={JSON.stringify(patient)}>
                    {`${patient.numeroDossier} - ${patient.nom}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {patientSelectionne && (
            <div className="card mb-4">
              <div className="card-body">
                <h4 className="card-title">Informations du patient</h4>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Numéro de dossier:</strong> {patientSelectionne.numeroDossier}</p>
                    <p><strong>Nom:</strong> {patientSelectionne.nom}</p>
                    <p><strong>Date de naissance:</strong> {patientSelectionne.dateNaissance}</p>
                    <p><strong>Sexe:</strong> {patientSelectionne.sexe}</p>
                    <p><strong>Âge:</strong> {patientSelectionne.age}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Groupe sanguin:</strong> {patientSelectionne.groupeSanguin}</p>
                    <p><strong>Adresse:</strong> {patientSelectionne.adresse}</p>
                    <p><strong>Téléphone:</strong> {patientSelectionne.telephone}</p>
                    <p><strong>Diagnostic:</strong> {patientSelectionne.diagnostic}</p>
                    <p><strong>Opérateur:</strong> {patientSelectionne.operateur}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Champs du formulaire et boutons à ajouter ici... */}
          </form>
        </div>
      </div>

      {chargement && (
        <div className="position-fixed top-50 start-50 translate-middle">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionDossierPatient;
