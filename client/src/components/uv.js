import React, { useState } from 'react';
import DropboxChooser from 'react-dropbox-chooser';

const DropboxFileChooser = () => {
  // Créer un état pour stocker les fichiers sélectionnés pour chaque bouton
  const [files, setFiles] = useState(Array(15).fill(null));

  const handleFileSelect = (index, file) => {
    const newFiles = [...files];
    newFiles[index] = file;
    setFiles(newFiles);
  };

  const renderFileList = () => {
    return (
      <div>
        <h3>Fichiers sélectionnés :</h3>
        <ul>
          {files.map((file, index) => (
            file ? (
              <li key={index}>
                <strong>Button {index + 1}:</strong> {file.name} (ID: {file.id})
              </li>
            ) : null
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div>
      <h1>Sélectionnez des fichiers Dropbox</h1>
      
      {/* Générer 15 boutons, chacun avec un DropboxChooser distinct */}
      {Array.from({ length: 15 }, (_, index) => (
        <div key={index}>
          <button>
            Choisir un fichier pour le bouton {index + 1}
          </button>
          <DropboxChooser 
            appKey="YOUR_APP_KEY" // Remplacez par votre App Key Dropbox
            success={(files) => handleFileSelect(index, files[0])} // Prendre le premier fichier sélectionné
            cancel={() => console.log('Annulation')}
          />
        </div>
      ))}

      {renderFileList()} {/* Afficher la liste des fichiers choisis */}
    </div>
  );
};

export default DropboxFileChooser;
