import React from "react";
import { useNavigate } from "react-router-dom";

const Button = ({ linkTo, label }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(linkTo);
  };

  return (
    <button className="btn-add-dash fontBtnDash" onClick={handleClick}>
      {label}
    </button>
  );
};

export default Button;
