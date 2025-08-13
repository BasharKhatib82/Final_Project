import React from "react";
import { useNavigate } from "react-router-dom";

const ExitButton = ({ label, onClick, linkTo }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else if (linkTo) {
      navigate(linkTo);
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
