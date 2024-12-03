import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const ArchiveAccess = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]); // Etat pour l'historique
  const [searchTerm, setSearchTerm] = useState(''); // Etat pour la recherche
  const navigate = useNavigate();

  const passwords = {
    '1234': 'Chancia',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (passwords[password]) {
      const doctorName = passwords[password];
      // Enregistrer le nom du médecin dans le localStorage
      localStorage.setItem('doName', doctorName);
      // Mettre à jour l'historique
      updateHistory(doctorName);
      // Naviguer vers la page archive
      navigate('/archive');
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
        <button onClick={() => navigate('/role')} className="auth-button auth-back-button">
          Retour au choix du rôle
        </button>
      </form>
    </div>
  );
};

export default ArchiveAccess;
