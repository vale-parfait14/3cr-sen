// Authentifications.js
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ConnectionHistory from './ConnectionHistory';


const Authentification = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ name: '', password: '' });
  const [users, setUsers] = useState([]);
  const [isLoginMode, setIsLoginMode] = useState(true);  // Toggle entre mode connexion et inscription

  // Charger les utilisateurs depuis l'API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://threecr-sen.onrender.com/users'); // API pour récupérer les utilisateurs
        setUsers(response.data);
      } catch (error) {
        toast.error('Erreur lors de la récupération des utilisateurs');
      }
    };
    fetchUsers();
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

  // Gérer les changements dans le formulaire de connexion
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Gérer la connexion
 // Lors de l'enregistrement d'une connexion
const handleLogin = async (e) => {
  e.preventDefault();
  const user = users.find((user) => user.name === loginData.name && user.password === loginData.password);

  if (user) {
    // Sauvegarder les informations de l'utilisateur dans le localStorage
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userAccessLevel', user.accessLevel);
    localStorage.setItem('userName', user.name);
    localStorage.setItem('userService', user.service);

    // Enregistrer l'historique de connexion dans le localStorage
    const connectionHistory = JSON.parse(localStorage.getItem('connectionHistory')) || [];
    const now = new Date();
    const formattedDate = formatDateTime(now);  // Utiliser la fonction importée pour formater la date et l'heure
    const newConnection = {
      userName: user.name,
      date: formattedDate.split(',')[0], // La date sans l'heure
      time: formattedDate.split(',')[1].trim(), // L'heure seulement
      userService: user.service, // Ajoutez ici le service utilisé (par exemple, MonService ou 'Google')
    };
    connectionHistory.push(newConnection);
    localStorage.setItem('connectionHistory', JSON.stringify(connectionHistory));

    toast.success('Connexion réussie');
    setLoginData({ name: '', password: '' });
    navigate('/patients'); // Rediriger vers une page de tableau de bord (exemple)
  } else {
    toast.error('Nom d\'utilisateur ou mot de passe incorrect');
  }
};

 const formatDateTime = (date) => {
    const options = {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    };
    return new Date(date).toLocaleString('fr-FR', options);
  };
  

  // Gérer l'inscription d'un nouvel utilisateur
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!loginData.name || !loginData.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      const newUser = {
        name: loginData.name,
        password: loginData.password,
        role: 'Etudiant(e)', // Par défaut, rôle d'étudiant
        accessLevel: 'Limité', // Par défaut, accès limité
        service: loginData.service, // Par défaut, service Google
      };
      await axios.post('https://threecr-sen.onrender.com/users', newUser); // API POST pour ajouter un utilisateur
      toast.success('Utilisateur créé avec succès');
      setIsLoginMode(true); // Passer en mode connexion après l'inscription
      setLoginData({ name: '', password: '' });
    } catch (error) {
      toast.error('Erreur lors de l\'inscription');
    }
  };
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // 1 second

    return () => clearTimeout(timer);
  }, []);

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
    <div className="container mt-5">
      <h2 className="text-center mb-4">{isLoginMode ? 'Se connecter' : 'Créer un compte'}</h2>

      <div className="row justify-content-center">
        <div className="col-md-6">
          {/* Formulaire de connexion ou d'inscription */}
          <form
            onSubmit={isLoginMode ? handleLogin : handleRegister}
            className="card p-4 shadow-sm"
          >
            <div className="mb-3">
              <label className="form-label">Nom d'utilisateur</label>
              <input
                type="text"
                name="name"
                value={loginData.name}
                onChange={handleLoginChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                className="form-control"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Se connecter
            </button>
            <button onClick={() => navigate('/usermanagement')} className="btn btn-secondary w-100 mt-2">
              Retour
            </button>
          </form>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Authentification;
