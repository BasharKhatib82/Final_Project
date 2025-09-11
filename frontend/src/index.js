// frontend\src\index.js

/**
 * קובץ: index.js
 * ---------------
 * תיאור:
 * React נקודת הכניסה הראשית של פרויקט .
 * DOMכאן נטענת האפליקציה לדפדפן ומחוברת ל־ .
 *
 * תכונות עיקריות:
 * - index.css טעינת קובץ העיצוב הראשי .
 * - ReactDOM.createRoot באמצעות root יצירת  .
 * - (עוזר לזהות בעיות בזמן פיתוח) React.StrictMode בתוך App עטיפת    .
 * -id="root" עם HTML בתוך אלמנט App הצגת קומפוננטת  .
 *
 * מטרה:
 * בתוך הדפדפן React להפעיל את אפליקציית
 * DOM ולספק נקודת חיבור בין הקוד ל־ .
 */

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
