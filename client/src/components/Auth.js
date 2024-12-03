import React, { useState ,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
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
      const response = await fetch(`http://localhost:5002/api/auth/${isRegistering ? 'register' : 'login'}`, {
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
      navigate('/role');
    } catch (error) {
      console.error("Erreur lors de la requête :", error);
      toast.info("Une erreur est survenue : " + error.message); 
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const response = await fetch('http://localhost:5002/api/auth/reset-password', {
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000); // 1 second

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <img
            src="https://i.pinimg.com/originals/82/ff/4f/82ff4f493afb72f8e0acb401c1b7498f.gif"
            alt="Loading"
            className="mb-3"
            style={{ width: '200px',  borderRadius:"200px"}}
          />
          <div className="loading-text text-muted">Chargement en cours...</div>
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
              <h2 className="text-center mb-4 text-secondary">
                {isRegistering ? 'Inscription' : 'Connexion'}
              </h2>
              
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nom d'utilisateur"
                  required
                />
              </div>

              <div className="mb-3">
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  required
                />
              </div>

              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-primary">
                  {/*{isRegistering ? 'S\'inscrire' : 'Se connecter'}*/}
                  Se connecter
                </button>
                
               {/* <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => setIsRegistering(!isRegistering)}
                >
                  {isRegistering ? 'Passer à la connexion' : 'Passer à l\'inscription'}
                </button>*/}

                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/')}
                >
                  Retour vers la page d'accueil
                </button>
                 
                <button 
                  type="button" 
                  className="btn btn-link"
                  onClick={() => setShowPasswordReset(true)}
                >
                  Mot de passe oublié ?
                </button>
               
              </div>
            </form>
          </div>
        </div>
      </div>

     {showPasswordReset && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Réinitialiser le Mot de Passe</h5>
                <button type="button" className="btn-close" onClick={() => setShowPasswordReset(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handlePasswordReset}>
                  <div className="mb-3">
                    <input
                      type="password"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nouveau mot de passe"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmer le mot de passe"
                      required
                    />
                  </div>
                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary">Réinitialiser</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordReset(false)}>
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
