/**
 * ==========================================================
 * שם: ReportView
 * תיאור:
 *   קומפוננטת תצוגת דוחות כללית.
 *   מציגה כותרת, חיפוש, פילטרים, יצוא (Excel/PDF),
 *   שליחה במייל, הדפסה, טבלה ועמודי ניווט.
 *
 * שימוש:
 *   <ReportView
 *      title="רשימת תפקידים"
 *      columns={columns}
 *      rows={rows}
 *      filtersDef={filtersDef}
 *      searchableKeys={["role_name", "status"]}
 *      pageSize={25}
 *      emailApiBase={api}
 *      addButton={<NavigationButton ... />}
 *      defaultFilters={{ status: "active" }}
 *      searchPlaceholder="שם תפקיד..."
 *   />
 *
 * ==========================================================
 */

import React, { useRef } from "react";
import { ReportProvider } from "./ReportContext";
import ReportSearch from "./ReportSearch";
import ReportFilters from "./ReportFilters";
import ReportExport from "./ReportExport";
import ReportEmail from "./ReportEmail";
import ReportTable from "./ReportTable";
import ReportPagination from "./ReportPagination";
import { Printer } from "lucide-react";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;

export default function ReportView({
  title,
  columns,
  rows,
  filtersDef = [],
  searchableKeys = [],
  pageSize = 20,
  addButton,
  emailApiBase,
  defaultFilters = {},
  searchPlaceholder = "חיפוש...",
}) {
  const printRef = useRef(null);

  /**
   * פונקציה להדפסת טבלה (Preview PDF)
   */
  const previewPdf = () => {
    const colsForPdf = columns.filter((c) => c.key !== "actions");

    const body = [
      colsForPdf.map((c) => ({
        text: c.label,
        style: "tableHeader",
        alignment: "center",
      })),
      ...rows.map((row) =>
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

    pdfMake.createPdf(docDefinition).open();
  };

  return (
    <ReportProvider
      title={title}
      columns={columns}
      rows={rows}
      filtersDef={filtersDef}
      searchableKeys={searchableKeys}
      pageSize={pageSize}
      defaultFilters={defaultFilters}
    >
      <div className="flex flex-col gap-4" dir="rtl">
        {/* כותרת ממורכזת */}
        <header className="flex items-center justify-center py-0 my-0">
          <h2 className="font-rubik text-2xl font-semibold text-blue-700 mb-2 text-center">
            {title}
          </h2>
        </header>

        {addButton && (
          <div className="flex justify-start">
            <div className="inline-flex">{addButton}</div>
          </div>
        )}

        <section className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-sm">
          <div className="flex flex-col space-y-3">
            {/* שורה ראשונה: סטטוס + חיפוש + כפתור הדפסה */}
            <div className="flex items-center gap-4">
              <ReportFilters
                variant="inline"
                showTotal={false}
                labelPrefix="סטטוס :"
              />
              <ReportSearch label="חיפוש :" placeholder={searchPlaceholder} />

              {/* כפתור הדפסה */}
              <button
                onClick={previewPdf}
                className="px-3 py-1 rounded bg-orange-600 text-white hover:bg-orange-700 inline-flex items-center gap-1"
              >
                <Printer size={16} /> הדפסה
              </button>
            </div>

            {/* שורה שנייה: יצוא + שליחה למייל */}
            <div className="flex items-center gap-4">
              <ReportExport printTargetRef={printRef} />
              {emailApiBase && <ReportEmail apiBase={emailApiBase} />}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <ReportTable ref={printRef} />
        </section>

        <ReportPagination />
      </div>
    </ReportProvider>
  );
}
