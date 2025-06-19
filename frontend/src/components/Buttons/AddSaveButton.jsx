import React from "react";

const AddSaveButton = ({ label, type = "submit", onClick }) => {
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      className="bg-blue-500 text-white w-40 py-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2"
    >
      <span>{label}</span>
    </button>
  );
};

export default AddSaveButton;
