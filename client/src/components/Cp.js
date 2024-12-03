import React, { useState, useEffect } from 'react';
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
  const [users, setUsers] = useState([]);  // Initialise avec un tableau vide
  const [patients, setPatients] = useState([]);  // Initialise avec un tableau vide
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [targetUser, setTargetUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setUsers(data.users || []); // Assurez-vous que 'users' est un tableau, même si la réponse est vide
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        toast.error('Erreur lors de la récupération des utilisateurs.');
      }
    };
    fetchUsers();
  }, []);

  const handleSelectUser = async (userId) => {
    setSelectedUser(userId);
    try {
      const response = await fetch(`http://localhost:5002/api/patients/${userId}`);
      const data = await response.json();
      setPatients(data.patients || []); // Assurez-vous que 'patients' est un tableau, même si la réponse est vide
    } catch (error) {
      console.error('Erreur lors de la récupération des patients:', error);
      toast.error('Erreur lors de la récupération des patients.');
    }
  };

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
      toast.error("Une erreur est survenue : " + error.message);
    }
  };

  const handleMovePatient = async () => {
    if (!selectedPatient || !targetUser) {
      toast.error('Veuillez sélectionner un patient et un utilisateur cible.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5002/api/users/${selectedUser}/patients/${selectedPatient}/move/${targetUser}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      toast.success('Patient déplacé avec succès');
      setSelectedPatient(null);
      setTargetUser(null);
    } catch (error) {
      console.error('Erreur lors du déplacement du patient:', error);
      toast.error('Une erreur est survenue lors du déplacement du patient.');
    }
  };

  return (
    <div className="container min-vh-100 d-flex justify-content-center align-items-center py-5">
      

      {/* Option pour afficher les utilisateurs et déplacer les patients */}
      <div className="col-12 mt-4">
        <h3>Liste des utilisateurs</h3>
        <ul className="list-group">
          {users && users.length > 0 ? (
            users.map(user => (
              <li
                key={user._id}
                className="list-group-item"
                onClick={() => handleSelectUser(user._id)}
                style={{ cursor: 'pointer' }}
              >
                {user.username}
              </li>
            ))
          ) : (
            <li className="list-group-item">Aucun utilisateur trouvé</li>
          )}
        </ul>
        
        {selectedUser && (
          <>
            <h4>Patients de l'utilisateur sélectionné</h4>
            <ul className="list-group">
              {patients && patients.length > 0 ? (
                patients.map(patient => (
                  <li
                    key={patient._id}
                    className="list-group-item"
                    onClick={() => setSelectedPatient(patient._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {patient.name}
                  </li>
                ))
              ) : (
                <li className="list-group-item">Aucun patient trouvé</li>
              )}
            </ul>
          </>
        )}
        
        <div className="mt-3">
          <h4>Déplacer le patient vers un autre utilisateur</h4>
          <select
            className="form-select"
            onChange={(e) => setTargetUser(e.target.value)}
            value={targetUser || ''}
          >
            <option value="">Sélectionner un utilisateur cible</option>
            {users && users.length > 0 && users.map(user => (
              <option key={user._id} value={user._id}>{user.username}</option>
            ))}
          </select>
          
          <button
            className="btn btn-warning mt-2"
            onClick={handleMovePatient}
          >
            Déplacer le patient
          </button>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Auth;
