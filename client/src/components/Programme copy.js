import React, { useState, useEffect } from 'react';
import DropboxChooser from 'react-dropbox-chooser';
import { useNavigate } from "react-router-dom";
import { saveAs } from 'file-saver';

const FileManager = () => {
const [files, setFiles] = useState([]);
const navigate = useNavigate();

// Charger les fichiers depuis localStorage lors du montage du composant
useEffect(() => {
const savedFiles = localStorage.getItem('dropboxFiles');
if (savedFiles) {
setFiles(JSON.parse(savedFiles));
}
}, []);

// Sauvegarder les fichiers dans localStorage chaque fois qu'ils changent
useEffect(() => {
localStorage.setItem('dropboxFiles', JSON.stringify(files));
}, [files]);

const handleDropboxSuccess = (selectedFiles) => {
const newFiles = selectedFiles.map(file => ({
id: Date.now() + Math.random(),
name: file.name,
link: file.link,
title: '',
comment: '',
timestamp: new Date().toISOString()
}));
setFiles([...files, ...newFiles]);
};

const handleTitleChange = (id, newTitle) => {
setFiles(files.map(file =>
file.id === id ? { ...file, title: newTitle } : file
));
};

const handleCommentChange = (id, newComment) => {
setFiles(files.map(file =>
file.id === id ? { ...file, comment: newComment } : file
));
};

const handleDelete = (id) => {
if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
setFiles(files.filter(file => file.id !== id));
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
// Redirige vers le lien dans une nouvelle fenêtre
window.open(link, '_blank');
};

const [loading, setLoading] = useState(true);

useEffect(() => {
const timer = setTimeout(() => {
setLoading(false);
}, 2000); // 2 secondes

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
<button className="btn btn-primary" onClick={() => navigate('/patients')}>
Retour à la page d'enregistrement
</button>

<div className="text-center mb-4">
<DropboxChooser
appKey="n76pxzyzj5clhqe"
success={handleDropboxSuccess}
multiselect={true}
extensions={['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.jpg', '.png']}
>
<button className="btn btn-primary">
Choisir les fichiers
</button>
</DropboxChooser>
</div>

<div className="row">
{files.map(file => (
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
<button onClick={() => handleDownload(file)} className="btn btn-success btn-sm me-2">
Télécharger
</button>
<button onClick={() => handleDelete(file.id)} className="btn btn-danger btn-sm">
Supprimer
</button>
</div>
</div>

<div className="file-info text-muted small">
<p><strong>Nom:</strong> {file.name}</p>
<p><strong>Date:</strong> {new Date(file.timestamp).toLocaleString()}</p>
<p><strong>Lien:</strong> <a href={file.link} target="_blank" rel="noopener noreferrer">{file.link}</a></p>
</div>

{/* Le bouton ouvre le lien dans une nouvelle fenêtre/tab */}
<button
className="btn btn-info btn-sm"
onClick={() => handleOpenLink(file.link)}
>
Ouvrir le lien
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