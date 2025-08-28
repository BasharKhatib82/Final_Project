import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Popup from "./Popup"; // 👈 הקומפוננטה שלך

const api = process.env.REACT_APP_API_URL;

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return "הסיסמה חייבת להכיל לפחות 8 תווים";
    if (!/[A-Z]/.test(pwd)) return "הסיסמה חייבת לכלול אות גדולה";
    if (!/[a-z]/.test(pwd)) return "הסיסמה חייבת לכלול אות קטנה";
    if (!/[0-9]/.test(pwd)) return "הסיסמה חייבת לכלול מספר";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ולידציה בסיסית
    const validationError = validatePassword(password);
    if (validationError) {
      setMessage(validationError);
      return;
    }
    if (password !== confirmPassword) {
      setMessage("הסיסמאות אינן תואמות");
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await axios.post(`${api}/auth/reset-password`, {
        token,
        password,
      });

      setMessage(res.data.message || "הסיסמה הוגדרה בהצלחה");
      if (res.data.success) {
        setShowSuccessPopup(true); // ✅ מציגים פופאפ הצלחה בלבד
      }
    } catch (err) {
      setMessage("שגיאה באיפוס סיסמה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center font-rubik pt-[10%]">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-center mb-4">הגדרת סיסמה חדשה</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="סיסמה חדשה"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="אשר סיסמה חדשה"
            className="w-full border px-3 py-2 rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full font-semibold py-2 rounded transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {loading ? "שומר..." : "שמור סיסמה"}
          </button>
        </form>

        {/* הודעה טקסטואלית במקרה שגיאה / ולידציה */}
        {message && !showSuccessPopup && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}
      </div>

      {/* ✅ פופאפ הצלחה שמפנה ללוגאין על סגירה/אישור (ואפשר גם אוטו-סגירה) */}
      {showSuccessPopup && (
        <Popup
          mode="confirm"
          title="הסיסמה הוגדרה בהצלחה"
          message={message || "כעת ניתן להתחבר עם הסיסמה החדשה."}
          onClose={() => setShowSuccessPopup(false)}
          onConfirm={() => setShowSuccessPopup(false)}
          redirectOnClose="/login" // מעבר ללוגאין בלחיצה על סגור
          redirectOnConfirm="/login" // מעבר ללוגאין בלחיצה על אישור (אם תגדיר מצב confirm)
          // autoClose={2500}          // 👈 אופציונלי: סגירה אוטומטית + הפניה לאחר 2.5 שניות
        />
      )}
    </div>
  );
}

export default ResetPassword;
