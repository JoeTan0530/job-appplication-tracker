import React, { useEffect } from "react";

interface CustomSystemPopupProps {
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  onClose: () => void;
  isExiting?: boolean;
  duration?: number;
}

const CustomSystemPopup: React.FC<CustomSystemPopupProps> = ({ 
  message, 
  type = 'info',
  onClose,
  isExiting = false,
  duration = 3000
}) => {
  // Handle auto-close
  useEffect(() => {
    if (duration > 0 && !isExiting) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose, isExiting]);

  // const getIcon = () => {
  //   switch(type) {
  //     case 'success': return '✅';
  //     case 'error': return '❌';
  //     case 'warning': return '⚠️';
  //     case 'info': default: return 'ℹ️';
  //   }
  // };

  return (
    <div className="custom-popup-container bottom-right">
		<div className={`custom-popup-display system-popup-type-${type} ${isExiting ? 'hide' : 'show-popup'}`}>
			<div className="custom-popup-display-text">
				{message}
			</div>
		</div>
	</div>
  );
}

export default CustomSystemPopup;