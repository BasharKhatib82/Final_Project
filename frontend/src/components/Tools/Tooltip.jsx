// src/components/Tools/Tooltip.jsx
import React, { useId } from "react";

/**
 * (children) מציג טול־טיפ קטן כשמרחפים/מתמקדים על ילד
 *  מקבל (Props):
 *  - message: string                  // הטקסט בטול־טיפ
 *  - children:                        // הרכיב שמעליו מציגים את הטול־טיפ
 *  - position?: "left"|"right"|"top"|"bottom" (ברירת מחדל: "left")
 *  - className?: string               // עיצוב נוסף לטול־טיפ (לא חובה)
 */
const Tooltip = ({
  children,
  message = "",
  position = "left",
  className = "",
}) => {
  const tooltipId = useId();

  // מיקומים (תיבה + חץ)
  const baseBox =
    "absolute bg-black text-white text-sm rounded-md py-1 px-3 shadow-lg " +
    "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 " +
    "transition-opacity duration-200 z-50 whitespace-pre-line pointer-events-none";

  const baseArrow =
    "after:content-[''] after:absolute after:border-8 after:border-transparent";

  const positions = {
    left: {
      box: "right-full top-1/2 -translate-y-1/2 mr-2",
      arrow:
        "after:top-1/2 after:left-full after:-translate-y-1/2 after:border-l-black",
    },
    right: {
      box: "left-full top-1/2 -translate-y-1/2 ml-2",
      arrow:
        "after:top-1/2 after:right-full after:-translate-y-1/2 after:border-r-black",
    },
    top: {
      box: "bottom-full left-1/2 -translate-x-1/2 mb-2",
      arrow:
        "after:left-1/2 after:top-full after:-translate-x-1/2 after:border-t-black",
    },
    bottom: {
      box: "top-full left-1/2 -translate-x-1/2 mt-2",
      arrow:
        "after:left-1/2 after:bottom-full after:-translate-x-1/2 after:border-b-black",
    },
  };

  const pos = positions[position] || positions.left;

  return (
    <span className="relative inline-flex items-center justify-center group">
      {/* הילד/הכפתור/האייקון */}
      <span aria-describedby={tooltipId}>{children}</span>

      {/* הטול-טיפ */}
      <span
        id={tooltipId}
        role="tooltip"
        className={`${baseBox} ${baseArrow} ${pos.box} ${pos.arrow} ${className}`}
      >
        {message}
      </span>
    </span>
  );
};

export default Tooltip;
