import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import DropboxChooser from 'react-dropbox-chooser';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';

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

const PatientSolvable = ({ patients }) => {
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fichierInfo, setFichierInfo] = useState({
    patientId: '',
    ordre: '',
    datePatient: '',
    statut: 'Validé',
    commentaire: 'Normal',
    dropboxLinks: [],
    anesthesistes: '',
    responsablesCEC: '',
    instrumentistes: '',
    indicationOperatoire: '',
  });
  const [fichiers, setFichiers] = useState([]);
  const userService = localStorage.getItem('userService');
  const [userRole] = useState(localStorage.getItem("userRole"));
  const [userAccessLevel] = useState(localStorage.getItem("userAccessLevel"));

  const validatedPatients = patients.filter(patient => 
    patient.validation === 'Validé' && patient.services === userService
  );

  const filteredFichiers = fichiers.filter(fichier => {
    const patient = patients.find(p => p._id === fichier.patientId);
    const searchString = searchTerm.toLowerCase();
    
    return (
      patient?.dossierNumber?.toLowerCase().includes(searchString) ||
      patient?.nom?.toLowerCase().includes(searchString) ||
      patient?.diagnostic?.toLowerCase().includes(searchString) ||
      patient?.sexe?.toLowerCase().includes(searchString) ||
      patient?.numeroDeTelephone?.toLowerCase().includes(searchString) ||
      fichier.ordre?.toLowerCase().includes(searchString) ||
      fichier.datePatient?.toLowerCase().includes(searchString)
    );
  });

  useEffect(() => {
    const fetchFichiers = async () => {
      try {
        const fichiersRef = collection(db, 'fichiers');
        const q = query(fichiersRef, where('service', '==', userService));
        const querySnapshot = await getDocs(q);
        const fichiersData = querySnapshot.docs.map(doc => ({
          _id: doc.id,
          ...doc.data()
        }));
        setFichiers(fichiersData);
      } catch (error) {
        toast.error('Erreur lors du chargement des patients');
      }
    };

    fetchFichiers();
    const intervalId = setInterval(fetchFichiers, 5000);
    return () => clearInterval(intervalId);
  }, [userService]);

  const handleEdit = (fichier) => {
    setEditing(fichier._id);
    setFichierInfo({
      patientId: fichier.patientId,
      ordre: fichier.ordre,
      datePatient: fichier.datePatient,
      statut: fichier.statut,
      commentaire: fichier.commentaire || 'Normal',
      dropboxLinks: fichier.dropboxLinks || [],
      anesthesistes: fichier.anesthesistes || '',
      responsablesCEC: fichier.responsablesCEC || '',
      instrumentistes: fichier.instrumentistes || '',
      indicationOperatoire: fichier.indicationOperatoire || '',
    });
  };

  const handleDropboxSuccess = (files) => {
    const links = files.map(file => ({
      link: file.link,
      name: file.name
    }));
    setFichierInfo(prev => ({
      ...prev,
      dropboxLinks: [...prev.dropboxLinks, ...links]
    }));
    toast.success(`${files.length} document(s) sélectionné(s) avec succès`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      handleUpdate(e);
      return;
    }
    try {
      const docRef = await addDoc(collection(db, 'fichiers'), {
        ...fichierInfo,
        service: userService,
        createdAt: new Date().toISOString()
      });
      setFichiers([...fichiers, { _id: docRef.id, ...fichierInfo, service: userService }]);
      resetForm();
      toast.success('Patient et documents enregistrés avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const fichierRef = doc(db, 'fichiers', editing);
      await updateDoc(fichierRef, {
        ...fichierInfo,
        service: userService,
        updatedAt: new Date().toISOString()
      });
      setFichiers(fichiers.map(p => p._id === editing ? {...p, ...fichierInfo} : p));
      setEditing(null);
      resetForm();
      toast.success('Patient et documents modifiés avec succès');
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  const handleDelete = async (fichierId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce patient et ses documents associés ?')) {
      try {
        await deleteDoc(doc(db, 'fichiers', fichierId));
        setFichiers(fichiers.filter(fichier => fichier._id !== fichierId));
        if (editing === fichierId) {
          resetForm();
          setEditing(null);
        }
        toast.success('Patient et documents supprimés avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFichierInfo({
      patientId: '',
      ordre: '',
      datePatient: '',
      statut: 'Validé',
      commentaire: 'Normal',
      dropboxLinks: [],
      anesthesistes: '',
      responsablesCEC: '',
      instrumentistes: '',
      indicationOperatoire: '',
    });
    setEditing(null);
  };

  const removeDocument = (index) => {
    setFichierInfo(prev => ({
      ...prev,
      dropboxLinks: prev.dropboxLinks.filter((_, i) => i !== index)
    }));
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <Container>
      <Row className="my-4">
        <Col md={12} lg={8} className="mx-auto">
          <h2 className="text-center">Gestion des documents patients</h2>
          <Form onSubmit={handleSubmit}>
            {/* Patient Selection */}
            <Form.Group>
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
                    {patient.dossierNumber} - {patient.nom} - {patient.diagnostic}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            {/* Additional Patient Details */}
            <Form.Group>
              <Form.Label>Date de naissance</Form.Label>
              <Form.Control
                type="date"
                value={fichierInfo.datePatient}
                onChange={(e) => setFichierInfo({...fichierInfo, datePatient: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Sexe</Form.Label>
              <Form.Control
                type="text"
                value={fichierInfo.sexe}
                onChange={(e) => setFichierInfo({...fichierInfo, sexe: e.target.value})}
              />
            </Form.Group>
            {/* Continue adding other fields as necessary */}
            <Button type="submit" className="w-100">Enregistrer</Button>
          </Form>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <h3>Liste des fichiers</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date de naissance</th>
                <th>Documents</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFichiers.map(fichier => {
                const patient = patients.find(p => p._id === fichier.patientId);
                return (
                  <tr key={fichier._id}>
                    <td>{patient?.nom}</td>
                    <td>{formatDate(fichier.datePatient)}</td>
                    <td>
                      {fichier.dropboxLinks.length > 0 && (
                        <Button variant="link" onClick={() => {}}>
                          {fichier.dropboxLinks.length} fichier(s)
                        </Button>
                      )}
                    </td>
                    <td>
                      <Button variant="info" onClick={() => handleEdit(fichier)}>Modifier</Button>
                      <Button variant="danger" onClick={() => handleDelete(fichier._id)}>Supprimer</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default PatientSolvable;
