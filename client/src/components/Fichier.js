import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import DropboxChooser from 'react-dropbox-chooser';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';

// Initialisation de Firebase
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
  const [fichierInfo, setFichierInfo] = useState({
    patientId: '',
    ordre: '',
    datePatient: '',
    statut: 'Validé',
    dropboxLinks: []
  });
  const [fichiers, setFichiers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // État pour la recherche
  const userService = localStorage.getItem('userService');
  const [userRole] = useState(localStorage.getItem("userRole"));
  const [userAccessLevel] = useState(localStorage.getItem("userAccessLevel"));

  const validatedPatients = patients.filter(patient =>
    patient.validation === 'Validé' && patient.services === userService
  );

  // Fonction pour filtrer les fichiers en fonction de la recherche
  const filteredFichiers = fichiers.filter(fichier => {
    const patient = patients.find(p => p._id === fichier.patientId);
    if (!patient) return false;
    return (
      patient.dossierNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.diagnostic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fichier.ordre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatDate(fichier.datePatient).toLowerCase().includes(searchTerm.toLowerCase())
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
      dropboxLinks: fichier.dropboxLinks || []
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

      setFichiers(fichiers.map(p =>
        p._id === editing ? { ...p, ...fichierInfo } : p
      ));
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
      dropboxLinks: []
    });
    setEditing(null);
  };

  const removeDocument = (index) => {
    setFichierInfo(prev => ({
      ...prev,
      dropboxLinks: prev.dropboxLinks.filter((_, i) => i !== index)
    }));
  };

  const exportToExcel = () => {
    const data = fichiers.map(fichier => {
      const patient = patients.find(p => p._id === fichier.patientId);
      return {
        'Numéro de dossier': patient?.dossierNumber,
        'Résumé': fichier.ordre,
        'Patient': patient?.nom,
        'Sexe': patient?.sexe,
        'Diagnostic': patient?.diagnostic,
        'Age': formatDate(patient?.age),
        'Téléphone': patient?.numeroDeTelephone,
        'Date': formatDate(fichier.datePatient),
        'Nombre de documents': fichier.dropboxLinks?.length || 0
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Patients");
    XLSX.writeFile(wb, "Patients.xlsx");
  };

  const formatDate = (dateString) => {
    const options = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <Container>
      <Row className="my-4">
        <Col md={12} lg={8} className="mx-auto">
          <h2 className="text-center">Gestion des documents patients</h2>

          {/* Champ de recherche */}
          <Form.Group>
            <Form.Label>Recherche</Form.Label>
            <Form.Control
              type="text"
              placeholder="Rechercher par numéro de dossier, nom, diagnostic, résumé, etc."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>

          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Patient</Form.Label>
              <Form.Control
                as="select"
                value={fichierInfo.patientId}
                onChange={(e) => setFichierInfo({ ...fichierInfo, patientId: e.target.value })}
              >
                <option value="">Sélectionner un patient</option>
                {validatedPatients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.nom} - {patient.dossierNumber}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group>
              <Form.Label>Résumé</Form.Label>
              <Form.Control
                type="text"
                value={fichierInfo.ordre}
                onChange={(e) => setFichierInfo({ ...fichierInfo, ordre: e.target.value })}
                placeholder="Résumé"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={fichierInfo.datePatient}
                onChange={(e) => setFichierInfo({ ...fichierInfo, datePatient: e.target.value })}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Documents Dropbox</Form.Label>
              <DropboxChooser
                appKey="4jt0w13onhpd8uk"
                success={handleDropboxSuccess}
                cancel={() => toast.info('Annulé')}
              >
                <Button variant="secondary">Choisir des fichiers</Button>
              </DropboxChooser>
              <ul>
                {fichierInfo.dropboxLinks.map((doc, index) => (
                  <li key={index}>
                    <a href={doc.link} target="_blank" rel="noopener noreferrer">{doc.name}</a>
                    <Button variant="danger" size="sm" onClick={() => removeDocument(index)}>Supprimer</Button>
                  </li>
                ))}
              </ul>
            </Form.Group>

            <Button type="submit">{editing ? 'Modifier' : 'Ajouter'} Fichier</Button>
          </Form>
        </Col>
      </Row>

      {/* Tableau des fichiers */}
      <Row className="my-4">
        <Col md={12} lg={12}>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Dossier</th>
                <th>Résumé</th>
                <th>Patient</th>
                <th>Documents</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFichiers.map((fichier) => {
                const patient = patients.find(p => p._id === fichier.patientId);
                return (
                  <tr key={fichier._id}>
                    <td>{patient?.dossierNumber}</td>
                    <td>{fichier.ordre}</td>
                    <td>{patient?.nom}</td>
                    <td>
                      {fichier.dropboxLinks?.map((doc, index) => (
                        <div key={index}>
                          <a href={doc.link} target="_blank" rel="noopener noreferrer">
                            {doc.name || `Document ${index + 1}`}
                          </a>
                        </div>
                      ))}
                    </td>
                    <td>{formatDate(fichier.datePatient)}</td>
                    <td>
                      <Button variant="warning" size="sm" onClick={() => handleEdit(fichier)}>
                        Modifier
                      </Button>{' '}
                      <Button variant="danger" size="sm" onClick={() => handleDelete(fichier._id)}>
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

export default PatientSolvable;
