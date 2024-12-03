import React, { useState ,useEffect} from 'react';

const FilePreview = ({ file }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileExtension = file.name.split('.').pop().toLowerCase();

  const renderPreview = () => {
    switch (fileExtension) {
      case 'pdf':
        return (
          <iframe
            src={file.link}
            width="100%"
            height="500px"
            title={file.name}
            style={{ border: '1px solid #ddd' }}
          />
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <>
            <img
              src={file.link}
              alt={file.name}
              onClick={() => setIsModalOpen(true)}
              style={{
                maxWidth: '100%',
                maxHeight: '300px',
                cursor: 'pointer',
                borderRadius: '5px',
                border: '1px solid #ddd',
              }}
            />
            {/* Modal pour agrandir l'image */}
            {isModalOpen && (
              <div
                onClick={() => setIsModalOpen(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1000,
                }}
              >
                <img
                  src={file.link}
                  alt={file.name}
                  style={{
                    maxWidth: '90%',
                    maxHeight: '90%',
                    borderRadius: '5px',
                    boxShadow: '0px 0px 15px rgba(0,0,0,0.5)',
                  }}
                />
              </div>
            )}
          </>
        );
      case 'txt':
      case 'doc':
      case 'docx':
        return (
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(file.link)}&embedded=true`}
            width="100%"
            height="500px"
            title={file.name}
          />
        );
      default:
        return <p>Aperçu non disponible pour ce type de fichier</p>;
    }
  };
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000); // 1 second

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
  return (
    <div style={{ margin: '10px 0', padding: '10px', border: '1px solid #eee', borderRadius: '5px', backgroundColor: '#fafafa' }}>
      <h4>{file.name}</h4>
      {renderPreview()}
    </div>
  );
};

export default FilePreview;
