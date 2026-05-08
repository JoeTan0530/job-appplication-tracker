import React, { useState } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";

export interface CustomConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

const CustomConfirmModal: React.FC<CustomConfirmModalProps> = ({
  isOpen,
  title = "Confirm",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger",
  onConfirm,
  onCancel,
}) => {
  const [isWorking, setIsWorking] = useState(false);

  const triggerConfirm = async () => {
    try {
      setIsWorking(true);
      await onConfirm();
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <Modal show={isOpen} onHide={onCancel} centered backdrop="static" keyboard={!isWorking}>
      <Modal.Header closeButton={!isWorking}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel} disabled={isWorking}>
          {cancelText}
        </Button>
        <Button variant={confirmVariant} onClick={triggerConfirm} disabled={isWorking}>
          {isWorking ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Working...
            </>
          ) : (
            confirmText
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CustomConfirmModal;

