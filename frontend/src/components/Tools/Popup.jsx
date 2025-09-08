// frontend\src\components\Tools\Popup.jsx

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * מה עושה: מציג חלונית קופצת (מודאל) עם כותרת, הודעה וכפתורי פעולה בהתאם למצב.
 * מה מקבל (Props):
 *  - icon?: ReactNode            – אייקון להצגה מעל הכותרת (לא חובה)
 *  - title: string               – כותרת
 *  - message: string             – טקסט ההודעה (נתמך ריבוי שורות)
 *  - mode: "info"|"success"|"error"|"warning"|"confirm"|"successMessage"
 *  - onClose?: () => void        – נקרא בלחיצה על סגירה/ביטול/ESC/סגירת-רקע
 *  - onConfirm?: () => void      – נקרא בלחיצה על אישור (במצב confirm)
 *  - redirectOnConfirm?: string  – ניתוב אחרי אישור (לא חובה)
 *  - redirectOnClose?: string    – ניתוב אחרי סגירה/ביטול (לא חובה)
 *  - autoClose?: number          – זמן מ״ש לסגירה אוטומטית (לא חובה)
 *  - closeOnOverlay?: boolean    – סגירת המודאל בלחיצה על הרקע (ברירת מחדל: true)
 * מה מחזיר: JSX .
 */
const Popup = ({
  icon,
  title = "",
  message = "",
  mode = "info",
  onClose,
  onConfirm,
  redirectOnConfirm,
  redirectOnClose,
  autoClose,
  closeOnOverlay = true,
}) => {
  const navigate = useNavigate();

  // autoClose סגירה אוטומטית אם הועבר
  useEffect(() => {
    if (!autoClose) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
      if (redirectOnClose) navigate(redirectOnClose);
    }, autoClose);
    return () => clearTimeout(timer);
  }, [autoClose, onClose, redirectOnClose, navigate]);

  // ESC סגירה עם מקש
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        if (onClose) onClose();
        if (redirectOnClose) navigate(redirectOnClose);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, redirectOnClose, navigate]);

  const handleClose = () => {
    if (onClose) onClose();
    if (redirectOnClose) navigate(redirectOnClose);
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    if (redirectOnConfirm) navigate(redirectOnConfirm);
  };

  // סגירת רקע (לא במצב confirm אם רוצים לחייב בחירה)
  const handleOverlayClick = () => {
    if (mode !== "confirm" && closeOnOverlay) {
      handleClose();
    }
  };

  const getColor = () => {
    switch (mode) {
      case "success":
        return "bg-green-600 hover:bg-green-700";
      case "successMessage":
        return "bg-green-400 hover:bg-green-700";
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
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={title || "הודעה"}
    >
      <div
        className="bg-white w-full max-w-md rounded-lg border shadow-md p-6 text-center space-y-4"
        onClick={(e) => e.stopPropagation()} // לא להעביר קליק לרקע
      >
        {icon && (
          <div className="text-4xl mb-2 flex justify-center">{icon}</div>
        )}

        <h2 className="font-rubik text-xl font-semibold text-gray-800">
          {title}
        </h2>

        {/* white-space:pre-line כדי לתמוך בשורות מרובות/שגיאות שרת מרובדות */}
        <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
          {message}
        </p>

        {mode === "confirm" ? (
          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={handleConfirm}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
              autoFocus
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
            autoFocus
          >
            סגור
          </button>
        )}
      </div>
    </div>
  );
};

export default Popup;
