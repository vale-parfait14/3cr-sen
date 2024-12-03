import React, { useState, useEffect } from 'react';
import { jsPDF } from "jspdf"; // Import de jsPDF pour la génération de PDF
import { useNavigate } from 'react-router-dom';

const UserConnection = () => {
  const [connections, setConnections] = useState([]);
  const [showList, setShowList] = useState(true); // Etat pour afficher ou masquer la liste
  const [searchTerm, setSearchTerm] = useState(""); // Etat pour la recherche
  const [filteredConnections, setFilteredConnections] = useState([]); // Connexions filtrées par recherche
    const navigate = useNavigate();
  useEffect(() => {
    // Récupérer les connexions du localStorage ou d'une API
    const storedConnections = JSON.parse(localStorage.getItem("connections")) || [];
    setConnections(storedConnections);
    setFilteredConnections(storedConnections);
  }, []);

  useEffect(() => {
    // Filtrer les connexions en fonction du terme de recherche
    if (searchTerm) {
      const filtered = connections.filter(
        (connection) =>
          connection.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          connection.date.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredConnections(filtered);
    } else {
      setFilteredConnections(connections);
    }
  }, [searchTerm, connections]);

  // Ajouter une nouvelle connexion
  const addConnection = () => {
    const userName = localStorage.getItem("userName");
    const newConnection = {
      userName,
      date: new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }).format(new Date()),
    };

    const updatedConnections = [...connections, newConnection];
    setConnections(updatedConnections);
    setFilteredConnections(updatedConnections);
    localStorage.setItem("connections", JSON.stringify(updatedConnections));
  };

  // Fonction pour supprimer toutes les connexions
  const deleteAllConnections = () => {
    setConnections([]);
    setFilteredConnections([]);
    localStorage.removeItem("connections");
  };

  // Fonction pour exporter la liste sous forme de PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Historique des Connexions", 20, 10);

    let yPosition = 20;
    filteredConnections.forEach((connection, index) => {
      yPosition += 10;
      doc.text(`${index + 1}. ${connection.userName} - ${connection.date}`, 20, yPosition);
    });

    doc.save("historique_connexions.pdf");
  };

  return (
    <div className="connections-list">
      <h3>Historique des Connexions</h3>

      {/* Bouton pour afficher/masquer la liste */}
      <button onClick={() => setShowList(!showList)} className="btn btn-info mb-3">
        {showList ? "Masquer la liste" : "Afficher la liste"}
      </button>

      {/* Champ de recherche */}
      <input
        type="text"
        placeholder="Rechercher par nom ou date"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="form-control mb-3"
      />

      {/* Afficher la liste si `showList` est vrai */}
      {showList && (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Date et Heure</th>
              </tr>
            </thead>
            <tbody>
              {filteredConnections.map((connection, index) => (
                <tr key={index}>
                  <td>{connection.userName}</td>
                  <td>{connection.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Boutons d'actions */}
      <div className="mt-3">
        <button onClick={()=> navigate('/patients')} className="btn btn-success mb-3">
          Retour à la liste des patients
        </button>
        <button onClick={deleteAllConnections} className="btn btn-danger mb-3 ms-2">
          Supprimer toutes les connexions
        </button>
        <button onClick={exportToPDF} className="btn btn-primary mb-3 ms-2">
          Exporter en PDF
        </button>
      </div>
    </div>
  );
};

export default UserConnection;
