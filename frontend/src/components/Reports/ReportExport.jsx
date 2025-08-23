/**
 * ==========================================================
 * שם: ReportExport
 * תיאור:
 *   קומפוננטה ליצוא דוחות (Excel / PDF) כולל אפשרות
 *   להדפסה / הצגת תצוגה לפני הדפסה.
 *
 * שימוש:
 *   <ReportExport />
 *
 * פרופסים:
 *   - printTargetRef (useRef לטבלה – לא חובה כבר כאן, אפשר למחוק)
 *
 * פלט:
 *   כפתורי יצוא (Excel, PDF, Print Preview)
 *
 * ==========================================================
 */

import React from "react";
import { useReport } from "./ReportContext";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { FileSpreadsheet, FileText, Printer } from "lucide-react";

// ✅ pdfmake – גרסת דפדפן
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
console.log("pdfMake:", pdfMake);
console.log("pdfFonts:", pdfFonts);
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export default function ReportExport() {
  const { title, columns, filteredRows } = useReport();

  /**
   * יוצר חותמת זמן לשם הקובץ
   */
  const nowStamp = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day}_${hh}-${mm}`;
  };

  /**
   * מכין את העמודות והערכים ליצוא
   */
  const prepare = () => {
    return columns.map((c) => {
      const values = filteredRows.map((row) => {
        if (typeof c.export === "function") return c.export(row);
        if (c.export === false || c.export === "skip") return null;
        return row[c.key] ?? "";
      });
      return { col: c, values };
    });
  };

  /**
   * יצוא לאקסל
   */
  const exportExcel = async () => {
    const prepared = prepare();
    const exportable = prepared.filter(({ col, values }) => {
      if (col.export === false || col.export === "skip") return false;
      const allEmpty = values.every((v) => v == null);
      return !allEmpty;
    });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Report");

    const titleRow = ws.addRow([title]);
    titleRow.font = { size: 14, bold: true };
    titleRow.alignment = { horizontal: "center" };
    ws.addRow([]);

    const headers = exportable.map(({ col }) => col.label);
    const headerRow = ws.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center" };

    filteredRows.forEach((_r, idx) => {
      const dataRow = exportable.map(({ values }) => values[idx] ?? "");
      const row = ws.addRow(dataRow);
      row.alignment = { horizontal: "center" };
    });

    exportable.forEach(({ col }, i) => {
      const column = ws.getColumn(i + 1);
      column.width = col.width || 22;
      column.alignment = { horizontal: "center" };
    });

    const buf = await wb.xlsx.writeBuffer();
    const filename = `${sanitize(title)}_${nowStamp()}.xlsx`;
    saveAs(new Blob([buf]), filename);
  };

  /**
   * יצוא ל־PDF (הורדה ישירה)
   */
  const exportPdf = () => {
    const colsForPdf = columns.filter((c) => c.key !== "actions");

    const body = [
      colsForPdf.map((c) => ({
        text: c.label,
        style: "tableHeader",
        alignment: "center",
      })),
      ...filteredRows.map((row) =>
        colsForPdf.map((c) => {
          if (typeof c.export === "function")
            return { text: c.export(row), alignment: "center" };
          if (c.export === false || c.export === "skip")
            return { text: "", alignment: "center" };
          return { text: row[c.key] ?? "", alignment: "center" };
        })
      ),
    ];

    const docDefinition = {
      content: [
        {
          text: title || "דוח",
          style: "header",
          alignment: "center",
          margin: [0, 0, 0, 8],
        },
        { table: { headerRows: 1, body }, layout: "lightHorizontalLines" },
      ],
      styles: {
        header: { fontSize: 16, bold: true },
        tableHeader: { bold: true, fillColor: "#eeeeee" },
      },
      defaultStyle: { font: "Helvetica" },
      pageMargins: [30, 30, 30, 30],
    };

    const filename = `${sanitize(title)}_${nowStamp()}.pdf`;
    pdfMake.createPdf(docDefinition).download(filename);
  };

  /**
   * תצוגה לפני הדפסה (PDF ב־Preview)
   */
  const previewPdf = () => {
    const colsForPdf = columns.filter((c) => c.key !== "actions");

    const body = [
      colsForPdf.map((c) => ({
        text: c.label,
        style: "tableHeader",
        alignment: "center",
      })),
      ...filteredRows.map((row) =>
        colsForPdf.map((c) => {
          if (typeof c.export === "function")
            return { text: c.export(row), alignment: "center" };
          if (c.export === false || c.export === "skip")
            return { text: "", alignment: "center" };
          return { text: row[c.key] ?? "", alignment: "center" };
        })
      ),
    ];

    const docDefinition = {
      content: [
        {
          text: title || "דוח",
          style: "header",
          alignment: "center",
          margin: [0, 0, 0, 8],
        },
        { table: { headerRows: 1, body }, layout: "lightHorizontalLines" },
      ],
      styles: {
        header: { fontSize: 16, bold: true },
        tableHeader: { bold: true, fillColor: "#eeeeee" },
      },
      defaultStyle: { font: "Helvetica" },
      pageMargins: [30, 30, 30, 30],
    };

    pdfMake.createPdf(docDefinition).open(); // ⬅️ מציג preview
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-700">יצוא / הדפסה</span>

      {/* Excel */}
      <button
        onClick={exportExcel}
        className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1"
      >
        <FileSpreadsheet size={16} /> Excel
      </button>

      {/* PDF להורדה */}
      <button
        onClick={exportPdf}
        className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center gap-1"
      >
        <FileText size={16} /> PDF
      </button>

      {/* PDF לתצוגה לפני הדפסה */}
      <button
        onClick={previewPdf}
        className="px-3 py-1 rounded bg-orange-600 text-white hover:bg-orange-700 inline-flex items-center gap-1"
      >
        <Printer size={16} /> הדפסה
      </button>
    </div>
  );
}

/**
 * פונקציות עזר
 */
function sanitize(s) {
  return String(s).replace(/[\\/:*?"<>|]+/g, "_");
}
