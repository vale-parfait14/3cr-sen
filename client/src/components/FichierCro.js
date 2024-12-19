

import React, { useState, useEffect } from 'react';
import DropboxChooser from 'react-dropbox-chooser';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css'; // Assurez-vous d'importer Bootstrap

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

const SurgicalForm = () => {
  const [formData, setFormData] = useState({
    commentType: 'Normal',
    customComment: '',
    files: [],
    anesthesists: '',
    surgeons: '',
    diagnosis: '',
    operativeIndication: ''
  });

  const [savedRecords, setSavedRecords] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const commentTypes = ['Normal', 'Mission Canadienne', 'Mission Suisse', 'Autre'];

  // L'état qui gère l'affichage des fichiers pour chaque enregistrement
  const [fileVisibility, setFileVisibility] = useState({});

  const [fichierInfo, setFichierInfo] = useState({
    patientId: '',
    ordre: '',
    datePatient: ''
  });

  const [patients, setPatients] = useState([]);
  const userService = localStorage.getItem('userService');

  const validatedPatients = patients.filter(patient =>
    patient.validation === 'Validé' && patient.services === userService
  );

  useEffect(() => {
    const fetchRecords = async () => {
      const querySnapshot = await getDocs(collection(db, "surgicalForms"));
      const records = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedRecords(records);
    };
    fetchRecords();
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      const querySnapshot = await getDocs(collection(db, "patients"));
      const patientsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPatients(patientsData);
    };
    fetchPatients();
  }, []);

  const handleDropboxSuccess = (files) => {
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));
  };

  const removeFile = (linkToRemove) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter(file => file.link !== linkToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditing) {
      const recordRef = doc(db, "surgicalForms", editingId);
      await updateDoc(recordRef, formData);

      setSavedRecords(prev =>
        prev.map(record =>
          record.id === editingId ? { ...formData, id: editingId } : record
        )
      );
      setIsEditing(false);
      setEditingId(null);
    } else {
      const newRecordRef = await addDoc(collection(db, "surgicalForms"), formData);
      setSavedRecords(prev => [
        ...prev, 
        { ...formData, id: newRecordRef.id }
      ]);
    }

    setFormData({
      commentType: 'Normal',
      customComment: '',
      files: [],
      anesthesists: '',
      surgeons: '',
      diagnosis: '',
      operativeIndication: ''
    });
  };

  const editRecord = (record) => {
    setFormData(record);
    setIsEditing(true);
    setEditingId(record.id);
  };

  const deleteRecord = async (id) => {
    await deleteDoc(doc(db, "surgicalForms", id));
    setSavedRecords(prev => prev.filter(record => record.id !== id));
  };

  // Fonction pour basculer la visibilité des fichiers d'un enregistrement
  const toggleFilesVisibility = (id) => {
    setFileVisibility(prev => ({
      ...prev,
      [id]: !prev[id] // Change la visibilité du fichier pour cet enregistrement
    }));
  };

  return (
    <div className="container-fluid p-4">
      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
         <label className="form-label">Type de commentaire:</label>
          <select
            value={formData.commentType}
            onChange={(e) => setFormData(prev => ({ ...prev, commentType: e.target.value }))}
            className="form-select"
          >
            {commentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {formData.commentType === 'Autre' && (
          <div className="col-md-6">
            <label className="form-label">Commentaire personnalisé:</label>
            <textarea
              value={formData.customComment}
              onChange={(e) => setFormData(prev => ({ ...prev, customComment: e.target.value }))}
              className="form-control"
            />
          </div>
        )}

        <div className="col-md-6">
          <label className="form-label">Fichiers:</label>
          <DropboxChooser
            appKey="gmhp5s9h3aup35v"
            success={handleDropboxSuccess}
            cancel={() => console.log('Cancelled')}
            multiselect={true}
          >
            <button type="button" className="btn btn-primary w-100">
              Choisir des fichiers
            </button>
          </DropboxChooser>

          <div className="mt-2">
            {formData.files.map(file => (
              <div key={file.link} className="d-flex justify-content-between align-items-center">
                <a href={file.link} target="_blank" rel="noopener noreferrer">
                  {file.name}
                </a>
                <button
                  type="button"
                  onClick={() => removeFile(file.link)}
                  className="btn btn-danger btn-sm"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="col-md-6">
          <label className="form-label">Anesthésiste(s):</label>
          <input
            type="text"
            value={formData.anesthesists}
            onChange={(e) => setFormData(prev => ({ ...prev, anesthesists: e.target.value }))}
            className="form-control"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Chirurgien(s):</label>
          <input
            type="text"
            value={formData.surgeons}
            onChange={(e) => setFormData(prev => ({ ...prev, surgeons: e.target.value }))}
            className="form-control"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Diagnostic:</label>
          <input
            type="text"
            value={formData.diagnosis}
            onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
            className="form-control"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Indication Opératoire:</label>
          <input
            type="text"
            value={formData.operativeIndication}
            onChange={(e) => setFormData(prev => ({ ...prev, operativeIndication: e.target.value }))}
            className="form-control"
          />
        </div>

        <div className="col-md-6">
          <Form.Label>Patient</Form.Label>
          <Form.Control
            as="select"
            value={fichierInfo.patientId}
            onChange={(e) => setFichierInfo({...fichierInfo, patientId: e.target.value})}
            required
          >
            <option value="">Sélectionner un patient</option>
            {validatedPatients.map(patient => (
              <option key={patient._id} value={patient._id}>
                {patient.dossierNumber}- {patient.nom} - {patient.diagnostic} - Age: {formatDate(patient.age)}-{patient.sexe} - Tel: {patient.numeroDeTelephone}
              </option>
            ))}
          </Form.Control>
        </div>

        <div className="col-12">
          <button
            type="submit"
            className="btn btn-success w-100"
          >
            {isEditing ? 'Mettre à jour' : 'Enregistrer'}
          </button>
        </div>
      </form>

      <div className="mt-5">
        <h2 className="h4 mb-4">Enregistrements</h2>
        <div className="row">
          {savedRecords.map(record => (
            <div key={record.id} className="col-sm-12 col-md-6 col-lg-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <p><strong>Type de commentaire:</strong>
                  {record.commentType === 'Autre' ? record.customComment : record.commentType}</p>
                  <p><strong>Anesthésiste(s):</strong> {record.anesthesists}</p>
                  <p><strong>Chirurgien(s):</strong> {record.surgeons}</p>
                  <p><strong>Diagnostic:</strong> {record.diagnosis}</p>
                  <p><strong>Indication Opératoire:</strong> {record.operativeIndication}</p>
                  <p><strong>Fichiers:</strong></p>
                  <div className="mt-2">
                    {record.files.map(file => (
                      <div key={file.link} className="d-flex justify-content-between align-items-center">
                        <a href={file.link} target="_blank" rel="noopener noreferrer">
                          {file.name}
                        </a>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <button type="button" className="btn btn-primary" onClick={() => editRecord(record)}>
                      Modifier
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => deleteRecord(record.id)}>
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SurgicalForm;
