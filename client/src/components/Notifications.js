import React, { useState } from 'react';
import { toast } from 'react-toastify';

const Notifications= ({ userName }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message) => {
    const newNotification = {
      id: Date.now(),
      message,
      timestamp: new Date().toLocaleString()
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const copyNotification = (message) => {
    navigator.clipboard.writeText(message)
      .then(() => toast.success('Notification copiée!'))
      .catch(() => toast.error('Erreur de copie'));
  };

  const handlePatientOperation = (formData, isEditing, oldPatient) => {
    let notificationMessage = '';

    if (isEditing) {
      const changes = [];
      Object.keys(formData).forEach((key) => {
        if (oldPatient[key] !== formData[key]) {
          changes.push(`${key}: ${oldPatient[key]} → ${formData[key]}`);
        }
      });
      notificationMessage = `Patient ${formData.nom} modifié par ${userName}.\nModifications: ${changes.join(", ")}`;
    } else {
      notificationMessage = `Nouveau patient ${formData.nom} ajouté par ${userName}`;
    }

    addNotification(notificationMessage);
    toast.success(notificationMessage);
  };

  return (
    <div className="notification-system">
      <h3>Notifications</h3>
      <div className="notification-list">
        {notifications.map((notification) => (
          <div key={notification.id} className="notification-item">
            <p>{notification.message}</p>
            <small>{notification.timestamp}</small>
            <button 
              onClick={() => copyNotification(notification.message)}
              className="copy-button"
            >
              Copier
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
