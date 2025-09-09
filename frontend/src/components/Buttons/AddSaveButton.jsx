// frontend\src\components\Buttons\AddSaveButton.jsx

import React from "react";

/**
 *  : כפתור הוספה/שמירה
 * מקבל:
 *  - label: string
 *  - type?: "submit"|"button" ("submit" : ברירת מחדל)
 *  - onClick?: (e)=> void
 *  - loading?: boolean  (מבטל קליקים ומציג מצב טעינה)
 *  - disabled?: boolean
 *  - icon?: ReactNode
 *  - className?: string  (הרחבת עיצוב)
 *  - title?: string
 */
const AddSaveButton = ({
  label,
  type = "submit",
  onClick,
  loading = false,
  disabled = false,
  icon = null,
  className = "",
  title,
}) => {
  const handleClick = (e) => {
    if (loading || disabled) return;
    onClick?.(e);
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      title={title || label}
      aria-busy={loading ? "true" : "false"}
      className={[
        "bg-blue-600 text-white w-40 py-2 rounded",
        "flex items-center justify-center gap-2",
        "transition disabled:opacity-50 disabled:cursor-not-allowed",
        !isDisabled && "hover:bg-blue-700",
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

export default AddSaveButton;
