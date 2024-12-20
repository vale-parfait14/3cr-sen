import React, { useState, useEffect } from 'react';
import DropboxChooser from 'react-dropbox-chooser';
import { useNavigate } from "react-router-dom";
import { saveAs } from 'file-saver';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
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

const FileManager = () => {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortedFiles, setSortedFiles] = useState([]);
  const [selectedComment, setSelectedComment] = useState('Normal');
  const [customComment, setCustomComment] = useState('');
  const [editingFile, setEditingFile] = useState(null);
  const [editComment, setEditComment] = useState('');
  const [editSelectedComment, setEditSelectedComment] = useState('Normal');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userAccessLevel, setUserAccessLevel] = useState(null);

  const predefinedComments = [
    'Normal',
    'Mission Canadienne',
    'Mission Suisse',
    'Autres'
  ];

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "files"), (snapshot) => {
      const filesData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setFiles(filesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const accessLevel = localStorage.getItem('userAccessLevel');
    setUserRole(role);
    setUserAccessLevel(accessLevel);
  }, []);

  useEffect(() => {
    let filtered = [...files];
    if (searchTerm) {
      filtered = filtered.filter(file => 
        file.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new Date(file.timestamp).toLocaleString().includes(searchTerm)
      );
    }
    setSortedFiles(filtered);
  }, [files, searchTerm]);

  const handleDropboxSuccess = async (selectedFiles) => {
    const newFiles = selectedFiles.map(file => ({
      name: file.name,
      link: file.link,
      comment: selectedComment === 'Autres' ? customComment : selectedComment,
      timestamp: new Date().toISOString(),
    }));

    for (const file of newFiles) {
      await addDoc(collection(db, "files"), file);
    }
  };

  const startEditing = (file) => {
    setEditingFile(file);
    setEditSelectedComment(file.comment);
    setEditComment(file.comment);
  };

  const saveEdit = async () => {
    if (!editingFile) return;

    const fileRef = doc(db, "files", editingFile.id);
    const updatedComment = editSelectedComment === 'Autres' ? editComment : editSelectedComment;
    
    await updateDoc(fileRef, {
      comment: updatedComment
    });

    setEditingFile(null);
    setEditComment('');
  };

  const cancelEdit = () => {
    setEditingFile(null);
    setEditComment('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      const fileRef = doc(db, "files", id);
      await deleteDoc(fileRef);
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await fetch(file.link);
      const blob = await response.blob();
      saveAs(blob, file.name);
    } catch (error) {
      console.error('Échec du téléchargement:', error);
    }
  };

  const handleOpenLink = (link) => {
    window.open(link, '_blank');
  };

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
      <h2 className="text-center mb-4">PROGRAMME OPERATOIRE</h2>
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher par nom, commentaire ou date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <button className="btn btn-primary mb-3" onClick={() => navigate('/patients')}>
        Retour à la page d'enregistrement
      </button>

      <div className="text-center mb-4">
        <div className="row justify-content-center mb-3">
          <div className="col-md-6">
            <select 
              className="form-select mb-2"
              value={selectedComment}
              onChange={(e) => setSelectedComment(e.target.value)}
            >
              {predefinedComments.map(comment => (
                <option key={comment} value={comment}>
                  {comment}
                </option>
              ))}
            </select>

            {selectedComment === 'Autres' && (
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Entrez votre commentaire personnalisé"
                value={customComment}
                onChange={(e) => setCustomComment(e.target.value)}
              />
            )}
          </div>
        </div>

        <DropboxChooser
          appKey="gmhp5s9h3aup35v"
          success={handleDropboxSuccess}
          multiselect={true}
          extensions={['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt','.gif','.pptx','.svg','.jpeg', '.jpg', '.png','.mp3','.mp4']}
        >
          <button className="btn btn-primary">
            Choisir les fichiers
          </button>
        </DropboxChooser>
      </div>

      <div className="row">
        {sortedFiles.map(file => (
          <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                  <div>
                    {(userRole === 'Secrétaire' && userAccessLevel === 'Administrateur') && (
                      <>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="btn btn-danger btn-sm me-2"
                        >
                          Supprimer
                        </button>
                        <button
                          onClick={() => startEditing(file)}
                          className="btn btn-warning btn-sm"
                        >
                          Modifier
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="file-info text-muted small">
                  <p><strong>{file.name}</strong></p>
                  
                  {editingFile?.id === file.id ? (
                    <div className="edit-form">
                      <select 
                        className="form-select mb-2"
                        value={editSelectedComment}
                        onChange={(e) => setEditSelectedComment(e.target.value)}
                      >
                        {predefinedComments.map(comment => (
                          <option key={comment} value={comment}>
                            {comment}
                          </option>
                        ))}
                      </select>

                      {editSelectedComment === 'Autres' && (
                        <input
                          type="text"
                          className="form-control mb-2"
                          placeholder="Entrez votre commentaire personnalisé"
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                        />
                      )}

                      <div className="mt-2">
                        <button 
                          className="btn btn-success btn-sm me-2"
                          onClick={saveEdit}
                        >
                          Enregistrer
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={cancelEdit}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p><strong>Commentaire:</strong> {file.comment}</p>
                      <p><strong>Date:</strong> {new Date(file.timestamp).toLocaleString()}</p>
                    </>
                  )}
                </div>

                <div className="mb-3">
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => handleOpenLink(file.link)}
                  >
                    Programme Opératoire
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileManager;
