import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';

const PatientSolvable = ({ patients }) => {
  const [editing, setEditing] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState({
    patientId: '',
    ordre: '',
    modePaiement: '',
    Donnateur: '',
    montant: '',
    datePaiement: '',
    statut: 'Payé'
  });

  const [payments, setPayments] = useState([]);
  const userService = localStorage.getItem('userService');
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));
  const [userAccessLevel, setUserAccessLevel] = useState(localStorage.getItem("userAccessLevel"));
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPayments, setFilteredPayments] = useState([]);
  // Filtrer les patients par service
  const validatedPatients = patients.filter(patient =>
    patient.validation === 'Validé' && patient.services === userService
  );

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/payments');
        if (response.ok) {
          const data = await response.json();
          // Filtrer les paiements selon le service de l'utilisateur
          const filteredPayments = data.filter(payment => payment.service === userService);
          setPayments(filteredPayments);
        }
      } catch (error) {
        toast.error('Erreur lors du chargement des paiements');
      }
    };

    fetchPayments();
    const intervalId = setInterval(fetchPayments, 5000); // Recharger chaque 5 secondes

    // Nettoyage de l'intervalle au démontage du composant
    return () => clearInterval(intervalId);
  }, [userService]); // Dépendre du service de l'utilisateur pour recharger les paiements
// Add this useEffect to handle the search filtering
useEffect(() => {
  if (!searchTerm) {
    setFilteredPayments(payments);
    return;
  }

  const searchResults = payments.filter(payment => {
    const patient = patients.find(p => p._id === payment.patientId);
    const searchString = `
      ${payment.ordre.toLowerCase()}
      ${patient?.nom.toLowerCase()}
      ${patient?.diagnostic.toLowerCase()}
      ${patient?.numeroDeTelephone}
      ${payment.modePaiement.toLowerCase()}
      ${payment.Donnateur?.toLowerCase() || ''}
      ${payment.montant}
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
      modePaiement: payment.modePaiement,
      Donnateur: payment.Donnateur,
      montant: payment.montant,
      datePaiement: payment.datePaiement,
      statut: payment.statut
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5002/api/payments/${editing}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...paymentInfo,
          service: userService
        })
      });

      if (response.ok) {
        const updatedPayment = await response.json();
        setPayments(payments.map(p =>
          p._id === editing ? updatedPayment : p
        ));
        setEditing(null);
        setPaymentInfo({
          patientId: '',
          ordre: '',
          modePaiement: '',
          Donnateur: '',
          montant: '',
          datePaiement: '',
          statut: 'Payé'
        });
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

    try {
      const response = await fetch('http://localhost:5002/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...paymentInfo,
          service: userService
        })
      });

      if (response.ok) {
        const newPayment = await response.json();
        setPayments([...payments, newPayment]);
        setPaymentInfo({
          patientId: '',
          ordre: '',
          modePaiement: '',
          Donnateur: '',
          montant: '',
          datePaiement: '',
          statut: 'Payé'
        });
        toast.success('Paiement enregistré avec succès');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (paymentId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      try {
        const response = await fetch(`http://localhost:5002/api/payments/${paymentId}`, {
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
        ModePaiement: payment.modePaiement,
        Donnateur: payment.modePaiement === 'Dons' ? payment.Donnateur : '',
        Montant: payment.montant,
        Date: formatDate(payment.datePaiement)
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Paiements");
    XLSX.writeFile(wb, "paiements.xlsx");
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
                (userRole === "Médecin" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                (userRole === "Secrétaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                (userRole === "Infirmier(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                (userRole === "Archiviste" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||

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
          >Enregistrement des Paiements</h2>
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
              <Form.Label>Mode de paiement</Form.Label>
              <Form.Control
                as="select"
                value={paymentInfo.modePaiement}
                onChange={(e) => setPaymentInfo({...paymentInfo, modePaiement: e.target.value})}
                required
              >
                <option value="">Sélectionner un mode de paiement</option>
                <option value="Dons">Dons</option>
                <option value="espèces en :dollar">Espèces en: Dollar</option>
                <option value="espèces en :euro">Espèces en: Euro</option>
                <option value="espèces en :cfa">Espèces en: CFA</option>
                <option value="espèces en :livre">Espèces en: Livre</option>
                <option value="espèces en :dirham">Espèces en: Dirham</option>
                <option value="carte :banquaire visa">Carte bancaire :Visa</option>
                <option value="cheque :uba">Chèque: UBA</option>
              </Form.Control>
            </Form.Group>

            {paymentInfo.modePaiement === 'Dons' && (
              <Form.Group>
                <Form.Label>Donnateur</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Donnateur"
                  value={paymentInfo.Donnateur}
                  onChange={(e) => setPaymentInfo({...paymentInfo, Donnateur: e.target.value})}
                  required
                />
              </Form.Group>
            )}

            <Form.Group>
              <Form.Label>Montant</Form.Label>
              <Form.Control
                type="number"
                placeholder="Montant"
                value={paymentInfo.montant}
                onChange={(e) => setPaymentInfo({...paymentInfo, montant: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Date de paiement</Form.Label>
              <Form.Control
                type="date"
                value={paymentInfo.datePaiement}
                onChange={(e) => setPaymentInfo({...paymentInfo, datePaiement: e.target.value})}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              {editing ? 'Modifier' : 'Enregistrer'}
            </Button>
          </Form>
        </Col>
      </Row>

      <Row>
        <Col>
          <h3 className="text-center">Liste des paiements</h3>
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
                <th>Ordre</th>
                <th>Patient</th>
                <th>Diagnostic</th>
                <th>Age</th>
                <th>Téléphone</th>
                <th>Mode de paiement</th>
                {payments.some(p => p.modePaiement === 'Dons') && <th>Donnateur</th>}
                <th>Montant</th>
                <th>Date de paiement</th>
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
              {filteredPayments.map((payment) => {
                const patient = patients.find(p => p._id === payment.patientId);
                return (
                  <tr key={payment._id}>
                    <td>{payment.ordre}</td>
                    <td>{patient?.nom}</td>
                    <td>{patient?.diagnostic}</td>
                    <td>{formatDate(patient?.age)}</td>
                    <td>{patient?.numeroDeTelephone}</td>
                    <td>{payment.modePaiement}</td>
                    {payments.some(p => p.modePaiement === 'Dons') && 
                      <td>{payment.modePaiement === 'Dons' ? payment.Donnateur : '-'}</td>
                    }
                    <td>{payment.montant}</td>
                    <td>{formatDate(payment.datePaiement)}</td>
                    <td>
                      <Button variant="warning" onClick={() => handleEdit(payment)}
                        
                        
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
                      <Button variant="danger" onClick={() => handleDelete(payment._id)}
            
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
