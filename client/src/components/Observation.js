import React, { useState, useEffect } from 'react';
import DropboxChooser from 'react-dropbox-chooser';
import { useNavigate } from "react-router-dom";
import { saveAs } from 'file-saver';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { GlobalWorkerOptions, version } from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.js`;

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

const Observation = () => {
  const [filesObs, setFilesObs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFile, setEditingFile] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "filesObs"), (snapshot) => {
      const filesObsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setFilesObs(filesObsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDropboxSuccess = async (selectedFilesObs) => {
    const newFilesObs = selectedFilesObs.map(file => ({
      name: file.name,
      link: file.link,
      comment: '',
      timestamp: new Date().toISOString()
    }));

    for (const file of newFilesObs) {
      await addDoc(collection(db, "filesObs"), file);
    }
  };

  const handleCommentChange = async (id, newComment) => {
    const fileRef = doc(db, "filesObs", id);
    await updateDoc(fileRef, { comment: newComment });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      const fileRef = doc(db, "filesObs", id);
      await deleteDoc(fileRef);
    }
  };

  const handleOpenLink = (link) => {
    window.open(link, '_blank');
  };

  const handleEdit = (file) => {
    setEditingFile(file);
  };

  const handleSaveEdit = async () => {
    if (editingFile) {
      const fileRef = doc(db, "filesObs", editingFile.id);
      await updateDoc(fileRef, {
        name: editingFile.name,
        comment: editingFile.comment
      });
      setEditingFile(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingFile(null);
  };

  const filteredFiles = filesObs.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (file.comment && file.comment.toLowerCase().includes(searchTerm.toLowerCase())) ||
    new Date(file.timestamp).toLocaleString().toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <h2 className="text-center mb-4">STAFF</h2>
      <button className="btn btn-primary" onClick={() => navigate('/patients')}>
        Retour à la page d'enregistrement
      </button>

      <div className="mb-4 mt-4">
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher par nom, commentaire ou date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="text-center mb-4">
        <DropboxChooser
          appKey="gmhp5s9h3aup35v"
          success={handleDropboxSuccess}
          multiselect={true}
          extensions={['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt','.gif','.pptx','.svg','.jpeg', '.jpg', '.png']}
        >
          <button className="btn btn-primary">
            Choisir les fichiers
          </button>
        </DropboxChooser>
      </div>

      <div className="row">
        {filteredFiles.map(file => (
          <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                  {editingFile?.id === file.id ? (
                    <input
                      type="text"
                      className="form-control"
                      value={editingFile.name}
                      onChange={(e) => setEditingFile({...editingFile, name: e.target.value})}
                    />
                  ) : (
                    <strong>{file.name}</strong>
                  )}
                  <div>
                    {editingFile?.id === file.id ? (
                      <>
                        <button 
                          onClick={handleSaveEdit}
                          className="btn btn-success btn-sm me-2"
                        >
                          Sauvegarder
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          className="btn btn-secondary btn-sm"
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleEdit(file)}
                          className="btn btn-primary btn-sm me-2"
                        >
                          Modifier
                        </button>
                        <button 
                          onClick={() => handleDelete(file.id)} 
                          className="btn btn-danger btn-sm"
                        >
                          Supprimer
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <textarea
                  className="form-control mb-3"
                  placeholder="Ajouter un commentaire"
                  value={editingFile?.id === file.id ? editingFile.comment : (file.comment || '')}
                  onChange={(e) => editingFile?.id === file.id 
                    ? setEditingFile({...editingFile, comment: e.target.value})
                    : handleCommentChange(file.id, e.target.value)
                  }
                />

                <div className="text-muted small mb-3">
                  Date: {new Date(file.timestamp).toLocaleString()}
                </div>

                <button
                  className="btn btn-info btn-sm"
                  onClick={() => handleOpenLink(file.link)}
                >
                  Voir le Staff
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Observation;
