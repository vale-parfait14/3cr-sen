import React, { useState, useEffect } from 'react';
import DropboxChooser from 'react-dropbox-chooser';
import 'bootstrap/dist/css/bootstrap.min.css';

const DROPBOX_APP_KEY = 'gmhp5s9h3aup35v';
const API_BASE_URL = 'https://threecr-sen.onrender.com';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [commentType, setCommentType] = useState('');
  const [customComment, setCustomComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showFiles, setShowFiles] = useState(false);
  const [formData, setFormData] = useState({
    anesthesiste: '',
    responsableCec: '',
    instrumentiste: '',
    indicationOperatoire: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`);
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const handleCommentTypeChange = (e) => {
    setCommentType(e.target.value);
    if (e.target.value !== 'autre') {
      setCustomComment('');
    }
  };

  const handleDropboxSuccess = (files) => {
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = {
      patient: selectedPatient,
      comment: commentType === 'autre' ? customComment : commentType,
      files: selectedFiles,
      ...formData
    };

    try {
      await fetch(`${API_BASE_URL}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });
      // Reset form after successful submission
      setSelectedPatient(null);
      setCommentType('');
      setCustomComment('');
      setSelectedFiles([]);
      setFormData({
        anesthesiste: '',
        responsableCec: '',
        instrumentiste: '',
        indicationOperatoire: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleDelete = async (patientId) => {
    try {
      await fetch(`${API_BASE_URL}/patients/${patientId}`, {
        method: 'DELETE',
      });
      fetchPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  return (
    <div className="container-fluid py-4">
      <h2 className="text-primary mb-4">Gestion des Patients</h2>

      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h3 className="h5 mb-0">Liste des Patients</h3>
        </div>
        <div className="card-body table-responsive">
          <table className="table table-hover table-striped">
            <thead className="table-light">
              <tr>
                <th>No. Dossier</th>
                <th>Nom</th>
                <th>Date de Naissance</th>
                <th>Sexe</th>
                <th>Age</th>
                <th>Groupe Sanguin</th>
                <th>Adresse</th>
                <th>Téléphone</th>
                <th>Diagnostic</th>
                <th>Opérateur</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr 
                  key={patient.id}
                  onClick={() => handlePatientSelect(patient)}
                  className={selectedPatient?.id === patient.id ? 'table-primary' : ''}
                >
                  <td>{patient.numeroDossier}</td>
                  <td>{patient.nom}</td>
                  <td>{patient.dateNaissance}</td>
                  <td>{patient.sexe}</td>
                  <td>{patient.age}</td>
                  <td>{patient.groupeSanguin}</td>
                  <td>{patient.adresse}</td>
                  <td>{patient.telephone}</td>
                  <td>{patient.diagnostic}</td>
                  <td>{patient.operateur}</td>
                  <td>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(patient.id);
                      }}
                    >
                      <i className="bi bi-trash"></i> Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header bg-primary text-white">
          <h4 className="h5 mb-0">Formulaire Patient</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Commentaire:</label>
                <select 
                  className="form-select" 
                  value={commentType} 
                  onChange={handleCommentTypeChange}
                >
                  <option value="">Sélectionner un commentaire</option>
                  <option value="Normal">Normal</option>
                  <option value="Mission Canadienne">Mission Canadienne</option>
                  <option value="autre">Autre</option>
                </select>
                {commentType === 'autre' && (
                  <textarea
                    className="form-control mt-2"
                    value={customComment}
                    onChange={(e) => setCustomComment(e.target.value)}
                    placeholder="Entrez votre commentaire"
                    rows="3"
                  />
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Fichiers:</label>
                <DropboxChooser 
                  appKey={DROPBOX_APP_KEY}
                  success={handleDropboxSuccess}
                  cancel={() => console.log('Cancelled')}
                  multiselect={true}
                >
                  <button type="button" className="btn btn-primary w-100">
                    <i className="bi bi-cloud-upload"></i> Sélectionner des fichiers Dropbox
                  </button>
                </DropboxChooser>
              </div>

              {selectedFiles.length > 0 && (
                <div className="col-12 mb-3">
                  <div className="card">
                    <div className="card-body">
                      {selectedFiles.length > 2 ? (
                        <>
                          <button 
                            type="button" 
                            className="btn btn-outline-primary mb-2"
                            onClick={() => setShowFiles(!showFiles)}
                          >
                            <i className={`bi bi-chevron-${showFiles ? 'up' : 'down'}`}></i>
                            {showFiles ? 'Cacher' : 'Afficher'} les fichiers ({selectedFiles.length})
                          </button>
                          {showFiles && (
                            <ul className="list-group">
                              {selectedFiles.map((file, index) => (
                                <li key={index} className="list-group-item">
                                  <i className="bi bi-file-earmark me-2"></i>
                                  {file.name}
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      ) : (
                        <ul className="list-group">
                          {selectedFiles.map((file, index) => (
                            <li key={index} className="list-group-item">
                              <i className="bi bi-file-earmark me-2"></i>
                              {file.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="col-md-6 mb-3">
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Anesthésiste"
                  value={formData.anesthesiste}
                  onChange={(e) => setFormData({...formData, anesthesiste: e.target.value})}
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Responsable CEC"
                  value={formData.responsableCec}
                  onChange={(e) => setFormData({...formData, responsableCec: e.target.value})}
                />
              </div>

              <div className="col-md-6 mb-3">
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Instrumentiste"
                  value={formData.instrumentiste}
                  onChange={(e) => setFormData({...formData, instrumentiste: e.target.value})}
                />
                <textarea
                  className="form-control"
                  placeholder="Indication Opératoire"
                  value={formData.indicationOperatoire}
                  onChange={(e) => setFormData({...formData, indicationOperatoire: e.target.value})}
                  rows="3"
                />
              </div>
            </div>

            <div className="text-end">
              <button type="submit" className="btn btn-primary btn-lg">
                <i className="bi bi-save"></i> Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Patients;
