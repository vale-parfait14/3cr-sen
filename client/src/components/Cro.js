import React, { useState, useEffect } from 'react';
import DropboxChooser from 'react-dropbox-chooser';
import { Patients } from './Patients';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';

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

const APP_KEY = 'gmhp5s9h3aup35v';

const PatientFileManager = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [commentType, setCommentType] = useState('normal');
  const [customComment, setCustomComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showFiles, setShowFiles] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [formData, setFormData] = useState({
    anesthesiste: '',
    responsableCec: '',
    instrumentiste: '',
    indicationOperatoire: ''
  });

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const q = query(collection(db, 'patientFiles'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const submissionData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSubmissions(submissionData);
    } catch (error) {
      console.error("Error loading submissions:", error);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const handleFileSuccess = (files) => {
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        patient: selectedPatient,
        comment: commentType === 'autre' ? customComment : commentType,
        files: selectedFiles.map(file => ({
          name: file.name,
          link: file.link
        })),
        ...formData,
        timestamp: new Date().toISOString()
      };

      await addDoc(collection(db, 'patientFiles'), submitData);
      
      setSelectedPatient(null);
      setCommentType('normal');
      setCustomComment('');
      setSelectedFiles([]);
      setFormData({
        anesthesiste: '',
        responsableCec: '',
        instrumentiste: '',
        indicationOperatoire: ''
      });

      loadSubmissions();
      alert('Données enregistrées avec succès!');
    } catch (error) {
      console.error("Error submitting form:", error);
      alert('Erreur lors de l\'enregistrement des données');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'patientFiles', id));
      loadSubmissions();
      alert('Suppression réussie!');
    } catch (error) {
      console.error("Error deleting submission:", error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleEdit = async (id, updatedData) => {
    try {
      const docRef = doc(db, 'patientFiles', id);
      await updateDoc(docRef, updatedData);
      loadSubmissions();
      alert('Modification réussie!');
    } catch (error) {
      console.error("Error updating submission:", error);
      alert('Erreur lors de la modification');
    }
  };

  return (
    <div className="container py-4">
      <form onSubmit={handleSubmit}>
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Sélection du Patient</h5>
          </div>
          <div className="card-body">
            <select 
              className="form-select"
              onChange={(e) => {
                const patient = Patients.find(p => p.numeroDossier === e.target.value);
                handlePatientSelect(patient);
              }}
            >
              <option value="">Sélectionnez un patient</option>
              {Patients.map(patient => (
                <option key={patient.numeroDossier} value={patient.numeroDossier}>
                  {patient.numeroDossier} - {patient.nom}
                </option>
              ))}
            </select>

            {selectedPatient && (
              <div className="mt-3">
                <h6>Informations du patient:</h6>
                <div className="row">
                  <div className="col-md-6">
                    <p>Nom: {selectedPatient.nom}</p>
                    <p>Date de naissance: {selectedPatient.dateNaissance}</p>
                    <p>Âge: {selectedPatient.age}</p>
                    <p>Sexe: {selectedPatient.sexe}</p>
                  </div>
                  <div className="col-md-6">
                    <p>Groupe sanguin: {selectedPatient.groupeSanguin}</p>
                    <p>Adresse: {selectedPatient.adresse}</p>
                    <p>Téléphone: {selectedPatient.telephone}</p>
                    <p>Diagnostic: {selectedPatient.diagnostic}</p>
                    <p>Opérateur: {selectedPatient.operateur}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Commentaire</h5>
          </div>
          <div className="card-body">
            <select 
              className="form-select mb-3"
              value={commentType}
              onChange={(e) => setCommentType(e.target.value)}
            >
              <option value="normal">Normal</option>
              <option value="mission">Mission Canadienne</option>
              <option value="autre">Autre</option>
            </select>

            {commentType === 'autre' && (
              <textarea
                className="form-control"
                value={customComment}
                onChange={(e) => setCustomComment(e.target.value)}
                placeholder="Entrez votre commentaire personnalisé"
              />
            )}
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Fichiers</h5>
          </div>
          <div className="card-body">
            <DropboxChooser
              appKey={APP_KEY}
              success={handleFileSuccess}
              cancel={() => console.log('Cancelled')}
              multiselect={true}
            >
              <button type="button" className="btn btn-primary mb-3">
                Choisir des fichiers
              </button>
            </DropboxChooser>

            {selectedFiles.length > 2 ? (
              <div>
                <button 
                  type="button"
                  className="btn btn-secondary mb-3"
                  onClick={() => setShowFiles(!showFiles)}
                >
                  {showFiles ? 'Masquer' : 'Afficher'} les fichiers ({selectedFiles.length})
                </button>
                {showFiles && (
                  <ul className="list-group">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="list-group-item">
                        {file.name}
                        <button 
                          type="button"
                          className="btn btn-danger btn-sm float-end"
                          onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                        >
                          Supprimer
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <ul className="list-group">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="list-group-item">
                    {file.name}
                    <button 
                      type="button"
                      className="btn btn-danger btn-sm float-end"
                      onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                    >
                      Supprimer
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Informations supplémentaires</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Anesthésiste</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.anesthesiste}
                  onChange={(e) => setFormData({...formData, anesthesiste: e.target.value})}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Responsable CEC</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.responsableCec}
                  onChange={(e) => setFormData({...formData, responsableCec: e.target.value})}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Instrumentiste</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.instrumentiste}
                  onChange={(e) => setFormData({...formData, instrumentiste: e.target.value})}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Indication Opératoire</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.indicationOperatoire}
                  onChange={(e) => setFormData({...formData, indicationOperatoire: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="d-grid gap-2 mb-4">
          <button type="submit" className="btn btn-success btn-lg">
            Enregistrer
          </button>
        </div>
      </form>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Historique des soumissions</h5>
        </div>
        <div className="card-body">
          {submissions.map((submission) => (
            <div key={submission.id} className="border-bottom p-3">
              <h6>{submission.patient.nom} - {new Date(submission.timestamp).toLocaleString()}</h6>
              <p>Commentaire: {submission.comment}</p>
              <p>Fichiers: {submission.files.length}</p>
              <div className="btn-group">
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(submission.id)}
                >
                  Supprimer
                </button>
                <button 
                  className="btn btn-warning btn-sm"
                  onClick={() => {
                    const updatedData = {
                      comment: prompt('Nouveau commentaire:', submission.comment) || submission.comment
                    };
                    handleEdit(submission.id, updatedData);
                  }}
                >
                  Modifier
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientFileManager;
