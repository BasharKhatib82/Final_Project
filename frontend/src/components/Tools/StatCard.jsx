// frontend\src\components\Tools\StatCard.jsx

import React from "react";

/**
 *  כרטיס סטטיסטיקה עם אייקון, כותרת ורשימת פריטים
 * Props:
 *  - icon?: ReactNode               – אייקון עגול בחלק העליון (לא חובה)
 *  - title: string                  – כותרת הכרטיס
 *  - items?: Array<{label, value?}> – רשימת פריטים (label חובה, value אופציונלי)
 *  - onClick?: () => void           – אם מוגדר: הכרטיס לחיץ (כולל מקלדת)
 *  - className?: string             – עיצוב נוסף חיצוני (לא חובה)
 */
export default function StatCard({
  icon = null,
  title = "",
  items = [],
  onClick,
  className = "",
}) {
  const clickable = typeof onClick === "function";

  const handleKeyDown = (e) => {
    if (!clickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      onClick={clickable ? onClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      role={clickable ? "button" : "group"}
      tabIndex={clickable ? 0 : -1}
      aria-label={title || "כרטיס סטטיסטיקה"}
      className={[
        "bg-white rounded-xl shadow p-4 flex flex-col min-w-52 max-w-64 min-h-48",
        clickable
          ? "cursor-pointer transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
          : "cursor-default",
        className,
      ].join(" ")}
    >
      {/* אייקון (אופציונלי) */}
      {icon && (
        <div className="flex justify-center items-center mb-1">
          <div className="rounded-full p-3 text-2xl bg-gray-100 text-gray-700">
            {icon}
          </div>
        </div>
      )}

      {/* כותרת */}
      <h4 className="text-center text-lg font-bold text-gray-700 mb-1">
        {title}
      </h4>

      {/* פריטים */}
      <ul className="text-sm text-gray-600 text-center flex-grow flex flex-col justify-center gap-1">
        {Array.isArray(items) && items.length > 0 ? (
          items.map((item, i) => (
            <li
              key={i}
              className="truncate flex justify-center items-center gap-2"
              title={
                typeof item?.label === "string"
                  ? `${item?.value ?? ""} ${item?.label}`.trim()
                  : undefined
              }
            >
              {item?.value != null && item?.value !== "" && (
                <span className="font-bold text-gray-800">{item.value}</span>
              )}
              <span>{item?.label}</span>
            </li>
          ))
        ) : (
          <li className="text-gray-400 italic">אין נתונים</li>
        )}
      </ul>
    </div>
  );
}
