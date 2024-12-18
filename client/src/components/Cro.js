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
  const [croInfo, setCroInfo] = useState({
    patientId: '',
    statut: 'Validé',
    dropboxLinks: []
  });
  const [Cros, setCros] = useState([]);
  const userService = localStorage.getItem('userService');
  const [userRole] = useState(localStorage.getItem("userRole"));
  const [userAccessLevel] = useState(localStorage.getItem("userAccessLevel"));
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCros, setFilteredCros] = useState([]);
  const [dropboxLinks, setDropboxLinks] = useState([]);

  const validatedPatients = patients.filter(patient => 
    patient.validation === 'Validé' && patient.services === userService
  );

  useEffect(() => {
    const fetchCros = async () => {
      try {
        const CrosRef = collection(db, 'Cros');
        const q = query(CrosRef, where('service', '==', userService));
        const querySnapshot = await getDocs(q);
        const CrosData = querySnapshot.docs.map(doc => ({
          _id: doc.id,
          ...doc.data()
        }));
        setCros(CrosData);
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
      setFilteredCros(Cros);
      return;
    }

    const searchResults = Cros.filter(cro => {
      const patient = patients.find(p => p._id === cro.patientId);
      const searchString = `${patient?.dossierNumber.toLowerCase()} ${patient?.nom.toLowerCase()} ${patient?.dateNaissance} ${patient?.sexe.toLowerCase()} ${patient?.groupeSanguin} ${patient?.adresse.toLowerCase()} ${patient?.numeroDeTelephone} ${patient?.diagnostic.toLowerCase()} ${patient?.operateur.toLowerCase()}`;
      return searchString.includes(searchTerm.toLowerCase());
    });
    setFilteredCros(searchResults);
  }, [searchTerm, Cros, patients]);

  const handleDropboxSuccess = (files) => {
    const newLinks = files.map(file => file.link);
    setDropboxLinks([...dropboxLinks, ...newLinks]);
    setCroInfo(prev => ({
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
      const docRef = await addDoc(collection(db, 'Cros'), {
        ...croInfo,
        service: userService,
        commentType,
        customComment: commentType === 'autre' ? customComment : '',
        operationDetails,
        dropboxLinks
      });

      const newcro = {
        _id: docRef.id,
        ...croInfo,
        service: userService,
        commentType,
        customComment: commentType === 'autre' ? customComment : '',
        operationDetails,
        dropboxLinks
      };

      setCros([...Cros, newcro]);
      resetForm();
      toast.success('Patient et documents enregistrés avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const croRef = doc(db, 'Cros', editing);
      const updateData = {
        ...croInfo,
        service: userService,
        commentType,
        customComment: commentType === 'autre' ? customComment : '',
        operationDetails,
        dropboxLinks
      };

      await updateDoc(croRef, updateData);
      setCros(Cros.map(p => 
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
    setCroInfo({
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

  const handleDelete = async (croId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce patient et ses documents associés ?')) {
      try {
        await deleteDoc(doc(db, 'Cros', croId));
        setCros(Cros.filter(cro => cro._id !== croId));
        toast.success('Patient et documents supprimés avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleEdit = (cro) => {
    setEditing(cro._id);
    setCroInfo({
      patientId: cro.patientId,
      statut: cro.statut,
      dropboxLinks: cro.dropboxLinks || []
    });
    setCommentType(cro.commentType || 'Normal');
    setCustomComment(cro.customComment || '');
    setOperationDetails(cro.operationDetails || {
      anesthesistes: '',
      responsablesCEC: '',
      instrumentistes: '',
      indicationOperatoire: ''
    });
    setDropboxLinks(cro.dropboxLinks || []);
  };

  const exportToExcel = () => {
    const data = Cros.map(cro => {
      const patient = patients.find(p => p._id === cro.patientId);
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
        'Commentaire': cro.commentType === 'autre' ? cro.customComment : cro.commentType,
        'Anesthésistes': cro.operationDetails?.anesthesistes,
        'Responsables CEC': cro.operationDetails?.responsablesCEC,
        'Instrumentistes': cro.operationDetails?.instrumentistes,
        'Indication opératoire': cro.operationDetails?.indicationOperatoire
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
                value={croInfo.patientId}
                onChange={(e) => setCroInfo({...croInfo, patientId: e.target.value})}
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
                  Choisir des Cros depuis Dropbox
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
              {filteredCros.map((cro) => {
                const patient = patients.find(p => p._id === cro.patientId);
                return (
                  <tr key={cro._id}>
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
                    <td>{cro.commentType === 'autre' ? cro.customComment : cro.commentType}</td>
                    <td>
                      <small>
                        <strong>Anesthésistes:</strong> {cro.operationDetails?.anesthesistes}<br/>
                        <strong>CEC:</strong> {cro.operationDetails?.responsablesCEC}<br/>
                        <strong>Instrumentistes:</strong> {cro.operationDetails?.instrumentistes}<br/>
                        <strong>Indication:</strong> {cro.operationDetails?.indicationOperatoire}
                      </small>
                    </td>
                    <td>
                      {cro.dropboxLinks?.length > 2 ? (
                        <>
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => setShowFiles({...showFiles, [cro._id]: !showFiles[cro._id]})}
                          >
                            {showFiles[cro._id] ? 'Masquer' : `Voir ${cro.dropboxLinks.length} Cros`}
                          </Button>
                          {showFiles[cro._id] && (
                            <div className="mt-2">
                              {cro.dropboxLinks.map((link, index) => (
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
                        cro.dropboxLinks?.map((link, index) => (
                          <div key={index}>
                            <a href={link} target="_blank" rel="noopener noreferrer">
                              Document {index + 1}
                            </a>
                          </div>
                        ))
                      )}
                    </td>
                    <td>
                      <Button variant="warning" onClick={() => handleEdit(cro)} className="me-2">
                        Modifier
                      </Button>
                      <Button variant="danger" onClick={() => handleDelete(cro._id)}>
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
