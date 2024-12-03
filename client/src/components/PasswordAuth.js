import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const PasswordAuth = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]); // Etat pour l'historique
  const [showHistory, setShowHistory] = useState(true); // Contrôle de l'affichage de l'historique
  const [searchTerm, setSearchTerm] = useState(''); // Etat pour la recherche
  const navigate = useNavigate();

  const passwords = {
    '789': 'Dr. Williams',
    
  };

  // Fonction pour récupérer l'historique depuis le localStorage
  const loadHistory = () => {
    const storedHistory = JSON.parse(localStorage.getItem('connectionHistory')) || [];
    setHistory(storedHistory);
  };

  // Charger l'historique au montage du composant
  useEffect(() => {
    loadHistory();
  }, []);

  // Mettre à jour l'historique dans le localStorage
  const updateHistory = (doctorName) => {
    const newHistory = [...history, { doctorName, timestamp: new Date().toLocaleString() }];
    localStorage.setItem('connectionHistory', JSON.stringify(newHistory));
    setHistory(newHistory); // Mettre à jour l'état local de l'historique
  };

  // Regrouper l'historique par jour
  const groupHistoryByDate = (history) => {
    const grouped = history.reduce((groups, entry) => {
      const date = new Date(entry.timestamp).toLocaleDateString(); // Utilise une date au format 'dd/mm/yyyy'
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
      return groups;
    }, {});
    
    return grouped;
  };

  // Fonction de filtrage par nom ou date
  const filterHistory = () => {
    return history.filter((entry) => {
      const searchDate = new Date(entry.timestamp).toLocaleDateString().includes(searchTerm);
      const searchName = entry.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
      return searchDate || searchName;
    });
  };

  // Fonction pour supprimer l'historique
  const clearHistory = () => {
    localStorage.removeItem('connectionHistory');
    setHistory([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (passwords[password]) {
      const doctorName = passwords[password];
      // Enregistrer le nom du médecin dans le localStorage
      localStorage.setItem('doName', doctorName);
      // Mettre à jour l'historique
      updateHistory(doctorName);
      // Naviguer vers la page patients
      navigate('/patients');
    } else {
      setError('Mot de passe incorrect');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Authentification</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Entrez votre mot de passe"
          className="auth-input"
        />
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="auth-button">
          Se connecter
        </button>
        <button
          type="button"
          onClick={() => navigate('/role')}
          className="auth-button auth-back-button"
        >
          Retour au choix du role
        </button>
      </form>
    </div>
  );
};

export default PasswordAuth;
