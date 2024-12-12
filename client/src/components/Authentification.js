import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ConnectionHistory from './ConnectionHistory';

const Authentifications = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ name: '', password: '' });
  const [users, setUsers] = useState([]);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [cachedUsers, setCachedUsers] = useState(() => {
    const cached = localStorage.getItem('cachedUsers');
    return cached ? JSON.parse(cached) : [];
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Utilise d'abord les utilisateurs en cache
        if (cachedUsers.length > 0) {
          setUsers(cachedUsers);
          setLoading(false);
        }
        
        // Puis met à jour depuis l'API
        const response = await axios.get('https://threecr-sen.onrender.com/users');
        setUsers(response.data);
        // Met à jour le cache
        localStorage.setItem('cachedUsers', JSON.stringify(response.data));
        setCachedUsers(response.data);
        setLoading(false);
      } catch (error) {
        if (cachedUsers.length === 0) {
          toast.error('Erreur lors de la récupération des utilisateurs');
        }
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const preventBack = () => {
      window.history.forward();
    };

    window.addEventListener('load', preventBack);
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        preventBack();
      }
    });

    return () => {
      window.removeEventListener('load', preventBack);
      window.removeEventListener('pageshow', preventBack);
    };
  }, []);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const formatDateTime = (date) => {
    const options = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    return new Intl.DateTimeFormat('fr-FR', options).format(date);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = users.find(
        (user) => user.name === loginData.name && user.password === loginData.password
      );

      if (user) {
        const userData = {
          role: user.role,
          accessLevel: user.accessLevel,
          name: user.name,
          service: user.service
        };

        Object.entries(userData).forEach(([key, value]) => {
          localStorage.setItem(`user${key.charAt(0).toUpperCase() + key.slice(1)}`, value);
        });

        const connectionHistory = JSON.parse(localStorage.getItem('connectionHistory') || '[]');
        const now = new Date();
        const formattedDate = formatDateTime(now);

        connectionHistory.push({
          userName: user.name,
          date: formattedDate.split(',')[0].trim(),
          time: formattedDate.split(',')[1].trim(),
          userService: user.service,
        });

        localStorage.setItem('connectionHistory', JSON.stringify(connectionHistory));

        toast.success('Connexion réussie');
        setLoginData({ name: '', password: '' });
        navigate('/patients');
      } else {
        toast.error('Nom d\'utilisateur ou mot de passe incorrect');
      }
    } catch (error) {
      toast.error('Erreur lors de la connexion');
    }
  };

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
        role: 'Etudiant(e)',
        accessLevel: 'Limité',
        service: loginData.service,
      };
      await axios.post('https://threecr-sen.onrender.com/users', newUser);
      
      // Mise à jour du cache après l'inscription
      const updatedUsers = [...users, newUser];
      localStorage.setItem('cachedUsers', JSON.stringify(updatedUsers));
      setCachedUsers(updatedUsers);
      setUsers(updatedUsers);
      
      toast.success('Utilisateur créé avec succès');
      setIsLoginMode(true);
      setLoginData({ name: '', password: '' });
    } catch (error) {
      toast.error('Erreur lors de l\'inscription');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <img
            src="https://i.pinimg.com/originals/82/ff/4f/82ff4f493afb72f8e0acb401c1b7498f.gif"
            alt="Loading"
            className="mb-3"
            style={{ width: '200px', borderRadius: "200px" }}
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

export default Authentifications;
