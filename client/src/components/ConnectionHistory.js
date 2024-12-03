import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import jsPDF from 'jspdf';

const ConnectionHistory = () => {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState({ name: '', date: '', service: '' });
  const [modalVisible, setModalVisible] = useState(false);

const toggleModal = () => {
  setModalVisible(prevState => !prevState);
};


  // Charger l'historique de connexions depuis localStorage
  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem('connectionHistory')) || [];
    setHistory(storedHistory);
  }, []);

  // Filtrer l'historique en fonction du nom, de la date et du service
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

  // Supprimer l'historique
  const handleDeleteHistory = () => {
    localStorage.removeItem('connectionHistory');
    setHistory([]);
    alert('Historique supprimé');
  };

  // Générer un PDF avec l'historique
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
                <tr key={index}>
                  <td>{entry.userName}</td>
                  <td>{entry.date}</td>
                  <td>{entry.time}</td>
                  <td>{entry.userService}</td> {/* Affichage du service */}
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