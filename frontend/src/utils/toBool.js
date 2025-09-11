// frontend/src/utils/toBool.js

/**
 * קובץ: toBool.js
 * ----------------
 * (boolean, מספרים, מחרוזות) מטרת הקובץ: להמיר ערכים שונים
 *  בצורה פשוטה ואחידה (true/false) לערך בוליאני  .
 *
 * שימוש :
 * - true/false ערכים בוליאניים לא תמיד נשמרים כ - APIs במאגרי נתונים וב  .
 * - בצורה אחידה בקוד true/false פונקציה זו מוודאת שהערכים מתורגמים ל   .
 *
 * שימוש :
 * - ('וכו ,isAdmin, isActive ) ניהול הרשאות
 * - המרת נתונים שנמשכו מהשרת
 */

/**
 * toBool
 * ------------------------------------------------------
 * (true/false) ממיר ערך לבוליאני .
 *
 * @param {*} v - ערך לבדיקה
 * @returns {boolean} true אם הערך הוא:
 *   - true (boolean)
 *   -  1  (מספר)
 *   - "1" (מחרוזת)
 * אחרת מחזיר false.
 *
 * דוגמאות:
 * toBool(true)      → true
 * toBool(1)         → true
 * toBool("1")       → true
 * toBool(false)     → false
 * toBool(0)         → false
 * toBool("0")       → false
 */
const toBool = (v) => v === true || v === 1 || v === "1";

export default toBool;
