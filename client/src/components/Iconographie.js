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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [comments, setComments] = useState({});
  const APP_KEY = "23rlajqskcae2gk";

  // Fetch existing files from Firebase on component mount
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const q = query(collection(db, 'iconographie'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const files = [];
        querySnapshot.forEach((doc) => {
          files.push({ id: doc.id, ...doc.data() });
        });
        setSelectedFiles(files);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };
    fetchFiles();
  }, []);

  const handleSuccess = async (files) => {
    try {
      const filesWithTimestamp = files.map(file => ({
        name: file.name,
        link: file.link,
        timestamp: new Date().toISOString(),
        comment: ''
      }));

      // Add files to Firebase
      for (const file of filesWithTimestamp) {
        const docRef = await addDoc(collection(db, 'iconographie'), file);
        file.id = docRef.id;
      }

      setSelectedFiles(prevFiles => [...filesWithTimestamp, ...prevFiles]);
    } catch (error) {
      console.error("Error adding files to Firebase:", error);
    }
  };

  const handleComment = async (fileId, comment) => {
    try {
      // Update comment in Firebase
      await addDoc(collection(db, 'comments'), {
        fileId,
        comment,
        timestamp: new Date().toISOString()
      });

      setComments({
        ...comments,
        [fileId]: comment
      });
    } catch (error) {
      console.error("Error saving comment:", error);
    }
  };

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <DropboxChooser
          appKey={APP_KEY}
          success={handleSuccess}
          cancel={() => console.log('Cancelled')}
          multiselect={true}
        >
          <button className="btn btn-primary">
            Choisir des fichiers depuis Dropbox
          </button>
        </DropboxChooser>
      </div>

      <div className="selected-files mt-4">
        <h3>Fichiers sélectionnés:</h3>
        {selectedFiles.map((file) => (
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
              
              <div className="mt-2">
                <textarea
                  className="form-control"
                  placeholder="Ajouter un commentaire"
                  value={comments[file.id] || file.comment || ''}
                  onChange={(e) => handleComment(file.id, e.target.value)}
                />
              </div>
              
              {(comments[file.id] || file.comment) && (
                <div className="mt-2">
                  <strong>Commentaire:</strong> {comments[file.id] || file.comment}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Iconographie;
