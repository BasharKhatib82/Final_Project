import React from "react";

const Popup = ({ message, mode = "info", onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-lg border shadow-md p-6 text-center space-y-4">
        <p className="text-base text-gray-800 font-medium leading-relaxed">
          {message}
        </p>

        {mode === "confirm" ? (
          <div className="flex justify-center gap-4">
            <button
              onClick={onConfirm}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              אישור
            </button>
            <button
              onClick={onClose}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
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
