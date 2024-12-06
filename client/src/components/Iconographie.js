import React, { useState, useEffect } from 'react';
import DropboxChooser from 'react-dropbox-chooser';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';

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
  const [editingId, setEditingId] = useState(null);
  const APP_KEY = "23rlajqskcae2gk";

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
      await updateDoc(doc(db, 'iconographie', fileId), {
        comment: comment
      });

      setComments({
        ...comments,
        [fileId]: comment
      });
    } catch (error) {
      console.error("Error saving comment:", error);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await deleteDoc(doc(db, 'iconographie', fileId));
      setSelectedFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleUpdate = async (fileId, updatedData) => {
    try {
      await updateDoc(doc(db, 'iconographie', fileId), updatedData);
      setSelectedFiles(prevFiles =>
        prevFiles.map(file =>
          file.id === fileId ? { ...file, ...updatedData } : file
        )
      );
      setEditingId(null);
    } catch (error) {
      console.error("Error updating file:", error);
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
              {editingId === file.id ? (
                <div>
                  <input
                    className="form-control mb-2"
                    value={file.name}
                    onChange={(e) => setSelectedFiles(prevFiles =>
                      prevFiles.map(f =>
                        f.id === file.id ? { ...f, name: e.target.value } : f
                      )
                    )}
                  />
                  <div className="btn-group mb-2">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleUpdate(file.id, { name: file.name })}
                    >
                      Sauvegarder
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEditingId(null)}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h5 className="card-title">{file.name}</h5>
                  <p className="card-text">
                    <small className="text-muted">
                      Ajouté le: {new Date(file.timestamp).toLocaleString()}
                    </small>
                  </p>
                  <div className="btn-group mb-2">
                    <a 
                      href={file.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-secondary"
                    >
                      Voir le fichier
                    </a>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => setEditingId(file.id)}
                    >
                      Modifier
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        if(window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
                          handleDelete(file.id);
                        }
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </>
              )}
              
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

      <style jsx>{`
        .btn-group {
          gap: 5px;
        }
        .btn-group .btn {
          margin-right: 5px;
        }
      `}</style>
    </div>
  );
};

export default Iconographie;
