import React, { useState } from 'react';
import DropboxChooser from 'react-dropbox-chooser';

const DropboxFileChooser = () => {
  // Créer un état pour stocker les fichiers sélectionnés pour chaque bouton
  const [files, setFiles] = useState(Array(15).fill(null));

  const handleFileSelect = (index, file) => {
    const newFiles = [...files];
    newFiles[index] = file;
    setFiles(newFiles);
  };

  const renderFileList = () => {
    return (
      <div>
        <h3>Fichiers sélectionnés :</h3>
        <ul>
          {files.map((file, index) => (
            file ? (
              <li key={index}>
                <strong>Button {index + 1}:</strong> {file.name} (ID: {file.id})
              </li>
            ) : null
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div>
      <h1>Sélectionnez des fichiers Dropbox</h1>
      
      {/* Générer 15 boutons, chacun avec un DropboxChooser distinct */}
      {Array.from({ length: 15 }, (_, index) => (
        <div key={index}>
          <button>
            Choisir un fichier pour le bouton {index + 1}
          </button>
          <DropboxChooser 
            appKey="YOUR_APP_KEY" // Remplacez par votre App Key Dropbox
            success={(files) => handleFileSelect(index, files[0])} // Prendre le premier fichier sélectionné
            cancel={() => console.log('Annulation')}
          />
        </div>
      ))}

      {renderFileList()} {/* Afficher la liste des fichiers choisis */}
    </div>
  );
};

export default DropboxFileChooser;




///////////////////////////////////////////////////////////////////////////////////
{/*
   import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import Alerts from "./Alerts"

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
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        const response = await axios.get('https://threecr-sen.onrender.com/users', {
          signal: controller.signal,
          timeout: 1000
        });
        setUsers(response.data);
      } catch (error) {
        if (!axios.isCancel(error)) {
          toast.error('Erreur de chargement des utilisateurs');
        }
      }
    }, 300);
  
    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
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
        toast.success('Utilisateur modifié avec succès');
        setEditUserId(null);
        setUserData({ name: '', password: '', role: '', accessLevel: '', service: '' });
      } catch (error) {
        toast.error('Erreur lors de la modification de l\'utilisateur');
      }
    } else {
      // Ajouter un nouvel utilisateur
      try {
        await axios.post('https://threecr-sen.onrender.com/users', userData); // API POST
        toast.success('Utilisateur ajouté avec succès');
        setUserData({ name: '', password: '', role: '', accessLevel: '', service: '' });
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
    <div className="container-fluid px-4">
      <div className="row g-4">
        <div className="col-12">
          <h1 className="display-4 text-center my-4">Gestion des utilisateurs</h1>
        </div>

        {isLoginMode ? (
          <div className="col-12 col-md-8 col-lg-6 mx-auto">
            <div className="card shadow-lg border-0 rounded-3">
              <div className="card-body p-4 p-sm-5">
                <h2 className="card-title text-center mb-4">Se connecter</h2>
                <form onSubmit={handleLogin}>
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="floatingName"
                      name="name"
                      value={loginData.name}
                      onChange={handleLoginChange}
                      placeholder="Nom"
                      required
                    />
                    <label htmlFor="floatingName">Nom</label>
                  </div>
                  <div className="form-floating mb-4">
                    <input
                      type="password"
                      className="form-control"
                      id="floatingPassword"
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="Mot de passe"
                      required
                    />
                    <label htmlFor="floatingPassword">Mot de passe</label>
                  </div>
                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary btn-lg">Se connecter</button>
                    <button 
                      type="button" 
                      onClick={() => setIsLoginMode(false)} 
                      className="btn btn-outline-secondary"
                    >
                      Créer un compte
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="col-12 col-lg-8 mx-auto">
            <div className="card shadow-lg border-0 rounded-3">
              <div className="card-body p-4 p-sm-5">
                <h2 className="card-title text-center mb-4">
                  {editUserId !== null ? 'Modifier' : 'Ajouter'} un utilisateur
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control"
                          id="floatingName"
                          name="name"
                          value={userData.name}
                          onChange={handleChange}
                          placeholder="Nom"
                          required
                        />
                        <label htmlFor="floatingName">Nom</label>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="form-floating">
                        <input
                          type="password"
                          className="form-control"
                          id="floatingPassword"
                          name="password"
                          value={userData.password}
                          onChange={handleChange}
                          placeholder="Mot de passe"
                          required
                        />
                        <label htmlFor="floatingPassword">Mot de passe</label>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="form-floating">
                        <select
                          className="form-select"
                          id="floatingRole"
                          name="role"
                          value={userData.role}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Sélectionner</option>
                          {roles.map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                        <label htmlFor="floatingRole">Rôle</label>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="form-floating">
                        <select
                          className="form-select"
                          id="floatingAccess"
                          name="accessLevel"
                          value={userData.accessLevel}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Sélectionner</option>
                          {accessLevels.map((level) => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                        <label htmlFor="floatingAccess">Niveau d'accès</label>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="form-floating">
                        <select
                          className="form-select"
                          id="floatingService"
                          name="service"
                          value={userData.service}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Sélectionner</option>
                          {services.map((service) => (
                            <option key={service} value={service}>{service}</option>
                          ))}
                        </select>
                        <label htmlFor="floatingService">Service</label>
                      </div>
                    </div>
                  </div>
                  <div className="d-grid gap-2 mt-4">
                    <button type="submit" className="btn btn-success btn-lg">
                      {editUserId !== null ? 'Modifier' : 'Ajouter'} l'utilisateur
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsLoginMode(true)} 
                      className="btn btn-outline-primary"
                    >
                      Se connecter
                    </button>
                    <button 
                      type="button"
                      onClick={() => navigate('/role')} 
                      className="btn btn-secondary"
                    >
                      Retour
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="col-12">
          <div className="card shadow-lg border-0 rounded-3 mt-4">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Liste des utilisateurs</h2>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
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
                        <tr key={user.id}>
                          <td>{user.name}</td>
                          <td>{user.role}</td>
                          <td>{user.accessLevel}</td>
                          <td>{user.service}</td>
                          <td>
                            <div className="btn-group">
                              <button 
                                onClick={() => handleEdit(index)} 
                                className="btn btn-warning btn-sm"
                              >
                                <i className="bi bi-pencil"></i> Modifier
                              </button>
                              <button 
                                onClick={() => handleDelete(user._id)} 
                                className="btn btn-danger btn-sm"
                              >
                                <i className="bi bi-trash"></i> Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
      <Alerts/>
    </div>
  );
};

export default UserManagement;

*/}




import React, { useState, useEffect } from 'react';
import DropboxChooser from 'react-dropbox-chooser';
import { useNavigate } from "react-router-dom";
import { saveAs } from 'file-saver';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { GlobalWorkerOptions, version } from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.js`;

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

const FileManager = () => {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortedFiles, setSortedFiles] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userAccessLevel, setUserAccessLevel] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "files"), (snapshot) => {
      const filesData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setFiles(filesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Get user role and access level from localStorage
    const role = localStorage.getItem('userRole');
    const accessLevel = localStorage.getItem('userAccessLevel');
    setUserRole(role);
    setUserAccessLevel(accessLevel);
  }, []);
  useEffect(() => {
    let filtered = [...files];
    
    // Filtrer selon le terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(file => 
        file.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new Date(file.timestamp).toLocaleString().includes(searchTerm)
      );
    }
    
    // Trier uniquement par `order`
    filtered.sort((a, b) => {
      const orderA = a.order || 0; // Utiliser 0 si `order` n'est pas défini
      const orderB = b.order || 0;
      return orderA - orderB; // Tri croissant basé uniquement sur `order`
    });

    setSortedFiles(filtered);
  }, [files, searchTerm]);

  const handleDropboxSuccess = async (selectedFiles) => {
    const newFiles = selectedFiles.map(file => ({
      name: file.name,
      link: file.link,
      title: '',
      comment: '',
      timestamp: new Date().toISOString(),
      order: 0 // Ajouter l'attribut order
    }));

    for (const file of newFiles) {
      await addDoc(collection(db, "files"), file);
    }
  };

  const handleTitleChange = async (id, newTitle) => {
    const fileRef = doc(db, "files", id);
    await updateDoc(fileRef, { title: newTitle });
  };

  const handleCommentChange = async (id, newComment) => {
    const fileRef = doc(db, "files", id);
    await updateDoc(fileRef, { comment: newComment });
  };

  const handleOrderChange = async (id, newOrder) => {
    const fileRef = doc(db, "files", id);
    await updateDoc(fileRef, { order: newOrder });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      const fileRef = doc(db, "files", id);
      await deleteDoc(fileRef);
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await fetch(file.link);
      const blob = await response.blob();
      saveAs(blob, file.name);
    } catch (error) {
      console.error('Échec du téléchargement:', error);
    }
  };

  const handleOpenLink = (link) => {
    window.open(link, '_blank');
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
      <h2 className="text-center mb-4">PROGRAMME OPERATOIRE</h2>

      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher par nom, titre, commentaire ou date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <button className="btn btn-primary mb-3" onClick={() => navigate('/patients')}>
        Retour à la page d'enregistrement
      </button>

      <div className="text-center mb-4">
        <DropboxChooser
          appKey="gmhp5s9h3aup35v"
          success={handleDropboxSuccess}
          multiselect={true}
          extensions={['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt','.gif','.pptx','.svg','.jpeg', '.jpg', '.png','.mp3','.mp4']}
        >
          <button className="btn btn-primary">
            Choisir les fichiers
          </button>
        </DropboxChooser>
      </div>

      <div className="row">
        {sortedFiles.map(file => (
          <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                  <input
                    type="text"
                    value={file.title}
                    onChange={(e) => handleTitleChange(file.id, e.target.value)}
                    placeholder="Enter title"
                    className="form-control form-control-sm"
                  />
                  <div>
                  {(userRole === 'Secrétaire' && userAccessLevel === 'Administrateur') && (
  <button
    onClick={() => handleDelete(file.id)}
    className="btn btn-danger btn-sm"
  >
    Supprimer
  </button>
)}
                  </div>
                </div>

                <div className="file-info text-muted small">
                  <p><strong> {file.name}</strong> </p>
                 {/* <p><strong>Date:</strong> {new Date(file.timestamp).toLocaleString()}</p>*/}
                </div>

                {/* Champ pour saisir l'ordre d'affichage */}
                <div className="mb-3">
                Ordre du fichier :

                  <input
                    type="number"
                    value={file.order || 0}
                    onChange={(e) => handleOrderChange(file.id, parseInt(e.target.value, 10))}
                    placeholder="Ordre d'affichage"
                    className="form-control form-control-sm w-50"
                  />
                </div>

                <button
                  className="btn btn-info btn-sm"
                  onClick={() => handleOpenLink(file.link)}
                >
                  Programme Opératoire
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileManager;
