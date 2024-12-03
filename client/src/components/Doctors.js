import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePatientDoctorContext } from './PatientDoctorContext';
import DropboxChooser from 'react-dropbox-chooser';
import { jsPDF } from "jspdf"; // For PDF generation/
import PatientFiles from "./PatientFiles";
import DropboxForm from "./Archive";



const Doctors = ({ token, userId, refresh }) => {
  const { patients, updatePatients } = usePatientDoctorContext();
  const [formData, setFormData] = useState({
    pathologie: "",
    dossierNumber: "",
    service: "",
    anneeDossier: "",
    anneeIntervention: "",
    nom: "",
    age: "",
    genre: "",
    poids: "",
    taille: "",
    groupeSanguin: "",
    dateNaissance: "",
    nationalite: "",
    profession: "",
    numeroDeTelephone: "",
    addressEmail: "",
    addressDomicile: "",
    salle: "",
    lit: "",
    correspondant: "",
    dateEntree: "",
    dateSortie: "",
    diagnostic: "",
    statut: "",
    departementTransfert: "", // Add this new field
    dateDeces: "",
    dateDesortie: "",
    consultationReason: "",
    traitementEntree: "",
    traitementSortie: "",
    simpleSuites: "",
    complications: "",
    geste: "",
    operateur: "",
    histoire: "",
    antecedents: "",
    traitement: "",
    ecrt: "",
    ecg: "",
    ett: "",
    tt: "",
    coronarographie: "",
    autresExamens: "",
    biologie: "",
    cro: "",
    rxthoraxPost: "",
    ecgPost: "",
    echoscopiePost: "",
    biologiePost: "",
    gazo: "",
    ecp: "",
    dsr: "",
    dateJour: ""
  });
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedPatientId, setExpandedPatientId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dropboxFiles, setDropboxFiles] = useState([]);
  //const [fileLinks, setFileLinks] = useState({}); // To store file links for patients
  const [password, setPassword] = useState("");
  // Add this near the other useState declarations
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const[showAddFields, setShowAddFields] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const fetchPatients = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/patients", {
        headers: { Authorization: token },
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des patients");
      }

      const data = await response.json();
      updatePatients(data);
      console.log("Patients récupérés avec succès !");
    } catch (error) {
      console.error("Erreur:", error.message);
      toast.error(error.message);
    }
  }, [token, updatePatients]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPatients();
    }
  }, [fetchPatients, refresh, isAuthenticated]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === "789") {
      setIsAuthenticated(true);
      toast.success("Accès accordé !");
    } else {
      toast.error("Mot de passe incorrect !");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `http://localhost:5000/api/patients/${editing}`
      : "http://localhost:5000/api/patients";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ ...formData, userId }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement du patient");
      }

      const newPatient = { ...formData, userId };

      if (editing) {
        updatePatients((prevPatients) =>
          prevPatients.map((patient) =>
            patient._id === editing ? { ...patient, ...newPatient } : patient
          )
        );
      } else {
        updatePatients((prevPatients) => [...prevPatients, newPatient]);
      }

      setFormData({
        pathologie: "",
        dossierNumber: "",
        service: "",
        anneeDossier: "",
        anneeIntervention: "",
        nom: "",
        age: "",
        genre: "",
        poids: "",
        taille: "",
        groupeSanguin: "",
        dateNaissance: "",
        nationalite: "",
        profession: "",
        numeroDeTelephone: "",
        addressEmail: "",
        addressDomicile: "",
        salle: "",
        lit: "",
        correspondant: "",
        dateEntree: "",
        dateSortie: "",
        diagnostic: "",
        statut: "",
        departementTransfert: "", // Add this new field
        dateDeces: "",
        dateDesortie: "",
        consultationReason: "",
        traitementEntree: "",
        traitementSortie: "",
        simpleSuites: "",
        complications: "",
        geste: "",
        operateur: "",
        histoire: "",
        antecedents: "",
        traitement: "",
        ecrt: "",
        ecg: "",
        ett: "",
        tt: "",
        coronarographie: "",
        autresExamens: "",
        biologie: "",
        cro: "",
        rxthoraxPost: "",
        ecgPost: "",
        echoscopiePost: "",
        biologiePost: "",
        gazo: "",
        ecp: "",
        dsr: "",
        dateJour: ""
      });

      setEditing(null);
      toast.success("Succès !");
    } catch (error) {
      console.error("Erreur:", error.message);
      toast.error(error.message);
    }
  };

  const handleEdit = (patient) => {
    setFormData({ ...patient });
    setEditing(patient._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce patient ?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/patients/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du patient");
      }

      updatePatients((prevPatients) => prevPatients.filter((patient) => patient._id !== id));

      // Remove associated files for the deleted patient
      /*setFileLinks((prevLinks) => {
        const updatedLinks = { ...prevLinks };
        delete updatedLinks[id];
        return updatedLinks;
      });*/

      toast.success("Patient supprimé avec succès !");
    } catch (error) {
      console.error("Erreur:", error.message);
      toast.error(error.message);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "" || patient.statut === statusFilter)
  );

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  function handleSuccess(files) {
    toast.success("Dropbox Success");
    setDropboxFiles(files.map(file => ({
      id: file.id,
      name: file.name,
      thumbnailLink: file.thumbnailLink,
      url: file.link // or any other link you want to keep
    })));
  }
  useEffect(() => {
    // Intercepter la tentative de retour arrière
    const handlePopState = (e) => {
      // Empêcher la navigation en arrière
      window.history.pushState(null, '', window.location.href);
    };

    // Ajouter un événement 'popstate' pour empêcher l'utilisateur de revenir en arrière
    window.history.pushState(null, '', window.location.href); // Empêche de revenir en arrière
    window.addEventListener('popstate', handlePopState);

    // Nettoyer l'écouteur d'événements lors du démontage du composant
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); // L'effet se déclenche une seule fois, lors du montage du composant


  const renderPatientDetails = (patient) => {
    return (
      <div className="patient-details" id="patient-details">
        <h3>Détails du Patient :</h3>
        <table>
          <thead>
            <tr>
              <th>Champ</th>
              <th>Valeur</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(patient).map(([key, value]) => (
              <tr key={key}>
                <td><strong>{key}:</strong></td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handleToggleDetails = (patientId) => {
    setExpandedPatientId((prevId) => (prevId === patientId ? null : patientId));
  };

  const exportPatientDetails = (patient) => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Détails du Patient", 10, 10);

    // Add patient details
    let y = 20; // Starting y position
    Object.entries(patient).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 10, y);
      y += 10; // Move down for the next line
    });

    // Save the PDF
    doc.save(`${patient.nom}_details.pdf`);
  };

  return (
    <div className={`patients-container ${isDarkMode ? "dark" : "light"}`}>
      <div className="father-header">
            
          <div className="header">
          <button 
          className="btn3"
          onClick={toggleTheme}>
            {isDarkMode ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                fill="currentColor"
                class="bi bi-brightness-high-fill"
                viewBox="0 0 16 16"
              >
                <path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                fill="currentColor"
                class="bi bi-moon-stars"
                viewBox="0 0 16 16"
              >
                <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278M4.858 1.311A7.27 7.27 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.32 7.32 0 0 0 5.205-2.162q-.506.063-1.029.063c-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286" />
                <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.73 1.73 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.73 1.73 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.73 1.73 0 0 0 1.097-1.097zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z" />
              </svg>
            )}
          </button>
          <button onClick={() => navigate("/")}
            className="btn3"
            >
            {/* Logout icon */}
                  
            <svg xmlns="http://www.w3.org/2000/svg" 
                 width="25" height="25" 
                fill="currentColor"
                class="bi bi-door-open-fill" viewBox="0 0 16 16">
                <path d="M1.5 15a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1H13V2.5A1.5 1.5 0 0 0 11.5 1H11V.5a.5.5 0 0 0-.57-.495l-7 1A.5.5 0 0 0 3 1.5V15zM11 2h.5a.5.5 0 0 1 .5.5V15h-1zm-2.5 8c-.276 0-.5-.448-.5-1s.224-1 .5-1 .5.448.5 1-.224 1-.5 1"/>
            </svg>
            
          </button>
            

          </div>

          <div className="welcome-section">
          <div >
            <h1 style={{color: "white"}}>CENTRE HOSPITALIER NATIONAL DE FANN</h1>
            <h2 style={{color: "white"}}>CHIRURGIE THORACIQUE ET CARDIOVASCULAIRE</h2>
         </div>
            <p>{new Intl.DateTimeFormat("fr-FR", {
              dateStyle: "full",
              timeStyle: "short",
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }).format(new Date())}</p>
          </div>
          <div className="header">
          
            <button 
            className="btn3"
            onClick={() => navigate("/patients")}>
             <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-house" viewBox="0 0 16 16">
  <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"/>
</svg>
            </button>
            <button
            
            
            className="btn3"

            onClick={() => navigate("/DropboxForm")}>
              Les archives
            </button>

            <button
            className="btn3"
              type="button"
              onClick={() => setShowAddFields(!showAddFields)}
            >
              {showAddFields ? (<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-journal-minus" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M5.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5"/>
  <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2"/>
  <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z"/>
</svg>) : (<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-journal-plus" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M8 5.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V10a.5.5 0 0 1-1 0V8.5H6a.5.5 0 0 1 0-1h1.5V6a.5.5 0 0 1 .5-.5"/>
  <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2"/>
  <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z"/>
</svg>)}
            </button>

          </div>
      </div>
          

            {/* Wrap the fields you want to hide in a conditional render */}
            {showAddFields && (
              <>
              <form onSubmit={handleSubmit} className="patient-form" id="data-entry">
            <h2>SAISIE DES DONNEES</h2>
            <input
              type="text"
              placeholder="dossierNumber"
              value={formData.dossierNumber}
              onChange={(e) =>
                setFormData({ ...formData, dossierNumber: e.target.value })
              }
            />
            <select
              type="text"
              placeholder="service"
              value={formData.anneeIntervention}
              onChange={(e) =>
                setFormData({ ...formData, service: e.target.value })
              }
            >
              <option value="">Service</option>
              <option value="CUOMO">CUOMO</option>
              <option value="CTCV">CTCV</option>
              <option value="CARDIOLOGIE">CARDIOLOGIE</option>
            </select>
            <select
              value={formData.anneeDossier}
              onChange={(e) =>
                setFormData({ ...formData, anneeDossier: e.target.value })
              }
            >
              <option value="">Annee du dossier</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
              <option value="2019">2019</option>
              <option value="2018">2018</option>
              <option value="2017">2017</option>
              <option value="2016">2016</option>
              <option value="2015">2015</option>
              <option value="2014">2014</option>
              <option value="2013">2013</option>
              <option value="2012">2012</option>
              <option value="2011">2011</option>
              <option value="2010">2010</option>
              <option value="2009">2009</option>
              <option value="2008">2008</option>
              <option value="2007">2007</option>
              <option value="2006">2006</option>
              <option value="2005">2005</option>
              <option value="2004">2004</option>
              <option value="2003">2003</option>
              <option value="2002">2002</option>
              <option value="2001">2001</option>
              <option value="2000">2000</option>
              <option value="1999">1999</option>
              <option value="1998">1998</option>
            </select>
            <input
              type="text"
              placeholder="nom"
              value={formData.nom}
              onChange={(e) =>
                setFormData({ ...formData, nom: e.target.value })
              }
            />
            <label>
              Age:
              <input
                type="date"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
              />
            </label>
            <select
              value={formData.genre}
              onChange={(e) =>
                setFormData({ ...formData, genre: e.target.value })
              }
            >
              <option value="">Sexe</option>
              <option value="Masculin">Masculin</option>
              <option value="Feminin">Feminin</option>
            </select>
            <select
              value={formData.poids}
              onChange={(e) =>
                setFormData({ ...formData, poids: e.target.value })
              }
            >
              <option value="">Poids</option>
              {Array.from({ length: 3001 }, (_, i) => (i / 10).toFixed(1)).map(
                (weight) => (
                  <option key={weight} value={weight}>
                    {weight.replace(".", ",")} kg
                  </option>
                )
              )}
            </select>

            <select
              value={formData.taille}
              onChange={(e) =>
                setFormData({ ...formData, taille: e.target.value })
              }
            >
              <option value="">Taille</option>
              {Array.from({ length: 301 }, (_, i) => i).map((height) => (
                <option key={height} value={height}>
                  {height} cm
                </option>
              ))}
            </select>

            <select
              value={formData.groupeSanguin}
              onChange={(e) =>
                setFormData({ ...formData, groupeSanguin: e.target.value })
              }
            >
              <option value="">Groupe Sanguin</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="N/A">N/A</option>
            </select>
            <select
              value={formData.nationalite}
              onChange={(e) =>
                setFormData({ ...formData, nationalite: e.target.value })
              }
            >
              <option value="">Nationalité</option>

              <optgroup label="Afrique">
                <option value="Algérie">Algérie</option>
                <option value="Angola">Angola</option>
                <option value="Bénin">Bénin</option>
                <option value="Botswana">Botswana</option>
                <option value="Burkina Faso">Burkina Faso</option>
                <option value="Burundi">Burundi</option>
                <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                <option value="Djibouti">Djibouti</option>
                <option value="Égypte">Égypte</option>
                <option value="Érythrée">Érythrée</option>
                <option value="Éthiopie">Éthiopie</option>
                <option value="Gabon">Gabon</option>
                <option value="Gambie">Gambie</option>
                <option value="Ghana">Ghana</option>
                <option value="Guinée">Guinée</option>
                <option value="Guinée-Bissau">Guinée-Bissau</option>
                <option value="Kenya">Kenya</option>
                <option value="Lesotho">Lesotho</option>
                <option value="Libéria">Libéria</option>
                <option value="Libye">Libye</option>
                <option value="Madagascar">Madagascar</option>
                <option value="Malawi">Malawi</option>
                <option value="Mali">Mali</option>
                <option value="Maroc">Maroc</option>
                <option value="Maurice">Maurice</option>
                <option value="Mauritanie">Mauritanie</option>
                <option value="Mozambique">Mozambique</option>
                <option value="Namibie">Namibie</option>
                <option value="Niger">Niger</option>
                <option value="Nigeria">Nigeria</option>
                <option value="République centrafricaine">
                  République centrafricaine
                </option>
                <option value="République démocratique du Congo">
                  République démocratique du Congo
                </option>
                <option value="République du Congo">République du Congo</option>
                <option value="Rwanda">Rwanda</option>
                <option value="Sénégal">Sénégal</option>
                <option value="Soudan">Soudan</option>
                <option value="Soudan du Sud">Soudan du Sud</option>
                <option value="Tanzanie">Tanzanie</option>
                <option value="Tchad">Tchad</option>
                <option value="Togo">Togo</option>
                <option value="Zambie">Zambie</option>
                <option value="Zimbabwe">Zimbabwe</option>
              </optgroup>

              <optgroup label="Amérique">
                <option value="Argentine">Argentine</option>
                <option value="Brésil">Brésil</option>
                <option value="Canada">Canada</option>
                <option value="Chili">Chili</option>
                <option value="Colombie">Colombie</option>
                <option value="États-Unis">États-Unis</option>
                <option value="Mexique">Mexique</option>
                <option value="Venezuela">Venezuela</option>
                {/* Ajoutez d'autres pays si nécessaire */}
              </optgroup>

              <optgroup label="Asie">
                <option value="Chine">Chine</option>
                <option value="Inde">Inde</option>
                <option value="Japon">Japon</option>
                <option value="Corée du Sud">Corée du Sud</option>
                <option value="Indonésie">Indonésie</option>
                {/* Ajoutez d'autres pays si nécessaire */}
              </optgroup>

              <optgroup label="Europe">
                <option value="Allemagne">Allemagne</option>
                <option value="France">France</option>
                <option value="Italie">Italie</option>
                <option value="Royaume-Uni">Royaume-Uni</option>
                <option value="Espagne">Espagne</option>
                {/* Ajoutez d'autres pays si nécessaire */}
              </optgroup>

              <optgroup label="Océanie">
                <option value="Australie">Australie</option>
                <option value="Nouvelle-Zélande">Nouvelle-Zélande</option>
                {/* Ajoutez d'autres pays si nécessaire */}
              </optgroup>

              <optgroup label="Antarctique">
                <option value="Scientifique">Scientifique</option>
                {/* Note : L'Antarctique n'a pas de nationalité formelle, mais vous pouvez inclure des options comme celles-ci */}
              </optgroup>
            </select>

            <input
              type="text"
              placeholder="profession"
              value={formData.profession}
              onChange={(e) =>
                setFormData({ ...formData, profession: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="numeroDeTelephone"
              value={formData.numeroDeTelephone}
              onChange={(e) =>
                setFormData({ ...formData, numeroDeTelephone: e.target.value })
              }
            />
            <input
              type="email"
              placeholder="addressEmail"
              value={formData.addressEmail}
              onChange={(e) =>
                setFormData({ ...formData, addressEmail: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="addressDomicile"
              value={formData.addressDomicile}
              onChange={(e) =>
                setFormData({ ...formData, addressDomicile: e.target.value })
              }
            />
            <select
              value={formData.salle}
              onChange={(e) =>
                setFormData({ ...formData, salle: e.target.value })
              }
            >
              <option value="">Salle</option>
              <option value="Salle 1">Salle 1</option>
              <option value="Salle 2">Salle 2</option>
              <option value="Salle 3">Salle 3</option>
              <option value="Salle 4">Salle 4</option>
              <option value="Salle 5">Salle 5</option>
              <option value="Salle 6">Salle 6</option>
              <option value="Salle 7">Salle 7</option>
              <option value="Salle 8">Salle 8</option>
              <option value="Salle 9">Salle 9</option>
              <option value="Salle 10">Salle 10</option>
              <option value="Salle 11">Salle 11 </option>
            </select>
            <select
              value={formData.lit}
              onChange={(e) =>
                setFormData({ ...formData, lit: e.target.value })
              }
            >
              <option value="">Lit</option>
              <option value="Lit 1">Lit 1</option>
              <option value="Lit 2">Lit 2</option>
              <option value="Lit 3">Lit 3</option>
              <option value="Lit 4">Lit 4</option>
              <option value="Lit 5">Lit 5</option>
              <option value="Lit 6">Lit 6</option>
              <option value="Lit 7">Lit 7</option>
              <option value="Lit 8">Lit 8</option>
              <option value="Lit 9">Lit 9</option>
              <option value="Lit 10">Lit 10</option>
              <option value="Lit 11">Lit 11</option>
            </select>
            <input
              type="text"
              placeholder="Numero du tuteur ou responsable"
              value={formData.correspondant}
              onChange={(e) =>
                setFormData({ ...formData, correspondant: e.target.value })
              }
            />
            <label>
              Date d'entree :
              <input
                type="date"
                placeholder="Date d'entree"
                value={formData.dateEntree}
                onChange={(e) =>
                  setFormData({ ...formData, dateEntree: e.target.value })
                }
              />
            </label>
            <label>
              Date de sortie :
              <input
                type="date"
                placeholder="Date de sortie"
                value={formData.dateSortie}
                onChange={(e) =>
                  setFormData({ ...formData, dateSortie: e.target.value })
                }
              />
            </label>
            <select
              value={formData.diagnostic}
              onChange={(e) =>
                setFormData({ ...formData, diagnostic: e.target.value })
              }
            >
              <option value="">Diagnostic</option>
              <option value="CPA">CPA</option>
              <option value="T4F">T4F</option>
            </select>

            <select
              value={formData.statut}
              onChange={(e) =>
                setFormData({ ...formData, statut: e.target.value })
              }
            >
              <option value="">Statut</option>
              <option value="Non Operer">Non Operer</option>
              <option value="En Operation">En Operation</option>
              <option value="Operer">Operer</option>
              <option value="Operer-transferer">Operer-transferer</option>
              <option value="Operer-deceder">Operer-deceder</option>
              <option value="Operer-Exeat">Operer-Exeat</option>
            </select>
            {formData.statut === "Operer-Exeat" && (
              <label>
                Date de sortie :
                <input
                  type="date"
                  placeholder="Date de sortie"
                  onChange={(e) =>
                    setFormData({ ...formData, dateDesortie: e.target.value })
                  }
                />
              </label>
            )}

            {formData.statut === "Operer-deceder" && (
              <label>
                Date de deces :
                <input
                  type="date"
                  onChange={(e) =>
                    setFormData({ ...formData, dateDeces: e.target.value })
                  }
                />
              </label>
            )}
            {formData.statut === "Operer-transferer" && (
              <select
                value={formData.departementTransfert}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    departementTransfert: e.target.value,
                  })
                }
              >
                <option value="">Département de departementTransfert</option>
                <option value="Réanimation">Réanimation</option>
                <option value="Cardiologie">Cardiologie</option>
                <option value="Soins intensifs">Soins intensifs</option>
                <option value="Pédiatrie">Pédiatrie</option>
                <option value="Neurologie">Neurologie</option>
              </select>
            )}


            {/* Additional Input Fields */}
            <select
              value={formData.pathologie}
              onChange={(e) => setFormData({ ...formData, pathologie: e.target.value })}>
              <option value="">Pathologie</option>
              <option value="la bicuspidie aortique">Bicuspidie Aortique </option>
              <option value="la communication interventriculaire">CIV</option>
              <option value="la communication interauriculaire">CIA</option>
              <option value="la sténose pulmonaire">Sténose Pulmonaire</option>
              <option value="la persistance du canal artériel">PCA</option>
              <option value="la coarctation aortique">Coarctation Aortique</option>
              <option value="la tétralogie de Fallot">T4F</option>
              <option value="la transposition des gros vaisseaux">TGV</option>


            </select>
            <select

              value={formData.anneeIntervention}
              onChange={(e) => setFormData({ ...formData, anneeIntervention: e.target.value })}
            >
              <option value="">Annee d'intervention</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
              <option value="2019">2019</option>
              <option value="2018">2018</option>
              <option value="2017">2017</option>
              <option value="2016">2016</option>
              <option value="2015">2015</option>
              <option value="2014">2014</option>
              <option value="2013">2013</option>
              <option value="2012">2011</option>
              <option value="2011">2023</option>
              <option value="2010">2010</option>
              <option value="2009">2009</option>
              <option value="2008">2008</option>
              <option value="2007">2007</option>
              <option value="2006">2006</option>
              <option value="2005">2005</option>
            </select>
            {/* Add this button after the statut select field */}
            <button
              type="button"
              onClick={() => setShowAdditionalFields(!showAdditionalFields)}
              style={{ margin: '10px 0' }}
            >
              {showAdditionalFields ? 'Masquer les champs supplémentaires' : 'Afficher les champs supplémentaires'}
            </button>

            {/* Wrap the fields you want to hide in a conditional render */}
            {showAdditionalFields && (
              <>
                <textarea
                  type="text"
                  placeholder="Raison de Consultation"
                  value={formData.consultationReason}
                  onChange={(e) => setFormData({ ...formData, consultationReason: e.target.value })}
                ></textarea>
                <textarea
                  type="text"
                  placeholder="Traitement à l'Entrée"
                  value={formData.traitementEntree}
                  onChange={(e) => setFormData({ ...formData, traitementEntree: e.target.value })}
                ></textarea>
                <textarea
                  type="text"
                  placeholder="Traitement à la Sortie"
                  value={formData.traitementSortie}
                  onChange={(e) => setFormData({ ...formData, traitementSortie: e.target.value })}
                ></textarea>
                <textarea
                  type="text"
                  placeholder="Suites Simples"
                  value={formData.simpleSuites}
                  onChange={(e) => setFormData({ ...formData, simpleSuites: e.target.value })}
                ></textarea>
                <textarea
                  type="text"
                  placeholder="Complications"
                  value={formData.complications}
                  onChange={(e) => setFormData({ ...formData, complications: e.target.value })}
                > </textarea>
                <textarea
                  type="text"
                  placeholder="Geste"
                  value={formData.geste}
                  onChange={(e) => setFormData({ ...formData, geste: e.target.value })}
                >

                </textarea>
                <select
                  value={formData.operateur}
                  onChange={(e) => setFormData({ ...formData, operateur: e.target.value })}>
                  <option value="">operateur</option>
                  <option value="operateur 1">operateur 1</option>
                  <option value="operateur 2">operateur 2</option>
                  <option value="operateur 3"> operateur 3</option>
                  <option value=" operateur 4"> operateur 4</option>

                </select>
                < textarea
                  type="text"
                  placeholder="Histoire"
                  value={formData.histoire}
                  onChange={(e) => setFormData({ ...formData, histoire: e.target.value })}
                >

                </textarea>
                <textarea
                  type="text"
                  placeholder="Antécédents"
                  value={formData.antecedents}
                  onChange={(e) => setFormData({ ...formData, antecedents: e.target.value })}
                >
                </textarea>
                <textarea
                  type="text"
                  placeholder="Traitement"
                  value={formData.traitement}
                  onChange={(e) => setFormData({ ...formData, traitement: e.target.value })}
                >
                </textarea>
                <textarea
                  type="text"
                  placeholder="ECRT"
                  value={formData.ecrt}
                  onChange={(e) => setFormData({ ...formData, ecrt: e.target.value })}
                >
                </textarea>
                <textarea
                  type="text"
                  placeholder="ECG"
                  value={formData.ecg}
                  onChange={(e) => setFormData({ ...formData, ecg: e.target.value })}
                >

                </textarea>
                <textarea
                  type="text"
                  placeholder="ETT"
                  value={formData.ett}
                  onChange={(e) => setFormData({ ...formData, ett: e.target.value })}
                >
                </textarea>
                <textarea
                  type="text"
                  placeholder="TT"
                  value={formData.tt}
                  onChange={(e) => setFormData({ ...formData, tt: e.target.value })}
                >

                </textarea>
                <textarea
                  type="text"
                  placeholder="Coronarographie"
                  value={formData.coronarographie}
                  onChange={(e) => setFormData({ ...formData, coronarographie: e.target.value })}
                >
                </textarea>
                <textarea
                  type="text"
                  placeholder="Autres Examens"
                  value={formData.autresExamens}
                  onChange={(e) => setFormData({ ...formData, autresExamens: e.target.value })}
                >
                </textarea>
                <textarea
                  type="text"
                  placeholder="Biologie"
                  value={formData.biologie}
                  onChange={(e) => setFormData({ ...formData, biologie: e.target.value })}
                >
                </textarea>
                <textarea
                  type="text"
                  placeholder="CRO"
                  value={formData.cro}
                  onChange={(e) => setFormData({ ...formData, cro: e.target.value })}
                >
                </textarea>
                <textarea
                  type="text"
                  placeholder="Rx Thorax Post"
                  value={formData.rxthoraxPost}
                  onChange={(e) => setFormData({ ...formData, rxthoraxPost: e.target.value })}
                >
                </textarea>
                <textarea
                  type="text"
                  placeholder="ECG Post"
                  value={formData.ecgPost}
                  onChange={(e) => setFormData({ ...formData, ecgPost: e.target.value })}
                >
                </textarea>
                <textarea
                  type="text"
                  placeholder="Echoscopie Post"
                  value={formData.echoscopiePost}
                  onChange={(e) => setFormData({ ...formData, echoscopiePost: e.target.value })}
                >

                </textarea>
                <textarea
                  type="text"
                  placeholder="Biologie Post"
                  value={formData.biologiePost}
                  onChange={(e) => setFormData({ ...formData, biologiePost: e.target.value })}
                ></textarea>
                <textarea
                  type="text"
                  placeholder="Gazo"
                  value={formData.gazo}
                  onChange={(e) => setFormData({ ...formData, gazo: e.target.value })}
                ></textarea>
                <textarea
                  type="text"
                  placeholder="ECP"
                  value={formData.ecp}
                  onChange={(e) => setFormData({ ...formData, ecp: e.target.value })}
                ></textarea>
                <textarea
                  type="text"
                  placeholder="DSR"
                  value={formData.dsr}
                  onChange={(e) => setFormData({ ...formData, dsr: e.target.value })}
                ></textarea>
                <label>
                  Date du jour :
                  <input
                    type="date"
                    placeholder="Date Jour"
                    value={formData.dateJour}
                    onChange={(e) => setFormData({ ...formData, dateJour: e.target.value })}
                  />
                </label>
              </>
            )}


            <button type="submit">{editing ? "Mettre à jour" : "Ajouter"}</button>
          </form>
              </>)}
          

          <div className="patient-list-header" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Rechercher par nom"
                  className="search-input"
                  style={{ borderRadius: '50px' ,padding: '10px'}}
                />
                <select onChange={(e) => setStatusFilter(e.target.value)} style={{ borderRadius: '5px',padding: '10px'}}>
                  <option value="">Tous les Statuts</option>
                  <option value="Nom Operer">Non Operer</option>
                  <option value="En Operation">En Operation</option>
                  <option value="Operer">Operer</option>
              <option value="Operer-transferer">Operer-transferer</option>
              <option value="Operer-deceder">Operer-deceder</option>
              <option value="Operer-Exeat">Operer-Exeat</option>
                </select>
          </div>

          <ul className="patient-list">
            <h2>Liste des Patients</h2>
            {filteredPatients.map((patient) => (
              <li key={patient._id} className="patient-item">
               <span
              onClick={() => handleToggleDetails(patient._id)}
              style={{
                cursor: "pointer",
                color: "white",
                backgroundColor:
                  patient.statut === "Operer"
                    ? "green"
                    : patient.statut === "Operer-transferer"
                    ? "yellowgreen"
                    : patient.statut === "Operer-deceder"
                    ? "dark"
                    : patient.statut === "Operer-Exeat"
                    ? "blue"
                    : patient.statut === "En Operation"
                    ? "orange"
                    : patient.statut === "Non Operer"
                    ? "red"
                    : "orange",
                textDecoration: "none",
                padding: "5px",
                borderRadius: "5px",
              }}
              id="data-exit"
               >
              {patient.nom} - {patient.statut}
              {patient.statut === "Operer-transferer" &&
                patient.departementTransfert && (
                  <span> → {patient.departementTransfert}</span>
                )}

              {patient.statut === "Operer-deceder" && patient.dateDeces && (
                <span> → {patient.dateDeces}</span>
              )}

              {patient.statut === "Operer-Exeat" && patient.dateDesortie && (
                <span> → {patient.dateDesortie}</span>
              )}
            </span>
                <button onClick={() => handleEdit(patient)}>Modifier</button>
                <button onClick={() => handleDelete(patient._id)}>Supprimer</button>
                <button onClick={() => exportPatientDetails(patient)}>Partager PDF</button>
              

                
              </li>
            ))}
          </ul>

          {/* Afficher les détails du patient sélectionné en bas */}
          {expandedPatientId && (
            <div className="expanded-patient-details">
              {renderPatientDetails(patients.find(patient => patient._id === expandedPatientId))}
            </div>
          )}

          <ToastContainer />


        
    </div>
  );
};

export default Doctors;
