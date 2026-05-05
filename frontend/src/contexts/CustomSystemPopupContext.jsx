// contexts/CustomSystemPopupContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import CustomSystemPopup from '../components/CustomSystemPopup.tsx';
import { registerPopup } from '../services/CustomSystemPopupService.js'; 

const CustomSystemPopupContext = createContext();

export const useCustomSystemPopup = () => {
  const context = useContext(CustomSystemPopupContext);
  if (!context) {
    throw new Error('useCustomSystemPopup must be used within a CustomSystemPopupProvider');
  }
  return context;
};

export const CustomSystemPopupProvider = ({ children }) => {

  // This is to register the 'showSystemPopup' function into the service to use it globally even in functions
  useEffect(() => {
    registerPopup(showSystemPopup);
  }, []);

  const [currentPopup, setCurrentPopup] = useState(null);
  const [isExiting, setIsExiting] = useState(false);

  const showSystemPopup = (message, type = 'info', duration = 3000) => {
    // If there's already a popup, hide it first
    if (currentPopup) {
      hideSystemPopup();
      // Wait for hide animation then show new one
      setTimeout(() => {
        setCurrentPopup({
          id: Date.now(),
          message,
          type,
          duration
        });
      }, 300);
    } else {
      setCurrentPopup({
        id: Date.now(),
        message,
        type,
        duration
      });
    }
  };

  const hideSystemPopup = () => {
    setIsExiting(true);
    
    // Wait for animation to complete before removing from DOM
    setTimeout(() => {
      setCurrentPopup(null);
      setIsExiting(false);
    }, 300);
  };

  return (
    <CustomSystemPopupContext.Provider value={{ 
      currentPopup,
      showSystemPopup,
      hideSystemPopup 
    }}>
      {children}
      {currentPopup && (
        <CustomSystemPopup 
          key={currentPopup.id}
          message={currentPopup.message}
          type={currentPopup.type}
          onClose={hideSystemPopup}
          isExiting={isExiting}
          duration={currentPopup.duration}
        />
      )}
    </CustomSystemPopupContext.Provider>
  );
};

export default CustomSystemPopupProvider;