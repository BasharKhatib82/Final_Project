// frontend\src\components\Pages\ForgotPassword.jsx
/**
 * רכיב: ForgotPassword
 * -------------------------
 * רכיב המציג עמוד שחזור סיסמה.
 *
 * מטרת הרכיב:
 * - לאפשר למשתמש להזין את כתובת האימייל שלו
 * - לשלוח בקשה לשרת לקבלת קישור לאיפוס סיסמה
 * - (Popup) להציג הודעת הצלחה או שגיאה באמצעות חלון קופץ
 *
 * קלט: אין (פנימי state הרכיב משתמש ב )
 * פלט: טופס לאיפוס סיסמה + הודעת הצלחה/שגיאה
 *
 * זרימת עבודה:
 * 1. המשתמש מזין אימייל ולוחץ על כפתור השליחה.
 * 2. /auth/forgot-password לשרת לכתובת POST נשלחת בקשת  .
 * 3. אם הצליח → מוצג פופאפ הצלחה עם הודעה מתאימה.
 * 4. אם נכשל → מוצג פופאפ שגיאה.
 * 5. userlogin בסגירת הפופאפ מתבצע מעבר לדף ההתחברות .
 */

import { useState } from "react";
import axios from "axios";
import { Popup } from "components/Tools";
import { AppButton } from "components/Buttons";
import { Icon } from "@iconify/react";

const api = process.env.REACT_APP_API_URL;

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${api}/auth/forgot-password`, { email });
      setMessage(res.data.message);
      setShowPopup(true); //  פתיחת הפופאפ אחרי הצלחה
    } catch (err) {
      setMessage("שגיאה בשליחת בקשת איפוס סיסמה");
      setShowPopup(true); // גם במקרה של שגיאה נציג פופאפ
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center font-rubik pt-[10%]">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-center mb-4">שחזור סיסמה</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="נא להקליד את כתובת האימייל שלך"
            className="w-full border px-3 py-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex justify-around pt-4">
            <AppButton
              label={loading ? "שולח..." : "שליחת קישור לשחזור סיסמה"}
              type="submit"
              disabled={loading}
              icon={
                <Icon
                  icon="streamline:send-email-remix"
                  width="1.2em"
                  height="1.2em"
                />
              }
              variant="normal"
            />
            <AppButton
              label="יציאה"
              icon={
                <Icon icon="hugeicons:cancel-02" width="1.2em" height="1.2em" />
              }
              variant="cancel"
              to="/dashboard/userlogin"
            />
          </div>
        </form>
      </div>

      {/* הצגת הפופאפ */}
      {showPopup && (
        <Popup
          mode={message.includes("שגיאה") ? "error" : "success"}
          title={message.includes("שגיאה") ? "שגיאה" : "קישור נשלח"}
          message={message}
          redirectOnClose="/userlogin" //  מעבר ללוגאין בלחיצה על סגירה
          redirectOnConfirm="/userlogin" //  מעבר ללוגאין בלחיצה על אישור (במצב confirm)
          onClose={() => setShowPopup(false)}
          onConfirm={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}

export default ForgotPassword;
