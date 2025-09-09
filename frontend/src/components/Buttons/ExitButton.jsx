// frontend\src\components\Buttons\ExitButton.jsx

import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * : כפתור יציאה/ביטול ניווט
 * מקבל:
 *  - label: string
 *  - onClick?: (e)=>void
 *  - linkTo?: string       // ניווט לנתיב onClick אם אין
 *  - disabled?: boolean
 *  - className?: string
 *  - title?: string
 */
const ExitButton = ({
  label,
  onClick,
  linkTo,
  disabled = false,
  className = "",
  title,
}) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (disabled) return;
    if (onClick) onClick(e);
    else if (linkTo) navigate(linkTo);
  };

  return (
    <button
      type="button" // בטפסים submit חשוב שלא ישגר
      onClick={handleClick}
      disabled={disabled}
      title={title || label}
      className={[
        "bg-gray-500 text-white w-40 py-2 rounded",
        "flex items-center justify-center gap-2",
        "transition disabled:opacity-50 disabled:cursor-not-allowed",
        !disabled && "hover:bg-gray-600",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span>{label}</span>
    </button>
  );
};

export default ExitButton;
