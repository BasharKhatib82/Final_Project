/**
 * ==========================================================
 * שם: ReportExport
 * תיאור:
 *   קומפוננטה לייצוא דוחות ל־Excel ול־PDF כולל תצוגה לפני הדפסה
 *   עם תמיכה מלאה בעברית (NotoSansHebrew).
 *
 * שימוש:
 *   <ReportExport />
 *
 * ==========================================================
 */

import React from "react";
import { useReport } from "./ReportContext";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { FileSpreadsheet, FileText, Printer } from "lucide-react";

import pdfMake from "pdfmake/build/pdfmake";
import { vfs as hebrewFonts } from "../fonts/NotoSansHebrew"; //  מייבא את הגופן

// מגדירים ל־pdfmake להשתמש בגופן
pdfMake.vfs = hebrewFonts;
pdfMake.fonts = {
  NotoSans: {
    normal: "NotoSansHebrew-Regular.ttf",
    bold: "NotoSansHebrew-Bold.ttf",
  },
};

export default function ReportExport() {
  const { title, columns, filteredRows } = useReport();

  /** חותמת זמן */
  const nowStamp = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day}_${hh}-${mm}`;
  };

  /** יצוא לאקסל */
  const exportExcel = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Report");

    const titleRow = ws.addRow([title]);
    titleRow.font = { size: 14, bold: true };
    titleRow.alignment = { horizontal: "center" };
    ws.addRow([]);

    const headers = columns
      .filter((c) => c.key !== "actions")
      .map((c) => c.label);
    const headerRow = ws.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center" };

    filteredRows.forEach((row) => {
      const dataRow = columns
        .filter((c) => c.key !== "actions")
        .map((c) => row[c.key] ?? "");
      ws.addRow(dataRow).alignment = { horizontal: "center" };
    });

    const buf = await wb.xlsx.writeBuffer();
    const filename = `${sanitize(title)}_${nowStamp()}.xlsx`;
    saveAs(new Blob([buf]), filename);
  };

  /** יצוא ל־PDF */
  const exportPdf = () => {
    const colsForPdf = columns.filter((c) => c.key !== "actions");

    const body = [
      colsForPdf.map((c) => ({
        text: c.label,
        style: "tableHeader",
        alignment: "center",
      })),
      ...filteredRows.map((row) =>
        colsForPdf.map((c) => ({
          text: row[c.key] ?? "",
          alignment: "center",
        }))
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
      defaultStyle: { font: "NotoSans" },
      pageMargins: [30, 30, 30, 30],
    };

    const filename = `${sanitize(title)}_${nowStamp()}.pdf`;
    pdfMake.createPdf(docDefinition).download(filename);
  };

  /** תצוגה לפני הדפסה */
  const previewPdf = () => {
    const colsForPdf = columns.filter((c) => c.key !== "actions");

    const body = [
      colsForPdf.map((c) => ({
        text: c.label,
        style: "tableHeader",
        alignment: "center",
      })),
      ...filteredRows.map((row) =>
        colsForPdf.map((c) => ({
          text: row[c.key] ?? "",
          alignment: "center",
        }))
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
      defaultStyle: { font: "NotoSans" },
      pageMargins: [30, 30, 30, 30],
    };

    pdfMake.createPdf(docDefinition).open();
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-700">יצוא / הדפסה</span>

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

      <button
        onClick={previewPdf}
        className="px-3 py-1 rounded bg-orange-600 text-white hover:bg-orange-700 inline-flex items-center gap-1"
      >
        <Printer size={16} /> הדפסה
      </button>
    </div>
  );
}

function sanitize(s) {
  return String(s).replace(/[\\/:*?"<>|]+/g, "_");
}
