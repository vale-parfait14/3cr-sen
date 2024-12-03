import React, { useState, useEffect } from 'react';
import axios from 'axios';
import mammoth from 'mammoth';

const WordFileViewer = ({ file }) => {
  const [content, setContent] = useState(null);

  useEffect(() => {
    const loadWordContent = async () => {
      const response = await axios.get(`http://localhost:5002/files/${file._id}`, { responseType: 'arraybuffer' });
      const arrayBuffer = response.data;
      mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
        .then((result) => setContent(result.value))
        .catch((err) => console.error("Erreur de conversion Word", err));
    };

    loadWordContent();
  }, [file._id]);

  return <div dangerouslySetInnerHTML={{ __html: content }} />;
};

export default WordFileViewer;
