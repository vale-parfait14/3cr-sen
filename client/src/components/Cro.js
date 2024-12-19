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

const PatientSolvable = ({ patients = [] }) => {
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fichierInfo, setFichierInfo] = useState({
    patientId: '',
    ordre: '',
    datePatient: '',
    statut: 'Validé',
    dropboxLinks: [],
    genre: '',
    groupeSanguin: '',
    age: '',
    numeroDeTelephone: '',
    addressDomicile: ''
  });
  const [fichiers, setFichiers] = useState([]);
  const userService = localStorage.getItem('userService');
  const [userRole] = useState(localStorage.getItem("userRole"));
  const [userAccessLevel] = useState(localStorage.getItem("userAccessLevel"));

  const validatedPatients = (patients || []).filter(patient =>
    patient.validation === 'Validé' && patient.services === userService
  );

  const filteredFichiers = (fichiers || []).filter(fichier => {
    const patient = (patients && patients.find(p => p._id === fichier.patientId)) || null;
    const searchString = searchTerm.toLowerCase();
    return (
      patient &&
      (patient.dossierNumber?.toLowerCase().includes(searchString) ||
      patient.nom?.toLowerCase().includes(searchString) ||
      patient.diagnostic?.toLowerCase().includes(searchString) ||
      patient.sexe?.toLowerCase().includes(searchString) ||
      patient.numeroDeTelephone?.toLowerCase().includes(searchString) ||
      fichier.ordre?.toLowerCase().includes(searchString) ||
      fichier.datePatient?.toLowerCase().includes(searchString)
    ));
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
      dropboxLinks: fichier.dropboxLinks || [],
      genre: fichier.genre || '',
      groupeSanguin: fichier.groupeSanguin || '',
      age: fichier.age || '',
      numeroDeTelephone: fichier.numeroDeTelephone || '',
      addressDomicile: fichier.addressDomicile || ''
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
      setFichiers(fichiers.map(p => p._id === editing ? { ...p, ...fichierInfo } : p));
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
      dropboxLinks: [],
      genre: '',
      groupeSanguin: '',
      age: '',
      numeroDeTelephone: '',
      addressDomicile: ''
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
    const data = (fichiers || []).map(fichier => {
      const patient = (patients || []).find(p => p._id === fichier.patientId);
      return {
        'Numéro de dossier': patient?.dossierNumber,
        'Résumé': fichier.ordre,
        'Patient': patient?.nom,
        'Sexe': patient?.sexe,
        'Groupe sanguin': patient?.groupeSanguin,
        'Age': patient?.age,
        'Téléphone': patient?.numeroDeTelephone,
        'Adresse': patient?.addressDomicile,
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
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <Container>
      <Row className="my-4">
        <Col md={12} lg={8} className="mx-auto">
          <h2 className="text-center">Gestion des documents patients</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Patient</Form.Label>
              <Form.Control
                as="select"
                value={fichierInfo.patientId}
                onChange={(e) => setFichierInfo({ ...fichierInfo, patientId: e.target.value })}
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

            {/* Ajouter les champs supplémentaires */}
            <Form.Group>
              <Form.Label>Genre</Form.Label>
              <Form.Control
                type="text"
                value={fichierInfo.genre}
                onChange={(e) => setFichierInfo({ ...fichierInfo, genre: e.target.value })}
                placeholder="Genre"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Groupe sanguin</Form.Label>
              <Form.Control
                type="text"
                value={fichierInfo.groupeSanguin}
                onChange={(e) => setFichierInfo({ ...fichierInfo, groupeSanguin: e.target.value })}
                placeholder="Groupe sanguin"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Âge</Form.Label>
              <Form.Control
                type="number"
                value={fichierInfo.age}
                onChange={(e) => setFichierInfo({ ...fichierInfo, age: e.target.value })}
                placeholder="Âge"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Téléphone</Form.Label>
              <Form.Control
                type="text"
                value={fichierInfo.numeroDeTelephone}
                onChange={(e) => setFichierInfo({ ...fichierInfo, numeroDeTelephone: e.target.value })}
                placeholder="Téléphone"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Adresse</Form.Label>
              <Form.Control
                type="text"
                value={fichierInfo.addressDomicile}
                onChange={(e) => setFichierInfo({ ...fichierInfo, addressDomicile: e.target.value })}
                placeholder="Adresse"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Ordre</Form.Label>
              <Form.Control
                type="text"
                value={fichierInfo.ordre}
                onChange={(e) => setFichierInfo({ ...fichierInfo, ordre: e.target.value })}
                placeholder="Ordre"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Date du patient</Form.Label>
              <Form.Control
                type="date"
                value={fichierInfo.datePatient}
                onChange={(e) => setFichierInfo({ ...fichierInfo, datePatient: e.target.value })}
                required
              />
            </Form.Group>

            {/* Ajout des documents Dropbox */}
            <DropboxChooser
              appKey="YOUR_APP_KEY"
              success={handleDropboxSuccess}
              cancel={() => toast.info('Annulation de la sélection')}
            >
              <Button className="my-3">Sélectionner des documents Dropbox</Button>
            </DropboxChooser>

            {/* Affichage des liens Dropbox sélectionnés */}
            <ul>
              {fichierInfo.dropboxLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.link} target="_blank" rel="noopener noreferrer">{link.name}</a>
                  <Button variant="danger" size="sm" onClick={() => removeDocument(index)} className="ml-2">
                    Supprimer
                  </Button>
                </li>
              ))}
            </ul>

            <Button type="submit" variant="primary" className="mt-4">
              {editing ? 'Modifier' : 'Ajouter'} le fichier
            </Button>
          </Form>

          {/* Table pour l'affichage des fichiers */}
          <h3 className="my-4">Liste des fichiers</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Nom du patient</th>
                <th>Ordre</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFichiers.map(fichier => {
                const patient = (patients || []).find(p => p._id === fichier.patientId);
                return (
                  <tr key={fichier._id}>
                    <td>{patient?.nom}</td>
                    <td>{fichier.ordre}</td>
                    <td>{formatDate(fichier.datePatient)}</td>
                    <td>
                      <Button variant="warning" onClick={() => handleEdit(fichier)}>
                        Modifier
                      </Button>
                      <Button variant="danger" onClick={() => handleDelete(fichier._id)} className="ml-2">
                        Supprimer
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <Button variant="secondary" onClick={exportToExcel}>Exporter en Excel</Button>
        </Col>
      </Row>
    </Container>
  );
};

export default PatientSolvable;
