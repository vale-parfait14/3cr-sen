
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
  const [fichierInfo, setFichierInfo] = useState({
    patientId: '',
    ordre: '',
  
    datePatient: '',
    statut: 'Validé',
    dropboxLink: ''
  });

  const [fichiers, setFichiers] = useState([]);
  const userService = localStorage.getItem('userService');
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));
  const [userAccessLevel, setUserAccessLevel] = useState(localStorage.getItem("userAccessLevel"));
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
      setFichierInfo({
        patientId: '',
        ordre: '',
        
        datePatient: '',
        statut: 'Payé'
      });
      setDropboxLink('');
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
      setEditing(null);
      setFichierInfo({
        patientId: '',
        ordre: '',
       
        datePatient: '',
        statut: 'Validé',
        dropboxLink: ''
      });
      setDropboxLink('');
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
          setDropboxLink('');
        }
        toast.success('Patient et document supprimés avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const exportToExcel = () => {
    const data = fichiers.map(fichier => {
      const patient = patients.find(p => p._id === fichier.patientId);
      return {
        Ordre: fichier.ordre,
        Patient: patient?.nom,
        Patient: patient?.sexe,
        Patient:patient?.dossierNumber,
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
          <h2 className="text-center"
             style={{
              display:
                localStorage.getItem("userName") === "Ad" ||
                (userRole === "Secrétaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                (userRole === "Infirmier(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                (userRole === "Archiviste" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||

                (userRole === "Etudiant(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||

                (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                (userRole === "Archiviste" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                (userRole === "Etudiant(e)" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||

                (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                (userRole === "Archiviste" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                (userRole === "Etudiant(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||

                (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                (userRole === "Archiviste" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                (userRole === "Etudiant(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) 
                  ? "none"
                  : "block",
                  
            }}
          >Enregistrement des Patients</h2>
          <Form onSubmit={handleSubmit}
               style={{
                display:
                  localStorage.getItem("userName") === "Ad" ||
                  (userRole === "Médecin" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                  (userRole === "Secrétaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                  (userRole === "Infirmier(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                  (userRole === "Archiviste" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                  (userRole === "Gestionnaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                  (userRole === "Etudiant(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
  
                  (userRole === "Médecin" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                  (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                  (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                  (userRole === "Archiviste" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                  (userRole === "Etudiant(e)" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
  
                  (userRole === "Médecin" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                  (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                  (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                  (userRole === "Archiviste" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                  (userRole === "Etudiant(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
  
                  (userRole === "Médecin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                  (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                  (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                  (userRole === "Archiviste" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                  (userRole === "Etudiant(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) 
                    ? "none"
                    : "block",
                    
              }}
          >
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
                   {patient.dossierNumber}- {patient.nom} - {patient.diagnostic} - Age: {formatDate(patient.age)}-{patient.sexe} - Tel: {patient.numeroDeTelephone}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group>
              <Form.Label>Résumer ou titre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Résumer ou titre"
                value={fichierInfo.ordre}
                onChange={(e) => setFichierInfo({...fichierInfo, ordre: e.target.value})}
                required
              />
            </Form.Group>

            

           

            <Form.Group>
              <Form.Label>Date de Patient</Form.Label>
              <Form.Control
                type="date"
                value={fichierInfo.datePatient}
                onChange={(e) => setFichierInfo({...fichierInfo, datePatient: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
  <Form.Label>Document(Dropbox)</Form.Label>
  <DropboxChooser 
    appKey="dh9gtv3tojipp6o"
    success={handleDropboxSuccess}
    cancel={() => toast.info('Sélection annulée')}
    multiselect={false}
  >
    <Button variant="outline-primary" type="button">
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
</Form.Group>
            <Button variant="primary" type="submit">
              {editing ? 'Modifier' : 'Enregistrer'}
            </Button>
          </Form>
        </Col>
      </Row>

      <Row>
        <Col>
          <h3 className="text-center">Liste des Patients</h3>
          <Button variant="success" onClick={exportToExcel} className="mb-3"
           style={{
            display:
              localStorage.getItem("userName") === "Ad" ||
              (userRole === "Médecin" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
              (userRole === "Secrétaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
              (userRole === "Infirmier(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
              (userRole === "Archiviste" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
              (userRole === "Gestionnaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
              (userRole === "Etudiant(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||

              (userRole === "Médecin" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
              (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
              (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
              (userRole === "Archiviste" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
              (userRole === "Gestionnaire" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
              (userRole === "Etudiant(e)" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||

              (userRole === "Médecin" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
              (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
              (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
              (userRole === "Archiviste" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
              (userRole === "Etudiant(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||

              (userRole === "Médecin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
              (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
              (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
              (userRole === "Archiviste" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
              (userRole === "Etudiant(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) 
                ? "none"
                : "block",
                
          }}
          >
            Exporter en Excel
          </Button>
          <Form.Group className="mb-3">
  <Form.Control
    type="text"
    placeholder="Rechercher dans tous les champs..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</Form.Group>

          <Table responsive striped bordered hover>
            <thead>
              <tr>
                <th>Numéro de dossier</th>
                <th>Résumer ou titre</th>
                <th>Patient</th>
                <th>Sexe</th>
                <th>Diagnostic</th>
                <th>Age</th>
                <th>Téléphone</th>
                <th>Date du jours</th>
                <th>Document</th>

                <th
                   style={{
                    display:
                      localStorage.getItem("userName") === "Ad" ||
                      (userRole === "Médecin" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                      (userRole === "Archiviste" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                      (userRole === "Gestionnaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                      (userRole === "Etudiant(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
      
                      (userRole === "Médecin" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                      (userRole === "Archiviste" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                      (userRole === "Etudiant(e)" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
      
                      (userRole === "Médecin" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                      (userRole === "Archiviste" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                      (userRole === "Etudiant(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
      
                      (userRole === "Médecin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                      (userRole === "Archiviste" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                      (userRole === "Etudiant(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) 
                        ? "none"
                        : "block",
                        
                  }}
                >Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFichiers.map((fichier) => {
                const patient = patients.find(p => p._id === fichier.patientId);
                return (
                  <tr key={fichier._id}>
                    <td>{patient.dossierNumber}</td>
                    <td>{fichier.ordre}</td>
                    <td>{patient?.nom}</td>
                    <td>{patient?.sexe}</td>
                    <td>{patient?.diagnostic}</td>
                    <td>{formatDate(patient?.age)}</td>
                    <td>{patient?.numeroDeTelephone}</td>
                    
                    <td>{formatDate(fichier.datePatient)}</td>
                    <td>
  {fichier.dropboxLink && (
    <a href={fichier.dropboxLink} target="_blank" rel="noopener noreferrer">
      Voir
    </a>
  )}
</td>
                    <td>
                      <Button variant="warning" onClick={() => handleEdit(fichier)}
                        
                        
                        style={{
                          display:
                            localStorage.getItem("userName") === "Ad" ||
                            (userRole === "Médecin" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                            (userRole === "Secrétaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                            (userRole === "Infirmier(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                            (userRole === "Archiviste" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                            (userRole === "Gestionnaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                            (userRole === "Etudiant(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
            
                            (userRole === "Médecin" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                            (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                            (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                            (userRole === "Archiviste" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                            (userRole === "Etudiant(e)" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
            
                            (userRole === "Médecin" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                            (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                            (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                            (userRole === "Archiviste" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                            (userRole === "Etudiant(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
            
                            (userRole === "Médecin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                            (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                            (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                            (userRole === "Archiviste" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                            (userRole === "Etudiant(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) 
                              ? "none"
                              : "block",
                              
                        }}
                        
                        >Modifier</Button>{' '}
                      <Button variant="danger" onClick={() => handleDelete(fichier._id)}
            
            style={{
              display:
                localStorage.getItem("userName") === "Ad" ||
                (userRole === "Médecin" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                (userRole === "Secrétaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                (userRole === "Infirmier(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                (userRole === "Archiviste" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                (userRole === "Gestionnaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                (userRole === "Etudiant(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||

                (userRole === "Médecin" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                (userRole === "Archiviste" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                (userRole === "Gestionnaire" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                (userRole === "Etudiant(e)" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||

                (userRole === "Médecin" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                (userRole === "Archiviste" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                (userRole === "Etudiant(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||

                (userRole === "Médecin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                (userRole === "Archiviste" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                (userRole === "Etudiant(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) 
                  ? "none"
                  : "block",
                  
            }}

                      >Supprimer</Button>
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
