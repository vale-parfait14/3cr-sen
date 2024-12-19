import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Ajout de Navigate pour redirection
import Auth from './components/Auth'; 
import Patients from './components/Patients'; 
import Doctors from './components/Doctors'; 
import { PatientDoctorProvider } from './components/PatientDoctorContext';
import PatientFiles from './components/PatientFiles';
import CopieFiles from './components/CopieFiles';
import Cp from './components/Cp';
import CpDropboxForm from './components/CpDropboxForm';
import Archive from './components/Archive';
import DocAccess from './components/DocAccess';
import PatientSolvable from './components/PatientSolvable';
import Fichier from './components/Fichier';
import Solvabilite from './components/Solvabilite';
import Home from './components/Home';
import PasswordAuth from './components/PasswordAuth';
import ArchiveAccess from './components/ArchiveAccess'; 
import Role from './components/Role';
import AccessSecretaire from './components/AccessSecretaire';
import LoginHistoryCopy from './components/LoginHistoryCopy'; // Importer la page historique des connexions
import LoginHistory from './components/ConnectionHistory';
import ArchiveList from './components/ArchivesList';
import 'bootstrap/dist/css/bootstrap.min.css';
import UserManagement from './components/UserManagement';
import UserManagementCopy from './components/UserManagementCopy';
import Authentifications from './components/Authentifications';
import Authentification from './components/Authentification';

import Mode from './components/Mode';
import PasswordPrompt from './components/PasswordPrompt';
import UserConnection from './components/UserConnection';
import Programme from './components/Programme';
import Observation from './components/Observation';
import filePatient from './components/fichiersPatients';
import Message from './components/Message';
import FichierCro from '.components/FichierCro';
import Iconographie from "./components/Iconographie";
import Garde from "./components/Garde";

const App = () => {
  const [token, setToken] = useState(null);
  const [connectionHistory, setConnectionHistory] = useState([]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
    
    // Charger l'historique des connexions à partir du localStorage
    const storedHistory = JSON.parse(localStorage.getItem('connectionHistory')) || [];
    setConnectionHistory(storedHistory);
  }, []);

  const login = (token) => {
    setToken(token);
    localStorage.setItem('token', token); // Enregistrer le token dans le localStorage

    // Enregistrer l'historique de connexion dans le localStorage
    const newConnection = {
      userName: 'User', // Exemple d'utilisateur, à remplacer par l'utilisateur connecté
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };

    // Mettre à jour l'historique des connexions dans le localStorage
    const updatedHistory = [...connectionHistory, newConnection];
    setConnectionHistory(updatedHistory);
    localStorage.setItem('connectionHistory', JSON.stringify(updatedHistory));

    // Vous pouvez également envoyer l'historique à votre API pour le stocker dans MongoDB ici
    // axios.post('/api/history', newConnection);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // Route protégée qui vérifie si l'utilisateur est authentifié
  const ProtectedRoute = ({ element, token }) => {
    return token ? element : <Navigate to="/auth" />;
  };

  return (
    <PatientDoctorProvider> {/* Fournisseur de contexte des patients et médecins */}
      <Router>
        <div>
          <Routes>
            {/* Route publique */}
            <Route path="/" element={<Home token={token} />} />
            <Route path="/auth" element={<Auth login={login} />} />
            <Route path="/passwordauth" element={<PasswordAuth token={token} />} />

            {/* Routes protégées */}
            <Route path="/iconographie" element={<ProtectedRoute element={<Iconographie token={token} />} token={token} />} />
            <Route path="/garde" element={<ProtectedRoute element={<Garde token={token} />} token={token} />} />

            <Route path="/message" element={<ProtectedRoute element={<Message token={token} />} token={token} />} />
            <Route path="/Fichier-Cro" element={<ProtectedRoute element={<FichierCro token={token} />} token={token} />} />
            <Route path="/patients" element={<ProtectedRoute element={<Patients token={token} />} token={token} />} />
            <Route path="/docaccess" element={<ProtectedRoute element={<DocAccess token={token} />} token={token} />} />
            <Route path="/doctors" element={<ProtectedRoute element={<Doctors token={token} />} token={token} />} />
            <Route path="/patientfiles" element={<ProtectedRoute element={<PatientFiles token={token} />} token={token} />} />
            <Route path="/copiefiles" element={<ProtectedRoute element={<CopieFiles token={token} />} token={token} />} />
            <Route path="/cp" element={<ProtectedRoute element={<Cp token={token} />} token={token} />} />
            <Route path="/cpdropboxform" element={<ProtectedRoute element={<CpDropboxForm token={token} />} token={token} />} />
            <Route path="/archive" element={<ProtectedRoute element={<Archive token={token} />} token={token} />} />
            <Route path="/archiveaccess" element={<ProtectedRoute element={<ArchiveAccess token={token} />} token={token} />} />
            <Route path="/patientsolvable" element={<ProtectedRoute element={<PatientSolvable token={token} />} token={token} />} />
            <Route path="/fichiers" element={<ProtectedRoute element={<Fichier token={token} />} token={token} />} />
            <Route path="/solvabilite" element={<ProtectedRoute element={<Solvabilite token={token} />} token={token} />} />
            <Route path="/role" element={<ProtectedRoute element={<Role token={token} />} token={token} />} />
            <Route path="/accesssecretaire" element={<ProtectedRoute element={<AccessSecretaire token={token} />} token={token} />} />
            <Route path="/connections" element={<LoginHistoryCopy connectionHistory={connectionHistory} />} />
            <Route path="/loginHistory" element={<LoginHistory token={token} />} />

            {/* Autres routes */}
            <Route path="/archivelist" element={<ProtectedRoute element={<ArchiveList token={token} />} token={token} />} />
            <Route path="/usermanagement" element={<ProtectedRoute element={<UserManagement token={token} />} token={token} />} />
            <Route path="/user-management" element={<ProtectedRoute element={<UserManagementCopy token={token} />} token={token} />} />

            <Route path="/authentifications" element={<ProtectedRoute element={<Authentifications token={token} />} token={token} />} />
            <Route path="/authentification" element={<ProtectedRoute element={<Authentification token={token} />} token={token} />} />
            <Route path="/mode" element={<ProtectedRoute element={<Mode token={token} />} token={token} />} />
            <Route path="/passwordprompt" element={<ProtectedRoute element={<PasswordPrompt token={token} />} token={token} />} />
            <Route path="/userconnection" element={<ProtectedRoute element={<UserConnection token={token} />} token={token} />} />
            <Route path="/programme" element={<ProtectedRoute element={<Programme token={token} />} token={token} />} />
            <Route path="/Observation" element={< Observation element={<Observation token={token} />} token={token} />} />
            <Route path="/filepatient" element={<ProtectedRoute element={<filePatient token={token} />} token={token} />} />

          </Routes>
        </div>
      </Router>
    </PatientDoctorProvider>
  );
};

export default App;
