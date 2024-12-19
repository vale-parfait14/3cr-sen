import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]); // État pour stocker les alertes récupérées depuis la base de données
  const [searchTerm, setSearchTerm] = useState(''); // État pour la recherche
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetch('https://threecr-sen-1.onrender.com/api/alerts') // URL du backend pour récupérer les alertes
        .then((response) => response.json())
        .then((data) => setAlerts(data)) // Mettre à jour l'état avec les alertes récupérées
        .catch((err) => console.error('Erreur lors de la récupération des alertes', err));
    }, 1000); // Intervalle de 5 secondes

    // Nettoyage de l'intervalle au démontage du composant
    return () => clearInterval(intervalId);
  }, []); // L'effet s'exécute une seule fois, au montage du composant

  

  // Filtrer les alertes en fonction du texte recherché
  const filteredAlerts = alerts.filter((alert) =>
    alert.message.toLowerCase().includes(searchTerm.toLowerCase()) // Filtre insensible à la casse
  );

  // Fonction pour supprimer une alerte par son ID
  const handleDeleteAlert = (id) => {
    
    if(window.confirm("Confirmez la suppression !")){
       
    fetch(`https://threecr-sen-1.onrender.com/api/alerts/${id}`, {
      method: 'DELETE', // Méthode HTTP DELETE
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.alert) {
          // Si l'alerte est supprimée, on met à jour l'état en retirant l'alerte supprimée
          setAlerts(alerts.filter((alert) => alert._id !== id));
        }
      })
      .catch((err) => console.error('Erreur lors de la suppression de l\'alerte', err));
  };
  };

  // Fonction pour télécharger en PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Liste des actions effectuées par les utilisateurs", 14, 10);
    doc.autoTable({
      head: [['Notification(s)']],
      body: filteredAlerts.map(alert => [alert.message]),
    });
    doc.save('alertes_utilisateurs.pdf');
  };

  // Fonction pour télécharger en Excel
  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredAlerts.map(alert => ({
      Message: alert.message,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Alertes");
    XLSX.writeFile(wb, 'alertes_utilisateurs.xlsx');
  };

  // Fonction pour télécharger en Word
  const downloadWord = () => {
    const doc = new Blob([`
      Liste des alertes effectuées par les utilisateurs\n\n
      ${filteredAlerts.map(alert => ` Message: ${alert.message}`).join('\n')}
    `], { type: 'application/msword' });
    saveAs(doc, 'alertes_utilisateurs.doc');
  };

  if (!alerts || alerts.length === 0) return null; // Ne rien afficher si aucune alerte

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Liste des actions effectuées par les utilisateurs</h3>
      
      {/* Barre de recherche */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher une alerte..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Mettre à jour le terme de recherche
        />
      </div>

      {/* Afficher les alertes filtrées */}
      {filteredAlerts.length > 0 ? (
        <>
          <div>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Notifications</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map((alert) => (
                  <tr key={alert._id}>
                    <td>{alert.message}</td>
                    <td>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleDeleteAlert(alert._id)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Boutons de téléchargement */}
            <div className="mt-4">
              <button className="btn btn-primary" onClick={downloadPDF}>Télécharger en PDF</button>
              <button className="btn btn-success ml-2" onClick={downloadExcel}>Télécharger en Excel</button>
              <button className="btn btn-warning ml-2" onClick={downloadWord}>Télécharger en Word</button>
            </div>
          </div>
        </>
      ) : (
        <div className="alert alert-info">Aucune alerte ne correspond à votre recherche.</div>
      )}
    </div>
  );
};

export default Alerts;
