/**
 * ==========================================================
 * שם: ReportExport
 * תיאור:
 *   קומפוננטה לייצוא דוחות (Excel / PDF / הדפסה - Preview).
 *   ✅ כולל עיבוד ערכים לייצוא:
 *      - שימוש ב־export / exportLabel / key
 *      - תאריכים → YYYY-MM-DD
 *      - שעות → HH:mm
 *      - ערכים ריקים → "-"
 * ==========================================================
 */

import React, { useState } from "react";
import { useReport } from "./ReportContext";
import { FileSpreadsheet, FileText, Printer } from "lucide-react";
import axios from "axios";
import Popup from "../Tools/Popup";

const ENV_API_BASE = (process.env.REACT_APP_API_URL || "").replace(/\/+$/, "");

// 🟢 פונקציית עזר – הפקת ערך לייצוא עבור תא
function getExportValue(col, row) {
  // אם יש פונקציית export מותאמת
  if (typeof col.export === "function") {
    return col.export(row) ?? "-";
  }

  // אם יש שדה חלופי לייצוא
  if (col.exportLabel && row[col.exportLabel] !== undefined) {
    return row[col.exportLabel] ?? "-";
  }

  // ברירת מחדל – הערך הרגיל
  let val = row[col.key];

  if (val === null || val === undefined || val === "") return "-";

  // טיפול בפורמט תאריך ISO
  if (typeof val === "string" && val.includes("T")) {
    return val.split("T")[0];
  }

  // טיפול בשעות עם שניות
  if (typeof val === "string" && /^\d{2}:\d{2}:\d{2}$/.test(val)) {
    return val.slice(0, 5);
  }

  return val;
}

export default function ReportExport({ apiBase = ENV_API_BASE }) {
  const { title, columns, filteredRows } = useReport();
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    mode: "",
  });

  /** 📥 הורדת קובץ (Excel / PDF) */
  const download = async (format) => {
    try {
      // 🟢 בניית שורות לייצוא
      const exportRows = filteredRows.map((row) => {
        const r = {};
        columns.forEach((col) => {
          if (col.export === false) return; // דילוג אם ביקשנו לא לייצא
          r[col.label] = getExportValue(col, row);
        });
        return r;
      });

      const res = await axios.post(
        `${apiBase}/reports/download`,
        { title, columns, rows: exportRows, format },
        {
          withCredentials: true,
          responseType: "blob",
          headers: { "Content-Type": "application/json" },
        }
      );

      // 📝 שם קובץ
      let filename;
      const disposition = res.headers["content-disposition"];
      if (disposition) {
        const match = disposition.match(/filename\*=UTF-8''(.+)/);
        if (match && match[1]) filename = decodeURIComponent(match[1]);
      }
      if (!filename) {
        const now = new Date();
        const datePart = now.toISOString().split("T")[0];
        const timePart = `${String(now.getHours()).padStart(2, "0")}-${String(
          now.getMinutes()
        ).padStart(2, "0")}`;
        filename = `${title || "דוח"}_${datePart}_${timePart}.${format}`;
      }

      // 📂 שמירת הקובץ
      const blob = new Blob([res.data], {
        type:
          format === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setPopup({
        show: true,
        title: "הצלחה",
        message: `✅ הדוח הורד בהצלחה בפורמט ${format.toUpperCase()}`,
        mode: "success",
      });
    } catch (err) {
      console.error("Download failed:", err.response?.data || err.message);
      setPopup({
        show: true,
        title: "שגיאה",
        message:
          err?.response?.data?.error ||
          err?.message ||
          "אירעה שגיאה בהורדת הקובץ",
        mode: "error",
      });
    }
  };

  /** 🖨️ תצוגה לפני הדפסה */
  const previewPdf = async () => {
    try {
      const exportRows = filteredRows.map((row) => {
        const r = {};
        columns.forEach((col) => {
          if (col.export === false) return;
          r[col.label] = getExportValue(col, row);
        });
        return r;
      });

      const res = await axios.post(
        `${apiBase}/reports/preview`,
        { title, columns, rows: exportRows },
        {
          withCredentials: true,
          responseType: "blob",
          headers: { "Content-Type": "application/json" },
        }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error("Preview failed:", err.response?.data || err.message);
      setPopup({
        show: true,
        title: "שגיאה",
        message:
          err?.response?.data?.error ||
          err?.message ||
          "אירעה שגיאה ביצירת תצוגת PDF",
        mode: "error",
      });
    }
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

      {popup.show && (
        <Popup
          title={popup.title}
          message={popup.message}
          mode={popup.mode}
          onClose={() =>
            setPopup({
              show: false,
              title: "",
              message: "",
              mode: "",
            })
          }
        />
      )}
    </div>
  );
}
