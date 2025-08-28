import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../components/Tools/UserContext";

export default function useInactivityLogout() {
  const navigate = useNavigate();
  const { user, logout } = useUser(); // 👈 לוקחים את ה־logout מהקונטקסט

  useEffect(() => {
    if (!user) return;

    const timeoutDuration = 5 * 60 * 1000;
    let timeout;

    const handleLogout = () => {
      console.log("משתמש נותק עקב חוסר פעילות");
      logout(); // 👈 מנקה גם את ה־context
      navigate("/userlogin");
    };

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(handleLogout, timeoutDuration);
    };

    const events = ["mousemove", "keydown", "scroll", "click"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeout);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [user, logout, navigate]);
}
