// reports/ReportExport.jsx
import React from "react";
import { useReport } from "./ReportContext";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { FileSpreadsheet, FileText } from "lucide-react";

export default function ReportExport({ printTargetRef }) {
  const { title, columns, filteredRows } = useReport();

  // מכין ערכי יצוא לכל עמודה מראש, ומחליט אילו עמודות באמת נייצא
  const prepareExport = () => {
    // 1) לחשב ערכי יצוא לכל עמודה ולכל שורה
    const prepared = columns.map((c) => {
      const values = filteredRows.map((row) => {
        if (typeof c.export === "function") return c.export(row);
        if (typeof c.render === "function") {
          // אם יש render אבל לא export – נעדיף ערך טקסטואלי מהמפתח (כדי לא לקבל ReactNode)
          return row[c.key] ?? "";
        }
        return row[c.key] ?? "";
      });
      return { col: c, values };
    });

    // 2) לקבוע אילו עמודות נכנסות לקובץ:
    //    - עמודות עם export === false/null/"skip" → לא נכללות
    //    - עמודות שהערכים שלהן כולם null/undefined → לא נכללות (למשל actions עם export: () => null)
    const exportable = prepared.filter(({ col, values }) => {
      if (col.export === false || col.export === null || col.export === "skip")
        return false;
      const allEmpty = values.every((v) => v === null || v === undefined);
      return !allEmpty;
    });

    return exportable;
  };

  const exportExcel = async () => {
    const exportable = prepareExport();
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Report");

    // כותרת
    ws.addRow([title]).font = { size: 14, bold: true };
    ws.addRow([]);

    // כותרות עמודות (רק לעמודות שנכנסות)
    const headers = exportable.map(({ col }) => col.label);
    ws.addRow(headers).font = { bold: true };

    // שורות נתונים
    filteredRows.forEach((_row, idx) => {
      const dataRow = exportable.map(({ values }) => {
        const v = values[idx];
        // המרה קלה לייצוא (למניעת undefined)
        return v == null ? "" : v;
      });
      ws.addRow(dataRow);
    });

    // רוחב עמודות
    exportable.forEach(({ col }, i) => {
      ws.getColumn(i + 1).width = col.width || 22;
    });

    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), `${sanitize(title)}.xlsx`);
  };

  const exportPdf = () => {
    // ל-PDF דרך הדפסה – נשתמש בתצוגה הקיימת (כולל הסתרת עמודת פעולות אם תרצה גם ויזואלית)
    const node = printTargetRef?.current;
    if (!node) return;
    const win = window.open("", "_blank", "width=1200,height=800");
    if (!win) return;
    win.document.open();
    win.document.write(`
      <html dir="rtl" lang="he"><head>
        <meta charset="utf-8"/>
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, "Noto Sans Hebrew", sans-serif; padding: 24px; }
          table { width:100%; border-collapse:collapse; font-size:12px; }
          th, td { border:1px solid #ddd; padding:6px 8px; text-align:center; }
          thead th { background:#f0f2f5; }
          tr:nth-child(even) td { background:#fafafa; }
          @page { size: A4; margin: 15mm; }
          /* אם תרצה להסתיר ויזואלית את עמודת הפעולות גם ב-PDF:
             th:last-child, td:last-child { display: none; } */
        </style>
      </head><body>
        ${node.innerHTML}
        <script>window.onload = () => { window.print(); setTimeout(()=>window.close(), 200); };</script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-700">יצוא לקובץ</span>
      <button
        onClick={exportExcel}
        className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1"
      >
        <FileSpreadsheet size={16} /> Excel
      </button>
      <button
        onClick={exportPdf}
        className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center gap-1"
      >
        <FileText size={16} /> PDF
      </button>
    </div>
  );
}

function sanitize(s) {
  return String(s).replace(/[\\/:*?"<>|]+/g, "_");
}
function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
