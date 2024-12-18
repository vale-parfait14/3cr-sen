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
  const [commentType, setCommentType] = useState('Normal');
  const [customComment, setCustomComment] = useState('');
  const [operationDetails, setOperationDetails] = useState({
    anesthesistes: '',
    responsablesCEC: '',
    instrumentistes: '',
    indicationOperatoire: ''
  });
  const [showFiles, setShowFiles] = useState({});
  const [fichierInfo, setFichierInfo] = useState({
    patientId: '',
    statut: 'Validé',
    dropboxLinks: []
  });
  const [fichiers, setFichiers] = useState([]);
  const userService = localStorage.getItem('userService');
  const [userRole] = useState(localStorage.getItem("userRole"));
  const [userAccessLevel] = useState(localStorage.getItem("userAccessLevel"));
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFichiers, setFilteredFichiers] = useState([]);
  const [dropboxLinks, setDropboxLinks] = useState([]);

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
      const searchString = `${patient?.dossierNumber.toLowerCase()} ${patient?.nom.toLowerCase()} ${patient?.dateNaissance} ${patient?.sexe.toLowerCase()} ${patient?.groupeSanguin} ${patient?.adresse.toLowerCase()} ${patient?.numeroDeTelephone} ${patient?.diagnostic.toLowerCase()} ${patient?.operateur.toLowerCase()}`;
      return searchString.includes(searchTerm.toLowerCase());
    });
    setFilteredFichiers(searchResults);
  }, [searchTerm, fichiers, patients]);

  const handleDropboxSuccess = (files) => {
    const newLinks = files.map(file => file.link);
    setDropboxLinks([...dropboxLinks, ...newLinks]);
    setFichierInfo(prev => ({
      ...prev,
      dropboxLinks: [...(prev.dropboxLinks || []), ...newLinks]
    }));
    toast.success('Documents Dropbox sélectionnés avec succès');
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
        commentType,
        customComment: commentType === 'autre' ? customComment : '',
        operationDetails,
        dropboxLinks
      });

      const newFichier = {
        _id: docRef.id,
        ...fichierInfo,
        service: userService,
        commentType,
        customComment: commentType === 'autre' ? customComment : '',
        operationDetails,
        dropboxLinks
      };

      setFichiers([...fichiers, newFichier]);
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
      const updateData = {
        ...fichierInfo,
        service: userService,
        commentType,
        customComment: commentType === 'autre' ? customComment : '',
        operationDetails,
        dropboxLinks
      };

      await updateDoc(fichierRef, updateData);
      setFichiers(fichiers.map(p => 
        p._id === editing ? {...p, ...updateData} : p
      ));
      resetForm();
      setEditing(null);
      toast.success('Patient et documents modifiés avec succès');
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  const resetForm = () => {
    setFichierInfo({
      patientId: '',
      statut: 'Validé',
      dropboxLinks: []
    });
    setDropboxLinks([]);
    setCommentType('Normal');
    setCustomComment('');
    setOperationDetails({
      anesthesistes: '',
      responsablesCEC: '',
      instrumentistes: '',
      indicationOperatoire: ''
    });
  };

  const handleDelete = async (fichierId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce patient et ses documents associés ?')) {
      try {
        await deleteDoc(doc(db, 'fichiers', fichierId));
        setFichiers(fichiers.filter(fichier => fichier._id !== fichierId));
        toast.success('Patient et documents supprimés avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleEdit = (fichier) => {
    setEditing(fichier._id);
    setFichierInfo({
      patientId: fichier.patientId,
      statut: fichier.statut,
      dropboxLinks: fichier.dropboxLinks || []
    });
    setCommentType(fichier.commentType || 'Normal');
    setCustomComment(fichier.customComment || '');
    setOperationDetails(fichier.operationDetails || {
      anesthesistes: '',
      responsablesCEC: '',
      instrumentistes: '',
      indicationOperatoire: ''
    });
    setDropboxLinks(fichier.dropboxLinks || []);
  };

  const exportToExcel = () => {
    const data = fichiers.map(fichier => {
      const patient = patients.find(p => p._id === fichier.patientId);
      return {
        'Numéro de dossier': patient?.dossierNumber,
        'Patient': patient?.nom,
        'Date de naissance': patient?.dateNaissance,
        'Sexe': patient?.sexe,
        'Age': patient?.age,
        'Groupe sanguin': patient?.groupeSanguin,
        'Adresse': patient?.adresse,
        'Téléphone': patient?.numeroDeTelephone,
        'Diagnostic': patient?.diagnostic,
        'Opérateur': patient?.operateur,
        'Commentaire': fichier.commentType === 'autre' ? fichier.customComment : fichier.commentType,
        'Anesthésistes': fichier.operationDetails?.anesthesistes,
        'Responsables CEC': fichier.operationDetails?.responsablesCEC,
        'Instrumentistes': fichier.operationDetails?.instrumentistes,
        'Indication opératoire': fichier.operationDetails?.indicationOperatoire
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Patients");
    XLSX.writeFile(wb, "Patients.xlsx");
  };

  return (
    <Container>
      <Row className="my-4">
        <Col md={12} lg={8} className="mx-auto">
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Sélectionner un patient</Form.Label>
              <Form.Control
                as="select"
                value={fichierInfo.patientId}
                onChange={(e) => setFichierInfo({...fichierInfo, patientId: e.target.value})}
                required
              >
                <option value="">Sélectionner un patient</option>
                {validatedPatients.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.dossierNumber} - {patient.nom} - {patient.dateNaissance} - {patient.sexe} - {patient.age} - {patient.groupeSanguin} - {patient.adresse} - {patient.numeroDeTelephone} - {patient.diagnostic} - {patient.operateur}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type de commentaire</Form.Label>
              <Form.Select 
                value={commentType}
                onChange={(e) => setCommentType(e.target.value)}
              >
                <option value="Normal">Normal</option>
                <option value="Mission Canadienne">Mission Canadienne</option>
                <option value="autre">Autre</option>
              </Form.Select>
            </Form.Group>

            {commentType === 'autre' && (
              <Form.Group className="mb-3">
                <Form.Label>Commentaire personnalisé</Form.Label>
                <Form.Control
                  as="textarea"
                  value={customComment}
                  onChange={(e) => setCustomComment(e.target.value)}
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Détails de l'opération</Form.Label>
              <Form.Control
                type="text"
                placeholder="Anesthésistes"
                value={operationDetails.anesthesistes}
                onChange={(e) => setOperationDetails({...operationDetails, anesthesistes: e.target.value})}
                className="mb-2"
              />
              <Form.Control
                type="text"
                placeholder="Responsables CEC"
                value={operationDetails.responsablesCEC}
                onChange={(e) => setOperationDetails({...operationDetails, responsablesCEC: e.target.value})}
                className="mb-2"
              />
              <Form.Control
                type="text"
                placeholder="Instrumentistes"
                value={operationDetails.instrumentistes}
                onChange={(e) => setOperationDetails({...operationDetails, instrumentistes: e.target.value})}
                className="mb-2"
              />
              <Form.Control
                type="text"
                placeholder="Indication opératoire"
                value={operationDetails.indicationOperatoire}
                onChange={(e) => setOperationDetails({...operationDetails, indicationOperatoire: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Documents (Dropbox)</Form.Label>
              <DropboxChooser
                appKey="gmhp5s9h3aup35v"
                success={handleDropboxSuccess}
                cancel={() => toast.info('Sélection annulée')}
                multiselect={true}
              >
                <Button variant="outline-primary" type="button">
                  Choisir des fichiers depuis Dropbox
                </Button>
              </DropboxChooser>
              {dropboxLinks.length > 0 && (
                <div className="mt-2">
                  {dropboxLinks.map((link, index) => (
                    <div key={index}>
                      <a href={link} target="_blank" rel="noopener noreferrer">
                        Document {index + 1}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </Form.Group>

            <Button variant="primary" type="submit">
              {editing ? 'Modifier' : 'Enregistrer'}
            </Button>
          </Form>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>

          <Button variant="success" onClick={exportToExcel} className="mb-3">
            Exporter en Excel
          </Button>

          <Table responsive striped bordered hover>
            <thead>
              <tr>
                <th>Numéro de dossier</th>
                <th>Patient</th>
                <th>Date de naissance</th>
                <th>Sexe</th>
                <th>Age</th>
                <th>Groupe sanguin</th>
                <th>Adresse</th>
                <th>Téléphone</th>
                <th>Diagnostic</th>
                <th>Opérateur</th>
                <th>Commentaire</th>
                <th>Détails opération</th>
                <th>Documents</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFichiers.map((fichier) => {
                const patient = patients.find(p => p._id === fichier.patientId);
                return (
                  <tr key={fichier._id}>
                    <td>{patient?.dossierNumber}</td>
                    <td>{patient?.nom}</td>
                    <td>{patient?.dateNaissance}</td>
                    <td>{patient?.sexe}</td>
                    <td>{patient?.age}</td>
                    <td>{patient?.groupeSanguin}</td>
                    <td>{patient?.adresse}</td>
                    <td>{patient?.numeroDeTelephone}</td>
                    <td>{patient?.diagnostic}</td>
                    <td>{patient?.operateur}</td>
                    <td>{fichier.commentType === 'autre' ? fichier.customComment : fichier.commentType}</td>
                    <td>
                      <small>
                        <strong>Anesthésistes:</strong> {fichier.operationDetails?.anesthesistes}<br/>
                        <strong>CEC:</strong> {fichier.operationDetails?.responsablesCEC}<br/>
                        <strong>Instrumentistes:</strong> {fichier.operationDetails?.instrumentistes}<br/>
                        <strong>Indication:</strong> {fichier.operationDetails?.indicationOperatoire}
                      </small>
                    </td>
                    <td>
                      {fichier.dropboxLinks?.length > 2 ? (
                        <>
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => setShowFiles({...showFiles, [fichier._id]: !showFiles[fichier._id]})}
                          >
                            {showFiles[fichier._id] ? 'Masquer' : `Voir ${fichier.dropboxLinks.length} fichiers`}
                          </Button>
                          {showFiles[fichier._id] && (
                            <div className="mt-2">
                              {fichier.dropboxLinks.map((link, index) => (
                                <div key={index}>
                                  <a href={link} target="_blank" rel="noopener noreferrer">
                                    Document {index + 1}
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        fichier.dropboxLinks?.map((link, index) => (
                          <div key={index}>
                            <a href={link} target="_blank" rel="noopener noreferrer">
                              Document {index + 1}
                            </a>
                          </div>
                        ))
                      )}
                    </td>
                    <td>
                      <Button variant="warning" onClick={() => handleEdit(fichier)} className="me-2">
                        Modifier
                      </Button>
                      <Button variant="danger" onClick={() => handleDelete(fichier._id)}>
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
