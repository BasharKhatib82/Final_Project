import React, { useState } from "react";
import { useReport } from "./ReportContext";
import { Icon } from "@iconify/react";
import axios from "axios";
import Popup from "../Tools/Popup";

const ENV_API_BASE = (process.env.REACT_APP_API_URL || "").replace(/\/+$/, "");

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
      // 🛠️ עיבוד שורות לפי export לפני שליחה לשרת
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

      const res = await axios.post(
        `${apiBase}/reports/download`,
        {
          title,
          columns,
          rows: processedRows, // 🟢 במקום filteredRows
          format,
        },
        {
          withCredentials: true,
          responseType: "blob",
          headers: { "Content-Type": "application/json" },
        }
      );

      let filename;

      const disposition = res.headers["content-disposition"];
      if (disposition) {
        const match = disposition.match(/filename\*=UTF-8''(.+)/);
        if (match && match[1]) {
          filename = decodeURIComponent(match[1]);
        }
      }

      if (!filename) {
        const now = new Date();
        const datePart = `${now.getDate()}.${
          now.getMonth() + 1
        }.${now.getFullYear()}`;
        const timePart = `${String(now.getHours()).padStart(2, "0")}-${String(
          now.getMinutes()
        ).padStart(2, "0")}`;
        filename = `${title || "דוח"}_${datePart}_${timePart}.${format}`;
      }

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

      const res = await axios.post(
        `${apiBase}/reports/preview`,
        {
          title,
          columns,
          rows: processedRows,
        },
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
        className="flex flex-row-reverse items-center gap-2 bg-blue-50 border border-blue-200 text-gray-700 hover:bg-blue-100 px-4 py-1 rounded shadow-sm transition"
      >
        <Icon
          icon="vscode-icons:file-type-excel"
          width="1.2em"
          height="1.2em"
        />{" "}
        Excel
      </button>

      <button
        onClick={() => download("pdf")}
        className="flex flex-row-reverse items-center gap-2 bg-blue-50 border border-blue-200 text-gray-700 hover:bg-blue-100 px-4 py-1 rounded shadow-sm transition"
      >
        <Icon
          icon="vscode-icons:file-type-pdf2"
          width="1.2rem"
          height="1.2rem"
        />{" "}
        PDF
      </button>

      <button
        onClick={previewPdf}
        className="flex flex-row-reverse items-center gap-2 bg-blue-50 border border-blue-200 text-gray-700 hover:bg-blue-100 px-4 py-1 rounded shadow-sm transition"
      >
        <Icon icon="flat-color-icons:print" width="1.2em" height="1.2em" />{" "}
        הדפסה
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
