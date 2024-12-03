import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import axios from 'axios';
import 'jspdf-autotable';
import 'bootstrap/dist/css/bootstrap.min.css';

const PatientSolvable = ({ patients }) => {
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({
    ordre: '',
    modePaiement: '',
    Donnateur: '',
    montant: '',
    datePaiement: '',
    statut: 'Payé'
  });

  const [showForm, setShowForm] = useState(true);
  const [showRecords, setShowRecords] = useState(true);
  const userName = localStorage.getItem("userName");
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));
  const [userAccessLevel, setUserAccessLevel] = useState(localStorage.getItem("userAccessLevel"));

  // Fetch payment records from MongoDB
  useEffect(() => {
    // Fonction pour récupérer les enregistrements de paiements
    const fetchPaymentRecords = async () => {
      try {
        const response = await axios.get('http://localhost:5002/api/payments');
        setPaymentRecords(response.data);
      } catch (error) {
        console.error('Error fetching payment records:', error);
      }
    };
    // Appel initial
    fetchPaymentRecords();
    // Intervalle pour répéter la requête toutes les 5 secondes
    const intervalId = setInterval(fetchPaymentRecords, 5000);
    // Nettoyer l'intervalle à la destruction du composant
    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const patient = patients.find(p => p._id === selectedPatient);
    
    const newRecord = {
      patientId: selectedPatient,
      patientName: patient.nom,
      diagnostic: patient.diagnostic,
      age: formatDate(patient.age),
      numeroTelephone: patient.numeroDeTelephone,
      ...paymentDetails
    };

    try {
      const response = await axios.post('http://localhost:5002/api/payments', newRecord);
      setPaymentRecords([...paymentRecords, response.data]);
      resetForm();
    } catch (error) {
      console.error('Error saving payment record:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPatient('');
    setPaymentDetails({
      ordre: '',
      modePaiement: '',
      Donnateur: '',
      montant: '',
      datePaiement: '',
      statut: 'Payé'
    });
  };


  const handleEdit = async (recordId) => {
    try {
      const record = paymentRecords.find(r => r._id === recordId);
      setSelectedPatient(record.patientId);
      setPaymentDetails({
        ordre: record.ordre,
        modePaiement: record.modePaiement,
        Donnateur: record.Donnateur,
        montant: record.montant,
        datePaiement: record.datePaiement,
        statut: record.statut
      });
  
      // Remove the record to be edited
      setPaymentRecords(paymentRecords.filter(r => r._id !== recordId));
    } catch (error) {
      console.error('Error editing payment record:', error);
    }
  };
  

const handleDelete = async (recordId) => {
  try {
    const response = await axios.delete(`http://localhost:5002/api/payments/${recordId}`);
    if (response.status === 200) {
      setPaymentRecords(paymentRecords.filter(record => record._id !== recordId));
    }
  } catch (error) {
    console.error('Error deleting payment record:', error);
  }
};


  // Helper function to format date as day/month/year
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR');  // Format as 'day/month/year'
  };

  // Export to PDF (for a single record)
  const exportSingleToPDF = (record) => {
    const doc = new jsPDF();
    
    const tableColumn = ["Patient", "Diagnostic", "Age", "Téléphone", "Ordre", "Mode de Paiement", "Donnateur", "Montant", "Date de Paiement", "Statut"];
    
    const tableRow = [
        record.patientName || '',
        record.diagnostic || '',
        record.age || '',
        record.numeroTelephone || '',
        record.ordre || '',
        record.modePaiement || '',
        record.Donnateur || '',
        record.montant?.toString() || '',
        record.datePaiement || '',
        record.statut || ''
    ];

    doc.autoTable({
        head: [tableColumn],
        body: [tableRow],
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        margin: { top: 20, left: 10, right: 10, bottom: 10 }
    });

    doc.save(`paiement-${record.ordre || 'export'}.pdf`);
};


  // Export to Excel (for a single record)
  const exportSingleToExcel = (record) => {
    const formattedData = [{
      "Patient": record.patientName,
      "Diagnostic": record.diagnostic,
      "Age": record.age,
      "Téléphone": record.numeroTelephone,
      "Ordre": record.ordre,
      "Statut": record.statut,
      "Mode de Paiement": record.modePaiement,
      "Donnateur":record.Donnateur,
      "Montant": record.montant,
      "Date de Paiement": record.datePaiement,
    }];

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Paiement");
    XLSX.writeFile(wb, `paiement-${record.ordre}.xlsx`);
  };

  // Export to PDF (for all records)
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    const tableColumn = ["Patient", "Diagnostic", "Age", "Téléphone", "Ordre", "Mode de Paiement", "Donnateur", "Montant", "Date de Paiement", "Statut"];
    
    const tableRows = paymentRecords.map(record => [
        record.patientName || '',
        record.diagnostic || '',
        record.age || '',
        record.numeroTelephone || '',
        record.ordre || '',
        record.modePaiement || '',
        record.Donnateur || '',
        record.montant?.toString() || '',
        record.datePaiement || '',
        record.statut || ''
    ]);

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        margin: { top: 20, left: 10, right: 10, bottom: 10 }
    });

    doc.save('registre-paiements.pdf');
};

  // Export to Excel (for all records)
  const exportToExcel = () => {
    const formattedData = paymentRecords.map(record => ({
      "Patient": record.patientName,
      "Diagnostic": record.diagnostic,
      "Age": record.age,
      "Téléphone": record.numeroTelephone,
      "Ordre": record.ordre,
      "Statut": record.statut,
      "Mode de Paiement": record.modePaiement,
      "Donnateur":record.Donnateur,
      "Montant": record.montant,
      "Date de Paiement": record.datePaiement,
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Paiements");
    XLSX.writeFile(wb, "registre-paiements.xlsx");
  };

  return (
    <div className="container mt-5 mb-5" style={{ backgroundColor: "#2a5298", color: "white", borderRadius: "10px", padding: "20px", boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)" }}>
      <h2 className="mb-4">Gestion des Paiements</h2>

      {/* Button to toggle form visibility */}
      <button className="btn btn-secondary mb-3" onClick={() => setShowForm(!showForm)}
             style={{
              display:
                localStorage.getItem("userName") === "Admin" ||
                (userRole === "Médecin" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                (userRole === "Secrétaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                (userRole === "Infirmier(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                (userRole === "Archiviste" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                (userRole === "Gestionnaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                (userRole === "Etudiant(e)" && userAccessLevel === "Affichage" )
                  ? "none"
                  : "block",
                  
            }}
        >
        {showForm ? "Masquer le formulaire" : "Afficher le formulaire"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4" 
        style={{
          display:
            localStorage.getItem("userName") === "Admin" ||
            (userRole === "Médecin" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
            (userRole === "Secrétaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
            (userRole === "Infirmier(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
            (userRole === "Archiviste" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
            (userRole === "Gestionnaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
            (userRole === "Etudiant(e)" && userAccessLevel === "Affichage" )
              ? "none"
              : "block",
              
        }}
        >
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="patient" className="form-label">Sélectionner un patient</label>
              <select
                id="patient"
                className="form-select"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                required
              >
                <option value="">Sélectionner un patient</option>
                {patients.filter(p => p.validation === "Validé").map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="ordre" className="form-label">Ordre</label>
              <input
                id="ordre"
                type="text"
                className="form-control"
                placeholder="Ordre"
                value={paymentDetails.ordre}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, ordre: e.target.value })}
                
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="modePaiement" className="form-label">Mode de paiement</label>
              <select
                id="modePaiement"
                className="form-select"
                value={paymentDetails.modePaiement}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, modePaiement: e.target.value })}
                
              >
                <option value="">Mode de paiement</option>
                <option value="Dons">Dons</option>
                <hr/>
                <option value="especes en :dollar">Espèces en: Dollar</option>
                <option value="especes en :euro">Espèces en: Euro</option>
                <option value="especes en :cfa">Espèces en: CFA</option>
                <option value="especes en :livre">Espèces en: Livre</option>
                <option value="especes en :dirham">Espèces en: Dirham</option>
                <hr />
                <option value="carte :banquaire visa">Carte bancaire :Visa</option>
                <option value="carte :banquaire mastercard">Carte bancaire :Mastercard</option>
                <option value="carte :banquaire amex">Carte bancaire :Amex</option>
                <option value="carte :banquaire discover">Carte bancaire :Discover</option>
                <option value="carte :banquaire jcb">Carte bancaire :JCB</option>
                <option value="carte :banquaire diners club">Carte bancaire :Diners Club</option>
                <hr />
                <option value="cheque :uba">Chèque: UBA</option>
                <option value="cheque :Ecobank">Chèque: Ecobank</option>
                <option value="cheque :bicis">Chèque: Bicis</option>
                <option value="cheque :bni">Chèque: BNI</option>
                <option value="cheque :wema">Chèque: Wema</option>
                <option value="cheque :zenith">Chèque: Zenith</option>
                <option value="cheque :union">Chèque: Union</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="Donnateur" className="form-label">Don(s)</label>
              <input
                id="Donnateur"
                type="text"
                className="form-control"
                placeholder="Donnateur"
                value={paymentDetails.Donnateur}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, Donnateur: e.target.value })}
                
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="montant" className="form-label">Montant</label>
              <input
                id="montant"
                type="number"
                className="form-control"
                placeholder="Montant"
                value={paymentDetails.montant}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, montant: e.target.value })}
                
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="datePaiement" className="form-label">Date de paiement</label>
              <input
                id="datePaiement"
                type="date"
                className="form-control"
                value={paymentDetails.datePaiement}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, datePaiement: e.target.value })}
                
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="statut" className="form-label">Statut</label>
              <select
                id="statut"
                className="form-select"
                value={paymentDetails.statut}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, statut: e.target.value })}
                
              >
                <option value="Payé">Payé</option>
                <option value="Avance">Avance</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">Enregistrer</button>
        </form>
      )}

      {/* Button to toggle records visibility */}
      <button className="btn btn-secondary mb-3" onClick={() => setShowRecords(!showRecords)}>
        {showRecords ? "Masquer les enregistrements" : "Afficher les enregistrements"}
      </button>

      {showRecords && (
        <div className="mb-4">
          <h3>Registre des Paiements</h3>
          <div className="d-flex justify-content-start gap-2 mb-3">
            <button onClick={exportToPDF} className="btn btn-success"
                style={{
                  display:
                    localStorage.getItem("userName") === "Admin" ||
                    (userRole === "Médecin" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                    (userRole === "Secrétaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                    (userRole === "Infirmier(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                    (userRole === "Archiviste" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                    (userRole === "Gestionnaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                    (userRole === "Etudiant(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] )
                      ? "none"
                      : "block",
                      
                }}
            >Exporter en PDF</button>
            <button onClick={exportToExcel} className="btn btn-info"
                style={{
                  display:
                    localStorage.getItem("userName") === "Admin" ||
                    (userRole === "Médecin" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                    (userRole === "Secrétaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                    (userRole === "Infirmier(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                    (userRole === "Archiviste" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                    (userRole === "Gestionnaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                    (userRole === "Etudiant(e)" && userAccessLevel === "Affichage" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) 
                      ? "none"
                      : "block",
                      
                }}
            >Exporter en Excel</button>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Ordre</th>
                  <th>Patient</th>
                  <th>Diagnostic</th>
                  <th>Age</th>
                  <th>Téléphone</th>
                  <th>Statut</th>
                  <th>Mode de paiement</th>
                  <th>Donnateur</th>
                  <th>Montant</th>
                  <th>Date</th>
                  <th style={{
                  display:
                    localStorage.getItem("userName") === "Admin" ||
                    (userRole === "Médecin" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                    (userRole === "Secrétaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                    (userRole === "Infirmier(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                    (userRole === "Archiviste" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                    (userRole === "Gestionnaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                    (userRole === "Etudiant(e)" && userAccessLevel === "Affichage" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] )
                      ? "none"
                      : "block",
                      
                }} >Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentRecords.map(record => (
                  <tr key={record._id}>
                    <td>{record.ordre}</td>
                    <td>{record.patientName}</td>
                    <td>{record.diagnostic}</td>
                    <td>{record.age}</td>
                    <td>{record.numeroTelephone}</td>
                    <td>{record.statut}</td>
                    <td>{record.modePaiement}</td>
                    <td>{record.Donnateur}</td>
                    <td>{record.montant}</td>
                    <td>{record.datePaiement}</td>
                    <td>
                      <button onClick={() => handleEdit(record._id)} className="btn btn-warning btn-sm me-2" 
                           style={{
                            display:
                              localStorage.getItem("userName") === "Admin" ||
                              (userRole === "Médecin" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                              (userRole === "Secrétaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                              (userRole === "Infirmier(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                              (userRole === "Archiviste" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                              (userRole === "Gestionnaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                              (userRole === "Etudiant(e)" && userAccessLevel === "Affichage" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] )
                                ? "none"
                                : "block",
                                
                          }}
                        
                        >Modifier</button>
                      <button onClick={() => handleDelete(record._id)} className="btn btn-danger btn-sm"
                             style={{
                              display:
                                localStorage.getItem("userName") === "Admin" ||
                                (userRole === "Médecin" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                                (userRole === "Secrétaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                                (userRole === "Infirmier(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                                (userRole === "Archiviste" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                                (userRole === "Gestionnaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                                (userRole === "Etudiant(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                                (userRole === "Médecin" && userAccessLevel === "Affichage- Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                                (userRole === "Secrétaire" && userAccessLevel === "Affichage- Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                                (userRole === "Infirmier(e)" && userAccessLevel === "Affichage- Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                                (userRole === "Archiviste" && userAccessLevel === "Affichage- Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                                (userRole === "Gestionnaire" && userAccessLevel === "Affichage- Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                                (userRole === "Etudiant(e)" && userAccessLevel === "Affichage- Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] )
              
                               
                                  ? "none"
                                  : "block",
                                  
                            }}
                        >Supprimer</button>
                      <button onClick={() => exportSingleToPDF(record)} className="btn btn-success btn-sm me-2"
                           style={{
                            display:
                              localStorage.getItem("userName") === "Admin" ||
                              (userRole === "Médecin" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                              (userRole === "Secrétaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                              (userRole === "Infirmier(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                              (userRole === "Archiviste" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                              (userRole === "Gestionnaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                              (userRole === "Etudiant(e)" && userAccessLevel === "Affichage" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) 
                                ? "none"
                                : "block",
                                
                          }}
                        >Exporter en PDF</button>
                      <button onClick={() => exportSingleToExcel(record)} className="btn btn-info btn-sm"
                             style={{
                              display:
                                localStorage.getItem("userName") === "Admin" ||
                                (userRole === "Médecin" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                                (userRole === "Secrétaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                                (userRole === "Infirmier(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                                (userRole === "Archiviste" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                                (userRole === "Gestionnaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                                (userRole === "Etudiant(e)" && userAccessLevel === "Affichage" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] )
                                  ? "none"
                                  : "block",
                                  
                            }}
                        >Exporter en Excel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientSolvable;