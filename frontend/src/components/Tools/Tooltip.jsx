import React from "react";

const Tooltip = ({ children, message }) => {
  return (
    <div className="relative group inline-flex items-center">
      {children}
      <div className="absolute bottom-full mb-1 right-0 hidden group-hover:block w-max whitespace-nowrap rounded bg-yellow-50 px-3 py-1 text-xs text-yellow-900 shadow z-50">
        {message}
      </div>
    </div>
  );
};

export default Tooltip;
