import React, { useState, useEffect } from 'react';
import DropboxChooser from 'react-dropbox-chooser';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDSQ0cQa7TISpd_vZWVa9dWMzbUUl-yf38",
  authDomain: "basecenterdb.firebaseapp.com",
  projectId: "basecenterdb",
  storageBucket: "basecenterdb.firebasestorage.app",
  messagingSenderId: "919766148380",
  appId: "1:919766148380:web:30db9986fa2cd8bb7106d9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const Iconographie = () => {
  const [tempComment, setTempComment] = useState('');
  const [tempFile, setTempFile] = useState(null);
  const [submittedFiles, setSubmittedFiles] = useState([]);
  const APP_KEY = "23rlajqskcae2gk";

  useEffect(() => {
    const fetchSubmittedFiles = async () => {
      try {
        const q = query(collection(db, 'iconographie'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const files = [];
        querySnapshot.forEach((doc) => {
          files.push({ id: doc.id, ...doc.data() });
        });
        setSubmittedFiles(files);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchSubmittedFiles();
  }, []);

  const handleSuccess = (files) => {
    const file = files[0];
    setTempFile({
      name: file.name,
      link: file.link,
      timestamp: new Date().toISOString()
    });
  };

  const handleSubmit = async () => {
    if (!tempFile) {
      alert('Veuillez sélectionner un fichier');
      return;
    }

    try {
      const fileWithComment = {
        ...tempFile,
        comment: tempComment
      };

      const docRef = await addDoc(collection(db, 'iconographie'), fileWithComment);
      const newFile = { id: docRef.id, ...fileWithComment };
      
      setSubmittedFiles(prev => [newFile, ...prev]);
      setTempFile(null);
      setTempComment('');
    } catch (error) {
      console.error("Error submitting file:", error);
      alert('Erreur lors de la soumission du fichier');
    }
  };

  return (
    <div className="container mt-4">
      {/* File Selection Section */}
      <div className="card mb-4">
        <div className="card-body">
          <h4>Ajouter un nouveau fichier</h4>
          
          <div className="mb-3">
            <DropboxChooser
              appKey={APP_KEY}
              success={handleSuccess}
              cancel={() => console.log('Cancelled')}
              multiselect={false}
            >
              <button className="btn btn-primary">
                Choisir un fichier depuis Dropbox
              </button>
            </DropboxChooser>
          </div>

          {tempFile && (
            <div className="mb-3">
              <p>Fichier sélectionné: {tempFile.name}</p>
              <textarea
                className="form-control"
                placeholder="Ajouter un commentaire"
                value={tempComment}
                onChange={(e) => setTempComment(e.target.value)}
              />
              <button 
                className="btn btn-success mt-2"
                onClick={handleSubmit}
              >
                Soumettre
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Submitted Files Section */}
      <div className="card">
        <div className="card-body">
          <h4>Fichiers soumis</h4>
          {submittedFiles.length === 0 ? (
            <p>Aucun fichier soumis</p>
          ) : (
            submittedFiles.map((file) => (
              <div key={file.id} className="card mb-3">
                <div className="card-body">
                  <h5 className="card-title">{file.name}</h5>
                  <p className="card-text">
                    <small className="text-muted">
                      Ajouté le: {new Date(file.timestamp).toLocaleString()}
                    </small>
                  </p>
                  <a
                    href={file.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-secondary"
                  >
                    Voir le fichier
                  </a>
                  {file.comment && (
                    <div className="mt-2">
                      <strong>Commentaire:</strong> {file.comment}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Iconographie;
