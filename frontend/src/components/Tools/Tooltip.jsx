import React from "react";

const Tooltip = ({ children, message }) => {
  return (
    <div className="tooltip-wrapper">
      {children}
      <span className="custom-tooltip">{message}</span>
    </div>
  );
};

export default Tooltip;
