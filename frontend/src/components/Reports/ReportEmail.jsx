import React, { useState } from "react";
import { useReport } from "./ReportContext";
import axios from "axios";

/** דוגמה: שולח ל-API שלך את השורות המסוננות */
export default function ReportEmail({ apiBase }) {
  const { title, columns, filteredRows } = useReport();
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("");

  const send = async (format = "xlsx") => {
    try {
      setStatus("שולח...");
      await axios.post(
        `${apiBase}/reports/send-email`,
        {
          title,
          columns,
          rows: filteredRows,
          to,
          format, // "xlsx" | "pdf"
        },
        { withCredentials: true }
      );
      setStatus("נשלח!");
    } catch (e) {
      setStatus("שגיאה בשליחה");
      console.error(e);
    } finally {
      setTimeout(() => setStatus(""), 3000);
    }
  };

  return (
    <div className="flex items-center gap-2" dir="rtl">
      <input
        className="border rounded px-2 py-1 text-sm"
        placeholder='דוא"ל נמען'
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />

      <button
        className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700"
        onClick={() => send("xlsx")}
      >
        שלח במייל (Excel)
      </button>
      <button
        className="px-3 py-1 rounded bg-purple-600 text-white hover:bg-purple-700"
        onClick={() => send("pdf")}
      >
        שלח במייל (PDF)
      </button>
      {status && <span className="text-sm text-gray-600">{status}</span>}
    </div>
  );
}
