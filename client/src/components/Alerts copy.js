import React, { useState, useEffect } from 'react';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]); // État pour stocker les alertes récupérées depuis la base de données
  const [searchTerm, setSearchTerm] = useState(''); // État pour la recherche

  // Récupérer les alertes depuis le backend au chargement du composant
  useEffect(() => {
    fetch('http://localhost:5002/api/alerts') // URL du backend pour récupérer les alertes
      .then((response) => response.json())
      .then((data) => setAlerts(data)) // Mettre à jour l'état avec les alertes récupérées
      .catch((err) => console.error('Erreur lors de la récupération des alertes', err));
  }, []);


  // Filtrer les alertes en fonction du texte recherché
  const filteredAlerts = alerts.filter((alert) =>
    alert.message.toLowerCase().includes(searchTerm.toLowerCase()) // Filtre insensible à la casse
  );

  // Fonction pour supprimer une alerte par son ID
  const handleDeleteAlert = (id) => {
    fetch(`http://localhost:5002/api/alerts/${id}`, {
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

  if (!alerts || alerts.length === 0) return null; // Ne rien afficher si aucune alerte

  return (
    <div className="container mt-4">
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
        filteredAlerts.map((alert) => (
          <div key={alert._id} className="alert alert-warning alert-dismissible fade show mb-3" role="alert">
            <p className="mb-0">{alert.message}</p>
            <button 
              type="button" 
              className="btn-close" 
              aria-label="Close"
              onClick={() => handleDeleteAlert(alert._id)} // Supprimer l'alerte au clic
            ></button>
          </div>
        ))
      ) : (
        <div className="alert alert-info">Aucune alerte ne correspond à votre recherche.</div>
      )}
    </div>
  );
};

export default Alerts;
