// frontend\src\components\Tools\UserContext.jsx

/**
 * (Context) ניהול מצב משתמש מחובר
 * -----------------------------------
 * רכיב זה מספק מידע גלובלי על המשתמש המחובר ומצב האימות.
 *
 * תכונות:
 * - GET /auth/me טוען את המשתמש המחובר בקריאת
 * - מונע טעינה מיותרת בדפי התחברות / איפוס סיסמה
 * - לניתוק logout מספק פונקציית
 *
 * API endpoints:
 * - GET    /auth/me         - JWT קבלת מידע על המשתמש המחובר לפי
 * - POST   /auth/logout     - ניתוק המשתמש מהמערכת ומחיקת הטוקן
 *
 * ערכים גלובליים מסופקים:
 * - user: אובייקט המשתמש המחובר
 * - setUser: עדכון ידני של המשתמש
 * - logout: פונקציית התנתקות
 * - isAuthChecked: האם בוצעה בדיקת התחברות
 * - loading: האם בטעינה
 */

import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../../utils/auth.js";
import Popup from "./Popup";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState(null); //   לניהול חלון הודעות state
  const location = useLocation();

  useEffect(() => {
    const isPublicPage =
      location.pathname === "/userlogin" ||
      location.pathname === "/forgot-password" ||
      location.pathname.startsWith("/reset-password");

    if (isPublicPage) {
      setIsAuthChecked(true);
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data);
      } catch (err) {
        setPopup({
          title: "שגיאת התחברות",
          message: err.userMessage || "אירעה שגיאה בבדיקת המשתמש",
          mode: "error",
        });
        setUser(null);
      } finally {
        setIsAuthChecked(true);
        setLoading(false);
      }
    };

    fetchUser();
  }, [location.pathname]);

  const logout = async () => {
    try {
      await logoutUser(user?.user_id);
      setUser(null);
      setPopup({
        title: "התנתקות",
        message: "התנתקת בהצלחה מהמערכת",
        mode: "success",
      });
    } catch (err) {
      setPopup({
        title: "שגיאה",
        message: err.userMessage || "אירעה שגיאה בהתנתקות",
        mode: "error",
      });
    } finally {
      setUser(null);
    }
  };

  return (
    <UserContext.Provider
      value={{ user, setUser, logout, isAuthChecked, loading }}
    >
      {children}
      {popup && (
        <Popup
          title={popup.title}
          message={popup.message}
          mode={popup.mode}
          onClose={() => setPopup(null)} //  סגירת החלון
        />
      )}
    </UserContext.Provider>
  );
};
