import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import CustomConfirmModal from "../components/CustomConfirmModal.tsx";
import { registerConfirmModal } from "../services/CustomConfirmModalService.js";

const CustomConfirmModalContext = createContext();

export const useCustomConfirmModal = () => {
  const context = useContext(CustomConfirmModalContext);
  if (!context) {
    throw new Error("useCustomConfirmModal must be used within a CustomConfirmModalProvider");
  }
  return context;
};

export const CustomConfirmModalProvider = ({ children }) => {
  const [currentConfirm, setCurrentConfirm] = useState(null);

  const showConfirm = (options) => {
    return new Promise((resolve) => {
      setCurrentConfirm({
        id: Date.now(),
        options,
        resolve,
      });
    });
  };

  useEffect(() => {
    registerConfirmModal(showConfirm);
  }, []);

  const hideConfirm = useCallback((result) => {
    if (currentConfirm?.resolve) {
      currentConfirm.resolve(result);
    }
    setCurrentConfirm(null);
  }, [currentConfirm]);

  return (
    <CustomConfirmModalContext.Provider
      value={{
        currentConfirm,
        showConfirmModal: showConfirm,
        hideConfirmModal: hideConfirm,
      }}
    >
      {children}
      {currentConfirm && (
        <CustomConfirmModal
          key={currentConfirm.id}
          isOpen={true}
          title={currentConfirm.options?.title}
          message={currentConfirm.options?.message}
          confirmText={currentConfirm.options?.confirmText}
          cancelText={currentConfirm.options?.cancelText}
          confirmVariant={currentConfirm.options?.confirmVariant}
          onCancel={() => hideConfirm(false)}
          onConfirm={async () => {
            hideConfirm(true);
          }}
        />
      )}
    </CustomConfirmModalContext.Provider>
  );
};

export default CustomConfirmModalProvider;

