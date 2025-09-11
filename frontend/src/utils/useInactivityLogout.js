// frontend/src/utils/useInactivityLogout.js

/**
 * קובץ: useInactivityLogout.js
 * -----------------------------
 * מותאם אישית שמבצע ניתוק אוטומטי של המשתמש Hook מטרת הקובץ: לממש
 * במידה ולא הייתה פעילות (עכבר, מקלדת, גלילה או קליק) במשך זמן מוגדר מראש.
 *
 * שימוש :
 * - מספק שכבת אבטחה נוספת: מונע מצב שבו משתמש נשאר מחובר במערכת
 *   על מחשב משותף או ציבורי.
 * - וכדומה ,CRM ,מקובל במערכות ניהול .
 *
 * שימוש עיקרי:
 * - נקרא באופן גלובלי לכל האפליקציה MyRoutes.jsx משולב בקובץ .
 * - login והפניה לדף logout כאשר המשתמש לא פעיל שעה אז יתבצע .
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "components/Tools";

/**
 * useInactivityLogout
 * ------------------------------------------------------
 * mousemove, keydown, scroll, click שמנטר פעילות משתמש Hook .
 * אם לא הייתה פעילות במשך שעה (ברירת מחדל כאן) → מבצע ניתוק אוטומטי.
 *
 * @returns {void} לא מחזיר ערכים. מפעיל לוגיקה של ניתוק בלבד.
 */
export default function useInactivityLogout() {
  const navigate = useNavigate();
  const { user, logout } = useUser();

  useEffect(() => {
    if (!user) return; // אם אין משתמש מחובר לא מנטרים פעילות

    const timeoutDuration = 60 * 60 * 1000; // שעה במילי־שניות
    let timeout;

    /**
     * handleLogout
     * ------------------------------------------------------
     * מתבצע כאשר עבר הזמן המוגדר ללא פעילות.
     * - logout דרך context מנקה את
     * - מפנה את המשתמש לדף ההתחברות
     */
    const handleLogout = () => {
      console.log("משתמש נותק עקב חוסר פעילות");
      logout();
      navigate("/userlogin");
    };

    /**
     * resetTimer
     * ------------------------------------------------------
     * מאפס את הטיימר בכל פעם שמזוהה אירוע פעילות (עכבר, מקלדת וכו').
     * handleLogout אם אין פעילות בסוף פרק הזמן יתבצע .
     */
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(handleLogout, timeoutDuration);
    };

    // רישום האזנה לאירועים
    const events = ["mousemove", "keydown", "scroll", "click"];
    events.forEach((e) => window.addEventListener(e, resetTimer));

    // התחלת הטיימר כבר עם הטעינה
    resetTimer();

    // ניקוי מאזינים וטיימר כאשר הקומפוננטה מתנתקת
    return () => {
      clearTimeout(timeout);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [user, logout, navigate]);
}
