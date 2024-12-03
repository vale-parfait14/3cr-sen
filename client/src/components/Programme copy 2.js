import React, { useState, useEffect } from 'react';
import DropboxChooser from 'react-dropbox-chooser';
import { useNavigate } from "react-router-dom";
import { initializeApp } from 'firebase/app';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import FileViewer from 'react-doc-viewer';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import "./PatientStyle.css";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';

// Firebase Configuration
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

// Set pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FileManager = () => {
  const initialProgrammeData = {
    titre: '',
   
  };

  const [programmeData, setProgrammeData] = useState(initialProgrammeData);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [showProgrammes, setShowProgrammes] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProgrammess();
  }, []);

  const fetchProgrammess = async () => {
    const querySnapshot = await getDocs(collection(db, 'programmes'));
    const programmesData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setProgrammes(programmesData);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(programmes.map(programme => {
      const { files, id, ...programmeData } = programme;
      return programmeData;
    }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Programmes");
    XLSX.writeFile(workbook, "programmes_list.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = Object.keys(initialProgrammeData);
    const tableRows = programme.map(programme => {
      return Object.values(programme).filter((_, index) => index < tableColumn.length);
    });

    doc.autoTable({
      head: [tableRows.map(col => col.replace(/([A-Z])/g, ' $1').toUpperCase())],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 }
    });

    doc.save('programme_list.pdf');
  };

  const handleDropboxSelect = (files) => {
    const persistentFiles = files.map(file => ({
      ...file,
      timestamp: new Date().toISOString(),
      comment: ''
    }));
    setSelectedFiles([...selectedFiles, ...persistentFiles]);
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setProgrammeData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleCommentChange = (index, comment) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles[index].comment = comment;
    setSelectedFiles(updatedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newProgramme = {
      ...programmeData,
      files: selectedFiles,
      lastModified: new Date().toISOString(),
    };

    try {
      if (editingIndex !== null) {
        await updateDoc(doc(db, 'programmes', editingIndex), newProgramme);
        setEditingIndex(null);
      } else {
        await addDoc(collection(db, 'programmes'), newProgramme);
      }
      setProgrammeData(initialProgrammeData);
      setSelectedFiles([]);
      await fetchProgrammess();
    } catch (error) {
      console.error("Error saving programme:", error);
    }
  };

  const handleDeleteProgramme = async (id) => {
    if (window.confirm('Are you sure you want to delete this programme?')) {
      await deleteDoc(doc(db, 'programmes', id));
      setProgrammes(programmes.filter(programme => programme.id !== id));
    }
  };

  const handleEditProgramme = (programme) => {
    setProgrammeData(programme);
    setSelectedFiles(programme.files || []);
    setEditingIndex(programme.id);
  };

  const handleDeleteFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handlePreview = (file) => {
    setPreviewFile(file);
  };

  const closePreview = () => {
    setPreviewFile(null);
  };
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 900); // 1 second

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
            style={{ width: '200px',  borderRadius:"200px"}}
          />
          <div className="loading-text text-muted">Chargement en cours...</div>
        </div>
      </div>
    );
  }
  const getFileType = (fileName) => {
    return fileName.split('.').pop().toLowerCase();
  };

  const renderTableView = () => (
    <div className="table-responsive">
      <div className="export-buttons mb-3">
        <button onClick={exportToExcel} className="btn btn-success me-2">
          Exporter en  fichier Excel
        </button>
        
      </div>
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            {Object.keys(initialProgrammeData).map(key => (
              <th key={key}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {programmes.map(programme => (
            <tr key={programme.id}>
              {Object.keys(initialProgrammeData).map(key => (
                <td key={key}>{programme[key]}</td>
              ))}
              <td>
                <button onClick={() => handleEditProgramme(programme)} className="btn btn-warning btn-sm me-1">
                  Modifier
                </button>
                <button onClick={() => handleDeleteProgramme(programme.id)} className="btn btn-danger btn-sm">
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const FilePreviewModal = ({ file, onClose }) => {
    if (!file) return null;
    const fileType = getFileType(file.name);

    return (
      <div className="preview-modal">
        <div className="preview-content">
          <button onClick={onClose} className="close-preview">×</button>
          <h3>{file.name}</h3>
          <div className="preview-container">
            {fileType === 'pdf' ? (
              <Document
                file={file.link}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              >
                <Page pageNumber={1} />
              </Document>
            ) : fileType === 'doc' || fileType === 'docx' ? (
              <iframe
                src={`https://docs.google.com/gview?url=${file.link}&embedded=true`}
                title={file.name}
                className="w-100"
                style={{ height: '400px' }}
              />
            ) : fileType === 'xls' || fileType === 'xlsx' ? (
              <iframe
                src={`https://docs.google.com/spreadsheets/d/e/2PACX-1vTgYQzAYnQcf_OgL9uF0dJm3l2eMjkDFp1xO7gyfBmtOGQ-Z3zEVhdz4AzkM9Pxs5AmfTbpU7xEHT3oVJw/pubhtml?widget=true&headers=false`}
                title={file.name}
                className="w-100"
                style={{ height: '400px' }}
              />
            ) : ['txt', 'jpg', 'jpeg', 'png', 'gif'].includes(fileType) ? (
              <FileViewer
                fileType={fileType}
                filePath={file.link}
                onError={(e) => console.log('Error in file-viewer:', e)}
              />
            ) : (
              <p>Preview not available for this file type</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="archive-container container">
      <h2 className="text-center mb-4">Programme Opératoire</h2>

      <button onClick={() => setShowForm(!showForm)} className="toggle-button btn btn-primary mb-3">
        {showForm ? 'Masquer le formulaire' : 'Afficher le formulaire'}
      </button>
      <button onClick={() => navigate("/patients")} className="toggle-button btn btn-primary mb-3">
        Retour à la page d'accueil
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="patient-form d-flex flex-column">
          <div className="row">
            {Object.keys(programmeData).map((key) => (
              key !== 'files' && (
                <div key={key} className="col-md-6 mb-8">
                  <label htmlFor={key}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()} :</label>
                  <input
                    type="text"
                    id={key}
                    name={key}
                    value={programmeData[key]}
                    onChange={handleFieldChange}
                    required
                    className="form-control"
                  />
                </div>
              )
            ))}
          </div>

          <div className="file-section">
            {selectedFiles.length > 0 && (
              <div>
                <h4>Fichiers sélectionnés :</h4>
                <ul>
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="file-item">
                      <div className="file-info d-flex justify-content-center align-items-center">
                        <a href={file.link} target="_blank" rel="noopener noreferrer">
                          {file.name}
                        </a>
                        <div>
                          <button onClick={() => handlePreview(file)} className="btn btn-info btn-sm mx-1">
                            Aperçu
                          </button>
                          <button onClick={() => handleDeleteFile(index)} className="btn btn-danger btn-sm">
                            Supprimer
                          </button>
                        </div>
                      </div>
                      <div>
                        <label>Commentaire :</label>
                        <input
                          type="text"
                          value={file.comment}
                          onChange={(e) => handleCommentChange(index, e.target.value)}
                          className="form-control"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="dropbox-section d-flex justify-content-around mb-3">
              <DropboxChooser
                appKey="n76pxzyzj5clhqe"
                success={handleDropboxSelect}
                multiselect={true}
              >
                <button onClick={(e) => e.preventDefault()} className="dropbox-button btn btn-success">
                  Ajouter des fichiers
                </button>
              </DropboxChooser>

              <button type="submit" className="submit-button btn btn-primary">
                {editingIndex !== null ? 'Mettre à jour le programme' : 'Ajouter le programme'}
              </button>
            </div>
          </div>
        </form>
      )}

      <button onClick={() => setShowProgrammes(!showProgrammes)} className="toggle-button btn btn-secondary mt-4">
        {showProgrammes ? 'Masquer les programmes enregistrés' :
        'Afficher les programmes enregistrés'}
        </button>
  
        {showProgrammes && programmes.length > 0 && (
          <div className="patients-list">
            <h3>programmes enregistrés</h3>
            <div className="view-toggle mb-3">
              <button 
                onClick={() => setViewMode('list')} 
                className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
              >
                Vue Liste
              </button>
              <button 
                onClick={() => setViewMode('table')} 
                className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
              >
                Vue Tableau
              </button>
            </div>
  
            {viewMode === 'table' ? (
              renderTableView()
            ) : (
              <ul className="list-group">
                {programmes.map((programme) => (
                  <li key={programme.id} className="patient-item list-group-item mb-3">
                    {Object.entries(programme).map(([key, value]) => (
                      key !== 'files' && key !== 'id' && (
                        <p key={key}><strong>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}:</strong> {value}</p>
                      )
                    ))}
  
                    {programme.files && programme.files.length > 0 && (
                      <div className="patient-files">
                        <strong>Fichiers associés :</strong>
                        <ul>
                          {programme.files.map((file, fileIndex) => (
                            <li key={fileIndex} className="file-item">
                              <div className="file-info d-flex justify-content-between">
                                <a href={file.link} target="_blank" rel="noopener noreferrer">
                                  {file.name}
                                </a>
                                
                              </div>
                              {file.comment && (
                                <p><strong>Commentaire:</strong> {file.comment}</p>
                              )}
                              <small>Ajouté le : {new Date(file.timestamp).toLocaleString()}</small>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
  
                    <div className="patient-actions">
                      <button onClick={() => handleEditProgramme(programme)} className="btn btn-warning btn-sm mx-1">
                        Modifier
                      </button>
                      <button onClick={() => handleDeleteProgramme(programme.id)} className="btn btn-danger btn-sm">
                        Supprimer
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
  
        {previewFile && (
          <FilePreviewModal
            file={previewFile}
            onClose={closePreview}
          />
        )}
      </div>
    );
  };
  
  export default FileManager;
  