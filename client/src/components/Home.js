import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Home.css";
const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // 1 second

    return () => clearTimeout(timer);
  }, []);
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <img
            src="https://i.pinimg.com/originals/82/ff/4f/82ff4f493afb72f8e0acb401c1b7498f.gif"
            alt="Loading"
            className="mb-3"
            style={{ width: '200px',  borderRadius:"200px"}}
          />
          <div className="loading-text text-muted">Chargement en cours...</div>
        </div>
      </div>
    );
  }
  

  return (
    <div className="container-fluid">
      <div className="row justify-content-center mt-5 bg-light rounded-5 shadow-lg ms-2 me-2">
        <div className="col-12 text-center">
          <h1 className="display-4 text-secondary">BIENVENUE AU CENTRE HOSPITALIER NATIONAL FANN</h1>
          <p className="lead text-secondary">Choisissez un service à visiter :</p>
        </div>
      </div>

      <div className="row justify-content-center mt-4 bg-light rounded-5 shadow-lg ms-2 me-2 pt-3">
        <div className="col-12 col-md-4 mb-3">
          <button
            onClick={() => navigate('/auth')}
            className="btn btn-primary btn-lg w-100"
          >
            CUOMO
          </button>
        </div>
        <div className="col-12 col-md-4 mb-3">
          <button
            onClick={() => navigate('/auth')}
            className="btn btn-success btn-lg w-100"
          >
            CTCV
          </button>
        </div>
        <div className="col-12 col-md-4 mb-3">
          <button
            onClick={() => navigate('/auth')}
            className="btn btn-danger btn-lg w-100"
          >
            CARDIOLOGIE
          </button>
          
        </div>
        <div className="col-12 col-md-4 mb-3">
          <button
            onClick={() => navigate('/auth')}
            className="btn btn-secondary btn-lg w-100"
          >
            REANIMATION
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default Home;
