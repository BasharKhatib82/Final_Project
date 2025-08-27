import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Popup = ({
  icon, // אופציונלי: אייקון להצגה מעל הכותרת
  title,
  message,
  mode, // info / success / error / warning / confirm
  onClose,
  onConfirm,
  redirectOnConfirm, // אופציונלי: קישור לעבור אליו אחרי אישור
  redirectOnClose, // אופציונלי: קישור לעבור אליו אחרי סגירה/ביטול
  autoClose, // ⏳ מספר מילישניות לסגירה אוטומטית
}) => {
  const navigate = useNavigate();

  // ✅ סגירה אוטומטית אם הועבר autoClose
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
        if (redirectOnClose) navigate(redirectOnClose);
      }, autoClose);

      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose, redirectOnClose, navigate]);

  const handleClose = () => {
    if (onClose) onClose();
    if (redirectOnClose) navigate(redirectOnClose);
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    if (redirectOnConfirm) navigate(redirectOnConfirm);
  };

  const getColor = () => {
    switch (mode) {
      case "success":
      case "successMessage":
        return "bg-green-600 hover:bg-green-700";
      case "error":
        return "bg-red-600 hover:bg-red-700";
      case "warning":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "info":
        return "bg-blue-600 hover:bg-blue-700";
      case "confirm":
        return "bg-green-600 hover:bg-green-700";
      default:
        return "bg-blue-600 hover:bg-blue-700";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-lg border shadow-md p-6 text-center space-y-4">
        {icon && (
          <div className="text-4xl mb-2 flex justify-center">{icon}</div>
        )}

        <h2 className="font-rubik text-xl font-semibold text-gray-800">
          {title}
        </h2>

        <p className="text-base text-gray-700 leading-relaxed">{message}</p>

        {mode === "confirm" ? (
          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={handleConfirm}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
            >
              אישור
            </button>
            <button
              onClick={handleClose}
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition"
            >
              ביטול
            </button>
          </div>
        ) : mode === "successMessage" ? null : (
          <button
            onClick={handleClose}
            className={`text-white px-6 py-2 rounded transition ${getColor()}`}
          >
            סגור
          </button>
        )}
      </div>
    </div>
  );
};

export default Popup;
