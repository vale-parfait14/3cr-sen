import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';

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

  useEffect(() => {
    return () => {
      fileLinks.forEach(file => URL.revokeObjectURL(file.url));
    };
  }, [fileLinks]);

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

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch('https://threecr-sen.onrender.com/api/payments');
        if (response.ok) {
          const data = await response.json();
          const filteredPayments = data.filter(payment => payment.service === userService);
          setPayments(filteredPayments);
          setFilteredPayments(filteredPayments);
        }
      } catch (error) {
        toast.error('Erreur lors du chargement des paiements');
      }
    };

    fetchPayments();
    const intervalId = setInterval(fetchPayments, 5000);
    return () => clearInterval(intervalId);
  }, [userService]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredPayments(payments);
      return;
    }

    const searchResults = payments.filter(payment => {
      const patient = patients.find(p => p._id === payment.patientId);
      const searchString = `
        ${payment.ordre.toLowerCase()}
        ${patient?.nom.toLowerCase() || ''}
        ${patient?.diagnostic.toLowerCase() || ''}
        ${patient?.numeroDeTelephone || ''}
        ${formatDate(payment.datePaiement).toLowerCase()}
      `;
      return searchString.includes(searchTerm.toLowerCase());
    });

    setFilteredPayments(searchResults);
  }, [searchTerm, payments, patients]);

  const handleEdit = (payment) => {
    setEditing(payment._id);
    setPaymentInfo({
      patientId: payment.patientId,
      ordre: payment.ordre,
      datePaiement: payment.datePaiement,
      statut: payment.statut
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('paymentInfo', JSON.stringify({
      ...paymentInfo,
      service: userService
    }));

    selectedFiles.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    try {
      const response = await fetch(`https://threecr-sen.onrender.com/api/payments/${editing}`, {
        method: 'PUT',
        body: formData
      });

      if (response.ok) {
        const updatedPayment = await response.json();
        setPayments(payments.map(p =>
          p._id === editing ? updatedPayment : p
        ));
        resetForm();
        toast.success('Paiement modifié avec succès');
      }
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      handleUpdate(e);
      return;
    }

    const formData = new FormData();
    formData.append('paymentInfo', JSON.stringify({
      ...paymentInfo,
      service: userService
    }));
    
    selectedFiles.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    try {
      const response = await fetch('https://threecr-sen.onrender.com/api/payments', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const newPayment = await response.json();
        setPayments([...payments, newPayment]);
        resetForm();
        toast.success('Paiement enregistré avec succès');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

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
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      try {
        const response = await fetch(`https://threecr-sen.onrender.com/api/payments/${paymentId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setPayments(payments.filter(payment => payment._id !== paymentId));
          toast.success('Paiement supprimé avec succès');
        }
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
    XLSX.utils.book_append_sheet(wb, ws, "Paiements");
    XLSX.writeFile(wb, "paiements.xlsx");
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
                <Form.Group>
                  <Form.Label>Sélectionner un patient</Form.Label>
                  <Form.Control
                    as="select"
                    value={paymentInfo.patientId}
                    onChange={(e) => setPaymentInfo({...paymentInfo, patientId: e.target.value})}
                    required
                  >
                    <option value="">Sélectionner un patient</option>
                    {validatedPatients.map(patient => (
                      <option key={patient._id} value={patient._id}>
                        {patient.nom} - {patient.diagnostic} - Age: {formatDate(patient.age)} - Tel: {patient.numeroDeTelephone}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group>
                  <Form.Label>Ordre</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ordre"
                    value={paymentInfo.ordre}
                    onChange={(e) => setPaymentInfo({...paymentInfo, ordre: e.target.value})}
                    required
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={paymentInfo.datePaiement}
                    onChange={(e) => setPaymentInfo({...paymentInfo, datePaiement: e.target.value})}
                    required
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Documents</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                  />
                </Form.Group>

                {selectedFiles.length > 0 && (
                  <div className="mt-3">
                    <h5>Fichiers sélectionnés:</h5>
                    <ul>
                      {fileLinks.map((file, index) => (
                        <li key={index}>
                          <a href={file.url} target="_blank" rel="noopener noreferrer">
                            {file.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {fileLinks.length > 0 && (
                  <Button 
                    variant="info" 
                    className="mt-2"
                    onClick={() => {
                      const linksText = fileLinks.map(f => f.url).join('\n');
                      alert('Liens des fichiers:\n\n' + linksText);
                    }}
                  >
                    Afficher tous les liens
                  </Button>
                )}

                <Button variant="primary" type="submit" className="mt-3">
                  {editing ? 'Modifier' : 'Enregistrer'}
                </Button>
              </Form>
            </>
          )}
        </Col>
      </Row>

      <Row>
        <Col>
          <h3 className="text-center">Liste des documents</h3>
          {shouldShowAdminFeatures() && (
            <Button variant="success" onClick={exportToExcel} className="mb-3">
              Exporter en Excel
            </Button>
          )}
          
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
                <th>Ordre</th>
                <th>Patient</th>
                <th>Diagnostic</th>
                <th>Age</th>
                <th>Téléphone</th>
                <th>Date</th>
                <th>Documents</th>
                {shouldShowAdminFeatures() && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => {
                const patient = patients.find(p => p._id === payment.patientId);
                return (
                  <tr key={payment._id}>
                    <td>{payment.ordre}</td>
                    <td>{patient?.nom}</td>
                    <td>{patient?.diagnostic}</td>
                    <td>{formatDate(patient?.age)}</td>
                    <td>{patient?.numeroDeTelephone}</td>
                    <td>{formatDate(payment.datePaiement)}</td>
                    <td>
                      {payment.documents?.map((doc, index) => (
                        <div key={index}>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            {doc.name}
                          </a>
                        </div>
                      ))}
                    </td>
                    {shouldShowAdminFeatures() && (
                      <td>
                        <Button variant="warning" onClick={() => handleEdit(payment)}>
                          Modifier
                        </Button>{' '}
                        <Button variant="danger" onClick={() => handleDelete(payment._id)}>
                          Supprimer
                        </Button>
                      </td>
                    )}
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
