import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Solvabilite = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]); // Etat pour l'historique
  const [showHistory, setShowHistory] = useState(true); // Contrôle de l'affichage de l'historique
  const [searchTerm, setSearchTerm] = useState(''); // Etat pour la recherche
  const navigate = useNavigate();

  const passwords = {
    '963': 'Brown',
  };

  const loadHistory = () => {
    const storedHistory = JSON.parse(localStorage.getItem('connectionHistory')) || [];
    setHistory(storedHistory);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const updateHistory = (doctorName) => {
    const newHistory = [...history, { doctorName, timestamp: new Date().toLocaleString() }];
    localStorage.setItem('connectionHistory', JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const groupHistoryByDate = (history) => {
    const grouped = history.reduce((groups, entry) => {
      const date = new Date(entry.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
      return groups;
    }, {});
    
    return grouped;
  };

  const filterHistory = () => {
    return history.filter((entry) => {
      const searchDate = new Date(entry.timestamp).toLocaleDateString().includes(searchTerm);
      const searchName = entry.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
      return searchDate || searchName;
    });
  };

  const clearHistory = () => {
    localStorage.removeItem('connectionHistory');
    setHistory([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (passwords[password]) {
      const doctorName = passwords[password];
      localStorage.setItem('doName', doctorName);
      updateHistory(doctorName);
      navigate('/patientsolvable');
    } else {
      setError('Mot de passe incorrect');
    }
  };

  return (
    <div id="solvabilite-container" className="solvabilite-container">
      <form onSubmit={handleSubmit} id="login-form" className="login-form">
        <h2 id="auth-title">Authentification</h2>
        <input
          id="password-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Entrez votre mot de passe"
          className="input-field"
        />
        {error && <p id="error-message" className="error-message">{error}</p>}
        <button type="submit" id="submit-button" className="submit-button">
          Se connecter
        </button>
        <button 
          onClick={() => navigate('/role')} 
          id="role-button"
          className="role-button"
        >
          Retour au choix du rôle
        </button>
      </form>
    </div>
  );
};

export default Solvabilite;
