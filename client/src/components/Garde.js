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
  const APP_KEY = '23rlajqskcae2gk';

  // Récupération des fichiers depuis Firebase
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

  const handleCancel = () => {
    console.log('Sélection annulée');
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
    return <div>Chargement...</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Garde Astreinte - Documents</h2>
      
      <div className="row mb-4">
        <div className="col">
          <DropboxChooser 
            appKey={APP_KEY}
            success={handleSuccess}
            cancel={handleCancel}
            multiselect={true}
            extensions={['.pdf', '.doc', '.docx']}
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
        {filteredFiles.map((file) => (
          <div key={file.id} className="col-md-4 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{file.name}</h5>
                <p className="card-text">
                  <small className="text-muted">
                    Date: {new Date(file.timestamp).toLocaleDateString()}
                  </small>
                </p>
                <a 
                  href={file.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  Voir le document
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GardeAstreinte;
