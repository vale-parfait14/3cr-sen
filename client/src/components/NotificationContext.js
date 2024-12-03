// NotificationContext.js
import React, { createContext, useContext, useState } from "react";

// Créer un contexte pour les notifications
const NotificationContext = createContext();

export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [idCounter, setIdCounter] = useState(0);

  const showNotification = (type, message) => {
    const id = idCounter;
    setIdCounter((prev) => prev + 1); // Incrémenter l'ID pour chaque nouvelle notification

    // Ajout de la notification à l'état
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      { id, type, message },
    ]);

    // Afficher la notification via toast
    if (type === "success") {
      toast.success(message, { toastId: id });
    } else if (type === "info") {
      toast.info(message, { toastId: id });
    } else if (type === "error") {
      toast.error(message, { toastId: id });
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
