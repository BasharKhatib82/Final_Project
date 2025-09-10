import React from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";

/**
 * קומפוננטה: NotFound
 * --------------------
 * מוצגת כאשר לא נמצא נתיב תואם (404).
 */

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <Icon
        icon="line-md:alert"
        width="4em"
        height="4em"
        className="text-red-500 mb-4"
      />
      <h1 className="text-4xl font-bold text-red-600 mb-2">
        404 - הדף לא נמצא
      </h1>
      <p className="text-gray-600 mb-6">הקישור שניסית לגשת אליו לא קיים.</p>
      <Link
        to="/"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow"
      >
        חזרה לדף הבית
      </Link>
    </div>
  );
};

export default NotFound;
