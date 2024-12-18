import React, { useState, useEffect } from 'react';
import DropboxChooser from 'react-dropbox-chooser';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy, arrayUnion, arrayRemove } from 'firebase/firestore';

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
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [editEntry, setEditEntry] = useState(null); // Store the entry being edited
  const [searchTerm, setSearchTerm] = useState('');

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
          timestamp: new Date().toISOString(),
          files: [file.link] // Save the files in an array
        });

        const newEntry = {
          id: docRef.id,
          fileName: file.name,
          fileLink: file.link,
          comment: comment,
          timestamp: new Date().toISOString(),
          files: [file.link] // Save the files in an array
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

  const handleEdit = async (id, newComment, newFiles) => {
    try {
      const docRef = doc(db, 'fileEntries', id);

      // Update the comment
      await updateDoc(docRef, {
        comment: newComment
      });

      // Update the files (add or remove)
      for (const file of newFiles.addedFiles) {
        await updateDoc(docRef, {
          files: arrayUnion(file)
        });
      }

      for (const file of newFiles.removedFiles) {
        await updateDoc(docRef, {
          files: arrayRemove(file)
        });
      }

      setFileEntries(fileEntries.map(entry => 
        entry.id === id ? { ...entry, comment: newComment, files: [...entry.files, ...newFiles.addedFiles] } : entry
      ));

      // Reset the edit form
      setEditEntry(null);
      setCustomComment('');
      setSelectedFiles([]);
      setCommentType('normal');
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
    }
  };

  const handleFileUpdate = async (id, currentFiles) => {
    // Open DropboxChooser to add new files
    DropboxChooser.open({
      appKey: APP_KEY,
      multiselect: true,
      success: async (newFiles) => {
        // Create a list of added files
        const addedFiles = newFiles.filter(file => !currentFiles.some(existingFile => existingFile === file.link));

        // Create a list of removed files
        const removedFiles = currentFiles.filter(existingFile => !newFiles.some(file => file.link === existingFile));

        if (addedFiles.length > 0 || removedFiles.length > 0) {
          const newComment = prompt('Modifiez le commentaire:', fileEntries.find(entry => entry.id === id).comment);
          if (newComment) {
            // Update the entry with new files and new comment
            await handleEdit(id, newComment, { addedFiles, removedFiles });
          }
        }
      }
    });
  };

  const handleStartEditing = (entry) => {
    setEditEntry(entry); // Set the entry to edit
    setCustomComment(entry.comment); // Pre-fill the comment
    setSelectedFiles(entry.files); // Pre-fill the files
    setCommentType('normal'); // Reset the comment type (you can modify this depending on your needs)
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        {/* Step 1: Form for editing comment and files */}
        {editEntry && (
          <>
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

            {/* Dropbox file chooser for adding new files */}
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

            <h4>Fichiers associés :</h4>
            <ul>
              {selectedFiles.map((file, index) => (
                <li key={index}>
                  {file}
                  <button
                    onClick={() => {
                      setSelectedFiles(selectedFiles.filter(f => f !== file));
                    }}
                    className="btn btn-danger btn-sm ml-2"
                  >
                    Supprimer
                  </button>
                </li>
              ))}
            </ul>

            <div className="mb-4">
              <button
                className="btn btn-success"
                onClick={() => handleEdit(editEntry.id, customComment, { addedFiles: selectedFiles, removedFiles: [] })}
              >
                Sauvegarder les modifications
              </button>
              <button
                className="btn btn-secondary ml-2"
                onClick={() => setEditEntry(null)}
              >
                Annuler
              </button>
            </div>
          </>
        )}
      </div>

      {/* Step 2: Displaying files as cards */}
      <div className="row">
        <h3 className="h4 mb-4 w-100">Fichiers enregistrés:</h3>
        {filteredEntries.map((entry) => (
          <div key={entry.id} className="col-12 col-sm-6 col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{entry.fileName}</h5>
                <a href={entry.fileLink} target="_blank" rel="noopener noreferrer" className="card-link text-primary">
                  Voir le fichier
                </a>
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
                  onClick={() => handleStartEditing(entry)}
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
