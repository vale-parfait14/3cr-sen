import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PasswordPrompt = () => {
  const [password, setPassword] = useState('');
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const navigate = useNavigate();
  const correctPassword = {"147": "first",
    "258": "two"
    };  // Le mot de passe correct pour accéder à la page

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (correctPassword[password]) {
      setIsPasswordCorrect(true);
      toast.success('Mot de passe correct, redirection vers la gestion des utilisateurs');
      navigate('/usermanagement');  // Redirige vers la page de gestion des utilisateurs
    } else {
      toast.error('Mot de passe incorrect, veuillez réessayer.');
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center  text-secondary">Accès à la gestion des utilisateurs</h1>
      {!isPasswordCorrect ? (
        <div className="row justify-content-center">
          <div className="col-md-6">
            <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
              <h2 className="text-center mb-4 text-secondary">Entrez le mot de passe</h2>
              <div className="mb-3">
                <label className="form-label text-secondary">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="form-control"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">Accéder</button>
              <button className="btn btn-secondary w-100 mt-2" onClick={() => navigate('/mode')}>Retour</button>
            </form>
          </div>
        </div>
      ) : (
        <div className="text-center text-secondary">
          <p>Accès autorisé ! Vous êtes redirigé vers la gestion des utilisateurs.</p>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default PasswordPrompt;
