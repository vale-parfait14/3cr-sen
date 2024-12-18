import React, { useState, useEffect } from 'react';
import { DropboxChooser } from 'react-dropbox-chooser';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDSQ0cQa7TISpd_vZWVa9dWMzbUUl-yf38",
    authDomain: "basecenterdb.firebaseapp.com",
    projectId: "basecenterdb",
    storageBucket: "basecenterdb.firebasestorage.app",
    messagingSenderId: "919766148380",
    appId: "1:919766148380:web:30db9986fa2cd8bb7106d9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SurgicalForm = () => {
  const [formData, setFormData] = useState({
    comment: 'Normal',
    customComment: '',
    files: [],
    anesthesistes: '',
    responsablesCec: '',
    instrumentistes: '',
    indicationOperatoire: '',
    createdAt: new Date()
  });
  
  const [records, setRecords] = useState([]);
  const [showFiles, setShowFiles] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const predefinedComments = ['Normal', 'Mission Canadienne', 'Autre'];

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'surgicalRecords'));
      const recordsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecords(recordsData);
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
    }
  };

  const handleDropboxSuccess = (files) => {
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && selectedId) {
        await updateDoc(doc(db, 'surgicalRecords', selectedId), {
          ...formData,
          updatedAt: new Date()
        });
      } else {
        await addDoc(collection(db, 'surgicalRecords'), {
          ...formData,
          createdAt: new Date()
        });
      }
      fetchRecords();
      resetForm();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'surgicalRecords', id));
      fetchRecords();
      resetForm();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const handleEdit = (record) => {
    setFormData(record);
    setSelectedId(record.id);
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
      comment: 'Normal',
      customComment: '',
      files: [],
      anesthesistes: '',
      responsablesCec: '',
      instrumentistes: '',
      indicationOperatoire: '',
      createdAt: new Date()
    });
    setIsEditing(false);
    setSelectedId(null);
  };

  const toggleFiles = () => {
    setShowFiles(!showFiles);
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4">
            <h3 className="mb-4">
              {isEditing ? 'Modifier l\'enregistrement' : 'Nouvel enregistrement'}
            </h3>

            <div className="mb-3">
              <label className="form-label">Type de commentaire</label>
              <select 
                value={formData.comment}
                onChange={(e) => setFormData({...formData, comment: e.target.value})}
                className="form-select"
              >
                {predefinedComments.map(comment => (
                  <option key={comment} value={comment}>{comment}</option>
                ))}
              </select>

              {formData.comment === 'Autre' && (
                <div className="mt-2">
                  <textarea
                    value={formData.customComment}
                    onChange={(e) => setFormData({...formData, customComment: e.target.value})}
                    className="form-control"
                    placeholder="Commentaire personnalisé"
                    rows="3"
                  />
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Documents</label>
              <div>
                <DropboxChooser 
                  appKey="gmhp5s9h3aup35v"
                  success={handleDropboxSuccess}
                  multiselect={true}
                >
                  <button type="button" className="btn btn-primary">
                    <i className="bi bi-cloud-upload"></i> Sélectionner des fichiers
                  </button>
                </DropboxChooser>
              </div>

              {formData.files.length > 0 && (
                <div className="mt-2">
                  {formData.files.length > 2 ? (
                    <div>
                      <button 
                        type="button" 
                        onClick={toggleFiles}
                        className="btn btn-outline-secondary"
                      >
                        {showFiles ? 'Masquer' : 'Afficher'} ({formData.files.length} fichiers)
                      </button>
                      {showFiles && (
                        <ul className="list-group mt-2">
                          {formData.files.map((file, index) => (
                            <li key={index} className="list-group-item">{file.name}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <ul className="list-group mt-2">
                      {formData.files.map((file, index) => (
                        <li key={index} className="list-group-item">{file.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Anesthésistes</label>
                <input
                  type="text"
                  value={formData.anesthesistes}
                  onChange={(e) => setFormData({...formData, anesthesistes: e.target.value})}
                  className="form-control"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Responsables CEC</label>
                <input
                  type="text"
                  value={formData.responsablesCec}
                  onChange={(e) => setFormData({...formData, responsablesCec: e.target.value})}
                  className="form-control"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Instrumentistes</label>
                <input
                  type="text"
                  value={formData.instrumentistes}
                  onChange={(e) => setFormData({...formData, instrumentistes: e.target.value})}
                  className="form-control"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Indication opératoire</label>
                <textarea
                  value={formData.indicationOperatoire}
                  onChange={(e) => setFormData({...formData, indicationOperatoire: e.target.value})}
                  className="form-control"
                  rows="3"
                />
              </div>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-success">
                {isEditing ? 'Mettre à jour' : 'Enregistrer'}
              </button>
              {isEditing && (
                <button 
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
              )}
            </div>
          </form>

          <div className="mt-4">
            <h3 className="mb-4">Liste des enregistrements</h3>
            {records.map(record => (
              <div key={record.id} className="card mb-3">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <strong>Commentaire:</strong>
                      <div>{record.comment === 'Autre' ? record.customComment : record.comment}</div>
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>Anesthésistes:</strong>
                      <div>{record.anesthesistes}</div>
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>Responsables CEC:</strong>
                      <div>{record.responsablesCec}</div>
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>Instrumentistes:</strong>
                      <div>{record.instrumentistes}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <button 
                      onClick={() => handleEdit(record)}
                      className="btn btn-warning me-2"
                    >
                      Modifier
                    </button>
                    <button 
                      onClick={() => handleDelete(record.id)}
                      className="btn btn-danger"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurgicalForm;
