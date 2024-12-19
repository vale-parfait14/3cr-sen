import React, { useState, useEffect } from 'react';
import DropboxChooser from 'react-dropbox-chooser';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDSQ0cQa7TISpd_vZWVa9dWMzbUUl-yf38",
  authDomain: "basecenterdb.firebaseapp.com",
  projectId: "basecenterdb",
  storageBucket: "basecenterdb.firebasestorage.app",
  messagingSenderId: "919766148380",
  appId: "1:919766148380:web:30db9986fa2cd8bb7106d9"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CommentForm = () => {
  const [commentaire, setCommentaire] = useState('Normal');
  const [autreCommentaire, setAutreCommentaire] = useState('');
  const [fichiers, setFichiers] = useState([]);
  const [anesthesistes, setAnesthesistes] = useState('');
  const [chirurgiens, setChirurgiens] = useState('');
  const [diagnostic, setDiagnostic] = useState('');
  const [indication, setIndication] = useState('');
  const [enregistrements, setEnregistrements] = useState([]);

  // Récupérer les données de l'utilisateur depuis localStorage
  const [userServiceId, setUserServiceId] = useState(localStorage.getItem('userServiceId'));
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
  const [userAccessLevel, setUserAccessLevel] = useState(localStorage.getItem('userAccessLevel'));

  // Récupérer les enregistrements de la base Firestore pour l'utilisateur connecté et de son service
  useEffect(() => {
    const fetchEnregistrements = async () => {
      const q = userRole === 'admin'
        ? query(collection(db, 'enregistrements'))
        : query(collection(db, 'enregistrements'), where('serviceId', '==', userServiceId));

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setEnregistrements(data);
    };

    if (userServiceId) {
      fetchEnregistrements();
    }
  }, [userServiceId, userRole]);

  const handleChangeCommentaire = (event) => {
    setCommentaire(event.target.value);
  };

  const handleAutreCommentaireChange = (event) => {
    setAutreCommentaire(event.target.value);
  };

  const handleFilesSelect = (files) => {
    setFichiers(files);
  };

  const handleDeleteFile = (fileUrl) => {
    setFichiers(fichiers.filter(file => file.link !== fileUrl));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newEnregistrement = {
      commentaire: commentaire === 'Autre' ? autreCommentaire : commentaire,
      fichiers,
      anesthesistes,
      chirurgiens,
      diagnostic,
      indication,
      userId: localStorage.getItem('userService'),
      serviceId: userServiceId,
    };

    try {
      await addDoc(collection(db, 'enregistrements'), newEnregistrement);
      resetForm();
      fetchEnregistrements(); 
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const resetForm = () => {
    setCommentaire('Normal');
    setAutreCommentaire('');
    setFichiers([]);
    setAnesthesistes('');
    setChirurgiens('');
    setDiagnostic('');
    setIndication('');
  };

  const handleModify = (index) => {
    const record = enregistrements[index];
    setCommentaire(record.commentaire);
    setAutreCommentaire(record.commentaire === 'Autre' ? record.commentaire : '');
    setFichiers(record.fichiers);
    setAnesthesistes(record.anesthesistes);
    setChirurgiens(record.chirurgiens);
    setDiagnostic(record.diagnostic);
    setIndication(record.indication);
    setEnregistrements(enregistrements.filter((_, i) => i !== index));
  };

  const handleDelete = async (index) => {
    const record = enregistrements[index];
    if (record.serviceId === userServiceId || userRole === 'admin') {
      try {
        await deleteDoc(doc(db, 'enregistrements', record.id));
        setEnregistrements(enregistrements.filter((_, i) => i !== index));
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
    } else {
      alert("Vous ne pouvez supprimer que les enregistrements de votre propre service.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Formulaire de Commentaire</h2>
      <form onSubmit={handleSubmit} className="bg-light p-4 rounded shadow-sm">
        <div className="form-group mb-3">
          <label htmlFor="commentaire">Commentaire :</label>
          <select
            id="commentaire"
            className="form-control"
            value={commentaire}
            onChange={handleChangeCommentaire}
          >
            <option value="Normal">Normal</option>
            <option value="Mission Canadienne">Mission Canadienne</option>
            <option value="Mission Suisse">Mission Suisse</option>
            <option value="Autre">Autre</option>
          </select>
          {commentaire === 'Autre' && (
            <textarea
              className="form-control mt-2"
              id="autreCommentaire"
              value={autreCommentaire}
              onChange={handleAutreCommentaireChange}
              placeholder="Saisissez votre commentaire personnalisé"
            />
          )}
        </div>

        <div className="form-group mb-3">
          <label htmlFor="anesthesistes">Anesthesiste(s) :</label>
          <input
            type="text"
            id="anesthesistes"
            className="form-control"
            value={anesthesistes}
            onChange={(e) => setAnesthesistes(e.target.value)}
          />
        </div>

        <div className="form-group mb-3">
          <label htmlFor="chirurgiens">Chirurgien(s) :</label>
          <input
            type="text"
            id="chirurgiens"
            className="form-control"
            value={chirurgiens}
            onChange={(e) => setChirurgiens(e.target.value)}
          />
        </div>

        <div className="form-group mb-3">
          <label htmlFor="diagnostic">Diagnostic :</label>
          <input
            type="text"
            id="diagnostic"
            className="form-control"
            value={diagnostic}
            onChange={(e) => setDiagnostic(e.target.value)}
          />
        </div>

        <div className="form-group mb-3">
          <label htmlFor="indication">Indication Opératoire :</label>
          <input
            type="text"
            id="indication"
            className="form-control"
            value={indication}
            onChange={(e) => setIndication(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <DropboxChooser
            appKey="your-dropbox-app-key"
            success={handleFilesSelect}
            cancel={() => {}}
          >
            <button type="button" className="btn btn-primary">
              Choisir des fichiers
            </button>
          </DropboxChooser>
        </div>

        {fichiers.length > 0 && (
          <div>
            <h5>Fichiers sélectionnés :</h5>
            <ul className="list-group mb-3">
              {fichiers.map((file, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  <a href={file.link} target="_blank" rel="noopener noreferrer">
                    {file.name}
                  </a>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteFile(file.link)}
                  >
                    Supprimer
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button type="submit" className="btn btn-success">Enregistrer</button>
      </form>

      <h3 className="mt-4">Enregistrements :</h3>
      <div className="row">
        {enregistrements.map((record, index) => (
          <div key={index} className="col-md-6 col-lg-4 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Commentaire : {record.commentaire}</h5>
                <p><strong>Anesthésistes :</strong> {record.anesthesistes}</p>
                <p><strong>Chirurgiens :</strong> {record.chirurgiens}</p>
                <p><strong>Diagnostic :</strong> {record.diagnostic}</p>
                <p><strong>Indication Opératoire :</strong> {record.indication}</p>

                <div>
                  <strong>Fichiers :</strong>
                  {record.fichiers.map((file, index) => (
                    <div key={index}>
                      <a href={file.link} target="_blank" rel="noopener noreferrer">
                        {file.name}
                      </a>
                    </div>
                  ))}
                </div>

                {userRole === 'admin' || record.serviceId === userServiceId ? (
                  <div className="mt-2">
                    <button className="btn btn-warning btn-sm" onClick={() => handleModify(index)}>Modifier</button>
                    <button className="btn btn-danger btn-sm ml-2" onClick={() => handleDelete(index)}>Supprimer</button>
                  </div>
                ) : (
                  <p>Vous ne pouvez pas modifier ou supprimer cet enregistrement.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentForm;
