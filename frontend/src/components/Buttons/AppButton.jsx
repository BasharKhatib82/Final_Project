import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * כפתור אחיד עם 4 סוגי פעולה:
 * - normal: פעולה ניטרלית
 * - changes: פעולה שמשנה משהו (שמור, עדכן)
 * - danger: פעולה הרסנית (מחק, התנתקות)
 * - navigate: מעבר לעמוד אחר עם useNavigate
 *
 * Props:
 * - label: string
 * - variant: "normal" | "changes" | "danger" | "navigate"
 * - onClick?: () => void (אם variant === "navigate", זה לא חובה)
 * - to?: string (נתיב לעבור אליו ב־navigate)
 * - icon?: ReactNode
 * - className?: string
 * - disabled?: boolean
 */
const AppButton = ({
  label,
  variant = "normal",
  onClick,
  to = "",
  icon = null,
  className = "",
  disabled = false,
}) => {
  const navigate = useNavigate();

  const variants = {
    normal: "bg-gray-600 hover:bg-gray-700",
    changes: "bg-blue-500 hover:bg-blue-600",
    danger: "bg-red-600 hover:bg-red-700",
    navigate: "bg-blue-500 hover:bg-blue-600",
  };

  const baseClasses =
    "flex items-center gap-2 text-white px-4 py-2 rounded transition font-rubik";
  const finalClassName = `${
    variants[variant] || variants.normal
  } ${baseClasses} ${className}`;

  const handleClick = () => {
    if (disabled) return;
    if (variant === "navigate" && to) navigate(to);
    else if (onClick) onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`${finalClassName} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default AppButton;
