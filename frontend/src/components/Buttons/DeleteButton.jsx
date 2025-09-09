// frontend\src\components\Buttons\DeleteButton.jsx

import React from "react";

/**
 * : כפתור מחיקה/ביטול
 * מקבל:
 *  - label?: string (ברירת מחדל: "מחיקה")
 *  - onClick?: ()=>void
 *  - disabled?: boolean
 *  - loading?: boolean
 *  - icon?: ReactNode
 *  - className?: string
 *  - title?: string
 */
const DeleteButton = ({
  label = "מחיקה",
  onClick,
  disabled = false,
  loading = false,
  icon = null,
  className = "",
  title,
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      title={title || label}
      aria-busy={loading ? "true" : "false"}
      className={[
        "bg-red-600 text-white px-4 py-2 rounded",
        "transition disabled:opacity-50 disabled:cursor-not-allowed",
        !isDisabled && "hover:bg-red-700",
        "flex items-center gap-2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      <span>{label}</span>
    </button>
  );
};

export default DeleteButton;
