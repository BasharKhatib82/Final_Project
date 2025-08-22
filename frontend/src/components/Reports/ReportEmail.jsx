import React, { useState } from "react";
import { useReport } from "./ReportContext";
import axios from "axios";

export default function ReportEmail({ apiBase }) {
  const { title, columns, filteredRows } = useReport();
  const [to, setTo] = useState("");

  const send = async (format = "xlsx") => {
    if (!to) {
      alert('נא להזין כתובת דוא"ל');
      return;
    }
    try {
      await axios.post(
        `${apiBase}/reports/send-email`,
        {
          title,
          columns,
          rows: filteredRows,
          to,
          format,
        },
        { withCredentials: true }
      );
      alert("נשלח!");
    } catch (e) {
      console.error(e);
      alert("שגיאה בשליחה");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-700">מייל לשליחה</span>
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
        Excel
      </button>
      <button
        className="px-3 py-1 rounded bg-purple-600 text-white hover:bg-purple-700"
        onClick={() => send("pdf")}
      >
        PDF
      </button>
    </div>
  );
}
