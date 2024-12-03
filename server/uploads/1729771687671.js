import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css'; // Import du fichier CSS pour les styles
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Auth = ({ login }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/auth/${isRegistering ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      login(data.token);
      toast.success('Création réussie !'); 
      navigate('/patients');
    } catch (error) {
      console.error("Erreur lors de la requête :", error);
      toast.error("Une erreur est survenue : " + error.message); 
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, newPassword }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      toast.success("Mot de passe réinitialisé avec succès !");
      setShowPasswordReset(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du mot de passe :", error);
      toast.error("Une erreur est survenue : " + error.message);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>{isRegistering ? 'Inscription' : 'Connexion'}</h2>
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="Nom d'utilisateur" 
          required 
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Mot de passe" 
          required 
        />
        <button type="submit">{isRegistering ? 'S\'inscrire' : 'Se connecter'}</button>
        <button type="button" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'Passer à la connexion' : 'Passer à l\'inscription'}
        </button>
        <button type="button" onClick={() => setShowPasswordReset(true)}>
          Mot de passe oublié ?
        </button>
      </form>

      {showPasswordReset && (
        <div className="password-reset-modal">
          <h2>Réinitialiser le Mot de Passe</h2>
          <form onSubmit={handlePasswordReset}>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nouveau mot de passe"
              required
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmer le mot de passe"
              required
            />
            <button type="submit">Réinitialiser</button>
            <button type="button" onClick={() => setShowPasswordReset(false)}>Annuler</button>
          </form>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Auth;
