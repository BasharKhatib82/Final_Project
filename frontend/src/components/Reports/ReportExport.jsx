/**
 * ==========================================================
 * שם: ReportExport
 * תיאור:
 *   קומפוננטה לייצוא דוחות (Excel / PDF / הדפסה - Preview).
 *   ✅ כל הלוגיקה עוברת לצד שרת בלבד.
 *
 * ==========================================================
 */

import React from "react";
import { useReport } from "./ReportContext";
import { FileSpreadsheet, FileText, Printer } from "lucide-react";
import axios from "axios";

const ENV_API_BASE = (process.env.REACT_APP_API_URL || "").replace(/\/+$/, "");

export default function ReportExport({ apiBase = ENV_API_BASE }) {
  const { title, columns, filteredRows } = useReport();

  /** 📥 הורדת קובץ (Excel / PDF) */
  const download = async (format) => {
    try {
      const res = await axios.post(
        `${apiBase}/reports/download`,
        { title, columns, rows: filteredRows, format },
        {
          withCredentials: true,
          responseType: "blob", // 🔹 חובה כדי לקבל את הקובץ
          headers: { "Content-Type": "application/json" },
        }
      );

      // יצירת URL לקובץ והורדה
      const blob = new Blob([res.data], {
        type:
          format === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${title}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed:", err.response?.data || err.message);
    }
  };

  /** 🖨️ תצוגה לפני הדפסה (Preview PDF) */
  const previewPdf = () => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = `${apiBase}/reports/preview`;
    form.target = "_blank";

    // 🔹 שליחת הנתונים כשדות JSON רגילים (לא payload אחד)
    const data = { title, columns, rows: filteredRows };
    for (const [key, value] of Object.entries(data)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = JSON.stringify(value); // השרת יקבל כ־req.body
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-700">יצוא / הדפסה</span>

      <button
        onClick={() => download("xlsx")}
        className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1"
      >
        <FileSpreadsheet size={16} /> Excel
      </button>

      <button
        onClick={() => download("pdf")}
        className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center gap-1"
      >
        <FileText size={16} /> PDF
      </button>

      <button
        onClick={previewPdf}
        className="px-3 py-1 rounded bg-orange-600 text-white hover:bg-orange-700 inline-flex items-center gap-1"
      >
        <Printer size={16} /> הדפסה
      </button>
    </div>
  );
}
