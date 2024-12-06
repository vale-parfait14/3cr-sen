import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import DropboxChooser from 'react-dropbox-chooser';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDSQ0cQa7TISpd_vZWVa9dWMzbUUl-yf38",
  authDomain: "basecenterdb.firebaseapp.com",
  projectId: "basecenterdb",
  storageBucket: "basecenterdb.firebasestorage.app",
  messagingSenderId: "919766148380",
  appId: "1:919766148380:web:30db9986fa2cd8bb7106d9"
};

// Dropbox configuration
const APP_KEY = '23rlajqskcae2gk'; // Replace with your Dropbox app key

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Message Countdown Component
const MessageCountdown = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState(60000);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const expiration = new Date(expiresAt);
      const secondsLeft = Math.max(0, Math.floor((expiration - now) / 60000));
      setTimeLeft(secondsLeft);
    }, 60000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  return <small className="message-countdown">{timeLeft}s</small>;
};

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [dropboxFile, setDropboxFile] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    userName: localStorage.getItem('userName') || '',
    userService: localStorage.getItem('userService') || ''
  });

  const handleDropboxSuccess = async (files) => {
    try {
      const file = files[0];
      await addDoc(collection(db, 'messages'), {
        text: `Fichier partager: ${file.name}`,
        fileURL: file.link,
        fileName: file.name,
        timestamp: new Date().toISOString(),
        sender: 'user',
        createdAt: new Date(),
        userName: userInfo.userName,
        userService: userInfo.userService,
        expiresAt: new Date(Date.now() + 60000)
      });
      
      setDropboxFile(null);
    } catch (error) {
      console.error("Error sharing Dropbox file:", error);
      alert('Error sharing file');
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  useEffect(() => {
    const handlePopState = (e) => {
      window.history.pushState(null, "", window.location.href);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = [];
      snapshot.forEach((doc) => {
        const message = { id: doc.id, ...doc.data() };
        if (message.expiresAt && new Date(message.expiresAt) < new Date()) {
          deleteMessage(doc.id);
        } else {
          messageList.push(message);
        }
      });
      setMessages(messageList);
      setIsLoading(false);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      try {
        const docRef = await addDoc(collection(db, 'messages'), {
          text: newMessage,
          timestamp: new Date().toISOString(),
          sender: 'user',
          createdAt: new Date(),
          userName: userInfo.userName,
          userService: userInfo.userService,
          expiresAt: new Date(Date.now() + 60000)
        });
        
        setTimeout(() => {
          deleteMessage(docRef.id);
        }, 60000);
        
        setNewMessage('');
      } catch (error) {
        console.error("Error sending message:", error);
        alert('Error sending message');
      }
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <Card className="chat-card shadow">
            <Card.Header style={{ backgroundColor: "rgb(28, 211, 211)" }} className="text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Chat en direct</h5>
              </div>
            </Card.Header>
            
            <Card.Body className="chat-messages p-3">
              {isLoading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`d-flex ${message.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                  >
                    <div className={`message-bubble ${message.sender === 'user' ? 'sent' : 'received'} mb-2`}>
                      <div className="message-user-info">
                        <small>{message.userName} - {message.userService}</small>
                      </div>
                      <div className="message-text">{message.text}</div>
                      {message.fileURL && (
                        <div className="file-attachment">
                          <a href={message.fileURL} target="_blank" rel="noopener noreferrer">
                            📎 {message.fileName}
                          </a>
                        </div>
                      )}
                      <div className="message-footer">
                        <small className="message-time">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </small>
                        <MessageCountdown expiresAt={message.expiresAt} />
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </Card.Body>

            <Card.Footer className="bg-white">
              <Form onSubmit={handleSendMessage}>
                <Row className="g-2">
                  <Col xs={7} sm={8}>
                    <Form.Control
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Écrivez votre message..."
                      className="rounded-pill"
                    />
                  </Col>
                  <Col xs={3} sm={2}>
                    <DropboxChooser 
                      appKey={APP_KEY}
                      success={handleDropboxSuccess}
                      cancel={() => console.log('Cancelled')}
                      multiselect={false}
                    >
                      <Button
                        variant="secondary"
                        className="rounded-pill w-100"
                        style={{ backgroundColor: "#0061fe", border: "none" }}
                      >
                        <i className="bi bi-dropbox">📁</i>
                      </Button>
                    </DropboxChooser>
                  </Col>
                  <Col xs={2} sm={2}>
                    <Button
                      type="submit"
                      variant="primary" 
                      className="rounded-pill w-80"
                      style={{ backgroundColor: "rgb(28, 211, 211)", border: "none" }}
                    >
                      <i className="bi bi-send-fill">Envoyer</i>
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        .chat-messages {
          height: 400px;
          overflow-y: auto;
          background-color: #f8f9fa;
        }
        .message-bubble {
          max-width: 70%;
          padding: 10px 15px;
          border-radius: 15px;
          margin-bottom: 10px;
          word-wrap: break-word;
        }
        .sent {
          background-color: rgb(28, 211, 211);
          color: white;
        }
        .received {
          background-color: #e9ecef;
        }
        .message-time {
          font-size: 0.75rem;
          opacity: 0.8;
        }
        .message-user-info {
          font-size: 0.8rem;
          margin-bottom: 4px;
          opacity: 0.8;
        }
        .sent .message-user-info {
          color: #fff;
        }
        .received .message-user-info {
          color: #666;
        }
        .message-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 5px;
        }
        .message-countdown {
          font-size: 0.75rem;
          opacity: 0.8;
        }
        .btn-primary:hover {
          background-color: rgb(25, 190, 190) !important;
          transform: scale(1.05);
          transition: all 0.2s;
        }
        .dropbox-button {
          background-color: #0061fe;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .dropbox-button:hover {
          background-color: #0052d9;
          transform: scale(1.05);
        }
        .file-attachment {
          margin-top: 8px;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }
      `}</style>
    </Container>
  );
};

export default ChatComponent;
