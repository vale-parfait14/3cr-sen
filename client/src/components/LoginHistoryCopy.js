import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, deleteDoc, getDocs } from 'firebase/firestore';

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

const ConnectionHistory = () => {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState({ name: '', date: '', service: '' });
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "connectionHistory"), (snapshot) => {
      const historyData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistory(historyData);
    });

    return () => unsubscribe();
  }, []);

  const toggleModal = () => {
    setModalVisible(prevState => !prevState);
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearch((prevSearch) => ({
      ...prevSearch,
      [name]: value,
    }));
  };

  const filteredHistory = history.filter((entry) => {
    return (
      (search.name === '' || entry.userName.toLowerCase().includes(search.name.toLowerCase())) &&
      (search.date === '' || entry.date.includes(search.date)) &&
      (search.service === '' || entry.userService.toLowerCase().includes(search.service.toLowerCase()))
    );
  });

  const handleDeleteHistory = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "connectionHistory"));
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      toast.success('Historique supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'historique');
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Historique des connexions', 20, 10);

    filteredHistory.forEach((entry, index) => {
      doc.text(`${entry.userName} - ${entry.date} ${entry.time} - ${entry.userService}`, 20, 20 + (index * 10));
    });

    doc.save('historique_connexions.pdf');
  };

  return (
    <div className="mt-4">
      <h3>Historique des Connexions</h3>
      <div className="container mt-4">
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <div className="input-group">
              <input
                type="text"
                name="name"
                value={search.name}
                onChange={handleSearchChange}
                placeholder="Rechercher par nom"
                className="form-control"
              />
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="input-group">
              <input
                type="text"
                name="date"
                value={search.date}
                onChange={handleSearchChange}
                placeholder="Rechercher par date"
                className="form-control"
              />
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="input-group">
              <input
                type="text"
                name="service"
                value={search.service}
                onChange={handleSearchChange}
                placeholder="Rechercher par service"
                className="form-control"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <button className="btn btn-danger mb-3" onClick={handleDeleteHistory}>
              Supprimer l'historique
            </button>
          </div>

          <div className="col-12 col-md-4">
            <button className="btn btn-primary mb-3 ms-2" onClick={generatePDF}>
              Télécharger l'historique en PDF
            </button>
          </div>
          <div className="col-12 col-md-4">
            <button className="btn btn-primary mb-3 ms-2" onClick={()=> navigate("/patients")}>
              Retour vers des patients
            </button>
          </div>
        </div>
      </div>

      <div className="table-responsive mt-4">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Nom d'utilisateur</th>
              <th>Date</th>
              <th>Heure</th>
              <th>Service</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length > 0 ? (
              filteredHistory.map((entry, index) => (
                <tr key={entry.id}>
                  <td>{entry.userName}</td>
                  <td>{entry.date}</td>
                  <td>{entry.time}</td>
                  <td>{entry.userService}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">Aucune donnée disponible</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ToastContainer />
    </div>
  );
};

export default ConnectionHistory;
