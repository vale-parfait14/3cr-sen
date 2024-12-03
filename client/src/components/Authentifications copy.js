import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

const Authentification = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loginData, setLoginData] = useState({ name: '', password: '' });

  // Charger les utilisateurs depuis l'API
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5002/users'); // Remplacer par l'URL appropriée de l'API
      setUsers(response.data);
    } catch (error) {
      toast.error('Erreur de chargement des utilisateurs');
    }
  };

  useEffect(() => {
    fetchUsers();  // Charger les utilisateurs au premier rendu
  }, []);

  // Gérer les changements dans le formulaire de connexion
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Gérer la connexion
  const handleLogin = async (e) => {
    e.preventDefault();
    const user = users.find((user) => user.name === loginData.name && user.password === loginData.password);

    if (user) {
      // Sauvegarder les informations de l'utilisateur dans le localStorage
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userAccessLevel', user.accessLevel);
      localStorage.setItem('userService', user.service);
      localStorage.setItem('userName', user.name);

      toast.success('Connexion réussie');
      setLoginData({ name: '', password: '' });
      navigate('/patients');  // Rediriger vers la page des patients
    } else {
      toast.error('Nom d\'utilisateur ou mot de passe incorrect');
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4 text-center">Authentification</h1>

      {/* Formulaire de connexion */}
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <form onSubmit={handleLogin} className="card p-4 shadow-sm">
            <h2 className="text-center mb-4">Se connecter</h2>
            <div className="mb-3">
              <label className="form-label">Nom</label>
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
            <button type="submit" className="btn btn-primary w-100">Se connecter</button>
           <button onClick={() => navigate('/role')} className="btn btn-secondary w-100 mt-2">Retour</button>
          </form>
        </div>
      </div>

      {/* Notification */}
      <ToastContainer />
    </div>
  );
};

export default Authentification;
