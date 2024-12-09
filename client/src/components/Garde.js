import React, { useState, useEffect } from 'react';
import DropboxChooser from 'react-dropbox-chooser';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

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

const GardeAstreinte = () => {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const APP_KEY = 'gmhp5s9h3aup35v';
  const navigate= useNavigate();

  useEffect(() => {
    const filesQuery = query(
      collection(db, 'gardeAstreinte'), 
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(filesQuery, (snapshot) => {
      const filesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFiles(filesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSuccess = async (selectedFiles) => {
    try {
      for (const file of selectedFiles) {
        await addDoc(collection(db, 'gardeAstreinte'), {
          name: file.name,
          link: file.link,
          timestamp: new Date().toISOString(),
          type: file.type || 'unknown'
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout des fichiers:", error);
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      try {
        await deleteDoc(doc(db, 'gardeAstreinte', fileId));
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  const filteredFiles = files.filter(file => {
    const searchLower = searchTerm.toLowerCase();
    return (
      file.name.toLowerCase().includes(searchLower) ||
      file.link.toLowerCase().includes(searchLower) ||
      new Date(file.timestamp).toLocaleDateString().includes(searchTerm)
    );
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Garde Astreinte - Documents</h2>
      <button className="btn btn-primary mb-3" onClick={() => navigate('/role')}>
        Retour à la page d'accueil
      </button>
      
      <div className="row mb-4">
        <div className="col">
          <DropboxChooser 
            appKey={APP_KEY}
            success={handleSuccess}
            cancel={() => {}}
            multiselect={true}
            extensions={['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt','.gif','.pptx','.svg','.jpeg', '.jpg', '.png','.mp4','.mp3']}
          >
            <button className="btn btn-primary">
              Sélectionner des fichiers Dropbox
            </button>
          </DropboxChooser>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col">
          <input
            type="text"
            className="form-control"
            placeholder="Rechercher par nom, lien ou date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="row">
        {filteredFiles.map((file) => {
          const datetime = formatDateTime(file.timestamp);
          return (
            <div key={file.id} className="col-md-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{file.name}</h5>
                  <p className="card-text">
                    <small className="text-muted">
                      Date: {datetime.date}<br/>
                      Heure: {datetime.time}
                    </small>
                  </p>
                  <div className="d-flex justify-content-between">
                    <a 
                      href={file.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      Voir le document
                    </a>
                    <button 
                      onClick={() => handleDelete(file.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GardeAstreinte;
