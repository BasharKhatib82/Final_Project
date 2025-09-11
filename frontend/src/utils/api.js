// frontend\src\utils\api.js

/**
 * קובץ: api.js
 * ----------------
 *  API במקום אחד, כדי שכל הקריאות ל Axios מטרת הקובץ: לרכז את כל ההגדרות של
 *  ('וכו baseURL, כותרות, cookies ) אחיד עם אותן הגדרות client בפרויקט ישתמשו ב  .
 *
 * יתרונות:
 * - withCredentials או baseURL אין צורך להגדיר כל פעם מחדש
 * - טיפול בשגיאות מתבצע במקום מרכזי אחד
 * - הקוד בקומפוננטות נקי ופשוט יותר
 */

import axios from "axios";
import extractApiError from "./extractApiError";

/**
 * Axios יצירת מופע מותאם של
 * ------------------------------------------------------
 * baseURL: כתובת ה־ API של השרת (environment נלקחת מתוך קובץ )
 * withCredentials: true => שולח/מקבל cookies אוטומטית ( JWTדרוש ל־ )
 * timeout: מגביל בקשות שלא חוזרות (במילישניות)
 * headers: כותרות ברירת מחדל שישלחו עם כל בקשה
 */
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // https://api.respondify-crm.co.il
  withCredentials: true, // תמיד שולח/מקבל קוקיז
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

/**
 *  לטיפול בתגובות
 * ------------------------------------------------------
 * - אם התגובה הצליחה → מחזירים אותה כרגיל
 * - אם התגובה נכשלה (err) → מוסיפים לשגיאה שדה חדש userMessage
 *   שבו תופיע הודעה קריאה למשתמש (באמצעות extractApiError)
 *
 * היתרון: במקום להציג הודעות שגיאה טכניות של השרת,
 * UI נקבל הודעות מותאמות ונוחות להצגה ב.
 */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    err.userMessage = extractApiError(err, "שגיאה כללית");
    return Promise.reject(err);
  }
);
