import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Importation des modules Firebase
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";

// Configuration Firebase
const firebaseConfig = {
 apiKey: "AIzaSyDSQ0cQa7TISpd_vZWVa9dWMzbUUl-yf38",
  authDomain: "basecenterdb.firebaseapp.com",
  projectId: "basecenterdb",
  storageBucket: "basecenterdb.firebasestorage.app",
  messagingSenderId: "919766148380",
  appId: "1:919766148380:web:30db9986fa2cd8bb7106d9"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Les rôles, niveaux d'accès, et services disponibles
const roles = ['Admin', 'Médecin', 'Secrétaire', 'Infirmier(e)', 'Archiviste', 'Gestionnaire', 'Etudiant(e)'];
const niveauxAcces = ['Affichage', 'Affichage-Modification', 'Affichage-Modification-Suppression', 'Administrateur'];
const services = ['Cuomo', 'Ctcv', 'Cardiologie', 'Réanimation'];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    nom: '',
    password: '',
    role: '',
    niveauAcces: '',
    service: '',
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Récupérer tous les utilisateurs
  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUsers(usersList);
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchUsers();
    }
  }, [isLoggedIn]);

  // Gérer la création d'un utilisateur
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const userRef = await addDoc(collection(db, "users"), {
        nom: formData.nom,
        password: formData.password,
        role: formData.role,
        niveauAcces: formData.niveauAcces,
        service: formData.service,
      });
      console.log("Utilisateur créé avec ID: ", userRef.id);
      fetchUsers(); // Recharger la liste des utilisateurs
    } catch (e) {
      console.error("Erreur lors de la création de l'utilisateur: ", e);
    }
  };

  // Gérer la suppression d'un utilisateur avec confirmation
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      await deleteDoc(doc(db, "users", userId));
      fetchUsers(); // Recharger la liste des utilisateurs
    }
  };

  // Gérer la modification d'un utilisateur
  const handleUpdateUser = async (userId, updatedData) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updatedData);
    fetchUsers(); // Recharger la liste des utilisateurs
  };

  // Gérer la connexion de l'utilisateur
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, formData.nom, formData.password); // Utiliser `nom` comme identifiant pour la connexion
      setIsLoggedIn(true);
      navigate.push('/patients'); // Rediriger vers la page "patients" après la connexion
    } catch (error) {
      console.error("Erreur de connexion: ", error);
      alert("Erreur de connexion");
    }
  };

  // Rechercher les utilisateurs
  const filteredUsers = users.filter(user =>
    user.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2>Gestion des utilisateurs</h2>

      {!isLoggedIn ? (
        <div>
          <h3>Connexion</h3>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button type="submit">Se connecter</button>
          </form>
        </div>
      ) : (
        <div>
          <h3>Bienvenue, vous êtes connecté</h3>
        </div>
      )}

      <div>
        <h3>Créer un utilisateur</h3>
        <form onSubmit={handleCreateUser}>
          <input
            type="text"
            placeholder="Nom"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="">Sélectionnez un rôle</option>
            {roles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <select
            value={formData.niveauAcces}
            onChange={(e) => setFormData({ ...formData, niveauAcces: e.target.value })}
          >
            <option value="">Sélectionnez un niveau d'accès</option>
            {niveauxAcces.map((niveau) => (
              <option key={niveau} value={niveau}>{niveau}</option>
            ))}
          </select>
          <select
            value={formData.service}
            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
          >
            <option value="">Sélectionnez un service</option>
            {services.map((service) => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
          <button type="submit">Créer un utilisateur</button>
        </form>
      </div>

      <div>
        <h3>Rechercher des utilisateurs</h3>
        <input
          type="text"
          placeholder="Rechercher par nom..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ul>
          {filteredUsers.map(user => (
            <li key={user.id}>
              {user.nom} - {user.role} - {user.niveauAcces} - {user.service}
              <button onClick={() => handleDeleteUser(user.id)}>Supprimer</button>
              <button onClick={() => handleUpdateUser(user.id, { role: "Admin" })}>Modifier</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserManagement;
