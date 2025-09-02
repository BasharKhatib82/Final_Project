import React from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

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
      <Icon
        icon="fluent:remix-add-32-filled"
        width="1.5em"
        height="1.5em"
        color="white"
      />
      <span>{label}</span>
    </button>
  );
};

export default NavigationButton;
