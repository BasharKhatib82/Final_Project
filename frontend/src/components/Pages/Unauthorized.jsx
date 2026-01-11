import { Link } from "react-router-dom";

function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-800 text-center px-4">
      <h1 className="text-4xl font-bold mb-4">⛔ אין לך גישה לעמוד זה</h1>
      <p className="mb-6">
        ייתכן שאין לך הרשאות מתאימות או שזו תקלה בהרשאות שלך.
      </p>
      <Link
        to="/"
        className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        חזרה לדף הבית
      </Link>
    </div>
  );
}

export default Unauthorized;
