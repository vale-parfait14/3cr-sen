import React, { useState, useEffect } from 'react';
import DropboxChooser from 'react-dropbox-chooser';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';

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
    patientId: '',
    commentType: 'Normal',
    customComment: '',
    files: [],
    anesthesists: '',
    surgeons: '',
    diagnosis: '',
    operativeIndication: '',
    dropboxLink: ''
  });

  const [patients, setPatients] = useState([]);
  const [savedRecords, setSavedRecords] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecords, setFilteredRecords] = useState([]);
  const userService = localStorage.getItem('userService');
  const userRole = localStorage.getItem('userRole');
  const userAccessLevel = localStorage.getItem('userAccessLevel');

  const commentTypes = ['Normal', 'Mission Canadienne', 'Mission Suisse', 'Autre'];

  useEffect(() => {
    fetchPatients();
    fetchSurgicalRecords();
  }, [userService]);

  useEffect(() => {
    filterRecords();
  }, [searchTerm, savedRecords]);

  const fetchPatients = async () => {
    try {
      const patientsRef = collection(db, 'patients');
      const q = query(patientsRef, where('validation', '==', 'Validé'), where('services', '==', userService));
      const querySnapshot = await getDocs(q);
      const patientsData = querySnapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
      setPatients(patientsData);
    } catch (error) {
      toast.error('Erreur lors du chargement des patients');
    }
  };

  const fetchSurgicalRecords = async () => {
    try {
      const recordsRef = collection(db, 'surgicalRecords');
      const q = query(recordsRef, where('service', '==', userService));
      const querySnapshot = await getDocs(q);
      const recordsData = querySnapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
      setSavedRecords(recordsData);
    } catch (error) {
      toast.error('Erreur lors du chargement des enregistrements');
    }
  };

  const filterRecords = () => {
    if (!searchTerm) {
      setFilteredRecords(savedRecords);
      return;
    }

    const filtered = savedRecords.filter(record => {
      const patient = patients.find(p => p._id === record.patientId);
      const searchString = `
        ${patient?.dossierNumber}
        ${patient?.nom}
        ${record.commentType}
        ${record.anesthesists}
        ${record.surgeons}
        ${record.diagnosis}
        ${record.operativeIndication}
      `.toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });
    setFilteredRecords(filtered);
  };

  const handleCommentTypeChange = (e) => {
    setFormData({
      ...formData,
      commentType: e.target.value,
      customComment: e.target.value === 'Autre' ? '' : formData.customComment
    });
  };

  const handleDropboxSuccess = (files) => {
    const link = files[0].link;
    setFormData({
      ...formData,
      dropboxLink: link,
      files: [...formData.files, ...files]
    });
    toast.success('Document Dropbox sélectionné avec succès');
  };

  const handleRemoveFile = (linkToRemove) => {
    setFormData({
      ...formData,
      files: formData.files.filter(file => file.link !== linkToRemove),
      dropboxLink: formData.dropboxLink === linkToRemove ? '' : formData.dropboxLink
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateDoc(doc(db, 'surgicalRecords', editIndex), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
        toast.success('Enregistrement modifié avec succès');
      } else {
        await addDoc(collection(db, 'surgicalRecords'), {
          ...formData,
          service: userService,
          createdAt: new Date().toISOString()
        });
        toast.success('Enregistrement effectué avec succès');
      }
      
      resetForm();
      fetchSurgicalRecords();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (record) => {
    setFormData(record);
    setIsEditing(true);
    setEditIndex(record._id);
  };

  const handleDelete = async (recordId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
      try {
        await deleteDoc(doc(db, 'surgicalRecords', recordId));
        toast.success('Enregistrement supprimé avec succès');
        fetchSurgicalRecords();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      commentType: 'Normal',
      customComment: '',
      files: [],
      anesthesists: '',
      surgeons: '',
      diagnosis: '',
      operativeIndication: '',
      dropboxLink: ''
    });
    setIsEditing(false);
    setEditIndex(null);
  };

  const exportToExcel = () => {
    const data = filteredRecords.map(record => {
      const patient = patients.find(p => p._id === record.patientId);
      return {
        'Numéro de dossier': patient?.dossierNumber,
        'Patient': patient?.nom,
        'Type de commentaire': record.commentType,
        'Commentaire': record.customComment,
        'Anesthésiste(s)': record.anesthesists,
        'Chirurgien(s)': record.surgeons,
        'Diagnostic': record.diagnosis,
        'Indication Opératoire': record.operativeIndication,
        'Date': formatDate(record.createdAt)
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Interventions");
    XLSX.writeFile(wb, "Interventions_Chirurgicales.xlsx");
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <Container>
      <Row className="my-4">
        <Col md={12} lg={8} className="mx-auto">
          <h2 className="text-center mb-4">Formulaire d'intervention chirurgicale</h2>
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Sélectionner un patient</Form.Label>
              <Form.Control
                as="select"
                value={formData.patientId}
                onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                required
              >
                <option value="">Sélectionner un patient</option>
                {patients.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.dossierNumber} - {patient.nom} - {patient.diagnostic} - 
                    Age: {formatDate(patient.age)} - {patient.sexe} - 
                    Tel: {patient.numeroDeTelephone}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type de commentaire</Form.Label>
              <Form.Control
                as="select"
                value={formData.commentType}
                onChange={handleCommentTypeChange}
                required
              >
                {commentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Form.Control>
            </Form.Group>

            {formData.commentType === 'Autre' && (
              <Form.Group className="mb-3">
                <Form.Label>Commentaire personnalisé</Form.Label>
                <Form.Control
                  as="textarea"
                  value={formData.customComment}
                  onChange={(e) => setFormData({...formData, customComment: e.target.value})}
                  required
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Anesthésiste(s)</Form.Label>
              <Form.Control
                type="text"
                value={formData.anesthesists}
                onChange={(e) => setFormData({...formData, anesthesists: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Chirurgien(s)</Form.Label>
              <Form.Control
                type="text"
                value={formData.surgeons}
                onChange={(e) => setFormData({...formData, surgeons: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Diagnostic</Form.Label>
              <Form.Control
                type="text"
                value={formData.diagnosis}
                onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Indication Opératoire</Form.Label>
              <Form.Control
                type="text"
                value={formData.operativeIndication}
                onChange={(e) => setFormData({...formData, operativeIndication: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Document (Dropbox)</Form.Label>
              <div>
                <DropboxChooser
                  appKey="gmhp5s9h3aup35v"
                  success={handleDropboxSuccess}
                  cancel={() => toast.info('Sélection annulée')}
                  multiselect={true}
                >
                  <Button variant="outline-primary" type="button">
                    Choisir un fichier depuis Dropbox
                  </Button>
                </DropboxChooser>
              </div>
              {formData.files.map((file, index) => (
                <div key={index} className="mt-2 d-flex align-items-center">
                  <a href={file.link} target="_blank" rel="noopener noreferrer" className="me-2">
                    {file.name}
                  </a>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRemoveFile(file.link)}
                  >
                    Supprimer
                  </Button>
                </div>
              ))}
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button variant="primary" type="submit">
                {isEditing ? 'Modifier' : 'Enregistrer'}
              </Button>
              {isEditing && (
                <Button variant="secondary" onClick={resetForm}>
                  Annuler
                </Button>
              )}
            </div>
          </Form>
        </Col>
      </Row>

      <Row className="mt-5">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Liste des interventions</h3>
            <Button variant="success" onClick={exportToExcel}>
              Exporter en Excel
            </Button>
          </div>

          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>

          <Table responsive striped bordered hover>
            <thead>
              <tr>
                <th>N° Dossier</th>
                <th>Patient</th>
                <th>Type</th>
                <th>Anesthésiste(s)</th>
                <th>Chirurgien(s)</th>
                <th>Diagnostic</th>
                <th>Indication</th>
                <th>Document</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => {
                const patient = patients.find(p => p._id === record.patientId);
                return (
                  <tr key={record._id}>
                    <td>{patient?.dossierNumber}</td>
                    <td>{patient?.nom}</td>
                    <td>{record.commentType}</td>
                    <td>{record.anesthesists}</td>
                    <td>{record.surgeons}</td>
                    <td>{record.diagnosis}</td>
                    <td>{record.operativeIndication}</td>
                    <td>
                      {record.dropboxLink && (
                        <a href={record.dropboxLink} target="_blank" rel="noopener noreferrer">
                          Voir
                        </a>
                      )}
                    </td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(record)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(record._id)}
                      >
                        Supprimer
                      </Button>
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

export default SurgicalForm;
