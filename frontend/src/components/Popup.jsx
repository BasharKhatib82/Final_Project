import React from "react";

const Popup = ({ message, onClose, type, onConfirm }) => {
  const getColorClasses = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-50 text-green-900";
      case "error":
        return "bg-red-100 border-red-500 text-red-800";
      case "confirm":
        return "bg-yellow-50 border-yellow-50 text-yellow-800";
      default:
        return "bg-white border-gray-300 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div
        className={`w-full max-w-md rounded-lg border shadow-md p-6 text-center space-y-4 ${getColorClasses()}`}
      >
        <p className="text-base font-medium leading-relaxed">{message}</p>

        {type === "confirm" ? (
          <div className="flex justify-center gap-4">
            <button
              onClick={onConfirm}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              אישור
            </button>
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
            >
              ביטול
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            סגור
          </button>
        )}
      </div>
    </div>
  );
};

export default Popup;
