import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginHistory from './ConnectionHistory';
import Alerts from './Alerts';
const roles = ['Admin','Médecin', 'Secrétaire', 'Infirmier(e)', 'Archiviste', 'Gestionnaire', 'Etudiant(e)'];
const accessLevels = ['Affichage', 'Affichage-Modification', 'Affichage-Modification-Suppression', 'Administrateur'];
const services = ["Cuomo", "Ctcv", "Cardiologie", "Réanimation"];

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [userData, setUserData] = useState({ name: '', password: '', role: '', accessLevel: '', service: '' });
  const [loginData, setLoginData] = useState({ name: '', password: '' });
  const [editUserId, setEditUserId] = useState(null);
  const [isLoginMode, setIsLoginMode] = useState(false);

  // Charger les utilisateurs depuis l'API
  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://threecr-sen.onrender.com/users'); // API avec /users
      setUsers(response.data);
    } catch (error) {
      toast.error('Erreur de chargement des utilisateurs');
    }
  };

  useEffect(() => {
    fetchUsers(); // Initial load
    
    const interval = setInterval(() => {
      fetchUsers(); // Refresh every 5 seconds
    }, 5000);
  
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);
  

  // Gérer les changements dans le formulaire de connexion
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Ajouter ou modifier un utilisateur
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData.name || !userData.password || !userData.role || !userData.accessLevel || !userData.service) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (editUserId !== null) {
      // Modifier un utilisateur existant
      try {
        await axios.put(`https://threecr-sen.onrender.com/users/${users[editUserId]._id}`, userData); // API PUT
        alert('Utilisateur modifié avec succès');
        setEditUserId(null);
        setUserData({ name: '', password: '', role: '', accessLevel: '', service: '' });
        fetchUsers(); // Recharger la liste des utilisateurs après modification
      } catch (error) {
        toast.error('Erreur lors de la modification de l\'utilisateur');
      }
    } else {
      // Ajouter un nouvel utilisateur
      try {
        await axios.post('https://threecr-sen.onrender.com/users', userData); // API POST
        alert('Utilisateur ajouté avec succès');
        setUserData({ name: '', password: '', role: '', accessLevel: '', service: '' });
        fetchUsers(); // Recharger la liste des utilisateurs après ajout
      } catch (error) {
        toast.error('Erreur lors de l\'ajout de l\'utilisateur');
      }
    }
  };

  // Gérer les changements dans le formulaire d'ajout/modification
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Supprimer un utilisateur
  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://threecr-sen.onrender.com/users/${id}`); // API DELETE
      setUsers(users.filter(user => user._id !== id));
      alert('Utilisateur supprimé avec succès');
      fetchUsers(); // Recharger la liste des utilisateurs après suppression
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  // Gérer la connexion
  const handleLogin = async (e) => {
    e.preventDefault();
    const user = users.find((user) => user.name === loginData.name && user.password === loginData.password);

    if (user) {
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userAccessLevel', user.accessLevel);
      localStorage.setItem('userService', user.service);
      localStorage.setItem('userName', user.name);
      alert('Connexion réussie');
      setLoginData({ name: '', password: '' });
      navigate('/patients');
    } else {
      toast.error('Nom d\'utilisateur ou mot de passe incorrect');
    }
  };

  // Modifier un utilisateur (pré-remplir les champs de formulaire)
  const handleEdit = (index) => {
    setUserData(users[index]);
    setEditUserId(index);
  };

  return (
    <div className="container mt-4 ">
      <h1 className="mb-4 text-center">Gestion des utilisateurs</h1>

      {/* Formulaire de connexion */}
      {isLoginMode ? (
        <div className="row  justify-content-center">
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
              <p className="text-center mt-3">
                Pas encore inscrit ? <button type="button" onClick={() => setIsLoginMode(false)} className="btn btn-link">Créer un compte</button>
              </p>
            </form>
          </div>
        </div>
      ) : (
        // Formulaire d'ajout/modification d'utilisateur
        <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-12">
          <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
            <h2 className="text-center mb-4">
              {editUserId !== null ? 'Modifier' : 'Ajouter'} un utilisateur
            </h2>
            <div className="d-flex flex-column flex-md-row gap-3">
              {/* Colonne 1 - Nom, Mot de passe, Rôle */}
              <div className="col-12 col-md-6">
                <div className="mb-3">
                  <label className="form-label">Nom</label>
                  <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Mot de passe</label>
                  <input
                    type="password"
                    name="password"
                    value={userData.password}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Rôle</label>
                  <select
                    name="role"
                    value={userData.role}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Sélectionner un rôle</option>
                    {roles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>
      
              {/* Colonne 2 - Niveau d'accès, Service */}
              <div className="col-12 col-md-6">
                <div className="mb-3">
                  <label className="form-label">Niveau d'accès</label>
                  <select
                    name="accessLevel"
                    value={userData.accessLevel}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Sélectionner un niveau d'accès</option>
                    {accessLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
      
                <div className="mb-3">
                  <label className="form-label">Service</label>
                  <select
                    name="service"
                    value={userData.service}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Sélectionner un service</option>
                    {services.map((service) => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>
                 {/* Bouton Soumettre */}
                <div>
              <button type="submit" className="btn btn-success w-100">
                {editUserId !== null ? 'Modifier' : 'Ajouter'} l'utilisateur
              </button>
              <p className="text-center mt-3">
                Connectez-vous directement !{' '}
                <button
                  type="button"
                  onClick={() => navigate('/authentification')}
                  className="btn btn-link"
                >
                  Se connecter
                </button>
              </p>
            </div>
              </div>
            </div>
      
           
            
          </form>
        </div>
      </div>
      
      )}

      {/* Liste des utilisateurs */}
      <h2 className="mt-5 mb-3 text-center">Liste des utilisateurs</h2>
      <button onClick={() => navigate('/role')} className="btn btn-secondary w-100 mt-3">Retour</button>

      <ul className="list-group mt-3">
  {users.length === 0 ? (
    <p className="text-center">Aucun utilisateur ajouté</p>
  ) : (
    users.map((user, index) => (
      <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center flex-column flex-md-row fw-bold mb-3">
        {/* Détails de l'utilisateur */}
        <div className="d-flex flex-column flex-md-row w-100 justify-content-between align-items-start">
          <div className="mb-2 mb-md-0">
            <h1 className="mb-2 fs-100 fs-md-4">{user.name}</h1>
            <div>
              <ul className="list-unstyled">
                <li className="fs-6 fs-md-5"><strong>Role:</strong> {user.role}</li>
                <li className="fs-6 fs-md-5"><strong>Accès:</strong> {user.accessLevel}</li>
                <li className="fs-6 fs-md-5"><strong>Service:</strong> {user.service}</li>
              </ul>
            </div>
          </div>

          {/* Actions Modifier et Supprimer */}
          <div className="d-flex flex-column align-items-center mt-2 mt-md-0  w-md-auto">
            <button onClick={() => handleEdit(index)} className="btn btn-warning btn-sm mb-2 mb-md-0 w-100 w-md-auto ">Modifier</button>
            <button onClick={() => handleDelete(user._id)} className="btn btn-danger btn-sm w-100 w-md-auto mt-2">Supprimer</button>
          </div>
        </div>
      </li>
    ))
  )}
</ul>


      {/* Notification */}
    {/*  <LoginHistory />*/}
      <Alerts/>
      <ToastContainer />
    </div>
  );
};

export default UserManagement;
