import React, { useState, useEffect } from "react";
import axios from "axios";

const FileManager = () => {
  const [files, setFiles] = useState([]);
  const [titles, setTitles] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Charger les fichiers depuis le backend
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get("http://localhost:5002/files");
        setFiles(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des fichiers", error);
      }
    };

    fetchFiles();
  }, []);

  // Sélectionner des fichiers
  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  // Télécharger les fichiers vers le backend
  const uploadFiles = async () => {
    setLoading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('files', file));

    try {
      const response = await axios.post("http://localhost:5002/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFiles([...files, ...response.data]);
      setSelectedFiles([]);
      alert("Fichiers envoyés avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'upload", error);
      alert("Erreur lors de l'upload des fichiers");
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un fichier
  const handleDelete = async (fileId) => {
    const confirmation = window.confirm("Êtes-vous sûr de vouloir supprimer ce fichier ?");
    if (confirmation) {
      try {
        await axios.delete(`http://localhost:5002/files/${fileId}`);
        setFiles(files.filter((file) => file._id !== fileId));
        alert("Fichier supprimé avec succès");
      } catch (error) {
        console.error("Erreur lors de la suppression", error);
        alert("Erreur lors de la suppression du fichier");
      }
    }
  };

  // Mettre à jour le titre d'un fichier
  const handleTitleChange = async (fileId, newTitle) => {
    try {
      const response = await axios.put(`http://localhost:5002/files/${fileId}/title`, { title: newTitle });
      setTitles({ ...titles, [fileId]: response.data.title });
      alert("Titre mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du titre", error);
    }
  };

  return (
    <div>
      <h2>Gestionnaire de fichiers</h2>

      {/* Sélectionner des fichiers */}
      <input
        type="file"
        multiple
        onChange={handleFileChange}
      />

      {/* Afficher les fichiers */}
      <div>
        {files.map((file) => (
          <div key={file._id}>
            <h3>
              <input
                type="text"
                value={titles[file._id] || file.title}
                onChange={(e) => handleTitleChange(file._id, e.target.value)}
                placeholder="Titre du fichier"
              />
            </h3>
            <p>{file.originalname}</p>
            <button onClick={() => handleDelete(file._id)}>Supprimer</button>
          </div>
        ))}
      </div>

      {/* Bouton pour uploader les fichiers */}
      <button onClick={uploadFiles} disabled={loading}>
        {loading ? "Envoi en cours..." : "Envoyer vers MongoDB"}
      </button>
    </div>
  );
};

export default FileManager;
