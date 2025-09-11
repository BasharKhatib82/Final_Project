// frontend\src\components\Pages\Header.jsx

/**
 * רכיב: Header
 * -------------------------
 * רכיב המציג את החלק העליון (כותרת עליונה) של המערכת.
 *
 * מטרת הרכיב:
 * - לשמש כאזור עליון קבוע בכל דף
 * - שבו מוצגים הקישורים והאפשרויות Navbar להחזיק את רכיב הניווט
 *
 * קלט: אין
 * פלט: כותרת עליונה המכילה את רכיב הניווט
 */

import React from "react";

import Navbar from "./Navbar";

function Header() {
  return (
    <header className="header">
      <Navbar />
    </header>
  );
}

export default Header;
