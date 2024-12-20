import {React,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
const Role = () => {
  const navigate = useNavigate();
  useEffect(() => {
    // Intercepter la tentative de retour arrière
    const handlePopState = (e) => {
      // Empêcher la navigation en arrière
      window.history.pushState(null, "", window.location.href);
    };

    // Ajouter un événement 'popstate' pour empêcher l'utilisateur de revenir en arrière
    window.history.pushState(null, "", window.location.href); // Empêche de revenir en arrière
    window.addEventListener("popstate", handlePopState);

    // Nettoyer l'écouteur d'événements lors du démontage du composant
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []); // L'effet se déclenche une seule fois, lors du montage du composant

  return (
    <div className="container min-vh-100 d-flex flex-column justify-content-center align-items-center">
      <div className="text-center mb-5 bg-light p-4 rounded-3">
        <h1 className="display-4 mb-3 text-secondary">GESTION GENERAL DES UTILISATEURS ENTRE SERVICE</h1>
      </div>

      <div className="row g-4 mb-5 w-100 justify-content-center">
        <div className="col-12 col-md-6 col-lg-3">
          <button 
            onClick={() => navigate('/passwordprompt')}
            className="btn btn-primary w-100 py-3 shadow-sm"
          >
            ADMINISTRATEUR
          </button>
        </div>
        
        
        
        
        
      </div>

      <button 
        onClick={() => navigate('/role')}
        className="btn btn-outline-secondary px-4"
      >
        RETOUR VERS L'ACCUEIL
      </button>
    </div>
  );
};

export default Role;
