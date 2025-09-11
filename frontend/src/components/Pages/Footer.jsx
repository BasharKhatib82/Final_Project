// frontend\src\components\Pages\Footer.jsx

/**
 * רכיב: Footer
 * -------------------------
 * רכיב המציג את החלק התחתון של האתר/מערכת.
 *
 * מטרת הרכיב:
 * - להציג טקסט קרדיט ומידע כללי
 * - להוסיף שנה נוכחית באופן אוטומטי
 * - ליצור תחושה של ממשק מלא ושלם
 *
 * קלט: אין
 * פלט: אזור תחתון עם טקסט קרדיט ושנה נוכחית
 */
import React from "react";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/95 text-gray-600 text-center py-4 shadow-2xl mt-auto">
      <p className="text-sm">
        &copy; {currentYear} &nbsp;|&nbsp; Developed by Tareq Shaltaf & Bashar
        Khatib
      </p>
    </footer>
  );
}

export default Footer;
