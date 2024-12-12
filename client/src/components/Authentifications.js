import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import ConnectionHistory from './ConnectionHistory';

const firebaseConfig = {
  apiKey: "AIzaSyDSQ0cQa7TISpd_vZWVa9dWMzbUUl-yf38",
  authDomain: "basecenterdb.firebaseapp.com",
  projectId: "basecenterdb",
  storageBucket: "basecenterdb.firebasestorage.app",
  messagingSenderId: "919766148380",
  appId: "1:919766148380:web:30db9986fa2cd8bb7106d9",
  experimentalForceLongPolling: true,
  useFetchStreams: false
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const Authentification = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ name: '', password: '' });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const fetchUsers = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    } catch (error) {
      console.error('Erreur de chargement:', error);
      toast.error('Erreur lors de la récupération des utilisateurs');
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  useEffect(() => {
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleLoginChange = useCallback((e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const user = querySnapshot.docs.find(doc => {
        const userData = doc.data();
        return userData.name === loginData.name && userData.password === loginData.password;
      });

      if (user) {
        const userData = user.data();
        sessionStorage.setItem('userRole', userData.role);
        sessionStorage.setItem('userAccessLevel', userData.accessLevel);
        sessionStorage.setItem('userName', userData.name);
        sessionStorage.setItem('userService', userData.service);

        const now = new Date();
        const formattedDate = formatDateTime(now);
        const [date, time] = formattedDate.split(',');
        
        const connectionHistory = JSON.parse(sessionStorage.getItem('connectionHistory') || '[]');
        connectionHistory.push({
          userName: userData.name,
          date: date,
          time: time.trim(),
          userService: userData.service,
        });
        sessionStorage.setItem('connectionHistory', JSON.stringify(connectionHistory));

        toast.success('Connexion réussie');
        navigate('/patients');
      } else {
        toast.error('Identifiants incorrects');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast.error('Erreur de connexion');
    }
  }, [loginData, navigate, formatDateTime]);

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
                autoComplete="username"
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
                autoComplete="current-password"
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
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Authentification;
