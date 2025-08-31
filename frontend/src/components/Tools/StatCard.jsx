// StatCard.jsx
import React from "react";

export default function StatCard({
  icon,
  iconColor,
  title,
  items = [],
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow hover:shadow-lg 
                 p-4 flex flex-col min-w-56 max-w-70
                 cursor-pointer transition-transform 
                 duration-200 hover:-translate-y-1"
    >
      {/* אייקון */}
      <div className="flex justify-center items-center">
        <div className={`rounded-full p-3 text-2xl ${iconColor}`}>{icon}</div>
      </div>

      {/* כותרת */}
      <h4 className="text-center text-lg font-bold text-gray-700">{title}</h4>

      {/* פריטים */}
      <ul className="text-sm text-gray-600 text-center flex-grow flex flex-col justify-center">
        {items.length > 0 ? (
          items.map((item, i) => (
            <li
              key={i}
              className="truncate flex justify-center items-center gap-2"
            >
              {item.value && (
                <span className="font-bold text-gray-800">{item.value}</span>
              )}
              <span>{item.label}</span>
            </li>
          ))
        ) : (
          <li className="text-gray-400 italic">אין נתונים</li>
        )}
      </ul>
    </div>
  );
}
