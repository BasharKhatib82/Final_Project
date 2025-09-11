/**
 * קובץ: Dashboard.jsx
 * -------------------
 * תיאור:
 * במערכת Dashboard רכיב זה מגדיר את מבנה עמוד ה  .
 * ואזור תוכן ראשי Sidebar העמוד מורכב מתפריט צד .
 * בתוך אזור התוכן נטענים רכיבים שונים לפי הנתיב הפעיל
 * react-router-dom מספריית <Outlet> באמצעות   .
 *
 * רכיבים ותכונות עיקריים:
 * 1. Sidebar:
 *    - מוצג בצד שמאל של העמוד.
 *    - מכיל קישורי ניווט פנימיים במערכת הניהול.
 *
 * 2. Main Content:
 *    - החלק המרכזי של הדף.
 *    - מציג את התוכן הדינמי של כל מסך בהתאם לנתיב.
 *    - נעזר ב־<Outlet> לצורך טעינת רכיבים מתאימים.
 * מטרה:
 *  לספק שלד קבוע למסכי הניהול (),
 *  תמיד יוצג לצד תוכן משתנה Sidebarכך שה־  .
 */

import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Dashboard = () => {
  return (
    <div className="flex min-h-[calc(100vh-124px)]">
      {/* Sidebar בצד */}
      <aside className=" bg-gray-800 text-white">
        <Sidebar />
      </aside>
      {/* אזור התוכן */}
      <main className="flex-grow bg-white/80 p-4 ">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
