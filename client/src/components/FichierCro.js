import React, { useState, useEffect } from 'react';
import DropboxChooser from 'react-dropbox-chooser';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';

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


const SurgicalForm = () => {
  const [formData, setFormData] = useState({
    commentType: 'Normal',
    customComment: '',
    files: [],
    anesthesists: '',
    surgeons: '',
    diagnosis: '',
    operativeIndication: ''
  });
  
  const [savedRecords, setSavedRecords] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const commentTypes = ['Normal', 'Mission Canadienne', 'Mission Suisse', 'Autre'];

  useEffect(() => {
    // Fetch saved records from Firestore when the component mounts
    const fetchRecords = async () => {
      const querySnapshot = await getDocs(collection(db, "surgicalForms"));
      const records = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedRecords(records);
    };
    fetchRecords();
  }, []);

  const handleDropboxSuccess = (files) => {
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));
  };

  const removeFile = (linkToRemove) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter(file => file.link !== linkToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditing) {
      // Update record in Firestore
      const recordRef = doc(db, "surgicalForms", editingId);
      await updateDoc(recordRef, formData);

      setSavedRecords(prev =>
        prev.map(record =>
          record.id === editingId ? { ...formData, id: editingId } : record
        )
      );
      setIsEditing(false);
      setEditingId(null);
    } else {
      // Add new record to Firestore
      const newRecordRef = await addDoc(collection(db, "surgicalForms"), formData);
      setSavedRecords(prev => [
        ...prev, 
        { ...formData, id: newRecordRef.id }
      ]);
    }

    setFormData({
      commentType: 'Normal',
      customComment: '',
      files: [],
      anesthesists: '',
      surgeons: '',
      diagnosis: '',
      operativeIndication: ''
    });
  };

  const editRecord = (record) => {
    setFormData(record);
    setIsEditing(true);
    setEditingId(record.id);
  };

  const deleteRecord = async (id) => {
    // Delete record from Firestore
    await deleteDoc(doc(db, "surgicalForms", id));

    setSavedRecords(prev => prev.filter(record => record.id !== id));
  };

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Type de commentaire:</label>
          <select
            value={formData.commentType}
            onChange={(e) => setFormData(prev => ({ ...prev, commentType: e.target.value }))}
            className="w-full p-2 border rounded"
          >
            {commentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {formData.commentType === 'Autre' && (
          <div>
            <label className="block mb-2">Commentaire personnalisé:</label>
            <textarea
              value={formData.customComment}
              onChange={(e) => setFormData(prev => ({ ...prev, customComment: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
        )}

        <div>
          <label className="block mb-2">Fichiers:</label>
          <DropboxChooser
            appKey="gmhp5s9h3aup35v"
            success={handleDropboxSuccess}
            cancel={() => console.log('Cancelled')}
            multiselect={true}
          >
            <button type="button" className="bg-blue-500 text-white p-2 rounded">
              Choisir des fichiers
            </button>
          </DropboxChooser>

          <div className="mt-2">
            {formData.files.map(file => (
              <div key={file.link} className="flex items-center gap-2">
                <a href={file.link} target="_blank" rel="noopener noreferrer">
                  {file.name}
                </a>
                <button
                  type="button"
                  onClick={() => removeFile(file.link)}
                  className="text-red-500"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-2">Anesthésiste(s):</label>
          <input
            type="text"
            value={formData.anesthesists}
            onChange={(e) => setFormData(prev => ({ ...prev, anesthesists: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-2">Chirurgien(s):</label>
          <input
            type="text"
            value={formData.surgeons}
            onChange={(e) => setFormData(prev => ({ ...prev, surgeons: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-2">Diagnostic:</label>
          <input
            type="text"
            value={formData.diagnosis}
            onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-2">Indication Opératoire:</label>
          <input
            type="text"
            value={formData.operativeIndication}
            onChange={(e) => setFormData(prev => ({ ...prev, operativeIndication: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-green-500 text-white p-2 rounded"
        >
          {isEditing ? 'Mettre à jour' : 'Enregistrer'}
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Enregistrements</h2>
        {savedRecords.map(record => (
          <div key={record.id} className="border p-4 mb-4 rounded">
            <p>Type de commentaire: {record.commentType}</p>
            {record.commentType === 'Autre' && <p>Commentaire: {record.customComment}</p>}
            <p>Anesthésiste(s): {record.anesthesists}</p>
            <p>Chirurgien(s): {record.surgeons}</p>
            <p>Diagnostic: {record.diagnosis}</p>
            <p>Indication Opératoire: {record.operativeIndication}</p>
            <div className="mt-2">
              <button
                onClick={() => editRecord(record)}
                className="bg-yellow-500 text-white p-2 rounded mr-2"
              >
                Modifier
              </button>
              <button
                onClick={() => deleteRecord(record.id)}
                className="bg-red-500 text-white p-2 rounded"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SurgicalForm;
