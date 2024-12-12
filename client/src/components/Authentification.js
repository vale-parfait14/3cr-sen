import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDSQ0cQa7TISpd_vZWVa9dWMzbUUl-yf38",
  authDomain: "basecenterdb.firebaseapp.com",
  projectId: "basecenterdb",
  storageBucket: "basecenterdb.firebasestorage.app",
  messagingSenderId: "919766148380",
  appId: "1:919766148380:web:30db9986fa2cd8bb7106d9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const Authentification = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ name: '', password: '' });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Memoize the date format to avoid recalculating on each render
  const formatDateTime = useMemo(() => (date) => {
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
    return new Date(date).toLocaleString('fr-FR', options);
  }, []);

  // Fetch users from Firestore
  const fetchUsers = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      toast.error('Erreur lors de la récupération des utilisateurs');
    }
  }, []);

  // Fetch users once when the component mounts
  useEffect(() => {
    fetchUsers();
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  // Prevent browser back navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Handle form input changes
  const handleLoginChange = useCallback((e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Handle user login
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    const user = users.find(u => u.name === loginData.name && u.password === loginData.password);

    if (user) {
      const userData = {
        role: user.role,
        accessLevel: user.accessLevel,
        name: user.name,
        service: user.service
      };

      // Store user data in localStorage
      Object.entries(userData).forEach(([key, value]) => 
        localStorage.setItem(`user${key.charAt(0).toUpperCase() + key.slice(1)}`, value)
      );

      const now = new Date();
      const formattedDate = formatDateTime(now);
      const [date, time] = formattedDate.split(',');
      
      const connectionHistory = JSON.parse(localStorage.getItem('connectionHistory') || '[]');
      connectionHistory.push({
        userName: user.name,
        date: date,
        time: time.trim(),
        userService: user.service,
      });
      localStorage.setItem('connectionHistory', JSON.stringify(connectionHistory));

      toast.success('Connexion réussie');
      setLoginData({ name: '', password: '' });
      navigate('/patients');
    } else {
      toast.error('Nom d\'utilisateur ou mot de passe incorrect');
    }
  }, [users, loginData, navigate, formatDateTime]);

  // Loader during the loading state
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
      <h2 className="text-center mb-4">Se connecter</h2>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <form onSubmit={handleLogin} className="card p-4 shadow-sm">
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
