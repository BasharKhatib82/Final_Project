import React from "react";
import { useNavigate } from "react-router-dom";

const NavigationButton = ({ linkTo, label }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(linkTo);
  };

  return (
    <button
      onClick={handleClick}
      className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
    >
      <span>{label}</span>
    </button>
  );
};

export default NavigationButton;
