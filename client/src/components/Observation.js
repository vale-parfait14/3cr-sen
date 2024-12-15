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
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [tempComment, setTempComment] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [userAccessLevel, setUserAccessLevel] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

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
      // Sort files by timestamp in descending order
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
        const userComment = prompt(`Ajoutez un commentaire pour le fichier "${file.name}" :`);
        
        const newFile = {
          name: file.name,
          link: file.link,
          comment: userComment || '',
          timestamp: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, "filesObs"), newFile);
        console.log("Fichier ajouté avec succès, ID:", docRef.id);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      alert("Une erreur est survenue lors de l'ajout du fichier.");
    }
  };

  const handleUpdateComment = async (id, newComment) => {
    try {
      const fileRef = doc(db, "filesObs", id);
      await updateDoc(fileRef, { comment: newComment });
      console.log("Commentaire mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du commentaire:", error);
      alert("Une erreur est survenue lors de la mise à jour du commentaire.");
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

  const filteredFiles = filesObs
  .filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (file.comment && file.comment.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
          placeholder="Rechercher par nom, commentaire ou date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="text-center mb-4">
  {(userRole === 'Médecin' && ['Affichage-Modification', 'Affichage-Modification-Suppression', 'Administrateur'].includes(userAccessLevel)) || 
   (userRole === 'Admin' && userAccessLevel === 'Administrateur') ? (
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
  ) : null}
</div>

      <div className="row">
        {filteredFiles.map(file => (
          <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h5 className="card-title mb-0">{file.name}</h5>
                {((userRole === 'Médecin' && ['Affichage-Modification-Suppression', 'Administrateur'].includes(userAccessLevel)) ||
  (userRole === 'Admin' && userAccessLevel === 'Administrateur')) && (
  <button 
    onClick={() => handleDelete(file.id)} 
    className="btn btn-danger btn-sm"
  >
    Supprimer
  </button>
)}


                </div>
                {((userRole === 'Médecin' && ['Affichage-Modification', 'Affichage-Modification-Suppression', 'Administrateur'].includes(userAccessLevel)) ||
  (userRole === 'Admin' && userAccessLevel === 'Administrateur')) && (
                <div className="mb-3">
                  
                  <textarea
                    className="form-control mt-2"
                    value={file.comment || ''}
                    onChange={(e) => handleUpdateComment(file.id, e.target.value)}
                    placeholder="Ajouter/modifier le commentaire"
                  />
                </div>
                )}
                <div className="text-muted small mb-3">
                  Date: {new Date(file.timestamp).toLocaleString()}
                </div>

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
