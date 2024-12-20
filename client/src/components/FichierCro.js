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
    dropboxLinks: [],
    chirurgiens: '',
    anesthesistes: '',
    diagnos: '',
    indicationOperatoire: ''
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
      const searchString = ${patient?.dossierNumber.toLowerCase()} ${cro.ordre.toLowerCase()} ${patient?.nom.toLowerCase()} ${patient?.diagnostic.toLowerCase()} ${formatDate(cro.datePatient).toLowerCase()};
      return searchString.includes(searchTerm.toLowerCase());
    });
    setFilteredCros(searchResults);
  }, [searchTerm, cros, patients]);

  const handleDropboxSuccess = (files) => {
    const links = files.map(file => file.link);
    setCroInfo(prev => ({
      ...prev,
      dropboxLinks: [...prev.dropboxLinks, ...links]
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
      dropboxLinks: cro.dropboxLinks || [],
      chirurgiens: cro.chirurgiens || '',
      anesthesistes: cro.anesthesistes || '',
      diagnos: cro.diagnos || '',
      indicationOperatoire: cro.indicationOperatoire || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        setCros(cros.map(p => p._id === editing ? {...p, ...croInfo} : p));
        setEditing(null);
      } else {
        const docRef = await addDoc(collection(db, 'cros'), {
          ...croInfo,
          service: userService
        });
        setCros([...cros, { _id: docRef.id, ...croInfo, service: userService }]);
      }
      setCroInfo({
        patientId: '',
        ordre: '',
        datePatient: '',
        statut: 'Validé',
        dropboxLinks: [],
        chirurgiens: '',
        anesthesistes: '',
        diagnos: '',
        indicationOperatoire: ''
      });
      toast.success(editing ? 'Document modifié avec succès' : 'Document ajouté avec succès');
    } catch (error) {
      toast.error('Une erreur est survenue');
    }
  };

  const toggleFileList = (croId) => {
    setFileVisibility(prev => ({
      ...prev,
      [croId]: !prev[croId]
    }));
  };

  const exportToExcel = () => {
    const data = cros.map(cro => {
      const patient = patients.find(p => p._id === cro.patientId);
      return {
        'Numéro de dossier': patient?.dossierNumber,
        'Résumé': cro.ordre,
        'Patient': patient?.nom,
        'Chirurgiens': cro.chirurgiens,
        'Anesthésistes': cro.anesthesistes,
        'Diagnostic': cro.diagnos,
        'Indication Opératoire': cro.indicationOperatoire,
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
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

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
                  <Form.Label>Chirurgiens</Form.Label>
                  <Form.Control
                    type="text"
                    value={croInfo.chirurgiens}
                    onChange={(e) => setCroInfo(prev => ({...prev, chirurgiens: e.target.value}))}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Anesthésistes</Form.Label>
                  <Form.Control
                    type="text"
                    value={croInfo.anesthesistes}
                    onChange={(e) => setCroInfo(prev => ({...prev, anesthesistes: e.target.value}))}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Diagnostic</Form.Label>
                  <Form.Control
                    type="text"
                    value={croInfo.diagnos}
                    onChange={(e) => setCroInfo(prev => ({...prev, diagnos: e.target.value}))}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Indication Opératoire</Form.Label>
                  <Form.Control
                    type="text"
                    value={croInfo.indicationOperatoire}
                    onChange={(e) => setCroInfo(prev => ({...prev, indicationOperatoire: e.target.value}))}
                  />
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
                            {link.split('/').pop()}
                          </a>
                          <Button variant="danger" size="sm" onClick={() => handleRemoveFile(link)}>
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
                          <p><strong>Chirurgiens:</strong> {cro.chirurgiens}</p>
                          <p><strong>Anesthésistes:</strong> {cro.anesthesistes}</p>
                          <p><strong>Diagnostic:</strong> {cro.diagnos}</p>
                          <p><strong>Indication Opératoire:</strong> {cro.indicationOperatoire}</p>
                          <p><strong>Résumé:</strong> {cro.ordre}</p>
                          <p><strong>Âge:</strong> {patient?.age}</p>
                          <p><strong>Genre:</strong> {patient?.genre}</p>
                          <p><strong>Groupe sanguin:</strong> {patient?.groupeSanguin}</p>
                          <p><strong>Numéro de téléphone:</strong> {patient?.numeroDeTelephone}</p>
                          <p><strong>Adresse domicile:</strong> {patient?.addressDomicile}</p>
                          <p><strong>Date:</strong> {formatDate(cro.datePatient)}</p>

                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => toggleFileList(cro._id)}
                            className="mb-2"
                          >
                            Documents ({cro.dropboxLinks?.length || 0})
                          </Button>

                                                    {fileVisibility[cro._id] && cro.dropboxLinks?.map((link, index) => (
                            <div key={index} className="mb-2">
                              <a href={link} target="_blank" rel="noopener noreferrer">
                                {link.split('/').pop()}
                              </a>
                            </div>
                          ))}

                          <div className="d-flex justify-content-between mt-3">
                            <Button variant="warning" size="sm" onClick={() => handleEdit(cro)}>
                              Modifier
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleDelete(cro._id)}>
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
