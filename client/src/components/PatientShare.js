import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { Modal } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [targetUser, setTargetUser] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [show, setShow] = useState(false);

  const toastConfig = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  const handleClose = () => {
    setShow(false);
    setSelectedPatient(null);
    setTargetUser('');
  };

  const handleShow = (patient) => {
    setSelectedPatient(patient);
    setShow(true);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5002/api/users/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
      toast.success('Liste des utilisateurs mise à jour', toastConfig);
    } catch (error) {
      console.error('Fetch error:', error);
      setUsers([]);
      toast.error('Erreur lors de la récupération des utilisateurs', toastConfig);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferPatient = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/patients/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          patientId: selectedPatient._id,
          targetUserId: targetUser
        })
      });

      if (response.ok) {
        toast.success('Patient transféré avec succès', toastConfig);
        handleClose();
        fetchUsers();
      } else {
        throw new Error('Échec du transfert');
      }
    } catch (error) {
      toast.error('Erreur lors du transfert du patient', toastConfig);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Gestion des Utilisateurs et Patients</h2>
      
      <div className="row">
        {users.length === 0 ? (
          <div className="col-12 text-center">
            <p>Aucun utilisateur trouvé</p>
          </div>
        ) : (
          users.map(user => (
            <div key={user._id} className="col-md-6 mb-4">
              <div className="card">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">{user.username}</h5>
                </div>
                <div className="card-body">
                  <h6>Patients:</h6>
                  {user.patients?.length > 0 ? (
                    <ul className="list-group">
                      {user.patients.map(patient => (
                        <li key={patient._id} 
                            className="list-group-item d-flex justify-content-between align-items-center">
                          {patient.name}
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleShow(patient)}
                          >
                            Transférer
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">Aucun patient enregistré</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Transférer le Patient: {selectedPatient?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label>Sélectionner l'utilisateur destinataire:</label>
            <select 
              className="form-control mt-2"
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
            >
              <option value="">Choisir un utilisateur</option>
              {users
                .filter(user => user._id !== selectedPatient?.userId)
                .map(user => (
                  <option key={user._id} value={user._id}>
                    {user.username}
                  </option>
                ))}
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={handleClose}>
            Annuler
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleTransferPatient}
            disabled={!targetUser}
          >
            Confirmer le transfert
          </button>
        </Modal.Footer>
      </Modal>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default UserManagement;
