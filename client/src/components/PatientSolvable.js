import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';

// Import Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, doc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// Configuration Firebase (remplacez par vos propres clés)
const firebaseConfig = {
  apiKey: "AIzaSyDSQ0cQa7TISpd_vZWVa9dWMzbUUl-yf38",
  authDomain: "basecenterdb.firebaseapp.com",
  projectId: "basecenterdb",
  storageBucket: "basecenterdb.firebasestorage.app",
  messagingSenderId: "919766148380",
  appId: "1:919766148380:web:30db9986fa2cd8bb7106d9"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const PatientSolvable = ({ patients }) => {
  const [editing, setEditing] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileLinks, setFileLinks] = useState([]);
  const [paymentInfo, setPaymentInfo] = useState({
    patientId: '',
    ordre: '',
    datePaiement: '',
    statut: 'Payé'
  });

  const [payments, setPayments] = useState([]);
  const userService = localStorage.getItem('userService');
  const [userRole] = useState(localStorage.getItem("userRole"));
  const [userAccessLevel] = useState(localStorage.getItem("userAccessLevel"));
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPayments, setFilteredPayments] = useState([]);

  const validatedPatients = patients.filter(patient =>
    patient.validation === 'Validé' && patient.services === userService
  );

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(prevFiles => [...prevFiles, ...files]);
    
    const newFileLinks = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type
    }));
    
    setFileLinks(prevLinks => [...prevLinks, ...newFileLinks]);
  };

  const uploadFilesToFirebase = async (files) => {
    const fileUrls = [];

    for (const file of files) {
      const fileRef = ref(storage, `payments/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);

      try {
        await uploadTask;
        const url = await getDownloadURL(fileRef);
        fileUrls.push(url);
      } catch (error) {
        toast.error('Erreur lors du téléchargement du fichier');
      }
    }

    return fileUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      handleUpdate(e);
      return;
    }

    const fileUrls = await uploadFilesToFirebase(selectedFiles);

    try {
      const newPayment = {
        ...paymentInfo,
        service: userService,
        documents: fileUrls,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'payments'), newPayment);
      newPayment.id = docRef.id;
      setPayments([...payments, newPayment]);
      resetForm();
      toast.success('Document enregistré avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const fileUrls = await uploadFilesToFirebase(selectedFiles);

    try {
      const paymentDocRef = doc(db, 'payments', editing);
      await updateDoc(paymentDocRef, {
        ...paymentInfo,
        documents: fileUrls.length > 0 ? fileUrls : paymentInfo.documents,
      });

      setPayments(payments.map(p =>
        p.id === editing ? { ...p, ...paymentInfo, documents: fileUrls } : p
      ));
      resetForm();
      toast.success('Document modifié avec succès');
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  const fetchPaymentsFromFirebase = async () => {
    try {
      const q = query(collection(db, 'payments'), where("service", "==", userService));
      const querySnapshot = await getDocs(q);
      const paymentData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPayments(paymentData);
      setFilteredPayments(paymentData);
    } catch (error) {
      toast.error('Erreur lors du chargement des documents');
    }
  };

  useEffect(() => {
    fetchPaymentsFromFirebase();
    const intervalId = setInterval(fetchPaymentsFromFirebase, 5000);
    return () => clearInterval(intervalId);
  }, [userService]);

  const resetForm = () => {
    setEditing(null);
    setPaymentInfo({
      patientId: '',
      ordre: '',
      datePaiement: '',
      statut: 'Payé'
    });
    setSelectedFiles([]);
    setFileLinks([]);
  };

  const handleDelete = async (paymentId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      try {
        const paymentDocRef = doc(db, 'payments', paymentId);
        await deleteDoc(paymentDocRef);

        setPayments(payments.filter(payment => payment.id !== paymentId));
        toast.success('Document supprimé avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const exportToExcel = () => {
    const data = payments.map(payment => {
      const patient = patients.find(p => p._id === payment.patientId);
      return {
        Ordre: payment.ordre,
        Patient: patient?.nom,
        Diagnostic: patient?.diagnostic,
        Age: formatDate(patient?.age),
        Telephone: patient?.numeroDeTelephone,
        Date: formatDate(payment.datePaiement),
        Documents: payment.documents?.join(', ') || ''
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Documents");
    XLSX.writeFile(wb, "documents.xlsx");
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const shouldShowAdminFeatures = () => {
    return !(
      localStorage.getItem("userName") === "Ad" ||
      (userRole === "Médecin" && userAccessLevel === "Affichage" && ["Cuomo","Ctcv","Cardiologie","Réanimation"].includes(userService)) ||
      (userRole === "Secrétaire" && userAccessLevel === "Affichage" && ["Cuomo","Ctcv","Cardiologie","Réanimation"].includes(userService)) ||
      (userRole === "Etudiant(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"].includes(userService))
    );
  };

  return (
    <Container>
      <Row className="my-4">
        <Col md={12} lg={8} className="mx-auto">
          {shouldShowAdminFeatures() && (
            <>
              <h2 className="text-center">Enregistrement des Documents</h2>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="patientId">
                  <Form.Label>Patient</Form.Label>
                  <Form.Control
                    as="select"
                    value={paymentInfo.patientId}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, patientId: e.target.value })}
                    required
                  >
                    <option value="">Sélectionner un patient</option>
                    {validatedPatients.map((patient) => (
                      <option key={patient._id} value={patient._id}>
                        {patient.nom}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="ordre">
                  <Form.Label>Ordre</Form.Label>
                  <Form.Control
                    type="text"
                    value={paymentInfo.ordre}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, ordre: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="datePaiement">
                  <Form.Label>Date de paiement</Form.Label>
                  <Form.Control
                    type="date"
                    value={paymentInfo.datePaiement}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, datePaiement: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="fileUpload">
                  <Form.Label>Documents</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="mt-3">
                  {editing ? 'Mettre à jour' : 'Ajouter'}
                </Button>
              </Form>
            </>
          )}

          <h2 className="text-center my-4">Documents Paiement</h2>
          <Button onClick={exportToExcel}>Exporter en Excel</Button>
          <Table striped bordered hover className="mt-3">
            <thead>
              <tr>
                <th>Ordre</th>
                <th>Nom Patient</th>
                <th>Diagnostic</th>
                <th>Date Paiement</th>
                <th>Documents</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(payment => {
                const patient = validatedPatients.find(p => p._id === payment.patientId);
                return (
                  <tr key={payment.id}>
                    <td>{payment.ordre}</td>
                    <td>{patient?.nom}</td>
                    <td>{patient?.diagnostic}</td>
                    <td>{formatDate(payment.datePaiement)}</td>
                    <td>{payment.documents.join(', ')}</td>
                    <td>
                      <Button variant="info" onClick={() => setEditing(payment.id)}>Modifier</Button>{' '}
                      <Button variant="danger" onClick={() => handleDelete(payment.id)}>Supprimer</Button>
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
