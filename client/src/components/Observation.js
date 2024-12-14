import React, { useState, useEffect } from 'react';
import DropboxChooser from 'react-dropbox-chooser';
import { saveAs } from 'file-saver';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

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

const Observation = () => {
  const [filesobs, setFilesobs] = useState([]);
  const [comment, setComment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editComment, setEditComment] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'filesobs'), (snapshot) => {
      const filesobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFilesobs(filesobsData);
    });

    return () => unsubscribe();
  }, []);

  const handleFileSuccess = (filesobs) => {
    const file = filesobs[0];
    addDoc(collection(db, 'filesobs'), {
      name: file.name,
      link: file.link,
      comment: comment,
      timestamp: new Date().toISOString()
    });
    setComment('');
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'filesobs', id));
  };

  const handleEdit = (id, currentComment) => {
    setEditingId(id);
    setEditComment(currentComment);
  };

  const saveEdit = async (id) => {
    await updateDoc(doc(db, 'filesobs', id), {
      comment: editComment
    });
    setEditingId(null);
    setEditComment('');
  };

  const viewFile = (link) => {
    window.open(link, '_blank');
  };

  const downloadFile = async (link, filename) => {
    const response = await fetch(link);
    const blob = await response.blob();
    saveAs(blob, filename);
  };

  const filteredFiles = filesobs.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <DropboxChooser 
            appKey="23rlajqskcae2gk"
            success={handleFileSuccess}
            cancel={() => console.log('cancelled')}
            multiselect={false}
          >
            <button className="btn btn-primary w-100">
              <i className="bi bi-cloud-upload me-2"></i>Choose from Dropbox
            </button>
          </DropboxChooser>
        </div>

        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment"
            className="form-control"
          />
        </div>

        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search files..."
            className="form-control"
          />
        </div>
      </div>

      <div className="row">
        {filteredFiles.map(file => (
          <div key={file.id} className="col-12 col-lg-6 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{file.name}</h5>
                
                {editingId === file.id ? (
                  <div className="mb-3">
                    <input
                      type="text"
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      className="form-control mb-2"
                    />
                    <button
                      onClick={() => saveEdit(file.id)}
                      className="btn btn-success"
                    >
                      <i className="bi bi-check-lg me-2"></i>Save
                    </button>
                  </div>
                ) : (
                  <p className="card-text">{file.comment}</p>
                )}

                <div className="btn-group">
                  <button
                    onClick={() => viewFile(file.link)}
                    className="btn btn-primary"
                  >
                    <i className="bi bi-eye me-2"></i>View
                  </button>
                  <button
                    onClick={() => downloadFile(file.link, file.name)}
                    className="btn btn-success"
                  >
                    <i className="bi bi-download me-2"></i>Download
                  </button>
                  <button
                    onClick={() => handleEdit(file.id, file.comment)}
                    className="btn btn-warning"
                  >
                    <i className="bi bi-pencil me-2"></i>Edit
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="btn btn-danger"
                  >
                    <i className="bi bi-trash me-2"></i>Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Observation;
