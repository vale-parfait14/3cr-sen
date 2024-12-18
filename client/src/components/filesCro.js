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
    autre: 'autre'
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
    <div className="container p-4">
      <div className="mb-4">
        <DropboxChooser 
          appKey={APP_KEY}
          success={handleSuccess}
          cancel={() => console.log('Cancelled')}
          multiselect={true}
        >
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Choisir des fichiers Dropbox
          </button>
        </DropboxChooser>
      </div>

      <div className="mb-4">
        <select 
          value={commentType}
          onChange={(e) => setCommentType(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="normal">Normal</option>
          <option value="mission">Mission Canadienne</option>
          <option value="autre">Autre</option>
        </select>

        {commentType === 'autre' && (
          <input
            type="text"
            value={customComment}
            onChange={(e) => setCustomComment(e.target.value)}
            placeholder="Entrez votre commentaire"
            className="border p-2 rounded ml-2"
          />
        )}
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher..."
          className="w-full border p-2 rounded"
        />
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Fichiers sélectionnés:</h3>
        {filteredEntries.map((entry) => (
          <div key={entry.id} className="border p-4 mb-2 rounded">
            <p>Fichier: {entry.fileName}</p>
            <a href={entry.fileLink} target="_blank" rel="noopener noreferrer" className="text-blue-500">
              Voir le fichier
            </a>
            <p>Commentaire: {entry.comment}</p>
            <p>Date: {new Date(entry.timestamp).toLocaleString()}</p>
            <div className="mt-2">
              <button
                onClick={() => handleDelete(entry.id)}
                className="bg-red-500 text-white px-2 py-1 rounded mr-2"
              >
                Supprimer
              </button>
              <button
                onClick={() => {
                  const newComment = prompt('Modifier le commentaire:', entry.comment);
                  if (newComment) handleEdit(entry.id, newComment);
                }}
                className="bg-green-500 text-white px-2 py-1 rounded"
              >
                Modifier
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileChooserWithComment;
