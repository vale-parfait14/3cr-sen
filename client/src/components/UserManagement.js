import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import Alerts from './Alerts';
import 'react-toastify/dist/ReactToastify.css';

const firebaseConfig = {
  apiKey: "AIzaSyDSQ0cQa7TISpd_vZWVa9dWMzbUUl-yf38",
  authDomain: "basecenterdb.firebaseapp.com",
  projectId: "basecenterdb",
  storageBucket: "basecenterdb.firebasestorage.app",
  messagingSenderId: "919766148380",
  appId: "1:919766148380:web:30db9986fa2cd8bb7106d9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    } catch (error) {
      toast.error('Erreur de chargement des utilisateurs');
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData.name || !userData.password || !userData.role || !userData.accessLevel || !userData.service) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      if (editUserId) {
        await updateDoc(doc(db, 'users', editUserId), userData);
        toast.success(`${userData.name} modifié avec succès`);
      } else {
        await addDoc(collection(db, 'users'), userData);
        toast.success(`${userData.name} ajouté avec succès`);
      }
      setUserData({ name: '', password: '', role: '', accessLevel: '', service: '' });
      setEditUserId(null);
      fetchUsers();
    } catch (error) {
      toast.error('Erreur lors de l\'opération');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDelete = async (id, userName) => {
    if (window.confirm(`Voulez-vous vraiment supprimer ${userName} ?`)) {
      try {
        await deleteDoc(doc(db, 'users', id));
        toast.success(`${userName} supprimé avec succès`);
        fetchUsers();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const user = users.find(user => user.name === loginData.name && user.password === loginData.password);

    if (user) {
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userAccessLevel', user.accessLevel);
      localStorage.setItem('userService', user.service);
      localStorage.setItem('userName', user.name);
      navigate('/patients');
    } else {
      toast.error('Identifiants incorrects');
    }
  };

  const handleEdit = (index) => {
    setUserData(users[index]);
    setEditUserId(users[index].id);
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4 text-center">Gestion des utilisateurs</h1>

      {isLoginMode ? (
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
              <p className="text-center mt-3">
                Pas encore inscrit ? <button type="button" onClick={() => setIsLoginMode(false)} className="btn btn-link">Créer un compte</button>
              </p>
            </form>
          </div>
        </div>
      ) : (
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-12">
            <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
              <h2 className="text-center mb-4">
                {editUserId ? 'Modifier' : 'Ajouter'} un utilisateur
              </h2>
              <div className="d-flex flex-column flex-md-row gap-3">
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
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                </div>

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
                      {accessLevels.map(level => (
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
                      {services.map(service => (
                        <option key={service} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <button type="submit" className="btn btn-success w-100">
                      {editUserId ? 'Modifier' : 'Ajouter'} l'utilisateur
                    </button>
                    <p className="text-center mt-3">
                      Connectez-vous directement !{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/authentifications')}
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

      <h2 className="mt-5 mb-3 text-center">Liste des utilisateurs</h2>
      <button onClick={() => navigate('/role')} className="btn btn-secondary w-100 mt-3">Retour</button>

      <ul className="list-group mt-3">
        {users.length === 0 ? (
          <p className="text-center">Aucun utilisateur ajouté</p>
        ) : (
          users.map((user, index) => (
            <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center flex-column flex-md-row fw-bold mb-3">
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

                <div className="d-flex flex-column align-items-center mt-2 mt-md-0 w-md-auto">
                  <button onClick={() => handleEdit(index)} className="btn btn-warning btn-sm mb-2 mb-md-0 w-100 w-md-auto">Modifier</button>
                  <button onClick={() => handleDelete(user.id, user.name)} className="btn btn-danger btn-sm w-100 w-md-auto mt-2">Supprimer</button>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>

      <Alerts/>
      <ToastContainer />
    </div>
  );
};

export default UserManagement;
