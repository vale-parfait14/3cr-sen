import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import Alerts from './Alerts';

const roles = ['Admin', 'Médecin', 'Secrétaire', 'Infirmier(e)', 'Archiviste', 'Gestionnaire', 'Etudiant(e)'];
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
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://threecr-sen.onrender.com/users'); // API avec /users
        setUsers(response.data);
      } catch (error) {
        toast.error('Erreur de chargement des utilisateurs');
      }
    };
    fetchUsers();
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
    
    // Validate required fields using object destructuring
    const { name, password, role, accessLevel, service } = userData;
    if (!name || !password || !role || !accessLevel || !service) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
  
    const API_URL = 'https://threecr-sen.onrender.com/users';
    
    try {
      if (editUserId !== null) {
        // Edit existing user with optimistic update
        const userId = users[editUserId]._id;
        setUsers(prevUsers => {
          const newUsers = [...prevUsers];
          newUsers[editUserId] = { ...newUsers[editUserId], ...userData };
          return newUsers;
        });
        
        await axios.put(`${API_URL}/${userId}`, userData);
        toast.success('Utilisateur modifié avec succès');
      } else {
        // Add new user with optimistic update
        const tempId = Date.now();
        setUsers(prevUsers => [...prevUsers, { ...userData, _id: tempId }]);
        
        await axios.post(API_URL, userData);
        toast.success('Utilisateur ajouté avec succès');
      }
  
      // Reset form state
      setEditUserId(null);
      setUserData({ name: '', password: '', role: '', accessLevel: '', service: '' });
      
    } catch (error) {
      // Revert optimistic update on error
      toast.error(editUserId !== null ? 
        'Erreur lors de la modification de l\'utilisateur' : 
        'Erreur lors de l\'ajout de l\'utilisateur'
      );
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
    const confirmation = window.confirm("Confirmation de la suppression : ")
    try {
      await axios.delete(`https://threecr-sen.onrender.com/users/${id}`); // API DELETE
      setUsers(users.filter(user => user._id !== id));
      toast.success('Utilisateur supprimé avec succès');
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
      localStorage.setItem('userName', user.name);
      toast.success('Connexion réussie');
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
    <div className="container mt-4">
      <h1 className="mb-4 text-center">Gestion des utilisateurs</h1>

      {/* Formulaire de connexion */}
      {isLoginMode ? (
        <div className="row justify-content-center">
          <div className="col-md-6">
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
          <div className="col-md-6">
            <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
              <h2 className="text-center mb-4">{editUserId !== null ? 'Modifier' : 'Ajouter'} un utilisateur</h2>
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
              <button type="submit" className="btn btn-success w-100">
                {editUserId !== null ? 'Modifier' : 'Ajouter'} l'utilisateur
              </button>
              <p className="text-center mt-3">
                Connectez-vous directement ! <button type="button" onClick={() => setIsLoginMode(true)} className="btn btn-link">Se connecter</button>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Liste des utilisateurs */}
      <h2 className="mt-5 mb-3 text-center">Liste des utilisateurs</h2>
      <button onClick={() => navigate('/role')} className="btn btn-secondary w-100 mt-3">Retour</button>

      <ul className="list-group">
        {users.length === 0 ? (
          <p className="text-center">Aucun utilisateur ajouté</p>
        ) : (
          users.map((user, index) => (
            <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
              {user.name} ({user.role}, {user.accessLevel}, {user.service})
              <div>
                <button onClick={() => handleEdit(index)} className="btn btn-warning btn-sm me-2">Modifier</button>
                <button onClick={() => handleDelete(user._id)} className="btn btn-danger btn-sm">Supprimer</button>
              </div>
            </li>
          ))
        )}
      </ul>

      {/* Notification */}
      <ToastContainer />
      <Alerts/>
    </div>
  );
};

export default UserManagement;
