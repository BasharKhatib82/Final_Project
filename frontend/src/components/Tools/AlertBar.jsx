import React from "react";

export default function AlertBar({
  icon,
  count,
  text,
  color = "blue",
  onClick,
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

  return (
    <div
      onClick={onClick}
      className={`flex items-center border rounded-lg px-4 py-2 shadow-sm cursor-pointer transition-transform duration-200 hover:-translate-y-1 ${styles[color]}`}
    >
      {/* אייקון */}
      <span className="text-lg ml-2">{icon}</span>

      {/* מפריד */}
      <span className="w-px h-5 bg-gray-300 mx-2"></span>

      {/* מספר */}
      <span className="text-lg font-bold ml-2">{count}</span>

      {/* טקסט */}
      <span className="text-base font-medium">{text}</span>
    </div>
  );
}
