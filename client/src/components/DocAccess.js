import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DocAccess = () => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password === '789') {
      toast.success('Accès accordé !');
      navigate('/doctors');
    } else {
      toast.error('Mot de passe incorrect !');
    }
  };
  useEffect(() => {
    // Intercepter la tentative de retour arrière
    const handlePopState = (e) => {
      // Empêcher la navigation en arrière
      window.history.pushState(null, '', window.location.href);
    };

    // Ajouter un événement 'popstate' pour empêcher l'utilisateur de revenir en arrière
    window.history.pushState(null, '', window.location.href); // Empêche de revenir en arrière
    window.addEventListener('popstate', handlePopState);

    // Nettoyer l'écouteur d'événements lors du démontage du composant
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); // L'effet se déclenche une seule fois, lors du montage du composant

  return (
    <div className="doc-access-container">
      <form onSubmit={handleSubmit} className="access-form">
        <button
          type="button"
          onClick={() => navigate('/patients')}
          className="back-button"
        >
          Retour à l'accueil
        </button>

        <h2>Authentification Médecin</h2>

        <div className="input-container">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            required
          />
        </div>

        <button type="submit" className="submit-button">
          Accéder
        </button>
      </form>

      <ToastContainer />
    </div>
  );
};

export default DocAccess;
