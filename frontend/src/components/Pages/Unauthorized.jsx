import React from "react";
import { Link } from "react-router-dom";
import { FiLock } from "react-icons/fi";

function Unauthorized() {
  return (
    <div className="container text-center mt2rem">
      <FiLock size={80} color="#e74c3c" />
      <h2 className="fontXL mt1rem">אין לך הרשאה</h2>
      <p className="fontM">הגישה לעמוד זה מוגבלת למשתמשים מורשים בלבד.</p>
      <Link to="/loginUser" className="btn-back mt1rem fontBtnDash">
        חזור לדף הבית
      </Link>
    </div>
  );
}

export default Unauthorized;
