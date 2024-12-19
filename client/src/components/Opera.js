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

const PatientSolvable = ({ patients }) => {
  const [editing, setEditing] = useState(null);
  const [fichierInfo, setFichierInfo] = useState({
    patientId: '',
    ordre: '',
    datePatient: '',
    statut: 'Validé',
    dropboxLink: ''
  });

  const [fichiers, setFichiers] = useState([]);
  const userService = localStorage.getItem('userService');
  const [userRole] = useState(localStorage.getItem("userRole"));
  const [userAccessLevel] = useState(localStorage.getItem("userAccessLevel"));
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFichiers, setFilteredFichiers] = useState([]);
  const [dropboxLink, setDropboxLink] = useState('');

  const validatedPatients = patients.filter(patient =>
    patient.validation === 'Validé' && patient.services === userService
  );

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

  useEffect(() => {
    if (!searchTerm) {
      setFilteredFichiers(fichiers);
      return;
    }

    const searchResults = fichiers.filter(fichier => {
      const patient = patients.find(p => p._id === fichier.patientId);
      const searchString = `
        ${patient?.dossierNumber.toLowerCase()}
        ${fichier.ordre.toLowerCase()}
        ${patient?.nom.toLowerCase()}
        ${patient?.sexe.toLowerCase()}
        ${patient?.diagnostic.toLowerCase()}
        ${patient?.numeroDeTelephone}
        ${formatDate(fichier.datePatient).toLowerCase()}
      `;
      return searchString.includes(searchTerm.toLowerCase());
    });

    setFilteredFichiers(searchResults);
  }, [searchTerm, fichiers, patients]);

  const handleEdit = (fichier) => {
    setEditing(fichier._id);
    setFichierInfo({
      patientId: fichier.patientId,
      ordre: fichier.ordre,
      datePatient: fichier.datePatient,
      statut: fichier.statut
    });
  };

  const handleDropboxSuccess = (files) => {
    const link = files[0].link;
    setDropboxLink(link);
    setFichierInfo({ ...fichierInfo, dropboxLink: link });
    toast.success('Document Dropbox sélectionné avec succès');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      handleUpdate(e);
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'fichiers'), {
        patientId: fichierInfo.patientId,
        ordre: fichierInfo.ordre,
        datePatient: fichierInfo.datePatient,
        statut: fichierInfo.statut,
        service: userService,
        dropboxLink: dropboxLink
      });

      const newFichier = {
        _id: docRef.id,
        ...fichierInfo,
        service: userService,
        dropboxLink: dropboxLink
      };

      setFichiers([...fichiers, newFichier]);
      resetForm();
      toast.success('Patient et document enregistrés avec succès');
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
        dropboxLink: dropboxLink
      });

      setFichiers(fichiers.map(p =>
        p._id === editing ? {...p, ...fichierInfo, dropboxLink} : p
      ));
      resetForm();
      toast.success('Patient et document modifiés avec succès');
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  const handleDelete = async (fichierId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce patient et son document associé ?')) {
      try {
        await deleteDoc(doc(db, 'fichiers', fichierId));
        setFichiers(fichiers.filter(fichier => fichier._id !== fichierId));
        if (editing === fichierId) {
          resetForm();
        }
        toast.success('Patient et document supprimés avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFichierInfo({
      patientId: '',
      ordre: '',
      datePatient: '',
      statut: 'Validé',
      dropboxLink: ''
    });
    setDropboxLink('');
  };

  const exportToExcel = () => {
    const data = fichiers.map(fichier => {
      const patient = patients.find(p => p._id === fichier.patientId);
      return {
        Ordre: fichier.ordre,
        Patient: patient?.nom,
        Sexe: patient?.sexe,
        DossierNumber: patient?.dossierNumber,
        Diagnostic: patient?.diagnostic,
        Age: formatDate(patient?.age),
        Telephone: patient?.numeroDeTelephone,
        Date: formatDate(fichier.datePatient)
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

  const shouldShowAdminControls = () => {
    return !(localStorage.getItem("userName") === "Ad" ||
      (userRole === "Médecin" && userAccessLevel === "Affichage") ||
      (userRole === "Secrétaire" && userAccessLevel === "Affichage") ||
      // ... autres conditions de rôle
      (userRole === "Etudiant(e)" && userAccessLevel === "Administrateur"));
  };

  return (
    <Container fluid>
      <Row className="my-4">
        <Col md={12} lg={8} className="mx-auto">
          <Form onSubmit={handleSubmit} className="mb-4">
            <Card>
              <Card.Header>
                <h4 className="mb-0">Ajout des fichiers patients</h4>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Sélectionner un patient</Form.Label>
                  <Form.Select
                    value={fichierInfo.patientId}
                    onChange={(e) => setFichierInfo({...fichierInfo, patientId: e.target.value})}
                    required
                  >
                    <option value="">Sélectionner un patient</option>
                    {validatedPatients.map(patient => (
                      <option key={patient._id} value={patient._id}>
                        {`${patient.dossierNumber} - ${patient.nom} - ${patient.diagnostic}`}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Résumé ou titre</Form.Label>
                  <Form.Control
                    type="text"
                    value={fichierInfo.ordre}
                    onChange={(e) => setFichierInfo({...fichierInfo, ordre: e.target.value})}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Date du patient</Form.Label>
                  <Form.Control
                    type="date"
                    value={fichierInfo.datePatient}
                    onChange={(e) => setFichierInfo({...fichierInfo, datePatient: e.target.value})}
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
                      <Button variant="outline-primary">
                        Choisir un fichier depuis Dropbox
                      </Button>
                    </DropboxChooser>
                    {dropboxLink && (
                      <div className="mt-2">
                        <a href={dropboxLink} target="_blank" rel="noopener noreferrer">
                          Voir le document
                        </a>
                      </div>
                    )}
                  </div>
                </Form.Group>
              </Card.Body>
              <Card.Footer>
                <Button variant="primary" type="submit">
                  {editing ? 'Modifier' : 'Enregistrer'}
                </Button>
              </Card.Footer>
            </Card>
          </Form>
        </Col>
      </Row>

      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>Liste des Patients et Documents</h3>
            <div className="d-flex gap-3">
              {shouldShowAdminControls() && (
                <Button variant="success" onClick={exportToExcel}>
                  Exporter en Excel
                </Button>
              )}
              <Form.Control
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{width: '300px'}}
              />
            </div>
          </div>

          <Row xs={1} md={2} lg={3} xl={4} className="g-4">
            {filteredFichiers.map((fichier) => {
              const patient = patients.find(p => p._id === fichier.patientId);
              return (
                <Col key={fichier._id}>
                  <Card className="h-100 shadow-sm">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">{patient?.dossierNumber}</span>
                      <small>{formatDate(fichier.datePatient)}</small>
                    </Card.Header>
                    
                    <Card.Body>
                      <Card.Title>{fichier.ordre}</Card.Title>
                      <Card.Text as="div">
                        <small className="text-muted">
                          <div><strong>Patient:</strong> {patient?.nom}</div>
                          <div><strong>Diagnostic:</strong> {patient?.diagnostic}</div>
                          <div><strong>Age:</strong> {formatDate(patient?.age)}</div>
                          <div><strong>Sexe:</strong> {patient?.sexe}</div>
                          <div><strong>Tél:</strong> {patient?.numeroDeTelephone}</div>
                        </small>
                      </Card.Text>
                    </Card.Body>

                    <Card.Footer className="bg-transparent">
                      <div className="d-flex justify-content-between align-items-center">
                        {fichier.dropboxLink && (
                          <a 
                            href={fichier.dropboxLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-link p-0"
                          >
                            Voir le document
                          </a>
                        )}
                        {shouldShowAdminControls() && (
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-warning"
                              onClick={() => handleEdit(fichier)}
                            >
                              Modifier
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(fichier._id)}
                            >
                              Supprimer
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default PatientSolvable;
