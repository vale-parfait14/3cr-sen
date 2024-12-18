import React, { useState, useEffect } from 'react';
import DropboxChooser from 'react-dropbox-chooser';
import 'bootstrap/dist/css/bootstrap.min.css';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
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

const PatientFileManager = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [comment, setComment] = useState('');
  const [customComment, setCustomComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showFiles, setShowFiles] = useState(false);
  const [formData, setFormData] = useState({
    anesthesiste: '',
    responsableCec: '',
    instrumentiste: '',
    indicationOperatoire: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'patients'));
      const patientsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPatients(patientsList);
    } catch (error) {
      setMessage({ type: 'danger', text: 'Erreur lors du chargement des patients' });
    }
    setLoading(false);
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const handleCommentChange = (e) => {
    if (e.target.value === 'autre') {
      setComment('autre');
    } else {
      setComment(e.target.value);
      setCustomComment('');
    }
  };

  const handleFileSuccess = (files) => {
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fileUrls = await Promise.all(
        selectedFiles.map(async (file) => {
          const storageRef = ref(storage, `files/${Date.now()}_${file.name}`);
          const response = await fetch(file.link);
          const blob = await response.blob();
          await uploadBytes(storageRef, blob);
          return await getDownloadURL(storageRef);
        })
      );

      const patientData = {
        patient: selectedPatient,
        comment: comment === 'autre' ? customComment : comment,
        files: fileUrls,
        ...formData,
        timestamp: new Date()
      };

      await addDoc(collection(db, 'patientRecords'), patientData);
      setMessage({ type: 'success', text: 'Dossier enregistré avec succès' });
      resetForm();
    } catch (error) {
      setMessage({ type: 'danger', text: 'Erreur lors de l\'enregistrement' });
    }
    setLoading(false);
  };

  const handleUpdate = async (recordId) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'patientRecords', recordId);
      const updateData = {
        comment: comment === 'autre' ? customComment : comment,
        ...formData,
        updatedAt: new Date()
      };
      await updateDoc(docRef, updateData);
      setMessage({ type: 'success', text: 'Dossier mis à jour avec succès' });
    } catch (error) {
      setMessage({ type: 'danger', text: 'Erreur lors de la mise à jour' });
    }
    setLoading(false);
  };

  const handleDelete = async (recordId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'patientRecords', recordId));
        setMessage({ type: 'success', text: 'Dossier supprimé avec succès' });
        resetForm();
      } catch (error) {
        setMessage({ type: 'danger', text: 'Erreur lors de la suppression' });
      }
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPatient(null);
    setComment('');
    setCustomComment('');
    setSelectedFiles([]);
    setFormData({
      anesthesiste: '',
      responsableCec: '',
      instrumentiste: '',
      indicationOperatoire: ''
    });
  };

  return (
    <div className="container py-4">
      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
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
                  <option key={patient.numeroDossier} value={JSON.stringify(patient)}>
                    {`${patient.numeroDossier} - ${patient.nom}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedPatient && (
            <div className="card mb-4">
              <div className="card-body">
                <h4 className="card-title">Informations du patient</h4>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Numéro de dossier:</strong> {selectedPatient.numeroDossier}</p>
                    <p><strong>Nom:</strong> {selectedPatient.nom}</p>
                    <p><strong>Date de naissance:</strong> {selectedPatient.dateNaissance}</p>
                    <p><strong>Sexe:</strong> {selectedPatient.sexe}</p>
                    <p><strong>Age:</strong> {selectedPatient.age}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Groupe sanguin:</strong> {selectedPatient.groupeSanguin}</p>
                    <p><strong>Adresse:</strong> {selectedPatient.adresse}</p>
                    <p><strong>Téléphone:</strong> {selectedPatient.telephone}</p>
                    <p><strong>Diagnostic:</strong> {selectedPatient.diagnostic}</p>
                    <p><strong>Opérateur:</strong> {selectedPatient.operateur}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <select 
                  className="form-select"
                  value={comment}
                  onChange={handleCommentChange}
                >
                  <option value="">Sélectionner un commentaire</option>
                  <option value="Normal">Normal</option>
                  <option value="Mission Canadienne">Mission Canadienne</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              {comment === 'autre' && (
                <div className="col-md-6">
                  <textarea
                    className="form-control"
                    value={customComment}
                    onChange={(e) => setCustomComment(e.target.value)}
                    placeholder="Entrez votre commentaire"
                  />
                </div>
              )}
            </div>

            <div className="row mb-3">
              <div className="col-12">
                <DropboxChooser 
                  appKey="gmhp5s9h3aup35v"
                  success={handleFileSuccess}
                  cancel={() => console.log('Cancelled')}
                  multiselect={true}
                >
                  <button className="btn btn-primary" type="button">
                    <i className="bi bi-cloud-upload"></i> Sélectionner des fichiers Dropbox
                  </button>
                </DropboxChooser>
              </div>
            </div>

            {selectedFiles.length > 0 && (
              <div className="row mb-3">
                <div className="col-12">
                  <button 
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => setShowFiles(!showFiles)}
                  >
                    {showFiles ? 'Masquer' : 'Afficher'} les fichiers ({selectedFiles.length})
                  </button>
                  {showFiles && (
                    <ul className="list-group mt-2">
                      {selectedFiles.map((file, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          {file.name}
                          <button 
                            type="button" 
                            className="btn btn-danger btn-sm"
                            onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Anesthésiste"
                  value={formData.anesthesiste}
                  onChange={(e) => setFormData({...formData, anesthesiste: e.target.value})}
                />
              </div>
              <div className="col-md-6 mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Responsable CEC"
                  value={formData.responsableCec}
                  onChange={(e) => setFormData({...formData, responsableCec: e.target.value})}
                />
              </div>
              <div className="col-md-6 mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Instrumentiste"
                  value={formData.instrumentiste}
                  onChange={(e) => setFormData({...formData, instrumentiste: e.target.value})}
                />
              </div>
              <div className="col-md-6">
                <textarea
                  className="form-control"
                  placeholder="Indication opératoire"
                  value={formData.indicationOperatoire}
                  onChange={(e) => setFormData({...formData, indicationOperatoire: e.target.value})}
                />
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-end">
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="bi bi-save"></i>
                )}
                Enregistrer
              </button>
              <button 
                type="button" 
                className="btn btn-warning"
                onClick={() => handleUpdate(selectedPatient?.id)}
                disabled={loading}
              >
                <i className="bi bi-pencil"></i> Modifier
              </button>
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={() => handleDelete(selectedPatient?.id)}
                disabled={loading}
              >
                <i className="bi bi-trash"></i> Supprimer
              </button>
            </div>
          </form>
        </div>
      </div>

      {loading && (
        <div className="position-fixed top-50 start-50 translate-middle">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientFileManager;
