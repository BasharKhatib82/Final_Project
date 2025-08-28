import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const api = process.env.REACT_APP_API_URL;

export default function useInactivityLogout() {
  const navigate = useNavigate();

  useEffect(() => {
    const timeoutDuration = 5 * 60 * 1000; // 5 דקות
    let timeout;

    const logout = () => {
      console.log("משתמש נותק עקב חוסר פעילות");

      // ✅ שולח את הבקשה עם credentials כדי ש-cookie יישלח
      fetch(`${api}/auth/logout`, {
        method: "POST",
        credentials: "include", // ← חובה
      })
        .catch((err) => console.error("שגיאה בניתוק:", err))
        .finally(() => {
          navigate("/userlogin");
        });
    };

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(logout, timeoutDuration);
    };

    const events = ["mousemove", "keydown", "scroll", "click"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeout);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [navigate]);
}
