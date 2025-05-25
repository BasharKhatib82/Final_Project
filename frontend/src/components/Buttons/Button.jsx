import React from "react";
import { useNavigate } from "react-router-dom";

const Button = ({ linkTo, label, icon = null }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(linkTo);
  };

  return (
    <button className="btn-add-dash fontBtnDash" onClick={handleClick}>
      {icon && <span className="btn-icon">{icon}</span>}
      {label}
    </button>
  );
};

export default Button;
