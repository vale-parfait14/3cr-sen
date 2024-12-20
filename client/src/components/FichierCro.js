import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
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

const Opera = ({ patients }) => {
  const [croInfo, setCroInfo] = useState({
    patientId: '',
    ordre: '',
    datePatient: '',
    statut: 'Validé',
    dropboxLinks: [] // Changer de "dropboxLink" à "dropboxLinks" pour gérer plusieurs fichiers
  });

  const [cros, setCros] = useState([]);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCros, setFilteredCros] = useState([]);
  const [fileVisibility, setFileVisibility] = useState({});

  const userService = localStorage.getItem('userService');
  const userRole = localStorage.getItem("userRole");
  const userAccessLevel = localStorage.getItem("userAccessLevel");

  const validatedPatients = patients.filter(patient =>
    patient.validation === 'Validé' && patient.services === userService
  );

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
        toast.error('Erreur lors du chargement des patients');
      }
    };

    fetchCros();
    const intervalId = setInterval(fetchCros, 5000);
    return () => clearInterval(intervalId);
  }, [userService]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredCros(cros);
      return;
    }

    const searchResults = cros.filter(cro => {
      const patient = patients.find(p => p._id === cro.patientId);
      const searchString = `
        ${patient?.dossierNumber.toLowerCase()}
        ${cro.ordre.toLowerCase()}
        ${patient?.nom.toLowerCase()}
        ${patient?.diagnostic.toLowerCase()}
        ${formatDate(cro.datePatient).toLowerCase()}
      `;
      return searchString.includes(searchTerm.toLowerCase());
    });

    setFilteredCros(searchResults);
  }, [searchTerm, cros, patients]);

  const handleDropboxSuccess = (files) => {
    const links = files.map(file => file.link); // Récupérer tous les liens
    setCroInfo(prev => ({
      ...prev,
      dropboxLinks: [...prev.dropboxLinks, ...links] // Ajouter les nouveaux liens à la liste existante
    }));
    toast.success('Documents Dropbox sélectionnés avec succès');
  };

  const handleEdit = (cro) => {
    setEditing(cro._id);
    setCroInfo({
      patientId: cro.patientId,
      ordre: cro.ordre,
      datePatient: cro.datePatient,
      statut: cro.statut,
      dropboxLinks: cro.dropboxLinks || [] // Assurez-vous que `dropboxLinks` est bien un tableau
    });
  };

  const handleDelete = async (croId) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce document ?')) {
      try {
        await deleteDoc(doc(db, 'cros', croId));
        setCros(cros.filter(f => f._id !== croId));
        toast.success('Document supprimé avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editing) {
        await updateDoc(doc(db, 'cros', editing), {
          ...croInfo,
          service: userService
        });
        
        setCros(cros.map(p => 
          p._id === editing ? {...p, ...croInfo} : p
        ));
        
        setEditing(null);
      } else {
        const docRef = await addDoc(collection(db, 'cros'), {
          ...croInfo,
          service: userService
        });

        setCros([...cros, {
          _id: docRef.id,
          ...croInfo,
          service: userService
        }]);
      }

      setCroInfo({
        patientId: '',
        ordre: '',
        datePatient: '',
        statut: 'Validé',
        dropboxLinks: []
      });
      
      toast.success(editing ? 'Document modifié avec succès' : 'Document ajouté avec succès');
    } catch (error) {
      toast.error('Une erreur est survenue');
    }
  };

  const toggleFilesVisibility = (id) => {
    setFileVisibility(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const exportToExcel = () => {
    const data = cros.map(cro => {
      const patient = patients.find(p => p._id === cro.patientId);
      return {
        'Numéro de dossier': patient?.dossierNumber,
        'Résumé': cro.ordre,
        'Patient': patient?.nom,
        'Diagnostic': patient?.diagnostic,
        'Âge': patient?.age,
        'Genre': patient?.genre,
        'Groupe sanguin': patient?.groupeSanguin,
        'Numéro de téléphone': patient?.numeroDeTelephone,
        'Adresse domicile': patient?.addressDomicile,
        'Date': formatDate(cro.datePatient)
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

  // Fonction pour supprimer un fichier de la liste
  const handleRemoveFile = (link) => {
    setCroInfo(prev => ({
      ...prev,
      dropboxLinks: prev.dropboxLinks.filter(fileLink => fileLink !== link)
    }));
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col md={8} className="mx-auto">
          <Card>
            <Card.Body>
              <h3 className="text-center mb-4">
                {editing ? 'Modifier un document' : 'Ajouter un document'}
              </h3>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Patient</Form.Label>
                  <Form.Select
                    value={croInfo.patientId}
                    onChange={(e) => setCroInfo(prev => ({...prev, patientId: e.target.value}))}
                    required
                  >
                    <option value="">Sélectionner un patient</option>
                    {validatedPatients.map(patient => (
                      <option key={patient._id} value={patient._id}>
                        {patient.dossierNumber} - {patient.nom} - {patient.diagnostic}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Résumé</Form.Label>
                  <Form.Control
                    type="text"
                    value={croInfo.ordre}
                    onChange={(e) => setCroInfo(prev => ({...prev, ordre: e.target.value}))}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={croInfo.datePatient}
                    onChange={(e) => setCroInfo(prev => ({...prev, datePatient: e.target.value}))}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Fichiers Dropbox</Form.Label>
                  <DropboxChooser
                    appKey="gmhp5s9h3aup35v"
                    success={handleDropboxSuccess}
                    cancel={() => toast.info('Sélection de fichiers annulée')}
                    multiselect={true}
                  >
                    <Button variant="outline-primary" className="w-100">
                      Choisir plusieurs fichiers
                    </Button>
                  </DropboxChooser>

                  {croInfo.dropboxLinks.length > 0 && (
                    <div className="mt-2">
                      {croInfo.dropboxLinks.map((link, index) => (
                        <div key={index} className="mb-2 d-flex justify-content-between align-items-center">
                          <a href={link} target="_blank" rel="noopener noreferrer">
                            Fichier {index + 1}
                          </a>
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleRemoveFile(link)}
                          >
                            Supprimer
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  {editing ? 'Mettre à jour' : 'Enregistrer'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0">Liste des Documents</h3>
                <Button variant="success" onClick={exportToExcel}>
                  Exporter en Excel
                </Button>
              </div>

              <Form.Control
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
              />

              <Row>
                {filteredCros.map(cro => {
                  const patient = patients.find(p => p._id === cro.patientId);
                  return (
                    <Col key={cro._id} md={6} lg={4} className="mb-3">
                      <Card>
                        <Card.Body>
                          <h5>Dossier N° {patient?.dossierNumber}</h5>
                          <p><strong>Patient:</strong> {patient?.nom}</p>
                          <p><strong>Résumé:</strong> {cro.ordre}</p>
                          <p><strong>Diagnostic:</strong> {patient?.diagnostic}</p>
                          <p><strong>Âge:</strong> {patient?.age}</p>
                          <p><strong>Genre:</strong> {patient?.genre}</p>
                          <p><strong>Groupe sanguin:</strong> {patient?.groupeSanguin}</p>
                          <p><strong>Numéro de téléphone:</strong> {patient?.numeroDeTelephone}</p>
                          <p><strong>Adresse domicile:</strong> {patient?.addressDomicile}</p>
                          <p><strong>Date:</strong> {formatDate(cro.datePatient)}</p>

                          {cro.dropboxLinks?.map((link, index) => (
                            <Button 
                              key={index}
                              variant="link" 
                              href={link}
                              target="_blank"
                              className="mb-3"
                            >
                              Voir le document {index + 1}
                            </Button>
                          ))}
                          <div className="d-flex justify-content-between">
                            <Button 
                              variant="warning" 
                              size="sm"
                              onClick={() => handleEdit(cro)}
                            >
                              Modifier
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleDelete(cro._id)}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Opera;
