import React from "react";

const DeleteButton = ({ onClick, label = "מחיקה", disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {label}
    </button>
  );
};

export default DeleteButton;
