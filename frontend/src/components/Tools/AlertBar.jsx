// frontend\src\components\Tools\AlertBar.jsx

import React from "react";

/**
 * מציג פס התראה / מידע עם אייקון, ספירה וטקסט. אופציונלי: לחיץ
 * מה מקבל (Props):
 *  - icon?: ReactNode        – אייקון מימין (לא חובה)
 *  - count?: number|string   – מספר להצגה (ברירת מחדל: 0)
 *  - text: string            – טקסט ההודעה
 *  - color?: "red"|"blue"|"yellow"|"green"|"purple"  – צבע רקע/מסגרת (ברירת מחדל: "blue")
 *  - onClick?: () => void    – אם מוגדר: הקומפוננטה תהיה לחיצה/מקשי
 *  - title?: string          – טייטל לדפדפן/עזרי נגישות (לא חובה)
 */
export default function AlertBar({
  icon = null,
  count = 0,
  text = "",
  color = "blue",
  onClick,
  title,
}) {
  const styles = {
    red: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100",
    blue: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
    yellow:
      "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100",
    green: "bg-green-50 border-green-200 text-green-700 hover:bg-green-100",
    purple:
      "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100",
  };

  const colorClass = styles[color] || styles.blue;
  const clickable = typeof onClick === "function";

  // נגישות מקלדת כשהרכיב לחיץ
  const handleKeyDown = (e) => {
    if (!clickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      title={title}
      onClick={clickable ? onClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      role={clickable ? "button" : "group"}
      tabIndex={clickable ? 0 : -1}
      className={[
        "flex items-center border rounded-lg px-4 py-2 shadow-sm transition-transform duration-200",
        colorClass,
        clickable ? "cursor-pointer hover:-translate-y-1" : "cursor-default",
      ].join(" ")}
      aria-label={typeof text === "string" ? text : "Alert"}
    >
      {/* אייקון (אופציונלי) */}
      {icon && <span className="text-lg ml-2">{icon}</span>}

      {/* מפריד (רק אם יש אייקון) */}
      {icon && <span className="w-px h-6 bg-gray-300 ml-2" />}

      {/* מספר */}
      <span className="text-lg font-bold ml-2">{count}</span>

      {/* טקסט */}
      <span className="text-base font-medium">{text}</span>
    </div>
  );
}
