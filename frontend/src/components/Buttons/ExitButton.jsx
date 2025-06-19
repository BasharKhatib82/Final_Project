import React from "react";

const ExitButton = ({ label, onClick }) => {
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };
  return (
    <button
      onClick={handleClick}
      className="bg-red-500 text-white w-40 py-2 rounded hover:bg-red-600 flex items-center justify-center gap-2"
    >
      <span>{label}</span>
    </button>
  );
};

export default ExitButton;
