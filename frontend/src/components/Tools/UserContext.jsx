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
import { data, useLocation} from "react-router-dom";
import { getCurrentUser, logoutUser } from "../../utils/auth";
import Popup from "./Popup";
import { Icon } from "@iconify/react";

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
      location.pathname === "/" ||
      location.pathname === "/about" ||
      location.pathname === "/contact" ||
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
        if (err.response?.status === 500) {
          setPopup({
            title: "שגיאת התחברות",
            message: err.userMessage || "אירעה שגיאה בבדיקת המשתמש",
            mode: "error",
          });
        }
        setUser(null);
      } finally {
        setIsAuthChecked(true);
        setLoading(false);
      }
    };

    fetchUser();
  }, [location.pathname]);

  const logout = () => {
    console.log(data.fullName);
    setPopup({
      icon: (
        <Icon
          icon="streamline-sharp:logout-2-remix"
          width="1.5em"
          height="1.5em"
          color="#f59e0b"
        />
      ),
      title: `אתה עומד להתנתק`,
      message: "האם אתה בטוח שברצונך לצאת מהמערכת?",
      mode: "confirm",
      onConfirm: () => {
        // נבצע את הניתוק ישירות כאן
        logoutUser(user?.user_id)
          .then(() => {
            setUser(null);
            setPopup({
              icon: (
                <Icon
                  icon="streamline-sharp:logout-2-remix"
                  width="1.5em"
                  height="1.5em"
                  color="#f59e0b"
                />
              ),
              title: "התנתקות מהמערכת",
              message: "התנתקת בהצלחה מהמערכת",
              mode: "successMessage",
              autoClose: 3000,
              redirectOnClose: "/userlogin",
            });
          })
          .catch((err) => {
            setPopup({
              title: "שגיאה",
              message: err.userMessage || "אירעה שגיאה בהתנתקות",
              mode: "error",
            });
          });
      },
      onClose: () => setPopup(null),
    });
  };

  return (
    <UserContext.Provider
      value={{ user, setUser, logout, isAuthChecked, loading }}
    >
      {children}
      {popup && (
        <Popup
          icon={popup.icon}
          title={popup.title}
          message={popup.message}
          mode={popup.mode}
          autoClose={popup.autoClose}
          redirectOnClose={popup.redirectOnClose}
          onClose={() => setPopup(null)} //  סגירת החלון
          onConfirm={popup.onConfirm}
        />
      )}
    </UserContext.Provider>
  );
};
