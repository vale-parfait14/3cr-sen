import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePatientDoctorContext } from "./PatientDoctorContext";
import { jsPDF } from "jspdf"; // For PDF generation/
import { RiArchiveStackLine } from "react-icons/ri";
import { BiArchiveOut } from "react-icons/bi";
import { TbUserDollar } from "react-icons/tb";
import { TbHistoryToggle } from "react-icons/tb";
import { CgUserList } from "react-icons/cg";
import { MdOutlineContentPasteSearch } from "react-icons/md";
import { FaBookReader } from "react-icons/fa";
import PatientSolvable from "./PatientSolvable";
import Fichier from "./Fichier";
import Archive from "./Archive";
import Message from "./Message";
import { MdMessage } from "react-icons/md";
import Solvabilite from "./Solvabilite";
import Modal from "react-modal"; // Assurez-vous d'installer cette bibliothèque
import PatientShare from "./PatientShare";
import Affiche from "./Affiche";
import DropboxForm from "./Archive";
import "./PatientStyle.css";
import { MdOutlineEditCalendar } from "react-icons/md";
import DropboxChooser from 'react-dropbox-chooser';
import { saveAs } from 'file-saver';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs  } from 'firebase/firestore';
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


const Patients = ({ token, userId, refresh }) => {
  const { patients, updatePatients } = usePatientDoctorContext();
// Add these new state variables at the top with other useState declarations


const [formData, setFormData] = useState({
  pathologie: "",
  vpa: "",
  validation:"Validé",
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
  manageur: "",
  services: "",
  departementTransfert: "", // Add this new field
  dateDeces: "",
  dateDesortie: "",
  consultationReason: "",
  traitementEntree: "",
  traitementSortie: "",
  simpleSuites: "",
  complications: "",
  geste: "",
  operateur: [],
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
  observation: "",
  imagerie: "",
  biologiePostOp: "",
  suite:"",
  suivi:"",
  dateJour: "",
  manageur: localStorage.getItem("userName") || " ",
  services:localStorage.getItem("userService") || " ",
});

  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedPatientId, setExpandedPatientId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [showAddFields, setShowAddFields] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPaiement, setShowPaiement] = useState(false);
  const [showfichier, setShowfichier] = useState(false);
  const [showFirst,setShowFirst] = useState(false);
  const [showSec,setShowSec] = useState(false);  
  const [showTh,setShowTh] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [validationFilter, setValidationFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const userName = localStorage.getItem("userName");
  const [selectedService, setSelectedService] = useState("");
  const [transferredPatients, setTransferredPatients] = useState([]);
  const [fileGroups, setFileGroups] = useState({});
  const [prev, setPrev] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [showMessage,setShowMessage] = useState(false);

  
  {
    /*const Alert = ({ message }) => (
  <div style={{ position: 'relative', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: 'red', color: 'white', padding: '10px',margin:"50px" }}>
    {message}
  </div>
); */
  }
  const [alerts, setAlerts] = useState([]);
  const [patient, setPatients] = useState([]); // Liste des patients
  const [filesOb, setFilesOb] = useState([]);

  // Add these state variables
  const [userService, setUserService] = useState(
    localStorage.getItem("userService")
  );

  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));
  const [userAccessLevel, setUserAccessLevel] = useState(
    localStorage.getItem("userAccessLevel")
  );
  // Add this new state variable in your component
  const [userServices, setUserServices] = useState([]);
  const [showUserServices, setShowUserServices] = useState(false);
  // État pour le service choisi
  ///dfghjk

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "filesOb"), (snapshot) => {
      const filesObData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setFilesOb(filesObData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  const handleDropboxSuccess = async (section, selectedFilesOb) => {
    const newFilesOb = selectedFilesOb.map(file => ({
      name: file.name,
      link: file.link,
      title: '',
      comment: '',
      timestamp: new Date().toISOString(),
      section: section // Using section instead of buttonId
    }));
  
    // Add new files to Firestore
    for (const file of newFilesOb) {
      await addDoc(collection(db, "filesOb"), file);
    }
  
    // Fetch updated files for this specific section
    const q = query(collection(db, "filesOb"), where("section", "==", section));
    const querySnapshot = await getDocs(q);
    const files = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  
    setFilesOb(files);
  };
  
  
  const handleTitleChange = async (id, newTitle) => {
    const fileRef = doc(db, "filesOb", id);
    await updateDoc(fileRef, { title: newTitle });
  };

  const handleCommentChange = async (id, newComment) => {
    const fileRef = doc(db, "filesOb", id);
    await updateDoc(fileRef, { comment: newComment });
  };

  const handleBoxDelete = async (id, section) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      const fileRef = doc(db, "filesOb", id);
      await deleteDoc(fileRef);
      
      // Refresh files for this specific section
      const q = query(collection(db, "filesOb"), where("section", "==", section));
      const querySnapshot = await getDocs(q);
      const remainingFiles = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setFilesOb(remainingFiles);
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

  const handleFileSuccess = async (field, files) => {
    const newFiles = files.map(file => ({
      url: file.link,
      name: file.name,
      timestamp: new Date().toISOString()
    }));
  
    // Save to Firebase
    for (const file of newFiles) {
      await addDoc(collection(db, "patientFiles"), {
        ...file,
        field,
        patientId: editing || 'new'
      });
    }
  
    // Update local state
    setFormData(prev => ({
      ...prev,
      [`${field}Files`]: [...(prev[`${field}Files`] || []), ...newFiles]
    }));
  };
  
  
  const handleTransferPatient = async (patientId, newService) => {
    try {
      const response = await fetch(
        `https://threecr-sen.onrender.com/api/patients/${patientId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            services: newService,
            statut: "Opéré-transféré",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors du transfert du patient");
      }

      // Update local state
      setTransferredPatients((prev) => [...prev, patientId]);

      // Update patients list
      updatePatients(
        patients.map((patient) =>
          patient._id === patientId
            ? { ...patient, services: newService, statut: "Opéré-transféré" }
            : patient
        )
      );
      setAlerts((prevAlerts) => [
        ...prevAlerts,
        `Patient transféré vers ${newService}`,
      ]);
      toast.success(`Patient transféré vers ${newService}`);
    } catch (error) {
      console.error("Erreur:", error.message);
      toast.error(error.message);
    }
  };

  ///dfghj
  // Fonction pour afficher les services
  const handleShowService = (patient) => {
    const serviceToShow = userServices.find(
      (service) => service === selectedService
    );

    if (serviceToShow) {
      // Ajoutez la logique pour afficher les détails du patient
      console.log(
        `Affichage des détails pour le patient ${patient.nom} par ${serviceToShow}`
      );
      // Vous pouvez appeler une fonction pour afficher les détails ou les informations que vous souhaitez afficher
    } else {
      toast.error(
        "Le service sélectionné n'a pas accès aux détails de ce patient."
      );
    }
  };
  const navigate = useNavigate();
  const [showCuomoModal, setShowCuomoModal] = useState(false);
  const [selectedPatientForCuomo, setSelectedPatientForCuomo] = useState(null);
  const [hiddenPatients, setHiddenPatients] = useState([]);

  // Fonction pour gérer l'aide du service userService
  const handleCuomoHelp = (patient) => {
    setSelectedPatientForCuomo(patient);
    setShowCuomoModal(true);
  };

  // Fonction pour masquer un patient
  const handleHidePatient = (patient) => {
    setHiddenPatients((prev) => [...prev, patient._id]);
  };

  const fetchPatients = useCallback(async () => {
    try {
      const response = await fetch("https://threecr-sen.onrender.com/api/patients", {
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
    fetchPatients();
  }, [fetchPatients, refresh]);
  
  const handleDeleteFile = async (field, fileIndex) => {
    if (editing) {
      try {
        const response = await fetch(`https://threecr-sen.onrender.com/api/patients/${editing}/files`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token
          },
          body: JSON.stringify({
            field: `${field}Files`,
            fileIndex
          })
        });
  
        if (!response.ok) throw new Error('Erreur lors de la suppression du fichier');
  
        setFormData(prev => ({
          ...prev,
          [`${field}Files`]: prev[`${field}Files`].filter((_, i) => i !== fileIndex)
        }));
  
        toast.success('Fichier supprimé avec succès');
      } catch (error) {
        toast.error(error.message);
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
   
    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `https://threecr-sen.onrender.com/api/patients/${editing}`
      : "https://threecr-sen.onrender.com/api/patients";

    const currentDate = new Date().toLocaleString(); // Date actuelle

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({
          ...formData,
          userId,
          manageur: localStorage.getItem("userName"),
          services: localStorage.getItem("userService"),

        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement du patient");
      }

      const newPatient = { ...formData, userId };

      let alertMessage = "";
      if (editing) {
        // Si modification
        const oldPatient = patients.find((p) => p._id === editing);
        const changes = [];

        Object.keys(formData).forEach((key) => {
          if (oldPatient[key] !== formData[key]) {
            changes.push(`${key}: ${oldPatient[key]} → ${formData[key]}`);
          }
        });

        alertMessage = `Patient ${formData.nom
          } modifié par ${userName} le ${currentDate}.\nModifications: ${changes.join(
            ", "
          )}`;
      } else {
        // Si ajout d'un nouveau patient
        alertMessage = `Nouveau patient ${formData.nom} ajouté par ${userName} le ${currentDate}`;
      }

      // Envoyer l'alerte à MongoDB
      await fetch("https://threecr-sen.onrender.com/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: alertMessage,
          user: userName, // Utilisateur ayant effectué l'action
        }),
      });

      // Affichage de l'alerte dans l'UI
      setAlerts((prevAlerts) => [...prevAlerts, alertMessage]);
      toast.success(alertMessage);

     
      // Réinitialisation du formulaire
      setFormData({
        pathologie: "",
        vpa: "",
        validation:"Validé",
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
        manageur: "",
        services: "",
        departementTransfert: "", // Add this new field
        dateDeces: "",
        dateDesortie: "",
        consultationReason: "",
        traitementEntree: "",
        traitementSortie: "",
        simpleSuites: "",
        complications: "",
        geste: "",
        operateur: [],
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
        observation: "",
        imagerie: "",
        biologiePostOp: "",
        dateJour: "",
        manageur: localStorage.getItem("userName") || " ",
        services: localStorage.getItem("userService") || " ",

      });

      setEditing(null);
    } catch (error) {
      console.error("Erreur:", error.message);
      setAlerts((prevAlerts) => [...prevAlerts, error.message]);
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce patient ?"))
      return;

    const currentDate = new Date().toLocaleString(); // Date actuelle

    try {
      const response = await fetch(`https://threecr-sen.onrender.com/api/patients/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du patient");
      }

      const patientToDelete = patients.find((p) => p._id === id);
      if (patientToDelete) {
        const alertMessage = `Patient ${patientToDelete.nom} supprimé par ${userName} le ${currentDate}`;

        // Envoyer l'alerte à MongoDB
        await fetch("https://threecr-sen.onrender.com/api/alerts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: alertMessage,
            user: userName, // Utilisateur ayant effectué l'action
          }),
        });

        setAlerts((prevAlerts) => [...prevAlerts, alertMessage]);
        toast.success(alertMessage);
      }

      // Mettre à jour la liste des patients après suppression
      setPatients((prevPatients) =>
        prevPatients.filter((patient) => patient._id !== id)
      );
    } catch (error) {
      console.error("Erreur:", error.message);
      setAlerts((prevAlerts) => [...prevAlerts, error.message]);
    }
  };

  const handleEdit = (patient) => {
    setFormData({ ...patient });
    setEditing(patient._id);
    setShowAdditionalFields(true);
  };

 

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // In the filteredPatients definition, add a condition to filter by userService
  const filteredPatients = patients.filter((patient) => {
    const searchTermLower = searchTerm.toLowerCase();
    
    // Recherche dans tous les champs du patient
    return (
      patient.nom?.toLowerCase().includes(searchTermLower) ||
      patient.dossierNumber?.toLowerCase().includes(searchTermLower) ||
      patient.service?.toLowerCase().includes(searchTermLower) ||
      patient.age?.toString().toLowerCase().includes(searchTermLower) ||
      patient.genre?.toLowerCase().includes(searchTermLower) ||
      patient.poids?.toString().toLowerCase().includes(searchTermLower) ||
      patient.taille?.toString().toLowerCase().includes(searchTermLower) ||
      patient.groupeSanguin?.toLowerCase().includes(searchTermLower) ||
      patient.nationalite?.toLowerCase().includes(searchTermLower) ||
      patient.profession?.toLowerCase().includes(searchTermLower) ||
      patient.numeroDeTelephone?.toLowerCase().includes(searchTermLower) ||
      patient.addressEmail?.toLowerCase().includes(searchTermLower) ||
      patient.addressDomicile?.toLowerCase().includes(searchTermLower) ||
      patient.diagnostic?.toLowerCase().includes(searchTermLower) ||
      patient.statut?.toLowerCase().includes(searchTermLower) ||
      patient.pathologie?.toLowerCase().includes(searchTermLower) ||
      patient.vpa?.toLowerCase().includes(searchTermLower) ||
      patient.validation?.toLowerCase().includes(searchTermLower) ||
      patient.consultationReason?.toLowerCase().includes(searchTermLower) ||
      patient.geste?.toLowerCase().includes(searchTermLower) ||
      patient.operateur?.toString().toLowerCase().includes(searchTermLower)
    ) && 
    (statusFilter === "" || patient.statut === statusFilter) &&
    (validationFilter === "" || patient.validation === validationFilter) &&
    (serviceFilter === "" || patient.services === serviceFilter) &&
    !transferredPatients.includes(patient._id) &&
    (localStorage.getItem("userName") === "Ad" ||
      patient.services === localStorage.getItem("userService"))
  });
  
  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['.pdf', '.jpg', '.png', '.doc', '.docx', '.pptx', '.mp3', '.mp4','.gif'];
    
    if (file.bytes > maxSize) {
      toast.error("Le fichier est trop volumineux (max 10MB)");
      return false;
    }
    
    if (!allowedTypes.some(type => file.name.toLowerCase().endsWith(type))) {
      toast.error("Type de fichier non supporté");
      return false;
    }
    
    return true;
  };
  
  // Use in Dropbox choose:
  
  
 
  
  
  
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const currentDate = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }).format(new Date());

  useEffect(() => {
    // Intercepter la tentative de retour arrière
    const handlePopState = (e) => {
      // Empêcher la navigation en arrière
      window.history.pushState(null, "", window.location.href);
    };

    // Ajouter un événement 'popstate' pour empêcher l'utilisateur de revenir en arrière
    window.history.pushState(null, "", window.location.href); // Empêche de revenir en arrière
    window.addEventListener("popstate", handlePopState);

    // Nettoyer l'écouteur d'événements lors du démontage du composant
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []); // L'effet se déclenche une seule fois, lors du montage du composant

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 1 second

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <img
            src="https://i.pinimg.com/originals/82/ff/4f/82ff4f493afb72f8e0acb401c1b7498f.gif"
            alt="Loading"
            className="mb-3"
            style={{ width: "200px", borderRadius: "200px" }}
          />
          <div className="loading-text text-muted">Chargement en cours...</div>
        </div>
      </div>
    );
  }

  const renderPatientDetails = (patient) => {
    if (!patient) return null;
  
    const formattedPatient = {
      ...patient,
      dateNaissance: formatDate(patient.dateNaissance),
      dateEntree: formatDate(patient.dateEntree),
      dateSortie: formatDate(patient.dateSortie),
      dateDeces: formatDate(patient.dateDeces),
      dateDesortie: formatDate(patient.dateDesortie),
      dateJour: formatDate(patient.dateJour),
    };
  
    return (
      <div className="patient-details">
        <h3>Détails du Patient :</h3>
        <table className="patient-details-table">
          <thead>
            <tr>
              <th className="th1">Champ</th>
              <th className="th2">Valeur</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(formattedPatient).map(([key, value]) => (
              <tr key={key}>
                <td>
                  <strong>{key}:</strong>
                </td>
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
        <div className="header"></div>

        <div className="welcome-section container">
          <div>
            <div className="d-flex justify-content-between align-items-center">
              <div className="flex-wrap d-flex align-items-center">
                <div>
                  <h6 className="fs-5" style={{ color: "white" }}>
                    CENTRE HOSPITALIER NATIONAL DE FANN
                  </h6>
                  <h5 className="fs-5" style={{ color: "white" }}>
                    CHIRURGIE THORACIQUE ET CARDIOVASCULAIRE
                  </h5>
                  <h6 className="d-block d-md-none flex-column" style={{ color: "white", textDecoration: "underline" }}>
                    <small className="">Connecté en tant que: <strong className="bg-secondary rounded-2 ">{userName}</strong> du service: <strong className="bg-secondary rounded-2">{userService}</strong></small>
                    <br />
                    <small>{currentDate}</small>
                  </h6>

                </div>

                <div
                  className="container-fluid"
                  style={{
                    display: "flex",

                    marginBottom: "20px",
                    borderRadius: "5px",
                  }}
                >
                  <button
                    className="btn2"
                    type="button"
                    onClick={() =>
                      setShowAdditionalFields(!showAdditionalFields)
                    }
                    style={{
                      display:
                        localStorage.getItem("userName") === "Ad" ||
                        (userRole === "Médecin" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                        (userRole === "Secrétaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                        (userRole === "Infirmier(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                        (userRole === "Archiviste" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                        (userRole === "Gestionnaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                        (userRole === "Etudiant(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||

                        (userRole === "Archiviste" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                        (userRole === "Gestionnaire" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||


                        (userRole === "Archiviste" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                        (userRole === "Gestionnaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||

                        (userRole === "Archiviste" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||

                        (userRole === "Gestionnaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) 
                         
                          ? "none"
                          : "block",
                          
                    }}
                  >
                    {showAdditionalFields ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="30"
                          height="30"
                          alt="Masquer les champs de saisies"
                          fill="currentColor"
                          class="bi bi-journal-minus"
                          viewBox="0 0 16 16"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M5.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5"
                          />
                          <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2" />
                          <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="30"
                          height="30"
                          alt="Afficher les champs de saisies"
                          fill="currentColor"
                          class="bi bi-journal-plus"
                          viewBox="0 0 16 16"
                        >
                          {" "}
                          <img
                            width="30"
                            height="30"
                            src="https://img.icons8.com/ios/50/medical-doctor.png"
                            alt="medical-doctor"
                          />
                          <path
                            fill-rule="evenodd"
                            d="M8 5.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V10a.5.5 0 0 1-1 0V8.5H6a.5.5 0 0 1 0-1h1.5V6a.5.5 0 0 1 .5-.5"
                          />
                          <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2" />
                          <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z" />
                        </svg>
                      </>
                    )}
                  </button>

                  <button
                    title="Ajouter Des Archives"
                    className="btn3"
                    onClick={() => setShowArchive(!showArchive)}
                  >
                    <BiArchiveOut style={{ height: "30px", width: "30px" }} />
                  </button>

                  <button
                    title="Creation des utilisateurs"
                    className="btn3"
                    onClick={() => navigate("/user-management")}
                    style={{
                      display:
                        localStorage.getItem("userName") === "Ad" ||
                        (userRole === "Admin" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                        
                        (userRole === "Admin" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                        
                          (userRole === "Admin" && userAccessLevel === "Affichage-Modification-Suppression"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||

                        
                        (userRole === "Admin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) 
                         
                          ? "block"
                          : "none",
                          
                    }}
                  >
                    <CgUserList style={{ height: "30px", width: "30px" }} />
                  </button>

                  <button
                    className="btn3"
                    onClick={() => setShowPaiement(!showPaiement)}
                    title="Patients Solvable"
                    style={{
                      display:
                        localStorage.getItem("userName") === "Ad" ||
                          (userRole === "Médecin" &&
                            userAccessLevel === "Affichage" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          (userRole === "Infirmier(e)" &&
                            userAccessLevel === "Affichage" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          (userRole === "Archiviste" &&
                            userAccessLevel === "Affichage" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          (userRole === "Gestionnaire" &&
                            userAccessLevel === "Affichage" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          (userRole === "Etudiant(e)" &&
                            userAccessLevel === "Affichage" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          (userRole === "Médecin" &&
                            userAccessLevel === "Affichage-Modification" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          (userRole === "Infirmier(e)" &&
                            userAccessLevel === "Affichage-Modification" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          (userRole === "Archiviste" &&
                            userAccessLevel === "Affichage-Modification" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          (userRole === "Etudiant(e)" &&
                            userAccessLevel === "Affichage-Modification" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          (userRole === "Médecin" &&
                            userAccessLevel ===
                            "Affichage-Modification-Suppression" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          (userRole === "Infirmier(e)" &&
                            userAccessLevel ===
                            "Affichage-Modification-Suppression" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          (userRole === "Archiviste" &&
                            userAccessLevel ===
                            "Affichage-Modification-Suppression" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService))  ||
                          (userRole === "Etudiant(e)" &&
                            userAccessLevel ===
                            "Affichage-Modification-Suppression" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                      (userRole === "Archiviste" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                      (userRole === "Etudiant(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) 
                       
                          ? "none"
                          : "block",
                    }}
                  >
                    <TbUserDollar style={{ height: "30px", width: "30px" }} />
                  </button>

                  <button
                    className="btn3"
                    onClick={() => setShowfichier(!showfichier)}
                    title="Patients files"
                    style={{
                      display:
                        localStorage.getItem("userName") === "Ad" ||
                          (userRole === "Médecin" &&
                            userAccessLevel === "Affichage" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          (userRole === "Infirmier(e)" &&
                            userAccessLevel === "Affichage" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          (userRole === "Archiviste" &&
                            userAccessLevel === "Affichage" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          (userRole === "Gestionnaire" &&
                            userAccessLevel === "Affichage" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          (userRole === "Etudiant(e)" &&
                            userAccessLevel === "Affichage" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          (userRole === "Archiviste" &&
                            userAccessLevel === "Affichage-Modification" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          (userRole === "Etudiant(e)" &&
                            userAccessLevel === "Affichage-Modification" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService))  ||
                          (userRole === "Archiviste" &&
                            userAccessLevel ===
                            "Affichage-Modification-Suppression" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService))  ||
                          (userRole === "Etudiant(e)" &&
                            userAccessLevel ===
                            "Affichage-Modification-Suppression" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                      (userRole === "Archiviste" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                      (userRole === "Etudiant(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) 
                       
                          ? "none"
                          : "block",
                    }}
                  >
                    <FaBookReader  style={{ height: "30px", width: "30px" }} />
                  </button>
                  <button
                    className="btn3"
                    onClick={() =>  setShowMessage(!showMessage)}
                    title="Message"
                    style={{
                      display:
                        localStorage.getItem("userName") === "Ad" ||
                          (userRole === "Médecin" &&
                            userAccessLevel === "Affichage" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                         (userRole === "Secrétaire" &&
                            userAccessLevel ===
                            "Affichage" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          (userRole === "Infirmier(e)" &&
                            userAccessLevel === "Affichage" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          (userRole === "Archiviste" &&
                            userAccessLevel === "Affichage" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          (userRole === "Gestionnaire" &&
                            userAccessLevel === "Affichage" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          (userRole === "Etudiant(e)" &&
                            userAccessLevel === "Affichage" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||


                         (userRole === "Secrétaire" &&
                            userAccessLevel ===
                            "Affichage-Modification" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          (userRole === "Infirmier(e)" &&
                            userAccessLevel === "Affichage-Modification" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          (userRole === "Archiviste" &&
                            userAccessLevel === "Affichage-Modification" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                         (userRole === "Gestionnaire" &&
                            userAccessLevel ===
                            "Affichage-Modification" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          (userRole === "Etudiant(e)" &&
                            userAccessLevel === "Affichage-Modification" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||

                        
                        (userRole === "Secrétaire" &&
                            userAccessLevel ===
                            "Affichage-Modification-Suppression" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          
                          (userRole === "Infirmier(e)" &&
                            userAccessLevel ===
                            "Affichage-Modification-Suppression" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                         (userRole === "Secrétaire" &&
                            userAccessLevel ===
                            "Affichage-Modification-Suppression" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                         (userRole === "Gestionnaire" &&
                            userAccessLevel ===
                            "Affichage-Modification-Suppression" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||
                          (userRole === "Archiviste" &&
                            userAccessLevel ===
                            "Affichage-Modification-Suppression" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService))  ||
                          (userRole === "Etudiant(e)" &&
                            userAccessLevel ===
                            "Affichage-Modification-Suppression" &&
                            [
                              "Cuomo",
                              "Ctcv",
                              "Cardiologie",
                              "Réanimation",
                            ].includes(userService)) ||

                      (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||

                       (userRole === "Gestionnaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||

                      (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                      (userRole === "Archiviste" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                      (userRole === "Etudiant(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) 
                       
                          ? "none"
                          : "block",
                    }}

                  >
                    <MdMessage style={{ height: "30px", width: "30px" }} />
  </button>
                  {/*
                  <button
                    className="btn3"
                    onClick={() => navigate("/connections")}
                    style={{
                      display:
                        localStorage.getItem("userName") === "Ad" ||
                        (userRole === "Médecin" &&
                          userAccessLevel === "Affichage" &&
                          [
                            "Cuomo",
                            "Ctcv",
                            "Cardiologie",
                            "Réanimation",
                          ].includes(userService)) ||
                        (userRole === "Secrétaire" &&
                          userAccessLevel === "Affichage" &&
                          [
                            "Cuomo",
                            "Ctcv",
                            "Cardiologie",
                            "Réanimation",
                          ].includes(userService)) ||
                        (userRole === "Infirmier(e)" &&
                          userAccessLevel === "Affichage" &&
                          [
                            "Cuomo",
                            "Ctcv",
                            "Cardiologie",
                            "Réanimation",
                          ].includes(userService)) ||
                        (userRole === "Archiviste" &&
                          userAccessLevel === "Affichage" &&
                          [
                            "Cuomo",
                            "Ctcv",
                            "Cardiologie",
                            "Réanimation",
                          ].includes(userService)) ||
                        (userRole === "Gestionnaire" &&
                          userAccessLevel === "Affichage" &&
                          [
                            "Cuomo",
                            "Ctcv",
                            "Cardiologie",
                            "Réanimation",
                          ].includes(userService)) ||
                        (userRole === "Etudiant(e)" &&
                          userAccessLevel === "Affichage" &&
                          [
                            "Cuomo",
                            "Ctcv",
                            "Cardiologie",
                            "Réanimation",
                          ].includes(userService))
                          ? "none"
                          : "block",
                    }}
                    title="Historique des connexions"
                  >
                    <TbHistoryToggle
                      style={{ height: "30px", width: "30px" }}
                    />
                  </button>
                  */}
                  <button
                    title="Programme Opératoire"
                    className="btn3"
                    onClick={() => navigate("/programme")}
                  >
                    <MdOutlineEditCalendar
                      style={{ height: "30px", width: "30px" }}
                    />
                  </button>
                  <button
                    className="btn3 "
                    title="Staff"
                    onClick={() => navigate("/observation")}

                    style={{
                      display:
                        localStorage.getItem("userName") === "Ad" ||
                        (userRole === "Médecin" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                        (userRole === "Secrétaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                        (userRole === "Infirmier(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                        (userRole === "Archiviste" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                        (userRole === "Gestionnaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                        (userRole === "Etudiant(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
            
                        (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                        (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                        (userRole === "Archiviste" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                        (userRole === "Etudiant(e)" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                        (userRole === "Gestionnaire" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
            
                        (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                        (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                        (userRole === "Archiviste" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                        (userRole === "Etudiant(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                        (userRole === "Gestionnaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
            
            
                        (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                        (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                        (userRole === "Archiviste" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                        (userRole === "Etudiant(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                        (userRole === "Gestionnaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) 
                          ? "none"
                          : "block",
                          
                    }}
                  >
                    <MdOutlineContentPasteSearch
                      style={{ width: "30px", height: "30px" }}
                    />
                  </button>
                  <button
                    onClick={() => navigate("/role")}
                    title="Deconnexion"
                    className="btn3"
                  >
                    {/* Logout icon */}

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="25"
                      height="25"
                      fill="currentColor"
                      class="bi bi-door-open-fill"
                      viewBox="0 0 16 16"
                    >
                      <path d="M1.5 15a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1H13V2.5A1.5 1.5 0 0 0 11.5 1H11V.5a.5.5 0 0 0-.57-.495l-7 1A.5.5 0 0 0 3 1.5V15zM11 2h.5a.5.5 0 0 1 .5.5V15h-1zm-2.5 8c-.276 0-.5-.448-.5-1s.224-1 .5-1 .5.448.5 1-.224 1-.5 1" />
                    </svg>
                  </button>

                </div>
              </div>
              {/*Partie des userName et userService */}
              <div className="d-none d-md-block">
                {userName && (
                  <h6
                    className="flex-wrap"
                    style={{
                      color: "white",
                      marginLeft: "150px",
                      margin: "auto",
                    }}
                  >
                    Connecté en tant que:{userName}, du service:{userService}
                  </h6>
                )}
                <p
                  className="flex-wrap"
                  style={{ marginLeft: "150px", margin: "auto" }}
                >
                  {currentDate}
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      {showPaiement && <PatientSolvable patients={patients || []} />}
      {showfichier && <Fichier patients={patients || []} />}
      {showMessage && <Message />}
      {showArchive && <Archive />}
      {showAdditionalFields && (
        <>
          <form
            onSubmit={handleSubmit}
            className="patient-form"
            id="data-entry"
          >
            <h4 style={{ color: "white" }}>SAISIE DES DONNEES</h4>
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
              <option value="2033">2033</option>
              <option value="2032">2032</option>
              <option value="2031">2031</option>
              <option value="2030">2030</option>
              <option value="2029">2029</option>
              <option value="2028">2028</option>
              <option value="2027">2027</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
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
            <label>
              Sexe:
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
            </label>
           
            <label>
            constantes:
            <select
            value={formData.constantes}
            onChange={(e) =>
              setFormData({ ...formData, constantes: e.target.value })
            }
            >
              <option value="TA">TA</option>
              <option value="FC">FC</option>
              <option value="SPO2">SPO2</option>
              <option value="Température">Température</option>
              <option value="Poids">Poids</option>
              <option value="Taille">Taille</option>
              <option value="IMC">IMC</option>

            </select>
            </label>
            {formData.constantes === "TA" && (
                <div className="ta-inputs">
                  <input
                    type="text"
                    placeholder="TA"
                    value={formData.ta || ''}
                    onChange={(e) => setFormData({ ...formData, ta: e.target.value })}
                  />
                  
                </div>

              )}

{formData.constantes === "FC" && (
                <div className="fc-inputs">
                  <input
                    type="text"
                    placeholder="FC"
                    value={formData.fc || ''}
                    onChange={(e) => setFormData({ ...formData, fc: e.target.value })}
                  />
                  
                </div>

              )}
              {formData.constantes === "SPO2" && (
                <div className="spo2-inputs">
                  <input
                    type="text"
                    placeholder="SPO2"
                    value={formData.spo2 || ''}
                    onChange={(e) => setFormData({ ...formData, spo2: e.target.value })}
                  />
                  
                </div>

              )}
              {formData.constantes === "Température" && (
                <div className="temp-inputs">
                  <input
                    type="text"
                    placeholder="Température"
                    value={formData.temperature || ''}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  />

                </div>
              )}
              {formData.constantes === "Poids" && (
                <div className="poids-inputs">
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
                    </div>
                    )}
                {formData.constantes === "Taille" && (
                  <div className="taille-inputs">
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
                    </div>
                    )}
                    {formData.constantes === "IMC" && (
                      <div className="imc-inputs">
                        <input
                        type="text"
                        placeholder="IMC"
                        value={formData.imc || ''}
                        onChange={(e) => setFormData({ ...formData, imc: e.target.value })}
                        />
                        </div>
                        )}

            

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
              </optgroup>
              <optgroup label="Europe">
                <option value="Allemagne">Allemagne</option>
                <option value="France">France</option>
                <option value="Italie">Italie</option>
                <option value="Royaume-Uni">Royaume-Uni</option>
                <option value="Espagne">Espagne</option>
              </optgroup>
              <optgroup label="Océanie">
                <option value="Australie">Australie</option>
                <option value="Nouvelle-Zélande">Nouvelle-Zélande</option>
              </optgroup>
              <optgroup label="Antarctique">
                <option value="Scientifique">Scientifique</option>
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
              <option value="Non Opéré">Non Opéré</option>
              <option value="En Opération">En Opération</option>
              <option value="Opéré">Opéré</option>
              <option value="Opéré-transféré">Opéré-transféré</option>
              <option value="Opéré-décédé">Opéré-décédé</option>
              <option value="Opéré-Exeat">Opéré-Exeat</option>
            </select>
            {formData.statut === "Opéré-Exeat" && (
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

            {formData.statut === "Opéré-décédé" && (
              <label>
                Date de décès :
                <input
                  type="date"
                  onChange={(e) =>
                    setFormData({ ...formData, dateDeces: e.target.value })
                  }
                />
              </label>
            )}
            {formData.statut === "Opéré-transféré" && (
              <select
                value={formData.departementTransfert}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    departementTransfert: e.target.value,
                  })}>
                <option value="">Département de departementTransfert</option>
                <option value="Réanimation">Réanimation</option>
                <option value="Cardiologie">Cardiologie</option>
                <option value="Soins intensifs">Soins intensifs</option>
                <option value="Pédiatrie">Pédiatrie</option>
                <option value="Neurologie">Neurologie</option>
              </select>
            )}
           {/* <input
              type="text"
              placeholder="manageur"
              value={formData.manageur}
              onChange={(e) =>
                setFormData({ ...formData, manageur: e.target.value })
              }
            /> */}

            {/* Additional Input Fields */}
            <select
              value={formData.pathologie}
              onChange={(e) =>
                setFormData({ ...formData, pathologie: e.target.value })
              }
            >
              <option value="">Pathologie</option>
              <option value="la bicuspidie aortique">
                Bicuspidie Aortique{" "}
              </option>
              <option value="la communication interventriculaire">CIV</option>
              <option value="la communication interauriculaire">CIA</option>
              <option value="la sténose pulmonaire">Sténose Pulmonaire</option>
              <option value="la persistance du canal artériel">PCA</option>
              <option value="la coarctation aortique">
                Coarctation Aortique
              </option>
              <option value="la tétralogie de Fallot">T4F</option>
              <option value="la transposition des gros vaisseaux">TGV</option>
            </select>
            <label>
              Numéro VPA:
              <input
              type="text"
              placeholder="vpa"
              value={formData.vpa}
              onChange={(e) =>
                setFormData({ ...formData, vpa: e.target.value })
              }
            /> 
                </label> 
            <select
              value={formData.validation}
              onChange={(e) =>
                setFormData({ ...formData, validation: e.target.value })
              }
            >
              <option value="Validé">Validé</option>
              <option value="Non Validé">Non Validé</option>
            </select>
            {/* Add this button after the statut select field */}
            <button
              className="btn2"
              type="button"
              onClick={() => setShowAddFields(!showAddFields)}
              style={{
                display:
                  localStorage.getItem("userName") === "Ad" ||
                  (userRole === "Secrétaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                  (userRole === "Infirmier(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                  (userRole === "Archiviste" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                  (userRole === "Gestionnaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                  (userRole === "Etudiant(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
      
                  (userRole === "Médecin" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                  (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                  (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                  (userRole === "Etudiant(e)" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                  (userRole === "Gestionnaire" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
      
                  (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                  (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                  (userRole === "Etudiant(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                  (userRole === "Gestionnaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
      
      
                  (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                  (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                  (userRole === "Etudiant(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                  (userRole === "Gestionnaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) 
                    ? "none"
                    : "block",
                    
              }}
            >
              {showAddFields
                ? "Masquer les champs supplémentaires"
                : "Afficher les champs supplémentaires"}
            </button>

            {/* Wrap the fields you want to hide in a conditional render */}
            {showAddFields && (
              <>
                <select
                  value={formData.anneeIntervention}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      anneeIntervention: e.target.value,
                    })
                  }
                >
                  <option value="">Annee d'intervention</option>
                  <option value="2033">2033</option>
              <option value="2032">2032</option>
              <option value="2031">2031</option>
              <option value="2030">2030</option>
              <option value="2029">2029</option>
              <option value="2028">2028</option>
              <option value="2027">2027</option>
              <option value="2026">2026</option>
                 <option value="2025">2025</option>
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
                <label>
                  Consultation:
                  <textarea
                  type="text"
                  placeholder="Raison de Consultation"
                  value={formData.consultationReason}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      consultationReason: e.target.value,
                    })
                  }
                ></textarea>
                  </label>
                <label>
                  Traitement d'Entrée:
                  <textarea
                  type="text"
                  placeholder="Traitement à l'Entrée"
                  value={formData.traitementEntree}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      traitementEntree: e.target.value,
                    })
                  }
                ></textarea>
                  </label>
                <label>
                  Traitement de sortie:
                  <textarea
                  type="text"
                  placeholder="Traitement à la Sortie"
                  value={formData.traitementSortie}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      traitementSortie: e.target.value,
                    })
                  }
                ></textarea>
                  </label>
                <label>
                  Suites Simples:
                  <textarea
                  type="text"
                  placeholder="Suites Simples"
                  value={formData.simpleSuites}
                  onChange={(e) =>
                    setFormData({ ...formData, simpleSuites: e.target.value })
                  }
                ></textarea>
                  </label>

                <label>
                Complications:
                <textarea
                  type="text"
                  placeholder="Complications"
                  value={formData.complications}
                  onChange={(e) =>
                    setFormData({ ...formData, complications: e.target.value })
                  }
                >
                  {" "}
                </textarea>
                </label>
                <label>
                  Geste(s):
                  <textarea
                  type="text"
                  placeholder="Geste"
                  value={formData.geste}
                  onChange={(e) =>
                    setFormData({ ...formData, geste: e.target.value })
                  }
                />
                </label>  

                <labal>
                  Opérateur(s):
<select
  multiple
  value={formData.operateur || []}
  onChange={(e) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, operateur: values });
  }}
  style={{padding: '10px', height: '70px'}} // Makes it easier to select multiple
>
  <option value="Pr Amadou Gabriel CISS ,">Pr Amadou Gabriel CISS ,</option>
  <option value="Pr Papa Salmane BA ,">Pr Papa Salmane BA ,</option>
  <option value="Pr Momar Sokna DIOP ,">Pr Momar Sokna DIOP ,</option>
  <option value="Dr Papa Amath DIAGNE ,">Dr Papa Amath DIAGNE ,</option>
  <option value="Dr Papa Ousmane BA ,">Dr Papa Ousmane BA ,</option>
  <option value="Dr Abdou Aziz THIAW ,">Dr Abdou Aziz THIAW ,</option>
  <option value="Dr Anta Mbaye SALL ,">Dr Anta Mbaye SALL ,</option>
  <option value="Dr JOHN ,">Dr JOHN ,</option>
  <option value="Dr ODUYE ,">Dr ODUYE ,</option>
  <option value="Dr KAMAL ,">Dr KAMAL ,</option>
  <option value="Dr AJADI ,">Dr AJADI ,</option>
</select>
                </labal>  

                <button className="btn3 w-5 h-5" onClick={(e)=>{
                   e.preventDefault();
                   e.stopPropagation();
                  setShowFirst(!showFirst);}}
                  >
                    OBSERVATION PRE-OPERATOIRE
                 </button> 
                {showFirst && (
                  <>
              <div className="file-upload-section">
  <textarea
    type="text"
    placeholder="histoire"
    value={formData.histoire}
    onChange={(e) => setFormData({ ...formData, histoire: e.target.value })}
  ></textarea>
  
  

  {/*<div className="row">
    {filesOb.filter(file => file.section === "histoire").map(file => (
      <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <div>
                <button 
                  onClick={() => handleBoxDelete(file.id, "histoire")} 
                  className="btn btn-danger btn-sm"
                  style={{
                    display:
                      localStorage.getItem("userName") === "Ad" ||
                      (userRole === "Médecin" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Médecin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Admin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"])
                        ? "block" : "none"
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>

            <div className="file-info text-muted small">
              <p><strong>Date:</strong> {new Date(file.timestamp).toLocaleString()}</p>
              <p><strong>Lien:</strong> <a href={file.link} target="_blank" rel="noopener noreferrer">{file.link}</a></p>
            </div>

            <button
              className="btn btn-info btn-sm"
              onClick={() => handleOpenLink(file.link)}
            >
              Ouvrir le fichier
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>*/}
</div>



<div className="file-upload-section">
  <textarea
    type="text"
    placeholder="Antécédents"
    value={formData.antecedents}
    onChange={(e) => setFormData({ ...formData, antecedents: e.target.value })}
  ></textarea>
  
  
  {/*<div className="row">
    {filesOb.filter(file => file.section === "antecedents").map(file => (
      <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <div>
                <button 
                  onClick={() => handleBoxDelete(file.id, "antecedents")} 
                  className="btn btn-danger btn-sm"
                  style={{
                    display:
                      localStorage.getItem("userName") === "Ad" ||
                      (userRole === "Médecin" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Médecin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Admin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"])
                        ? "block" : "none"
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>

            <div className="file-info text-muted small">
              <p><strong>Date:</strong> {new Date(file.timestamp).toLocaleString()}</p>
              <p><strong>Lien:</strong> <a href={file.link} target="_blank" rel="noopener noreferrer">{file.link}</a></p>
            </div>

            <button
              className="btn btn-info btn-sm"
              onClick={() => handleOpenLink(file.link)}
            >
              Ouvrir le fichier
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>*/}
</div>

                {/* Traitement Section */}
      <div className="file-upload-section">
        <textarea
          type="text"
          placeholder="Traitement"
          value={formData.traitement}
          onChange={(e) => setFormData({ ...formData, traitement: e.target.value })}
        ></textarea>
        
        

        {/*<div className="row">
          {filesOb.filter(file => file.section === "traitement").map(file => (
            <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-3">
                    <div>
                      <button 
                        onClick={() => handleBoxDelete(file.id, "traitement")} 
                        className="btn btn-danger btn-sm"
                        style={{
                          display: localStorage.getItem("userName") === "Ad" ||
                            (userRole === "Médecin" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                            (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                            (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                            (userRole === "Médecin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                            (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                            (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                            (userRole === "Admin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"])
                              ? "block" : "none"
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                  <div className="file-info text-muted small">
                    <p><strong>Date:</strong> {new Date(file.timestamp).toLocaleString()}</p>
                    <p><strong>Lien:</strong> <a href={file.link} target="_blank" rel="noopener noreferrer">{file.link}</a></p>
                  </div>
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => handleOpenLink(file.link)}
                  >
                    Ouvrir le fichier
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>*/}
      </div>

      {/* ECRT Section */}
      <div className="file-upload-section">
        <textarea
          type="text"
          placeholder="ECRT"
          value={formData.ecrt}
          onChange={(e) => setFormData({ ...formData, ecrt: e.target.value })}
        ></textarea>
        
       

        {/*<div className="row">
          {filesOb.filter(file => file.section === "ecrt").map(file => (
            <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-3">
                    <div>
                      <button 
                        onClick={() => handleBoxDelete(file.id, "ecrt")} 
                        className="btn btn-danger btn-sm"
                        style={{
                          display: localStorage.getItem("userName") === "Ad" ||
                            (userRole === "Médecin" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                            (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                            (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                            (userRole === "Médecin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                            (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                            (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                            (userRole === "Admin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"])
                              ? "block" : "none"
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                  <div className="file-info text-muted small">
                    <p><strong>Date:</strong> {new Date(file.timestamp).toLocaleString()}</p>
                    <p><strong>Lien:</strong> <a href={file.link} target="_blank" rel="noopener noreferrer">{file.link}</a></p>
                  </div>
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => handleOpenLink(file.link)}
                  >
                    Ouvrir le fichier
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>*/}
      </div>

                {/* ECG Section */}
<div className="file-upload-section">
  <textarea
    type="text"
    placeholder="ECG"
    value={formData.ecg}
    onChange={(e) => setFormData({ ...formData, ecg: e.target.value })}
  ></textarea>
  
  

 {/* <div className="row">
    {filesOb.filter(file => file.section === "ecg").map(file => (
      <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <div>
                <button 
                  onClick={() => handleBoxDelete(file.id, "ecg")} 
                  className="btn btn-danger btn-sm"
                  style={{
                    display: localStorage.getItem("userName") === "Ad" ||
                      (userRole === "Médecin" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Médecin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Admin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"])
                        ? "block" : "none"
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
            <div className="file-info text-muted small">
              <p><strong>Date:</strong> {new Date(file.timestamp).toLocaleString()}</p>
              <p><strong>Lien:</strong> <a href={file.link} target="_blank" rel="noopener noreferrer">{file.link}</a></p>
            </div>
            <button
              className="btn btn-info btn-sm"
              onClick={() => handleOpenLink(file.link)}
            >
              Ouvrir le fichier
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>*/}
</div>

{/* ETT Section */}
<div className="file-upload-section">
 <label>
 ETT & ETO
 <textarea
    type="text"
    placeholder="ETT & ETO"
    value={formData.ett}
    onChange={(e) => setFormData({ ...formData, ett: e.target.value })}
  ></textarea>
  </label>
  
  

 {/* <div className="row">
    {filesOb.filter(file => file.section === "ett").map(file => (
      <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <div>
                <button 
                  onClick={() => handleBoxDelete(file.id, "ett")} 
                  className="btn btn-danger btn-sm"
                  style={{
                    display: localStorage.getItem("userName") === "Ad" ||
                      (userRole === "Médecin" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Médecin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Admin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"])
                        ? "block" : "none"
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
            <div className="file-info text-muted small">
              <p><strong>Date:</strong> {new Date(file.timestamp).toLocaleString()}</p>
              <p><strong>Lien:</strong> <a href={file.link} target="_blank" rel="noopener noreferrer">{file.link}</a></p>
            </div>
            <button
              className="btn btn-info btn-sm"
              onClick={() => handleOpenLink(file.link)}
            >
              Ouvrir le fichier
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>*/}
</div>

                {/* TT Section */}
<div className="file-upload-section">
  <label>
    TDM
  <textarea
    type="text"
    placeholder="TDM"
    value={formData.tt}
    onChange={(e) => setFormData({ ...formData, tt: e.target.value })}
  ></textarea>
    </label>
  


 {/* <div className="row">
    {filesOb.filter(file => file.section === "tt").map(file => (
      <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <div>
                <button 
                  onClick={() => handleBoxDelete(file.id, "tt")} 
                  className="btn btn-danger btn-sm"
                  style={{
                    display: localStorage.getItem("userName") === "Ad" ||
                      (userRole === "Médecin" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Médecin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Admin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"])
                        ? "block" : "none"
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
            <div className="file-info text-muted small">
              <p><strong>Date:</strong> {new Date(file.timestamp).toLocaleString()}</p>
              <p><strong>Lien:</strong> <a href={file.link} target="_blank" rel="noopener noreferrer">{file.link}</a></p>
            </div>
            <button
              className="btn btn-info btn-sm"
              onClick={() => handleOpenLink(file.link)}
            >
              Ouvrir le fichier
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>*/}
</div>

{/* Coronarographie Section */}
<div className="file-upload-section">
  <textarea
    type="text"
    placeholder="Coronarographie"
    value={formData.coronarographie}
    onChange={(e) => setFormData({ ...formData, coronarographie: e.target.value })}
  ></textarea>
  
 

  {/*<div className="row">
    {filesOb.filter(file => file.section === "coronarographie").map(file => (
      <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <div>
                <button 
                  onClick={() => handleBoxDelete(file.id, "coronarographie")} 
                  className="btn btn-danger btn-sm"
                  style={{
                    display: localStorage.getItem("userName") === "Ad" ||
                      (userRole === "Médecin" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Médecin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Admin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"])
                        ? "block" : "none"
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
            <div className="file-info text-muted small">
              <p><strong>Date:</strong> {new Date(file.timestamp).toLocaleString()}</p>
              <p><strong>Lien:</strong> <a href={file.link} target="_blank" rel="noopener noreferrer">{file.link}</a></p>
            </div>
            <button
              className="btn btn-info btn-sm"
              onClick={() => handleOpenLink(file.link)}
            >
              Ouvrir le fichier
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>*/}
</div>

                {/* Autres Examens Section */}
<div className="file-upload-section">
  <textarea
    type="text"
    placeholder="Autres Examens"
    value={formData.autresExamens}
    onChange={(e) => setFormData({ ...formData, autresExamens: e.target.value })}
  ></textarea>
  
  

 {/* <div className="row">
    {filesOb.filter(file => file.section === "autresExamens").map(file => (
      <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <div>
                <button 
                  onClick={() => handleBoxDelete(file.id, "autresExamens")} 
                  className="btn btn-danger btn-sm"
                  style={{
                    display: localStorage.getItem("userName") === "Ad" ||
                      (userRole === "Médecin" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Médecin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Admin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"])
                        ? "block" : "none"
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
            <div className="file-info text-muted small">
              <p><strong>Date:</strong> {new Date(file.timestamp).toLocaleString()}</p>
              <p><strong>Lien:</strong> <a href={file.link} target="_blank" rel="noopener noreferrer">{file.link}</a></p>
            </div>
            <button
              className="btn btn-info btn-sm"
              onClick={() => handleOpenLink(file.link)}
            >
              Ouvrir le fichier
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>*/}
</div>

{/* Biologie Section */}
<div className="file-upload-section">
  <textarea
    type="text"
    placeholder="Biologie"
    value={formData.biologie}
    onChange={(e) => setFormData({ ...formData, biologie: e.target.value })}
  ></textarea>
  
 

  {/*<div className="row">
    {filesOb.filter(file => file.section === "biologie").map(file => (
      <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <div>
                <button 
                  onClick={() => handleBoxDelete(file.id, "biologie")} 
                  className="btn btn-danger btn-sm"
                  style={{
                    display: localStorage.getItem("userName") === "Ad" ||
                      (userRole === "Médecin" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Médecin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Admin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"])
                        ? "block" : "none"
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
            <div className="file-info text-muted small">
              <p><strong>Date:</strong> {new Date(file.timestamp).toLocaleString()}</p>
              <p><strong>Lien:</strong> <a href={file.link} target="_blank" rel="noopener noreferrer">{file.link}</a></p>
            </div>
            <button
              className="btn btn-info btn-sm"
              onClick={() => handleOpenLink(file.link)}
            >
              Ouvrir le fichier
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>*/}
</div>

                {/* CRO Section */}
<div className="file-upload-section">
  <textarea
    type="text"
    placeholder="CRO"
    value={formData.cro}
    onChange={(e) => setFormData({ ...formData, cro: e.target.value })}
  ></textarea>
  
  

 {/* <div className="row">
    {filesOb.filter(file => file.section === "cro").map(file => (
      <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <div>
                <button 
                  onClick={() => handleBoxDelete(file.id, "cro")} 
                  className="btn btn-danger btn-sm"
                  style={{
                    display: localStorage.getItem("userName") === "Ad" ||
                      (userRole === "Médecin" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Médecin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Admin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"])
                        ? "block" : "none"
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
            <div className="file-info text-muted small">
              <p><strong>Date:</strong> {new Date(file.timestamp).toLocaleString()}</p>
              <p><strong>Lien:</strong> <a href={file.link} target="_blank" rel="noopener noreferrer">{file.link}</a></p>
            </div>
            <button
              className="btn btn-info btn-sm"
              onClick={() => handleOpenLink(file.link)}
            >
              Ouvrir le fichier
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>*/}
</div>

{/* Rx Thorax Post Section */}
<div className="file-upload-section">
  <textarea
    type="text"
    placeholder="Rx Thorax Post"
    value={formData.rxthoraxPost}
    onChange={(e) => setFormData({ ...formData, rxthoraxPost: e.target.value })}
  ></textarea>
  
  

  {/*<div className="row">
    {filesOb.filter(file => file.section === "rxthoraxPost").map(file => (
      <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <div>
                <button 
                  onClick={() => handleBoxDelete(file.id, "rxthoraxPost")} 
                  className="btn btn-danger btn-sm"
                  style={{
                    display: localStorage.getItem("userName") === "Ad" ||
                      (userRole === "Médecin" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Médecin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Admin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"])
                        ? "block" : "none"
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
            <div className="file-info text-muted small">
              <p><strong>Date:</strong> {new Date(file.timestamp).toLocaleString()}</p>
              <p><strong>Lien:</strong> <a href={file.link} target="_blank" rel="noopener noreferrer">{file.link}</a></p>
            </div>
            <button
              className="btn btn-info btn-sm"
              onClick={() => handleOpenLink(file.link)}
            >
              Ouvrir le fichier
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>*/}
</div>

               {/* ECG Post Section */}
<div className="file-upload-section">
  <textarea
    type="text"
    placeholder="ECG Post"
    value={formData.ecgPost}
    onChange={(e) => setFormData({ ...formData, ecgPost: e.target.value })}
  ></textarea>
  
 

 {/* <div className="row">
    {filesOb.filter(file => file.section === "ecgPost").map(file => (
      <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <div>
                <button 
                  onClick={() => handleBoxDelete(file.id, "ecgPost")} 
                  className="btn btn-danger btn-sm"
                  style={{
                    display: localStorage.getItem("userName") === "Ad" ||
                      (userRole === "Médecin" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Médecin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Admin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"])
                        ? "block" : "none"
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
            <div className="file-info text-muted small">
              <p><strong>Date:</strong> {new Date(file.timestamp).toLocaleString()}</p>
              <p><strong>Lien:</strong> <a href={file.link} target="_blank" rel="noopener noreferrer">{file.link}</a></p>
            </div>
            <button
              className="btn btn-info btn-sm"
              onClick={() => handleOpenLink(file.link)}
            >
              Ouvrir le fichier
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>*/}
</div>

{/* Echoscopie Post Section */}
<div className="file-upload-section">
  <textarea
    type="text"
    placeholder="Echoscopie Post"
    value={formData.echoscopiePost}
    onChange={(e) => setFormData({ ...formData, echoscopiePost: e.target.value })}
  ></textarea>
  
  

  {/*<div className="row">
    {filesOb.filter(file => file.section === "echoscopiePost").map(file => (
      <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <div>
                <button 
                  onClick={() => handleBoxDelete(file.id, "echoscopiePost")} 
                  className="btn btn-danger btn-sm"
                  style={{
                    display: localStorage.getItem("userName") === "Ad" ||
                      (userRole === "Médecin" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Médecin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Admin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"])
                        ? "block" : "none"
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
            <div className="file-info text-muted small">
              <p><strong>Date:</strong> {new Date(file.timestamp).toLocaleString()}</p>
              <p><strong>Lien:</strong> <a href={file.link} target="_blank" rel="noopener noreferrer">{file.link}</a></p>
            </div>
            <button
              className="btn btn-info btn-sm"
              onClick={() => handleOpenLink(file.link)}
            >
              Ouvrir le fichier
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>*/}
</div>

                {/* Biologie Post Section */}
<div className="file-upload-section">
  <textarea
    type="text"
    placeholder="Biologie Post"
    value={formData.biologiePost}
    onChange={(e) => setFormData({ ...formData, biologiePost: e.target.value })}
  ></textarea>
  
 

  {/*<div className="row">
    {filesOb.filter(file => file.section === "biologiePost").map(file => (
      <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <div>
                <button 
                  onClick={() => handleBoxDelete(file.id, "biologiePost")} 
                  className="btn btn-danger btn-sm"
                  style={{
                    display: localStorage.getItem("userName") === "Ad" ||
                      (userRole === "Médecin" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Médecin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Admin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"])
                        ? "block" : "none"
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
            <div className="file-info text-muted small">
              <p><strong>Date:</strong> {new Date(file.timestamp).toLocaleString()}</p>
              <p><strong>Lien:</strong> <a href={file.link} target="_blank" rel="noopener noreferrer">{file.link}</a></p>
            </div>
            <button
              className="btn btn-info btn-sm"
              onClick={() => handleOpenLink(file.link)}
            >
              Ouvrir le fichier
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>*/}
</div>

            </> 
                 )}
               <button 
  className="btn3" 
  onClick={(e) => {
    e.preventDefault();
    setShowSec(!showSec);
  }}
>
  SUITES OPERATOIRE
</button>

               {showSec && (
                <>
                {/* observation Section */}
<div className="file-upload-section">
  <label>
    Observation
  <textarea
    type="text"
    placeholder="Observation"
    value={formData.observation}
    onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
  ></textarea>

    </label>
  
  

 {/* <div className="row">
    {filesOb.filter(file => file.section === "observation").map(file => (
      <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <div>
                <button 
                  onClick={() => handleBoxDelete(file.id, "observation")} 
                  className="btn btn-danger btn-sm"
                  style={{
                    display: localStorage.getItem("userName") === "Ad" ||
                      (userRole === "Médecin" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Médecin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Admin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"])
                        ? "block" : "none"
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
            <div className="file-info text-muted small">
              <p><strong>Date:</strong> {new Date(file.timestamp).toLocaleString()}</p>
              <p><strong>Lien:</strong> <a href={file.link} target="_blank" rel="noopener noreferrer">{file.link}</a></p>
            </div>
            <button
              className="btn btn-info btn-sm"
              onClick={() => handleOpenLink(file.link)}
            >
              Ouvrir le fichier
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>*/}
</div>

{/* imagerie Section */}
<div className="file-upload-section">
  Imagerie Post Opération
  <textarea
    type="text"
    placeholder="imagerie"
    value={formData.imagerie}
    onChange={(e) => setFormData({ ...formData, imagerie: e.target.value })}
  ></textarea>
  
 

  {/*<div className="row">
    {filesOb.filter(file => file.section === "imagerie").map(file => (
      <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <div>
                <button 
                  onClick={() => handleBoxDelete(file.id, "imagerie")} 
                  className="btn btn-danger btn-sm"
                  style={{
                    display: localStorage.getItem("userName") === "Ad" ||
                      (userRole === "Médecin" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Médecin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Admin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"])
                        ? "block" : "none"
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
            <div className="file-info text-muted small">
              <p><strong>Date:</strong> {new Date(file.timestamp).toLocaleString()}</p>
              <p><strong>Lien:</strong> <a href={file.link} target="_blank" rel="noopener noreferrer">{file.link}</a></p>
            </div>
            <button
              className="btn btn-info btn-sm"
              onClick={() => handleOpenLink(file.link)}
            >
              Ouvrir le fichier
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>*/}
</div>

                {/* biologiePostOp Section */}
<div className="file-upload-section">
  <label>
    Biologie Post Opération
  <textarea
    type="text"
    placeholder="biologiePostOp"
    value={formData.biologiePostOp}
    onChange={(e) => setFormData({ ...formData, biologiePostOp: e.target.value })}
  ></textarea>
    </label>
  

 {/* <div className="row">
    {filesOb.filter(file => file.section === "biologiePostOp").map(file => (
      <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <div>
                <button 
                  onClick={() => handleBoxDelete(file.id, "biologiePostOp")} 
                  className="btn btn-danger btn-sm"
                  style={{
                    display: localStorage.getItem("userName") === "Ad" ||
                      (userRole === "Médecin" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Médecin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Admin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"])
                        ? "block" : "none"
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
            <div className="file-info text-muted small">
              <p><strong>Date:</strong> {new Date(file.timestamp).toLocaleString()}</p>
              <p><strong>Lien:</strong> <a href={file.link} target="_blank" rel="noopener noreferrer">{file.link}</a></p>
            </div>
            <button
              className="btn btn-info btn-sm"
              onClick={() => handleOpenLink(file.link)}
            >
              Ouvrir le fichier
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>*/}
</div>

                
                </>
               )}
                
                <button 
  className="btn3" 
  onClick={(e) => {
    e.preventDefault();
    setShowTh(!showTh);
  }}
>
  SUIVI
</button>

               {showTh && (
                <>
                {/* observation Section */}
                {/*
<div className="file-upload-section">
  <textarea
    type="text"
    placeholder="suite"
    value={formData.suite}
    onChange={(e) => setFormData({ ...formData, suite: e.target.value })}
  ></textarea>
  */}
 

 {/* <div className="row">
    {filesOb.filter(file => file.section === "suite").map(file => (
      <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <div>
                <button 
                  onClick={() => handleBoxDelete(file.id, "suite")} 
                  className="btn btn-danger btn-sm"
                  style={{
                    display: localStorage.getItem("userName") === "Ad" ||
                      (userRole === "Médecin" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Médecin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Admin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"])
                        ? "block" : "none"
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
            <div className="file-info text-muted small">
              <p><strong>Date:</strong> {new Date(file.timestamp).toLocaleString()}</p>
              <p><strong>Lien:</strong> <a href={file.link} target="_blank" rel="noopener noreferrer">{file.link}</a></p>
            </div>
            <button
              className="btn btn-info btn-sm"
              onClick={() => handleOpenLink(file.link)}
            >
              Ouvrir le fichier
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>*/}{/*
</div>*/}

{/* imagerie Section */}
<div className="file-upload-section">
 <label>
  Suivi
 <textarea
    type="text"
    placeholder="suivi"
    value={formData.suivi}
    onChange={(e) => setFormData({ ...formData, suivi: e.target.value })}
  ></textarea>
  </label>
  
  

 {/* <div className="row">
    {filesOb.filter(file => file.section === "suivi").map(file => (
      <div key={file.id} className="col-12 col-md-6 col-lg-4 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <div>
                <button 
                  onClick={() => handleBoxDelete(file.id, "suivi")} 
                  className="btn btn-danger btn-sm"
                  style={{
                    display: localStorage.getItem("userName") === "Ad" ||
                      (userRole === "Médecin" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Médecin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Secrétaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Infirmier(e)" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]) ||
                      (userRole === "Admin" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"])
                        ? "block" : "none"
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
            <div className="file-info text-muted small">
              <p><strong>Date:</strong> {new Date(file.timestamp).toLocaleString()}</p>
              <p><strong>Lien:</strong> <a href={file.link} target="_blank" rel="noopener noreferrer">{file.link}</a></p>
            </div>
            <button
              className="btn btn-info btn-sm"
              onClick={() => handleOpenLink(file.link)}
            >
              Ouvrir le fichier
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>*/}
 

</div>


                
                </>
               )}
            
                   
                
              </>
            )}

            <button className="btn2" type="submit" >
              {editing ? "Mettre à jour" : "Ajouter"}
            </button>
          </form>
        </>
      )}


      <div
        className="patient-list-header"
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <input
  type="text" 
  value={searchTerm}
  onChange={handleSearch}
  placeholder="Rechercher dans tous les champs..."
  className="search-input"
  style={{ borderRadius: "80px", padding: "8px", width: "300px" }}
/>

        <select
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ borderRadius: "50px", padding: "10px" }}
        >
          <option value="">Tous les Statuts</option>
          <option value="Non Opéré">Non Opéré</option>
          <option value="En Opération">En Opération</option>
          <option value="Opéré">Opéré</option>
          <option value="Opéré-transféré">Opéré-transféré</option>
          <option value="Opéré-décédé">Opéré-décédé</option>
          <option value="Opéré-Exeat">Opéré-Exeat</option>
        </select>

        <select
          onChange={(e) => setValidationFilter(e.target.value)}
          style={{
            borderRadius: "50px",
            padding: "10px",
            display:
              localStorage.getItem("userName") === "Ad" ||
                (userRole === "Médecin" &&
                  userAccessLevel === "Affichage" &&
                  ["Cuomo", "Ctcv", "Cardiologie", "Réanimation"].includes(
                    userService
                  )) ||
                (userRole === "Infirmier(e)" &&
                  userAccessLevel === "Affichage" &&
                  ["Cuomo", "Ctcv", "Cardiologie", "Réanimation"].includes(
                    userService
                  )) ||
                (userRole === "Archiviste" &&
                  userAccessLevel === "Affichage" &&
                  ["Cuomo", "Ctcv", "Cardiologie", "Réanimation"].includes(
                    userService
                  )) ||
                (userRole === "Etudiant(e)" &&
                  userAccessLevel === "Affichage" &&
                  ["Cuomo", "Ctcv", "Cardiologie", "Réanimation"].includes(
                    userService
                  )) ||
                (userRole === "Médecin" &&
                  userAccessLevel === "Affichage-Modification" &&
                  ["Cuomo", "Ctcv", "Cardiologie", "Réanimation"].includes(
                    userService
                  )) ||
                (userRole === "Infirmier(e)" &&
                  userAccessLevel === "Affichage-Modification" &&
                  ["Cuomo", "Ctcv", "Cardiologie", "Réanimation"].includes(
                    userService
                  )) ||
                (userRole === "Archiviste" &&
                  userAccessLevel === "Affichage-Modification" &&
                  ["Cuomo", "Ctcv", "Cardiologie", "Réanimation"].includes(
                    userService
                  )) ||
                (userRole === "Etudiant(e)" &&
                  userAccessLevel === "Affichage-Modification" &&
                  ["Cuomo", "Ctcv", "Cardiologie", "Réanimation"].includes(
                    userService
                  )) ||
                (userRole === "Médecin" &&
                  userAccessLevel === "Affichage-Modification-Suppression" &&
                  ["Cuomo", "Ctcv", "Cardiologie", "Réanimation"].includes(
                    userService
                  )) ||
                (userRole === "Infirmier(e)" &&
                  userAccessLevel === "Affichage-Modification-Suppression" &&
                  ["Cuomo", "Ctcv", "Cardiologie", "Réanimation"].includes(
                    userService
                  )) ||
                (userRole === "Archiviste" &&
                  userAccessLevel === "Affichage-Modification-Suppression" &&
                  ["Cuomo", "Ctcv", "Cardiologie", "Réanimation"].includes(
                    userService
                  )) ||
                (userRole === "Etudiant(e)" &&
                  userAccessLevel === "Affichage-Modification-Suppression" &&
                  ["Cuomo", "Ctcv", "Cardiologie", "Réanimation"].includes(
                    userService
                  )) ||
                (userRole === "Médecin" &&
                  userAccessLevel === "Administrateur" &&
                  ["Cuomo", "Ctcv", "Cardiologie", "Réanimation"].includes(
                    userService
                  )) ||
                (userRole === "Infirmier(e)" &&
                  userAccessLevel === "Administrateur" &&
                  ["Cuomo", "Ctcv", "Cardiologie", "Réanimation"].includes(
                    userService
                  )) ||
                (userRole === "Archiviste" &&
                  userAccessLevel === "Administrateur" &&
                  ["Cuomo", "Ctcv", "Cardiologie", "Réanimation"].includes(
                    userService
                  )) ||
                (userRole === "Etudiant(e)" &&
                  userAccessLevel === "Administrateur" &&
                  ["Cuomo", "Ctcv", "Cardiologie", "Réanimation"].includes(
                    userService
                  ))
                ? "none"
                : "block",
          }}
        >
          <option value="Validé">Validé</option>
          <option value="Non Validé">Non Validé</option>
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
                  patient.statut === "Opéré"
                    ? "green"
                    : patient.statut === "Opéré-transféré"
                      ? "yellowgreen"
                      : patient.statut === "Opéré-décédé"
                        ? "black"
                        : patient.statut === "Opéré-Exeat"
                          ? "blue"
                          : patient.statut === "En Opération"
                            ? "orange"
                            : patient.statut === "Non Opéré"
                              ? "red"
                              : "orange",
                textDecoration: "none",

                borderRadius: "5px",
              }}
              id="data-exit"
            >
              {patient.nom} - {patient.statut}
              {patient.statut === "Opéré-transféré" &&
                patient.departementTransfert && (
                  <span> → {patient.departementTransfert}</span>
                )}
              {patient.statut === "Opéré-décédé" && patient.dateDeces && (
                <span> →Date de décès : {formatDate(patient.dateDeces)}</span>
              )}
              {patient.statut === "Opéré-Exeat" && patient.dateDesortie && (
                <span> → {formatDate(patient.dateDesortie)}</span>
              )}{" "}
              {patient.manageur && <span> → {patient.manageur}</span>}
              {patient.services && <span> → {patient.services}</span>}
              {patient.vpa && <span> → {patient.vpa}</span>}
              {patient.validation && <span> → {patient.validation}</span>}
            </span>
            <button
              className="btn3"
              onClick={() => handleEdit(patient)}
              style={{
                display:
                  localStorage.getItem("userName") === "Ad" ||
                  (userRole === "Secrétaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                  (userRole === "Infirmier(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                  (userRole === "Archiviste" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                  (userRole === "Gestionnaire" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                  (userRole === "Etudiant(e)" && userAccessLevel === "Affichage"&& ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
      
                  (userRole === "Archiviste" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) |
                  (userRole === "Gestionnaire" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||


                  (userRole === "Archiviste" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) |
                  (userRole === "Gestionnaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
      
                 (userRole === "Gestionnaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                  (userRole === "Archiviste" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                  (userRole === "Gestionnaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) 
                    ? "none"
                    : "block",
                    
              }}
            >
              Modifier
            </button>
            <button
              onClick={() => handleDelete(patient._id)}
              className="btn3"
              style={{
                display:
                  localStorage.getItem("userName") === "Ad" ||
                    (userRole === "Médecin" &&
                      userAccessLevel === "Affichage" && [
                        "Cuomo",
                        "Ctcv",
                        "Cardiologie",
                        "Réanimation",
                      ]) ||
                    (userRole === "Secrétaire" &&
                      userAccessLevel === "Affichage" && [
                        "Cuomo",
                        "Ctcv",
                        "Cardiologie",
                        "Réanimation",
                      ]) ||
                    (userRole === "Infirmier(e)" &&
                      userAccessLevel === "Affichage" && [
                        "Cuomo",
                        "Ctcv",
                        "Cardiologie",
                        "Réanimation",
                      ]) ||
                    (userRole === "Archiviste" &&
                      userAccessLevel === "Affichage" && [
                        "Cuomo",
                        "Ctcv",
                        "Cardiologie",
                        "Réanimation",
                      ]) ||
                    (userRole === "Gestionnaire" &&
                      userAccessLevel === "Affichage" && [
                        "Cuomo",
                        "Ctcv",
                        "Cardiologie",
                        "Réanimation",
                      ]) ||
                    (userRole === "Etudiant(e)" &&
                      userAccessLevel === "Affichage" && [
                        "Cuomo",
                        "Ctcv",
                        "Cardiologie",
                        "Réanimation",
                      ]) ||
                      (userRole === "Archiviste" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                      (userRole === "Etudiant(e)" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                      (userRole === "Gestionnaire" && userAccessLevel === "Affichage-Modification" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
    
                      (userRole === "Archiviste" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) |
                      (userRole === "Gestionnaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
          
                       (userRole === "Gestionnaire" && userAccessLevel === "Admistrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                      (userRole === "Archiviste" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                      (userRole === "Gestionaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) 

                       
                    ? "none"
                    : "block",
              }}
            >
              Supprimer
            </button>

            <button
              onClick={() => exportPatientDetails(patient)}
              className="btn3"
              style={{
                display:
                  localStorage.getItem("userName") === "Ad" ||
                    (userRole === "Médecin" &&
                      userAccessLevel === "Affichage" && [
                        "Cuomo",
                        "Ctcv",
                        "Cardiologie",
                        "Réanimation",
                      ]) ||
                    (userRole === "Secrétaire" &&
                      userAccessLevel === "Affichage" && [
                        "Cuomo",
                        "Ctcv",
                        "Cardiologie",
                        "Réanimation",
                      ]) ||
                    (userRole === "Infirmier(e)" &&
                      userAccessLevel === "Affichage" && [
                        "Cuomo",
                        "Ctcv",
                        "Cardiologie",
                        "Réanimation",
                      ]) ||
                    (userRole === "Archiviste" &&
                      userAccessLevel === "Affichage" && [
                        "Cuomo",
                        "Ctcv",
                        "Cardiologie",
                        "Réanimation",
                      ]) ||
                    (userRole === "Gestionnaire" &&
                      userAccessLevel === "Affichage" && [
                        "Cuomo",
                        "Ctcv",
                        "Cardiologie",
                        "Réanimation",
                      ]) ||
                    (userRole === "Etudiant(e)" &&
                      userAccessLevel === "Affichage" && [
                        "Cuomo",
                        "Ctcv",
                        "Cardiologie",
                        "Réanimation",
                      ]) ||
                    (userRole === "Médecin" &&
                      userAccessLevel === "Affichage-Modification" && [
                        "Cuomo",
                        "Ctcv",
                        "Cardiologie",
                        "Réanimation",
                      ]) ||
                    (userRole === "Secrétaire" &&
                      userAccessLevel === "Affichage-Modification" && [
                        "Cuomo",
                        "Ctcv",
                        "Cardiologie",
                        "Réanimation",
                      ]) ||
                    (userRole === "Infirmier(e)" &&
                      userAccessLevel === "Affichage-Modification" && [
                        "Cuomo",
                        "Ctcv",
                        "Cardiologie",
                        "Réanimation",
                      ]) ||
                    (userRole === "Archiviste" &&
                      userAccessLevel === "Affichage-Modification" && [
                        "Cuomo",
                        "Ctcv",
                        "Cardiologie",
                        "Réanimation",
                      ]) ||
                    (userRole === "Gestionnaire" &&
                      userAccessLevel === "Affichage-Modification" && [
                        "Cuomo",
                        "Ctcv",
                        "Cardiologie",
                        "Réanimation",
                      ]) ||
                    (userRole === "Etudiant(e)" &&
                      userAccessLevel === "Affichage-Modification" && [
                        "Cuomo",
                        "Ctcv",
                        "Cardiologie",
                        "Réanimation",
                      ]) ||
                      (userRole === "Archiviste" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) |
                      (userRole === "Etudiant(e)" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) ||
                      (userRole === "Gestionnaire" && userAccessLevel === "Affichage-Modification-Suppression" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
          
          
                      (userRole === "Archiviste" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"]  ) ||
                      (userRole === "Gestionnaire" && userAccessLevel === "Administrateur" && ["Cuomo","Ctcv","Cardiologie","Réanimation"] ) 
                       
                    ? "none"
                    : "block",
              }}
            >
              Partager PDF
            </button>
            <button onClick={() => handleCuomoHelp(patient)} className="btn3">
              voir les détails
            </button>
            <button
              className="btn3"
              onClick={() => {
                const selectElement = document.createElement('select');
                selectElement.style.borderRadius = '15px';
                selectElement.style.border = "none";
                selectElement.style.padding = '10px';
                selectElement.style.width = '100%';
                selectElement.style.marginBottom = '10px';
                selectElement.style.backgroundColor = '#f2f2f2';
                selectElement.style.color = '#333';

                selectElement.innerHTML = `
      <option value="">Sélectionnez un service</option>
      <option value="Cuomo">Cuomo</option>
      <option value="Ctcv">Ctcv</option>
      <option value="Cardiologie">Cardiologie</option>
      <option value="Réanimation">Réanimation</option>
    `;

                const dialog = document.createElement('dialog');
                dialog.appendChild(selectElement);
                dialog.style.borderRadius = '15px';
                dialog.style.border = "none";

                const buttonContainer = document.createElement('div');
                buttonContainer.style.marginTop = '10px';

                const confirmButton = document.createElement('button');
                confirmButton.textContent = 'Confirmer';
                confirmButton.style.borderRadius = '15px';
                confirmButton.style.border = "none";
                confirmButton.style.backgroundColor = '#007bff';
                confirmButton.style.color = '#fff';
                confirmButton.style.padding = '10px 20px';
                confirmButton.style.borderRadius = '15px';
                confirmButton.style.buttonShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
                confirmButton.style.hoverShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';

                confirmButton.style.marginRight = '10px';

                confirmButton.onclick = () => {
                  const selectedService = selectElement.value;
                  if (selectedService) {
                    handleTransferPatient(patient._id, selectedService);
                    dialog.close();
                  } else {
                    toast.error("Veuillez sélectionner un service");
                  }
                };

                const cancelButton = document.createElement('button');
                cancelButton.textContent = 'Annuler';
                cancelButton.style.borderRadius = '15px';
                cancelButton.style.border = "none";
                cancelButton.style.backgroundColor = '#808080';
                cancelButton.style.color = '#fff';
                cancelButton.style.padding = '10px 20px';

                cancelButton.onclick = () => {
                  dialog.close();
                };

                buttonContainer.appendChild(confirmButton);
                buttonContainer.appendChild(cancelButton);
                dialog.appendChild(buttonContainer);
                document.body.appendChild(dialog);
                dialog.showModal();
              }}
              style={{
                display:
                  localStorage.getItem("userName") === "Adm" ||
                    (userRole === "Médecin" &&
                      userAccessLevel === "Affichage-Modification-Suppression" &&
                      ["Cuomo", "Ctcv", "Cardiologie", "Réanimation"]) ||
                    (userRole === "Médecin" &&
                      userAccessLevel === "Administrateur" &&
                      ["Cuomo", "Ctcv", "Cardiologie", "Réanimation"]) ||
                      (userRole === "Admin" &&
                        userAccessLevel === "Administrateur" &&
                        ["Cuomo", "Ctcv", "Cardiologie", "Réanimation"])||
                        (userRole === "Admin" &&
                          userAccessLevel === "Affichage-Modification-Suppression" &&
                          ["Cuomo", "Ctcv", "Cardiologie", "Réanimation"])||
                          (userRole === "Admin" &&
                            userAccessLevel === "Affichage-Modification" &&
                            ["Cuomo", "Ctcv", "Cardiologie", "Réanimation"])||
                            (userRole === "Admin" &&
                              userAccessLevel === "Affichage" &&
                              ["Cuomo", "Ctcv", "Cardiologie", "Réanimation"])
                    ? "block"
                    : "none",
              }}
            >
              Transférer
            </button>


          </li>
        ))}
      </ul>
      <Modal
  isOpen={showCuomoModal}
  onRequestClose={() => setShowCuomoModal(false)}
  contentLabel="Détails du Patient"
  style={{
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      borderRadius: '15px',
      padding: '20px',
      maxWidth: '800px',
      width: '90%',
      maxHeight: '80vh',
      overflowY: 'auto'
    }
  }}
>
  <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>
    Détails Complets du Patient
  </h2>
  {selectedPatientForCuomo && (
    <div className="container" style={{ fontSize: '16px', lineHeight: '1.6' }}>
      <div className="row patient-details-grid">
        <div className="col-12 col-md-6 col-lg-4">
          <p><strong>Patient:</strong> {selectedPatientForCuomo.nom}</p>
          <p><strong>Service:</strong> {selectedPatientForCuomo.service}</p>
          <p><strong>Numéro de dossier:</strong> {selectedPatientForCuomo.dossierNumber}</p>
          <p><strong>Année du dossier:</strong> {selectedPatientForCuomo.anneeDossier}</p>
          <p><strong>Année d'intervention:</strong> {selectedPatientForCuomo.anneeIntervention}</p>
          <p><strong>Age:</strong> {formatDate(selectedPatientForCuomo.age)}</p>
          <p><strong>Genre:</strong> {selectedPatientForCuomo.genre}</p>
          <p><strong>TA:</strong> {selectedPatientForCuomo.ta}</p>
          <p><strong>FC:</strong> {selectedPatientForCuomo.fc}</p>
          <p><strong>SPO2:</strong> {selectedPatientForCuomo.spo2}</p>
          <p><strong>Température:</strong> {selectedPatientForCuomo.temperature}</p>
          <p><strong>Poids:</strong> {selectedPatientForCuomo.poids}</p>
          <p><strong>Taille:</strong> {selectedPatientForCuomo.taille}</p>
          <p><strong>Groupe Sanguin:</strong> {selectedPatientForCuomo.groupeSanguin}</p>
          <p><strong>Nationalité:</strong> {selectedPatientForCuomo.nationalite}</p>
          <p><strong>Profession:</strong> {selectedPatientForCuomo.profession}</p>
          <p><strong>Téléphone:</strong> {selectedPatientForCuomo.numeroDeTelephone}</p>
          <p><strong>Email:</strong> {selectedPatientForCuomo.addressEmail}</p>
          <p><strong>Adresse:</strong> {selectedPatientForCuomo.addressDomicile}</p>
          <p><strong>Salle:</strong> {selectedPatientForCuomo.salle}</p>
          <p><strong>Lit:</strong> {selectedPatientForCuomo.lit}</p>
          <p><strong>Correspondant:</strong> {selectedPatientForCuomo.correspondant}</p>
          <p><strong>Date d'entrée:</strong> {new Date(selectedPatientForCuomo.dateEntree).toLocaleDateString()}</p>
          <p><strong>Date de sortie:</strong> {selectedPatientForCuomo.dateSortie && new Date(selectedPatientForCuomo.dateSortie).toLocaleDateString()}</p>
          <p><strong>Diagnostic:</strong> {selectedPatientForCuomo.diagnostic}</p>
          <p><strong>Statut:</strong> {selectedPatientForCuomo.statut}</p>
          <p><strong>Pathologie:</strong> {selectedPatientForCuomo.pathologie}</p>
          <p><strong>Vpa:</strong> {selectedPatientForCuomo.pathologie}</p>
          <p><strong>Validation:</strong> {selectedPatientForCuomo.vpa}</p>
          <p><strong>Raison de consultation:</strong> {selectedPatientForCuomo.consultationReason}</p>
          <p><strong>Traitement à l'entrée:</strong> {selectedPatientForCuomo.traitementEntree}</p>
          <p><strong>Traitement à la sortie:</strong> {selectedPatientForCuomo.traitementSortie}</p>
          <p><strong>Suites simples:</strong> {selectedPatientForCuomo.simpleSuites}</p>
          <p><strong>Complications:</strong> {selectedPatientForCuomo.complications}</p>
          <p><strong>Geste:</strong> {selectedPatientForCuomo.geste}</p>
          <p><strong>Opérateur:</strong> {selectedPatientForCuomo.operateur}</p>
          <p><strong>Histoire:</strong> {selectedPatientForCuomo.histoire}</p>
          <p><strong>Antécédents:</strong> {selectedPatientForCuomo.antecedents}</p>
          <p><strong>Traitement:</strong> {selectedPatientForCuomo.traitement}</p>
          <p><strong>ECRT:</strong> {selectedPatientForCuomo.ecrt}</p>
          <p><strong>ECG:</strong> {selectedPatientForCuomo.ecg}</p>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <p><strong>ETT:</strong> {selectedPatientForCuomo.ett}</p>
          <p><strong>TT:</strong> {selectedPatientForCuomo.tt}</p>
          <p><strong>Coronarographie:</strong> {selectedPatientForCuomo.coronarographie}</p>
          <p><strong>Autres examens:</strong> {selectedPatientForCuomo.autresExamens}</p>
          <p><strong>Biologie:</strong> {selectedPatientForCuomo.biologie}</p>
          <p><strong>CRO:</strong> {selectedPatientForCuomo.cro}</p>
          <p><strong>Rx thorax post:</strong> {selectedPatientForCuomo.rxthoraxPost}</p>
          <p><strong>ECG post:</strong> {selectedPatientForCuomo.ecgPost}</p>
          <p><strong>Echoscopie post:</strong> {selectedPatientForCuomo.echoscopiePost}</p>
          <p><strong>Biologie post:</strong> {selectedPatientForCuomo.biologiePost}</p>
          <p><strong>observation:</strong> {selectedPatientForCuomo.observation}</p>
          <p><strong>imagerie:</strong> {selectedPatientForCuomo.imagerie}</p>
          <p><strong>biologiePostOp:</strong> {selectedPatientForCuomo.biologiePostOp}</p>
          <p><strong>Suite:</strong> {selectedPatientForCuomo.suite}</p>
          <p><strong>Suivi:</strong> {selectedPatientForCuomo.suivi}</p>
          <p><strong>Manageur:</strong> {selectedPatientForCuomo.manageur}</p>
        </div>
      </div>

      

      <div className="text-center mt-4">
        <button
          onClick={() => setShowCuomoModal(false)}
          className="btn btn-primary"
          style={{
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
        >
          Fermer
        </button>
      </div>
    </div>
  )}
</Modal>



      {/* Afficher les détails du patient sélectionné en bas */}

      {expandedPatientId && (
        <div className="expanded-patient-details">
          {renderPatientDetails(
            patients.find((patient) => patient._id === expandedPatientId)
          )}
        </div>
      )}
      {/*{alerts.map((alert, index) => (
        <Alert key={index} message={alert} style={{ paddinf:"15px" }} />
      ))} */}
      <ToastContainer />
      {/*      <Alerts alerts={alerts} setAlerts={setAlerts} />
       */}
    </div>
  );
};

export default Patients;
