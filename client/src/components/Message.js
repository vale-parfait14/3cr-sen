import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDSQ0cQa7TISpd_vZWVa9dWMzbUUl-yf38",
  authDomain: "basecenterdb.firebaseapp.com",
  projectId: "basecenterdb",
  storageBucket: "basecenterdb.firebasestorage.app",
  messagingSenderId: "919766148380",
  appId: "1:919766148380:web:30db9986fa2cd8bb7106d9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    userName: localStorage.getItem('userName') || '',
    userService: localStorage.getItem('userService') || ''
  });

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
      setMessages(messageList);
      setIsLoading(false);
      scrollToBottom();
    }, (error) => {
      console.error("Error fetching messages:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      try {
        await addDoc(collection(db, 'messages'), {
          text: newMessage,
          timestamp: new Date().toISOString(),
          sender: 'user',
          createdAt: new Date(),
          userName: userInfo.userName,
          userService: userInfo.userService
        });
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
                <button
                  className="btn btn-light btn-sm"
                  onClick={() => navigate("/role")}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    fill="currentColor" 
                    className="bi bi-house-door-fill" 
                    viewBox="0 0 16 16"
                  >
                    <path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5"/>
                  </svg>
                </button>
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
                      <small className="message-time">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </small>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </Card.Body>

            <Card.Footer className="bg-white">
              <Form onSubmit={handleSendMessage}>
                <Row className="g-2">
                  <Col xs={9} sm={10}>
                    <Form.Control
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Écrivez votre message..."
                      className="rounded-pill"
                    />
                  </Col>
                  <Col xs={3} sm={2}>
                    <Button
                      type="submit"
                      variant="primary"
                      className="rounded-pill w-100"
                      style={{ backgroundColor: "rgb(28, 211, 211)", border: "none" }}
                    >
                      <i className="bi bi-send-fill">→</i>
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
          display: block;
          margin-top: 5px;
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
        .btn-primary:hover {
          background-color: rgb(25, 190, 190) !important;
          transform: scale(1.05);
          transition: all 0.2s;
        }
      `}</style>
    </Container>
  );
};

export default ChatComponent;
