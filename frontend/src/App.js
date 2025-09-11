// frontend\src\App.js

/**
 * קובץ: App.jsx
 * --------------
 * תיאור:
 * Frontend נקודת הכניסה הראשית לאפליקציה בצד ה .
 * לניהול ניתוב BrowserRouter עוטף את כל האפליקציה ב  ,
 * לניהול מידע על המשתמש המחובר UserProvider וב   .
 *
 * תכונות עיקריות:
 * - BrowserRouter: (SPA) מאפשר ניתוב צד־לקוח .
 * - UserProvider: לכל הרכיבים לגבי המשתמש וההרשאות Context מספק  .
 * - MyRoutes: מגדיר את כל נתיבי המערכת (ציבוריים + פנימיים).
 *
 * מטרה:
 * למידע על המשתמש Context לספק שלד ראשי לכל האפליקציה עם ניתוב ו   .
 */

import { BrowserRouter } from "react-router-dom";
import MyRoutes from "./components/MyRoutes";
import { UserProvider } from "components/Tools";

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <MyRoutes />
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
