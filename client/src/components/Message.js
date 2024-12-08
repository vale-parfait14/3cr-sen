import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Button, Card, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import DropboxChooser from 'react-dropbox-chooser';
import { FaTrashArrowUp } from "react-icons/fa6";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDSQ0cQa7TISpd_vZWVa9dWMzbUUl-yf38",
  authDomain: "basecenterdb.firebaseapp.com",
  projectId: "basecenterdb",
  storageBucket: "basecenterdb.firebasestorage.app",
  messagingSenderId: "919766148380",
  appId: "1:919766148380:web:30db9986fa2cd8bb7106d9"
};

const APP_KEY = '23rlajqskcae2gk';
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CommentModal = ({ show, onClose, onSubmit, message, commentText, setCommentText }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Ajouter un commentaire</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="original-content mb-3 p-3 bg-light rounded">
          {message?.fileName ? (
            <p className="mb-0"><strong>Fichier:</strong> {message.fileName}</p>
          ) : (
            <p className="mb-0"><strong>Message:</strong> {message?.text}</p>
          )}
        </div>
        <Form.Control
          as="textarea"
          rows={3}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Votre commentaire..."
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Annuler</Button>
        <Button variant="primary" onClick={onSubmit}>Commenter</Button>
      </Modal.Footer>
    </Modal>
  );
};

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [lastMessageId, setLastMessageId] = useState(null);
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
        text: `Fichier partagé: ${file.name}`,
        fileURL: file.link,
        fileName: file.name,
        timestamp: new Date().toISOString(),
        sender: userInfo.userName,
        userName: userInfo.userName,
        userService: userInfo.userService
      });
    } catch (error) {
      console.error("Erreur d'envoi du fichier:", error);
      alert("Erreur lors du partage du fichier");
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      await addDoc(collection(db, 'messages'), {
        text: commentText,
        parentMessageId: selectedMessage.id,
        originalMessage: selectedMessage.text,
        originalFileName: selectedMessage.fileName || null,
        timestamp: new Date().toISOString(),
        sender: userInfo.userName,
        userName: userInfo.userName,
        userService: userInfo.userService,
        isComment: true
      });
      setCommentText('');
      setShowCommentModal(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error("Erreur d'ajout de commentaire:", error);
      alert("Erreur lors de l'ajout du commentaire");
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (error) {
      console.error("Erreur de suppression:", error);
    }
  };

  const handleDeleteMessage = async (message) => {
    if (message.userName === userInfo.userName) {
      try {
        await deleteMessage(message.id);
      } catch (error) {
        console.error("Erreur de suppression:", error);
        alert("Erreur lors de la suppression");
      }
    } else {
      alert('Vous ne pouvez supprimer que vos propres messages');
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
        messageList.push({ id: doc.id, ...doc.data() });
      });

      // Check for new messages and show notification
      const lastMessage = messageList[messageList.length - 1];
      if (lastMessage && lastMessage.id !== lastMessageId && lastMessage.userName !== userInfo.userName) {
        toast.info(`Nouveau message de ${lastMessage.userName}: ${lastMessage.text.substring(0, 50)}...`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setLastMessageId(lastMessage.id);
      }

      setMessages(messageList);
      setIsLoading(false);
      scrollToBottom();
    });
    return () => unsubscribe();
  }, [lastMessageId, userInfo.userName]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      try {
        await addDoc(collection(db, 'messages'), {
          text: newMessage,
          timestamp: new Date().toISOString(),
          sender: userInfo.userName,
          userName: userInfo.userName,
          userService: userInfo.userService
        });
        setNewMessage('');
      } catch (error) {
        console.error("Erreur d'envoi:", error);
        alert("Erreur lors de l'envoi du message");
      }
    }
  };

  return (
    <Container fluid className="py-1">
      <ToastContainer />
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={12}>
          <Card className="chat-card shadow">
            <Card.Header style={{ backgroundColor: "rgb(28, 211, 211)" }} className="text-white">
              <h5 className="mb-0">Chat en direct</h5>
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
                  <div key={message.id}>
                    <div className={`d-flex ${message.userName === userInfo.userName ? 'justify-content-end' : 'justify-content-start'}`}>
                      <div className={`message-bubble ${message.userName === userInfo.userName ? 'sent' : 'received'} mb-2`}>
                        <div className="message-user-info">
                          <small>{message.userName} - {message.userService}</small>
                        </div>
                        {message.isComment ? (
                          <div className="comment-container">
                            <div className="commented-content">
                              <small className="text-muted">
                                Re: {message.originalFileName || message.originalMessage}
                              </small>
                            </div>
                            <div className="comment-text">{message.text}</div>
                          </div>
                        ) : (
                          <>
                            <div className="message-text">{message.text}</div>
                            {message.fileURL && (
                              <div className="file-attachment">
                                <a href={message.fileURL} target="_blank" rel="noopener noreferrer">
                                  📎 {message.fileName}
                                </a>
                              </div>
                            )}
                          </>
                        )}
                        <div className="message-actions">
                          {!message.isComment && (
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => {
                                setSelectedMessage(message);
                                setShowCommentModal(true);
                              }}
                            >
                              💬
                            </Button>
                          )}
                          {message.userName === userInfo.userName && (
                            <Button
                              variant="link"
                              size="sm"
                              className="delete-button"
                              onClick={() => handleDeleteMessage(message)}
                            >
                              <FaTrashArrowUp />
                            </Button>
                          )}
                        </div>
                        <div className="message-footer">
                          <small className="message-time">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </Card.Body>

            <Card.Footer className="bg-white">
              <Form onSubmit={handleSendMessage}>
                <Row className="g-1">
                  <Col xs={7} sm={7}>
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
                      cancel={() => console.log('Annulé')}
                      multiselect={true}
                    >
                      <Button
                        variant="secondary"
                        className="rounded-pill w-90"
                        style={{ backgroundColor: "#0061fe", border: "none" }}
                      >
                        choisir un fichier
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
                      Envoyer
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      <CommentModal
        show={showCommentModal}
        onClose={() => {
          setShowCommentModal(false);
          setSelectedMessage(null);
          setCommentText('');
        }}
        onSubmit={handleAddComment}
        message={selectedMessage}
        commentText={commentText}
        setCommentText={setCommentText}
      />

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
          position: relative;
        }
        .sent {
          background-color: rgb(28, 211, 211);
          color: white;
          margin-left: auto;
          border-bottom-right-radius: 5px;
        }
        .received {
          background-color: #e9ecef;
          color: black;
          margin-right: auto;
          border-bottom-left-radius: 5px;
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
          text-align: right;
        }
        .received .message-user-info {
          text-align: left;
        }
        .message-actions {
          display: flex;
          gap: 8px;
          margin-top: 4px;
          justify-content: flex-end;
        }
        .comment-container {
          background: rgba(255, 255, 255, 0.1);
          padding: 8px;
          border-radius: 4px;
          margin-top: 4px;
        }
        .commented-content {
          border-left: 2px solid rgba(255, 255, 255, 0.5);
          padding-left: 8px;
          margin-bottom: 4px;
        }
        .delete-button {
          color: #dc3545;
          padding: 0;
        }
        .delete-button:hover {
          color: #bd2130;
        }
        .file-attachment {
          margin-top: 8px;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }
        .file-attachment a {
          color: inherit;
          text-decoration: none;
        }
      `}</style>
    </Container>
  );
};

export default ChatComponent;
