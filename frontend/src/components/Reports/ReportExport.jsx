import React from "react";
import { useReport } from "./ReportContext";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function ReportExport({ printTargetRef }) {
  const { title, columns, filteredRows } = useReport();

  const exportExcel = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Report");
    const headers = columns.map((c) => c.label);
    ws.addRow([title]).font = { size: 14, bold: true };
    ws.addRow([]);
    ws.addRow(headers).font = { bold: true };

    filteredRows.forEach((row) => {
      const data = columns.map((c) => {
        if (typeof c.export === "function") return c.export(row);
        if (typeof c.render === "function") return row[c.key] ?? "";
        return row[c.key] ?? "";
      });
      ws.addRow(data);
    });

    columns.forEach((c, i) => (ws.getColumn(i + 1).width = c.width || 22));
    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), `${sanitize(title)}.xlsx`);
  };

  const exportPdf = () => {
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
      <span className="text-sm text-slate-700">יצוא</span>
      <button
        onClick={exportExcel}
        className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
      >
        Excel
      </button>
      <button
        onClick={exportPdf}
        className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
      >
        PDF
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
