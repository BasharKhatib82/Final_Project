/**
 * ==========================================================
 * שם: ReportEmail
 * תיאור:
 *   קומפוננטה לשליחת דוח במייל בפורמט Excel או PDF.
 *   מציגה שדה להזנת כתובת מייל ושני כפתורים לבחירת הפורמט.
 *
 * ==========================================================
 */

import React, { useState } from "react";
import { useReport } from "./ReportContext";
import axios from "axios";
import { Mail, FileSpreadsheet, FileText } from "lucide-react";
import { validateAndSanitizeEmail } from "../../utils/validateAndSanitizeEmail";
import Popup from "../Tools/Popup";

const ENV_API_BASE = (process.env.REACT_APP_API_URL || "").replace(/\/+$/, "");

export default function ReportEmail({ apiBase = ENV_API_BASE }) {
  const { title, columns, filteredRows } = useReport();
  const [to, setTo] = useState("");
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    mode: "",
  });

  /**
   * הצגת הודעה בפופאפ
   */
  const showPopup = (title, message, mode) => {
    setPopup({ show: true, title, message, mode });
  };

  /**
   * שליחת דוח לשרת לצורך יצירת קובץ ושליחתו במייל
   */
  const send = async (format = "xlsx") => {
    if (!to) {
      return showPopup("שגיאה", 'נא להזין כתובת דוא"ל', "error");
    }

    try {
      // ✅ ולידציה + ניקוי מקומי
      const safeEmail = validateAndSanitizeEmail(to);

      await axios.post(
        `${apiBase}/reports/send-email`,
        { title, columns, rows: filteredRows, to: safeEmail, format },
        { withCredentials: true }
      );

      showPopup("הצלחה", "✅ הדוח נשלח בהצלחה למייל", "success");
    } catch (e) {
      console.error("Email send failed:", e?.response?.data || e.message);

      // נעדיף שגיאת שרת אמיתית אם קיימת
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e.message ||
        "אירעה שגיאה בשליחה";

      showPopup("שגיאה", msg, "error");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-700 inline-flex items-center gap-1">
        <Mail size={16} /> שליחה למייל
      </span>
      <input
        className="border rounded px-2 py-1 text-sm"
        placeholder='דוא"ל נמען'
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />
      <button
        className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700 inline-flex items-center gap-1"
        onClick={() => send("xlsx")}
      >
        <FileSpreadsheet size={16} /> Excel
      </button>
      <button
        className="px-3 py-1 rounded bg-purple-600 text-white hover:bg-purple-700 inline-flex items-center gap-1"
        onClick={() => send("pdf")}
      >
        <FileText size={16} /> PDF
      </button>

      {/* ✅ חלון פופאפ */}
      {popup.show && (
        <Popup
          title={popup.title}
          message={popup.message}
          mode={popup.mode}
          onClose={() =>
            setPopup({ show: false, title: "", message: "", mode: "" })
          }
        />
      )}
    </div>
  );
}
