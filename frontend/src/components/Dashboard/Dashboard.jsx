/**
 * קובץ: MyRoutes.jsx
 * -------------------
 * Client Side Routing אחראי על ניתוב כל הדפים באפליקציה .
 *
 * תכונות:
 * -  react-router-dom מ <Route> ו <Routes>משתמש ב ־ .
 * - כולל ניתוב:
 *    - דפי מערכת ציבוריים: דף הבית, אודות, צור קשר, התחברות וכו'.
 *    - דפים פנימיים דף ניהול: משתמשים, תפקידים, נוכחות, לידים, משימות, פרויקטים וכו'.
 * - Header, Footer : כולל קומפוננטות קבועות .
 * - ניתוק אוטומטי בעת חוסר פעילות useInactivityLogout משלב  .
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
