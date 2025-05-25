import React from "react";


const Popup = ({ message, onClose, type, onConfirm }) => {
  return (
    <div className="popup-overlay">
      <div className={`popup-box ${type}`}>
        <p>{message}</p>
        {type === "confirm" ? (
          <div className="popup-buttons">
            <button onClick={onConfirm}>אישור</button>
            <button onClick={onClose}>ביטול</button>
          </div>
        ) : (
          <button onClick={onClose}>סגור</button>
        )}
      </div>
    </div>
  );
};

export default Popup;
