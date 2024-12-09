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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userAccessLevel, setUserAccessLevel] = useState(null);

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
    let filtered = [...files];
    
    // Filter based on search term
    if (searchTerm) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new Date(file.timestamp).toLocaleString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort by date
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    setSortedFiles(filtered);
  }, [files, searchTerm]);

  useEffect(() => {
    const handlePopState = (e) => {
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleDropboxSuccess = async (selectedFiles) => {
    const newFiles = selectedFiles.map(file => ({
      name: file.name,
      link: file.link,
      title: '',
      comment: '',
      timestamp: new Date().toISOString()
    }));

    for (const file of newFiles) {
      await addDoc(collection(db, "files"), file);
    }
  };

  const handleTitleChange = async (id, newTitle) => {
    const fileRef = doc(db, "files", id);
    await updateDoc(fileRef, { title: newTitle });
  };

  const handleCommentChange = async (id, newComment) => {
    const fileRef = doc(db, "files", id);
    await updateDoc(fileRef, { comment: newComment });
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
          placeholder="Rechercher par nom, titre, commentaire ou date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <button className="btn btn-primary mb-3" onClick={() => navigate('/patients')}>
        Retour à la page d'enregistrement
      </button>

      <div className="text-center mb-4">
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
                  <input
                    type="text"
                    value={file.title}
                    onChange={(e) => handleTitleChange(file.id, e.target.value)}
                    placeholder="Enter title"
                    className="form-control form-control-sm"
                  />
                  <div>
                    <button 
                      onClick={() => handleDelete(file.id)} 
                      className="btn btn-danger btn-sm"
                      style={{
                        display:
                          localStorage.getItem("userName") === "Ad" ||
                          (userRole === "Infirmier(e)" && userAccessLevel === "Affichage" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                          (userRole === "Archiviste" && userAccessLevel === "Affichage" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                          (userRole === "Gestionnaire" && userAccessLevel === "Affichage" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                          (userRole === "Etudiant(e)" && userAccessLevel === "Affichage" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                          (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                          (userRole === "Archiviste" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                          (userRole === "Gestionnaire" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                          (userRole === "Etudiant(e)" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                          (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                          (userRole === "Archiviste" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                          (userRole === "Gestionnaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                          (userRole === "Etudiant(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                          (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                          (userRole === "Archiviste" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                          (userRole === "Gestionnaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                          (userRole === "Etudiant(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"])
                            ? "none"
                            : "block",
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                <div className="file-info text-muted small">
                  <p><strong>Nom:</strong> {file.name}</p>
                  <p><strong>Date:</strong> {new Date(file.timestamp).toLocaleString()}</p>
                </div>

                <button
                  className="btn btn-info btn-sm"
                  onClick={() => handleOpenLink(file.link)}
                >
                  Programme Opératoire
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileManager;
