import React from "react";
import { useReport } from "./ReportContext";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { FileSpreadsheet, FileText } from "lucide-react";

export default function ReportExport({ printTargetRef }) {
  const { title, columns, filteredRows } = useReport();

  const nowStamp = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day}_${hh}-${mm}`;
  };

  const prepare = () => {
    return columns.map((c) => {
      const values = filteredRows.map((row) => {
        if (typeof c.export === "function") return c.export(row);
        if (typeof c.export === "string" && c.export.toLowerCase() === "skip")
          return null;
        if (c.export === false || c.export === null) return null;
        if (typeof c.render === "function") return row[c.key] ?? "";
        return row[c.key] ?? "";
      });
      return { col: c, values };
    });
  };

  const exportExcel = async () => {
    const prepared = prepare();
    const exportable = prepared.filter(({ col, values }) => {
      if (col.export === false || col.export === null || col.export === "skip")
        return false;
      const allEmpty = values.every((v) => v === null || v === undefined);
      return !allEmpty;
    });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Report");

    const titleRow = ws.addRow([title]);
    titleRow.font = { size: 14, bold: true };
    titleRow.alignment = { horizontal: "center", vertical: "middle" };
    ws.addRow([]);

    const headers = exportable.map(({ col }) => col.label);
    const headerRow = ws.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };

    filteredRows.forEach((_r, idx) => {
      const dataRow = exportable.map(({ values }) =>
        values[idx] == null ? "" : values[idx]
      );
      const row = ws.addRow(dataRow);
      row.alignment = { horizontal: "center", vertical: "middle" };
    });

    exportable.forEach(({ col }, i) => {
      const column = ws.getColumn(i + 1);
      column.width = col.width || 22;
      column.alignment = { horizontal: "center", vertical: "middle" };
    });

    const buf = await wb.xlsx.writeBuffer();
    const filename = `${sanitize(title)}_${nowStamp()}.xlsx`;
    saveAs(new Blob([buf]), filename);
  };

  const exportPdf = () => {
    const node = printTargetRef?.current;
    if (!node) return;

    const actionsIndex = columns.findIndex((c) => c.key === "actions");
    const hideActionsCss =
      actionsIndex >= 0
        ? `
        thead th:nth-child(${actionsIndex + 1}),
        tbody td:nth-child(${actionsIndex + 1}) { display: none !important; }`
        : "";

    const filename = `${sanitize(title)}_${nowStamp()}.pdf`;

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
          ${hideActionsCss}
        </style>
      </head><body>
        ${node.innerHTML}
        <script>
          document.title = "${filename}";
          window.onload = () => { window.print(); setTimeout(()=>window.close(), 200); };
        </script>
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
