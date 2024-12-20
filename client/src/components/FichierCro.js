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
    comment: '',
    customComment: '',  // Ajout de customComment
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
      const searchString = `${patient?.dossierNumber.toLowerCase()} ${cro.comment.toLowerCase()} ${patient?.nom.toLowerCase()} ${patient?.diagnostic.toLowerCase()} ${formatDate(cro.datePatient).toLowerCase()}`;
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
      comment: cro.comment,
      customComment: cro.customComment || '', // Réinitialisation de customComment
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
    const finalComment = croInfo.comment === 'Autres' ? croInfo.customComment : croInfo.comment;
  
    try {
      if (editing) {
        await updateDoc(doc(db, 'cros', editing), {
          ...croInfo,
          comment: finalComment, // Utilisation du commentaire final
          service: userService
        });
        setCros(cros.map(p => p._id === editing ? {...p, ...croInfo} : p));
        setEditing(null);
      } else {
        const docRef = await addDoc(collection(db, 'cros'), {
          ...croInfo,
          comment: finalComment, // Utilisation du commentaire final
          service: userService
        });
        setCros([...cros, { _id: docRef.id, ...croInfo, service: userService }]);
      }
      setCroInfo({
        patientId: '',
        comment: '',
        customComment: '',  // Réinitialisation du commentaire personnalisé
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
        'Commentaire': cro.comment,
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
                    required
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
                  <Form.Label>Commentaire</Form.Label>
                  <Form.Select
                    value={croInfo.comment}
                    onChange={(e) => setCroInfo(prev => ({...prev, comment: e.target.value}))}
                    required
                  >
                    <option value="">Sélectionner un commentaire</option>
                    <option value="Normal">Normal</option>
                    <option value="Mission Canadienne">Mission Canadienne</option>
                    <option value="Mission Suisse">Mission Suisse</option>
                    <option value="Autres">Autres</option>
                  </Form.Select>

                  {croInfo.comment === 'Autres' && (
                    <Form.Control
                      type="text"
                      placeholder="Entrez un commentaire personnalisé"
                      value={croInfo.customComment}
                      onChange={(e) => setCroInfo(prev => ({...prev, customComment: e.target.value}))}
                    />
                  )}
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

                <Button type="submit" variant="primary">
                  {editing ? 'Modifier' : 'Ajouter'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Liste des documents existants */}
      <Row>
        <Col>
          <h4>Documents</h4>
          {filteredCros.length === 0 ? (
            <p>Aucun document trouvé</p>
          ) : (
            <div className="list-group">
              {filteredCros.map(cro => {
                const patient = patients.find(p => p._id === cro.patientId);
                return (
                  <div key={cro._id} className="list-group-item">
                    <h5>{patient?.nom} - {patient?.dossierNumber}</h5>
                    <p>Commentaire: {cro.comment}</p>
                    <p><strong>Chirurgien(s):</strong> {cro.chirurgiens}</p>
                    <Button variant="secondary" onClick={() => handleEdit(cro)}>Éditer</Button>
                    <Button variant="danger" onClick={() => handleDelete(cro._id)}>Supprimer</Button>
                    <Button variant="info" onClick={() => toggleFileList(cro._id)}>Voir fichiers</Button>
                    {fileVisibility[cro._id] && (
                      <div>
                        <h6>Fichiers Dropbox:</h6>
                        <ul>
                          {cro.dropboxLinks.map(link => (
                            <li key={link}>
                              <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                              <Button variant="danger" onClick={() => handleRemoveFile(link)}>Supprimer</Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Col>
      </Row>

      <Button variant="success" onClick={exportToExcel}>Exporter en Excel</Button>
    </Container>
  );
};

export default Opera;
