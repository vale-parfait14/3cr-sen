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
  const [commentType, setCommentType] = useState('normal');
  const [customComment, setCustomComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
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
    
    // Si des fichiers sont déjà sélectionnés, les ajouter à la liste des fichiers existants.
    const newFiles = files.map(file => ({
      fileName: file.name,
      fileLink: file.link,
    }));

    const docRef = await addDoc(collection(db, 'fileEntries'), {
      files: newFiles, // Ajout des fichiers dans un seul enregistrement
      comment: comment,
      timestamp: new Date().toISOString()
    });

    const newEntry = {
      id: docRef.id,
      files: newFiles,
      comment: comment,
      timestamp: new Date().toISOString()
    };

    setFileEntries(prev => [newEntry, ...prev]);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'fileEntries', id));
      setFileEntries(fileEntries.filter(entry => entry.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const handleEdit = async (id, newComment, newFiles) => {
    try {
      const docRef = doc(db, 'fileEntries', id);
      await updateDoc(docRef, {
        comment: newComment,
        files: newFiles // Met à jour les fichiers
      });

      setFileEntries(fileEntries.map(entry => 
        entry.id === id ? { ...entry, comment: newComment, files: newFiles } : entry
      ));
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
    }
  };

  const handleFileEdit = (id, entry) => {
    const newFiles = [...entry.files];
    const newComment = prompt('Modifier le commentaire:', entry.comment);
    if (newComment !== null) {
      // Modifications de fichiers si nécessaire
      // Ajouter ou supprimer des fichiers ici selon l'interaction souhaitée
      handleEdit(id, newComment, newFiles);
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        {/* Step 1: Choisir le commentaire */}
        <div className="form-group">
          <label htmlFor="commentType">Choisissez un type de commentaire</label>
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

        {/* Step 2: Input pour commentaire personnalisé si "Autre" est sélectionné */}
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

      {/* Step 3: Choisir les fichiers */}
      <div className="mb-4">
        <DropboxChooser 
          appKey={APP_KEY}
          success={handleSuccess}
          cancel={() => console.log('Cancelled')}
          multiselect={true}
        >
          <button className="btn btn-primary w-100">
            Choisir des fichiers Dropbox
          </button>
        </DropboxChooser>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher..."
          className="form-control"
        />
      </div>

      {/* Step 4: Affichage des fichiers en cartes */}
      <div className="row">
        <h3 className="h4 mb-4 w-100">Fichiers sélectionnés:</h3>
        {filteredEntries.map((entry) => (
          <div key={entry.id} className="col-12 col-sm-6 col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">Fichiers :</h5>
                {entry.files.map((file, index) => (
                  <div key={index}>
                    <p>{file.fileName}</p>
                    <a href={file.fileLink} target="_blank" rel="noopener noreferrer" className="card-link text-primary">
                      Voir le fichier
                    </a>
                  </div>
                ))}
                <p className="card-text"><strong>Commentaire:</strong> {entry.comment}</p>
                <p className="card-text"><strong>Date:</strong> {new Date(entry.timestamp).toLocaleString()}</p>
              </div>
              <div className="card-footer text-center">
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="btn btn-danger btn-sm mr-2"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => handleFileEdit(entry.id, entry)}
                  className="btn btn-success btn-sm"
                >
                  Modifier
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileChooserWithComment;
