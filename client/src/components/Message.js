import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        text: newMessage,
        timestamp: new Date().toLocaleTimeString(),
        sender: 'user'
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <Card className="chat-card shadow">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Chat en direct</h5>
              <button
                className="btn btn-light btn-sm float-right"
                onClick={() => navigate("/role")}
              >
              Retour vers la page d'accueil
              </button>
              </div>

            </Card.Header>
            
            <Card.Body className="chat-messages p-3">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`d-flex ${message.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  <div className={`message-bubble ${message.sender === 'user' ? 'sent' : 'received'} mb-2`}>
                    <div className="message-text">{message.text}</div>
                    <small className="message-time">{message.timestamp}</small>
                  </div>
                </div>
              ))}
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
                    >
                    envoyer
                      <i className="bi bi-send-fill"></i>
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ChatComponent;
