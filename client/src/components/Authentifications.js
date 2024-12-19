import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

const ComposantConnexion = () => {
  const navigate = useNavigate();
  const [donneesConnexion, setDonneesConnexion] = useState({ nom: '', motDePasse: '' });
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const recupererUtilisateurs = async () => {
      try {
        const reponse = await axios.get('https://threecr-sen-1.onrender.com/users', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        setUtilisateurs(reponse.data);
      } catch (erreur) {
        toast.error('Erreur de chargement des utilisateurs');
        console.error('Erreur:', erreur);
      }
    };
    recupererUtilisateurs();
  }, []);

  const gererChangementConnexion = (e) => {
    const { name, value } = e.target;
    setDonneesConnexion((donneesPrecedentes) => ({
      ...donneesPrecedentes,
      [name]: value.trim()
    }));
  };

  const gererConnexion = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const utilisateur = utilisateurs.find(
        (user) => user.name.trim() === donneesConnexion.nom && 
                 user.password === donneesConnexion.motDePasse
      );

      if (utilisateur) {
        // Utilisation de try-catch pour la gestion du localStorage
        try {
          localStorage.setItem('userRole', utilisateur.role);
          localStorage.setItem('userAccessLevel', utilisateur.accessLevel);
          localStorage.setItem('userName', utilisateur.name);
          localStorage.setItem('userService', utilisateur.service);


          
          toast.success('Connexion réussie');
          setDonneesConnexion({ nom: '', motDePasse: '' });
          navigate('/patients');
        } catch (storageError) {
          toast.error('Erreur de stockage des données');
          console.error('Erreur localStorage:', storageError);
        }
      } else {
        toast.error('Nom d\'utilisateur ou mot de passe incorrect');
      }
    } catch (error) {
      toast.error('Erreur lors de la connexion');
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">
          <form onSubmit={gererConnexion} className="card p-4 shadow-sm">
            <h2 className="text-center mb-4">Connexion</h2>
            
            <div className="mb-3">
              <label className="form-label">Nom d'utilisateur</label>
              <input
                type="text"
                name="nom"
                value={donneesConnexion.nom}
                onChange={gererChangementConnexion}
                className="form-control"
                required
                autoComplete="username"
                inputMode="text"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                name="motDePasse"
                value={donneesConnexion.motDePasse}
                onChange={gererChangementConnexion}
                className="form-control"
                required
                autoComplete="current-password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100"
              disabled={isLoading}
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
            
            <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => navigate('/role')}
                className="btn btn-link"
                disabled={isLoading}
              >
                Retour vers la page précédente
              </button>
            </div> 
          </form>
        </div>
      </div>
      <ToastContainer position="top-center" />
    </div>
  );
};

export default ComposantConnexion;
