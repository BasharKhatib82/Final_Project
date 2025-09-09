// frontend\src\components\Buttons\NavigationButton.jsx

import React from "react";
import { Link, useNavigate } from "react-router-dom";

// @iconify/react אם אין  אל תייבא; כאן הופך את האייקון לאופציונלי.
// import { Icon } from "@iconify/react";

/**
 * מה עושה: כפתור ניווט לעמוד אחר.
 * מקבל:
 *  - linkTo: string      (נתיב)
 *  - label: string
 *  - icon?: ReactNode    (<Icon .../> מבחוץ Iconify אופציונלי: אם רוצים  – מעבירים )
 *  - useLink?: boolean   (true → <Link> : ברירת מחדל )
 *  - className?: string
 *  - title?: string
 */
const NavigationButton = ({
  linkTo,
  label,
  icon = null,
  useLink = true,
  className = "",
  title,
}) => {
  const navigate = useNavigate();

  const classes = [
    "flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded",
    "hover:bg-blue-700 transition",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (useLink) {
    return (
      <Link to={linkTo} className={classes} title={title || label}>
        {icon}
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => navigate(linkTo)}
      className={classes}
      title={title || label}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default NavigationButton;
