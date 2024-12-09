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
    <div className="container min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light rounded-3 mt-5 mb-5 p-2">
      <div className="text-center mb-5">
        <h3 className="display-4 mb-3 text-secondary">Choisissez votre rôle:</h3>
        {/*<h1 className="lead">Choisissez votre rôle :</h1>*/}
      </div>

      <div className="row g-4 mb-5 w-100 justify-content-center bg-secondary p-4 rounded-3">
        <div className="col-12 col-md-6 col-lg-3">
          <button 
            onClick={() => navigate('/passwordprompt')}
            className="btn btn-primary w-100 py-3 shadow-sm"
          >
            ADMINISTRATEUR
          </button>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <button 
            onClick={() => navigate('/authentifications')}
            className="btn btn-success w-100 py-3 shadow-sm"
          >
            MEDECIN
          </button>
        </div>
       
        <div className="col-12 col-md-6 col-lg-3">
          <button 
            onClick={() => navigate('/authentifications')}
            className="btn btn-success w-100 py-3 shadow-sm"
          >
            SECRETAIRE
          </button>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <button 
            onClick={() => navigate('/authentifications')}
            className="btn btn-dark w-100 py-3 shadow-sm"
          >
            INFIRMIER(E)
          </button>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <button 
            onClick={() => navigate('/authentifications')}
            className="btn btn-info w-100 py-3 shadow-sm"
          >
            ARCHIVISTE
          </button>
        </div>
        
        <div className="col-12 col-md-6 col-lg-3">
          <button 
            onClick={() => navigate('/authentifications')}
            className="btn btn-warning w-100 py-3 shadow-sm"
          >
            GESTIONNAIRE FINANCIER(E)
          </button>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <button 
            onClick={() => navigate('/authentifications')}
            className="btn btn-danger w-100 py-3 shadow-sm"
          >
            ETUDIANT(E)
          </button>
        </div>

        
        <div className="col-12 col-md-6 col-lg-3">
          <button 
            onClick={() => navigate("/iconographie")}
            className="btn btn-danger w-100 py-3 shadow-sm"
          >
            ICONOGRAPHIE
          </button>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <button 
            onClick={() => navigate("/garde")}
            className="btn btn-danger w-100 py-3 shadow-sm"
          >
            GARDE ET ASTRINTE
          </button>
        </div>
      </div>

      <button 
        onClick={() => navigate('/')}
        className="btn btn-outline-secondary px-4"
      >
        RETOUR VERS L'ACCUEIL
      </button>
    </div>
  );
};

export default Role;
