import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';


const ComposantConnexion = () => {
  const navigate = useNavigate();
  const [donneesConnexion, setDonneesConnexion] = useState({ nom: '', motDePasse: '' });
  const [utilisateurs, setUtilisateurs] = useState([]);

  useEffect(() => {
    const recupererUtilisateurs = async () => {
      try {
        const reponse = await axios.get('https://threecr-sen.onrender.com/users');
        setUtilisateurs(reponse.data);
      } catch (erreur) {
        toast.error('Erreur de chargement des utilisateurs');
      }
    };
    recupererUtilisateurs();
  }, []);

  const gererChangementConnexion = (e) => {
    const { name, value } = e.target;
    setDonneesConnexion((donneesPrecedentes) => ({
      ...donneesPrecedentes,
      [name]: value,
    }));
  };

  const gererConnexion = async (e) => {
    e.preventDefault();
    const utilisateur = utilisateurs.find(
      (user) => user.name === donneesConnexion.nom && user.password === donneesConnexion.motDePasse
    );

    if (utilisateur) {
      localStorage.setItem('roleUtilisateur', utilisateur.role);
      localStorage.setItem('niveauAcces', utilisateur.accessLevel);
      localStorage.setItem('nomUtilisateur', utilisateur.name);
      localStorage.setItem('serviceUtilisateur', utilisateur.service);
      
      toast.success('Connexion réussie');
      setDonneesConnexion({ nom: '', motDePasse: '' });
      navigate('/patients');
    } else {
      toast.error('Nom d\'utilisateur ou mot de passe incorrect');
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
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
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Se connecter
            </button>
            
    <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => navigate('/role')}
                className="btn btn-link"
              >
                retour vers la page pécédente
              </button>
            </div> 
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ComposantConnexion;
