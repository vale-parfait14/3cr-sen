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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://threecr-sen.onrender.com/users');
        setUsers(response.data);
      } catch (error) {
        toast.error('Erreur de chargement des utilisateurs');
      }
    };
    fetchUsers();
  }, []);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { name, password, role, accessLevel, service } = userData;
    if (!name || !password || !role || !accessLevel || !service) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const API_URL = 'https://threecr-sen.onrender.com/users';
    
    try {
      if (editUserId !== null) {
        const userId = users[editUserId]._id;
        setUsers(prevUsers => {
          const newUsers = [...prevUsers];
          newUsers[editUserId] = { ...newUsers[editUserId], ...userData };
          return newUsers;
        });
        
        await axios.put(`${API_URL}/${userId}`, userData);
        toast.success('Utilisateur modifié avec succès');
      } else {
        const tempId = Date.now();
        setUsers(prevUsers => [...prevUsers, { ...userData, _id: tempId }]);
        
        await axios.post(API_URL, userData);
        toast.success('Utilisateur ajouté avec succès');
      }

      setEditUserId(null);
      setUserData({ name: '', password: '', role: '', accessLevel: '', service: '' });
      
    } catch (error) {
      toast.error(editUserId !== null ? 
        'Erreur lors de la modification de l\'utilisateur' : 
        'Erreur lors de l\'ajout de l\'utilisateur'
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Confirmer la suppression ?")) {
      try {
        await axios.delete(`https://threecr-sen.onrender.com/users/${id}`);
        setUsers(users.filter(user => user._id !== id));
        toast.success('Utilisateur supprimé avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const user = users.find(user => 
      user.name === loginData.name && user.password === loginData.password
    );

    if (user) {
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userAccessLevel', user.accessLevel);
      localStorage.setItem('userName', user.name);
      toast.success('Connexion réussie');
      setLoginData({ name: '', password: '' });
      navigate('/patients');
    } else {
      toast.error('Identifiants incorrects');
    }
  };

  const handleEdit = (index) => {
    setUserData(users[index]);
    setEditUserId(index);
  };

  return (
    <div className="container-fluid px-4">
      <div className="row">
        <div className="col-12">
          <h1 className="text-center my-4 text-primary">Gestion des utilisateurs</h1>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          {isLoginMode ? (
            <div className="card shadow-lg border-0 rounded-lg mt-3">
              <div className="card-header bg-primary text-white">
                <h3 className="text-center font-weight-light my-2">Connexion</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleLogin}>
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      placeholder="Nom"
                      value={loginData.name}
                      onChange={handleLoginChange}
                      required
                    />
                    <label htmlFor="name">Nom</label>
                  </div>
                  <div className="form-floating mb-3">
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      placeholder="Mot de passe"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      required
                    />
                    <label htmlFor="password">Mot de passe</label>
                  </div>
                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary btn-lg">Se connecter</button>
                  </div>
                </form>
              </div>
              <div className="card-footer text-center py-3">
                <div className="small">
                  <button 
                    className="btn btn-link" 
                    onClick={() => setIsLoginMode(false)}
                  >
                    Créer un compte
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card shadow-lg border-0 rounded-lg mt-3">
              <div className="card-header bg-success text-white">
                <h3 className="text-center font-weight-light my-2">
                  {editUserId !== null ? 'Modifier' : 'Ajouter'} un utilisateur
                </h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      placeholder="Nom"
                      value={userData.name}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="name">Nom</label>
                  </div>
                  
                  <div className="form-floating mb-3">
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      placeholder="Mot de passe"
                      value={userData.password}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="password">Mot de passe</label>
                  </div>

                  <div className="form-floating mb-3">
                    <select
                      className="form-select"
                      id="role"
                      name="role"
                      value={userData.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Sélectionner un rôle</option>
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    <label htmlFor="role">Rôle</label>
                  </div>

                  <div className="form-floating mb-3">
                    <select
                      className="form-select"
                      id="accessLevel"
                      name="accessLevel"
                      value={userData.accessLevel}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Sélectionner un niveau d'accès</option>
                      {accessLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    <label htmlFor="accessLevel">Niveau d'accès</label>
                  </div>

                  <div className="form-floating mb-3">
                    <select
                      className="form-select"
                      id="service"
                      name="service"
                      value={userData.service}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Sélectionner un service</option>
                      {services.map(service => (
                        <option key={service} value={service}>{service}</option>
                      ))}
                    </select>
                    <label htmlFor="service">Service</label>
                  </div>

                  <div className="d-grid">
                    <button type="submit" className="btn btn-success btn-lg">
                      {editUserId !== null ? 'Modifier' : 'Ajouter'} l'utilisateur
                    </button>
                  </div>
                </form>
              </div>
              <div className="card-footer text-center py-3">
                <div className="small">
                  <button 
                    className="btn btn-link" 
                    onClick={() => setIsLoginMode(true)}
                  >
                    Se connecter
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-12">
          <h2 className="text-center mb-4">Liste des utilisateurs</h2>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Nom</th>
                  <th>Rôle</th>
                  <th>Niveau d'accès</th>
                  <th>Service</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">Aucun utilisateur ajouté</td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.role}</td>
                      <td>{user.accessLevel}</td>
                      <td>{user.service}</td>
                      <td>
                        <button 
                          onClick={() => handleEdit(index)} 
                          className="btn btn-warning btn-sm me-2"
                        >
                          <i className="bi bi-pencil"></i> Modifier
                        </button>
                        <button 
                          onClick={() => handleDelete(user._id)} 
                          className="btn btn-danger btn-sm"
                        >
                          <i className="bi bi-trash"></i> Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="row mt-4 mb-5">
        <div className="col-12">
          <button 
            onClick={() => navigate('/role')} 
            className="btn btn-secondary w-100"
          >
            Retour
          </button>
        </div>
      </div>

      <ToastContainer />
      <Alerts />
    </div>
  );
};

export default UserManagement;
