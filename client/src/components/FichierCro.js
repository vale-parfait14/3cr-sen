import React, { useState, useEffect } from 'react';
import DropboxChooser from 'react-dropbox-chooser';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';

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
  const backgroundColors = [
    '#f0f7ff', '#fff0f0', '#f0fff0', '#fff0ff', '#fffff0', '#f0ffff'
  ];

  const getBackgroundColor = (index) => {
    return backgroundColors[index % backgroundColors.length];
  };

  const [formData, setFormData] = useState({
    commentType: 'Normal',
    customComment: '',
    cro: [],
    anesthesists: '',
    surgeons: '',
    diagnosis: '',
    operativeIndication: '',
    patientId: ''
  });

  const [savedRecords, setSavedRecords] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [validatedPatients, setValidatedPatients] = useState([]);
  const [cros, setCros] = useState([]);
  const [filteredCros, setFilteredCros] = useState([]);
  const [croVisibility, setCroVisibility] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const userService = localStorage.getItem('userService');
  console.log('Service utilisateur:', userService);

  const commentTypes = ['Normal', 'Mission Canadienne', 'Mission Suisse', 'Autre'];

  // Récupérer les fichiers des patients depuis Firestore
  useEffect(() => {
    const fetchCros = async () => {
      try {
        const crosRef = collection(db, 'cros');
        const q = query(crosRef, where('service', '==', userService));
        const querySnapshot = await getDocs(q);
        const crosData = querySnapshot.docs.map(doc => ({
          _id: doc.id,
          ...doc.data()
        }));
        setCros(crosData);
      } catch (error) {
        console.error('Erreur lors du chargement des cros', error);
      }
    };

    fetchCros();
  }, [userService]);

  // Récupérer les patients validés
  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientsRef = collection(db, 'patients');
        const q = query(patientsRef, 
          where('validation', '==', 'Validé'),
          where('services', '==', userService)
        );
        const validatedPatientsSnapshot = await getDocs(q);
        const validatedPatientsData = validatedPatientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Patients validés:', validatedPatientsData);
        setValidatedPatients(validatedPatientsData);
      } catch (error) {
        console.error('Erreur lors de la récupération des patients validés:', error);
      }
    };

    fetchData();
  }, [userService]);

  const handleDropboxSuccess = (files) => {
    setFormData(prev => ({
      ...prev,
      cro: [...prev.cro, ...files]
    }));
  };

  const removeCro = (linkToRemove) => {
    setFormData(prev => ({
      ...prev,
      cro: prev.cro.filter(file => file.link !== linkToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
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
        const newRecordRef = await addDoc(collection(db, "surgicalForms"), {
          ...formData,
          service: userService,
          createdAt: new Date().toISOString()
        });
        setSavedRecords(prev => [...prev, { ...formData, id: newRecordRef.id }]);
      }
      setFormData({
        commentType: 'Normal',
        customComment: '',
        cro: [],
        anesthesists: '',
        surgeons: '',
        diagnosis: '',
        operativeIndication: '',
        patientId: ''
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du formulaire:', error);
    }
  };

  const editRecord = (record) => {
    setFormData(record);
    setIsEditing(true);
    setEditingId(record.id);
  };

  const deleteRecord = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
      try {
        await deleteDoc(doc(db, "surgicalForms", id));
        setSavedRecords(prev => prev.filter(record => record.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'enregistrement:', error);
      }
    }
  };

  const toggleCrosVisibility = (id) => {
    setCroVisibility(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filtrer et rechercher dans les cros
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCros(cros);
      return;
    }

    const searchResults = cros.filter(cro => {
      const patient = validatedPatients.find(p => p.id === cro.patientId);
      const searchString = `
        ${patient?.dossierNumber.toLowerCase()}
        ${cro.ordre.toLowerCase()}
        ${patient?.nom.toLowerCase()}
        ${patient?.sexe.toLowerCase()}
        ${patient?.diagnostic.toLowerCase()}
        ${patient?.numeroDeTelephone}
        ${new Date(cro.datePatient).toLocaleDateString().toLowerCase()}
      `;
      return searchString.includes(searchTerm.toLowerCase());
    });

    setFilteredCros(searchResults);
  }, [searchTerm, cros, validatedPatients]);

  return (
    <div className="container-fluid p-4">
      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Patient validé:</label>
          <select
            className="form-select"
            value={formData.patientId}
            onChange={(e) => {
              console.log('ID du patient sélectionné:', e.target.value);
              const selectedPatient = validatedPatients.find(p => p.id === e.target.value);
              if (selectedPatient) {
                setFormData(prev => ({
                  ...prev,
                  patientId: selectedPatient.id,
                  diagnosis: selectedPatient.diagnostic || ''
                }));
              }
            }}
            required
          >
            <option value="">Sélectionner un patient</option>
            {validatedPatients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.dossierNumber} - {patient.nom} - {patient.diagnostic}
              </option>
            ))}
          </select>
        </div>

        {/* Autres champs du formulaire... */}

        <div className="col-md-6">
          <label className="form-label">Cros:</label>
          <DropboxChooser
            appKey="gmhp5s9h3aup35v"
            success={handleDropboxSuccess}
            cancel={() => console.log('Annulé')}
            multiselect={true}
          >
            <button type="button" className="btn btn-primary w-100">
              Choisir des cros
            </button>
          </DropboxChooser>
          <div className="mt-2">
            {formData.cro.map(cro => (
              <div key={cro.link} className="d-flex justify-content-between align-items-center">
                <a href={cro.link} target="_blank" rel="noopener noreferrer">
                  {cro.name}
                </a>
                <button
                  type="button"
                  onClick={() => removeCro(cro.link)}
                  className="btn btn-danger btn-sm"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-success w-100">
            {isEditing ? 'Mettre à jour' : 'Enregistrer'}
          </button>
        </div>
      </form>

      <div className="mt-5">
        <h2 className="mb-3">Dossiers Chirurgicaux</h2>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Rechercher par numéro, ordre, nom, etc."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Numéro Dossier</th>
              <th>Ordre</th>
              <th>Nom</th>
              <th>Sexe</th>
              <th>Diagnostic</th>
              <th>Date Patient</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCros.map(cro => {
              const patient = validatedPatients.find(p => p.id === cro.patientId);
              return (
                <tr key={cro._id} style={{ backgroundColor: getBackgroundColor(cro.ordre) }}>
                  <td>{patient?.dossierNumber}</td>
                  <td>{cro.ordre}</td>
                  <td>{patient?.nom}</td>
                  <td>{patient?.sexe}</td>
                  <td>{patient?.diagnostic}</td>
                  <td>{new Date(cro.datePatient).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-warning"
                      onClick={() => editRecord(cro)}
                    >
                      Éditer
                    </button>
                    <button
                      className="btn btn-danger ms-2"
                      onClick={() => deleteRecord(cro._id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SurgicalForm;
