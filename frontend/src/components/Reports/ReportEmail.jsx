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
import { Icon } from "@iconify/react";
import { validateAndSanitizeEmail } from "../../utils/validateAndSanitizeEmail";
import { Popup } from "components/Tools";

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
      return showPopup(
        "שדה דואר אלקטרוני חובה",
        'נא להזין כתובת דוא"ל',
        "warning"
      );
    }

    try {
      // ✅ ולידציה + ניקוי מקומי
      const safeEmail = validateAndSanitizeEmail(to);

      // 🛠️ עיבוד שורות לפני שליחה לשרת
      const processedRows = filteredRows.map((row) =>
        Object.fromEntries(
          columns
            .filter((col) => col.export !== false)
            .map((col) => [
              col.key,
              typeof col.export === "function" ? col.export(row) : row[col.key],
            ])
        )
      );
      await axios.post(
        `${apiBase}/reports/send-email`,
        { title, columns, rows: processedRows, to: safeEmail, format },
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
      {/* מפריד */}
      <span className="w-px h-6 bg-gray-300 ml-2"></span>
      <span className="text-sm text-slate-700 inline-flex items-center gap-1">
        <Icon icon="fxemoji:flyingenvelope" width="1.5rem" height="1.5rem" />{" "}
        שליחה למייל
      </span>
      <input
        className="border rounded px-2 py-1 text-sm"
        placeholder='דוא"ל לשליחת הקובץ'
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />
      <button
        className="flex flex-row-reverse items-center gap-2 bg-blue-50 border border-blue-200 text-gray-700 hover:bg-blue-100 px-4 py-1 rounded shadow-sm transition"
        onClick={() => send("xlsx")}
      >
        <Icon
          icon="vscode-icons:file-type-excel"
          width="1.2em"
          height="1.2em"
        />{" "}
        Excel
      </button>
      <button
        className="flex flex-row-reverse items-center gap-2 bg-blue-50 border border-blue-200 text-gray-700 hover:bg-blue-100 px-4 py-1 rounded shadow-sm transition"
        onClick={() => send("pdf")}
      >
        <Icon
          icon="vscode-icons:file-type-pdf2"
          width="1.2rem"
          height="1.2rem"
        />{" "}
        PDF
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
