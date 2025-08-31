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
      className="bg-white rounded-xl shadow hover:shadow-lg p-4 h-48 flex flex-col justify-between cursor-pointer transition-transform duration-200 hover:-translate-y-1"
    >
      {/* אייקון */}
      <div className="flex justify-center items-center">
        <div className={`rounded-full p-3 text-2xl ${iconColor}`}>{icon}</div>
      </div>

      {/* כותרת */}
      <h4 className="text-center text-lg font-bold text-gray-700">{title}</h4>

      {/* פריטים */}
      <ul className="text-sm text-gray-600 text-center">
        {items.map((item, i) => (
          <li key={i}>
            {item.label} {item.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
