import React from "react";
import { useNavigate } from "react-router-dom";

const Button = ({ linkTo, label, icon = null }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(linkTo);
  };

  return (
    <button
      onClick={handleClick}
      className="font-rubik flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-base rounded shadow hover:bg-blue-700 hover:scale-95 transition duration-300"
    >
      {icon && <span className="text-lg">{icon}</span>}
      <span>{label}</span>
    </button>
  );
};

export default Button;
