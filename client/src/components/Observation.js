import React, { useState, useEffect } from 'react';
import DropboxChooser from 'react-dropbox-chooser';
import { useNavigate } from "react-router-dom";
import { saveAs } from 'file-saver';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
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

const Observation = () => {
  const [filesObs, setFilesObs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [userAccessLevel, setUserAccessLevel] = useState(null);
  const [commentType, setCommentType] = useState('Normal');
  const [customComment, setCustomComment] = useState('');
  const [editingFile, setEditingFile] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const PREDEFINED_COMMENTS = {
    Normal: "Commentaire standard",
    "Mission Canadienne": "Mission Canadienne - Intervention spéciale",
    "Mission Suisse": "Mission Suisse - Intervention spéciale"
  };

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const accessLevel = localStorage.getItem('userAccessLevel');
    setUserRole(role);
    setUserAccessLevel(accessLevel);
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "filesObs"), (snapshot) => {
      const filesObsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      const sortedFiles = filesObsData.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      setFilesObs(sortedFiles);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDropboxSuccess = async (selectedFilesObs) => {
    try {
      for (const file of selectedFilesObs) {
        const finalComment = commentType === 'Autres' ? customComment : PREDEFINED_COMMENTS[commentType];
        
        const newFile = {
          name: file.name,
          link: file.link,
          timestamp: new Date().toISOString(),
          comment: finalComment,
          commentType: commentType
        };

        const docRef = await addDoc(collection(db, "filesObs"), newFile);
        console.log("Fichier ajouté avec succès, ID:", docRef.id);
      }
      if (commentType === 'Autres') {
        setCustomComment('');
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      alert("Une erreur est survenue lors de l'ajout du fichier.");
    }
  };

  const handleEdit = (file) => {
    setEditingFile(file);
    setCommentType(file.commentType || 'Normal');
    setCustomComment(file.commentType === 'Autres' ? file.comment : '');
    window.scrollTo(0, 0);
  };

  const handleUpdate = async () => {
    try {
      const finalComment = commentType === 'Autres' ? customComment : PREDEFINED_COMMENTS[commentType];
      
      const fileRef = doc(db, "filesObs", editingFile.id);
      await updateDoc(fileRef, {
        comment: finalComment,
        commentType: commentType,
        timestamp: new Date().toISOString()
      });

      setEditingFile(null);
      setCommentType('Normal');
      setCustomComment('');
      
      console.log("Document mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      alert("Une erreur est survenue lors de la mise à jour.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      try {
        const fileRef = doc(db, "filesObs", id);
        await deleteDoc(fileRef);
        console.log("Fichier supprimé avec succès");
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Une erreur est survenue lors de la suppression du fichier.");
      }
    }
  };

  const handleOpenLink = (link) => {
    window.open(link, '_blank');
  };

  const filteredFiles = filesObs.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(file.timestamp).toLocaleString().toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <h2 className="text-center mb-4">STAFF</h2>
      <button className="btn btn-primary mb-3" onClick={() => navigate('/patients')}>
        Retour à la page d'enregistrement
      </button>

      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher par nom ou date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {(userRole === 'Médecin' && ['Affichage-Modification', 'Affichage-Modification-Suppression', 'Administrateur'].includes(userAccessLevel)) || 
       (userRole === 'Admin' && userAccessLevel === 'Administrateur') ? (
        <div className="mb-4">
          <h4 className="mb-3">
            {editingFile ? 'Modifier le document' : 'Ajouter un nouveau document'}
          </h4>
          
          <select 
            className="form-select mb-3"
            value={commentType}
            onChange={(e) => setCommentType(e.target.value)}
          >
            {Object.keys(PREDEFINED_COMMENTS).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
            <option value="Autres">Autres</option>
          </select>

          {commentType === 'Autres' && (
            <textarea
              className="form-control mb-3"
              value={customComment}
              onChange={(e) => setCustomComment(e.target.value)}
              placeholder="Entrez votre commentaire personnalisé..."
              rows="3"
            />
          )}

          {editingFile ? (
            <div className="d-flex gap-2 mb-3">
              <button 
                className="btn btn-success flex-grow-1"
                onClick={handleUpdate}
              >
                Mettre à jour
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setEditingFile(null);
                  setCommentType('Normal');
                  setCustomComment('');
                }}
              >
                Annuler
              </button>
            </div>
          ) : (
            <div className="text-center">
              <DropboxChooser
                appKey="gmhp5s9h3aup35v"
                success={handleDropboxSuccess}
                multiselect={true}
                extensions={['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt','.gif','.pptx','.svg','.jpeg', '.jpg', '.png']}
              >
                <button className="btn btn-primary">
                  Choisir les fichiers
                </button>
              </DropboxChooser>
            </div>
          )}
        </div>
      ) : null}

      <div className="row">
        {filteredFiles.map(file => (
          <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h5 className="card-title mb-0">{file.name}</h5>
                  <div className="d-flex gap-2">
                    {((userRole === 'Médecin' && ['Affichage-Modification', 'Affichage-Modification-Suppression', 'Administrateur'].includes(userAccessLevel)) ||
                      ) && (
                      <>
                        <button 
                          onClick={() => handleEdit(file)} 
                          className="btn btn-warning btn-sm"
                        >
                          Modifier
                        </button>
                        <button 
                          onClick={() => handleDelete(file.id)} 
                          className="btn btn-danger btn-sm"
                        >
                          Supprimer
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-muted small mb-3">
                  Date: {new Date(file.timestamp).toLocaleString()}
                </div>
                {file.comment && (
                  <div className="text-muted small mb-3">
                    Commentaire: {file.comment}
                  </div>
                )}
                <button
                  className="btn btn-info btn-sm w-100"
                  onClick={() => handleOpenLink(file.link)}
                >
                  Voir le Staff
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Observation;
