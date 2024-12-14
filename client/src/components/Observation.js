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

const Observation = () => {
  const [filesObs, setFilesObs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userAccessLevel, setUserAccessLevel] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "filesObs"), (snapshot) => {
      const filesObsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setFilesObs(filesObsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDropboxSuccess = async (selectedFilesObs) => {
    const newFilesObs = selectedFilesObs.map(file => ({
      name: file.name,
      link: file.link,
      title: '',
      comment: '',
      timestamp: new Date().toISOString(),
    }));

    for (const file of newFilesObs) {
      await addDoc(collection(db, "filesObs"), file);
    }
  };

  const handleOrderChange = async (id, newComment) => {
    const fileRef = doc(db, "filesObs", id);
    await updateDoc(fileRef, { comment: parseInt(newComment) });
  };

  const handleTitleChange = async (id, newTitle) => {
    const fileRef = doc(db, "filesObs", id);
    await updateDoc(fileRef, { title: newTitle });
  };

  const handleCommentChange = async (id, newComment) => {
    const fileRef = doc(db, "filesObs", id);
    await updateDoc(fileRef, { comment: newComment });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      const fileRef = doc(db, "filesObs", id);
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

  // Tri des fichiers uniquement par le numéro d'ordre
  const sortedAndFilteredFiles = [...filesObs]
    .sort((a, b) => a.comment - b.comment) // Tri par ordre uniquement
    .filter(file => 
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      <button className="btn btn-primary" onClick={() => navigate('/patients')}>
        Retour à la page d'enregistrement
      </button>

      <div className="mb-4 mt-4">
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher par nom, titre, commentaire ou date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="text-center mb-4">
        <DropboxChooser
          appKey="23rlajqskcae2gk"
          success={handleDropboxSuccess}
          multiselect={true}
          extensions={['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt','.gif','.pptx','.svg','.jpeg', '.jpg', '.png']}
        >
          <button className="btn btn-primary">
            Choisir les fichiers
          </button>
        </DropboxChooser>
      </div>

      <div className="row">
        {sortedAndFilteredFiles.map(file => (
          <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                  <button
                  className="btn btn-info btn-sm"
                  onClick={() => handleOpenLink(file.link)}
                >
                  Voir le Staff
                </button>
                  <div>
                    <button 
                      onClick={() => handleDelete(file.id)} 
                      className="btn btn-danger btn-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                <div className="file-info text-muted small">
                  <p><strong>{file.name}</strong> </p>
                    {/*<p><strong>Date:</strong> {new Date(file.timestamp).toLocaleString()}</p>*/}
                  </div>

                {/* Champ pour l'ordre */}
                <div className="mb-3">
                  Ordre du fichier :
                  <input
                    type="text"
                    className="form-control form-control-sm w-50"
                    placeholder="commentaire"
                    value={file.comment}
                    onChange={(e) => handleOrderChange(file.id, e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Observation;
