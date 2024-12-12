import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Auth = ({ login }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [uiState, setUiState] = useState({
    isRegistering: false,
    showPasswordReset: false,
    loading: false
  });

  // Memoized API URL
  const API_BASE_URL = useMemo(() => 'https://threecr-sen.onrender.com/api/auth', []);

  // Optimized form handling
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Optimized authentication request
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setUiState(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch(`${API_BASE_URL}/${uiState.isRegistering ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      if (!response.ok) throw new Error(`Erreur ${response.status}`);

      const data = await response.json();
      localStorage.setItem('token', data.token);
      login(data.token);
      navigate('/role');
    } catch (error) {
      toast.error("Erreur d'authentification");
    } finally {
      setUiState(prev => ({ ...prev, loading: false }));
    }
  }, [formData.username, formData.password, uiState.isRegistering, API_BASE_URL, login, navigate]);

  // Optimized password reset
  const handlePasswordReset = useCallback(async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          newPassword: formData.newPassword
        }),
      });

      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      
      toast.success("Mot de passe réinitialisé");
      setUiState(prev => ({ ...prev, showPasswordReset: false }));
      setFormData(prev => ({
        ...prev,
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      toast.error("Erreur de réinitialisation");
    }
  }, [formData, API_BASE_URL]);

  if (uiState.loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <img
            src="https://i.pinimg.com/originals/82/ff/4f/82ff4f493afb72f8e0acb401c1b7498f.gif"
            alt="Loading"
            className="mb-3"
            style={{ width: '200px', borderRadius: "200px" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container min-vh-100 d-flex justify-content-center align-items-center py-5">
      <div className="col-12 col-md-8 col-lg-6 col-xl-4">
        <div className="card shadow-lg">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <h2 className="text-center mb-4 text-secondary">Connexion</h2>
              
              <div className="mb-3">
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Nom d'utilisateur"
                  required
                />
              </div>

              <div className="mb-3">
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Mot de passe"
                  required
                />
              </div>

              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-primary">
                  Se connecter
                </button>
                
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/')}
                >
                  Retour
                </button>
                
                <button 
                  type="button" 
                  className="btn btn-link"
                  onClick={() => setUiState(prev => ({ ...prev, showPasswordReset: true }))}
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {uiState.showPasswordReset && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Réinitialiser le Mot de Passe</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setUiState(prev => ({ ...prev, showPasswordReset: false }))}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handlePasswordReset}>
                  <div className="mb-3">
                    <input
                      type="password"
                      name="newPassword"
                      className="form-control"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Nouveau mot de passe"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirmer le mot de passe"
                      required
                    />
                  </div>
                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary">Réinitialiser</button>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setUiState(prev => ({ ...prev, showPasswordReset: false }))}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Auth;
