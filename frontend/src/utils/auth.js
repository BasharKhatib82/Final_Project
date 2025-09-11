// frontend/src/utils/api/auth.js

import { api } from "./api";

/**
 * קובץ: auth.js
 * ----------------
 * שקשורות לאימות משתמשים API מטרת הקובץ: לספק פונקציות עזר לביצוע קריאות
 * מול השרת (Authentication) .
 *
 * כל הפונקציות כאן משתמשות ב־api.js (Axios מותאם) ולכן נהנות מהגדרות אחידות
 * כמו baseURL, cookies, timeout וטיפול בשגיאות.
 */

/**
 * getCurrentUser
 * ------------------------------------------------------
 * מה עושה: שולח בקשה לשרת כדי לבדוק מי המשתמש הנוכחי המחובר,
 * cookie שנשמר ב JWT על סמך ה  .
 *
 * מה מחזיר:
 * -  אובייקט משתמש (אם יש התחברות תקפה)
 * -  (אם אין התחברות) null
 *
 * UserContext.jsx שימוש עיקרי: טעינת מצב המשתמש בקומפוננטת
 */

export const getCurrentUser = async () => {
  const res = await api.get("/auth/me");
  return res.data.data;
};

/**
 * logoutUser
 * ------------------------------------------------------
 * מה עושה: שולח בקשה לשרת לנתק את המשתמש הנוכחי.
 * במסד הנתונים active_tokens וגם מהטבלה cookie מה JWT השרת מוחק את ה .
 *
 * מה מקבל:
 * - body שנשלח כחלק מה userId (מזהה המשתמש לניתוק)
 *
 * מה מחזיר:
 * - success:true אין ערך מוחזר, אבל אם הפעולה הצליחה השרת יחזיר
 *
 * UserContext.jsx בקומפוננטת logout שימוש עיקרי: פונקציית
 */
export const logoutUser = async (userId) => {
  await api.post("/auth/logout", { user_id: userId });
};
