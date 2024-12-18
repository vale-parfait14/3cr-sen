import React, { useState, useEffect } from 'react';
import DropboxChooser from 'react-dropbox-chooser';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';

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

const APP_KEY = 'gmhp5s9h3aup35v';

const FileChooserWithComment = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [commentType, setCommentType] = useState('normal');
  const [customComment, setCustomComment] = useState('');
  const [fileEntries, setFileEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEntries, setFilteredEntries] = useState([]);

  const predefinedComments = {
    normal: 'Normal',
    mission: 'Mission Canadienne',
    autre: 'Autre'
  };

  useEffect(() => {
    loadFileEntries();
  }, []);

  useEffect(() => {
    handleSearch(searchTerm);
  }, [fileEntries, searchTerm]);

  const loadFileEntries = async () => {
    try {
      const q = query(collection(db, 'fileEntries'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const entries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFileEntries(entries);
      setFilteredEntries(entries);
    } catch (error) {
      console.error("Erreur lors du chargement des entrées:", error);
    }
  };

  const handleSearch = (term) => {
    const searchTermLower = term.toLowerCase();
    const filtered = fileEntries.filter(entry => 
      entry.fileName.toLowerCase().includes(searchTermLower) ||
      entry.comment.toLowerCase().includes(searchTermLower) ||
      entry.timestamp.toLowerCase().includes(searchTermLower)
    );
    setFilteredEntries(filtered);
  };

  const handleSuccess = async (files) => {
    const comment = commentType === 'autre' ? customComment : predefinedComments[commentType];
    
    for (const file of files) {
      try {
        const docRef = await addDoc(collection(db, 'fileEntries'), {
          fileName: file.name,
          fileLink: file.link,
          comment: comment,
          timestamp: new Date().toISOString()
        });

        const newEntry = {
          id: docRef.id,
          fileName: file.name,
          fileLink: file.link,
          comment: comment,
          timestamp: new Date().toISOString()
        };

        setFileEntries(prev => [newEntry, ...prev]);
      } catch (error) {
        console.error("Erreur lors de l'ajout du fichier:", error);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'fileEntries', id));
      setFileEntries(fileEntries.filter(entry => entry.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const handleEdit = async (id, newComment) => {
    try {
      const docRef = doc(db, 'fileEntries', id);
      await updateDoc(docRef, {
        comment: newComment
      });
      
      setFileEntries(fileEntries.map(entry => 
        entry.id === id ? { ...entry, comment: newComment } : entry
      ));
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="mb-4">
        <DropboxChooser 
          appKey={APP_KEY}
          success={handleSuccess}
          cancel={() => console.log('Cancelled')}
          multiselect={true}
        >
          <button className="btn btn-primary btn-block">
            Choisir des fichiers Dropbox
          </button>
        </DropboxChooser>
      </div>

      <div className="mb-4">
        <div className="form-group">
          <label htmlFor="commentType">Type de commentaire</label>
          <select 
            id="commentType"
            value={commentType}
            onChange={(e) => setCommentType(e.target.value)}
            className="form-control"
          >
            <option value="normal">Normal</option>
            <option value="mission">Mission Canadienne</option>
            <option value="autre">Autre</option>
          </select>
        </div>

        {commentType === 'autre' && (
          <div className="form-group mt-2">
            <input
              type="text"
              value={customComment}
              onChange={(e) => setCustomComment(e.target.value)}
              placeholder="Entrez votre commentaire"
              className="form-control"
            />
          </div>
        )}
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher..."
          className="form-control"
        />
      </div>

      <div className="mt-4">
        <h3 className="h4 mb-4">Fichiers sélectionnés:</h3>
        <div className="list-group">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="list-group-item">
              <p><strong>Fichier:</strong> {entry.fileName}</p>
              <a href={entry.fileLink} target="_blank" rel="noopener noreferrer" className="text-primary">
                Voir le fichier
              </a>
              <p><strong>Commentaire:</strong> {entry.comment}</p>
              <p><strong>Date:</strong> {new Date(entry.timestamp).toLocaleString()}</p>
              <div className="mt-2">
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="btn btn-danger btn-sm mr-2"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => {
                    const newComment = prompt('Modifier le commentaire:', entry.comment);
                    if (newComment) handleEdit(entry.id, newComment);
                  }}
                  className="btn btn-success btn-sm"
                >
                  Modifier
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileChooserWithComment;
